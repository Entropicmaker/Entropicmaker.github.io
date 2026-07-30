export interface Message {
  date: string;
  content: string;
}

export const messages: Message[] = [
  // 按下面的格式添加留言，页面会自动按日期从新到旧排列：
  // { date: '2026-07-31', content: '今天想到的一句话。' }
];
