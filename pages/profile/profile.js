// 引入本地存储工具
const storage = require('../../utils/storage.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    focusDuration: 25,
    durationOptions: [15, 25, 45, 60],
    version: '1.0.0',
    author: '你的姓名'
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时读取设置
    const settings = storage.getSettings();
    this.setData({
      focusDuration: settings.focusDuration
    });
  },

  /**
   * 选择专注时长
   * @param {Object} e - 事件对象
   */
  onSelectDuration(e) {
    const duration = parseInt(e.currentTarget.dataset.value, 10);
    const newSettings = storage.updateSettings({ focusDuration: duration });
    
    this.setData({
      focusDuration: newSettings.focusDuration
    });
    
    wx.showToast({
      title: `已设置 ${duration} 分钟`,
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * 清空所有记录
   */
  onClearRecords() {
    wx.showModal({
      title: '清空所有记录',
      content: '所有番茄记录将被永久删除，确定吗？',
      confirmColor: '#FF4444',
      success: (res) => {
        if (res.confirm) {
          storage.clearAllRecords();
          wx.showToast({
            title: '已清空',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
});
