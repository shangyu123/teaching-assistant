import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Target,
  Settings,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileText,
  Download,
  Printer,
  Copy,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookMarked,
  Clock,
  Users,
  Lightbulb,
  AlertCircle,
  FileDown,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { aiService, type LessonPlan } from '@/data/services/aiService';
import { exportService } from '@/data/services/exportService';
import { subjects } from '@/data/mock/subjects';
import { grades } from '@/data/mock/grades';

type TeachingStyle = 'formal' | 'storytelling' | 'interactive' | 'simple';
type StudentLevel = 'beginner' | 'intermediate' | 'advanced';

interface FormData {
  topic: string;
  subjectId: string;
  gradeId: string;
  objectives: string;
  duration: number;
  customDuration: number;
  keyPoints: string;
  style: TeachingStyle;
  studentLevel: StudentLevel;
  includeExercises: boolean;
  includeInteraction: boolean;
  includeBoardDesign: boolean;
}

interface TreeNode {
  id: string;
  label: string;
  icon: string;
  children?: TreeNode[];
}

const teachingStyles = [
  {
    value: 'formal' as TeachingStyle,
    icon: '📖',
    label: '正式讲授型',
    desc: '严谨系统',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
  },
  {
    value: 'storytelling' as TeachingStyle,
    icon: '🎨',
    label: '故事化教学',
    desc: '生动有趣',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
  },
  {
    value: 'interactive' as TeachingStyle,
    icon: '🔬',
    label: '互动探究型',
    desc: '启发思考',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
  },
  {
    value: 'simple' as TeachingStyle,
    icon: '✨',
    label: '简洁明了型',
    desc: '直击要点',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
  },
];

const studentLevels = [
  { value: 'beginner' as StudentLevel, label: '初级', desc: '基础薄弱，需要更多引导', icon: '🌱' },
  { value: 'intermediate' as StudentLevel, label: '中级', desc: '有一定基础，可适度拓展', icon: '🌿' },
  { value: 'advanced' as StudentLevel, label: '高级', desc: '基础扎实，适合深度探究', icon: '🌳' },
];

const durationOptions = [
  { value: 45, label: '45分钟' },
  { value: 90, label: '90分钟' },
  { value: 0, label: '自定义' },
];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="flex gap-3">
        <div className="h-10 bg-gray-200 rounded-lg flex-1" />
        <div className="h-10 bg-gray-200 rounded-lg flex-1" />
      </div>
    </div>
  );
}

function StepIndicator({
  currentStep,
  totalSteps,
  completedSteps,
}: {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
}) {
  const steps = [
    { num: 1, label: '基本信息', icon: BookOpen },
    { num: 2, label: '教学目标', icon: Target },
    { num: 3, label: '参数配置', icon: Settings },
  ];

  return (
    <>
      <div className="hidden md:flex items-center justify-center mb-10">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: currentStep === step.num ? 1.1 : 1,
                  backgroundColor:
                    currentStep === step.num
                      ? '#3b82f6'
                      : completedSteps.has(step.num)
                        ? '#10b981'
                        : '#e5e7eb',
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md transition-colors`}
              >
                {completedSteps.has(step.num) && currentStep !== step.num ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </motion.div>
              <span
                className={`mt-2 text-sm font-medium ${
                  currentStep === step.num ? 'text-primary-600' : completedSteps.has(step.num) ? 'text-success-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-20 sm:w-28 h-1 mx-3 rounded-full transition-colors ${
                  completedSteps.has(step.num) ? 'bg-success-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="md:hidden flex items-center justify-between mb-6 px-2">
        {steps.map((step) => (
          <div key={step.num} className="flex flex-col items-center">
            <motion.div
              animate={{
                scale: currentStep === step.num ? 1.15 : 1,
                backgroundColor:
                  currentStep === step.num
                    ? '#3b82f6'
                    : completedSteps.has(step.num)
                      ? '#10b981'
                      : '#e5e7eb',
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            >
              {completedSteps.has(step.num) && currentStep !== step.num ? (
                <Check className="w-5 h-5" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
            </motion.div>
            <span
              className={`mt-1 text-xs font-medium ${
                currentStep === step.num ? 'text-primary-600' : completedSteps.has(step.num) ? 'text-success-600' : 'text-gray-400'
              }`}
            >
              第{step.num}步
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function BasicInfoStep({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | number | boolean) => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.topic.trim()) newErrors.topic = '请输入课题名称';
    if (!formData.subjectId) newErrors.subjectId = '请选择学科';
    if (!formData.gradeId) newErrors.gradeId = '请选择年级';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = () => validate();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">基本信息</h2>
        <p className="text-gray-500 mt-1">填写课程的基本信息，为智能生成提供基础</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            课题名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => onChange('topic', e.target.value)}
            onBlur={handleBlur}
            placeholder="例如：一元二次方程的解法、古诗词鉴赏等"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
              errors.topic ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 focus:border-primary-400'
            }`}
          />
          {errors.topic && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.topic}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              学科选择 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => onChange('subjectId', e.target.value)}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none bg-white ${
                errors.subjectId ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 focus:border-primary-400'
              }`}
            >
              <option value="">请选择学科</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name} - {s.description}
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.subjectId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              年级选择 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gradeId}
              onChange={(e) => onChange('gradeId', e.target.value)}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none bg-white ${
                errors.gradeId ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 focus:border-primary-400'
              }`}
            >
              <option value="">请选择年级</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({getGradeLevelLabel(g.level)})
                </option>
              ))}
            </select>
            {errors.gradeId && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.gradeId}
              </p>
            )}
          </div>
        </div>

        {formData.subjectId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-xl bg-primary-50 border border-primary-100"
          >
            <p className="text-sm text-primary-700">
              已选学科：<strong>{subjects.find((s) => s.id === formData.subjectId)?.icon} {subjects.find((s) => s.id === formData.subjectId)?.name}</strong>
              {' · '}
              年级：<strong>{grades.find((g) => g.id === formData.gradeId)?.name}</strong>
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function getGradeLevelLabel(level: string): string {
  const labels: Record<string, string> = { primary: '小学', junior: '初中', senior: '高中' };
  return labels[level] || '';
}

function TeachingObjectivesStep({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | number | boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-600 mb-4">
          <Target className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">教学目标</h2>
        <p className="text-gray-500 mt-1">设定本节课的教学目标和重难点</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">教学目标</label>
          <textarea
            value={formData.objectives}
            onChange={(e) => onChange('objectives', e.target.value)}
            rows={5}
            placeholder="例如：&#10;1. 学生能够理解一元二次方程的定义和基本性质&#10;2. 掌握因式分解法和公式法求解一元二次方程&#10;3. 能够运用所学知识解决实际问题"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-secondary-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 resize-none transition-all"
          />
          <p className="mt-1.5 text-xs text-gray-400">详细描述本节课希望学生达成的学习目标</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" /> 课时长度
          </label>
          <div className="grid grid-cols-3 gap-3">
            {durationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onChange(
                    'duration',
                    opt.value === 0 ? formData.customDuration || 45 : opt.value,
                  )
                }
                className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                  (opt.value === 0
                    ? formData.duration !== 45 && formData.duration !== 90
                    : formData.duration === opt.value)
                    ? 'border-secondary-400 bg-secondary-50 text-secondary-700 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {(formData.duration !== 45 && formData.duration !== 90) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3"
            >
              <input
                type="number"
                min={10}
                max={180}
                value={formData.customDuration || formData.duration}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 45;
                  onChange('customDuration', val);
                  onChange('duration', val);
                }}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-secondary-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30"
                placeholder="输入自定义时长（分钟）"
              />
            </motion.div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Lightbulb className="w-4 h-4 inline mr-1" /> 重点难点 <span className="font-normal text-gray-400">(可选)</span>
          </label>
          <textarea
            value={formData.keyPoints}
            onChange={(e) => onChange('keyPoints', e.target.value)}
            rows={3}
            placeholder="例如：&#10;重点：一元二次方程的求根公式及其推导过程&#10;难点：根据方程特点选择合适的解法"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-secondary-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 resize-none transition-all"
          />
        </div>
      </div>
    </motion.div>
  );
}

function ParameterConfigStep({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | number | boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success-100 text-success-600 mb-4">
          <Settings className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">参数配置</h2>
        <p className="text-gray-500 mt-1">调整生成参数，获得更符合需求的教学方案</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">教学风格</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {teachingStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => onChange('style', style.value)}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  formData.style === style.value
                    ? `${style.borderColor} ${style.bgColor} shadow-md`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">{style.icon}</div>
                <div className={`font-semibold text-sm ${formData.style === style.value ? style.textColor : 'text-gray-800'}`}>
                  {style.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{style.desc}</div>
                {formData.style === style.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <Users className="w-4 h-4 inline mr-1" /> 学生水平
          </label>
          <div className="grid grid-cols-3 gap-3">
            {studentLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => onChange('studentLevel', level.value)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  formData.studentLevel === level.value
                    ? 'border-primary-400 bg-primary-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">{level.icon}</div>
                <div className={`font-semibold text-sm ${formData.studentLevel === level.value ? 'text-primary-700' : 'text-gray-800'}`}>
                  {level.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">附加选项</label>
          <div className="space-y-3">
            {[
              { key: 'includeExercises' as const, label: '包含课堂练习', desc: '自动生成配套练习题' },
              { key: 'includeInteraction' as const, label: '包含互动环节', desc: '添加师生互动设计' },
              { key: 'includeBoardDesign' as const, label: '提供板书设计', desc: '生成板书布局建议' },
            ].map((opt) => (
              <label
                key={opt.key}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData[opt.key]
                    ? 'border-primary-300 bg-primary-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData[opt.key]}
                  onChange={(e) => onChange(opt.key, e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <div>
                  <div className="font-medium text-gray-800">{opt.label}</div>
                  <div className="text-sm text-gray-500">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DirectoryTree({
  nodes,
  activeId,
  onSelect,
  expandedNodes,
  onToggleExpand,
}: {
  nodes: TreeNode[];
  activeId: string;
  onSelect: (id: string) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <li key={node.id}>
          <button
            onClick={() => {
              if (node.children?.length) {
                onToggleExpand(node.id);
              }
              onSelect(node.id);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${
              activeId === node.id
                ? 'bg-primary-100 text-primary-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {node.children?.length ? (
              expandedNodes.has(node.id) ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )
            ) : (
              <span className="w-4" />
            )}
            <span>{node.icon}</span>
            <span className="truncate">{node.label}</span>
          </button>
          <AnimatePresence>
            {node.children?.length && expandedNodes.has(node.id) && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-4 pl-3 border-l-2 border-gray-200 space-y-1 overflow-hidden"
              >
                {node.children.map((child) => (
                  <li key={child.id}>
                    <button
                      onClick={() => onSelect(child.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                        activeId === child.id
                          ? 'bg-primary-100 text-primary-700 font-semibold'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <span className="w-4" />
                      <span>{child.icon}</span>
                      <span className="truncate">{child.label}</span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      ))}
    </ul>
  );
}

function ResultDisplay({ lessonPlan, onBack }: { lessonPlan: LessonPlan; onBack: () => void }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['overview', 'process']));
  const [copied, setCopied] = useState(false);
  const contentRef = useCallback<(node: HTMLDivElement | null) => void>(() => {}, []);

  const subject = subjects.find((s) => s.id === lessonPlan.subjectId);
  const grade = grades.find((g) => g.id === lessonPlan.gradeId);

  const treeData: TreeNode[] = [
    {
      id: 'overview',
      label: '教学概览',
      icon: '📋',
      children: [
        { id: 'info', label: '课程信息', icon: '📝' },
        { id: 'objectives', label: '教学目标', icon: '🎯' },
      ],
    },
    {
      id: 'process',
      label: '教学过程',
      icon: '📚',
      children: [
        ...lessonPlan.content.mainContent.map((section, i) => ({
          id: `section-${i}`,
          label: `${['一', '二', '三', '四'][i] || String(i + 1)}、${section.title} (${section.duration}分钟)`,
          icon: ['🔍', '📖', '✏️', '🎯'][i] || '📌',
        })),
        { id: 'summary', label: '总结归纳', icon: '💡' },
      ],
    },
    { id: 'homework', label: '作业布置', icon: '📚' },
    { id: 'methods', label: '教学方法与资源', icon: '🛠️' },
  ];

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyAll = async () => {
    const textContent = `
${lessonPlan.title}

【课程信息】
学科：${subject?.name || lessonPlan.subjectId}
年级：${grade?.name || lessonPlan.gradeId}
课时：${lessonPlan.duration}分钟
课题：${lessonPlan.topic}

【教学目标】
${lessonPlan.objectives.map((o) => `- ${o}`).join('\n')}

【教学过程】
${lessonPlan.content.mainContent.map((s, i) => `${i + 1}. ${s.title}（${s.duration}分钟）\n${s.content}`).join('\n\n')}

【课堂小结】
${lessonPlan.content.summary}

【课后作业】
${lessonPlan.content.homework}

【教学方法】
${lessonPlan.teachingMethods.join('、')}

【教学资源】
${lessonPlan.resources.join('、')}
    `.trim();

    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'info':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              📝 课程信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-sm text-gray-500">学科</div>
                <div className="font-semibold text-gray-900 mt-1">
                  {subject?.icon} {subject?.name}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-sm text-gray-500">年级</div>
                <div className="font-semibold text-gray-900 mt-1">{grade?.name}</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-sm text-gray-500">课时</div>
                <div className="font-semibold text-gray-900 mt-1">{lessonPlan.duration} 分钟</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-sm text-gray-500">课题</div>
                <div className="font-semibold text-gray-900 mt-1 truncate">{lessonPlan.topic}</div>
              </div>
            </div>
          </div>
        );

      case 'objectives':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              🎯 教学目标
            </h3>
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200">
              <ul className="space-y-3">
                {lessonPlan.objectives.map((obj, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-800 leading-relaxed">{obj}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              💡 总结归纳
            </h3>
            <div className="p-5 rounded-xl bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{lessonPlan.content.summary}</p>
            </div>
          </div>
        );

      case 'homework':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              📚 作业布置
            </h3>
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
              <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                {lessonPlan.content.homework}
              </pre>
            </div>
          </div>
        );

      case 'methods':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              🛠️ 教学方法与资源
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-3">教学方法</h4>
                <div className="flex flex-wrap gap-2">
                  {lessonPlan.teachingMethods.map((m, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white rounded-lg text-sm text-blue-700 border border-blue-200 shadow-sm">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl bg-green-50 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-3">教学资源</h4>
                <div className="flex flex-wrap gap-2">
                  {lessonPlan.resources.map((r, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white rounded-lg text-sm text-green-700 border border-green-200 shadow-sm">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        if (activeSection.startsWith('section-')) {
          const index = parseInt(activeSection.split('-')[1]);
          const section = lessonPlan.content.mainContent[index];
          if (!section) return null;

          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {section.duration} 分钟
                </span>
              </div>
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{section.content}</p>
              </div>
              {section.keyPoints && section.keyPoints.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    💡 要点提示
                  </h4>
                  <ul className="space-y-1.5">
                    {section.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                        <span className="text-amber-500 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 mx-auto text-primary-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{lessonPlan.title}</h3>
              <p className="text-gray-500">请从左侧目录选择要查看的内容</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 print:block">
      <div className="lg:w-72 flex-shrink-0 print:hidden">
        <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 px-2 text-sm">📑 目录导航</h3>
          <DirectoryTree
            nodes={treeData}
            activeId={activeSection}
            onSelect={setActiveSection}
            expandedNodes={expandedNodes}
            onToggleExpand={toggleExpand}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm print:border-0 print:shadow-none">
          <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm rounded-t-2xl print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-gray-900 truncate">{lessonPlan.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportService.exportToWord(lessonPlan)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                title="导出为 Word"
              >
                <FileDown className="w-4 h-4" />
                Word
              </button>
              <button
                onClick={() => exportService.exportToPDF(lessonPlan)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                title="导出为 PDF"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="复制全部"
              >
                <Copy className="w-4 h-4" />
                {copied ? '已复制' : '复制'}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="打印"
              >
                <Printer className="w-4 h-4" />
                打印
              </button>
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="返回修改"
              >
                <ArrowLeft className="w-4 h-4" />
                返回修改
              </button>
            </div>
          </div>

          <div ref={contentRef} className="p-6 lg:p-8 print:p-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LessonGenerator() {
  const { addToHistory, setLoading, addNotification } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    topic: '',
    subjectId: '',
    gradeId: '',
    objectives: '',
    duration: 45,
    customDuration: 45,
    keyPoints: '',
    style: 'formal',
    studentLevel: 'intermediate',
    includeExercises: true,
    includeInteraction: false,
    includeBoardDesign: false,
  });

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.topic.trim()) newErrors.topic = '请输入课题名称';
      if (!formData.subjectId) newErrors.subjectId = '请选择学科';
      if (!formData.gradeId) newErrors.gradeId = '请选择年级';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;

    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setDirection(1);
    setCurrentStep((prev) => prev + 1);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  };

  const handleGenerate = async () => {
    if (!validateStep(currentStep)) return;

    setIsGenerating(true);
    setLoading(true, '正在生成教学方案...');
    setGenerationProgress('分析教学需求...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setGenerationProgress('构建知识框架...');

      await new Promise((resolve) => setTimeout(resolve, 800));
      setGenerationProgress('生成教学内容...');

      const objectivesArray = formData.objectives
        .split('\n')
        .map((line) => line.replace(/^\d+[\.\、\s]*/, '').trim())
        .filter(Boolean);

      const plan = await aiService.generateLessonPlan({
        subjectId: formData.subjectId,
        gradeId: formData.gradeId,
        topic: formData.topic.trim(),
        duration: formData.duration,
        objectives: objectivesArray.length > 0 ? objectivesArray : undefined,
      });

      setGenerationProgress('优化输出格式...');
      await new Promise((resolve) => setTimeout(resolve, 400));

      setGeneratedPlan(plan);

      addToHistory({
        type: 'lesson',
        title: plan.title,
        subjectId: plan.subjectId,
        gradeId: plan.gradeId,
        content: plan.topic,
      });

      addNotification({
        type: 'success',
        title: '生成完成',
        message: `"${plan.title}" 已成功生成`,
      });
    } catch (err) {
      console.error(err);
      addNotification({
        type: 'error',
        title: '生成失败',
        message: err instanceof Error ? err.message : '未知错误，请稍后重试',
      });
    } finally {
      setIsGenerating(false);
      setLoading(false);
      setGenerationProgress('');
    }
  };

  const handleBackToEdit = () => {
    setGeneratedPlan(null);
    setCurrentStep(1);
    setCompletedSteps(new Set());
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-100 text-primary-600 mb-6"
          >
            <Loader2 className="w-10 h-10" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">AI 正在为您备课...</h2>
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary-500" />
            {generationProgress || '准备中...'}
          </p>
        </motion.div>

        <SkeletonCard />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (generatedPlan) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResultDisplay lessonPlan={generatedPlan} onBack={handleBackToEdit} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-6 shadow-lg">
          <BookOpen className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">AI 备课中心</h1>
        <p className="text-lg text-gray-500">智能生成完整课件教案，让备课更高效</p>
      </motion.div>

      <StepIndicator
        currentStep={currentStep}
        totalSteps={3}
        completedSteps={completedSteps}
      />

      <div className="relative overflow-hidden min-h-[420px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {currentStep === 1 && (
              <BasicInfoStep formData={formData} onChange={handleChange} />
            )}
            {currentStep === 2 && (
              <TeachingObjectivesStep formData={formData} onChange={handleChange} />
            )}
            {currentStep === 3 && (
              <ParameterConfigStep formData={formData} onChange={handleChange} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={goPrev}
          disabled={currentStep === 1}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            currentStep === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          上一步
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors ${
                step === currentStep
                  ? 'bg-primary-500'
                  : completedSteps.has(step)
                    ? 'bg-success-400'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {currentStep < 3 ? (
          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-primary-600 text-white hover:bg-primary-700 hover:shadow-button transition-all"
          >
            下一步
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!formData.topic || !formData.subjectId || !formData.gradeId}
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg transition-all ${
              !formData.topic || !formData.subjectId || !formData.gradeId
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-button hover:scale-[1.02]'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            开始生成
          </button>
        )}
      </div>
    </div>
  );
}
