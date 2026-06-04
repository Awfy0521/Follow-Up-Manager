const config = require('./config');

/**
 * 通用请求方法
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
      fail(err) {
        reject({ code: -1, message: '网络请求失败', data: null });
      }
    });
  });
}

/**
 * 1. 获取跟进记录列表（分页 + 搜索）
 */
function getRecords(params = {}) {
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
  return request({
    url: `/api/records/${id}`,
    method: 'GET'
  });
}

/**
 * 4. 更新跟进记录
 */
function updateRecord(id, data) {
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
  return request({
    url: `/api/records/${id}`,
    method: 'DELETE'
  });
}

/**
 * 6. 获取记录统计信息
 */
function getRecordStats() {
  return request({
    url: `/api/projects/${config.PROJECT_ID}/records/stats`,
    method: 'GET'
  });
}

/**
 * 7. 批量删除跟进记录
 */
function batchDeleteRecords(ids) {
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
