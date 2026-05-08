import { motion } from 'framer-motion';
import { GraduationCap, Heart, MessageCircle, HelpCircle, Info } from 'lucide-react';

const footerLinks = [
  { label: '关于我们', icon: Info, href: '#' },
  { label: '使用帮助', icon: HelpCircle, href: '#' },
  { label: '反馈建议', icon: MessageCircle, href: '#' },
];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-gray-50 border-t border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 上部：Logo + 链接 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo & 品牌信息 */}
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-semibold text-gray-700">乡村教师智能教学助手</span>
          </div>

          {/* 链接 */}
          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="group flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* 分割线 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-400 flex items-center justify-center gap-1">
            © 2024 乡村教师智能教学助手 - 让每一堂课都精彩
            <Heart className="w-3.5 h-3.5 text-red-400 inline-block" />
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
