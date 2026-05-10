# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（仅前端） |
| `npm run dev:server` | 启动 Express 后端（端口 3001，tsx watch 热重载） |
| `npm run dev:all` | 同时启动前端 + 后端（concurrently） |
| `npm run build` | 类型检查 + 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run check` | 仅 TypeScript 类型检查（不构建） |
| `npm run lint` | ESLint 检查 |

## 架构概要

**乡村教师智能教学助手** — React 18 SPA + Express 后端，面向乡村教师的 AI 备课辅助工具。前端纯客户端渲染，后端通过 DeepSeek API 提供 AI 能力。

### 技术栈关键点
- TypeScript 5，**`strict: false`** — 避免严格模式专属写法
- Vite 6，路径别名 `@/` → `./src/`（`vite-tsconfig-paths` 插件）
- TailwindCSS 3，暗色模式通过 `class` 策略切换，`useTheme` hook 控制 `<html>` class + `localStorage`
- React Router v7（`createBrowserRouter`），路由定义在 `src/router/index.tsx`，6 个页面
- Zustand 全局状态，通过 `storageService` **手动**持久化到 localStorage（非 `persist` 中间件），初始化时调用 `initializeFromStorage()`
- 工具函数 `cn()` 在 `src/lib/utils.ts`（clsx + tailwind-merge）
- Framer Motion 做动画，lucide-react 做图标

### 后端（`server/`）
- Express + TypeScript，端口 3001，`tsx watch` 热重载
- 文件结构：`index.ts`（入口 + dotenv）→ `routes/ai.ts`（4 个路由）→ `services/deepseek.ts`（DeepSeek SDK 封装 + Prompt 模板）
- DeepSeek API 使用 OpenAI 兼容 SDK，模型名从 `DEEPSEEK_MODEL` 环境变量读取，默认 `deepseek-chat`
- `max_tokens: 8192`，`temperature: 0.7`
- **JSON 解析**：`parseJSON()` 先去除 markdown 代码块标记，直接 `JSON.parse`；失败则提取第一个 `{...}` 块再解析
- 配置：复制 `server/.env.example` 为 `server/.env`，填入 `DEEPSEEK_API_KEY`

### 4 个 AI 功能端点与 Prompt 模板

| 端点 | 前端页面 | Prompt 模板变量 |
|------|---------|---------------|
| `POST /api/lesson-plan` | LessonGenerator | `{subject}{grade}{topic}{duration}{objectives}{style}{level}` |
| `POST /api/difficulty-analysis` | DifficultyAnalyzer | `{subject}{grade}{topic}` |
| `POST /api/exercises` | ExerciseWorkshop | `{grade}{subject}{topic}{type}{count}{difficulty}` |
| `POST /api/script` | ScriptGenerator | `{grade}{subject}{topic}{duration}{style}` |

### 知识图谱（`DifficultyAnalyzer`）
- 类型：`KnowledgeGraph` = `{ nodes: KnowledgeNode[], edges: KnowledgeEdge[] }`
- 节点类型 `KnowledgeNode.type`：`core`（核心概念，紫色大节点）| `sub-concept`（子概念）| `theorem`（定理/公式）| `case`（典型案例）| `misconception`（常见误区）
- 边类型 `KnowledgeEdge.type`：`hierarchy`（包含/从属）| `causal`（因果/推导）| `analogy`（类比）| `contrast`（对比）| `counterexample`（反例）
- 渲染组件 `KnowledgeGraphView`（同文件内定义）：SVG 径向 BFS 布局，节点按类型着色，边按类型使用不同虚线样式
- 后端 Prompt 明确要求 8-12 节点，含知识图谱结构示例

### 前端 AI 服务层（`src/data/services/`）
- **`aiService.ts`** — 通过 `fetch` 调用后端 `/api/*` 接口，定义所有请求/响应类型
- **`aiService.real.ts`** — 旧版直接调用 OpenAI 的参考实现（已 `.gitignore` 排除）
- **`storageService.ts`** — localStorage 封装，历史记录上限 50 条
- **`exportService.ts`** — HTML 转 Word/PDF 下载（Blob 方式）

### 数据来源状态

| 页面 | 数据来源 |
|------|---------|
| LessonGenerator | DeepSeek 后端 API |
| DifficultyAnalyzer | DeepSeek 后端 API |
| ExerciseWorkshop | DeepSeek 后端 API |
| ScriptGenerator | DeepSeek 后端 API |
| ResourceLibrary | **纯前端 mock 数据**（16 条硬编码资源，无后端） |
| Home | 无外部数据 |

### 会话持久化
- `DifficultyAnalyzer` 和 `ExerciseWorkshop` 在 `useEffect` 中将生成结果写入 `localStorage`，页面初始化时恢复，防止切换路由后内容丢失
- key 格式：`difficulty-analyzer-session`、`exercise-workshop-session`

### Vite 代理
- 开发时 `/api` 请求代理到 `http://localhost:3001`（`vite.config.ts`）

### 数据模型（`src/data/mock/`）
- `subjects.ts` — 8 个学科（id、名称、图标、主题色）
- `grades.ts` — 12 个年级 + `GradeLevel` 类型（primary/junior/senior）

### 关键约定
- 所有面向用户的文案为中文
- 学科/年级 ID 作为键值在前后端间传递（如 `math`、`grade-8`）
- 无测试框架
