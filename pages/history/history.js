// 引入本地存储工具
const storage = require('../../utils/storage.js');

Page({
  /**
   * 页面初始数据
   */
  data: {
    selectedDate: '',      // 当前选中日期 'YYYY-MM-DD'
    todayDate: '',         // 今天的日期（用作 picker end，限制不能选未来）
    displayDate: '',       // 显示用："2026-05-28 · 今天"
    isToday: true,         // 当前选中是否是今天
    records: [],           // 当天记录（已格式化）
    summary: {             // 当天概要
      count: 0,
      minutes: 0
    }
  },

  /**
   * 页面加载：初始化为今天
   */
  onLoad() {
    const today = this.formatDate(new Date());
    this.setData({
      selectedDate: today,
      todayDate: today
    });
    this.loadRecordsForDate();
  },

  /**
   * 页面显示：刷新数据（删除后从其他页面回来时能看到最新状态）
   */
  onShow() {
    this.loadRecordsForDate();
  },

  /**
   * 把 Date 对象格式化为 'YYYY-MM-DD'
   */
  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  /**
   * 根据选定日期加载当天记录
   */
  loadRecordsForDate() {
    const allRecords = storage.getRecords();
    const target = this.data.selectedDate;

    // 过滤当天记录
    const dayRecords = allRecords.filter(r => {
      const recordDate = this.formatDate(new Date(r.completedAt));
      return recordDate === target;
    });

    // 按时间倒序（最新的在上面）
    dayRecords.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    // 格式化展示字段
    const formattedRecords = dayRecords.map(r => {
      const d = new Date(r.completedAt);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return {
        ...r,
        timeText: `${hh}:${mm}`,
        todoName: r.todoName || '未分类'
      };
    });

    // 计算当天概要
    const summary = {
      count: formattedRecords.length,
      minutes: formattedRecords.reduce((sum, r) => sum + r.duration, 0)
    };

    // 判断是否今天 + 生成展示日期
    const today = this.formatDate(new Date());
    const isToday = target === today;
    const displayDate = this.getDisplayDate(target, isToday);

    this.setData({
      records: formattedRecords,
      summary,
      isToday,
      displayDate
    });
  },

  /**
   * 生成展示用的日期字符串（带"今天/昨天"语义）
   */
  getDisplayDate(dateStr, isToday) {
    if (isToday) return `${dateStr} · 今天`;

    // 计算与今天的天数差
    const target = new Date(dateStr);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return `${dateStr} · 昨天`;
    return dateStr;
  },

  /**
   * 切换到前一天
   */
  prevDay() {
    const current = new Date(this.data.selectedDate);
    current.setDate(current.getDate() - 1);
    this.setData({ selectedDate: this.formatDate(current) });
    this.loadRecordsForDate();
  },

  /**
   * 切换到后一天（不能超过今天）
   */
  nextDay() {
    if (this.data.isToday) return;   // 今天就不再往后跳
    const current = new Date(this.data.selectedDate);
    current.setDate(current.getDate() + 1);
    this.setData({ selectedDate: this.formatDate(current) });
    this.loadRecordsForDate();
  },

  /**
   * picker 选择日期
   */
  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value });
    this.loadRecordsForDate();
  },

  /**
   * 空状态下的"回到今天"按钮
   */
  goToday() {
    this.setData({ selectedDate: this.formatDate(new Date()) });
    this.loadRecordsForDate();
  },

  /**
   * 删除单条记录（二次确认）
   */
  onDeleteRecord(e) {
    const id = Number(e.currentTarget.dataset.id);
    wx.showModal({
      title: '删除记录',
      content: '删除后无法恢复，确定吗？',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          const success = storage.deleteRecord(id);
          if (success) {
            this.loadRecordsForDate();   // 刷新列表
            wx.showToast({
              title: '已删除',
              icon: 'success',
              duration: 1500
            });
          }
        }
      }
    });
  }
});