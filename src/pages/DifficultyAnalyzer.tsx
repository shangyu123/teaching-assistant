import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Rocket,
  Brain,
  ChevronRight,
  Clock,
  Tag,
  History,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  Video,
  FileText,
  BookOpen as BookIcon,
  GraduationCap,
  Play,
  ArrowRight,
  X,
} from 'lucide-react';
import { aiService, type DifficultyAnalysis, type KnowledgeGraph, type KnowledgeNode } from '@/data/services/aiService';
import { subjects } from '@/data/mock/subjects';
import { grades } from '@/data/mock/grades';
import { useAppStore } from '@/store/useAppStore';

type DetailTab = 'concept' | 'examples' | 'mistakes' | 'advanced';

interface HistoryItem {
  id: string;
  topic: string;
  subjectId: string;
  timestamp: number;
}

const recommendedTags = [
  { text: '二次函数', subjectId: 'math' },
  { text: '古诗词鉴赏', subjectId: 'chinese' },
  { text: '牛顿运动定律', subjectId: 'physics' },
  { text: '氧化还原反应', subjectId: 'chemistry' },
  { text: '细胞分裂', subjectId: 'biology' },
  { text: '定语从句', subjectId: 'english' },
  { text: '工业革命', subjectId: 'history' },
  { text: '大气环流', subjectId: 'geography' },
  { text: '勾股定理', subjectId: 'math' },
  { text: '修辞手法', subjectId: 'chinese' },
  { text: '电磁感应', subjectId: 'physics' },
  { text: '光合作用', subjectId: 'biology' },
];

const tabConfig: Record<DetailTab, { label: string; icon: React.ElementType; color: string }> = {
  concept: { label: '概念解释', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
  examples: { label: '实例演示', icon: Lightbulb, color: 'from-emerald-500 to-emerald-600' },
  mistakes: { label: '易错点提醒', icon: AlertTriangle, color: 'from-orange-500 to-orange-600' },
  advanced: { label: '进阶应用', icon: Rocket, color: 'from-purple-500 to-purple-600' },
};

function getSubjectColor(subjectId: string): string {
  const subject = subjects.find((s) => s.id === subjectId);
  return subject?.color || '#3b82f6';
}

function getSubjectGradient(subjectId: string): string {
  const colorMap: Record<string, string> = {
    chinese: 'from-red-500 to-red-600',
    math: 'from-blue-500 to-blue-600',
    english: 'from-green-500 to-green-600',
    physics: 'from-purple-500 to-purple-600',
    chemistry: 'from-amber-500 to-amber-600',
    biology: 'from-teal-500 to-teal-600',
    history: 'from-orange-500 to-orange-600',
    geography: 'from-cyan-500 to-cyan-600',
  };
  return colorMap[subjectId] || 'from-primary-500 to-primary-600';
}

function getSubjectBgClass(subjectId: string): string {
  const colorMap: Record<string, string> = {
    chinese: 'bg-red-50 border-red-200',
    math: 'bg-blue-50 border-blue-200',
    english: 'bg-green-50 border-green-200',
    physics: 'bg-purple-50 border-purple-200',
    chemistry: 'bg-amber-50 border-amber-200',
    biology: 'bg-teal-50 border-teal-200',
    history: 'bg-orange-50 border-orange-200',
    geography: 'bg-cyan-50 border-cyan-200',
  };
  return colorMap[subjectId] || 'bg-primary-50 border-primary-200';
}

function getSubjectTextClass(subjectId: string): string {
  const colorMap: Record<string, string> = {
    chinese: 'text-red-600 bg-red-100',
    math: 'text-blue-600 bg-blue-100',
    english: 'text-green-600 bg-green-100',
    physics: 'text-purple-600 bg-purple-100',
    chemistry: 'text-amber-600 bg-amber-100',
    biology: 'text-teal-600 bg-teal-100',
    history: 'text-orange-600 bg-orange-100',
    geography: 'text-cyan-600 bg-cyan-100',
  };
  return colorMap[subjectId] || 'text-primary-600 bg-primary-100';
}

// ==================== 知识图谱可视化 ====================

interface LayoutNode {
  id: string;
  label: string;
  type: KnowledgeNode['type'];
  description?: string;
  x: number;
  y: number;
  ring: number;
  fx: number;
  fy: number;
}

const NODE_STYLE: Record<string, { fill: string; stroke: string; text: string; size: [number, number, number] }> = {
  core:           { fill: '#7C3AED', stroke: '#6D28D9', text: '#fff',  size: [64, 28, 15] },  // 紫
  'sub-concept':  { fill: '#DBEAFE', stroke: '#3B82F6', text: '#1E40AF', size: [56, 24, 13] },  // 蓝
  theorem:        { fill: '#E0E7FF', stroke: '#6366F1', text: '#3730A3', size: [52, 22, 12] },  // 靛
  case:           { fill: '#D1FAE5', stroke: '#10B981', text: '#065F46', size: [50, 22, 12] },  // 绿
  misconception:  { fill: '#FEE2E2', stroke: '#EF4444', text: '#991B1B', size: [50, 22, 12] },  // 红
};

const EDGE_STYLE: Record<string, { dash: string; color: string; width: number }> = {
  hierarchy:        { dash: '',           color: '#94A3B8', width: 2 },
  causal:           { dash: '',           color: '#F59E0B', width: 2 },
  analogy:          { dash: '6 3',        color: '#8B5CF6', width: 1.8 },
  contrast:         { dash: '4 4',        color: '#64748B', width: 1.8 },
  counterexample:   { dash: '5 3',        color: '#EF4444', width: 1.8 },
};

const TYPE_LABEL: Record<string, string> = {
  core: '核心概念', 'sub-concept': '子概念', theorem: '定理/公式', case: '案例', misconception: '误区/反例',
};

function computeLayout(graph: KnowledgeGraph): LayoutNode[] {
  const { nodes, edges } = graph;
  if (nodes.length === 0) return [];

  const core = nodes.find(n => n.type === 'core') || nodes[0];
  const layoutNodes: LayoutNode[] = [];
  const placed = new Set<string>();

  // Root
  layoutNodes.push({ ...core, x: 0, y: 0, ring: 0, fx: 0, fy: 0 });
  placed.add(core.id);

  // BFS: ring 1 = neighbors of root, ring 2 = neighbors of ring 1
  const ring1Ids = new Set<string>();
  const ring1Children = new Map<string, string[]>();

  for (const e of edges) {
    const other = e.source === core.id ? e.target : e.target === core.id ? e.source : null;
    if (other && !placed.has(other)) {
      ring1Ids.add(other);
      placed.add(other);
    }
  }

  // For each ring1 node, find its children (excluding root and other ring1)
  for (const rid of ring1Ids) {
    const children: string[] = [];
    for (const e of edges) {
      const other = e.source === rid ? e.target : e.target === rid ? e.source : null;
      if (other && !placed.has(other)) {
        children.push(other);
        placed.add(other);
      }
    }
    ring1Children.set(rid, children);
  }

  // Place ring 1 in a circle
  const r1Arr = [...ring1Ids];
  const r1Radius = 150;
  r1Arr.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / r1Arr.length - Math.PI / 2;
    const node = nodes.find(n => n.id === id)!;
    layoutNodes.push({
      ...node,
      x: r1Radius * Math.cos(angle),
      y: r1Radius * Math.sin(angle),
      ring: 1,
      fx: r1Radius * Math.cos(angle),
      fy: r1Radius * Math.sin(angle),
    });
  });

  // Place ring 2 children around their parent
  let ring2Idx = 0;
  for (const [parentId, childIds] of ring1Children) {
    const parent = layoutNodes.find(n => n.id === parentId);
    if (!parent) continue;
    const r2Radius = 85;
    childIds.forEach((cid) => {
      const spreadAngle = childIds.length === 1 ? 0 : Math.PI / 4;
      const baseAngle = Math.atan2(parent.y, parent.x);
      const angle = baseAngle + (childIds.length === 1 ? 0 : -spreadAngle / 2 + (spreadAngle * ring2Idx) / Math.max(childIds.length - 1, 1));
      ring2Idx++;
      const node = nodes.find(n => n.id === cid)!;
      layoutNodes.push({
        ...node,
        x: parent.x + r2Radius * Math.cos(angle),
        y: parent.y + r2Radius * Math.sin(angle),
        ring: 2,
        fx: parent.x + r2Radius * Math.cos(angle),
        fy: parent.y + r2Radius * Math.sin(angle),
      });
    });
  }

  // Remaining unplaced nodes
  const unplaced = nodes.filter(n => !layoutNodes.some(ln => ln.id === n.id));
  const outerRadius = 280;
  unplaced.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(unplaced.length, 1) - Math.PI / 2;
    layoutNodes.push({
      ...n,
      x: outerRadius * Math.cos(angle),
      y: outerRadius * Math.sin(angle),
      ring: 3,
      fx: outerRadius * Math.cos(angle),
      fy: outerRadius * Math.sin(angle),
    });
  });

  return layoutNodes;
}

function KnowledgeGraphView({
  graph,
  activeNode,
  onNodeClick,
}: {
  graph: KnowledgeGraph;
  activeNode: string | null;
  onNodeClick: (nodeId: string) => void;
}) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const layoutNodes = useMemo(() => computeLayout(graph), [graph]);

  // Compute bounding box
  const maxR = layoutNodes.reduce((m, n) => Math.max(m, Math.abs(n.x), Math.abs(n.y)), 200);
  const vb = Math.max(maxR + 100, 400);
  const cx = 0, cy = 10;

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center">
      <svg
        viewBox={`${cx - vb} ${cy - vb - 10} ${vb * 2} ${vb * 2 + 60}`}
        className="w-full h-full max-h-[580px]"
      >
        <defs>
          {Object.entries(NODE_STYLE).map(([type, s]) => (
            <filter key={type} id={`glow-${type}`}>
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
          <marker id="arrowhead" viewBox="0 0 10 7" refX="9" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94A3B8" />
          </marker>
        </defs>

        {/* Edges */}
        {graph.edges.map((edge) => {
          const source = layoutNodes.find(n => n.id === edge.source);
          const target = layoutNodes.find(n => n.id === edge.target);
          if (!source || !target) return null;
          const style = EDGE_STYLE[edge.type] || EDGE_STYLE.hierarchy;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          const nx = dist > 0 ? dx / dist : 0;
          const ny = dist > 0 ? dy / dist : 0;

          // Offset to node border
          const srcSize = NODE_STYLE[source.type]?.size || [50, 22, 12];
          const tgtSize = NODE_STYLE[target.type]?.size || [50, 22, 12];
          const sx = source.x + nx * (srcSize[0] / 2 + 4);
          const sy = source.y + ny * (srcSize[1] / 2 + 4);
          const tx = target.x - nx * (tgtSize[0] / 2 + 4);
          const ty = target.y - ny * (tgtSize[1] / 2 + 4);
          const labelDist = 0.55;
          const lx = source.x + dx * labelDist;
          const ly = source.y + dy * labelDist;

          return (
            <g key={edge.id}>
              <line
                x1={sx} y1={sy} x2={tx} y2={ty}
                stroke={style.color}
                strokeWidth={style.width}
                strokeDasharray={style.dash}
                strokeOpacity={0.7}
                markerEnd={edge.type === 'causal' ? 'url(#arrowhead)' : undefined}
              />
              {edge.label && (
                <g transform={`translate(${lx}, ${ly})`}>
                  <rect
                    x={-edge.label.length * 6 - 4} y={-9}
                    width={edge.label.length * 12 + 8} height={18}
                    rx={4}
                    fill="white"
                    fillOpacity="0.9"
                    stroke={style.color}
                    strokeWidth="0.5"
                  />
                  <text
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="10" fill={style.color} fontWeight="500"
                  >
                    {edge.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {layoutNodes.map((node, index) => {
          const s = NODE_STYLE[node.type] || NODE_STYLE['sub-concept'];
          const [w, h, fs] = s.size;
          const isActive = activeNode === node.id;
          const isHovered = hoveredNode === node.id;
          const scale = (isActive || isHovered) ? 1.1 : 1;
          const isRoot = node.type === 'core';

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onNodeClick(node.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow ring when active */}
              {isActive && (
                <rect
                  x={node.x - w / 2 - 6} y={node.y - h / 2 - 6}
                  width={w + 12} height={h + 12}
                  rx={h / 2 + 6} ry={h / 2 + 6}
                  fill="none"
                  stroke={s.stroke}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  opacity="0.5"
                />
              )}

              <rect
                x={node.x - w / 2} y={node.y - h / 2}
                width={w} height={h}
                rx={h / 2} ry={h / 2}
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth={isRoot ? 2.5 : 1.5}
                filter={isRoot ? `url(#glow-core)` : undefined}
              />

              <text
                x={node.x} y={node.y}
                textAnchor="middle" dominantBaseline="central"
                fill={s.text}
                fontSize={isRoot ? fs + 1 : fs}
                fontWeight={isRoot ? 700 : 600}
                pointerEvents="none"
              >
                {node.label.length > 8 ? node.label.slice(0, 7) + '…' : node.label}
              </text>
            </motion.g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${cx - vb + 16}, ${cy + vb - 8})`}>
          {Object.entries(NODE_STYLE).map(([type, s], i) => {
            const x = i * 112;
            return (
              <g key={type} transform={`translate(${x}, 0)`}>
                <circle cx="5" cy="0" r="5" fill={s.fill} stroke={s.stroke} strokeWidth="1" />
                <text x="14" y="4" fontSize="10" fill="#64748B">{TYPE_LABEL[type]}</text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredNode && (() => {
          const node = layoutNodes.find(n => n.id === hoveredNode);
          if (!node || !node.description) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none z-10 max-w-[280px] text-center"
            >
              <span className="font-semibold">{node.label}</span>
              {node.description && <span className="text-gray-300 ml-2">{node.description}</span>}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function ConceptTab({ data, subjectId }: { data: DifficultyAnalysis; subjectId: string }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">正式定义</h3>
        </div>
        <p className="text-gray-700 leading-relaxed text-sm">{data.concept.formalDefinition}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-gray-900">通俗解释</h3>
        </div>
        <p className="text-gray-700 leading-relaxed text-sm">{data.concept.plainExplanation}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-900">形象类比</h3>
        </div>
        <p className="text-gray-700 leading-relaxed text-sm italic">{data.concept.analogy}</p>
      </motion.div>

      {data.concept.prerequisiteKnowledge.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-gray-900">前置知识</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.concept.prerequisiteKnowledge.map((item, i) => (
              <span
                key={i}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSubjectTextClass(subjectId)}`}
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {data.concept.formulas && data.concept.formulas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="p-5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white font-bold text-sm">📐 公式与定理</span>
          </div>
          <div className="space-y-3">
            {data.concept.formulas.map((formula, i) => (
              <div key={i} className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">{formula.name}</div>
                <div className="font-mono text-lg text-emerald-400 font-semibold">{formula.expression}</div>
                <div className="text-xs text-gray-400 mt-1">{formula.description}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ExamplesTab({ data }: { data: DifficultyAnalysis }) {
  const [expandedExample, setExpandedExample] = useState<string | null>('ex_1');

  return (
    <div className="space-y-4">
      {data.examples.map((example, index) => (
        <motion.div
          key={example.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm"
        >
          <button
            onClick={() => setExpandedExample(expandedExample === example.id ? null : example.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 font-bold text-sm">
                {index + 1}
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 text-sm">{example.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{example.keyPoints}</p>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                expandedExample === example.id ? 'rotate-90' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedExample === example.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">题目描述</div>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">{example.description}</p>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">解题步骤</div>
                    <div className="space-y-2">
                      {example.steps.map((step, si) => (
                        <motion.div
                          key={si}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: si * 0.1 }}
                          className="flex gap-3 items-start"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                            {step.step}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{step.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">答案</div>
                    <p className="text-sm font-medium text-gray-900">{example.answer}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function MistakesTab({ data }: { data: DifficultyAnalysis }) {
  return (
    <div className="space-y-4">
      {data.commonMistakes.map((mistake, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="p-4 rounded-xl bg-white border border-red-100 shadow-sm space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-red-500 uppercase tracking-wider">❌ 错误类型</div>
              <p className="text-sm font-medium text-gray-900 mt-1">{mistake.mistake}</p>
            </div>
          </div>

          {mistake.wrongExample && (
            <div className="pl-8 bg-red-50 rounded-lg p-3 border border-red-100">
              <p className="text-xs text-red-400 mb-1">错误示例</p>
              <p className="text-sm text-red-700 line-through">{mistake.wrongExample}</p>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">✓ 正确做法</div>
              <p className="text-sm text-gray-700 mt-1">{mistake.correctAnswer}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Info className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider">💡 错因分析</div>
              <p className="text-sm text-gray-600 mt-1">{mistake.explanation}</p>
            </div>
          </div>

          {mistake.mnemonic && (
            <div className="ml-8 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
              <p className="text-xs text-amber-600 mb-1">🧠 记忆口诀</p>
              <p className="text-sm font-medium text-amber-800">{mistake.mnemonic}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function AdvancedTab({ data }: { data: DifficultyAnalysis }) {
  const app = data.advancedApplications[0];
  if (!app) return null;

  const resourceIcons: Record<string, React.ElementType> = {
    video: Video,
    article: FileText,
    book: BookIcon,
    course: GraduationCap,
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100"
      >
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-purple-600" />
          {app.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{app.description}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
      >
        <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
          <Play className="w-4 h-4 text-indigo-500" />
          应用场景
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {app.scenarios.map((scenario, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
              {scenario}
            </div>
          ))}
        </div>
      </motion.div>

      {app.competitionTypes && app.competitionTypes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
        >
          <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            🏆 竞赛/考试题型
          </h4>
          <div className="flex flex-wrap gap-2">
            {app.competitionTypes.map((comp, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                {comp}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {app.crossSubjectLinks && app.crossSubjectLinks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
        >
          <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            🔗 跨学科联系
          </h4>
          <div className="space-y-2">
            {app.crossSubjectLinks.map((link, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                    {link.subject}
                  </span>
                  <span className="text-xs font-medium text-gray-700">{link.topic}</span>
                </div>
                <p className="text-xs text-gray-500">{link.connection}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {app.resources && app.resources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
        >
          <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            📚 推荐学习资源
          </h4>
          <div className="space-y-2">
            {app.resources.map((resource, i) => {
              const IconComponent = resourceIcons[resource.type] || FileText;
              return (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors group"
                >
                  <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-primary-600 truncate">{resource.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{resource.type === 'video' ? '视频' : resource.type === 'article' ? '文章' : resource.type === 'book' ? '书籍' : '课程'}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                </a>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

const SESSION_KEY = 'difficulty-analyzer-session';

function loadSession(): { topic: string; subjectId: string; gradeId: string; result: DifficultyAnalysis | null } | null {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveSession(data: { topic: string; subjectId: string; gradeId: string; result: DifficultyAnalysis | null }) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export default function DifficultyAnalyzer() {
  const session = useRef(loadSession());
  const [topic, setTopic] = useState(session.current?.topic || '');
  const [subjectId, setSubjectId] = useState(session.current?.subjectId || 'math');
  const [gradeId, setGradeId] = useState(session.current?.gradeId || 'grade-9');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DifficultyAnalysis | null>(session.current?.result || null);
  const [activeTab, setActiveTab] = useState<DetailTab>('concept');
  const [activeMindMapNode, setActiveMindMapNode] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('difficulty-analyzer-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const { addToHistory: addToRecentHistory, addNotification } = useAppStore();

  // 会话持久化：切换页面不丢失状态
  useEffect(() => {
    saveSession({ topic, subjectId, gradeId, result });
  }, [topic, subjectId, gradeId, result]);

  const filteredTags = useMemo(() => {
    if (!topic.trim()) return recommendedTags;
    return recommendedTags.filter((t) =>
      t.text.toLowerCase().includes(topic.toLowerCase())
    );
  }, [topic]);

  const handleAnalyze = async () => {
    if (!topic.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setActiveTab('concept');
    setActiveMindMapNode(null);

    try {
      const analysisResult = await aiService.analyzeDifficulty(subjectId, gradeId, topic);
      setResult(analysisResult);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        topic,
        subjectId,
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const updated = [newHistoryItem, ...prev].slice(0, 10);
        localStorage.setItem('difficulty-analyzer-history', JSON.stringify(updated));
        return updated;
      });

      addToRecentHistory({
        type: 'analysis',
        title: `${subjects.find(s => s.id === subjectId)?.name || ''} - ${topic}`,
        subjectId,
        gradeId,
        content: '',
      });
    } catch (error: any) {
      console.error('Analysis failed:', error);
      addNotification({
        type: 'error',
        title: '分析失败',
        message: error?.message || '请检查网络连接后重试',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTagClick = (tagText: string, tagSubjectId: string) => {
    setTopic(tagText);
    setSubjectId(tagSubjectId);
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setTopic(item.topic);
    setSubjectId(item.subjectId);
  };

  const handleMindMapNodeClick = (nodeId: string) => {
    setActiveMindMapNode(prev => prev === nodeId ? null : nodeId);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('difficulty-analyzer-history');
  };

  const subjectColor = getSubjectColor(subjectId);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${getSubjectGradient(subjectId)} text-white`}>
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">重难点拆解</h1>
              <p className="text-sm text-gray-500">多维度分析知识点，智能生成教学方案</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 lg:gap-6">
          {/* 左侧输入面板 */}
          <div className="lg:col-span-3 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl p-5 border shadow-sm ${getSubjectBgClass(subjectId)}`}
            >
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="输入知识点或难点名称..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                    style={{ focusRingColor: subjectColor, '--tw-ring-color': subjectColor } as React.CSSProperties}
                  />
                  {topic && (
                    <button
                      onClick={() => setTopic('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer"
                  style={{ '--tw-ring-color': subjectColor } as React.CSSProperties}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer"
                  style={{ '--tw-ring-color': subjectColor } as React.CSSProperties}
                >
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAnalyze}
                  disabled={!topic.trim() || analyzing}
                  className={`w-full py-2.5 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${getSubjectGradient(subjectId)} hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      开始分析
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900 text-sm">常见难点</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredTags.slice(0, 10).map((tag, i) => (
                  <motion.button
                    key={tag.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTagClick(tag.text, tag.subjectId)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${getSubjectTextClass(tag.subjectId)} hover:shadow-md`}
                  >
                    <span className="mr-1 opacity-60">
                      {subjects.find((s) => s.id === tag.subjectId)?.icon}
                    </span>
                    {tag.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900 text-sm">历史记录</h3>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    清空
                  </button>
                </div>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleHistoryClick(item)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-gray-50 transition-colors group flex items-center gap-3"
                    >
                      <Clock className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate group-hover:text-gray-900">{item.topic}</p>
                        <p className="text-xs text-gray-400">
                          {subjects.find((s) => s.id === item.subjectId)?.name} ·{' '}
                          {Math.floor((Date.now() - item.timestamp) / 60000) > 0
                            ? `${Math.floor((Date.now() - item.timestamp) / 60000)}分钟前`
                            : '刚刚'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* 中间思维导图区域 */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden h-full min-h-[480px]"
            >
              {analyzing ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[480px]">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="mb-6"
                  >
                    <Brain className="w-16 h-16" style={{ color: subjectColor }} />
                  </motion.div>
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-gray-600 font-medium"
                  >
                    正在深度分析...
                  </motion.p>
                  <motion.div className="mt-4 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: subjectColor }}
                      />
                    ))}
                  </motion.div>
                </div>
              ) : result ? (
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: subjectColor }}
                      />
                      知识图谱
                    </h3>
                    <span className="text-xs text-gray-400">点击节点高亮</span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <KnowledgeGraphView
                      graph={result.knowledgeGraph}
                      activeNode={activeMindMapNode}
                      onNodeClick={handleMindMapNodeClick}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[480px] text-center px-8">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                    <Brain className="w-12 h-12 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">等待输入知识点</h3>
                  <p className="text-sm text-gray-400 max-w-[260px] leading-relaxed">
                    在左侧输入你想分析的知识点，选择学科后点击"开始分析"，即可生成多维度的知识图谱和详细解析
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* 右侧详情面板 */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden h-full min-h-[480px]"
            >
              {result ? (
                <div className="flex flex-col h-full min-h-[480px]">
                  <div className="flex border-b border-gray-100 px-2 pt-3">
                    {(Object.keys(tabConfig) as DetailTab[]).map((tab) => {
                      const config = tabConfig[tab];
                      const IconComp = config.icon;
                      const isActive = activeTab === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative flex-1 flex flex-col items-center gap-1.5 pb-3 pt-1 text-xs font-medium transition-colors ${
                        isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <IconComp className={`w-4.5 h-4.5 transition-colors ${isActive ? '' : 'opacity-50'}`} />
                      <span>{config.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="tabIndicator"
                          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r"
                          style={{ background: `linear-gradient(to right, ${subjectColor}, ${subjectColor}cc)` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                      >
                        {activeTab === 'concept' && <ConceptTab data={result} subjectId={subjectId} />}
                        {activeTab === 'examples' && <ExamplesTab data={result} />}
                        {activeTab === 'mistakes' && <MistakesTab data={result} />}
                        {activeTab === 'advanced' && <AdvancedTab data={result} />}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[480px] text-center px-8">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <BookOpen className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-400 mb-1.5">详情面板</h3>
                  <p className="text-xs text-gray-300 max-w-[220px] leading-relaxed">
                    完成分析后，这里将展示概念解释、例题演示、易错点和进阶应用等内容
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        select:focus { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(subjectColor)}' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); }
      `}</style>
    </div>
  );
}
