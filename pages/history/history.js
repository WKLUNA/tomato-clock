// 引入本地存储工具
const storage = require('../../utils/storage.js');
// 引入时间格式化工具
const format = require('../../utils/format.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    records: []  // 番茄记录列表
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新记录列表
    this.loadRecords();
  },

  /**
   * 加载并格式化番茄记录
   */
  loadRecords() {
    // 从本地存储获取所有记录
    const records = storage.getRecords();
    
    // 按完成时间倒序排序（最新的在上）
    records.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    
    // 为每条记录添加人性化的显示时间
    const formattedRecords = records.map(record => ({
      ...record,
      displayTime: format.formatRelativeTime(record.completedAt)
    }));
    
    // 更新页面数据
    this.setData({
      records: formattedRecords
    });
  },

  /**
   * 删除记录按钮点击事件
   * @param {Object} e - 事件对象
   */
  onDeleteRecord(e) {
    // 从 dataset 中获取记录 ID（注意转换为数字）
    const id = parseInt(e.currentTarget.dataset.id, 10);
    
    // 弹出确认对话框
    wx.showModal({
      title: '删除记录',
      content: '删除后无法恢复，确定吗？',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确定，执行删除
          const success = storage.deleteRecord(id);
          
          if (success) {
            // 删除成功，刷新列表并提示
            this.loadRecords();
            wx.showToast({
              title: '已删除',
              icon: 'success',
              duration: 1500
            });
          } else {
            // 删除失败（记录不存在）
            wx.showToast({
              title: '删除失败',
              icon: 'none',
              duration: 1500
            });
          }
        }
      }
    });
  }
});