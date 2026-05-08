import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 固定顶部导航 */}
      <Header />

      {/* 主内容区 - 使用 flex-1 撑开，确保 footer 在底部 */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-1 mt-16"
      >
        <Outlet />
      </motion.main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}
