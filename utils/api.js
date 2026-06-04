const config = require('./config');
const storageSkill = require('./skills/storage-skill');

const USE_API = !!config.BASE_URL;

/**
 * 通用请求方法（仅 API 模式使用）
 */
function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail() {
        reject({ code: -1, message: '网络请求失败', data: null });
      }
    });
  });
}

/**
 * 1. 获取跟进记录列表
 */
function getRecords(params = {}) {
  if (!USE_API) {
    // 本地模式：从 localStorage 读取
    let records = storageSkill.getRecords();

    // 关键词搜索
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      records = records.filter(r =>
        r.title.toLowerCase().includes(kw) ||
        r.content.toLowerCase().includes(kw)
      );
    }

    // 排序
    records.sort((a, b) => {
      const dateA = a.createTime || 0;
      const dateB = b.createTime || 0;
      return params.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const total = records.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const start = (page - 1) * pageSize;
    const list = records.slice(start, start + pageSize);

    return Promise.resolve({
      code: 0,
      message: 'success',
      data: { total, page, pageSize, list }
    });
  }

  return request({
    url: `/api/projects/${config.PROJECT_ID}/records`,
    method: 'GET',
    data: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      keyword: params.keyword || '',
      startDate: params.startDate || '',
      endDate: params.endDate || '',
      sortBy: params.sortBy || 'date',
      sortOrder: params.sortOrder || 'desc'
    }
  });
}

/**
 * 2. 新增跟进记录
 */
function addRecord(data) {
  if (!USE_API) {
    const record = storageSkill.addRecord(data);
    return Promise.resolve({
      code: 0,
      message: 'success',
      data: record
    });
  }

  return request({
    url: `/api/projects/${config.PROJECT_ID}/records`,
    method: 'POST',
    data: {
      title: data.title,
      content: data.content,
      nextTime: data.nextTime || null,
      nextContent: data.nextContent || null
    }
  });
}

/**
 * 3. 获取单条跟进记录详情
 */
function getRecordDetail(id) {
  if (!USE_API) {
    const records = storageSkill.getRecords();
    const record = records.find(r => r.id === id);
    if (record) {
      return Promise.resolve({ code: 0, message: 'success', data: record });
    }
    return Promise.reject({ code: 40401, message: '跟进记录不存在', data: null });
  }

  return request({
    url: `/api/records/${id}`,
    method: 'GET'
  });
}

/**
 * 4. 更新跟进记录
 */
function updateRecord(id, data) {
  if (!USE_API) {
    const records = storageSkill.getRecords();
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) {
      return Promise.reject({ code: 40401, message: '跟进记录不存在', data: null });
    }
    records[idx] = { ...records[idx], ...data };
    wx.setStorageSync('followUpRecords', records);
    return Promise.resolve({ code: 0, message: 'success', data: records[idx] });
  }

  return request({
    url: `/api/records/${id}`,
    method: 'PUT',
    data
  });
}

/**
 * 5. 删除单条跟进记录
 */
function deleteRecord(id) {
  if (!USE_API) {
    storageSkill.deleteRecord(id);
    return Promise.resolve({ code: 0, message: '删除成功', data: null });
  }

  return request({
    url: `/api/records/${id}`,
    method: 'DELETE'
  });
}

/**
 * 6. 获取记录统计信息
 */
function getRecordStats() {
  if (!USE_API) {
    const records = storageSkill.getRecords();
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthCount = records.filter(r => {
      const d = r.date || '';
      return d.startsWith(thisMonth);
    }).length;

    const pendingFollowUp = records.filter(r => {
      if (!r.nextTime) return false;
      // iOS 兼容：空格替换为 T
      return new Date(r.nextTime.replace(' ', 'T')) > now;
    }).length;

    return Promise.resolve({
      code: 0,
      message: 'success',
      data: {
        totalCount: records.length,
        thisMonthCount,
        pendingFollowUp,
        latestRecordDate: records.length > 0 ? records[0].date : ''
      }
    });
  }

  return request({
    url: `/api/projects/${config.PROJECT_ID}/records/stats`,
    method: 'GET'
  });
}

/**
 * 7. 批量删除跟进记录
 */
function batchDeleteRecords(ids) {
  if (!USE_API) {
    ids.forEach(id => storageSkill.deleteRecord(id));
    return Promise.resolve({ code: 0, message: '删除成功', data: { deletedCount: ids.length } });
  }

  return request({
    url: '/api/records/batch',
    method: 'DELETE',
    data: { ids }
  });
}

module.exports = {
  getRecords,
  addRecord,
  getRecordDetail,
  updateRecord,
  deleteRecord,
  getRecordStats,
  batchDeleteRecords
};
