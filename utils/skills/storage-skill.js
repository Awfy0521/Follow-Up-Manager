const mockSkill = require('./mock-skill');

const STORAGE_KEY = 'followUpRecords';

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function getRecords() {
  let records = wx.getStorageSync(STORAGE_KEY);
  if (!records || records.length === 0) {
    initMockData();
    records = wx.getStorageSync(STORAGE_KEY);
  }
  return records.sort((a, b) => b.createTime - a.createTime);
}

function addRecord(data) {
  const records = wx.getStorageSync(STORAGE_KEY) || [];
  const record = {
    id: generateId(),
    title: data.title,
    content: data.content,
    nextTime: data.nextTime,
    nextContent: data.nextContent || '',
    date: data.date || (() => {
      const d = new Date();
      return String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    })(),
    createTime: Date.now()
  };
  records.push(record);
  wx.setStorageSync(STORAGE_KEY, records);
  return record;
}

function deleteRecord(id) {
  const records = wx.getStorageSync(STORAGE_KEY) || [];
  const filtered = records.filter(r => r.id !== id);
  wx.setStorageSync(STORAGE_KEY, filtered);
}

function initMockData() {
  const mockRecords = mockSkill.getMockRecords();
  wx.setStorageSync(STORAGE_KEY, mockRecords);
}

module.exports = {
  getRecords,
  addRecord,
  deleteRecord,
  initMockData,
  generateId
};
