import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, BookOpen, GraduationCap, Tag, Palette,
  MessageSquare, Play, Check, Copy, ChevronDown, ChevronRight,
  Plus, X, FileDown, Printer, RefreshCw, ClipboardList,
  Lightbulb, MessageCircle, PenTool, Target, Sparkles,
  AlertCircle, Mic, StickyNote, ArrowRight, Volume2
} from 'lucide-react';
import { generateScript, type TeachingScript, type ScriptSection } from '../data/services/aiService';
import { exportService } from '../data/services/exportService';
import { subjects } from '../data/mock/subjects';
import { grades } from '../data/mock/grades';

type TeachingStyle = 'formal' | 'storytelling' | 'interactive' | 'simple';

interface FormData {
  topic: string;
  duration: number;
  subjectId: string;
  gradeId: string;
  keyPoints: string[];
  style: TeachingStyle;
  specialRequirements: string;
}

interface SpeechModule {
  id: string;
  title: string;
  duration: string;
  content: string;
  questions?: string[];
  tips?: string;
  used: boolean;
  note: string;
  expanded: boolean;
}

interface SectionDetail {
  id: string;
  phaseName: string;
  duration: number;
  color: string;
  icon: string;
  modules: SpeechModule[];
  expanded: boolean;
}

const DURATION_OPTIONS = [
  { value: 40, label: '40 分钟' },
  { value: 45, label: '45 分钟' },
  { value: 90, label: '90 分钟' },
];

const STYLE_OPTIONS: { value: TeachingStyle; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'formal',
    label: '正式讲授',
    desc: '语言规范专业，结构严谨完整',
    icon: <GraduationCap className="w-5 h-5" />
  },
  {
    value: 'storytelling',
    label: '故事化教学',
    desc: '情节生动有趣，通俗易懂',
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    value: 'interactive',
    label: '互动探究',
    desc: '多设问引导，鼓励参与发言',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    value: 'simple',
    label: '简洁明了',
    desc: '突出重点，简化表述',
    icon: <Target className="w-5 h-5" />
  },
];

const PHASE_CONFIG = [
  { key: 'intro', name: '课程导入', baseRatio: 0.12, color: '#10b981', icon: '🚀', lightBg: 'bg-emerald-50', borderColor: 'border-l-emerald-500' },
  { key: 'teach', name: '新知讲授', baseRatio: 0.45, color: '#3b82f6', icon: '📖', lightBg: 'bg-blue-50', borderColor: 'border-l-blue-500' },
  { key: 'practice', name: '课堂练习', baseRatio: 0.25, color: '#f59e0b', icon: '✏️', lightBg: 'bg-amber-50', borderColor: 'border-l-amber-500' },
  { key: 'summary', name: '总结归纳', baseRatio: 0.18, color: '#8b5cf6', icon: '📝', lightBg: 'bg-violet-50', borderColor: 'border-l-violet-500' },
];

function buildSectionDetails(sections: ScriptSection[], totalDuration: number): SectionDetail[] {
  const mapped: SectionDetail[] = sections.map((sec, idx) => {
    const config = PHASE_CONFIG[idx] || PHASE_CONFIG[PHASE_CONFIG.length - 1];
    const modules = parseSectionContent(sec.phase, sec.content, sec.duration, sec.notes);
    return {
      id: `section-${idx}`,
      phaseName: sec.phase.replace(/（\d+分钟）/, '').trim(),
      duration: sec.duration,
      color: config.color,
      icon: config.icon,
      lightBg: config.lightBg,
      borderColor: config.borderColor,
      modules,
      expanded: idx === 0,
    };
  });
  return mapped;
}

function parseSectionContent(phase: string, content: string, duration: number, notes?: string): SpeechModule[] {
  const lines = content.split('\n').filter(l => l.trim());
  const modules: SpeechModule[] = [];
  let currentTitle = '';
  let currentContent: string[] = [];
  let currentQuestions: string[] = [];

  const flushModule = () => {
    if (currentTitle || currentContent.length > 0) {
      const fullContent = currentContent.join('\n').trim();
      const modDuration = Math.max(1, Math.round(duration / 3));
      modules.push({
        id: `mod-${modules.length}-${Date.now()}`,
        title: currentTitle || '讲解内容',
        duration: `${modDuration}分钟`,
        content: fullContent || content,
        questions: currentQuestions.length > 0 ? currentQuestions : undefined,
        tips: notes,
        used: false,
        note: '',
        expanded: modules.length === 0,
      });
    }
    currentTitle = '';
    currentContent = [];
    currentQuestions = [];
  };

  for (const line of lines) {
    if (line.startsWith('【') && line.includes('】')) {
      flushModule();
      currentTitle = line.replace(/【|】/g, '');
      continue;
    }
    if (line.match(/^\d+\./) || line.match(/^[-*]/)) {
      currentQuestions.push(line.trim());
    } else {
      currentContent.push(line);
    }
  }
  flushModule();

  if (modules.length === 0) {
    modules.push({
      id: `mod-0-${Date.now()}`,
      title: phase.replace(/（\d+分钟）/, '').trim(),
      content,
      duration: `${duration}分钟`,
      tips: notes,
      used: false,
      note: '',
      expanded: true,
    });
  }

  return modules;
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
      {tags.map(tag => (
        <motion.span
          key={tag}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
        >
          {tag}
          <button onClick={() => removeTag(tag)} className="hover:bg-primary-200 rounded-full p-0.5 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
        placeholder="输入后按回车添加..."
        className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
      />
      {input.trim() && (
        <button onClick={addTag} className="p-1 hover:bg-primary-100 rounded-full text-primary-600 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function TimelineHeader({ script, totalDuration, subjectLabel, gradeLabel }: {
  script: TeachingScript; totalDuration: number; subjectLabel: string; gradeLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">课堂讲解脚本</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: <Clock className="w-5 h-5" />, label: '总时长', value: `${totalDuration} 分钟` },
            { icon: <BookOpen className="w-5 h-5" />, label: '学科', value: subjectLabel },
            { icon: <GraduationCap className="w-5 h-5" />, label: '年级', value: gradeLabel },
            { icon: <PenTool className="w-5 h-5" />, label: '主题', value: script.topic },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
            >
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <p className="font-semibold text-base truncate">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TimelineBar({ sections, activeIndex, onNavigate }: {
  sections: SectionDetail[]; activeIndex: number; onNavigate: (idx: number) => void;
}) {
  const totalDuration = sections.reduce((s, sec) => s + sec.duration, 0);
  let accumulated = 0;
  const nodes = sections.map((sec, i) => {
    const start = accumulated;
    accumulated += sec.duration;
    const percent = (start / totalDuration) * 100;
    return { ...sec, index: i, positionPercent: percent };
  });

  return (
    <div className="hidden lg:block my-8">
      <div className="relative py-8">
        <div className="relative h-14 mx-8">
          <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="timelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <line x1="0" y1="28" x2="100%" y2="28" stroke="url(#timelineGrad)" strokeWidth="4" strokeLinecap="round" />
          </svg>

          {nodes.map((node, i) => (
            <motion.button
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * i, type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => onNavigate(i)}
              className={`absolute top-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-125 ${i === activeIndex ? 'scale-125' : ''}`}
              style={{ left: `${node.positionPercent}%` }}
            >
              <div
                className={`w-5 h-5 rounded-full border-3 shadow-lg transition-all ${
                  i === activeIndex
                    ? 'ring-4 ring-white/40 scale-125'
                    : 'group-hover:ring-2 group-hover:ring-white/30'
                }`}
                style={{ backgroundColor: node.color, borderColor: node.color }}
              />
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
                  {node.phaseName} ({node.duration}min)
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-between mt-2 mx-8 px-2">
          {nodes.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 * i + 0.3 }}
              className={`text-center cursor-pointer transition-colors ${i === activeIndex ? 'font-semibold' : ''}`}
              onClick={() => onNavigate(i)}
              style={{ maxWidth: `${100 / nodes.length}%`, position: 'absolute', left: `${node.positionPercent}%`, transform: 'translateX(-50%)' }}
            >
              <span className={`text-xs ${i === activeIndex ? 'text-gray-900' : 'text-gray-500'}`}>
                {node.icon} {node.phaseName}
              </span>
              <span className={`block text-[10px] mt-0.5 ${i === activeIndex ? node.color : 'text-gray-400'}`}>
                {node.duration}min
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineVertical({ sections, activeIndex, onNavigate }: {
  sections: SectionDetail[]; activeIndex: number; onNavigate: (idx: number) => void;
}) {
  return (
    <div className="lg:hidden my-6">
      <div className="relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-amber-500 to-violet-500" />

        {sections.map((sec, i) => (
          <motion.button
            key={sec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            onClick={() => onNavigate(i)}
            className={`relative flex items-center gap-3 py-3 w-full text-left transition-all hover:bg-gray-50 rounded-r-xl pr-3 ${
              i === activeIndex ? 'bg-gray-50' : ''
            }`}
          >
            <div
              className={`absolute left-[-23px] w-4 h-4 rounded-full border-2 shadow-sm transition-all z-10 ${
                i === activeIndex ? 'scale-125 ring-2 ring-offset-2' : ''
              }`}
              style={{
                backgroundColor: i === activeIndex ? sec.color : 'white',
                borderColor: sec.color,
                ...(i === activeIndex ? { '--tw-ring-color': sec.color } as React.CSSProperties : {}),
              }}
            />
            <span className="text-base">{sec.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${i === activeIndex ? 'text-gray-900' : 'text-gray-600'}`}>
                {sec.phaseName}
              </p>
              <p className="text-xs text-gray-400">{sec.duration} 分钟</p>
            </div>
            {i === activeIndex && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function SpeechModuleCard({ module: mod, onToggle, onCopy, onUsedChange, onNoteChange }: {
  module: SpeechModule;
  onToggle: () => void;
  onCopy: () => void;
  onUsedChange: (used: boolean) => void;
  onNoteChange: (note: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border transition-all duration-300 ${mod.expanded ? 'bg-white shadow-md border-gray-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          mod.expanded ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
        }`}>
          <Play className={`w-4 h-4 transition-transform ${mod.expanded ? '' : '-rotate-90'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium text-sm ${mod.used ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              【{mod.title}】
            </h4>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{mod.duration}</span>
          </div>
          {!mod.expanded && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{mod.content.slice(0, 60)}...</p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${mod.expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {mod.expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-gray-100">
              <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${mod.used ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {mod.content}
                </p>

                {mod.questions && mod.questions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {mod.questions.map((q, qi) => (
                      <div key={qi} className="flex items-start gap-2 text-sm text-primary-700 bg-primary-50 rounded-lg p-2.5">
                        <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                )}

                {mod.tips && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-2.5">
                    <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{mod.tips}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={mod.used}
                    onChange={e => onUsedChange(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                    已使用
                  </span>
                </label>

                <button
                  onClick={handleCopy}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '已复制' : '复制'}
                </button>

                <div className="relative group/note">
                  <StickyNote className="w-4 h-4 text-gray-400 cursor-pointer hover:text-amber-500 transition-colors" />
                  <input
                    value={mod.note}
                    onChange={e => onNoteChange(e.target.value)}
                    placeholder="添加备注..."
                    className="absolute right-0 top-6 w-48 opacity-0 group-focus-within/note:opacity-100 group-hover/note:opacity-100 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-200 shadow-lg transition-opacity z-10"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionCard({ section, isActive, onToggle, onModuleUpdate, sectionRef }: {
  section: SectionDetail;
  isActive: boolean;
  onToggle: () => void;
  onModuleUpdate: (moduleId: string, updates: Partial<SpeechModule>) => void;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const totalDuration = section.modules.reduce((s, m) => s + parseInt(m.duration) || 0, 0);
  const usedCount = section.modules.filter(m => m.used).length;

  return (
    <div ref={sectionRef as React.Ref<HTMLDivElement>} id={section.id}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover ${
          isActive ? 'ring-2 ring-primary-200' : ''
        }`}
      >
        <div className={`border-l-4 ${section.borderColor}`}>
          <button
            onClick={onToggle}
            className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors"
          >
            <div
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: `${section.color}15` }}
            >
              {section.icon}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-gray-900">{section.phaseName}</h3>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: section.color }}
                >
                  {section.duration} 分钟
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                <span>{section.modules.length} 个话术模块</span>
                <span className="text-gray-300">|</span>
                <span>已使用 {usedCount}/{section.modules.length}</span>
                {usedCount === section.modules.length && usedCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="w-3.5 h-3.5" /> 全部完成
                  </span>
                )}
              </div>
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: section.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(usedCount / Math.max(section.modules.length, 1)) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${section.expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {section.expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-3">
                {section.modules.map(mod => (
                  <SpeechModuleCard
                    key={mod.id}
                    module={mod}
                    onToggle={() => onModuleUpdate(mod.id, { expanded: !mod.expanded })}
                    onCopy={() => navigator.clipboard.writeText(mod.content)}
                    onUsedChange={(used) => onModuleUpdate(mod.id, { used })}
                    onNoteChange={(note) => onModuleUpdate(mod.id, { note })}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function ScriptGenerator() {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    duration: 45,
    subjectId: '',
    gradeId: '',
    keyPoints: [],
    style: 'interactive',
    specialRequirements: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [script, setScript] = useState<TeachingScript | null>(null);
  const [sections, setSections] = useState<SectionDetail[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [customDuration, setCustomDuration] = useState('');
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateForm = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) return;

    setIsGenerating(true);
    setProgress(0);
    setScript(null);
    setSections([]);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 200);

    try {
      const result = await generateScript({
        subjectId: formData.subjectId || 'math',
        gradeId: formData.gradeId || 'grade-8',
        topic: formData.topic,
        style: formData.style,
        duration: formData.duration,
      });

      clearInterval(progressInterval);
      setProgress(100);

      await new Promise(r => setTimeout(r, 400));
      setScript(result);
      const details = buildSectionDetails(result.sections, formData.duration);
      setSections(details);
      setIsGenerating(false);
      setProgress(0);
    } catch {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const toggleSection = (idx: number) => {
    setSections(prev => prev.map((s, i) =>
      i === idx ? { ...s, expanded: !s.expanded } : s
    ));
  };

  const updateModule = (sectionIdx: number, moduleId: string, updates: Partial<SpeechModule>) => {
    setSections(prev => prev.map((s, si) =>
      si === sectionIdx
        ? {
            ...s,
            modules: s.modules.map(m =>
              m.id === moduleId ? { ...m, ...updates } : m
            ),
          }
        : s
    ));
  };

  const navigateToSection = (idx: number) => {
    setActiveSectionIndex(idx);
    if (!sections[idx]?.expanded) {
      toggleSection(idx);
    }
    const el = sectionRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const copyAllScript = async () => {
    if (!script) return;
    const allText = sections.map(sec =>
      `【${sec.phaseName}】(${sec.duration}分钟)\n${sec.modules.map(m => m.content).join('\n\n')}`
    ).join('\n\n---\n\n');
    await navigator.clipboard.writeText(allText);
  };

  const handleExportWord = () => {
    if (script) exportService.exportToWord(script);
  };

  const handleExportPDF = () => {
    if (script) exportService.exportToPDF(script);
  };

  const handlePrint = () => {
    if (!script) return;
    const printContent = `
      <html><head><title>${script.title}</title>
      <style>
        body{font-family:'Noto Sans SC',sans-serif;padding:40px;color:#333;line-height:1.8;}
        h1{text-align:center;border-bottom:2px solid #333;padding-bottom:12px;}
        h2{color:#2c3e50;margin-top:24px;border-left:4px solid #3b82f6;padding-left:12px;}
        .phase{margin:16px 0;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #eee;}
        .content{white-space:pre-wrap;text-indent:2em;}
        .meta{text-align:center;color:#666;margin-bottom:20px;}
      </style></head><body>
      <h1>${script.title}</h1>
      <div class="meta">${script.style} | 总时长 ${sections.reduce((s, x) => s + x.duration, 0)}分钟</div>
      ${sections.map(s => `<h2>${s.icon} ${s.phaseName} (${s.duration}分钟)</h2>` +
        s.modules.map(m => `<div class="phase"><strong>【${m.title}】</strong><div class="content">${m.content}</div></div>`).join('')
      ).join('')}
      </body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(printContent); win.document.close(); win.print(); }
  };

  const subjectLabel = subjects.find(s => s.id === formData.subjectId)?.name || formData.subjectId;
  const gradeLabel = grades.find(g => g.id === formData.gradeId)?.name || formData.gradeId;

  const actualDuration = customDuration ? parseInt(customDuration) || formData.duration : formData.duration;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">讲解脚本生成器</h1>
            <p className="text-gray-500 text-sm md:text-base mt-0.5">AI 智能生成课堂话术，让每一句话都精准到位</p>
          </div>
        </div>
      </motion.div>

      {/* 输入表单区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-white rounded-2xl shadow-card p-6 md:p-8 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-bold text-gray-800">课程信息配置</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
              <PenTool className="w-4 h-4 text-primary-500" /> 课程主题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={e => updateForm('topic', e.target.value)}
              placeholder="例如：一元二次方程的解法"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 text-primary-500" /> 总时长
              </label>
              <select
                value={customDuration ? 'custom' : String(formData.duration)}
                onChange={e => {
                  if (e.target.value === 'custom') {
                    setCustomDuration('');
                  } else {
                    setCustomDuration('');
                    updateForm('duration', Number(e.target.value));
                  }
                }}
                className="select-field"
              >
                {DURATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
                <option value="custom">自定义时长</option>
              </select>
              {customDuration !== '' && (
                <input
                  type="number"
                  value={customDuration}
                  onChange={e => setCustomDuration(e.target.value)}
                  placeholder="输入分钟数"
                  className="input-field mt-2"
                  min="1"
                  max="180"
                />
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 text-primary-500" /> 学科
              </label>
              <select
                value={formData.subjectId}
                onChange={e => updateForm('subjectId', e.target.value)}
                className="select-field"
              >
                <option value="">选择学科</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 text-primary-500" /> 年级
              </label>
              <select
                value={formData.gradeId}
                onChange={e => updateForm('gradeId', e.target.value)}
                className="select-field"
              >
                <option value="">选择年级</option>
                {grades.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 text-primary-500" /> 教学风格
              </label>
              <select
                value={formData.style}
                onChange={e => updateForm('style', e.target.value as TeachingStyle)}
                className="select-field"
              >
                {STYLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 text-primary-500" /> 关键知识点
            </label>
            <TagInput
              tags={formData.keyPoints}
              onChange={tags => updateForm('keyPoints', tags)}
            />
            <p className="text-xs text-gray-400 mt-1.5">添加本节课的核心知识点标签，帮助 AI 更精准地生成内容</p>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 text-primary-500" /> 特殊需求
              <span className="text-xs font-normal text-gray-400">(可选)</span>
            </label>
            <textarea
              value={formData.specialRequirements}
              onChange={e => updateForm('specialRequirements', e.target.value)}
              placeholder="例如：需要增加互动环节、需要准备过渡语、需要融入生活实例..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={!formData.topic.trim() || isGenerating}
            className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-initial px-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                正在组织课堂语言... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                生成讲解脚本
              </>
            )}
          </button>

          {isGenerating && (
            <div className="flex-1">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 结果展示区 */}
      <AnimatePresence>
        {script && sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 头部信息 */}
            <TimelineHeader
              script={script}
              totalDuration={actualDuration}
              subjectLabel={subjectLabel}
              gradeLabel={gradeLabel}
            />

            {/* 时间轴 */}
            <TimelineBar
              sections={sections}
              activeIndex={activeSectionIndex}
              onNavigate={navigateToSection}
            />
            <TimelineVertical
              sections={sections}
              activeIndex={activeSectionIndex}
              onNavigate={navigateToSection}
            />

            {/* 环节详情 */}
            <div className="space-y-6 mt-6">
              {sections.map((section, idx) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  isActive={idx === activeSectionIndex}
                  onToggle={() => toggleSection(idx)}
                  onModuleUpdate={(moduleId, updates) => updateModule(idx, moduleId, updates)}
                  sectionRef={{ current: null }}
                />
              ))}
            </div>

            {/* 底部工具栏 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 sticky bottom-4 z-30"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {[
                    { icon: <FileDown className="w-4 h-4" />, label: '导出 Word', action: handleExportWord, color: 'hover:bg-blue-50 hover:text-blue-600' },
                    { icon: <FileDown className="w-4 h-4" />, label: '导出 PDF', action: handleExportPDF, color: 'hover:bg-red-50 hover:text-red-600' },
                    { icon: <Printer className="w-4 h-4" />, label: '打印脚本', action: handlePrint, color: 'hover:bg-purple-50 hover:text-purple-600' },
                    { icon: <ClipboardList className="w-4 h-4" />, label: '复制全部', action: copyAllScript, color: 'hover:bg-green-50 hover:text-green-600' },
                    { icon: <RefreshCw className="w-4 h-4" />, label: '重新生成', action: () => { setScript(null); setSections([]); }, color: 'hover:bg-amber-50 hover:text-amber-600' },
                  ].map(btn => (
                    <button
                      key={btn.label}
                      onClick={btn.action}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 transition-all ${btn.color} active:scale-95`}
                    >
                      {btn.icon}
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
