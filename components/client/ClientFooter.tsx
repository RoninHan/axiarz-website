'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ClientFooter() {
  const [aboutUs, setAboutUs] = useState<string>('致力于提供高品质科技产品，创新设计，值得信赖。')
  const [companyName, setCompanyName] = useState<string>('Axiarz')
  const [contactEmail, setContactEmail] = useState<string>('support@axiarz.com')
  const [contactPhone, setContactPhone] = useState<string>('400-123-4567')

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/client/settings')
      const data = await res.json()
      if (data.success && data.data) {
        if (data.data.aboutUs) {
          // 截取前100个字符作为简短描述
          const shortAbout = data.data.aboutUs.length > 100 
            ? data.data.aboutUs.substring(0, 100) + '...' 
            : data.data.aboutUs
          setAboutUs(shortAbout)
        }
        if (data.data.companyName) {
          setCompanyName(data.data.companyName)
        }
        if (data.data.contactEmail) {
          setContactEmail(data.data.contactEmail)
        }
        if (data.data.contactPhone) {
          setContactPhone(data.data.contactPhone)
        }
      }
    } catch (error) {
      console.error('获取设置失败:', error)
    }
  }

  return (
    <footer className="bg-primary-black text-primary-white h-[300px] mt-auto">
      <div className="container mx-auto px-6 py-12 max-w-[1920px]">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <h3 className="text-title-small font-title mb-4">关于我们</h3>
            <p className="text-body text-neutral-medium" style={{ whiteSpace: 'pre-wrap' }}>
              {aboutUs}
            </p>
          </div>
          <div>
            <h3 className="text-title-small font-title mb-4">产品</h3>
            <ul className="space-y-2 text-body text-neutral-medium">
              <li><Link href="/products" className="text-neutral-medium hover:text-accent-orange transition-colors no-underline">所有产品</Link></li>
              <li><Link href="/products?featured=true" className="text-neutral-medium hover:text-accent-orange transition-colors no-underline">精选产品</Link></li>
              <li><Link href="/files" className="text-neutral-medium hover:text-accent-orange transition-colors no-underline">文件下载</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-title-small font-title mb-4">支持</h3>
            <ul className="space-y-2 text-body text-neutral-medium">
              <li><Link href="/help" className="text-neutral-medium hover:text-accent-orange transition-colors no-underline">帮助中心</Link></li>
              <li><Link href="/contact" className="text-neutral-medium hover:text-accent-orange transition-colors no-underline">联系我们</Link></li>
              <li><Link href="/solutions" className="text-neutral-medium hover:text-accent-orange transition-colors no-underline">解决方案</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-title-small font-title mb-4">联系方式</h3>
            <p className="text-body text-neutral-medium">
              邮箱: {contactEmail}<br />
              电话: {contactPhone}
            </p>
          </div>
        </div>
        <div className="border-t border-neutral-medium mt-8 pt-8 text-center text-caption text-neutral-medium">
          <p>© 2024 {companyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

