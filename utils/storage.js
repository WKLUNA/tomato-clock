/**
 * 本地存储工具
 * 管理四类数据：待办（todos）、番茄记录（records）、未来倒计时（countdowns）、应用设置（settings）
 */

const TODOS_KEY = 'todos';
const RECORDS_KEY = 'tomatoRecords';
const COUNTDOWNS_KEY = 'countdowns';
const SETTINGS_KEY = 'settings';
const DEFAULT_SETTINGS = { focusDuration: 25 };

// =========================================================
// 待办（todos）
// =========================================================

function getTodos() {
  const data = wx.getStorageSync(TODOS_KEY);
  if (!data || !Array.isArray(data)) return [];
  return data;
}

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

function updateTodo(id, patch) {
  const todos = getTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return null;
  todos[index] = { ...todos[index], ...patch };
  wx.setStorageSync(TODOS_KEY, todos);
  return todos[index];
}

function deleteTodo(id) {
  const todos = getTodos();
  const filtered = todos.filter(t => t.id !== id);
  if (filtered.length === todos.length) return false;
  wx.setStorageSync(TODOS_KEY, filtered);
  return true;
}

function getTodoById(id) {
  return getTodos().find(t => t.id === id) || null;
}

function getTodoTodayCount(todoId) {
  const records = getRecords();
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  return records.filter(r => {
    if (r.todoId !== todoId) return false;
    const rd = new Date(r.completedAt);
    return rd.getFullYear() === y && rd.getMonth() === m && rd.getDate() === d;
  }).length;
}

// =========================================================
// 番茄记录（records）
// =========================================================

function getRecords() {
  const data = wx.getStorageSync(RECORDS_KEY);
  if (!data || !Array.isArray(data)) return [];
  return data;
}

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

function deleteRecord(id) {
  const records = getRecords();
  const filtered = records.filter(r => r.id !== id);
  if (filtered.length === records.length) return false;
  wx.setStorageSync(RECORDS_KEY, filtered);
  return true;
}

function clearAllRecords() {
  wx.setStorageSync(RECORDS_KEY, []);
}

// =========================================================
// 未来倒计时（countdowns）
// =========================================================

/**
 * 获取所有未来倒计时
 * @returns {Array}
 */
function getCountdowns() {
  const data = wx.getStorageSync(COUNTDOWNS_KEY);
  if (!data || !Array.isArray(data)) return [];
  return data;
}

/**
 * 添加一条未来倒计时
 * @param {string} name - 名称
 * @param {string} targetDate - 目标日期 'YYYY-MM-DD'
 * @param {string} [note] - 备注
 * @returns {Object} 新创建的倒计时
 */
function addCountdown(name, targetDate, note) {
  const list = getCountdowns();
  const newItem = {
    id: Date.now(),
    name: String(name).trim(),
    targetDate: targetDate,
    note: String(note || '').trim(),
    createdAt: new Date().toISOString()
  };
  list.push(newItem);
  wx.setStorageSync(COUNTDOWNS_KEY, list);
  return newItem;
}

/**
 * 更新一条倒计时
 * @param {number} id
 * @param {Object} patch
 * @returns {Object|null}
 */
function updateCountdown(id, patch) {
  const list = getCountdowns();
  const index = list.findIndex(c => c.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...patch };
  wx.setStorageSync(COUNTDOWNS_KEY, list);
  return list[index];
}

/**
 * 删除一条倒计时
 * @param {number} id
 * @returns {boolean}
 */
function deleteCountdown(id) {
  const list = getCountdowns();
  const filtered = list.filter(c => c.id !== id);
  if (filtered.length === list.length) return false;
  wx.setStorageSync(COUNTDOWNS_KEY, filtered);
  return true;
}

// =========================================================
// 应用设置（settings）
// =========================================================

function getSettings() {
  const data = wx.getStorageSync(SETTINGS_KEY);
  if (!data || typeof data !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }
  return { ...DEFAULT_SETTINGS, ...data };
}

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
  // 未来倒计时
  getCountdowns,
  addCountdown,
  updateCountdown,
  deleteCountdown,
  // 设置
  getSettings,
  updateSettings
};