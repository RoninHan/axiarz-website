import type { Metadata } from 'next'
import './globals.css'
import 'antd/dist/reset.css'
import AntdProvider from '@/components/AntdProvider'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'

// 禁用 Font Awesome 自动添加 CSS
config.autoAddCss = false

export const metadata: Metadata = {
  title: 'Axiarz - 科技产品独立站',
  description: '高品质科技产品，创新设计，值得信赖',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdProvider>
          {children}
        </AntdProvider>
      </body>
    </html>
  )
}
