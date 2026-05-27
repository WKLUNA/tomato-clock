# 番茄钟（Tomato Clock）

基于微信小程序原生开发的番茄工作法 + 任务管理工具。

## 功能

- 待办管理（增删改 + 自定义专注时长 1-180 分钟）
- 番茄计时（Canvas 圆环可视化、提前完成/放弃二分语义）
- 历史记录（按日期切换查看）
- 数据统计（今日/本周/总计 + 按待办分布饼图 + 最近 7 天柱状图）
- 未来倒计时（重要日子倒数）
- 自定义底部导航栏

## 技术栈

- 微信小程序原生开发（WXML / WXSS / JS）
- 本地持久化：wx.setStorageSync
- Canvas 2D（圆环进度环）
- CSS conic-gradient（饼图）
- 自定义 tabBar 全局组件

## 运行方式

1. 微信开发者工具导入本项目
2. 基础库版本：2.31.1 或更高
3. 直接编译运行（无需后端、无需第三方依赖）

## 数据存储

所有数据通过 `wx.setStorageSync` 存于本地，存储 key：

- `todos`：待办列表
- `tomatoRecords`：番茄完成记录
- `countdowns`：未来倒计时
- `settings`：应用设置

## 项目结构

```
.
├── app.json / app.js / app.wxss
├── custom-tab-bar/          自定义底部导航栏（全局组件）
├── components/
│   └── progress-ring/       圆环进度自定义组件
├── pages/
│   ├── todos/               主页：待办列表
│   ├── timer/               计时页（navigateTo 独立路由）
│   ├── stats/               统计页
│   ├── history/             历史记录页
│   ├── countdowns/          未来倒计时页
│   └── profile/             我的
└── utils/
    ├── storage.js           本地存储工具
    ├── format.js            时间格式化工具
    └── stats.js             统计计算工具
```

## 开发者

- 学号：2022211291
- 姓名:金凡皙
