export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const subjects: Subject[] = [
  {
    id: 'chinese',
    name: '语文',
    icon: '📖',
    color: '#E74C3C',
    description: '语言文字与文学素养'
  },
  {
    id: 'math',
    name: '数学',
    icon: '🔢',
    color: '#3498DB',
    description: '逻辑思维与数学运算'
  },
  {
    id: 'english',
    name: '英语',
    icon: '🔤',
    color: '#27AE60',
    description: '英语语言学习与应用'
  },
  {
    id: 'physics',
    name: '物理',
    icon: '⚡',
    color: '#9B59B6',
    description: '物质运动与能量转换'
  },
  {
    id: 'chemistry',
    name: '化学',
    icon: '🧪',
    color: '#F39C12',
    description: '物质组成与化学反应'
  },
  {
    id: 'biology',
    name: '生物',
    icon: '🧬',
    color: '#1ABC9C',
    description: '生命科学与生态系统'
  },
  {
    id: 'history',
    name: '历史',
    icon: '🏛️',
    color: '#D35400',
    description: '人类文明与历史进程'
  },
  {
    id: 'geography',
    name: '地理',
    icon: '🌍',
    color: '#16A085',
    description: '地球环境与人文地理'
  }
];

export const getSubjectById = (id: string): Subject | undefined => {
  return subjects.find(subject => subject.id === id);
};

export const getSubjectsByLevel = (level: 'primary' | 'junior' | 'senior'): Subject[] => {
  const primarySubjects = ['chinese', 'math', 'english'];
  const juniorSubjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'history', 'geography'];
  const seniorSubjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'history', 'geography'];

  const subjectIds = level === 'primary' ? primarySubjects : level === 'junior' ? juniorSubjects : seniorSubjects;
  return subjects.filter(subject => subjectIds.includes(subject.id));
};
