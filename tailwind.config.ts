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
          black: '#000000',
          white: '#FFFFFF',
        },
        accent: {
          orange: '#FF7F00',
        },
        neutral: {
          light: '#F5F5F5',
          medium: '#CCCCCC',
        },
      },
      fontFamily: {
        sans: ['Microsoft YaHei', 'sans-serif'],
      },
      fontSize: {
        'title-large': '36px',
        'title-medium': '28px',
        'title-small': '18px',
        'body': '14px',
        'caption': '12px',
      },
      fontWeight: {
        'title': '700',
        'body': '400',
      },
      borderRadius: {
        'default': '4px',
      },
    },
  },
  plugins: [],
}
export default config

