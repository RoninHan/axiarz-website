'use client'

import { useEffect, useState } from 'react'
import AdminCard from '@/components/admin/AdminCard'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    userCount: 0,
    orderCount: 0,
    totalSales: 0,
    topProducts: [] as any[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        label: '订单数',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: '#FF7F00',
        backgroundColor: 'rgba(255, 127, 0, 0.1)',
      },
      {
        label: '销售额',
        data: [1000, 2000, 1500, 3000, 2500, 4000],
        borderColor: '#000000',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      },
    ],
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-title-large font-title mb-6">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <AdminCard>
          <div className="text-center">
            <p className="text-caption text-neutral-medium mb-2">用户总数</p>
            <p className="text-title-large font-title text-accent-orange">{stats.userCount}</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <p className="text-caption text-neutral-medium mb-2">订单总数</p>
            <p className="text-title-large font-title text-accent-orange">{stats.orderCount}</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <p className="text-caption text-neutral-medium mb-2">总销售额</p>
            <p className="text-title-large font-title text-accent-orange">
              ¥{stats.totalSales.toFixed(2)}
            </p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <p className="text-caption text-neutral-medium mb-2">热门产品</p>
            <p className="text-title-large font-title text-accent-orange">{stats.topProducts.length}</p>
          </div>
        </AdminCard>
      </div>

      {/* 图表 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <AdminCard title="订单趋势">
          <Line data={chartData} options={{ responsive: true }} />
        </AdminCard>
        <AdminCard title="热门产品">
          <div className="space-y-3">
            {stats.topProducts.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-body">{item.productName}</span>
                <span className="text-body font-medium">{item.totalQuantity} 件</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  )
}

