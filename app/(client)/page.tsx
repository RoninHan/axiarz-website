'use client'

import Link from 'next/link'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import { useState, useEffect } from 'react'
import type { Product, BrandAdvantage, Testimonial } from '@/types'

export default function HomePage() {
  const [heroImage, setHeroImage] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('Axiarz')
  const [advantages, setAdvantages] = useState<BrandAdvantage[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    // 加载系统设置
    fetch('/api/client/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          const heroSetting = data.settings.find((s: any) => s.key === 'heroImage')
          const nameSetting = data.settings.find((s: any) => s.key === 'companyName')
          const advSetting = data.settings.find((s: any) => s.key === 'brandAdvantages')
          const testSetting = data.settings.find((s: any) => s.key === 'testimonials')
          
          if (heroSetting?.value) setHeroImage(heroSetting.value as string)
          if (nameSetting?.value) setCompanyName(nameSetting.value as string)
          if (advSetting?.value) setAdvantages(advSetting.value as BrandAdvantage[])
          if (testSetting?.value) setTestimonials(testSetting.value as Testimonial[])
        }
      })
      .catch(err => console.error('Failed to load settings:', err))

    // 加载精选产品
    fetch('/api/client/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const featured = data.data.filter((p: Product) => p.featured).slice(0, 4)
          setFeaturedProducts(featured)
        }
      })
      .catch(err => console.error('Failed to load products:', err))
  }, [])

  // 添加到购物车
  async function addToCart(e: React.MouseEvent, productId: string) {
    try {
      const res = await fetch('/api/client/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: '已加入购物车' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || '添加失败' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="w-full">
      {/* 消息提示 */}
      {message && (
        <div className={`fixed top-20 right-6 z-50 px-6 py-3 rounded-default shadow-lg ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* 英雄区 */}
      <section className="bg-primary-black text-primary-white h-[600px] flex items-center">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-title-large font-title mb-6">
                创新科技，<span className="text-accent-orange">引领未来</span>
              </h1>
              <p className="text-body text-neutral-medium mb-8">
                我们致力于提供高品质的科技产品，采用最新技术，性能卓越，满足您的各种需求。
              </p>
              <div className="flex gap-4">
                <Link href="/products">
                  <Button variant="primary">探索产品</Button>
                </Link>
                <Link href="/solutions">
                  <Button variant="outline-white">了解方案</Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              {heroImage ? (
                <img src={heroImage} alt={companyName} className="w-full h-96 object-cover rounded-default" />
              ) : (
                <div className="w-full h-96 bg-neutral-light rounded-default flex items-center justify-center">
                  <span className="text-neutral-medium">产品展示图</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 品牌优势 */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <h2 className="text-title-medium font-title text-center mb-12">品牌优势</h2>
          <div className="grid grid-cols-3 gap-8">
            {advantages.length > 0 ? (
              advantages
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((adv, index) => (
                  <Card key={index}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-accent-orange rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-primary-white text-2xl">{adv.icon}</span>
                      </div>
                      <h3 className="text-title-small font-title mb-2">{adv.title}</h3>
                      <p className="text-body text-neutral-medium">{adv.description}</p>
                    </div>
                  </Card>
                ))
            ) : (
              <>
                <Card>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent-orange rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-primary-white text-2xl">✓</span>
                    </div>
                    <h3 className="text-title-small font-title mb-2">高品质</h3>
                    <p className="text-body text-neutral-medium">
                      采用优质材料，精湛工艺，确保每一件产品都达到最高标准。
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent-orange rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-primary-white text-2xl">⚡</span>
                    </div>
                    <h3 className="text-title-small font-title mb-2">高性能</h3>
                    <p className="text-body text-neutral-medium">
                      采用最新技术，性能卓越，满足您的各种需求。
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent-orange rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-primary-white text-2xl">❤</span>
                    </div>
                    <h3 className="text-title-small font-title mb-2">值得信赖</h3>
                    <p className="text-body text-neutral-medium">
                      完善的售后服务，专业的客户支持，让您购买无忧。
                    </p>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 产品精选 */}
      <section className="py-20 bg-neutral-light">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-title-medium font-title">产品精选</h2>
            <Link href="/products">
              <Button variant="outline">查看更多</Button>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Card key={product.id} className="cursor-pointer">
                  <Link href={`/products/${product.id}`}>
                    <div className="w-full h-48 bg-neutral-medium rounded-default mb-4 flex items-center justify-center overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-neutral-medium">产品图</span>
                      )}
                    </div>
                    <h3 className="text-title-small font-title mb-2">{product.name}</h3>
                    <p className="text-body text-neutral-medium mb-4 line-clamp-2">{product.description}</p>
                  </Link>
                  <div className="flex justify-between items-center">
                    <span className="text-title-small font-title text-accent-orange">¥{product.price}</span>
                    <Button 
                      variant="primary" 
                      className="text-sm py-2 px-4"
                      onClick={(e) => addToCart(e, product.id)}
                    >
                      加入购物车
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              [1, 2, 3, 4].map((i) => (
                <Card key={i} className="cursor-pointer">
                  <div className="w-full h-48 bg-neutral-medium rounded-default mb-4 flex items-center justify-center">
                    <span className="text-neutral-medium">产品图</span>
                  </div>
                  <h3 className="text-title-small font-title mb-2">产品名称 {i}</h3>
                  <p className="text-body text-neutral-medium mb-4">产品描述信息</p>
                  <div className="flex justify-between items-center">
                    <span className="text-title-small font-title text-accent-orange">¥999</span>
                    <Button variant="primary" className="text-sm py-2 px-4">
                      加入购物车
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 客户口碑 */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <h2 className="text-title-medium font-title text-center mb-12">客户口碑</h2>
          <div className="grid grid-cols-3 gap-8">
            {testimonials.length > 0 ? (
              testimonials
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .slice(0, 3)
                .map((test, index) => (
                  <Card key={index}>
                    <div className="flex items-center mb-4">
                      {test.avatar ? (
                        <img src={test.avatar} alt={test.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-neutral-medium rounded-full mr-4"></div>
                      )}
                      <div>
                        <h4 className="text-body font-medium">{test.name}</h4>
                        <p className="text-caption text-neutral-medium">{'⭐'.repeat(test.rating)}评价</p>
                      </div>
                    </div>
                    <p className="text-body text-neutral-medium">{test.content}</p>
                  </Card>
                ))
            ) : (
              [1, 2, 3].map((i) => (
                <Card key={i}>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-neutral-medium rounded-full mr-4"></div>
                    <div>
                      <h4 className="text-body font-medium">客户 {i}</h4>
                      <p className="text-caption text-neutral-medium">5星评价</p>
                    </div>
                  </div>
                  <p className="text-body text-neutral-medium">
                    产品质量非常好，性能卓越，完全超出预期。售后服务也很到位，值得推荐！
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
