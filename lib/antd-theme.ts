import type { ThemeConfig } from 'antd'

export const antdTheme: ThemeConfig = {
  token: {
    // 主色调 - 橙色
    colorPrimary: '#FF6B35',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // 文字颜色
    colorText: '#1A1A1A',
    colorTextSecondary: '#666666',
    colorTextDisabled: '#999999',
    
    // 背景颜色
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F5F5F5',
    
    // 边框
    colorBorder: '#E0E0E0',
    colorBorderSecondary: '#F0F0F0',
    
    // 字体
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // 圆角
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    
    // 间距
    marginXS: 8,
    marginSM: 12,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,
    
    // 阴影
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 500,
    },
    Input: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    Menu: {
      itemBg: '#1A1A1A',
      itemColor: '#FFFFFF',
      itemHoverBg: '#FF6B35',
      itemSelectedBg: '#FF6B35',
      itemSelectedColor: '#FFFFFF',
    },
    Table: {
      headerBg: '#FAFAFA',
      headerColor: '#1A1A1A',
    },
  },
}
