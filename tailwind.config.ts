import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          black: '#1A1A1A',
          white: '#FFFFFF',
          dark: '#0F0F0F',
        },
        accent: {
          orange: '#FF6B35',
          'orange-light': '#FF8C5F',
          'orange-dark': '#E55A2B',
        },
        neutral: {
          light: '#F5F5F5',
          medium: '#666666',
          dark: '#333333',
          border: '#E0E0E0',
        },
        success: '#52c41a',
        warning: '#faad14',
        error: '#ff4d4f',
        info: '#1890ff',
      },
      fontFamily: {
        sans: ['Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'title-large': ['38px', { lineHeight: '1.3', fontWeight: '700' }],
        'title-medium': ['30px', { lineHeight: '1.4', fontWeight: '600' }],
        'title-small': ['20px', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      fontWeight: {
        'title': '700',
        'body': '400',
      },
      borderRadius: {
        'default': '8px',
        'lg': '12px',
        'sm': '4px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 禁用 Tailwind 的基础样式，避免与 Ant Design 冲突
  },
}
export default config

