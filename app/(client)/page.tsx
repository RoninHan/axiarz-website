import Link from 'next/link'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'

export default function HomePage() {
  return (
    <div className="w-full">
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
              <div className="w-full h-96 bg-neutral-light rounded-default flex items-center justify-center">
                <span className="text-neutral-medium">产品展示图</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 品牌优势 */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <h2 className="text-title-medium font-title text-center mb-12">品牌优势</h2>
          <div className="grid grid-cols-3 gap-8">
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
            {[1, 2, 3, 4].map((i) => (
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
            ))}
          </div>
        </div>
      </section>

      {/* 客户口碑 */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <h2 className="text-title-medium font-title text-center mb-12">客户口碑</h2>
          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
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
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
