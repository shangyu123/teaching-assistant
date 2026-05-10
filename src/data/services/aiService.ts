// ==================== 类型定义 ====================

export interface LessonPlanRequest {
  subjectId: string;
  gradeId: string;
  topic: string;
  duration: number;
  objectives?: string[];
  teachingStyle?: 'formal' | 'storytelling' | 'interactive' | 'simple';
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
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
  knowledgeGraph: KnowledgeGraph;
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

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'core' | 'sub-concept' | 'theorem' | 'case' | 'misconception';
  description?: string;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'hierarchy' | 'causal' | 'analogy' | 'contrast' | 'counterexample';
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface DifficultyItem {
  name: string;
  level: 'easy' | 'medium' | 'hard';
  description: string;
  solution: string;
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

// ==================== API 调用封装 ====================

const API_BASE = '/api';

async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error((errorData as any).message || `请求失败: ${response.status}`);
  }

  return response.json();
}

// ==================== AI 服务 ====================

export const aiService = {
  async generateLessonPlan(request: LessonPlanRequest): Promise<LessonPlan> {
    return apiPost<LessonPlan>('/lesson-plan', request);
  },

  async analyzeDifficulty(subjectId: string, gradeId: string, topic: string): Promise<DifficultyAnalysis> {
    return apiPost<DifficultyAnalysis>('/difficulty-analysis', { subjectId, gradeId, topic });
  },

  async generateExercises(request: ExerciseRequest): Promise<ExerciseSet> {
    return apiPost<ExerciseSet>('/exercises', request);
  },

  async generateScript(request: ScriptRequest): Promise<TeachingScript> {
    return apiPost<TeachingScript>('/script', request);
  },
};

// 向后兼容的单独导出
export const generateLessonPlan = aiService.generateLessonPlan.bind(aiService);
export const analyzeDifficulty = aiService.analyzeDifficulty.bind(aiService);
export const generateExercises = aiService.generateExercises.bind(aiService);
export const generateScript = aiService.generateScript.bind(aiService);
