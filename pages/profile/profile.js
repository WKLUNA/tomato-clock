// 引入本地存储工具和统计工具
const storage = require('../../utils/storage.js');
const statsUtil = require('../../utils/stats.js');

Page({
  /**
   * 页面初始数据
   */
  data: {
    todayCount: 0,
    totalCount: 0,
    totalMinutes: 0,
    version: '1.0.0',
    author: '金凡皙'   // 
  },

  /**
   * 页面显示时刷新用户统计数据
   */
    onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 2 });
    }
    this.loadUserStats();
    },

  /**
   * 加载用户统计数据（用于顶部卡片）
   */
  loadUserStats() {
    const records = storage.getRecords();
    this.setData({
      todayCount: statsUtil.getTodayCount(records),
      totalCount: statsUtil.getTotalCount(records),
      totalMinutes: statsUtil.getTotalMinutes(records)
    });
  },

  /**
   * 跳转到历史记录页
   */
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  /**
   * 跳转到未来倒计时页
   */
  goToCountdowns() {
    wx.navigateTo({
      url: '/pages/countdowns/countdowns',
      fail: () => {
        wx.showToast({
          title: '功能开发中',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  /**
   * 清空所有专注记录（二次确认）
   * 注意：只清 records，不动 todos / countdowns / settings
   */
  onClearRecords() {
    wx.showModal({
      title: '清空所有记录',
      content: '所有番茄记录将被永久删除（不会影响待办本身），确定吗？',
      confirmColor: '#FF4444',
      success: (res) => {
        if (res.confirm) {
          storage.clearAllRecords();
          this.loadUserStats();  // 重新加载，数字归零
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