/**
 * 本地存储工具
 * 管理三类数据：待办（todos）、番茄记录（records）、应用设置（settings）
 *
 * 数据结构：
 * - todos:    [{ id, name, duration, createdAt }]
 * - records:  [{ id, duration, completedAt, todoId, todoName }]
 *             （旧记录可能没有 todoId / todoName，读取时为 null/undefined，已兼容处理）
 * - settings: { focusDuration }
 */

const TODOS_KEY = 'todos';
const RECORDS_KEY = 'tomatoRecords';
const SETTINGS_KEY = 'settings';
const DEFAULT_SETTINGS = { focusDuration: 25 };

// =========================================================
// 待办（todos）
// =========================================================

/**
 * 获取所有待办
 * @returns {Array} 待办数组（无数据返回空数组）
 */
function getTodos() {
  const data = wx.getStorageSync(TODOS_KEY);
  if (!data || !Array.isArray(data)) return [];
  return data;
}

/**
 * 添加一条待办
 * @param {string} name - 待办名称
 * @param {number} duration - 单次专注时长（分钟）
 * @returns {Object} 新创建的待办
 */
function addTodo(name, duration) {
  const todos = getTodos();
  const newTodo = {
    id: Date.now(),
    name: String(name).trim(),
    duration: Number(duration),
    createdAt: new Date().toISOString()
  };
  todos.push(newTodo);
  wx.setStorageSync(TODOS_KEY, todos);
  return newTodo;
}

/**
 * 更新一条待办
 * @param {number} id - 待办 ID
 * @param {Object} patch - 要更新的字段（name / duration 等）
 * @returns {Object|null} 更新后的待办；未找到返回 null
 */
function updateTodo(id, patch) {
  const todos = getTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return null;
  todos[index] = { ...todos[index], ...patch };
  wx.setStorageSync(TODOS_KEY, todos);
  return todos[index];
}

/**
 * 删除一条待办
 * 注意：不会级联删除已生成的番茄记录（记录里仍保留 todoName 字段方便回顾）
 * @param {number} id - 待办 ID
 * @returns {boolean} 是否成功删除
 */
function deleteTodo(id) {
  const todos = getTodos();
  const filtered = todos.filter(t => t.id !== id);
  if (filtered.length === todos.length) return false;
  wx.setStorageSync(TODOS_KEY, filtered);
  return true;
}

/**
 * 根据 ID 获取一条待办
 * @param {number} id - 待办 ID
 * @returns {Object|null}
 */
function getTodoById(id) {
  return getTodos().find(t => t.id === id) || null;
}

/**
 * 获取某条待办今日已完成的番茄次数
 * @param {number} todoId
 * @returns {number} 今日完成次数
 */
function getTodoTodayCount(todoId) {
  const records = getRecords();
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  return records.filter(r => {
    if (r.todoId !== todoId) return false;
    const rd = new Date(r.completedAt);
    return rd.getFullYear() === y &&
           rd.getMonth() === m &&
           rd.getDate() === d;
  }).length;
}

// =========================================================
// 番茄记录（records）
// =========================================================

/**
 * 获取所有番茄记录
 * @returns {Array}
 */
function getRecords() {
  const data = wx.getStorageSync(RECORDS_KEY);
  if (!data || !Array.isArray(data)) return [];
  return data;
}

/**
 * 添加一条番茄记录
 * @param {number} durationMinutes - 实际专注分钟数
 * @param {Object} [todoInfo] - 关联的待办信息 { id, name }，可选；
 *                              不传时记录的 todoId/todoName 为 null（兼容老的无待办调用）
 * @returns {Object} 新创建的记录
 */
function addRecord(durationMinutes, todoInfo) {
  const records = getRecords();
  const newRecord = {
    id: Date.now(),
    duration: Number(durationMinutes),
    completedAt: new Date().toISOString(),
    todoId: todoInfo ? todoInfo.id : null,
    todoName: todoInfo ? todoInfo.name : null
  };
  records.push(newRecord);
  wx.setStorageSync(RECORDS_KEY, records);
  return newRecord;
}

/**
 * 删除一条番茄记录
 * @param {number} id
 * @returns {boolean}
 */
function deleteRecord(id) {
  const records = getRecords();
  const filtered = records.filter(r => r.id !== id);
  if (filtered.length === records.length) return false;
  wx.setStorageSync(RECORDS_KEY, filtered);
  return true;
}

/**
 * 清空所有番茄记录
 */
function clearAllRecords() {
  wx.setStorageSync(RECORDS_KEY, []);
}

// =========================================================
// 应用设置（settings）
// =========================================================

/**
 * 获取应用设置（默认值打底，防止字段缺失）
 * @returns {Object} 包含 focusDuration 等字段
 */
function getSettings() {
  const data = wx.getStorageSync(SETTINGS_KEY);
  if (!data || typeof data !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }
  return { ...DEFAULT_SETTINGS, ...data };
}

/**
 * 更新应用设置（patch 合并，保留其他字段）
 * @param {Object} patch
 * @returns {Object} 合并后的完整 settings
 */
function updateSettings(patch) {
  const current = getSettings();
  const next = { ...current, ...patch };
  wx.setStorageSync(SETTINGS_KEY, next);
  return next;
}

// =========================================================
// 导出
// =========================================================

module.exports = {
  // 待办
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  getTodoById,
  getTodoTodayCount,
  // 记录
  getRecords,
  addRecord,
  deleteRecord,
  clearAllRecords,
  // 设置
  getSettings,
  updateSettings
};