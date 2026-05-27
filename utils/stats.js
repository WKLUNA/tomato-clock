/**
 * 番茄记录统计工具
 * 提供各种统计数据的计算方法
 */

/**
 * 饼图调色板：番茄红主色 + 7 个辅助色 + 1 个灰色（用于"未分类"）
 */
const COLOR_PALETTE = [
  '#FF6B6B',  // 主红
  '#4ECDC4',  // 青
  '#FFD93D',  // 黄
  '#A8E6CF',  // 浅绿
  '#C9B1FF',  // 紫
  '#FFB6B9',  // 粉
  '#FFA94D',  // 橙
  '#6BCB77'   // 绿
];
const UNCLASSIFIED_COLOR = '#CCCCCC';

/**
 * 获取今天完成的番茄数
 */
function getTodayCount(records) {
  const today = new Date();
  return records.filter(record => {
    const date = new Date(record.completedAt);
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  }).length;
}

/**
 * 获取本周完成的番茄数（中国习惯，周一为一周第一天）
 */
function getThisWeekCount(records) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const mondayTimestamp = monday.getTime();
  return records.filter(record => {
    return new Date(record.completedAt).getTime() >= mondayTimestamp;
  }).length;
}

/**
 * 获取番茄总数
 */
function getTotalCount(records) {
  return records.length;
}

/**
 * 获取累计专注分钟数
 */
function getTotalMinutes(records) {
  return records.reduce((sum, record) => sum + record.duration, 0);
}

/**
 * 获取最近 7 天的统计数据
 */
function getLast7DaysData(records) {
  const result = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    result.push({
      date: `${month}-${day}`,
      count: 0,
      isToday: i === 0
    });
  }

  records.forEach(record => {
    const recordDate = new Date(record.completedAt);
    const now = new Date();
    const diffMs = now.getTime() - recordDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 6) {
      const index = 6 - diffDays;
      result[index].count++;
    }
  });

  return result;
}

/**
 * 按待办分组统计专注时长（用于饼图）
 * @param {Array} records - 番茄记录数组
 * @returns {Array} [{ todoId, todoName, minutes, percentage, color, startAngle, endAngle }]
 *                  按 minutes 降序；todoId 为 null 的记录统一归到"未分类"组
 */
function getTimeByTodo(records) {
  if (!records || records.length === 0) return [];

  // 按 todoId 分组聚合
  const map = new Map();
  records.forEach(r => {
    const key = r.todoId != null ? r.todoId : 'unclassified';
    const name = r.todoName || '未分类';
    if (!map.has(key)) {
      map.set(key, { todoId: r.todoId, todoName: name, minutes: 0 });
    }
    map.get(key).minutes += r.duration;
  });

  // 转数组，按时长降序
  const groups = Array.from(map.values()).sort((a, b) => b.minutes - a.minutes);

  // 计算总时长（用于算百分比）
  const totalMinutes = groups.reduce((sum, g) => sum + g.minutes, 0);
  if (totalMinutes === 0) return [];

  // 累计角度（用于 conic-gradient 的色段位置）+ 分配颜色
  let cumulativeAngle = 0;
  let colorIndex = 0;
  return groups.map(g => {
    const ratio = g.minutes / totalMinutes;
    const angle = ratio * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    // "未分类"固定灰色；其他按序使用调色板
    const color = g.todoName === '未分类'
      ? UNCLASSIFIED_COLOR
      : COLOR_PALETTE[colorIndex++ % COLOR_PALETTE.length];

    return {
      todoId: g.todoId != null ? g.todoId : 0,  // wx:key 不能是 null
      todoName: g.todoName,
      minutes: g.minutes,
      percentage: (ratio * 100).toFixed(1),
      color,
      startAngle: startAngle.toFixed(2),
      endAngle: endAngle.toFixed(2)
    };
  });
}

// CommonJS 导出
module.exports = {
  getTodayCount,
  getThisWeekCount,
  getTotalCount,
  getTotalMinutes,
  getLast7DaysData,
  getTimeByTodo
};