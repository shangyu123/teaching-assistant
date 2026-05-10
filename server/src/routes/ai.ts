import { Router } from 'express';
import {
  generateLessonPlan,
  analyzeDifficulty,
  generateExercises,
  generateScript,
} from '../services/deepseek.js';

const router = Router();

// 生成教案/课件
router.post('/lesson-plan', async (req, res) => {
  try {
    const result = await generateLessonPlan(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('教案生成失败:', error.message);
    res.status(500).json({ error: '教案生成失败', message: error.message });
  }
});

// 重难点分析
router.post('/difficulty-analysis', async (req, res) => {
  try {
    const result = await analyzeDifficulty(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('重难点分析失败:', error.message);
    res.status(500).json({ error: '重难点分析失败', message: error.message });
  }
});

// 生成练习题
router.post('/exercises', async (req, res) => {
  try {
    const result = await generateExercises(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('练习题生成失败:', error.message);
    res.status(500).json({ error: '练习题生成失败', message: error.message });
  }
});

// 生成讲解脚本
router.post('/script', async (req, res) => {
  try {
    const result = await generateScript(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('脚本生成失败:', error.message);
    res.status(500).json({ error: '脚本生成失败', message: error.message });
  }
});

// 健康检查
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
