function validateRecord(data) {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('请输入沟通主题');
  } else if (data.title.trim().length > 50) {
    errors.push('沟通主题不能超过50个字符');
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('请输入沟通详情');
  }

  if (!data.nextTime || data.nextTime.trim().length === 0) {
    errors.push('请选择下次沟通时间');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRecord
};
