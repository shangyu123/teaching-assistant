import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-placeholder',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
});

const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

const SYSTEM_PROMPT = `你是一位经验丰富的乡村教师教学助手，擅长为中国乡村教师制作高质量、实用、接地气的教学材料。你的回答要：
1. 贴近乡村教学实际，语言通俗易懂
2. 内容可直接用于课堂教学
3. 符合中国新课标要求
4. 始终以 JSON 格式输出结果`;

// ==================== Prompt 模板 ====================

const PROMPTS = {
  lessonPlan: `你是一位经验丰富的{subject}教师，请为{grade}学生设计一份关于"{topic}"的完整教案。

**教学要求：**
- 课时长度：{duration}分钟
- 教学目标：{objectives}
- 教学风格：{style}
- 学生水平：{level}

**输出 JSON 格式：**
{
  "title": "教案标题",
  "objectives": ["目标1", "目标2", "目标3"],
  "content": {
    "introduction": "课程导入部分...",
    "mainContent": [
      {
        "title": "环节名称",
        "content": "详细教学内容...",
        "duration": 时长数字,
        "keyPoints": ["要点1", "要点2"]
      }
    ],
    "summary": "课堂总结...",
    "homework": "作业布置..."
  },
  "teachingMethods": ["方法1", "方法2"],
  "resources": ["资源1", "资源2"]
}`,

  difficultyAnalysis: `作为{subject}教学专家，请对知识点"{topic}"进行深度分析，适合{grade}学生。

**分析维度：**
1. 核心概念（形式化定义 + 通俗解释 + 形象类比 + 前置知识 + 公式）
2. 3道由浅入深的典型例题（含解题步骤、答案、考查要点）
3. 5个常见易错点（含错误描述、正确做法、错因分析、记忆口诀）
4. 重难点列表（名称、难度级别 easy/medium/hard、描述、解决方案）
5. 5条教学建议
6. 进阶应用（拓展场景、竞赛类型、跨学科联系、推荐资源）
7. 教学概念知识图谱

**知识图谱要求：**
- 节点总数控制在8-12个，精简有代表性
- 核心概念1个（root），子概念/定理2-4个，典型案例2-3个，常见误区/反例1-2个
- 边的关系类型：hierarchy（包含/从属）、causal（因果/推导）、analogy（类比/相似）、contrast（对比/区别）、counterexample（反例/误区）
- 每条边都要有简短的文字标签（2-4字）

**输出 JSON 格式：**
{
  "concept": {
    "formalDefinition": "...",
    "plainExplanation": "...",
    "analogy": "...",
    "prerequisiteKnowledge": ["..."],
    "formulas": [{"name": "...", "expression": "...", "description": "..."}]
  },
  "examples": [
    {
      "id": "ex_1",
      "title": "例题标题",
      "description": "题目描述",
      "steps": [{"step": 1, "content": "..."}],
      "answer": "答案",
      "keyPoints": "考查要点"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "错误类型",
      "correctAnswer": "正确做法",
      "explanation": "错因分析",
      "wrongExample": "错误示例",
      "mnemonic": "记忆口诀"
    }
  ],
  "keyDifficulties": [
    {"name": "...", "level": "medium", "description": "...", "solution": "..."}
  ],
  "teachingSuggestions": ["建议1", "建议2"],
  "advancedApplications": [{
    "title": "...",
    "description": "...",
    "scenarios": ["..."],
    "competitionTypes": ["..."],
    "crossSubjectLinks": [{"subject": "...", "topic": "...", "connection": "..."}],
    "resources": [{"name": "...", "url": "...", "type": "video"}]
  }],
  "knowledgeGraph": {
    "nodes": [
      { "id": "n1", "label": "核心概念名", "type": "core", "description": "一句话描述" },
      { "id": "n2", "label": "子概念A", "type": "sub-concept", "description": "一句话描述" },
      { "id": "n3", "label": "子概念B", "type": "sub-concept", "description": "一句话描述" },
      { "id": "n4", "label": "定理/公式", "type": "theorem", "description": "一句话描述" },
      { "id": "n5", "label": "典型案例一", "type": "case", "description": "一句话描述" },
      { "id": "n6", "label": "典型案例二", "type": "case", "description": "一句话描述" },
      { "id": "n7", "label": "常见误区", "type": "misconception", "description": "一句话描述" }
    ],
    "edges": [
      { "id": "e1", "source": "n1", "target": "n2", "label": "核心组成", "type": "hierarchy" },
      { "id": "e2", "source": "n1", "target": "n3", "label": "核心组成", "type": "hierarchy" },
      { "id": "e3", "source": "n2", "target": "n4", "label": "推导得出", "type": "causal" },
      { "id": "e4", "source": "n2", "target": "n5", "label": "实际应用", "type": "hierarchy" },
      { "id": "e5", "source": "n3", "target": "n6", "label": "实际应用", "type": "hierarchy" },
      { "id": "e6", "source": "n2", "target": "n7", "label": "易错区分", "type": "counterexample" }
    ]
  }
}`,

  exercises: `请为{grade}{subject}课程生成关于"{topic}"的练习题。

**题目要求：**
- 题型：{type}
- 数量：{count}道
- 难度：{difficulty}（easy简单/medium中等/hard困难）
- 包含：题目内容、选项（选择题需4个选项）、参考答案、详细解析、难度标注

**输出 JSON 格式：**
{
  "exercises": [
    {
      "id": "q_1",
      "question": "题目内容",
      "type": "choice|fill|essay",
      "options": ["A...", "B...", "C...", "D..."],
      "answer": "参考答案",
      "explanation": "详细解析",
      "difficulty": "easy|medium|hard"
    }
  ]
}`,

  script: `请为{grade}{subject}课程生成关于"{topic}"的完整课堂讲解脚本。

**脚本要求：**
- 总时长：{duration}分钟
- 教学风格：{style}
- 话术要口语化、适合课堂讲授，包含互动提问、过渡语和总结语
- 适合乡村学生理解水平

**输出 JSON 格式（按时间线组织）：**
{
  "sections": [
    {
      "phase": "环节名称（如：课前导入 3分钟）",
      "content": "详细的讲解话术文本，包含完整的教师用语...",
      "duration": 时长数字,
      "notes": "教学提示"
    }
  ],
  "tips": ["教学建议1", "教学建议2", "教学建议3"]
}`,
};

// ==================== 工具函数 ====================

const SUBJECT_NAMES: Record<string, string> = {
  chinese: '语文', math: '数学', english: '英语',
  physics: '物理', chemistry: '化学', biology: '生物',
  history: '历史', geography: '地理',
};

const GRADE_NAMES: Record<string, string> = {
  'grade-1': '一年级', 'grade-2': '二年级', 'grade-3': '三年级',
  'grade-4': '四年级', 'grade-5': '五年级', 'grade-6': '六年级',
  'grade-7': '七年级', 'grade-8': '八年级', 'grade-9': '九年级',
  'grade-10': '高一', 'grade-11': '高二', 'grade-12': '高三',
};

const STYLE_NAMES: Record<string, string> = {
  formal: '正式讲授型', storytelling: '故事化教学',
  interactive: '互动探究型', simple: '简洁明了型',
};

function getSubjectName(id: string): string {
  return SUBJECT_NAMES[id] || '通用学科';
}

function getGradeName(id: string): string {
  return GRADE_NAMES[id] || '';
}

function getStyleName(style?: string): string {
  return STYLE_NAMES[style || ''] || '正式讲授型';
}

// ==================== API 调用 ====================

async function callDeepSeek(prompt: string): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  const response = await deepseek.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 8192,
  });

  return response.choices[0]?.message?.content || '{}';
}

function parseJSON<T>(raw: string): T {
  let cleaned = raw.trim();
  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // DeepSeek sometimes wraps JSON in extra text — extract the first { ... } block
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const extracted = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(extracted) as T;
      } catch {
        throw new Error(`JSON 解析失败: ${extracted.slice(0, 200)}...`);
      }
    }
    throw new Error(`JSON 解析失败: ${cleaned.slice(0, 200)}...`);
  }
}

function generateId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// ==================== 导出的服务函数 ====================

export interface LessonPlanRequest {
  subjectId: string;
  gradeId: string;
  topic: string;
  duration: number;
  objectives?: string[];
  teachingStyle?: 'formal' | 'storytelling' | 'interactive' | 'simple';
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export async function generateLessonPlan(request: LessonPlanRequest) {
  const prompt = PROMPTS.lessonPlan
    .replace('{subject}', getSubjectName(request.subjectId))
    .replace('{grade}', getGradeName(request.gradeId))
    .replace('{topic}', request.topic)
    .replace('{duration}', String(request.duration))
    .replace('{objectives}', request.objectives?.join('；') || `理解${request.topic}的基本概念；掌握${request.topic}的核心知识；能够运用所学解决相关问题`)
    .replace('{style}', getStyleName(request.teachingStyle))
    .replace('{level}', request.studentLevel === 'beginner' ? '基础薄弱' : request.studentLevel === 'advanced' ? '学有余力' : '中等水平');

  const raw = await callDeepSeek(prompt);
  const data = parseJSON<{
    title?: string;
    objectives?: string[];
    content: any;
    teachingMethods?: string[];
    resources?: string[];
  }>(raw);

  return {
    id: generateId(),
    title: data.title || `${request.topic} - 教学设计`,
    subjectId: request.subjectId,
    gradeId: request.gradeId,
    topic: request.topic,
    duration: request.duration,
    objectives: data.objectives || request.objectives || [],
    content: data.content || { introduction: '', mainContent: [], summary: '', homework: '' },
    teachingMethods: data.teachingMethods || [],
    resources: data.resources || [],
    createdAt: new Date().toISOString(),
  };
}

export interface DifficultyAnalysisRequest {
  subjectId: string;
  gradeId: string;
  topic: string;
}

export async function analyzeDifficulty(request: DifficultyAnalysisRequest) {
  const prompt = PROMPTS.difficultyAnalysis
    .replace('{subject}', getSubjectName(request.subjectId))
    .replace('{grade}', getGradeName(request.gradeId))
    .replace('{topic}', request.topic);

  const raw = await callDeepSeek(prompt);
  const data = parseJSON<any>(raw);

  const defaultGraph = {
    nodes: [{ id: 'n1', label: request.topic, type: 'core' as const, description: '' }],
    edges: [] as { id: string; source: string; target: string; label: string; type: string }[],
  };

  return {
    id: generateId(),
    topic: request.topic,
    subjectId: request.subjectId,
    gradeId: request.gradeId,
    keyDifficulties: data.keyDifficulties || [],
    teachingSuggestions: data.teachingSuggestions || [],
    commonMistakes: data.commonMistakes || [],
    concept: data.concept || { formalDefinition: '', plainExplanation: '', analogy: '', prerequisiteKnowledge: [], formulas: [] },
    examples: data.examples || [],
    advancedApplications: data.advancedApplications || [],
    knowledgeGraph: data.knowledgeGraph || defaultGraph,
    createdAt: new Date().toISOString(),
  };
}

export interface ExerciseRequest {
  subjectId: string;
  gradeId: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  exerciseType: 'choice' | 'fill' | 'essay' | 'mixed';
}

export async function generateExercises(request: ExerciseRequest) {
  const prompt = PROMPTS.exercises
    .replace('{grade}', getGradeName(request.gradeId))
    .replace('{subject}', getSubjectName(request.subjectId))
    .replace('{topic}', request.topic)
    .replace('{type}', request.exerciseType === 'mixed' ? '混合题型（选择题+填空题+简答题）' : request.exerciseType)
    .replace('{count}', String(request.count))
    .replace('{difficulty}', request.difficulty);

  const raw = await callDeepSeek(prompt);
  const data = parseJSON<{ exercises: any[] }>(raw);

  return {
    id: generateId(),
    title: `${request.topic} - 练习题集`,
    subjectId: request.subjectId,
    gradeId: request.gradeId,
    topic: request.topic,
    exercises: data.exercises || [],
    totalScore: (data.exercises?.length || 0) * 10,
    createdAt: new Date().toISOString(),
  };
}

export interface ScriptRequest {
  subjectId: string;
  gradeId: string;
  topic: string;
  style: 'formal' | 'storytelling' | 'interactive' | 'simple';
  duration: number;
}

export async function generateScript(request: ScriptRequest) {
  const prompt = PROMPTS.script
    .replace('{grade}', getGradeName(request.gradeId))
    .replace('{subject}', getSubjectName(request.subjectId))
    .replace('{topic}', request.topic)
    .replace('{duration}', String(request.duration))
    .replace('{style}', getStyleName(request.style));

  const raw = await callDeepSeek(prompt);
  const data = parseJSON<{ sections: any[]; tips: string[] }>(raw);

  return {
    id: generateId(),
    title: `${request.topic} - 讲解脚本`,
    subjectId: request.subjectId,
    gradeId: request.gradeId,
    topic: request.topic,
    style: getStyleName(request.style),
    sections: data.sections || [],
    tips: data.tips || [],
    createdAt: new Date().toISOString(),
  };
}
