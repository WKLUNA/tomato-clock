// 引入本地存储工具
const storage = require('../../utils/storage.js');

Page({
  /**
   * 页面初始数据
   */
  data: {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    formattedTime: '25:00',
    currentDuration: 25,           // 本次计时的总分钟数（来自关联的待办）
    todoName: ''                   // 待办名称（顶部显示）
  },

  // 以下字段不放在 data 里（不需要 setData 触发渲染）
  timer: null,                     // setInterval ID
  endTimestamp: null,              // 倒计时结束的目标时间戳
  todo: null,                      // 当前关联的待办对象（含 id / name / duration）

  /**
   * 页面加载：从 URL 接收 todoId 并初始化
   * 注意：每次 navigateTo 进入都会触发 onLoad（独立路由，不复用实例）
   */
  onLoad(options) {
    const todoId = Number(options.todoId);

    // 防御 1：todoId 缺失
    if (!todoId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1000);
      return;
    }

    // 防御 2：待办已被删除
    const todo = storage.getTodoById(todoId);
    if (!todo) {
      wx.showToast({ title: '待办不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1000);
      return;
    }

    // 保存待办引用并初始化显示
    this.todo = todo;
    this.setData({
      minutes: todo.duration,
      seconds: 0,
      currentDuration: todo.duration,
      todoName: todo.name,
      isRunning: false
    });
    this.updateFormattedTime();
  },

  /**
   * 页面卸载：清理 timer，避免内存泄漏
   */
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  /**
   * 更新格式化时间字符串（两位补零）
   */
  updateFormattedTime() {
    const { minutes, seconds } = this.data;
    this.setData({
      formattedTime:
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
    });
  },

  /**
   * 开始/暂停 按钮
   */
  onToggleTimer() {
    if (!this.data.isRunning) {
      this.startTimer();
    } else {
      this.pauseTimer();
    }
  },

  /**
   * 开始计时
   */
  startTimer() {
    const { minutes, seconds } = this.data;
    const remainingMs = (minutes * 60 + seconds) * 1000;

    // 设置目标结束时间戳（基于"绝对时间"做防漂移倒计时）
    this.endTimestamp = Date.now() + remainingMs;

    this.setData({ isRunning: true });

    // 每 100ms 滴答一次（视觉更平滑）
    this.timer = setInterval(() => this.tick(), 100);
  },

  /**
   * 暂停计时
   */
  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setData({ isRunning: false });
  },

  /**
   * 每次 tick：根据 endTimestamp 计算剩余时间
   */
  tick() {
    const remainingMs = this.endTimestamp - Date.now();

    if (remainingMs <= 0) {
      this.onNaturalComplete();
      return;
    }

    const totalSeconds = Math.ceil(remainingMs / 1000);
    this.setData({
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60
    });
    this.updateFormattedTime();
  },

  /**
   * 自然完成（倒计时归零）：写入完整时长记录 → 返回待办页
   */
  onNaturalComplete() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // 写入记录（关联待办）
    storage.addRecord(this.todo.duration, {
      id: this.todo.id,
      name: this.todo.name
    });

    wx.vibrateShort({ success: () => {}, fail: () => {} });
    wx.showToast({
      title: '番茄完成！',
      icon: 'success',
      duration: 1500
    });

    // 1.5 秒后自动返回，让用户看清 toast
    setTimeout(() => wx.navigateBack(), 1500);
  },

  /**
   * 结束按钮：弹 ActionSheet 让用户选"提前完成"还是"放弃"
   */
  onEnd() {
    // 计算实际已经专注的分钟数（向下取整，更"诚实"）
    const totalSeconds = this.todo.duration * 60;
    const remainingSeconds = this.data.minutes * 60 + this.data.seconds;
    const passedSeconds = Math.max(0, totalSeconds - remainingSeconds);
    const passedMinutes = Math.floor(passedSeconds / 60);

    // 不满 1 分钟：结束等于放弃，弹 modal 二次确认
    if (passedMinutes === 0) {
      wx.showModal({
        title: '确定结束？',
        content: '还未专注满 1 分钟，结束本次计时将不计入记录。',
        confirmText: '结束',
        confirmColor: '#FF4444',
        success: (res) => {
          if (res.confirm) this.onGiveUp();
        }
      });
      return;
    }

    // 满 1 分钟：让用户二选一
    wx.showActionSheet({
      itemList: [
        `提前完成`,
        '放弃此次计时'
      ],
      itemColor: '#333',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.onEarlyComplete(passedMinutes);
        } else if (res.tapIndex === 1) {
          this.onGiveUp();
        }
      },
      fail: () => {} // 用户取消 ActionSheet 时不做任何事
    });
  },

  /**
   * 提前完成：写入实际时长的记录 → 返回
   */
  onEarlyComplete(passedMinutes) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    storage.addRecord(passedMinutes, {
      id: this.todo.id,
      name: this.todo.name
    });

    wx.vibrateShort({ success: () => {}, fail: () => {} });
    wx.showToast({
      title: `番茄完成！`,
      icon: 'success',
      duration: 1500
    });
    setTimeout(() => wx.navigateBack(), 1500);
  },

  /**
   * 放弃：不写入记录 → 返回
   */
  onGiveUp() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    wx.showToast({
      title: '已放弃',
      icon: 'none',
      duration: 800
    });
    setTimeout(() => wx.navigateBack(), 800);
  }
});