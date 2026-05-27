// 引入本地存储工具
const storage = require('../../utils/storage.js');

Page({
  /**
   * 页面初始数据
   */
  data: {
    todos: [],                        // 待办列表（含 todayCount 字段）
    durationOptions: [15, 25, 45, 60],

    // 弹窗状态
    showDialog: false,
    editingId: null,                  // 当前编辑的待办 ID（null 表示新增模式）
    form: {
      name: '',
      duration: 25,
      isCustom: false,
      customDuration: ''
    }
  },

  /**
   * 页面显示时刷新（用户从计时页返回后能看到最新的"今日已专注"次数）
   */
  onShow() {
    this.loadTodos();
  },

  /**
   * 加载待办列表，给每条注入 todayCount 字段
   */
  loadTodos() {
    const rawTodos = storage.getTodos();
    const todos = rawTodos.map(t => ({
      ...t,
      todayCount: storage.getTodoTodayCount(t.id)
    }));
    this.setData({ todos });
  },

  /**
   * 显示"添加"对话框（重置表单）
   */
  onShowAddDialog() {
    this.setData({
      showDialog: true,
      editingId: null,
      form: {
        name: '',
        duration: 25,
        isCustom: false,
        customDuration: ''
      }
    });
  },

  /**
   * 显示"编辑"对话框（回填当前待办数据）
   */
  showEditDialog(todo) {
    // 判断已有时长是不是预设选项之一
    const isCustomDuration = ![15, 25, 45, 60].includes(todo.duration);
    this.setData({
      showDialog: true,
      editingId: todo.id,
      form: {
        name: todo.name,
        duration: isCustomDuration ? null : todo.duration,
        isCustom: isCustomDuration,
        customDuration: isCustomDuration ? String(todo.duration) : ''
      }
    });
  },

  /**
   * 关闭弹窗（点击遮罩）
   */
  onCloseDialog() {
    this.setData({ showDialog: false });
  },

  /**
   * 点击弹窗本身不关闭（阻止事件冒泡到遮罩）
   */
  onDialogTap() {
    // 空函数即可，catch:tap 阻断冒泡
  },

  /**
   * 输入名称
   */
  onInputName(e) {
    this.setData({ 'form.name': e.detail.value });
  },

  /**
   * 选择预设时长
   */
  onSelectDuration(e) {
    const value = Number(e.currentTarget.dataset.value);
    this.setData({
      'form.duration': value,
      'form.isCustom': false,
      'form.customDuration': ''
    });
  },

  /**
   * 切换到自定义时长
   */
  onSelectCustomDuration() {
    this.setData({
      'form.duration': null,
      'form.isCustom': true
    });
  },

  /**
   * 输入自定义时长
   */
  onInputCustomDuration(e) {
    this.setData({ 'form.customDuration': e.detail.value });
  },

  /**
   * 确认按钮（添加或更新）
   */
  onConfirmDialog() {
    const { form, editingId } = this.data;

    // 校验：名称非空
    const name = form.name.trim();
    if (!name) {
      wx.showToast({ title: '请输入待办名称', icon: 'none' });
      return;
    }

    // 校验：时长合法
    let duration;
    if (form.isCustom) {
      const n = parseInt(form.customDuration, 10);
      if (!n || n < 1 || n > 180) {
        wx.showToast({ title: '请输入 1-180 的分钟数', icon: 'none' });
        return;
      }
      duration = n;
    } else {
      duration = form.duration;
    }

    // 执行写入
    if (editingId) {
      storage.updateTodo(editingId, { name, duration });
      wx.showToast({ title: '已更新', icon: 'success' });
    } else {
      storage.addTodo(name, duration);
      wx.showToast({ title: '已添加', icon: 'success' });
    }

    // 关闭弹窗并刷新列表
    this.setData({ showDialog: false });
    this.loadTodos();
  },

  /**
   * 长按待办：弹出编辑/删除菜单
   */
  onLongPressTodo(e) {
    const id = e.currentTarget.dataset.id;
    const todo = this.data.todos.find(t => t.id === id);
    if (!todo) return;

    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      itemColor: '#333',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.showEditDialog(todo);
        } else if (res.tapIndex === 1) {
          this.confirmDeleteTodo(id, todo.name);
        }
      },
      fail: () => {} // 用户取消时不报错
    });
  },

  /**
   * 删除待办（二次确认）
   */
  confirmDeleteTodo(id, name) {
    wx.showModal({
      title: '删除待办',
      content: `删除"${name}"不会影响已生成的专注记录。确定删除吗？`,
      confirmColor: '#FF4444',
      success: (res) => {
        if (res.confirm) {
          storage.deleteTodo(id);
          this.loadTodos();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  /**
   * 点击"开始"按钮 → 跳转到计时页（带 todoId 参数）
   * 注意：P0.2 阶段 timer 页还未改造，跳过去会显示原本的 25 分钟计时；
   *       P0.4 改造完成后才会按待办时长计时并关联记录。
   */
  onStartTodo(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/timer/timer?todoId=${id}`
    });
  }
});