import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
