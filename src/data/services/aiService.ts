export interface LessonPlanRequest {
  subjectId: string;
  gradeId: string;
  topic: string;
  duration: number;
  objectives?: string[];
}

export interface LessonPlan {
  id: string;
  title: string;
  subjectId: string;
  gradeId: string;
  topic: string;
  duration: number;
  objectives: string[];
  content: {
    introduction: string;
    mainContent: Section[];
    summary: string;
    homework: string;
  };
  teachingMethods: string[];
  resources: string[];
  createdAt: string;
}

export interface Section {
  title: string;
  content: string;
  duration: number;
  keyPoints?: string[];
}

export interface DifficultyAnalysis {
  id: string;
  topic: string;
  subjectId: string;
  gradeId: string;
  keyDifficulties: DifficultyItem[];
  teachingSuggestions: string[];
  commonMistakes: CommonMistake[];
  concept: ConceptDetail;
  examples: ExampleItem[];
  advancedApplications: AdvancedApplication[];
  mindMapData: MindMapNode;
  createdAt: string;
}

export interface ConceptDetail {
  formalDefinition: string;
  plainExplanation: string;
  analogy: string;
  prerequisiteKnowledge: string[];
  formulas?: FormulaItem[];
}

export interface FormulaItem {
  name: string;
  expression: string;
  description: string;
}

export interface ExampleItem {
  id: string;
  title: string;
  description: string;
  steps: SolutionStep[];
  answer: string;
  keyPoints: string;
}

export interface SolutionStep {
  step: number;
  content: string;
}

export interface CommonMistake {
  mistake: string;
  correctAnswer: string;
  explanation: string;
  wrongExample?: string;
  mnemonic?: string;
}

export interface AdvancedApplication {
  title: string;
  description: string;
  scenarios: string[];
  competitionTypes?: string[];
  crossSubjectLinks?: CrossSubjectLink[];
  resources?: ResourceLink[];
}

export interface CrossSubjectLink {
  subject: string;
  topic: string;
  connection: string;
}

export interface ResourceLink {
  name: string;
  url: string;
  type: 'video' | 'article' | 'book' | 'course';
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'branch' | 'leaf';
  children: MindMapNode[];
}

export interface DifficultyItem {
  name: string;
  level: 'easy' | 'medium' | 'hard';
  description: string;
  solution: string;
}

export interface CommonMistake {
  mistake: string;
  correctAnswer: string;
  explanation: string;
}

export interface ExerciseRequest {
  subjectId: string;
  gradeId: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  exerciseType: 'choice' | 'fill' | 'essay' | 'mixed';
}

export interface Exercise {
  id: string;
  question: string;
  type: 'choice' | 'fill' | 'essay';
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExerciseSet {
  id: string;
  title: string;
  subjectId: string;
  gradeId: string;
  topic: string;
  exercises: Exercise[];
  totalScore: number;
  createdAt: string;
}

export interface ScriptRequest {
  subjectId: string;
  gradeId: string;
  topic: string;
  style: 'formal' | 'storytelling' | 'interactive' | 'simple';
  duration: number;
}

export interface TeachingScript {
  id: string;
  title: string;
  subjectId: string;
  gradeId: string;
  topic: string;
  style: string;
  sections: ScriptSection[];
  tips: string[];
  createdAt: string;
}

export interface ScriptSection {
  phase: string;
  content: string;
  duration: number;
  notes?: string;
}

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const mockTeachingContent = {
  chinese: {
    methods: ['讲授法', '朗读法', '讨论法', '情境教学法'],
    resources: ['课文原文', '多媒体课件', '生字卡片', '教学挂图'],
    difficulties: [
      { name: '字词理解', level: 'medium' as const, description: '部分生僻字的读音和含义', solution: '结合语境讲解，使用联想记忆法' },
      { name: '课文主旨', level: 'hard' as const, description: '深层含义的把握', solution: '分层阅读，引导思考作者意图' },
      { name: '写作手法', level: 'hard' as const, description: '修辞手法和表达技巧', solution: '对比分析，仿写练习' }
    ]
  },
  math: {
    methods: ['启发式教学', '探究式学习', '例题演示', '练习巩固'],
    resources: ['几何模型', '计算器', '数学软件', '练习册'],
    difficulties: [
      { name: '概念理解', level: 'medium' as const, description: '抽象概念的建立', solution: '从具体到抽象，多举例说明' },
      { name: '公式应用', level: 'hard' as const, description: '公式的灵活运用', solution: '变式训练，归纳解题思路' },
      { name: '逻辑推理', level: 'hard' as const, description: '证明过程的严谨性', solution: '规范书写格式，分步引导' }
    ]
  },
  english: {
    methods: ['情景交际法', '任务型教学', '听说法', '全身反应法'],
    resources: ['音频材料', '视频资源', '单词卡片', '英语绘本'],
    difficulties: [
      { name: '语音语调', level: 'medium' as const, description: '正确发音和语调', solution: '模仿跟读，录音对比' },
      { name: '语法规则', level: 'hard' as const, description: '时态和句型的运用', solution: '情境练习，归纳总结' },
      { name: '词汇记忆', level: 'medium' as const, description: '单词的记忆与运用', solution: '词根词缀法，联想记忆' }
    ]
  },
  physics: {
    methods: ['实验探究法', '问题导向法', '类比推理法', '建模法'],
    resources: ['实验器材', '仿真软件', '物理模型', '数据采集器'],
    difficulties: [
      { name: '物理概念', level: 'hard' as const, description: '抽象物理量的理解', solution: '生活实例引入，实验验证' },
      { name: '公式推导', level: 'hard' as const, description: '物理公式的来源和应用', solution: '从基本原理出发，逐步推导' },
      { name: '实验分析', level: 'medium' as const, description: '实验数据的处理和分析', solution: '规范操作步骤，强调误差分析' }
    ]
  },
  chemistry: {
    methods: ['实验演示法', '微观分析法', '比较归纳法', '探究发现法'],
    resources: ['化学试剂', '实验仪器', '分子模型', '元素周期表'],
    difficulties: [
      { name: '微观粒子', level: 'hard' as const, description: '原子分子的抽象概念', solution: '使用模型比喻，动画辅助' },
      { name: '化学方程式', level: 'medium' as const, description: '配平和反应类型判断', solution: '分类总结，专项练习' },
      { name: '实验安全', level: 'easy' as const, description: '实验操作规范', solution: '反复强调，示范操作' }
    ]
  },
  biology: {
    methods: ['观察法', '实验法', '比较法', '归纳法'],
    resources: ['显微镜', '标本模型', '生物图谱', '实验材料'],
    difficulties: [
      { name: '生命活动', level: 'medium' as const, description: '生理过程的理解', solution: '动画演示，图解说明' },
      { name: '遗传规律', level: 'hard' as const, description: '遗传概率的计算', solution: '画遗传图解，多做练习' },
      { name: '生态系统', level: 'medium' as const, description: '各成分间的关系', solution: '构建概念图，实地考察' }
    ]
  },
  history: {
    methods: ['史料研习法', '时间轴法', '角色扮演法', '比较分析法'],
    resources: ['历史文献', '影像资料', '历史地图', '文物图片'],
    difficulties: [
      { name: '时间脉络', level: 'medium' as const, description: '历史事件的时间顺序', solution: '制作时间轴，口诀记忆' },
      { name: '因果关系', level: 'hard' as const, description: '历史事件的内在联系', solution: '多角度分析，思维导图' },
      { name: '史论结合', level: 'hard' as const, description: '客观评价历史人物事件', solution: '提供多元史料，辩证思考' }
    ]
  },
  geography: {
    methods: ['地图教学法', '案例分析法', '实地考察法', '多媒体演示法'],
    resources: ['地图册', '地球仪', '地理信息系统', '卫星遥感图'],
    difficulties: [
      { name: '空间定位', level: 'medium' as const, description: '地理位置的判断', solution: '多看地图，建立空间感' },
      { name: '自然原理', level: 'hard' as const, description: '地理现象的形成机制', solution: '图文结合，动态演示' },
      { name: '区域特征', level: 'medium' as const, description: '区域差异的比较分析', solution: '表格对比，综合归纳' }
    ]
  }
};

async function simulateDelay(): Promise<void> {
  const delayTime = Math.floor(Math.random() * 2000) + 1000;
  await delay(delayTime);
}

export const aiService = {
  async generateLessonPlan(request: LessonPlanRequest): Promise<LessonPlan> {
    await simulateDelay();
    const content = mockTeachingContent[request.subjectId as keyof typeof mockTeachingContent] || mockTeachingContent.chinese;

    return {
      id: generateId(),
      title: `${request.topic} - 教学设计`,
      subjectId: request.subjectId,
      gradeId: request.gradeId,
      topic: request.topic,
      duration: request.duration,
      objectives: request.objectives || [
        `理解${request.topic}的基本概念`,
        `掌握${request.topic}的核心知识`,
        `能够运用所学解决相关问题`
      ],
      content: {
        introduction: `本节课我们将学习"${request.topic}"的相关内容。这是课程中的重要知识点，与日常生活密切相关。通过本节课的学习，同学们将建立起完整的知识体系。`,
        mainContent: [
          {
            title: '知识导入',
            content: `通过生活中的实际例子引出${request.topic}的概念，激发学生的学习兴趣。可以采用提问、展示图片或视频等方式进行导入。`,
            duration: Math.round(request.duration * 0.15),
            keyPoints: ['联系生活实际', '激发学习兴趣', '明确学习目标']
          },
          {
            title: '新知讲授',
            content: `系统讲解${request.topic}的定义、性质、特点等核心内容。采用由浅入深、循序渐进的方式，确保学生能够跟上教学节奏。配合板书和多媒体演示，帮助学生形成直观认识。`,
            duration: Math.round(request.duration * 0.45),
            keyPoints: ['概念清晰准确', '重点突出明确', '难点分解到位']
          },
          {
            title: '例题精讲',
            content: `选取典型例题进行分析讲解，展示规范的解题思路和方法。引导学生主动思考，培养其分析问题和解决问题的能力。`,
            duration: Math.round(request.duration * 0.25),
            keyPoints: ['规范解题步骤', '强调方法总结', '注重思维过程']
          }
        ],
        summary: `本节课我们学习了${request.topic}的主要内容，包括核心概念、重要性质和典型应用。希望同学们课后及时复习巩固，完成相关练习作业。`,
        homework: `1. 复习本节课所学内容\n2. 完成课后练习第1-5题\n3. 预习下节课内容`
      },
      teachingMethods: content.methods.slice(0, 3),
      resources: content.resources.slice(0, 4),
      createdAt: new Date().toISOString()
    };
  },

  async analyzeDifficulty(subjectId: string, gradeId: string, topic: string): Promise<DifficultyAnalysis> {
    await simulateDelay();
    const content = mockTeachingContent[subjectId as keyof typeof mockTeachingContent] || mockTeachingContent.chinese;

    const subjectMockData: Record<string, {
      concept: ConceptDetail;
      examples: ExampleItem[];
      advancedApps: AdvancedApplication;
      mindMap: MindMapNode;
    }> = {
      math: {
        concept: {
          formalDefinition: `"${topic}"是数学中的核心概念，描述了数量、结构、空间和变化之间的基本关系。它具有严格的定义域和值域，满足特定的公理体系。`,
          plainExplanation: `简单来说，${topic}就像是数学世界里的一个"工具"，帮助我们解决一类特定的问题。就像用钥匙开锁一样，掌握了它就能打开很多"题目之门"。`,
          analogy: `可以把${topic}想象成搭积木的基本规则——每块积木（基本元素）按照特定规则组合，就能搭建出各种形状（解决问题）。`,
          prerequisiteKnowledge: ['基础运算', '代数式', '方程概念', '函数初步'],
          formulas: [
            { name: '核心公式', expression: 'f(x) = ax² + bx + c', description: '描述变量间的定量关系' },
            { name: '变形公式', expression: 'Δ = b² - 4ac', description: '用于判别解的情况' }
          ]
        },
        examples: [
          {
            id: 'ex_1',
            title: '基础应用题',
            description: `已知关于${topic}的一个实际问题：某商品原价为100元，先提价10%，再降价10%，求最终价格。`,
            steps: [
              { step: 1, content: '明确题意，识别已知条件和所求量' },
              { step: 2, content: `运用${topic}的核心方法建立数学模型` },
              { step: 3, content: '代入数据进行计算' },
              { step: 4, content: '检验结果的合理性并作答' }
            ],
            answer: '最终价格为99元',
            keyPoints: '考查学生对百分比变化顺序的理解'
          },
          {
            id: 'ex_2',
            title: '综合应用题',
            description: `结合${topic}与实际情境：一个长方形菜园的长比宽多5米，面积为84平方米，求长和宽各是多少？`,
            steps: [
              { step: 1, content: '设宽为x米，则长为(x+5)米' },
              { step: 2, content: '根据面积列方程：x(x+5) = 84' },
              { step: 3, content: '整理得：x² + 5x - 84 = 0' },
              { step: 4, content: '因式分解：(x+12)(x-7) = 0' },
              { step: 5, content: '解得x=7（舍去负值），长为12米' }
            ],
            answer: '宽7米，长12米',
            keyPoints: '考查建模能力和方程求解的综合运用'
          },
          {
            id: 'ex_3',
            title: '拓展提高题',
            description: `${topic}在优化问题中的应用：如何用固定长度的围栏围出最大面积的矩形区域？`,
            steps: [
              { step: 1, content: '设周长为L，建立面积函数' },
              { step: 2, content: '利用${topic}求极值' },
              { step: 3, content: '验证极值为最大值' },
              { step: 4, content: '得出最优方案' }
            ],
            answer: '正方形时面积最大',
            keyPoints: '考查最值问题的建模与求解能力'
          }
        ],
        advancedApps: {
          title: `${topic}的进阶应用`,
          description: `掌握${topic}后，可以进一步探索更高级的数学领域和实际应用场景。`,
          scenarios: ['数据分析与统计建模', '机器学习算法基础', '经济学中的边际分析', '物理学运动规律描述'],
          competitionTypes: ['全国高中数学联赛', 'AMC美国数学竞赛', 'IMO预备训练'],
          crossSubjectLinks: [
            { subject: '物理', topic: '运动学', connection: '${topic}是描述物体运动轨迹的数学工具' },
            { subject: '化学', topic: '反应速率', connection: '化学反应动力学模型依赖${topic}' },
            { subject: '经济', topic: '成本收益分析', connection: '边际效用理论基于${topic}的导数性质' }
          ],
          resources: [
            { name: '可汗学院-高级数学', url: '#', type: 'video' },
            { name: '《什么是数学》- Courant', url: '#', type: 'book' },
            { name: 'MIT开放课程-微积分', url: '#', type: 'course' }
          ]
        },
        mindMap: {
          id: 'root',
          label: topic,
          type: 'root',
          children: [
            {
              id: 'concept',
              label: '📚 核心概念',
              type: 'branch',
              children: [
                { id: 'c1', label: '形式化定义', type: 'leaf', children: [] },
                { id: 'c2', label: '直观理解', type: 'leaf', children: [] },
                { id: 'c3', label: '前置知识', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'examples',
              label: '💡 实例演示',
              type: 'branch',
              children: [
                { id: 'e1', label: '基础例题', type: 'leaf', children: [] },
                { id: 'e2', label: '综合应用', type: 'leaf', children: [] },
                { id: 'e3', label: '拓展提高', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'mistakes',
              label: '⚠️ 易错点提醒',
              type: 'branch',
              children: [
                { id: 'm1', label: '概念混淆', type: 'leaf', children: [] },
                { id: 'm2', label: '忽略条件', type: 'leaf', children: [] },
                { id: 'm3', label: '计算失误', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'advanced',
              label: '🚀 进阶应用',
              type: 'branch',
              children: [
                { id: 'a1', label: '竞赛题型', type: 'leaf', children: [] },
                { id: 'a2', label: '跨学科联系', type: 'leaf', children: [] },
                { id: 'a3', label: '拓展资源', type: 'leaf', children: [] }
              ]
            }
          ]
        }
      },
      chinese: {
        concept: {
          formalDefinition: `"${topic}"是中国语言文学中的重要知识点，涉及汉字的形音义、词汇的构成方式以及语句的表达技巧等多个层面。`,
          plainExplanation: `通俗地说，${topic}就像是我们说话写字时的"语法规则"——知道这些规则，你就能更好地理解和运用中文。`,
          analogy: `学习${topic}好比学做菜：字词是食材，语法是烹饪方法，修辞是摆盘艺术，三者结合才能做出一道好"文章"。`,
          prerequisiteKnowledge: ['拼音基础', '常用汉字', '词语积累', '句子成分'],
          formulas: []
        },
        examples: [
          {
            id: 'ex_1',
            title: '字形辨析',
            description: `请辨析以下词语中加粗字的正确写法：**(${topic}相关词语)**`,
            steps: [
              { step: 1, content: '观察字形结构（左右/上下/半包围等）' },
              { step: 2, content: '分析字义，理解偏旁部首的含义' },
              { step: 3, content: '结合语境判断正确用法' },
              { step: 4, content: '通过组词法加深记忆' }
            ],
            answer: '正确答案及详细解析',
            keyPoints: '考查汉字形近字的区分能力'
          },
          {
            id: 'ex_2',
            title: '阅读理解',
            description: `阅读下面一段关于${topic}的文字，回答问题：...`,
            steps: [
              { step: 1, content: '通读全文，把握主旨大意' },
              { step: 2, content: '圈画关键词句，定位答题区间' },
              { step: 3, content: '结合${topic}的知识点进行分析' },
              { step: 4, content: '组织语言，规范作答' }
            ],
            answer: '完整答案要点',
            keyPoints: '考查信息提取和理解分析能力'
          },
          {
            id: 'ex_3',
            title: '写作运用',
            description: `请运用${topic}的相关知识，以"______"为题写一段话（200字左右）。`,
            steps: [
              { step: 1, content: '审清题目要求，确定写作方向' },
              { step: 2, content: '回忆${topic}的关键要素' },
              { step: 3, content: '构思框架，列出提纲' },
              { step: 4, content: '运用恰当的表达手法完成写作' }
            ],
            answer: '参考范文及点评',
            keyPoints: '考查知识的迁移运用能力'
          }
        ],
        advancedApps: {
          title: `${topic}的进阶应用`,
          description: `深入理解${topic}，可以提升文学鉴赏能力和语言表达水平。`,
          scenarios: ['古诗文鉴赏与创作', '现代文深度解读', '创意写作与表达', '演讲与辩论技巧'],
          competitionTypes: ['新概念作文大赛', '语文报杯作文大赛', '中华经典诵读'],
          crossSubjectLinks: [
            { subject: '历史', topic: '文言文阅读', connection: '${topic}是理解古代文献的基础' },
            { subject: '政治', topic: '议论文写作', connection: '逻辑论证需要扎实的${topic}功底' },
            { subject: '英语', topic: '翻译技巧', connection: '中英互译需要深刻理解${topic}' }
          ],
          resources: [
            { name: '《语文基础知识手册》', url: '#', type: 'book' },
            { name: '国家中小学智慧教育平台', url: '#', type: 'course' },
            { name: '央视《典籍里的中国》', url: '#', type: 'video' }
          ]
        },
        mindMap: {
          id: 'root',
          label: topic,
          type: 'root',
          children: [
            {
              id: 'concept',
              label: '📚 核心概念',
              type: 'branch',
              children: [
                { id: 'c1', label: '定义内涵', type: 'leaf', children: [] },
                { id: 'c2', label: '通俗解释', type: 'leaf', children: [] },
                { id: 'c3', label: '知识脉络', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'examples',
              label: '💡 实例演示',
              type: 'branch',
              children: [
                { id: 'e1', label: '典型例题一', type: 'leaf', children: [] },
                { id: 'e2', label: '典型例题二', type: 'leaf', children: [] },
                { id: 'e3', label: '典型例题三', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'mistakes',
              label: '⚠️ 易错点提醒',
              type: 'branch',
              children: [
                { id: 'm1', label: '常见错误一', type: 'leaf', children: [] },
                { id: 'm2', label: '常见错误二', type: 'leaf', children: [] },
                { id: 'm3', label: '常见错误三', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'advanced',
              label: '🚀 进阶应用',
              type: 'branch',
              children: [
                { id: 'a1', label: '拓展场景', type: 'leaf', children: [] },
                { id: 'a2', label: '跨学科联系', type: 'leaf', children: [] },
                { id: 'a3', label: '推荐资源', type: 'leaf', children: [] }
              ]
            }
          ]
        }
      },
      physics: {
        concept: {
          formalDefinition: `"${topic}"是物理学中描述物质基本属性或物理过程的重要概念，可通过实验观察和数学推导得出其本质规律。`,
          plainExplanation: `打个比方，${topic}就像是大自然的一种"隐藏规则"，虽然看不见摸不着，但它时刻影响着我们周围的一切事物。`,
          analogy: `把${topic}想象成游戏里的"物理引擎"——它决定了东西怎么动、怎么变、怎么相互作用。`,
          prerequisiteKnowledge: ['基本测量', '力学基础', '能量概念', '数学工具'],
          formulas: [
            { name: '基本公式', expression: 'F = ma', description: '描述力与运动的关系' },
            { name: '推导公式', expression: 'E = mc²', description: '质能转换关系' }
          ]
        },
        examples: [
          {
            id: 'ex_1',
            title: '实验分析题',
            description: `在探究${topic}的实验中，记录了如下数据表格，请分析实验结论。`,
            steps: [
              { step: 1, content: '审阅实验目的和原理' },
              { step: 2, content: '分析数据变化趋势' },
              { step: 3, content: '归纳${topic}的规律特点' },
              { step: 4, content: '评估误差来源' }
            ],
            answer: '实验结论及分析',
            keyPoints: '考查数据处理和实验分析能力'
          },
          {
            id: 'ex_2',
            title: '计算推理题',
            description: `一个质量为2kg的物体在${topic}相关条件下运动，求其末速度。`,
            steps: [
              { step: 1, content: '画出受力分析图' },
              { step: 2, content: '选择合适的物理定律' },
              { step: 3, content: '代入数据计算' },
              { step: 4, content: '讨论结果合理性' }
            ],
            answer: 'v = 10 m/s（方向水平向右）',
            keyPoints: '考查物理建模和计算能力'
          },
          {
            id: 'ex_3',
            title: '生活应用题',
            description: `请用${topic}的原理解释生活中常见的现象：为什么冬天脱毛衣会有火花？`,
            steps: [
              { step: 1, content: '识别涉及的物理概念' },
              { step: 2, content: '运用${topic}进行解释' },
              { step: 3, content: '结合生活实例说明' },
              { step: 4, content: '提出预防措施' }
            ],
            answer: '摩擦起电导致静电放电现象',
            keyPoints: '考查知识迁移和应用能力'
          }
        ],
        advancedApps: {
          title: `${topic}的前沿应用`,
          description: `${topic}不仅是考试重点，更是现代科技发展的基石。`,
          scenarios: ['航天器轨道设计', '新能源技术开发', '医学影像设备原理', '量子计算基础'],
          competitionTypes: ['全国中学生物理竞赛', 'IPhO国际物理奥赛', '科技创新大赛'],
          crossSubjectLinks: [
            { subject: '数学', topic: '微积分', connection: '物理量的连续变化需要微积分描述' },
            { subject: '化学', topic: '原子结构', connection: '${topic}揭示了微观粒子的行为规律' },
            { subject: '地理', topic: '气候系统', connection: '大气环流遵循${topic}的基本原理' }
          ],
          resources: [
            { name: '费曼物理学讲义', url: '#', type: 'book' },
            { name: 'MIT公开课-物理', url: '#', type: 'course' },
            { name: '3Blue1Brown-物理可视化', url: '#', type: 'video' }
          ]
        },
        mindMap: {
          id: 'root',
          label: topic,
          type: 'root',
          children: [
            {
              id: 'concept',
              label: '📚 核心概念',
              type: 'branch',
              children: [
                { id: 'c1', label: '物理定义', type: 'leaf', children: [] },
                { id: 'c2', label: '形象比喻', type: 'leaf', children: [] },
                { id: 'c3', label: '前置知识', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'examples',
              label: '💡 实例演示',
              type: 'branch',
              children: [
                { id: 'e1', label: '实验分析', type: 'leaf', children: [] },
                { id: 'e2', label: '计算推理', type: 'leaf', children: [] },
                { id: 'e3', label: '生活应用', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'mistakes',
              label: '⚠️ 易错点提醒',
              type: 'branch',
              children: [
                { id: 'm1', label: '概念误区', type: 'leaf', children: [] },
                { id: 'm2', label: '公式误用', type: 'leaf', children: [] },
                { id: 'm3', label: '单位错误', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'advanced',
              label: '🚀 进阶应用',
              type: 'branch',
              children: [
                { id: 'a1', label: '前沿技术', type: 'leaf', children: [] },
                { id: 'a2', label: '跨学科联系', type: 'leaf', children: [] },
                { id: 'a3', label: '竞赛方向', type: 'leaf', children: [] }
              ]
            }
          ]
        }
      },
      english: {
        concept: {
          formalDefinition: `"${topic}"是英语语言体系中的核心语法/词汇知识点，涉及词法、句法或语用层面的规则与用法。`,
          plainExplanation: `简单来说，${topic}就是英语使用中的一条重要"交通规则"——遵守它，你的英语表达就会更准确、更地道。`,
          analogy: `学${topic}就像学骑自行车：一开始觉得规则繁琐，但一旦内化成习惯，就会变得自然流畅。`,
          prerequisiteKnowledge: ['基础词汇', '简单句型', '时态概念', '语音基础'],
          formulas: []
        },
        examples: [
          {
            id: 'ex_1',
            title: '选择题',
            description: `Choose the best answer to complete the sentence about ${topic}.`,
            steps: [
              { step: 1, content: 'Read the sentence carefully' },
              { step: 2, content: 'Identify the grammatical focus (${topic})' },
              { step: 3, content: 'Analyze each option using ${topic} rules' },
              { step: 4, content: 'Select and verify the answer' }
            ],
            answer: 'Option B is correct because...',
            keyPoints: 'Tests understanding of ${topic} in context'
          },
          {
            id: 'ex_2',
            title: '完形填空',
            description: `Complete the passage using appropriate forms related to ${topic}.`,
            steps: [
              { step: 1, content: 'Skim for main idea' },
              { step: 2, content: 'Analyze context clues around each blank' },
              { step: 3, content: 'Apply ${topic} knowledge' },
              { step: 4, content: 'Re-read to check coherence' }
            ],
            answer: 'Complete answers with explanations',
            keyPoints: 'Tests contextual application of grammar'
          },
          {
            id: 'ex_3',
            title: '书面表达',
            description: `Write a short paragraph (80 words) using ${topic} correctly.`,
            steps: [
              { step: 1, content: 'Brainstorm ideas related to the topic' },
              { step: 2, content: 'Plan sentences incorporating ${topic}' },
              { step: 3, content: 'Draft with attention to accuracy' },
              { step: 4, content: 'Review and polish' }
            ],
            answer: 'Model paragraph with annotations',
            keyPoints: 'Tests productive use of language knowledge'
          }
        ],
        advancedApps: {
          title: `${topic}的进阶应用`,
          description: `Mastering ${topic} opens doors to advanced English proficiency.`,
          scenarios: ['Academic writing', 'Business communication', 'Public speaking', 'Literary analysis'],
          competitionTypes: ['NEATP全国英语能力竞赛', 'TOEFL/IELTS备考', '英语演讲比赛'],
          crossSubjectLinks: [
            { subject: '语文', topic: '修辞手法', connection: '英汉修辞有相通之处' },
            { subject: '历史', topic: '英语发展史', connection: '${topic}的演变反映文化变迁' },
            { subject: '计算机', topic: 'NLP自然语言处理', connection: '语法规则是AI理解语言的基础' }
          ],
          resources: [
            { name: 'Grammar in Use (Cambridge)', url: '#', type: 'book' },
            { name: 'BBC Learning English', url: '#', type: 'video' },
            { name: 'Coursera English Courses', url: '#', type: 'course' }
          ]
        },
        mindMap: {
          id: 'root',
          label: topic,
          type: 'root',
          children: [
            {
              id: 'concept',
              label: '📚 核心概念',
              type: 'branch',
              children: [
                { id: 'c1', label: 'Formal Definition', type: 'leaf', children: [] },
                { id: 'c2', label: 'Simple Explanation', type: 'leaf', children: [] },
                { id: 'c3', label: 'Prerequisites', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'examples',
              label: '💡 实例演示',
              type: 'branch',
              children: [
                { id: 'e1', label: 'Multiple Choice', type: 'leaf', children: [] },
                { id: 'e2', label: 'Cloze Test', type: 'leaf', children: [] },
                { id: 'e3', label: 'Writing Task', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'mistakes',
              label: '⚠️ 易错点提醒',
              type: 'branch',
              children: [
                { id: 'm1', label: 'Common Error 1', type: 'leaf', children: [] },
                { id: 'm2', label: 'Common Error 2', type: 'leaf', children: [] },
                { id: 'm3', label: 'Common Error 3', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'advanced',
              label: '🚀 进阶应用',
              type: 'branch',
              children: [
                { id: 'a1', label: 'Advanced Usage', type: 'leaf', children: [] },
                { id: 'a2', label: 'Cross-subject Links', type: 'leaf', children: [] },
                { id: 'a3', label: 'Resources', type: 'leaf', children: [] }
              ]
            }
          ]
        }
      },
      chemistry: {
        concept: {
          formalDefinition: `"${topic}"是化学科学中描述物质组成、结构、性质及变化规律的核心概念，建立在原子分子理论基础之上。`,
          plainExplanation: `可以这样理解${topic}：就像乐高积木有不同的颜色和形状一样，不同的原子和分子也有各自的特点，${topic}就是描述它们如何"玩耍"的规则。`,
          analogy: `把化学反应想象成一场"舞会"${topic}就是舞会的规则——谁和谁跳舞、跳什么舞步、什么时候换舞伴。`,
          prerequisiteKnowledge: ['原子结构', '元素周期表', '化学键', '摩尔概念'],
          formulas: [
            { name: '反应方程式', expression: 'A + B → C + D', description: '表示化学反应的过程' },
            { name: '计算公式', expression: 'n = m/M', description: '物质的量计算' }
          ]
        },
        examples: [
          {
            id: 'ex_1',
            title: '方程式书写',
            description: `请写出并配平关于${topic}的化学反应方程式。`,
            steps: [
              { step: 1, content: '确定反应物和生成物' },
              { step: 2, content: '写出未配平的方程式' },
              { step: 3, content: '利用${topic}相关知识进行配平' },
              { step: 4, content: '标注反应条件和状态符号' }
            ],
            answer: '配平后的完整方程式',
            keyPoints: '考查方程式书写和配平能力'
          },
          {
            id: 'ex_2',
            title: '计算题',
            description: `将10g含${topic}相关物质的样品完全反应，求生成物的质量。`,
            steps: [
              { step: 1, content: '写出正确的化学方程式' },
              { step: 2, content: '计算已知物质的物质的量' },
              { step: 3, content: '根据化学计量数比例求解' },
              { step: 4, content: '注意有效数字和单位' }
            ],
            answer: '生成物质量为X克',
            keyPoints: '考查化学计算能力'
          },
          {
            id: 'ex_3',
            title: '实验探究',
            description: `设计实验验证${topic}的相关性质，写出实验方案。`,
            steps: [
              { step: 1, content: '提出假设' },
              { step: 2, content: '设计实验步骤' },
              { step: 3, content: '预测实验现象' },
              { step: 4, content: '得出结论并分析' }
            ],
            answer: '完整实验方案及预期结果',
            keyPoints: '考查实验设计和探究能力'
          }
        ],
        advancedApps: {
          title: `${topic}的进阶应用`,
          description: `${topic}的理解是深入化学世界的钥匙。`,
          scenarios: ['新材料研发', '药物合成', '环境保护技术', '能源转化利用'],
          competitionTypes: ['全国化学奥林匹克竞赛', 'IChO国际化学奥赛', '化学创新实验大赛'],
          crossSubjectLinks: [
            { subject: '物理', topic: '热力学', connection: '化学反应的能量变化遵循热力学定律' },
            { subject: '生物', topic: '新陈代谢', connection: '生命活动本质上是一系列化学反应' },
            { subject: '数学', topic: '统计学', connection: '实验数据处理需要统计方法' }
          ],
          resources: [
            { name: '《普通化学原理》(华彤文)', url: '#', type: 'book' },
            { name: '虚拟化学实验室', url: '#', type: 'course' },
            { name: 'Periodic Videos (Nottingham)', url: '#', type: 'video' }
          ]
        },
        mindMap: {
          id: 'root',
          label: topic,
          type: 'root',
          children: [
            {
              id: 'concept',
              label: '📚 核心概念',
              type: 'branch',
              children: [
                { id: 'c1', label: '科学定义', type: 'leaf', children: [] },
                { id: 'c2', label: '形象类比', type: 'leaf', children: [] },
                { id: 'c3', label: '知识网络', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'examples',
              label: '💡 实例演示',
              type: 'branch',
              children: [
                { id: 'e1', label: '方程式练习', type: 'leaf', children: [] },
                { id: 'e2', label: '化学计算', type: 'leaf', children: [] },
                { id: 'e3', label: '实验设计', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'mistakes',
              label: '⚠️ 易错点提醒',
              type: 'branch',
              children: [
                { id: 'm1', label: '配平错误', type: 'leaf', children: [] },
                { id: 'm2', label: '条件遗漏', type: 'leaf', children: [] },
                { id: 'm3', label: '概念混淆', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'advanced',
              label: '🚀 进阶应用',
              type: 'branch',
              children: [
                { id: 'a1', label: '前沿应用', type: 'leaf', children: [] },
                { id: 'a2', label: '交叉学科', type: 'leaf', children: [] },
                { id: 'a3', label: '学习资源', type: 'leaf', children: [] }
              ]
            }
          ]
        }
      },
      biology: {
        concept: {
          formalDefinition: `"${topic}"是生物学领域中描述生命现象、生命活动规律或生物体结构与功能的重要概念。`,
          plainExplanation: `简单来说，${topic}就是大自然用来让生命运转的"一套机制"——了解它，你就明白生命为什么这么神奇。`,
          analogy: `把人体想象成一个超级工厂，${topic}就是其中的一条关键"生产线"。`,
          prerequisiteKnowledge: ['细胞结构', '生命特征', '生态系统', '遗传基础'],
          formulas: []
        },
        examples: [
          {
            id: 'ex_1',
            title: '识图分析',
            description: `观察下图所示的${topic}相关结构/过程示意图，回答下列问题。`,
            steps: [
              { step: 1, content: '识别图中各部分结构的名称' },
              { step: 2, content: '分析各部分的功能' },
              { step: 3, content: '理解${topic}在整体中的作用' },
              { step: 4, content: '总结关键知识点' }
            ],
            answer: '详细解析和答案',
            keyPoints: '考查图文转换和分析能力'
          },
          {
            id: 'ex_2',
            title: '实验分析',
            description: `某同学进行了关于${topic}的探究实验，记录数据如下表，请分析实验结果。`,
            steps: [
              { step: 1, content: '明确实验目的和变量设置' },
              { step: 2, content: '对比分析实验组和对照组数据' },
              { step: 3, content: '得出关于${topic}的结论' },
              { step: 4, content: '评价实验设计的优缺点' }
            ],
            answer: '实验结论及分析评价',
            keyPoints: '考查科学探究思维'
          },
          {
            id: 'ex_3',
            title: '综合应用',
            description: `结合${topic}的知识，分析某种疾病/农业问题的成因并提出解决方案。`,
            steps: [
              { step: 1, content: '从${topic}角度分析问题本质' },
              { step: 2, content: '联系实际案例' },
              { step: 3, content: '提出可行的解决方案' },
              { step: 4, content: '讨论方案的可行性' }
            ],
            answer: '完整的分析和建议',
            keyPoints: '考查知识迁移和问题解决能力'
          }
        ],
        advancedApps: {
          title: `${topic}的进阶应用`,
          description: `深入理解${topic}，打开生命科学的大门。`,
          scenarios: ['基因工程与育种', '医学诊断与治疗', '生态保护与修复', '发酵工程应用'],
          competitionTypes: ['全国中学生生物学竞赛', 'IBO国际生物奥赛', '青少年科技创新大赛'],
          crossSubjectLinks: [
            { subject: '化学', topic: '有机化学', connection: '生物大分子的本质是有机物' },
            { subject: '物理', topic: '光学显微镜', connection: '观察生命活动需要光学仪器' },
            { subject: '地理', topic: '生态系统', connection: '生物与环境密不可分' }
          ],
          resources: [
            { name: '《陈阅增普通生物学》', url: '#', type: 'book' },
            { name: 'NHK生物纪录片', url: '#', type: 'video' },
            { name: '中国大学MOOC-生物学', url: '#', type: 'course' }
          ]
        },
        mindMap: {
          id: 'root',
          label: topic,
          type: 'root',
          children: [
            {
              id: 'concept',
              label: '📚 核心概念',
              type: 'branch',
              children: [
                { id: 'c1', label: '学术定义', type: 'leaf', children: [] },
                { id: 'c2', label: '通俗解释', type: 'leaf', children: [] },
                { id: 'c3', label: '前备知识', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'examples',
              label: '💡 实例演示',
              type: 'branch',
              children: [
                { id: 'e1', label: '识图分析', type: 'leaf', children: [] },
                { id: 'e2', label: '实验探究', type: 'leaf', children: [] },
                { id: 'e3', label: '综合应用', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'mistakes',
              label: '⚠️ 易错点提醒',
              type: 'branch',
              children: [
                { id: 'm1', label: '概念混淆', type: 'leaf', children: [] },
                { id: 'm2', label: '记忆偏差', type: 'leaf', children: [] },
                { id: 'm3', label: '逻辑错误', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'advanced',
              label: '🚀 进阶应用',
              type: 'branch',
              children: [
                { id: 'a1', label: '前沿研究', type: 'leaf', children: [] },
                { id: 'a2', label: '学科交叉', type: 'leaf', children: [] },
                { id: 'a3', label: '优质资源', type: 'leaf', children: [] }
              ]
            }
          ]
        }
      },
      history: {
        concept: {
          formalDefinition: `"${topic}"是历史学研究中的重要事件、人物、制度或文化现象，反映了特定时期的社会发展状况和历史进程。`,
          plainExplanation: `简单说，${topic}就是历史上发生的一件"大事"或者一种"重要的做事方式"，理解它能帮我们看懂那个时代的人是怎么想的、怎么活的。`,
          analogy: `学${topic}就像看一部历史剧——你需要了解角色（历史人物）、剧情（事件经过）、背景（时代环境）才能真正看懂故事。`,
          prerequisiteKnowledge: ['时间观念', '朝代更替', '基本史料', '历史方法论'],
          formulas: []
        },
        examples: [
          {
            id: 'ex_1',
            title: '材料分析',
            description: `阅读以下关于${topic}的史料，回答问题：...（史料原文）`,
            steps: [
              { step: 1, content: '阅读材料，提取关键信息' },
              { step: 2, content: '结合所学${topic}知识分析' },
              { step: 3, content: '从多角度进行解读' },
              { step: 4, content: '组织规范的历史表述' }
            ],
            answer: '分点作答，史论结合',
            keyPoints: '考查史料解读和历史思维能力'
          },
          {
            id: 'ex_2',
            title: '因果分析',
            description: `分析${topic}发生的背景原因及其产生的历史影响。`,
            steps: [
              { step: 1, content: '从政治、经济、文化等多角度分析原因' },
              { step: 2, content: '区分根本原因和直接原因' },
              { step: 3, content: '分析短期影响和长期影响' },
              { step: 4, content: '辩证评价${topic}的历史地位' }
            ],
            answer: '全面的因果分析',
            keyPoints: '考查历史因果关系分析能力'
          },
          {
            id: 'ex_3',
            title: '比较评述',
            description: `比较${topic}与类似历史事件的异同，并进行评价。`,
            steps: [
              { step: 1, content: '确定比较的角度和标准' },
              { step: 2, content: '列表对比相同点和不同点' },
              { step: 3, content: '分析差异产生的原因' },
              { step: 4, content: '作出客观公正的历史评价' }
            ],
            answer: '比较表格和评价结论',
            keyPoints: '考查比较史学方法和批判性思维'
          }
        ],
        advancedApps: {
          title: `${topic}的深层探究`,
          description: `从${topic}出发，探索历史的纵深与广度。`,
          scenarios: ['历史小论文写作', '乡土历史调查', '博物馆研学', '历史剧编排'],
          competitionTypes: ['历史写作大赛', '国学经典诵读', '历史知识竞赛'],
          crossSubjectLinks: [
            { subject: '语文', topic: '文言文', connection: '史料多为文言文，需要语文功底' },
            { subject: '地理', topic: '历史地理', connection: '历史事件发生在具体的空间环境中' },
            { subject: '政治', topic: '政治制度', connection: '古今政治制度有传承演变关系' }
          ],
          resources: [
            { name: '《国史大纲》(钱穆)', url: '#', type: 'book' },
            { name: '央视《国家宝藏》《典籍里的中国》', url: '#', type: 'video' },
            { name: '中国数字方志库', url: '#', type: 'article' }
          ]
        },
        mindMap: {
          id: 'root',
          label: topic,
          type: 'root',
          children: [
            {
              id: 'concept',
              label: '📚 核心概念',
              type: 'branch',
              children: [
                { id: 'c1', label: '历史定位', type: 'leaf', children: [] },
                { id: 'c2', label: '通俗解读', type: 'leaf', children: [] },
                { id: 'c3', label: '知识关联', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'examples',
              label: '💡 实例演示',
              type: 'branch',
              children: [
                { id: 'e1', label: '史料分析', type: 'leaf', children: [] },
                { id: 'e2', label: '因果探究', type: 'leaf', children: [] },
                { id: 'e3', label: '比较评述', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'mistakes',
              label: '⚠️ 易错点提醒',
              type: 'branch',
              children: [
                { id: 'm1', label: '时间错乱', type: 'leaf', children: [] },
                { id: 'm2', label: '张冠李戴', type: 'leaf', children: [] },
                { id: 'm3', label: '片面评价', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'advanced',
              label: '🚀 进阶应用',
              type: 'branch',
              children: [
                { id: 'a1', label: '学术延伸', type: 'leaf', children: [] },
                { id: 'a2', label: '跨科联系', type: 'leaf', children: [] },
                { id: 'a3', label: '推荐资源', type: 'leaf', children: [] }
              ]
            }
          ]
        }
      },
      geography: {
        concept: {
          formalDefinition: `"${topic}"是地理学研究的核心内容之一，涉及地球表层自然要素和人文要素的分布、特征及其相互关系的空间规律。`,
          plainExplanation: `可以这样想，${topic}就是地球表面的某种"模式"或"规律"——比如为什么有的地方下雨多、有的地方山更高，这些都是${topic}要回答的问题。`,
          analogy: `把地球看作一个大拼图，${topic}就是其中的一块关键拼板——只有理解了它，才能看清整个地球的"全貌"。`,
          prerequisiteKnowledge: ['地图基础', '地球概论', '自然要素', '人文地理'],
          formulas: []
        },
        examples: [
          {
            id: 'ex_1',
            title: '读图分析',
            description: `读下图所示的${topic}分布图/示意图，分析其分布规律及成因。`,
            steps: [
              { step: 1, content: '读取图例和坐标信息' },
              { step: 2, content: '描述${topic}的空间分布特征' },
              { step: 3, content: '从自然和人文因素分析成因' },
              { step: 4, content: '总结规律并联系实际' }
            ],
            answer: '分布特征描述和成因分析',
            keyPoints: '考查地图阅读和空间分析能力'
          },
          {
            id: 'ex_2',
            title: '案例分析',
            description: `以某地区为例，分析${topic}对该地生产生活的影响。`,
            steps: [
              { step: 1, content: '介绍该地区的地理位置和基本情况' },
              { step: 2, content: '分析${topic}在该地的具体表现' },
              { step: 3, content: '论述对农业/工业/交通等方面的影响' },
              { step: 4, content: '提出合理的发展建议' }
            ],
            answer: '完整的案例分析报告',
            keyPoints: '考查区域认知和综合思维'
          },
          {
            id: 'ex_3',
            title: '实践探究',
            description: `设计一个关于${topic}的野外考察或社会调查方案。`,
            steps: [
              { step: 1, content: '确定考察目标和内容' },
              { step: 2, content: '选择合适的方法和路线' },
              { step: 3, content: '设计数据记录表格' },
              { step: 4, content: '规划成果呈现方式' }
            ],
            answer: '详细的考察方案',
            keyPoints: '考查地理实践力'
          }
        ],
        advancedApps: {
          title: `${topic}的深度探索`,
          description: `从${topic}入手，认识我们居住的这个星球。`,
          scenarios: ['GIS技术应用', '城乡规划', '旅游开发', '环境保护与治理'],
          competitionTypes: ['全国地理奥林匹克竞赛', '地理小博士竞赛', '环保科技创新大赛'],
          crossSubjectLinks: [
            { subject: '物理', topic: '大气物理', connection: '天气气候现象的本质是物理过程' },
            { subject: '化学', topic: '环境化学', connection: '环境污染涉及化学反应' },
            { subject: '历史', topic: '人地关系演变', connection: '人类文明发展与地理环境密切相关' }
          ],
          resources: [
            { name: 'Google Earth / 天地图', url: '#', type: 'article' },
            { name: '《中国国家地理》杂志', url: '#', type: 'article' },
            { name: 'BBC Planet Earth 纪录片', url: '#', type: 'video' }
          ]
        },
        mindMap: {
          id: 'root',
          label: topic,
          type: 'root',
          children: [
            {
              id: 'concept',
              label: '📚 核心概念',
              type: 'branch',
              children: [
                { id: 'c1', label: '地理定义', type: 'leaf', children: [] },
                { id: 'c2', label: '形象理解', type: 'leaf', children: [] },
                { id: 'c3', label: '知识铺垫', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'examples',
              label: '💡 实例演示',
              type: 'branch',
              children: [
                { id: 'e1', label: '读图分析', type: 'leaf', children: [] },
                { id: 'e2', label: '案例研究', type: 'leaf', children: [] },
                { id: 'e3', label: '实践活动', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'mistakes',
              label: '⚠️ 易错点提醒',
              type: 'branch',
              children: [
                { id: 'm1', label: '方位错误', type: 'leaf', children: [] },
                { id: 'm2', label: '因果倒置', type: 'leaf', children: [] },
                { id: 'm3', label: '以偏概全', type: 'leaf', children: [] }
              ]
            },
            {
              id: 'advanced',
              label: '🚀 进阶应用',
              type: 'branch',
              children: [
                { id: 'a1', label: '前沿应用', type: 'leaf', children: [] },
                { id: 'a2', label: '学科交叉', type: 'leaf', children: [] },
                { id: 'a3', label: '学习资源', type: 'leaf', children: [] }
              ]
            }
          ]
        }
      }
    };

    const data = subjectMockData[subjectId] || subjectMockData.math;

    return {
      id: generateId(),
      topic,
      subjectId,
      gradeId,
      keyDifficulties: content.difficulties,
      teachingSuggestions: [
        `针对${topic}的教学，建议采用分层教学策略`,
        `利用多媒体技术将抽象概念可视化`,
        `设计多样化的课堂活动提高学生参与度`,
        `注重知识的迁移应用能力培养`,
        `建立错题本，定期回顾易错点`
      ],
      commonMistakes: [
        {
          mistake: '概念混淆',
          correctAnswer: '明确区分相似概念的本质区别',
          explanation: '学生容易将相近的概念混为一谈，需要通过对比分析帮助区分',
          wrongExample: '错误地将A概念等同于B概念',
          mnemonic: '口诀：XX不同YY别，ZZ才是真区别'
        },
        {
          mistake: '忽略前提条件',
          correctAnswer: '注意定理公式成立的条件范围',
          explanation: '在应用知识时常常忘记考虑适用条件，导致错误结论',
          wrongExample: '在不满足条件的情况下套用公式',
          mnemonic: '口诀：用之前先看条件，条件不满足不能用'
        },
        {
          mistake: '计算粗心',
          correctAnswer: '养成检查验算的良好习惯',
          explanation: '基础计算错误是失分的主要原因之一，需要加强基本功训练',
          wrongExample: '简单的加减乘除出现计算错误',
          mnemonic: '口诀：算一遍验一遍，确保万无一失'
        },
        {
          mistake: '解题思路不清',
          correctAnswer: '先分析再动手，理清思路后再计算',
          explanation: '拿到题目就急于动笔，缺乏对问题的整体思考',
          mnemonic: '口诀：审题分析列思路，按部就班不慌乱'
        },
        {
          mistake: '答案表述不规范',
          correctAnswer: '使用学科术语，条理清晰地表达',
          explanation: '虽然思路正确但表述不规范，导致失分',
          mnemonic: '口诀：术语规范条理清，步骤完整得分高'
        }
      ],
      concept: data.concept,
      examples: data.examples,
      advancedApplications: [data.advancedApps],
      mindMapData: data.mindMap,
      createdAt: new Date().toISOString()
    };
  },

  async generateExercises(request: ExerciseRequest): Promise<ExerciseSet> {
    await simulateDelay();
    const exercises: Exercise[] = [];

    for (let i = 0; i < request.count; i++) {
      const types: Array<'choice' | 'fill' | 'essay'> =
        request.exerciseType === 'mixed'
          ? ['choice', 'fill', 'essay']
          : [request.exerciseType];
      const type = types[i % types.length];
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
      const difficulty = request.difficulty === 'medium'
        ? difficulties[i % 3]
        : request.difficulty;

      exercises.push({
        id: `ex_${i + 1}`,
        question: `【${type === 'choice' ? '选择题' : type === 'fill' ? '填空题' : '简答题'}】关于"${request.topic}"的第${i + 1}道题目：请根据所学知识完成本题。`,
        type,
        options: type === 'choice'
          ? [`选项A：关于${request.topic}的第一个可能答案`,
             `选项B：关于${request.topic}的第二个可能答案`,
             `选项C：关于${request.topic}的第三个可能答案`,
             `选项D：关于${request.topic}的第四个可能答案`]
          : undefined,
        answer: type === 'choice' ? 'A' : type === 'fill' ? '标准填空答案' : '详细的解答过程和最终答案',
        explanation: `本题考查的是${request.topic}中的核心知识点，需要学生掌握相关概念并能灵活运用。`,
        difficulty
      });
    }

    return {
      id: generateId(),
      title: `${request.topic} - 练习题集`,
      subjectId: request.subjectId,
      gradeId: request.gradeId,
      topic: request.topic,
      exercises,
      totalScore: exercises.length * 10,
      createdAt: new Date().toISOString()
    };
  },

  async generateScript(request: ScriptRequest): Promise<TeachingScript> {
    await simulateDelay();

    const styleConfig = {
      formal: { label: '正式讲授', tips: ['语言规范专业', '结构清晰完整', '板书工整规范'] },
      storytelling: { label: '故事化教学', tips: ['情节生动有趣', '语言通俗易懂', '互动环节丰富'] },
      interactive: { label: '互动探究', tips: ['多设问引导', '鼓励学生发言', '小组合作学习'] },
      simple: { label: '简洁明了', tips: ['突出重点', '简化表述', '多次重复关键点'] }
    };

    const config = styleConfig[request.style];

    return {
      id: generateId(),
      title: `${request.topic} - ${config.label}脚本`,
      subjectId: request.subjectId,
      gradeId: request.gradeId,
      topic: request.topic,
      style: config.label,
      sections: [
        {
          phase: '课前准备（2分钟）',
          content: `各位同学好！今天我们要学习的内容是"${request.topic}"。请大家准备好课本和笔记本，我们马上开始今天的学习之旅。在开始之前，我想先问大家一个问题：你们在生活中有没有接触过相关的现象呢？`,
          duration: 2,
          notes: '营造轻松氛围，拉近师生距离'
        },
        {
          phase: '新课导入（5分钟）',
          content: `非常好！大家提到了很多有趣的例子。那么，${request.topic}到底是什么呢？它和我们刚才提到的这些现象又有什么关系呢？让我们一起来探索这个问题的答案。\n\n首先，让我们来看一个具体的例子...`,
          duration: 5,
          notes: '从学生已有经验出发，自然过渡到新知'
        },
        {
          phase: '新知讲解（15分钟）',
          content: `【板书标题】${request.topic}\n\n第一部分：基本概念\n${request.topic}是指...（详细讲解定义和内涵）。我们可以用这样一个简单的例子来理解...\n\n第二部分：核心要点\n在学习${request.topic}时，我们需要特别注意以下几点：\n1. 第一个关键点...\n2. 第二个关键点...\n3. 第三个关键点...\n\n第三部分：实际应用\n了解了基本概念之后，我们来看看${request.topic}在实际中是如何应用的...`,
          duration: 15,
          notes: '边讲边写，注意观察学生反应'
        },
        {
          phase: '例题演练（10分钟）',
          content: `现在让我们来看一道典型的例题：\n\n【例题】...（呈现题目）\n\n这道题应该怎么解呢？首先，我们来分析一下题目要求...然后，我们回忆一下刚才学到的知识...最后，我们按照步骤来解答...\n\n【解答过程】...\n\n从这个例题中，我们可以总结出什么解题规律呢？`,
          duration: 10,
          notes: '引导学生思考，不要直接给出答案'
        },
        {
          phase: '课堂小结（3分钟）',
          content: `好，今天的课就到这里。让我们来回顾一下今天学到的内容：\n1. 我们学习了${request.topic}的基本概念\n2. 掌握了...的核心要点\n3. 学会了...的解题方法\n\n今天的作业是课本第XX页的练习题。有问题的话，下课后来问我。同学们再见！`,
          duration: 3,
          notes: '总结要简洁有力，布置作业要明确'
        }
      ],
      tips: config.tips,
      createdAt: new Date().toISOString()
    };
  }
};

export const generateLessonPlan = aiService.generateLessonPlan.bind(aiService);
export const analyzeDifficulty = aiService.analyzeDifficulty.bind(aiService);
export const generateExercises = aiService.generateExercises.bind(aiService);
export const generateScript = aiService.generateScript.bind(aiService);
