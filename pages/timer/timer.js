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
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时初始化格式化时间
    this.updateFormattedTime();
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
    // 切换 isRunning 状态
    this.setData({
      isRunning: !this.data.isRunning
    });
  },

  /**
   * 重置按钮点击事件
   * 重置计时器到初始状态
   */
  onReset() {
    console.log('重置计时器');
    // 重置为初始状态
    this.setData({
      minutes: 25,
      seconds: 0,
      isRunning: false
    });
    // 更新格式化时间
    this.updateFormattedTime();
  }
});