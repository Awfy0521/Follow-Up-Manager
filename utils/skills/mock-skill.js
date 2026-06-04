function getMockRecords() {
  const now = Date.now();
  return [
    {
      id: now - 3000,
      title: '星巴克咖啡商谈细节',
      content: '沟通投资细节。',
      nextTime: '2024-06-09T10:00:00',
      nextContent: '跟进投资协议签署',
      date: '06-09',
      createTime: now - 1000
    },
    {
      id: now - 2000,
      title: '跨赴科技办公室深入了解',
      content: '深入沟通项目，了解产品和业务的进展，打算投一个亿。',
      nextTime: '2024-06-08T14:00:00',
      nextContent: '准备投资方案',
      date: '06-08',
      createTime: now - 2000
    },
    {
      id: now - 1000,
      title: '奇迹 DemoDay',
      content: '第一次在 DemoDay 上接触，印象不错。',
      nextTime: '2024-06-07T13:40:00',
      nextContent: '安排二次会面',
      date: '06-07',
      createTime: now - 3000
    }
  ];
}

module.exports = {
  getMockRecords
};
