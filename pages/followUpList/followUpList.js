const api = require('../../utils/api');

Page({
  data: {
    activeTab: 'records',
    records: [],
    recordCount: 0,
    statusBarHeight: 0,
    loading: false,
    // 分页
    page: 1,
    pageSize: 20,
    hasMore: true,
    // 搜索
    keyword: '',
    // 统计
    stats: {
      totalCount: 0,
      thisMonthCount: 0,
      pendingFollowUp: 0
    }
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight });
    this.loadRecords();
    this.loadStats();
  },

  onShow() {
    this.loadRecords();
    this.loadStats();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadRecords();
    this.loadStats();
    wx.stopPullDownRefresh();
  },

  // 触底加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadRecords(true);
    }
  },

  // 搜索
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.setData({ page: 1, hasMore: true });
    this.loadRecords();
  },

  onClearSearch() {
    this.setData({ keyword: '', page: 1, hasMore: true });
    this.loadRecords();
  },

  // 加载记录列表
  loadRecords(append = false) {
    this.setData({ loading: true });

    api.getRecords({
      page: this.data.page,
      pageSize: this.data.pageSize,
      keyword: this.data.keyword
    }).then(res => {
      const list = res.data.list || [];
      const total = res.data.total || 0;
      const records = append ? this.data.records.concat(list) : list;

      this.setData({
        records: records,
        recordCount: total,
        hasMore: records.length < total,
        loading: false
      });
    }).catch(err => {
      this.setData({ loading: false });
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    });
  },

  // 加载统计
  loadStats() {
    api.getRecordStats().then(res => {
      this.setData({ stats: res.data });
    }).catch(() => {});
  },

  // 切换 Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 新增
  goToAdd() {
    wx.navigateTo({
      url: '/pages/followUpAdd/followUpAdd',
      animationType: 'none'
    });
  },

  // 删除单条
  onDeleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确认删除？',
      confirmColor: '#4A90D9',
      success: (res) => {
        if (res.confirm) {
          api.deleteRecord(id).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' });
            this.setData({ page: 1, hasMore: true });
            this.loadRecords();
            this.loadStats();
          }).catch(err => {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 刷新
  onRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadRecords();
    this.loadStats();
    wx.showToast({ title: '已刷新', icon: 'success' });
  },

  goBack() {
    wx.navigateBack();
  }
});
