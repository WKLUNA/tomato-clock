// 引入本地存储工具
const storage = require('../../utils/storage.js');
// 引入统计工具
const statsUtil = require('../../utils/stats.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    todayCount: 0,      // 今日番茄数
    weekCount: 0,       // 本周番茄数
    totalCount: 0,      // 总番茄数
    totalMinutes: 0,    // 累计专注分钟
    totalHours: 0,      // 累计专注小时
    last7Days: [],      // 最近7天数据
    last7DaysMax: 1     // 最近7天最大数量（用于柱状图归一化）
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时加载统计数据
    this.loadStats();
  },

  /**
   * 加载统计数据
   */
  loadStats() {
    // 从本地存储获取所有记录
    const records = storage.getRecords();
    
    // 计算各项统计数据
    const todayCount = statsUtil.getTodayCount(records);
    const weekCount = statsUtil.getThisWeekCount(records);
    const totalCount = statsUtil.getTotalCount(records);
    const totalMinutes = statsUtil.getTotalMinutes(records);
    const totalHours = Math.floor(totalMinutes / 60);
    const last7Days = statsUtil.getLast7DaysData(records);
    
    // 计算最近7天的最大数量（用于柱状图高度归一化）
    const last7DaysMax = Math.max(...last7Days.map(item => item.count), 1);
    
    // 更新页面数据
    this.setData({
      todayCount,
      weekCount,
      totalCount,
      totalMinutes,
      totalHours,
      last7Days,
      last7DaysMax
    });
  }
});