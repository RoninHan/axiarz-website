'use client'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { antdTheme } from '@/lib/antd-theme'

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={antdTheme} locale={zhCN}>
      {children}
    </ConfigProvider>
  )
}
