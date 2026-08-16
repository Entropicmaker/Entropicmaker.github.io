export interface Message {
  date: string;
  content: string;
}

export const messages: Message[] = [
  // 按下面的格式添加留言，页面会自动按日期从新到旧排列：
  {
    date: '2026-08-16',
    content: '双层吉士汉堡被小皇堡打败了。。。'
  },
  {
    date: '2026-08-10',
    content:
      '最有效的记忆方法是提问与重复，产生心流感觉的要点是：合适的任务难度、清晰的目标与及时反馈、 消除干扰、挣扎阶段和固定物理触发条件'
  },
  {
    date: '2026-07-31',
    content: 'ai要用在辅助性的任务上而不是最核心的判断上'
  },
  {
    date: '2026-07-31',
    content: '如果维护学习系统比学习本身还累，那就说明系统有问题该做减法了'
  }
];
