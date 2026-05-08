export type GradeLevel = 'primary' | 'junior' | 'senior';

export interface Grade {
  id: string;
  name: string;
  level: GradeLevel;
  order: number;
  shortName: string;
}

export const grades: Grade[] = [
  { id: 'grade-1', name: '一年级', level: 'primary', order: 1, shortName: '一' },
  { id: 'grade-2', name: '二年级', level: 'primary', order: 2, shortName: '二' },
  { id: 'grade-3', name: '三年级', level: 'primary', order: 3, shortName: '三' },
  { id: 'grade-4', name: '四年级', level: 'primary', order: 4, shortName: '四' },
  { id: 'grade-5', name: '五年级', level: 'primary', order: 5, shortName: '五' },
  { id: 'grade-6', name: '六年级', level: 'primary', order: 6, shortName: '六' },
  { id: 'grade-7', name: '七年级', level: 'junior', order: 7, shortName: '七' },
  { id: 'grade-8', name: '八年级', level: 'junior', order: 8, shortName: '八' },
  { id: 'grade-9', name: '九年级', level: 'junior', order: 9, shortName: '九' },
  { id: 'grade-10', name: '高一', level: 'senior', order: 10, shortName: '高一' },
  { id: 'grade-11', name: '高二', level: 'senior', order: 11, shortName: '高二' },
  { id: 'grade-12', name: '高三', level: 'senior', order: 12, shortName: '高三' }
];

export const getGradeById = (id: string): Grade | undefined => {
  return grades.find(grade => grade.id === id);
};

export const getGradesByLevel = (level: GradeLevel): Grade[] => {
  return grades.filter(grade => grade.level === level);
};

export const getGradeLevelLabel = (level: GradeLevel): string => {
  const labels: Record<GradeLevel, string> = {
    primary: '小学',
    junior: '初中',
    senior: '高中'
  };
  return labels[level];
};
