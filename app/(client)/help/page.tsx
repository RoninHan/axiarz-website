'use client'

import Card from '@/components/client/Card'
import { useState } from 'react'

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: '如何注册账号？',
      answer: '点击页面右上角的"注册"按钮，填写您的邮箱、姓名和密码即可完成注册。注册后您可以享受购物、查看订单等更多功能。'
    },
    {
      question: '如何下单购买产品？',
      answer: '浏览产品页面，选择您喜欢的产品，点击"加入购物车"。然后进入购物车页面，确认订单信息后点击"去结算"，填写收货地址和选择支付方式即可完成下单。'
    },
    {
      question: '支持哪些支付方式？',
      answer: '我们支持支付宝、微信支付、银行卡等多种支付方式。您可以在结算页面选择最适合您的支付方式。'
    },
    {
      question: '配送需要多长时间？',
      answer: '一般情况下，我们会在24小时内发货。配送时间根据您的地址而定，通常3-7个工作日可以送达。偏远地区可能需要更长时间。'
    },
    {
      question: '可以修改或取消订单吗？',
      answer: '订单提交后，如果还未发货，您可以在"我的订单"页面申请取消。如果订单已发货，请联系客服处理退货事宜。'
    },
    {
      question: '如何查看订单状态？',
      answer: '登录后点击"我的订单"，您可以查看所有订单的状态，包括待支付、待发货、已发货、已完成等。'
    },
    {
      question: '产品有质量问题怎么办？',
      answer: '我们对产品质量严格把关。如果收到的产品有质量问题，请在收货后7天内联系客服，我们会为您提供退换货服务。'
    },
    {
      question: '支持退货退款吗？',
      answer: '在收到产品后7天内，如产品未使用且包装完好，您可以申请退货退款。请联系客服提供订单号和退货原因。'
    },
    {
      question: '忘记密码怎么办？',
      answer: '在登录页面点击"忘记密码"，输入您注册时使用的邮箱，我们会发送密码重置链接到您的邮箱。'
    },
    {
      question: '如何联系客服？',
      answer: '您可以访问"联系我们"页面，通过电话、邮箱或在线留言的方式联系我们的客服团队。我们的工作时间是周一至周五 9:00-18:00。'
    }
  ]

  const guides = [
    {
      title: '新手指南',
      icon: '📖',
      items: [
        '注册与登录',
        '浏览产品',
        '添加购物车',
        '提交订单',
        '完成支付'
      ]
    },
    {
      title: '购物流程',
      icon: '🛒',
      items: [
        '选择产品',
        '确认订单',
        '填写地址',
        '选择支付',
        '等待发货'
      ]
    },
    {
      title: '售后服务',
      icon: '🔧',
      items: [
        '退换货政策',
        '质量保证',
        '维修服务',
        '客户支持',
        '投诉建议'
      ]
    },
    {
      title: '账号管理',
      icon: '👤',
      items: [
        '修改个人信息',
        '管理收货地址',
        '修改密码',
        '查看订单',
        '账号安全'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* 页头 */}
      <div className="bg-primary-black text-primary-white py-16">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <h1 className="text-title-large font-title mb-4">帮助中心</h1>
          <p className="text-body text-neutral-medium">
            我们随时为您提供帮助，解答您的疑问
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-[1920px] py-12">
        {/* 快速指南 */}
        <section className="mb-16">
          <h2 className="text-title-medium font-title mb-8">快速指南</h2>
          <div className="grid grid-cols-4 gap-6">
            {guides.map((guide, index) => (
              <Card key={index}>
                <div className="text-center mb-4">
                  <span className="text-5xl">{guide.icon}</span>
                </div>
                <h3 className="text-title-small font-title mb-4 text-center">
                  {guide.title}
                </h3>
                <ul className="space-y-2">
                  {guide.items.map((item, i) => (
                    <li key={i} className="text-body text-neutral-medium flex items-center">
                      <span className="text-accent-orange mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* 常见问题 */}
        <section>
          <h2 className="text-title-medium font-title mb-8">常见问题</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="cursor-pointer" onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}>
                <div className="flex justify-between items-center">
                  <h3 className="text-title-small font-medium">
                    {faq.question}
                  </h3>
                  <span className="text-2xl text-accent-orange transition-transform duration-200"
                    style={{ transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    ▼
                  </span>
                </div>
                {expandedFaq === index && (
                  <p className="text-body text-neutral-medium mt-4 pt-4 border-t border-neutral-light">
                    {faq.answer}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* 联系客服 */}
        <section className="mt-16 text-center">
          <Card className="bg-primary-black text-primary-white">
            <h3 className="text-title-medium font-title mb-4">
              没有找到您需要的答案？
            </h3>
            <p className="text-body text-neutral-medium mb-6">
              我们的客服团队随时为您提供帮助
            </p>
            <a href="/contact" className="inline-block px-8 py-3 bg-accent-orange text-primary-white rounded-default hover:opacity-90 transition-opacity">
              联系客服
            </a>
          </Card>
        </section>
      </div>
    </div>
  )
}
