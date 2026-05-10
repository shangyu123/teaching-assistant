# 🎓 乡村教师智能教学助手

<div align="center">

**AI 赋能乡村教育，让每一堂课都精彩**

[功能介绍](#-核心功能) • [快速开始](#-快速开始) • [项目结构](#-项目结构) • [技术栈](#-技术栈)

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)

</div>

---

## ✨ 项目简介

**乡村教师智能教学助手**是一款专为乡村教师打造的 Web 端 AI 教学辅助工具，通过 DeepSeek 大模型为教师提供智能备课、重难点分析、练习生成、讲解脚本等 AI 能力。

### 🎯 解决什么痛点？

| 痛点 | 解决方案 |
|------|---------|
| ❌ 备课耗时长，资源匮乏 | ✅ AI 一键生成完整教案 |
| ❌ 重难点不知怎么讲 | ✅ 多维度拆解 + 知识图谱可视化 |
| ❌ 出题费时间 | ✅ 自动生成练习题 + 难度分级 |
| ❌ 课堂语言组织难 | ✅ 生成完整讲解脚本（含话术） |
| ❌ 缺少可复用模板 | ✅ 内置 8 大学科资源库 |

---

## 🚀 核心功能

### 1️⃣ AI 智能备课中心

> 一键生成完整的课件和教案

- 📋 分步向导式操作（3 步完成）
- 🎨 4 种教学风格：正式讲授 / 故事化教学 / 互动探究 / 简洁明了
- 📊 生成完整教学流程、时间分配、板书设计、作业布置
- 📤 支持导出 Word / PDF / 打印

### 2️⃣ 重难点拆解工具

> 深度分析知识点，让复杂变简单

- 🧠 三栏式布局：输入面板 → 知识图谱 → 详细分析
- 🗺️ 知识图谱：节点按类型着色（核心概念/子概念/定理/案例/误区），连线标注关系（层级/因果/类比/对比/反例）
- 📚 7 大分析维度：核心概念、典型例题、易错点、重难点列表、教学建议、进阶应用、知识图谱
- 🎨 根据学科自动切换主题色

### 3️⃣ 课堂练习工坊

> 自动出题，秒生成练习卷

- 📝 支持选择题、填空题、简答题、混合题型
- ⚙️ 灵活配置：题目数量（5-20）、难度分布（简单/中等/困难）
- 📋 题目卡片展示：彩色难度标识、点击展开答案解析
- 📦 支持编辑、删除、批量导出

### 4️⃣ 讲解脚本生成器

> 生成完整的课堂话术，新手也能上好课

- ⏱️ 时间轴视图，直观展示各环节时长
- 💬 话术模块化：开场白 → 新课导入 → 新知讲解 → 例题演练 → 课堂小结
- 🎯 包含互动提问、过渡语和教学提示
- 📋 支持复制、备注、标记已用

### 5️⃣ 教学资源库

> 内置优质教学资源，即拿即用

- 🔍 多维筛选：学科 + 年级 + 类型 + 关键词搜索
- 🎴 16+ 资源覆盖 8 大学科（课件模板、教案范例、练习题库等）
- ⭐ 星级评分、使用统计、收藏功能

---

## 📖 快速开始

### 前置要求

- **Node.js** >= 18.x
- **DeepSeek API Key**（[申请地址](https://platform.deepseek.com/)）

### 1. 克隆并安装

```bash
git clone https://github.com/shangyu123/teaching-assistant.git
cd teaching-assistant

# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..
```

### 2. 配置 API Key

```bash
# 复制环境变量模板
cp server/.env.example server/.env

# 编辑 server/.env，填入你的 DeepSeek API Key
# DEEPSEEK_API_KEY=sk-your-api-key
```

### 3. 启动项目

```bash
# 同时启动前端 + 后端
npm run dev:all
```

- 前端：`http://localhost:5173`
- 后端 API：`http://localhost:3001`

### 单独启动

```bash
npm run dev          # 仅前端
npm run dev:server   # 仅后端
```

### 构建生产版本

```bash
npm run build
npm run preview
```

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.8 | 类型安全 |
| Vite | 6.3 | 构建工具 |
| Tailwind CSS | 3.4 | 原子化 CSS |
| Framer Motion | 12.x | 动画库 |
| React Router | 7.3 | 路由管理 |
| Zustand | 5.0 | 状态管理 |
| Lucide React | 0.511 | 图标库 |
| Express | 4.21 | 后端框架 |
| OpenAI SDK | 4.73 | DeepSeek API 调用 |

## 📁 项目结构

```
teaching-assistant/
├── src/
│   ├── components/layout/     # 布局组件（Header/Footer/MainLayout）
│   ├── pages/                 # 页面组件（6 个页面）
│   │   ├── Home.tsx               # 首页仪表盘
│   │   ├── LessonGenerator.tsx    # AI 备课中心
│   │   ├── DifficultyAnalyzer.tsx # 重难点拆解
│   │   ├── ExerciseWorkshop.tsx   # 课堂练习工坊
│   │   ├── ScriptGenerator.tsx    # 讲解脚本生成器
│   │   └── ResourceLibrary.tsx    # 资源库
│   ├── data/
│   │   ├── mock/              # 静态数据（学科、年级定义）
│   │   └── services/          # 服务层
│   │       ├── aiService.ts       # AI 接口（fetch 调用后端）
│   │       ├── storageService.ts  # localStorage 封装
│   │       └── exportService.ts   # Word/PDF 导出
│   ├── store/useAppStore.ts   # Zustand 全局状态
│   ├── router/index.tsx       # React Router 路由配置
│   ├── hooks/useTheme.ts      # 暗色模式 hook
│   ├── lib/utils.ts           # cn() 工具函数
│   └── index.css              # 全局样式 + Tailwind 组件类
├── server/
│   ├── src/
│   │   ├── index.ts           # Express 入口
│   │   ├── routes/ai.ts       # API 路由（4 个端点）
│   │   └── services/deepseek.ts # DeepSeek SDK + Prompt 模板
│   ├── .env.example           # 环境变量模板
│   └── package.json
├── CLAUDE.md                  # Claude Code 项目指南
├── vite.config.ts             # Vite 配置（含 /api 代理）
└── package.json
```

---

## 🔧 AI 架构

本项目使用 **DeepSeek API** 提供 AI 生成能力，前后端分离架构：

```
浏览器 (React SPA)
    │  fetch /api/*
    ▼
Express 后端 (localhost:3001)
    │  OpenAI SDK
    ▼
DeepSeek API (api.deepseek.com)
    │  模型: deepseek-v4-flash
    ▼
返回结构化 JSON → 前端渲染
```

4 个 AI 功能端点：

| 端点 | 功能 |
|------|------|
| `POST /api/lesson-plan` | AI 生成教案 |
| `POST /api/difficulty-analysis` | 重难点分析 + 知识图谱 |
| `POST /api/exercises` | 生成练习题集 |
| `POST /api/script` | 生成课堂讲解脚本 |

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star 支持一下！**

Made with ❤️ for Rural Education

</div>
