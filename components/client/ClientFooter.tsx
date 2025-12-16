export default function ClientFooter() {
  return (
    <footer className="bg-primary-black text-primary-white h-[300px] mt-auto">
      <div className="container mx-auto px-6 py-12 max-w-[1920px]">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <h3 className="text-title-small font-title mb-4">关于我们</h3>
            <p className="text-body text-neutral-medium">
              致力于提供高品质科技产品，创新设计，值得信赖。
            </p>
          </div>
          <div>
            <h3 className="text-title-small font-title mb-4">产品</h3>
            <ul className="space-y-2 text-body text-neutral-medium">
              <li><a href="/products" className="hover:text-accent-orange transition-colors">所有产品</a></li>
              <li><a href="/products?featured=true" className="hover:text-accent-orange transition-colors">精选产品</a></li>
              <li><a href="/files" className="hover:text-accent-orange transition-colors">文件下载</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-title-small font-title mb-4">支持</h3>
            <ul className="space-y-2 text-body text-neutral-medium">
              <li><a href="/help" className="hover:text-accent-orange transition-colors">帮助中心</a></li>
              <li><a href="/contact" className="hover:text-accent-orange transition-colors">联系我们</a></li>
              <li><a href="/solutions" className="hover:text-accent-orange transition-colors">解决方案</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-title-small font-title mb-4">联系方式</h3>
            <p className="text-body text-neutral-medium">
              邮箱: support@axiarz.com<br />
              电话: 400-123-4567
            </p>
          </div>
        </div>
        <div className="border-t border-neutral-medium mt-8 pt-8 text-center text-caption text-neutral-medium">
          <p>© 2024 Axiarz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

