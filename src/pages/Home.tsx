import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  BookOpen,
  Brain,
  PenTool,
  MessageSquare,
  Clock,
  Star,
  Trash2,
  Edit3,
  Sparkles,
  ArrowRight,
  BookMarked,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const features = [
  {
    icon: BookOpen,
    title: '智能备课',
    description: 'AI 一键生成完整教学方案，包含教学目标、重难点、教学过程等',
    color: 'primary',
    gradient: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-50',
    textColor: 'text-primary-600',
    path: '/lesson-generator',
  },
  {
    icon: Brain,
    title: '重难点拆解',
    description: '智能分析知识点难度，提供分层教学策略和个性化讲解方案',
    color: 'secondary',
    gradient: 'from-secondary-500 to-secondary-600',
    bgColor: 'bg-secondary-50',
    textColor: 'text-secondary-600',
    path: '/difficulty-analyzer',
  },
  {
    icon: PenTool,
    title: '课堂练习',
    description: '自动生成针对性练习题，支持多种题型和难度等级调整',
    color: 'success',
    gradient: 'from-success-500 to-success-600',
    bgColor: 'bg-success-50',
    textColor: 'text-success-600',
    path: '/exercise-workshop',
  },
  {
    icon: MessageSquare,
    title: '讲解脚本',
    description: '生成逐字稿式的课堂讲解脚本，帮助教师流畅授课',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    path: '/script-generator',
  },
];

const dailyRecommendations = [
  {
    id: 1,
    title: '分数的初步认识',
    subject: '数学',
    grade: '三年级',
    description: '通过生活实例引入分数概念，帮助学生理解部分与整体的关系',
    gradient: 'from-blue-400 to-cyan-400',
    path: '/lesson-generator',
  },
  {
    id: 2,
    title: '古诗词鉴赏：静夜思',
    subject: '语文',
    grade: '一年级',
    description: '引导学生感受古诗意境，培养语感和审美能力',
    gradient: 'from-emerald-400 to-teal-400',
    path: '/lesson-generator',
  },
  {
    id: 3,
    title: '植物的光合作用',
    subject: '科学',
    grade: '五年级',
    description: '用实验和图示解释光合作用原理，激发学生探究兴趣',
    gradient: 'from-orange-400 to-amber-400',
    path: '/lesson-generator',
  },
];

const typeIcons: Record<string, React.ElementType> = {
  lesson: BookOpen,
  exercise: PenTool,
  script: MessageSquare,
  analysis: Brain,
};

const typeLabels: Record<string, string> = {
  lesson: '备课',
  exercise: '练习',
  script: '脚本',
  analysis: '分析',
};

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN');
}

function FloatingBubble({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/10 backdrop-blur-sm"
      style={{
        width: size,
        height: size,
        left,
        top,
      }}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
      }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay * 0.5,
      }}
    />
  );
}

function HeroSection({ onScrollToFeatures }: { onScrollToFeatures: () => void }) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500" />

      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <FloatingBubble delay={0} size={120} left="10%" top="20%" />
      <FloatingBubble delay={1} size={80} left="80%" top="15%" />
      <FloatingBubble delay={2} size={60} left="15%" top="70%" />
      <FloatingBubble delay={3} size={100} left="75%" top="65%" />
      <FloatingBubble delay={1.5} size={40} left="50%" top="30%" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI 驱动的智能教学平台</span>
          </motion.div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
            让每一堂课都精彩
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            AI 赋能乡村教育，让备课更轻松
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate('/lesson-generator')}
              className="group inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <BookOpen className="w-5 h-5" />
              立即开始备课
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onScrollToFeatures}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/30 hover:bg-white/25 hover:scale-105 transition-all duration-300"
            >
              探索更多功能
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hidden lg:block absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-white/70"
          >
            <span className="text-sm">向下滚动</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const navigate = useNavigate();
  const IconComponent = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={() => navigate(feature.path)}
      className="group cursor-pointer bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100"
    >
      <div
        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.bgColor} ${feature.textColor} mb-5 group-hover:rotate-6 transition-transform duration-300`}
      >
        <IconComponent className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
        {feature.title}
      </h3>

      <p className="text-gray-500 leading-relaxed text-sm line-clamp-2">{feature.description}</p>

      <div className="mt-5 flex items-center gap-2 text-primary-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span>立即使用</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

function FeaturesSection({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  return (
    <section ref={ref} className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 mb-6">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">核心功能</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            四大智能模块，覆盖教学全流程，助力乡村教育质量提升
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentHistoryItem({
  item,
}: {
  item: {
    id: string;
    type: 'lesson' | 'exercise' | 'script' | 'analysis';
    title: string;
    createdAt: string;
  };
}) {
  const navigate = useNavigate();
  const { removeFromHistory, toggleFavorite, isFavorite } = useAppStore();
  const IconComponent = typeIcons[item.type] || BookOpen;
  const favorited = isFavorite(item.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="group flex items-start gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50 text-primary-600">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            {typeLabels[item.type]}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getRelativeTime(item.createdAt)}
          </span>
        </div>
        <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/${item.type === 'lesson' ? 'lesson-generator' : item.type === 'exercise' ? 'exercise-workshop' : item.type === 'script' ? 'script-generator' : 'difficulty-analyzer'}`);
          }}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="重新编辑"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite({
              type: item.type,
              title: item.title,
              subjectId: '',
              gradeId: '',
              content: '',
            });
          }}
          className={`p-2 rounded-lg transition-colors ${
            favorited ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
          title={favorited ? '取消收藏' : '收藏'}
        >
          <Star className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeFromHistory(item.id);
          }}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function RecentHistorySection() {
  const { recentHistory } = useAppStore();
  const displayItems = recentHistory.slice(0, 5);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary-100 text-secondary-600">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">最近使用</h2>
          </div>
          {displayItems.length > 0 && (
            <span className="text-sm text-gray-500">最近 {displayItems.length} 条记录</span>
          )}
        </motion.div>

        {displayItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <BookMarked className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无使用记录</h3>
            <p className="text-gray-500 mb-6">开始使用 AI 功能后，您的操作记录将显示在这里</p>
            <button
              onClick={() => window.location.href = '/lesson-generator'}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              开始第一次备课
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-3">
            {displayItems.map((item) => (
              <RecentHistoryItem key={item.id} item={item} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function RecommendationCard({
  item,
  index,
}: {
  item: (typeof dailyRecommendations)[0];
  index: number;
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100"
    >
      <div className={`h-32 bg-gradient-to-br ${item.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Lightbulb className="w-12 h-12 text-white/30" />
        </div>
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            {item.subject}
          </span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            {item.grade}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-2">{item.description}</p>

        <button
          onClick={() => navigate(item.path)}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary-50 text-primary-600 px-4 py-3 rounded-xl font-medium hover:bg-primary-100 hover:scale-[1.02] transition-all duration-300"
        >
          立即使用
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function DailyRecommendationsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 mb-6">
            <Lightbulb className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">每日推荐</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            精选优质教学内容，为您的课堂注入新灵感
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dailyRecommendations.map((item, index) => (
            <RecommendationCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      <HeroSection onScrollToFeatures={scrollToFeatures} />
      <FeaturesSection ref={featuresRef} />
      <RecentHistorySection />
      <DailyRecommendationsSection />
    </div>
  );
}
