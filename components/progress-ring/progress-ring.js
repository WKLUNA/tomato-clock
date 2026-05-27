// 进度环组件
Component({
  // 组件属性
  properties: {
    // 总秒数，默认 25 分钟
    total: {
      type: Number,
      value: 1500
    },
    // 剩余秒数
    remaining: {
      type: Number,
      value: 1500
    },
    // 是否正在运行
    running: {
      type: Boolean,
      value: false
    }
  },

  // 组件数据
  data: {
    displayMinutes: '25',  // 格式化后的分钟字符串
    displaySeconds: '00',   // 格式化后的秒字符串
    statusText: '专注时间'   // 状态文字
  },

  // 组件 observers，监听属性变化
  observers: {
    // 监听剩余时间和总时间变化
    'remaining, total': function(remaining, total) {
      // 1) 格式化时间字符串到 data
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      this.setData({
        displayMinutes: String(m).padStart(2, '0'),
        displaySeconds: String(s).padStart(2, '0')
      });
      // 2) 重绘 canvas
      this.draw();
    },
    // 监听运行状态变化
    'running': function(running) {
      this.setData({
        statusText: running ? '专注中...' : '专注时间'
      });
      this.draw();
    }
  },

  // 组件生命周期
  lifetimes: {
    // 组件 attached 到页面时
    attached: function() {
      // 获取 canvas 节点并初始化绘图上下文
      const query = this.createSelectorQuery();
      query.select('#ring').fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0]) return;
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        // 处理高清屏适配，获取设备像素比
        const dpr = wx.getSystemInfoSync().pixelRatio;
        
        // 设置 canvas 实际像素尺寸（乘以 dpr）
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        
        // 缩放绘图上下文以适配高清屏
        ctx.scale(dpr, dpr);
        
        // 保存 canvas 和相关属性到组件实例
        this.canvas = canvas;
        this.ctx = ctx;
        this.canvasSize = res[0].width;  // css 像素尺寸
        
        // 初始绘制
        this.draw();
      });
    }
  },

  // 组件方法
  methods: {
    /**
     * 绘制进度环
     * 使用 canvas 2D API 绘制背景环和进度弧
     */
    draw: function() {
      // 如果绘图上下文还没准备好，直接返回
      if (!this.ctx) return;
      
      const ctx = this.ctx;
      const size = this.canvasSize;  // 画布逻辑尺寸（css 像素）
      
      // 计算圆环参数
      const cx = size / 2;           // 圆心 x 坐标
      const cy = size / 2;           // 圆心 y 坐标
      const radius = size / 2 - 12;  // 半径（留边距）
      const lineWidth = 20;          // 线宽
      
      // 清空画布
      ctx.clearRect(0, 0, size, size);
      
      // 计算进度（0-1）
      const progress = this.properties.total > 0 
        ? (this.properties.total - this.properties.remaining) / this.properties.total 
        : 0;
      
      // 绘制背景圆环（浅红色）
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#FFE5E5';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // 绘制进度弧（深红色）
      if (progress > 0) {
        ctx.beginPath();
        // 起点在 12 点钟方向（-π/2），顺时针绘制到进度位置
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + 2 * Math.PI * progress;
        ctx.arc(cx, cy, radius, startAngle, endAngle, false);
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }
  }
});
