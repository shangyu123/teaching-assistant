import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Heart,
  Eye,
  Star,
  BookOpen,
  ChevronDown,
  Filter,
  X,
  Loader2,
  Sparkles,
  Inbox,
  ArrowUp,
} from 'lucide-react';
import { subjects } from '@/data/mock/subjects';
import { grades } from '@/data/mock/grades';
import { useAppStore } from '@/store/useAppStore';

type ResourceType = 'courseware' | 'lesson-plan' | 'exercise' | 'analysis' | 'script';

interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  subject: string;
  grade: string;
  description: string;
  author?: string;
  usageCount: number;
  rating: number;
  tags: string[];
  createdAt: string;
  color: string;
  icon: string;
}

const typeConfig = {
  courseware: {
    label: '课件模板',
    icon: '📝',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-cyan-400',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-600',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
  },
  'lesson-plan': {
    label: '教案范例',
    icon: '📋',
    color: '#10B981',
    gradient: 'from-emerald-500 to-green-400',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-600',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  exercise: {
    label: '练习题库',
    icon: '✏️',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-400',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-600',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
  analysis: {
    label: '重难点解析',
    icon: '🎯',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-400',
    bgLight: 'bg-violet-50',
    textLight: 'text-violet-600',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-700',
  },
  script: {
    label: '讲解脚本',
    icon: '📖',
    color: '#EC4899',
    gradient: 'from-pink-500 to-rose-400',
    bgLight: 'bg-pink-50',
    textLight: 'text-pink-600',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-700',
  },
};

const sortOptions = [
  { value: 'latest', label: '最新发布' },
  { value: 'usage', label: '最多使用' },
  { value: 'rating', label: '最高评分' },
  { value: 'name', label: '名称排序' },
];

const gradeLevels = [
  { value: '', label: '全部年级' },
  { value: 'primary', label: '小学' },
  { value: 'junior', label: '初中' },
  { value: 'senior', label: '高中' },
];

const mockResources: Resource[] = [
  {
    id: 'res-001',
    title: '古诗词赏析——静夜思与望月怀远',
    type: 'courseware',
    subject: 'chinese',
    grade: 'grade-3',
    description: '通过对比阅读两首经典月夜诗，引导学生感受古诗意境之美，培养语感和审美能力，附带互动问答环节设计。',
    author: '李明老师',
    usageCount: 342,
    rating: 4.8,
    tags: ['古诗词', '意境赏析', '对比阅读'],
    createdAt: '2025-12-15',
    color: '#E74C3C',
    icon: '🌙',
  },
  {
    id: 'res-002',
    title: '小学作文写作技巧：如何写好开头和结尾',
    type: 'lesson-plan',
    subject: 'chinese',
    grade: 'grade-5',
    description: '系统讲解记叙文开头结尾的多种写法，包含精彩范例、学生练笔模板和评价量表。',
    author: '王芳老师',
    usageCount: 256,
    rating: 4.6,
    tags: ['作文教学', '写作技巧', '记叙文'],
    createdAt: '2025-12-10',
    color: '#E74C3C',
    icon: '✍️',
  },
  {
    id: 'res-003',
    title: '《草船借箭》人物形象分析教案',
    type: 'lesson-plan',
    subject: 'chinese',
    grade: 'grade-6',
    description: '深入分析诸葛亮、周瑜等人物性格特点，通过角色扮演和小组讨论提升学生的文本解读能力。',
    usageCount: 189,
    rating: 4.7,
    tags: ['名著阅读', '人物分析', '小组讨论'],
    createdAt: '2025-11-28',
    color: '#E74C3C',
    icon: '⚔️',
  },
  {
    id: 'res-004',
    title: '一次函数的图像与性质精讲课件',
    type: 'courseware',
    subject: 'math',
    grade: 'grade-8',
    description: '从实际情境引入一次函数概念，动态演示图像变化规律，配套课堂练习和课后分层作业。',
    author: '张伟老师',
    usageCount: 421,
    rating: 4.9,
    tags: ['函数', '图像分析', '数形结合'],
    createdAt: '2025-12-20',
    color: '#3498DB',
    icon: '📈',
  },
  {
    id: 'res-005',
    title: '几何证明入门：三角形全等的判定方法',
    type: 'analysis',
    subject: 'math',
    grade: 'grade-8',
    description: '系统梳理 SSS、SAS、ASA、AAS 四种判定方法，配合典型例题和易错点辨析。',
    usageCount: 367,
    rating: 4.8,
    tags: ['几何证明', '全等三角形', '判定方法'],
    createdAt: '2025-12-08',
    color: '#3498DB',
    icon: '📐',
  },
  {
    id: 'res-006',
    title: '分数乘除法综合练习题集（含解析）',
    type: 'exercise',
    subject: 'math',
    grade: 'grade-6',
    description: '涵盖分数乘除法所有考点，分基础、提高、拓展三个难度层次，每题配有详细解题思路。',
    usageCount: 298,
    rating: 4.5,
    tags: ['分数运算', '综合练习', '分层训练'],
    createdAt: '2025-12-01',
    color: '#3498DB',
    icon: '🔢',
  },
  {
    id: 'res-007',
    title: '英语语法精讲：现在完成时的用法与区别',
    type: 'courseware',
    subject: 'english',
    grade: 'grade-9',
    description: '详细讲解现在完成时与一般过去时、现在完成进行时的区别，配以大量真实语境例句。',
    author: '陈静老师',
    usageCount: 276,
    rating: 4.7,
    tags: ['语法', '时态', '易混辨析'],
    createdAt: '2025-12-12',
    color: '#27AE60',
    icon: '🔤',
  },
  {
    id: 'res-008',
    title: '中考英语阅读理解专项训练',
    type: 'exercise',
    subject: 'english',
    grade: 'grade-9',
    description: '精选 30 篇中考真题风格阅读理解，覆盖记叙文、说明文、议论文等多种文体，附答题技巧指导。',
    usageCount: 512,
    rating: 4.9,
    tags: ['阅读理解', '中考备考', '答题技巧'],
    createdAt: '2025-12-18',
    color: '#27AE60',
    icon: '📰',
  },
  {
    id: 'res-009',
    title: '牛顿运动定律实验设计与操作指南',
    type: 'lesson-plan',
    subject: 'physics',
    grade: 'grade-8',
    description: '完整的三定律实验方案，含器材清单、实验步骤、数据记录表和误差分析方法。',
    usageCount: 234,
    rating: 4.6,
    tags: ['力学实验', '牛顿定律', '实验设计'],
    createdAt: '2025-11-25',
    color: '#9B59B6',
    icon: '⚡',
  },
  {
    id: 'res-010',
    title: '电路分析与欧姆定律应用课件',
    type: 'courseware',
    subject: 'physics',
    grade: 'grade-9',
    description: '从简单串联并联到复杂混联电路的分析方法，结合生活实例讲解欧姆定律的实际应用。',
    usageCount: 198,
    rating: 4.5,
    tags: ['电路分析', '欧姆定律', '实际应用'],
    createdAt: '2025-12-05',
    color: '#9B59B6',
    icon: '💡',
  },
  {
    id: 'res-011',
    title: '化学方程式书写与配平专项练习',
    type: 'exercise',
    subject: 'chemistry',
    grade: 'grade-9',
    description: '从基础的单质与化合物反应到复杂的氧化还原反应方程式，循序渐进的训练体系。',
    usageCount: 345,
    rating: 4.7,
    tags: ['化学方程式', '配平', '氧化还原'],
    createdAt: '2025-12-14',
    color: '#F39C12',
    icon: '🧪',
  },
  {
    id: 'res-012',
    title: '酸碱中和反应实验探究教案',
    type: 'lesson-plan',
    subject: 'chemistry',
    grade: 'grade-9',
    description: '通过指示剂变色实验让学生直观感受中和反应过程，培养科学探究思维。',
    usageCount: 167,
    rating: 4.4,
    tags: ['酸碱反应', '实验探究', '指示剂'],
    createdAt: '2025-11-20',
    color: '#F39C12',
    icon: '🧫',
  },
  {
    id: 'res-013',
    title: '细胞的结构与功能讲解脚本',
    type: 'script',
    subject: 'biology',
    grade: 'grade-7',
    description: '逐字稿式讲解脚本，用生动比喻帮助学生理解细胞各结构的功能，附板书设计和提问节点。',
    usageCount: 156,
    rating: 4.6,
    tags: ['细胞结构', '讲解脚本', '生动比喻'],
    createdAt: '2025-12-02',
    color: '#1ABC9C',
    icon: '🧬',
  },
  {
    id: 'res-014',
    title: '光合作用与呼吸作用对比解析',
    type: 'analysis',
    subject: 'biology',
    grade: 'grade-8',
    description: '用表格和图示清晰对比两个生理过程的异同点，帮助学生建立系统的知识框架。',
    usageCount: 223,
    rating: 4.8,
    tags: ['光合作用', '呼吸作用', '知识对比'],
    createdAt: '2025-12-07',
    color: '#1ABC9C',
    icon: '🌿',
  },
  {
    id: 'res-015',
    title: '中国古代史：秦汉时期统一多民族国家的建立',
    type: 'script',
    subject: 'history',
    grade: 'grade-7',
    description: '故事化讲述秦始皇统一六国到汉朝强盛的历史脉络，融入历史小剧场和思考题。',
    usageCount: 134,
    rating: 4.5,
    tags: ['中国古代史', '秦汉', '统一国家'],
    createdAt: '2025-11-30',
    color: '#D35400',
    icon: '🏛️',
  },
  {
    id: 'res-016',
    title: '世界地理：气候类型分布与特征',
    type: 'courseware',
    subject: 'geography',
    grade: 'grade-7',
    description: '交互式气候分布图配合各地实景照片，直观展示全球主要气候类型的分布规律和特征。',
    usageCount: 178,
    rating: 4.6,
    tags: ['世界地理', '气候类型', '分布规律'],
    createdAt: '2025-12-03',
    color: '#16A085',
    icon: '🌍',
  },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card">
      <div className="h-44 loading-skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 loading-skeleton rounded-lg" />
        <div className="flex gap-2">
          <div className="h-5 w-14 loading-skeleton rounded-full" />
          <div className="h-5 w-14 loading-skeleton rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full loading-skeleton rounded" />
          <div className="h-4 w-2/3 loading-skeleton rounded" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-9 w-24 loading-skeleton rounded-xl" />
          <div className="h-9 w-24 loading-skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
          <Inbox className="w-14 h-14 text-gray-300" />
        </div>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-gray-300" />
        </motion.div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-2 font-serif">没有找到相关资源</h3>
      <p className="text-gray-500 text-center max-w-sm mb-8">
        试试调整筛选条件或换个关键词搜索吧~
      </p>

      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-50 text-primary-600 rounded-xl font-medium hover:bg-primary-100 transition-all duration-300 hover:scale-105"
      >
        <X className="w-4 h-4" />
        清除筛选条件
      </button>
    </motion.div>
  );
}

function ResourceCard({
  resource,
  index,
  isFavorite,
  onToggleFavorite,
}: {
  resource: Resource;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const typeInfo = typeConfig[resource.type];
  const subjectInfo = subjects.find((s) => s.id === resource.subject);
  const gradeInfo = grades.find((g) => g.id === resource.grade);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartAnimating(true);
    onToggleFavorite();
    setTimeout(() => setHeartAnimating(false), 600);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-350 cursor-pointer"
      style={{ transitionProperty: 'transform, box-shadow' }}
    >
      {/* 视觉区域 */}
      <div
        className={`relative h-44 bg-gradient-to-br ${typeInfo.gradient} overflow-hidden`}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`dots-${resource.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#dots-${resource.id})`} />
          </svg>
        </div>

        {/* 类型标签 */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`${typeInfo.badgeBg} ${typeInfo.badgeText} inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm`}>
            {typeInfo.icon} {typeInfo.label}
          </span>
        </div>

        {/* 使用次数徽章 */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/20 backdrop-blur-sm text-white text-xs rounded-full">
            <Eye className="w-3 h-3" />
            已使用 {resource.usageCount}
          </span>
        </div>

        {/* 图标 */}
        <motion.div
          animate={isHovered ? { scale: 1.15, rotate: -3 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-5xl drop-shadow-lg">{resource.icon}</span>
        </motion.div>
      </div>

      {/* 信息区域 */}
      <div className="p-5">
        {/* 标题 */}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2.5 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
          {resource.title}
        </h3>

        {/* 学科 + 年级标签 */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {subjectInfo && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
              style={{
                backgroundColor: `${subjectInfo.color}15`,
                color: subjectInfo.color,
              }}
            >
              {subjectInfo.icon} {subjectInfo.name}
            </span>
          )}
          {gradeInfo && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
              {gradeInfo.name}
            </span>
          )}
        </div>

        {/* 描述 */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{resource.description}</p>

        {/* 作者（可选） */}
        {resource.author && (
          <p className="text-xs text-gray-400 mb-3">来源：{resource.author}</p>
        )}

        {/* 评分 */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.floor(resource.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">{resource.rating.toFixed(1)}</span>
        </div>

        {/* 操作区域 */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              isHovered
                ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            查看详情
          </button>

          <button
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
              isHovered
                ? 'border-primary-200 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-600 hover:border-primary-200 hover:text-primary-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            立即使用
          </button>

          <button
            onClick={handleFavorite}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
              isFavorite
                ? 'bg-red-50 text-red-500'
                : 'text-gray-400 hover:text-red-400 hover:bg-red-50'
            }`}
            title={isFavorite ? '取消收藏' : '收藏'}
          >
            <motion.span
              animate={heartAnimating ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              <Heart className={`w-[18px] h-[18px] ${isFavorite ? 'fill-current' : ''}`} />
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResourceLibrary() {
  const { toggleFavorite, isFavorite } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredResources = useMemo(() => {
    let result = [...mockResources];

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (selectedSubject) {
      result = result.filter((r) => r.subject === selectedSubject);
    }

    if (selectedGradeLevel) {
      const levelGrades = grades.filter((g) => g.level === selectedGradeLevel).map((g) => g.id);
      result = result.filter((r) => levelGrades.includes(r.grade));
    }

    if (selectedType) {
      result = result.filter((r) => r.type === selectedType);
    }

    switch (sortBy) {
      case 'usage':
        result.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
        break;
      default:
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return result;
  }, [debouncedSearch, selectedSubject, selectedGradeLevel, selectedType, sortBy]);

  const displayedResources = filteredResources.slice(0, displayCount);
  const hasMore = displayCount < filteredResources.length;

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + 6);
      setIsLoadingMore(false);
    }, 800);
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedGradeLevel('');
    setSelectedType('');
    setSortBy('latest');
    setDisplayCount(8);
  };

  const activeFilterCount = [selectedSubject, selectedGradeLevel, selectedType].filter(Boolean).length;

  return (
    <div ref={scrollRef} className="min-h-screen">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 pt-10 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm mb-5">
              <Sparkles className="w-4 h-4" />
              <span>精选优质教学资源</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              教学资源库
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto">
              涵盖课件模板、教案范例、练习题库等多种类型，助力每一堂课都精彩
            </p>
          </motion.div>
        </div>
      </div>

      {/* 筛选栏 - 粘性定位 */}
      <div className="sticky top-16 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索课件、教案、练习题..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200 placeholder:text-gray-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 筛选条件行 */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
            {/* 学科筛选 */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-500 font-medium mr-1 hidden sm:inline">学科：</span>
              <button
                onClick={() => setSelectedSubject('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  !selectedSubject
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() =>
                    setSelectedSubject(selectedSubject === subject.id ? '' : subject.id)
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${
                    selectedSubject === subject.id
                      ? 'text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={
                    selectedSubject === subject.id
                      ? { backgroundColor: subject.color }
                      : {}
                  }
                >
                  <span>{subject.icon}</span> {subject.name}
                </button>
              ))}
            </div>

            <div className="hidden lg:block w-px h-6 bg-gray-200" />

            {/* 年级 / 类型 / 排序 */}
            <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:justify-end">
              {/* 年级筛选 */}
              <select
                value={selectedGradeLevel}
                onChange={(e) => setSelectedGradeLevel(e.target.value)}
                className="px-3 py-1.5 pr-8 rounded-lg text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 outline-none cursor-pointer hover:bg-gray-100 focus:ring-2 focus:ring-primary-500/30 transition-all appearance-none bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 8px center',
                }}
              >
                {gradeLevels.map((gl) => (
                  <option key={gl.value || 'all'} value={gl.value}>
                    {gl.label}
                  </option>
                ))}
              </select>

              {/* 类型筛选 */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setSelectedType('')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    !selectedType
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部类型
                </button>
                {(Object.entries(typeConfig) as [ResourceType, typeof typeConfig.courseware][]).map(
                  ([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedType(selectedType === key ? '' : key)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                        selectedType === key
                          ? 'text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={
                        selectedType === key ? { backgroundColor: config.color } : {}
                      }
                    >
                      {config.icon} {config.label.replace(/课件|教案|练习|解析|脚本/g, '')}
                    </button>
                  )
                )}
              </div>

              {/* 排序方式 */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      showSortDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                            sortBy === option.value
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* 活跃筛选提示 */}
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-xs"
            >
              <Filter className="w-3.5 h-3.5 text-primary-500" />
              <span className="text-gray-500">
                当前有{' '}
                <span className="font-semibold text-primary-600">{activeFilterCount}</span>{' '}
                个筛选项生效 · 共{' '}
                <span className="font-semibold text-primary-600">{filteredResources.length}</span>{' '}
                条结果
              </span>
              <button
                onClick={handleResetFilters}
                className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
              >
                重置全部
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          /* 骨架屏 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          /* 空状态 */
          <EmptyState onReset={handleResetFilters} />
        ) : (
          <>
            {/* 资源网格 */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {displayedResources.map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    index={index}
                    isFavorite={isFavorite(resource.id)}
                    onToggleFavorite={() =>
                      toggleFavorite({
                        type: resource.type as 'lesson' | 'exercise' | 'script' | 'analysis',
                        title: resource.title,
                        subjectId: resource.subject,
                        gradeId: resource.grade,
                        content: '',
                      })
                    }
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* 加载更多 */}
            <div className="mt-10 flex flex-col items-center">
              {hasMore ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-primary-300 hover:text-primary-600 hover:shadow-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    <>加载更多</>
                  )}
                </motion.button>
              ) : filteredResources.length > 8 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-gray-400 text-sm"
                >
                  <ArrowUp className="w-4 h-4" />
                  已经到底啦~
                </motion.div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
