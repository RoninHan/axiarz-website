'use client'

import { useEffect, useState } from 'react'
import { message, Modal, Select, Spin } from 'antd'
import { 
  WalletOutlined, 
  PlusOutlined, 
  HistoryOutlined,
  CreditCardOutlined,
  LeftOutlined
} from '@ant-design/icons'
import Link from 'next/link'
import Button from '@/components/client/Button'
import Card from '@/components/client/Card'
import ProtectedRoute from '@/components/client/ProtectedRoute'

interface WalletData {
  balance: string
  frozen: string
}

interface Transaction {
  id: string
  type: string
  amount: string
  balance: string
  description: string
  status: string
  createdAt: string
}

interface PaymentMethod {
  name: string
  displayName: string
  enabled: boolean
}

function WalletPageContent() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    fetchWallet()
    fetchTransactions()
    fetchPaymentMethods()
  }, [])

  async function fetchWallet() {
    try {
      const res = await fetch('/api/client/wallet')
      const data = await res.json()
      if (data.success) {
        setWallet(data.data)
      }
    } catch (error) {
      console.error('获取钱包信息失败:', error)
    }
  }

  async function fetchTransactions() {
    try {
      const res = await fetch('/api/client/wallet/transactions')
      const data = await res.json()
      if (data.success) {
        setTransactions(data.data)
      }
    } catch (error) {
      console.error('获取交易记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPaymentMethods() {
    try {
      const res = await fetch('/api/client/payment-methods')
      const data = await res.json()
      if (data.success) {
        setPaymentMethods(data.data)
        if (data.data.length > 0) {
          setSelectedPayment(data.data[0].name)
        }
      }
    } catch (error) {
      console.error('获取支付方式失败:', error)
    }
  }

  async function handleRecharge() {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      messageApi.error('请输入有效的充值金额')
      return
    }

    if (parseFloat(rechargeAmount) < 1) {
      messageApi.error('最低充值金额为 ¥1')
      return
    }

    if (!selectedPayment) {
      messageApi.error('请选择支付方式')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/client/wallet/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(rechargeAmount),
          paymentMethod: selectedPayment
        })
      })
      const data = await res.json()

      if (data.success) {
        messageApi.success('正在跳转到支付页面...')
        setShowRechargeModal(false)
        
        // 跳转到支付页面 - 支付宝返回HTML表单，需要在新窗口渲染
        if (data.data.paymentUrl) {
          // 支付宝返回的是HTML表单，需要在当前页面渲染
          const paymentWindow = window.open('', '_self')
          if (paymentWindow) {
            paymentWindow.document.write(data.data.paymentUrl)
            paymentWindow.document.close()
          }
        }
      } else {
        messageApi.error(data.error || '充值失败')
      }
    } catch (error) {
      messageApi.error('充值失败')
    } finally {
      setSubmitting(false)
    }
  }

  function getTypeText(type: string) {
    const map: Record<string, string> = {
      RECHARGE: '充值',
      PAYMENT: '支付',
      REFUND: '退款',
      WITHDRAW: '提现'
    }
    return map[type] || type
  }

  function getTypeColor(type: string) {
    const map: Record<string, string> = {
      RECHARGE: 'text-green-600',
      PAYMENT: 'text-red-600',
      REFUND: 'text-blue-600',
      WITHDRAW: 'text-orange-600'
    }
    return map[type] || 'text-gray-600'
  }

  function getStatusText(status: string) {
    const map: Record<string, string> = {
      pending: '待处理',
      completed: '已完成',
      failed: '失败'
    }
    return map[status] || status
  }

  function getStatusColor(status: string) {
    const map: Record<string, string> = {
      pending: 'text-yellow-600 bg-yellow-50',
      completed: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50'
    }
    return map[status] || 'text-gray-600 bg-gray-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4]">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8">
      {contextHolder}
      
      {/* 顶部返回栏 */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <Link href="/profile" className="inline-flex items-center gap-2 text-gray-700 hover:text-accent-orange transition-colors">
          <LeftOutlined />
          <span>返回个人中心</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* 钱包余额卡片 */}
        <Card className="mb-6 bg-gradient-to-br from-accent-orange to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 mb-2 flex items-center gap-2">
                <WalletOutlined />
                钱包余额
              </p>
              <h2 className="text-4xl font-bold mb-1">
                ¥{wallet ? Number(wallet.balance).toFixed(2) : '0.00'}
              </h2>
              {wallet && Number(wallet.frozen) > 0 && (
                <p className="text-white/70 text-sm">
                  冻结金额: ¥{Number(wallet.frozen).toFixed(2)}
                </p>
              )}
            </div>
            <Button 
              variant="secondary" 
              size="medium"
              onClick={() => setShowRechargeModal(true)}
            >
              <PlusOutlined className="mr-2" />
              立即充值
            </Button>
          </div>
        </Card>

        {/* 交易记录 */}
        <Card>
          <h3 className="text-title-small font-bold mb-6 flex items-center gap-2 text-gray-800">
            <HistoryOutlined className="text-accent-orange" />
            交易记录
          </h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <HistoryOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">暂无交易记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-medium ${getTypeColor(tx.type)}`}>
                        {getTypeText(tx.type)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(tx.status)}`}>
                        {getStatusText(tx.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{tx.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(tx.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      tx.type === 'RECHARGE' || tx.type === 'REFUND' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {tx.type === 'RECHARGE' || tx.type === 'REFUND' ? '+' : '-'}
                      ¥{Number(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      余额: ¥{Number(tx.balance).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 充值弹窗 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <WalletOutlined className="text-accent-orange" />
            <span>钱包充值</span>
          </div>
        }
        open={showRechargeModal}
        onOk={handleRecharge}
        onCancel={() => {
          setShowRechargeModal(false)
          setRechargeAmount('')
        }}
        okText="确认充值"
        cancelText="取消"
        okButtonProps={{ loading: submitting }}
        width={500}
      >
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              充值金额（元） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
              placeholder="请输入充值金额"
              min="1"
              step="0.01"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">最低充值金额为 ¥1</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              支付方式 <span className="text-red-500">*</span>
            </label>
            <Select
              className="w-full"
              size="large"
              value={selectedPayment}
              onChange={setSelectedPayment}
              options={paymentMethods.map(pm => ({
                label: (
                  <div className="flex items-center gap-2">
                    <CreditCardOutlined />
                    {pm.displayName}
                  </div>
                ),
                value: pm.name
              }))}
            />
          </div>

          {/* 快捷金额选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              快捷金额
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 50, 100, 500].map(amount => (
                <button
                  key={amount}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-accent-orange hover:text-accent-orange transition-colors"
                  onClick={() => setRechargeAmount(amount.toString())}
                >
                  ¥{amount}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletPageContent />
    </ProtectedRoute>
  )
}
