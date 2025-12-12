import Card from '@/components/client/Card'

export default function SolutionsPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-[1920px]">
      <h1 className="text-title-large font-title mb-8">解决方案</h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-title-medium font-title mb-6">企业解决方案</h2>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <h3 className="text-title-small font-title mb-4">解决方案 {i}</h3>
                <p className="text-body text-neutral-medium">
                  为企业提供完整的科技产品解决方案，满足各种业务需求，提升工作效率。
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-title-medium font-title mb-6">个人解决方案</h2>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <h3 className="text-title-small font-title mb-4">个人方案 {i}</h3>
                <p className="text-body text-neutral-medium">
                  为个人用户提供定制化的科技产品方案，让科技更好地服务于生活。
                </p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

