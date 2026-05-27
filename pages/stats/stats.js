// 引入本地存储工具
const storage = require('../../utils/storage.js');
// 引入统计工具
const statsUtil = require('../../utils/stats.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    todayCount: 0,
    weekCount: 0,
    totalCount: 0,
    totalMinutes: 0,
    totalHours: 0,
    last7Days: [],
    last7DaysMax: 1,
    timeByTodo: [],        // 按待办分组的时长分布
    pieGradient: ''        // 饼图的 conic-gradient CSS 字符串
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadStats();
  },

  /**
   * 加载统计数据
   */
  loadStats() {
    const records = storage.getRecords();

    // 原有统计
    const todayCount = statsUtil.getTodayCount(records);
    const weekCount = statsUtil.getThisWeekCount(records);
    const totalCount = statsUtil.getTotalCount(records);
    const totalMinutes = statsUtil.getTotalMinutes(records);
    const totalHours = Math.floor(totalMinutes / 60);
    const last7Days = statsUtil.getLast7DaysData(records);
    const last7DaysMax = Math.max(...last7Days.map(item => item.count), 1);

    // 新增：按待办分组的时长分布
    const timeByTodo = statsUtil.getTimeByTodo(records);

    // 构造 conic-gradient CSS 字符串（饼图）
    // 形如：conic-gradient(from -90deg, #FF6B6B 0deg 120deg, #4ECDC4 120deg 360deg)
    let pieGradient = '';
    if (timeByTodo.length > 0) {
      const stops = timeByTodo.map(t =>
        `${t.color} ${t.startAngle}deg ${t.endAngle}deg`
      ).join(', ');
      pieGradient = `conic-gradient(from -90deg, ${stops})`;
    }

    this.setData({
      todayCount,
      weekCount,
      totalCount,
      totalMinutes,
      totalHours,
      last7Days,
      last7DaysMax,
      timeByTodo,
      pieGradient
    });
  }
});