const storageSkill = require('../../utils/skills/storage-skill');
const validateSkill = require('../../utils/skills/validate-skill');

Page({
  data: {
    title: '',
    content: '',
    nextTime: '',
    nextContent: '',
    errors: [],
    submitting: false,
    statusBarHeight: 0
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onTimeChange(e) {
    const dateStr = e.detail.value;
    const date = new Date(dateStr);
    const now = new Date();
    date.setHours(now.getHours());
    date.setMinutes(now.getMinutes());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    this.setData({
      nextTime: `${year}-${month}-${day} ${hours}:${minutes}:00`
    });
  },

  onNextContentInput(e) {
    this.setData({ nextContent: e.detail.value });
  },

  save() {
    if (this.data.submitting) return;

    const data = {
      title: this.data.title,
      content: this.data.content,
      nextTime: this.data.nextTime,
      nextContent: this.data.nextContent
    };

    const validation = validateSkill.validateRecord(data);

    if (!validation.valid) {
      this.setData({ errors: validation.errors });
      wx.showToast({
        title: validation.errors[0],
        icon: 'none'
      });
      return;
    }

    this.setData({ submitting: true, errors: [] });

    storageSkill.addRecord(data);

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });

    setTimeout(() => {
      wx.navigateBack({ animationType: 'none' });
    }, 1500);
  },

  cancel() {
    wx.navigateBack({ animationType: 'none' });
  }
});
