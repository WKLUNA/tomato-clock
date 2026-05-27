/**
 * 时间格式化工具
 * 提供人性化的相对时间显示
 */

/**
 * 格式化 ISO 时间字符串为相对时间
 * @param {string} isoString - ISO 8601 格式的时间字符串
 * @returns {string} 人性化的相对时间字符串
 * 
 * 规则：
 * - 同一天（同年同月同日）→ "今天 HH:mm"
 * - 昨天 → "昨天 HH:mm"
 * - 7 天内 → "N 天前 HH:mm"
 * - 更早 → "YYYY-MM-DD HH:mm"
 */
function formatRelativeTime(isoString) {
  const targetDate = new Date(isoString);
  const now = new Date();
  
  // 获取目标日期的年月日时分
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();
  const targetHours = targetDate.getHours().toString().padStart(2, '0');
  const targetMinutes = targetDate.getMinutes().toString().padStart(2, '0');
  
  // 获取今天的年月日
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();
  
  // 计算时间差（毫秒）
  const diffMs = now.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // 判断是今天、昨天、7天内还是更早
  if (targetYear === todayYear && targetMonth === todayMonth && targetDay === todayDay) {
    // 今天
    return `今天 ${targetHours}:${targetMinutes}`;
  } else if (diffDays === 1) {
    // 昨天
    return `昨天 ${targetHours}:${targetMinutes}`;
  } else if (diffDays > 1 && diffDays <= 7) {
    // 7天内
    return `${diffDays} 天前 ${targetHours}:${targetMinutes}`;
  } else {
    // 更早，显示完整日期
    const targetMonthStr = (targetMonth + 1).toString().padStart(2, '0');
    const targetDayStr = targetDay.toString().padStart(2, '0');
    return `${targetYear}-${targetMonthStr}-${targetDayStr} ${targetHours}:${targetMinutes}`;
  }
}

// CommonJS 导出
module.exports = {
  formatRelativeTime
};