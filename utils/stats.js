/**
 * 番茄记录统计工具
 * 提供各种统计数据的计算方法
 */

/**
 * 获取今天完成的番茄数
 * @param {Array} records - 番茄记录数组
 * @returns {number} 今天完成的番茄数量
 */
function getTodayCount(records) {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  
  return records.filter(record => {
    const date = new Date(record.completedAt);
    return date.getFullYear() === todayYear &&
           date.getMonth() === todayMonth &&
           date.getDate() === todayDay;
  }).length;
}

/**
 * 获取本周完成的番茄数（中国习惯，周一为一周第一天）
 * @param {Array} records - 番茄记录数组
 * @returns {number} 本周完成的番茄数量
 */
function getThisWeekCount(records) {
  const today = new Date();
  const dayOfWeek = today.getDay();  // 0-6，0表示周日
  
  // 计算本周一的日期（周日的话，dayOfWeek=0，需要减6天）
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);  // 设为周一 00:00:00
  
  const mondayTimestamp = monday.getTime();
  
  return records.filter(record => {
    return new Date(record.completedAt).getTime() >= mondayTimestamp;
  }).length;
}

/**
 * 获取番茄总数
 * @param {Array} records - 番茄记录数组
 * @returns {number} 番茄总数量
 */
function getTotalCount(records) {
  return records.length;
}

/**
 * 获取累计专注分钟数
 * @param {Array} records - 番茄记录数组
 * @returns {number} 累计专注分钟数
 */
function getTotalMinutes(records) {
  return records.reduce((sum, record) => sum + record.duration, 0);
}

/**
 * 获取最近7天的统计数据
 * @param {Array} records - 番茄记录数组
 * @returns {Array} 7天数据数组，每项 { date: 'MM-DD', count: number, isToday: boolean }
 *                 顺序：6天前 → 5天前 → ... → 昨天 → 今天
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
  
  // 遍历记录，将每个记录分配到对应的日期桶中
  records.forEach(record => {
    const recordDate = new Date(record.completedAt);
    const today = new Date();
    
    // 计算该记录是几天前的
    const diffMs = today.getTime() - recordDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // 如果在最近7天范围内（0-6天前），则计入对应桶
    if (diffDays >= 0 && diffDays <= 6) {
      // result 的索引 0 是6天前，索引6是今天
      const index = 6 - diffDays;
      result[index].count++;
    }
  });
  
  return result;
}

// CommonJS 导出
module.exports = {
  getTodayCount,
  getThisWeekCount,
  getTotalCount,
  getTotalMinutes,
  getLast7DaysData
};