import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Sparkles,
  FileText,
  CheckSquare,
  AlignLeft,
  Calculator,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Download,
  Printer,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  BookOpen,
  Target,
  Layers,
  Settings2,
  Loader2,
  Copy,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { subjects } from '@/data/mock/subjects';
import { grades } from '@/data/mock/grades';
import { generateExercises, type ExerciseSet, type Exercise } from '@/data/services/aiService';
import { exportToWord, exportToPDF } from '@/data/services/exportService';
import { useAppStore } from '@/store/useAppStore';

type QuestionType = 'choice' | 'fill-in-the-blank' | 'short-answer' | 'calculation';
type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface ExerciseConfig {
  subjectId: string;
  gradeId: string;
  topic: string;
  types: QuestionType[];
  count: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  advancedOptions: {
    includeAnswer: boolean;
    includeKnowledgeTag: boolean;
    mixTypes: boolean;
    avoidDuplicate: boolean;
  };
}

interface ExtendedExercise extends Exercise {
  index: number;
  showAnswer: boolean;
  isEditing: boolean;
  editedQuestion?: string;
  editedAnswer?: string;
  selected: boolean;
  isDeleting: boolean;
}

const QUESTION_TYPE_CONFIG: Record<QuestionType, { label: string; icon: React.ReactNode; color: string; bgColor: string; serviceType: 'choice' | 'fill' | 'essay' }> = {
  choice: {
    label: '选择题',
    icon: <FileText className="w-4 h-4" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    serviceType: 'choice',
  },
  'fill-in-the-blank': {
    label: '填空题',
    icon: <CheckSquare className="w-4 h-4" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    serviceType: 'fill',
  },
  'short-answer': {
    label: '简答题',
    icon: <AlignLeft className="w-4 h-4" />,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50 border-violet-200',
    serviceType: 'essay',
  },
  calculation: {
    label: '计算题',
    icon: <Calculator className="w-4 h-4" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    serviceType: 'essay',
  },
};

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; emoji: string; borderColor: string; badgeColor: string; textColor: string }> = {
  easy: { label: '简单', emoji: '🟢', borderColor: 'border-l-green-500', badgeColor: 'bg-green-100 text-green-700', textColor: 'text-green-600' },
  medium: { label: '中等', emoji: '🟡', borderColor: 'border-l-yellow-500', badgeColor: 'bg-yellow-100 text-yellow-700', textColor: 'text-yellow-600' },
  hard: { label: '困难', emoji: '🔴', borderColor: 'border-l-red-500', badgeColor: 'bg-red-100 text-red-700', textColor: 'text-red-600' },
};

const DEFAULT_CONFIG: ExerciseConfig = {
  subjectId: 'math',
  gradeId: 'grade-9',
  topic: '',
  types: ['choice'],
  count: 10,
  difficultyDistribution: { easy: 30, medium: 50, hard: 20 },
  advancedOptions: {
    includeAnswer: true,
    includeKnowledgeTag: true,
    mixTypes: false,
    avoidDuplicate: false,
  },
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function mapTypeToService(types: QuestionType[], mixTypes: boolean): 'choice' | 'fill' | 'essay' | 'mixed' {
  if (mixTypes || types.length > 1) return 'mixed';
  const serviceType = QUESTION_TYPE_CONFIG[types[0]]?.serviceType;
  return serviceType || 'choice';
}

function getDifficultyForIndex(index: number, total: number, dist: ExerciseConfig['difficultyDistribution']): DifficultyLevel {
  const easyCount = Math.round((dist.easy / 100) * total);
  const mediumCount = Math.round((dist.medium / 100) * total);
  if (index < easyCount) return 'easy';
  if (index < easyCount + mediumCount) return 'medium';
  return 'hard';
}

const EXERCISE_SESSION_KEY = 'exercise-workshop-session';

function loadExerciseSession(): { config: ExerciseConfig; exerciseSet: ExerciseSet | null } | null {
  try {
    const saved = localStorage.getItem(EXERCISE_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveExerciseSession(data: { config: ExerciseConfig; exerciseSet: ExerciseSet | null }) {
  try {
    localStorage.setItem(EXERCISE_SESSION_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export default function ExerciseWorkshop() {
  const session = useRef(loadExerciseSession());
  const { addNotification, addToHistory } = useAppStore();
  const [config, setConfig] = useState<ExerciseConfig>(session.current?.config || DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [exerciseSet, setExerciseSet] = useState<ExerciseSet | null>(session.current?.exerciseSet || null);
  const [exercises, setExercises] = useState<ExtendedExercise[]>(() => {
    if (!session.current?.exerciseSet) return [];
    const { config: savedConfig } = session.current;
    return session.current.exerciseSet.exercises.map((ex, i) => {
      let displayType = ex.type;
      if (!savedConfig.advancedOptions.mixTypes && savedConfig.types.length === 1) {
        const serviceType = QUESTION_TYPE_CONFIG[savedConfig.types[0]].serviceType;
        displayType = serviceType as Exercise['type'];
      }
      const difficulty = getDifficultyForIndex(i, session.current!.exerciseSet!.exercises.length, savedConfig.difficultyDistribution);
      return { ...ex, type: displayType, difficulty, index: i, showAnswer: false, isEditing: false, selected: false, isDeleting: false };
    });
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // 会话持久化
  useEffect(() => {
    saveExerciseSession({ config, exerciseSet });
  }, [config, exerciseSet]);

  const updateConfig = useCallback(<K extends keyof ExerciseConfig>(key: K, value: ExerciseConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateNestedConfig = useCallback(
    <K1 extends keyof ExerciseConfig, K2 extends keyof ExerciseConfig[K1]>(
      key1: K1,
      key2: K2,
      value: ExerciseConfig[K1][K2]
    ) => {
      setConfig(prev => ({
        ...prev,
        [key1]: { ...(prev[key1] as object), [key2]: value },
      }));
    },
    []
  );

  const toggleType = useCallback((type: QuestionType) => {
    setConfig(prev => {
      const types = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      return { ...prev, types: types.length === 0 ? prev.types : types };
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!config.topic.trim()) {
      addNotification({ type: 'warning', title: '请输入知识点/课题名称' });
      return;
    }
    if (config.types.length === 0) {
      addNotification({ type: 'warning', title: '请至少选择一种题型' });
      return;
    }

    setIsGenerating(true);
    setGenerateProgress(0);

    const progressInterval = setInterval(() => {
      setGenerateProgress(prev => Math.min(prev + Math.random() * 15 + 5, 90));
    }, 300);

    try {
      const exerciseType = mapTypeToService(config.types, config.advancedOptions.mixTypes);
      const result = await generateExercises({
        subjectId: config.subjectId,
        gradeId: config.gradeId,
        topic: config.topic,
        difficulty: 'medium',
        count: config.count,
        exerciseType,
      });

      clearInterval(progressInterval);
      setGenerateProgress(100);

      const mappedExercises: ExtendedExercise[] = result.exercises.map((ex, i) => {
        let displayType: Exercise['type'] = ex.type;
        if (!config.advancedOptions.mixTypes && config.types.length === 1) {
          const serviceType = QUESTION_TYPE_CONFIG[config.types[0]].serviceType;
          displayType = serviceType as Exercise['type'];
        }
        const difficulty = getDifficultyForIndex(i, result.exercises.length, config.difficultyDistribution);
        return {
          ...ex,
          type: displayType,
          difficulty,
          index: i,
          showAnswer: false,
          isEditing: false,
          selected: false,
          isDeleting: false,
        };
      });

      setExerciseSet(result);
      setExercises(mappedExercises);
      setSelectAll(false);

      addNotification({
        type: 'success',
        title: '练习题生成完成',
        message: `成功生成 ${result.exercises.length} 道练习题`,
      });

      addToHistory({
        type: 'exercise',
        title: `${config.topic} - 练习题集`,
        subjectId: config.subjectId,
        gradeId: config.gradeId,
        content: `生成 ${result.exercises.length} 道练习题`,
      });

      setTimeout(() => {
        setIsGenerating(false);
        setGenerateProgress(0);
      }, 500);
    } catch {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerateProgress(0);
      addNotification({ type: 'error', title: '生成失败，请重试' });
    }
  }, [config, addNotification, addToHistory]);

  const toggleShowAnswer = useCallback((index: number) => {
    setExercises(prev =>
      prev.map(ex => (ex.index === index ? { ...ex, showAnswer: !ex.showAnswer } : ex))
    );
  }, []);

  const toggleEdit = useCallback((index: number) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.index !== index) return ex;
        if (ex.isEditing) {
          return {
            ...ex,
            isEditing: false,
            question: ex.editedQuestion ?? ex.question,
            answer: ex.editedAnswer ?? ex.answer,
            editedQuestion: undefined,
            editedAnswer: undefined,
          };
        }
        return { ...ex, isEditing: true, editedQuestion: ex.question, editedAnswer: ex.answer };
      })
    );
  }, []);

  const handleDelete = useCallback((index: number) => {
    setExercises(prev =>
      prev.map(ex => (ex.index === index ? { ...ex, isDeleting: true } : ex))
    );
    setTimeout(() => {
      setExercises(prev => prev.filter(ex => ex.index !== index));
    }, 300);
  }, []);

  const toggleSelect = useCallback((index: number) => {
    setExercises(prev =>
      prev.map(ex => (ex.index === index ? { ...ex, selected: !ex.selected } : ex))
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setExercises(prev => prev.map(ex => ({ ...ex, selected: newValue })));
  }, [selectAll]);

  const handleBatchExport = useCallback(
    async (format: 'word' | 'pdf') => {
      if (!exerciseSet) return;
      const selectedExercises = exercises.filter(ex => ex.selected);
      const exportData: ExerciseSet = {
        ...exerciseSet,
        exercises: selectedExercises.length > 0 ? selectedExercises.map(({ id, question, type, options, answer, explanation, difficulty }) => ({ id, question, type, options, answer, explanation, difficulty })) : exercises.map(({ id, question, type, options, answer, explanation, difficulty }) => ({ id, question, type, options, answer, explanation, difficulty })),
      };

      try {
        if (format === 'word') {
          await exportToWord(exportData);
        } else {
          await exportToPDF(exportData);
        }
        addNotification({
          type: 'success',
          title: `已导出 ${format.toUpperCase()} 文件`,
        });
      } catch {
        addNotification({ type: 'error', title: '导出失败，请重试' });
      }
    },
    [exerciseSet, exercises, addNotification]
  );

  const handleBatchPrint = useCallback(() => {
    window.print();
  }, []);

  const handleRegenerate = useCallback(async () => {
    await handleGenerate();
  }, [handleGenerate]);

  const stats = useMemo(() => {
    const total = exercises.length;
    const easy = exercises.filter(e => e.difficulty === 'easy').length;
    const medium = exercises.filter(e => e.difficulty === 'medium').length;
    const hard = exercises.filter(e => e.difficulty === 'hard').length;
    return { total, easy, medium, hard };
  }, [exercises]);

  const selectedCount = useMemo(() => exercises.filter(e => e.selected).length, [exercises]);

  const difficultyTotal = config.difficultyDistribution.easy + config.difficultyDistribution.medium + config.difficultyDistribution.hard;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-200">
            <PenTool className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">课堂练习工坊</h1>
            <p className="text-base text-gray-500 mt-1">智能出题与练习管理，一键生成高质量练习</p>
          </div>
        </div>
      </motion.div>

      {/* ===== 配置面板 ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden mb-8"
      >
        <div className="p-6 lg:p-8 space-y-6">
          {/* 基础配置 */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              <BookOpen className="w-4 h-4 text-primary-500" />
              基础配置
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">学科选择</label>
                <select
                  value={config.subjectId}
                  onChange={e => updateConfig('subjectId', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">年级选择</label>
                <select
                  value={config.gradeId}
                  onChange={e => updateConfig('gradeId', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">知识点 / 课题</label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={e => updateConfig('topic', e.target.value)}
                  placeholder="如：一元二次方程、牛顿运动定律..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* 题目设置 */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              <Target className="w-4 h-4 text-primary-500" />
              题目设置
            </h3>

            {/* 题型选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-3">题型选择（可多选）</label>
              <div className="flex flex-wrap gap-3">
                {(Object.keys(QUESTION_TYPE_CONFIG) as QuestionType[]).map(type => {
                  const tc = QUESTION_TYPE_CONFIG[type];
                  const isActive = config.types.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={cn(
                        'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-medium text-sm transition-all duration-200',
                        isActive
                          ? `${tc.bgColor} ${tc.color} border-current shadow-sm scale-[1.02]`
                          : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50 hover:border-gray-300'
                      )}
                    >
                      {tc.icon}
                      {tc.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 题目数量 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-600">题目数量</label>
                <span className="text-lg font-bold text-primary-600">{config.count} 题</span>
              </div>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={config.count}
                onChange={e => updateConfig('count', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 题</span>
                <span>20 题</span>
              </div>
            </div>

            {/* 难度分布 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-600">难度分布</label>
                <span className={cn('text-xs font-medium', difficultyTotal === 100 ? 'text-green-600' : 'text-orange-500')}>
                  总计: {difficultyTotal}% {difficultyTotal !== 100 && '(需为100%)'}
                </span>
              </div>
              <div className="space-y-4">
                {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map(level => {
                  const dc = DIFFICULTY_CONFIG[level];
                  const value = config.difficultyDistribution[level];
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          <span>{dc.emoji}</span> {dc.label}
                        </span>
                        <span className={cn('text-sm font-semibold tabular-nums', dc.textColor)}>{value}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={value}
                        onChange={e =>
                          updateNestedConfig('difficultyDistribution', level, parseInt(e.target.value))
                        }
                        className={cn(
                          'w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white',
                          level === 'easy'
                            ? 'bg-green-200 accent-green-500 [&::-webkit-slider-thumb]:bg-green-500'
                            : level === 'medium'
                              ? 'bg-yellow-200 accent-yellow-500 [&::-webkit-slider-thumb]:bg-yellow-500'
                              : 'bg-red-200 accent-red-500 [&::-webkit-slider-thumb]:bg-red-500'
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 高级选项（可折叠） */}
          <div className="border-t border-gray-100 pt-6">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              高级选项
              {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {advancedOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pt-4">
                    {[
                      {
                        key: 'includeAnswer' as const,
                        label: '包含答案解析',
                        desc: '生成时附带详细解析',
                      },
                      {
                        key: 'includeKnowledgeTag' as const,
                        label: '包含知识点标注',
                        desc: '标注每道题考查的知识点',
                      },
                      {
                        key: 'mixTypes' as const,
                        label: '混合题型',
                        desc: '自动混合已选择的题型',
                      },
                      {
                        key: 'avoidDuplicate' as const,
                        label: '避免重复',
                        desc: '基于历史记录避免重复出题',
                      },
                    ].map(opt => (
                      <label
                        key={opt.key}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            checked={config.advancedOptions[opt.key]}
                            onChange={e =>
                              updateNestedConfig('advancedOptions', opt.key, e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center">
                            {config.advancedOptions[opt.key] && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{opt.label}</span>
                          <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 生成按钮区域 */}
        <div className="px-6 lg:px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-100">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              'w-full relative group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 shadow-lg',
              isGenerating
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 via-primary-600 to-teal-500 hover:shadow-button hover:scale-[1.01] active:scale-[0.99]'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>AI 正在出题中...</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-400 to-teal-400"
                    style={{ width: `${generateProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>生成练习题</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* ===== 结果展示区 ===== */}
      <AnimatePresence mode="wait">
        {!exerciseSet || exercises.length === 0 ? (
          /* 空状态 */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-card border border-gray-100 p-16 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-primary-50 to-teal-50 mb-8 relative">
                <ClipboardList className="w-14 h-14 text-primary-400" />
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary-200 animate-pulse-soft" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">快来生成第一批练习题吧！</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                在上方配置好学科、年级、知识点和题型后，点击「生成练习题」按钮，AI 将为你智能生成高质量的课堂练习。
              </p>
              <button
                onClick={() => {
                  document.querySelector<HTMLInputElement>('input[placeholder*="一元二次方程"]')?.focus();
                  document.querySelector<HTMLDivElement>('[class*="overflow-hidden"]')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                开始配置
              </button>
            </div>
          </motion.div>
        ) : (
          /* 题目列表 */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* 工具栏 */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* 统计信息 */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span className="font-semibold text-gray-800">
                    共生成 <span className="text-primary-600 text-lg">{stats.total}</span> 道题
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-green-600">
                    🟢 简单 {stats.easy} 道
                  </span>
                  <span className="text-yellow-600">
                    🟡 中等 {stats.medium} 道
                  </span>
                  <span className="text-red-600">
                    🔴 困难 {stats.hard} 道
                  </span>
                </div>

                {/* 批量操作 */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {selectAll ? <X className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                    {selectAll ? '取消全选' : '全选'}
                  </button>

                  <button
                    onClick={() => handleBatchExport('word')}
                    disabled={selectedCount === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    导出 Word
                  </button>

                  <button
                    onClick={() => handleBatchExport('pdf')}
                    disabled={selectedCount === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    导出 PDF
                  </button>

                  <button
                    onClick={handleBatchPrint}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    打印
                  </button>

                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    重新生成
                  </button>
                </div>
              </div>
            </div>

            {/* 题目卡片列表 */}
            <div className="space-y-4">
              <AnimatePresence>
                {exercises.map((exercise, displayIndex) => {
                  const typeKey = (Object.entries(QUESTION_TYPE_CONFIG).find(
                    ([, cfg]) => cfg.serviceType === exercise.type
                  )?.[0] ?? 'choice') as QuestionType;
                  const typeConfig = QUESTION_TYPE_CONFIG[typeKey];
                  const diffConfig = DIFFICULTY_CONFIG[exercise.difficulty];

                  return (
                    <motion.div
                      key={exercise.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{
                        opacity: exercise.isDeleting ? 0 : 1,
                        y: exercise.isDeleting ? -10 : 0,
                        scale: exercise.isDeleting ? 0.95 : 1,
                      }}
                      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                      transition={{
                        duration: exercise.isDeleting ? 0.3 : 0.4,
                        delay: exercise.isDeleting ? 0 : displayIndex * 0.06,
                        layout: { duration: 0.3 },
                      }}
                      className={cn(
                        'group relative bg-white rounded-2xl shadow-card border-l-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover',
                        diffConfig.borderColor
                      )}
                    >
                      {/* 卡片头部 */}
                      <div className="p-5 lg:p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border',
                                typeConfig.bgColor,
                                typeConfig.color
                              )}
                            >
                              {typeConfig.icon}
                              {typeConfig.label}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                                diffConfig.badgeColor
                              )}
                            >
                              {diffConfig.emoji} {diffConfig.label}
                            </span>
                            <span className="text-sm font-bold text-gray-400 ml-2">
                              第 {displayIndex + 1} 题
                            </span>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleSelect(exercise.index)}
                              className={cn(
                                'p-2 rounded-lg transition-colors',
                                exercise.selected ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-400'
                              )}
                              title={exercise.selected ? '取消选择' : '选择'}
                            >
                              <CheckSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* 题目内容 */}
                        {exercise.isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              defaultValue={exercise.editedQuestion ?? exercise.question}
                              onChange={e =>
                                setExercises(prev =>
                                  prev.map(ex =>
                                    ex.index === exercise.index
                                      ? { ...ex, editedQuestion: e.target.value }
                                      : ex
                                  )
                                )
                              }
                              className="w-full p-4 rounded-xl border-2 border-primary-300 bg-primary-50/50 text-gray-800 resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary-400"
                              rows={3}
                            />
                            {exercise.type === 'choice' && exercise.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {exercise.options.map((opt, oi) => (
                                  <div
                                    key={oi}
                                    className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700"
                                  >
                                    {OPTION_LABELS[oi]}. {opt}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-800 leading-relaxed text-[15px] font-medium mb-4">
                              {exercise.question}
                            </p>

                            {/* 选择题选项 */}
                            {exercise.type === 'choice' && exercise.options && (
                              <div className="space-y-2 ml-2">
                                {exercise.options.map((opt, oi) => (
                                  <div
                                    key={oi}
                                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors"
                                  >
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-xs font-bold text-gray-500">
                                      {OPTION_LABELS[oi]}
                                    </span>
                                    <span className="text-sm text-gray-700 leading-relaxed pt-0.5">{opt}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => toggleShowAnswer(exercise.index)}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                              exercise.showAnswer
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                          >
                            {exercise.showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {exercise.showAnswer ? '隐藏答案' : '显示答案'}
                          </button>

                          <button
                            onClick={() => toggleEdit(exercise.index)}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                              exercise.isEditing
                                ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                          >
                            <Edit3 className="w-4 h-4" />
                            {exercise.isEditing ? '保存修改' : '编辑'}
                          </button>

                          <button
                            onClick={() => handleDelete(exercise.index)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </button>
                        </div>
                      </div>

                      {/* 答案解析展开区 */}
                      <AnimatePresence initial={false}>
                        {exercise.showAnswer && (
                          <motion.div
                            key={`answer-${exercise.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 lg:px-6 pb-5 lg:pb-6 pt-2">
                              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 space-y-3">
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">✅</span>
                                  <div>
                                    <span className="font-semibold text-emerald-700">正确答案：</span>
                                    <span className="text-gray-800 font-medium">{exercise.answer}</span>
                                  </div>
                                </div>

                                {config.advancedOptions.includeAnswer && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">📝</span>
                                    <div>
                                      <span className="font-semibold text-blue-700">解析：</span>
                                      <span className="text-gray-600 text-sm leading-relaxed">{exercise.explanation}</span>
                                    </div>
                                  </div>
                                )}

                                {config.advancedOptions.includeKnowledgeTag && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">💡</span>
                                    <div>
                                      <span className="font-semibold text-purple-700">考查知识点：</span>
                                      <span className="text-gray-600 text-sm">
                                        {config.topic}核心概念、相关定理与应用
                                      </span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-start gap-2">
                                  <span className="text-lg">⏱️</span>
                                  <div>
                                    <span className="font-semibold text-orange-700">建议用时：</span>
                                    <span className="text-gray-600 text-sm">
                                      {exercise.difficulty === 'easy' ? '1-2分钟' : exercise.difficulty === 'medium' ? '2-3分钟' : '3-5分钟'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
