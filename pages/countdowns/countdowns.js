// 引入本地存储工具
const storage = require('../../utils/storage.js');

Page({
  /**
   * 页面初始数据
   */
  data: {
    countdowns: [],          // 已计算天数差的列表

    // 弹窗状态
    showDialog: false,
    editingId: null,         // 编辑中的倒计时 ID（null 表示新增模式）
    form: {
      name: '',
      targetDate: '',
      note: ''
    }
  },

  onShow() {
    this.loadCountdowns();
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
   * 加载倒计时列表，给每项注入计算字段并排序
   */
  loadCountdowns() {
    const raw = storage.getCountdowns();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list = raw.map(c => {
      const target = new Date(c.targetDate);
      target.setHours(0, 0, 0, 0);
      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      let dayText, dayClass;
      if (diffDays > 0) {
        dayText = '还剩';
        dayClass = 'future';
      } else if (diffDays === 0) {
        dayText = '';
        dayClass = 'today';
      } else {
        dayText = '已过';
        dayClass = 'past';
      }

      return {
        ...c,
        diffDays: Math.abs(diffDays),
        dayText,
        dayClass,
        isPast: diffDays < 0,
        isToday: diffDays === 0
      };
    });

    // 排序：未来+今天在前（按日期升序，最近的在最上）；已过的在后（按日期倒序，最近过的在最上）
    list.sort((a, b) => {
      if (!a.isPast && !b.isPast) {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      if (a.isPast && b.isPast) {
        return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
      }
      return a.isPast ? 1 : -1;
    });

    this.setData({ countdowns: list });
  },

  /**
   * 显示"添加"对话框（默认日期为明天）
   */
  onShowAddDialog() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.setData({
      showDialog: true,
      editingId: null,
      form: {
        name: '',
        targetDate: this.formatDate(tomorrow),
        note: ''
      }
    });
  },

  /**
   * 显示"编辑"对话框（回填数据）
   */
  showEditDialog(item) {
    this.setData({
      showDialog: true,
      editingId: item.id,
      form: {
        name: item.name,
        targetDate: item.targetDate,
        note: item.note || ''
      }
    });
  },

  onCloseDialog() {
    this.setData({ showDialog: false });
  },

  /**
   * 阻止弹窗内点击穿透到遮罩
   */
  onDialogTap() {},

  onInputName(e) {
    this.setData({ 'form.name': e.detail.value });
  },

  onInputNote(e) {
    this.setData({ 'form.note': e.detail.value });
  },

  onSelectDate(e) {
    this.setData({ 'form.targetDate': e.detail.value });
  },

  /**
   * 确认按钮（添加或更新）
   */
  onConfirmDialog() {
    const { form, editingId } = this.data;

    const name = form.name.trim();
    if (!name) {
      wx.showToast({ title: '请输入名称', icon: 'none' });
      return;
    }
    if (!form.targetDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }

    if (editingId) {
      storage.updateCountdown(editingId, {
        name,
        targetDate: form.targetDate,
        note: form.note.trim()
      });
      wx.showToast({ title: '已更新', icon: 'success' });
    } else {
      storage.addCountdown(name, form.targetDate, form.note.trim());
      wx.showToast({ title: '已添加', icon: 'success' });
    }

    this.setData({ showDialog: false });
    this.loadCountdowns();
  },

  /**
   * 长按列表项：编辑/删除菜单
   */
  onLongPressItem(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.countdowns.find(c => c.id === id);
    if (!item) return;

    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      itemColor: '#333',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.showEditDialog(item);
        } else if (res.tapIndex === 1) {
          this.confirmDelete(id, item.name);
        }
      },
      fail: () => {}
    });
  },

  /**
   * 删除（二次确认）
   */
  confirmDelete(id, name) {
    wx.showModal({
      title: '删除倒计时',
      content: `确定删除"${name}"吗？`,
      confirmColor: '#FF4444',
      success: (res) => {
        if (res.confirm) {
          storage.deleteCountdown(id);
          this.loadCountdowns();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});