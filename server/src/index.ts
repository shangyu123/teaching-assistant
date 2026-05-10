import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import aiRouter from './routes/ai.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API 路由
app.use('/api', aiRouter);

app.listen(PORT, () => {
  console.log(`✅ 教学助手后端服务已启动: http://localhost:${PORT}`);
  console.log(`📡 API 地址: http://localhost:${PORT}/api`);
  console.log(`🔑 DeepSeek 模型: ${process.env.DEEPSEEK_MODEL || 'deepseek-chat'}`);
});
