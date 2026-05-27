Component({
  /**
   * 自定义 tabBar 组件
   * 文档参考：https://developers.weixin.qq.com/miniprogram/dev/framework/ability/custom-tabbar.html
   */
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/todos/todos', text: '待办', icon: '🍅' },
      { pagePath: '/pages/stats/stats', text: '统计', icon: '📊' },
      { pagePath: '/pages/profile/profile', text: '我的', icon: '👤' }
    ]
  },

  methods: {
    /**
     * 切换 tab
     */
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const path = e.currentTarget.dataset.path;
      // 提前更新选中状态（不等 onShow 切完才变色）
      this.setData({ selected: index });
      wx.switchTab({ url: path });
    }
  }
});