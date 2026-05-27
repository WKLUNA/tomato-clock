Page({
  /**
   * 页面的初始数据
   */
  data: {
    minutes: 25,           // 当前显示的分钟（暂时硬编码为25分钟）
    seconds: 0,            // 当前显示的秒（暂时硬编码为0）
    isRunning: false,      // 是否正在计时（决定按钮显示"开始"还是"暂停"）
    status: '专注时间',     // 状态文字（暂时只显示这一个）
    formattedTime: '25:00' // 格式化后的时间字符串
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
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时初始化格式化时间
    this.updateFormattedTime();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 如果计时器正在运行，先记录当前剩余时间并清除计时器
    if (this.data.isRunning && this.timer) {
      // 计算当前剩余毫秒数
      const remainingMs = this.endTimestamp - Date.now();
      if (remainingMs > 0) {
        // 转换为分钟和秒
        const totalSeconds = Math.ceil(remainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.setData({
          minutes,
          seconds
        });
        this.updateFormattedTime();
      }
      // 清除计时器
      clearInterval(this.timer);
      this.timer = null;
      this.endTimestamp = null;
    }
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
      minutes: 25,
      seconds: 0,
      isRunning: false,
      status: '专注时间'
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
    
    // 重置为初始状态
    this.setData({
      minutes: 25,
      seconds: 0,
      isRunning: false,
      status: '专注时间'
    });
    
    // 更新格式化时间
    this.updateFormattedTime();
    
    // 清空结束时间戳
    this.endTimestamp = null;
  }
});