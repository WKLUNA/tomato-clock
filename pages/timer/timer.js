// 引入本地存储工具
const storage = require('../../utils/storage.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    minutes: 25,           // 当前显示的分钟
    seconds: 0,            // 当前显示的秒
    isRunning: false,      // 是否正在计时
    status: '专注时间',     // 状态文字
    formattedTime: '25:00', // 格式化后的时间字符串
    currentDuration: 25     // 本轮计时使用的时长（分钟）
  },

  /**
   * 计时器 ID（直接挂在实例上，不放入 data）
   */
  timer: null,

  /**
   * 目标结束时间戳（毫秒）
   */
  endTimestamp: null,

  /**
   * 本轮计时使用的时长（分钟数），用于检测设置是否变化
   */
  currentDuration: 5,

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const settings = storage.getSettings();
    const newDuration = settings.focusDuration;
    
    // 场景1：设置的时长变了 → 强制重置到新时长的初始态（放弃当前轮）
    if (this.currentDuration !== null && this.currentDuration !== newDuration) {
      console.log('检测到设置变更，重置到新时长');
      // 停止计时
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.endTimestamp = null;
      this.currentDuration = newDuration;
      this.setData({
        minutes: newDuration,
        seconds: 0,
        isRunning: false,
        currentDuration: newDuration
      });
      this.updateFormattedTime();
      return;
    }
    
    // 场景2：正在运行中（有 timer 且有 endTimestamp）→ 立刻刷新一次显示，不打断计时
    if (this.timer && this.endTimestamp) {
      console.log('计时器正在运行，刷新显示');
      this.tick();
      return;
    }
    
    // 场景3：暂停中（没有 timer 但有 endTimestamp）→ 保持暂停状态，不做任何操作
    if (!this.timer && this.endTimestamp) {
      console.log('计时器已暂停，保持状态');
      return;
    }
    
    // 场景4：完全空闲 → 初始化显示设置的时长
    console.log('完全空闲，初始化显示');
    this.currentDuration = newDuration;
    this.setData({
      minutes: newDuration,
      seconds: 0
    });
    this.updateFormattedTime();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 不清除 timer，让它继续运行
    // 页面隐藏时 setInterval 仍会触发，显示更新靠 onShow 时手动同步
    console.log('页面隐藏，计时器继续运行');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清除计时器，避免内存泄漏
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.endTimestamp = null;
    }
  },

  /**
   * 更新格式化后的时间字符串
   * 确保分钟和秒都显示为两位数字
   */
  updateFormattedTime() {
    const { minutes, seconds } = this.data;
    // 使用 padStart 方法补零到两位
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    this.setData({
      formattedTime: `${formattedMinutes}:${formattedSeconds}`
    });
  },

  /**
   * 开始/暂停按钮点击事件
   * 切换计时状态
   */
  onToggleTimer() {
    console.log('切换计时状态');
    
    if (!this.data.isRunning) {
      // 当前是停止状态，点击开始计时
      this.startTimer();
    } else {
      // 当前是运行状态，点击暂停计时
      this.pauseTimer();
    }
  },

  /**
   * 开始计时
   */
  startTimer() {
    console.log('开始计时');
    
    // 记录本轮使用的时长（首次启动时记下来）
    const settings = storage.getSettings();
    this.currentDuration = settings.focusDuration;
    
    // 计算目标结束时间戳：当前时间 + 剩余时间（毫秒）
    const { minutes, seconds } = this.data;
    const remainingMs = (minutes * 60 + seconds) * 1000;
    this.endTimestamp = Date.now() + remainingMs;
    
    // 更新状态为运行中
    this.setData({
      isRunning: true
    });
    
    // 启动计时器，每 100ms 更新一次（更平滑）
    this.timer = setInterval(() => {
      this.tick();
    }, 100);
  },

  /**
   * 暂停计时
   */
  pauseTimer() {
    console.log('暂停计时');
    
    // 清除计时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // 更新状态为停止
    this.setData({
      isRunning: false
    });
  },

  /**
   * 计时器 tick 函数（每 100ms 执行一次）
   */
  tick() {
    // 计算剩余毫秒数
    const remainingMs = this.endTimestamp - Date.now();
    
    if (remainingMs <= 0) {
      // 倒计时结束
      this.onTimerComplete();
      return;
    }
    
    // 计算剩余分钟和秒
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // 更新数据
    this.setData({
      minutes,
      seconds
    });
    
    // 更新格式化时间
    this.updateFormattedTime();
  },

  /**
   * 倒计时完成处理
   */
  onTimerComplete() {
    console.log('倒计时完成');
    
    // 清除计时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // 从设置读取初始时长
    const settings = storage.getSettings();
    // 写入番茄记录到本地存储
    const record = storage.addRecord(settings.focusDuration);
    console.log('已记录番茄：', record);
    
    // 短震动提示
    wx.vibrateShort({
      success: () => {},
      fail: () => {} // 忽略震动失败
    });
    
    // 显示完成提示
    wx.showToast({
      title: '番茄完成！',
      icon: 'success',
      duration: 2000
    });
    
    // 重置时间到初始状态
    this.setData({
      minutes: settings.focusDuration,
      seconds: 0,
      isRunning: false,
      status: '专注时间',
      currentDuration: settings.focusDuration
    });
    
    // 更新格式化时间
    this.updateFormattedTime();
    
    // 清空结束时间戳
    this.endTimestamp = null;
  },

  /**
   * 重置按钮点击事件
   * 重置计时器到初始状态
   */
  onReset() {
    console.log('重置计时器');
    
    // 清除计时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // 从设置读取初始时长
    const settings = storage.getSettings();
    
    // 同步更新本轮时长
    this.currentDuration = settings.focusDuration;
    
    // 重置为初始状态
    this.setData({
      minutes: settings.focusDuration,
      seconds: 0,
      isRunning: false,
      status: '专注时间',
      currentDuration: settings.focusDuration
    });
    
    // 更新格式化时间
    this.updateFormattedTime();
    
    // 清空结束时间戳
    this.endTimestamp = null;
  }
});