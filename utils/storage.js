/**
 * 番茄记录本地存储工具
 * 提供番茄完成记录的增删查操作
 */

const STORAGE_KEY = 'tomatoRecords';  // 存储 key

/**
 * 获取所有番茄记录
 * @returns {Array} 番茄记录数组，如果没有记录则返回空数组
 */
function getRecords() {
  const data = wx.getStorageSync(STORAGE_KEY);
  // 首次启动时 storage 中不存在该 key，会返回空字符串，需要处理
  if (!data) {
    return [];
  }
  return data;
}

/**
 * 添加一条番茄记录
 * @param {number} durationMinutes - 番茄时长（分钟）
 * @returns {Object} 新创建的记录对象 { id, duration, completedAt }
 */
function addRecord(durationMinutes) {
  const records = getRecords();
  
  // 创建新记录
  const newRecord = {
    id: Date.now(),                                    // 使用时间戳作为唯一 ID
    duration: durationMinutes,                          // 番茄时长（分钟）
    completedAt: new Date().toISOString()              // ISO 8601 格式的完成时间
  };
  
  // 添加到数组末尾
  records.push(newRecord);
  
  // 写回存储
  wx.setStorageSync(STORAGE_KEY, records);
  
  return newRecord;
}

/**
 * 根据 ID 删除一条番茄记录
 * @param {number} id - 记录的 ID
 * @returns {boolean} 是否成功删除
 */
function deleteRecord(id) {
  const records = getRecords();
  const initialLength = records.length;
  
  // 过滤掉指定 ID 的记录
  const filteredRecords = records.filter(record => record.id !== id);
  
  // 如果没有找到匹配的记录，返回 false
  if (filteredRecords.length === initialLength) {
    return false;
  }
  
  // 写回存储
  wx.setStorageSync(STORAGE_KEY, filteredRecords);
  
  return true;
}

/**
 * 清空所有番茄记录
 * 用于设置页的"清空数据"功能
 */
function clearAllRecords() {
  wx.setStorageSync(STORAGE_KEY, []);
}

// CommonJS 导出
module.exports = {
  getRecords,
  addRecord,
  deleteRecord,
  clearAllRecords
};