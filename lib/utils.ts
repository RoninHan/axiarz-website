/**
 * 将 Prisma Decimal 类型转换为数字
 * @param value Prisma Decimal 值（可能是字符串或数字）
 * @returns 数字类型的值
 */
export function toNumber(value: any): number {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    return parseFloat(value)
  }
  // 处理其他可能的类型
  return Number(value) || 0
}

/**
 * 格式化金额显示
 * @param amount 金额值
 * @param decimals 小数位数，默认2位
 * @returns 格式化的金额字符串
 */
export function formatCurrency(amount: any, decimals: number = 2): string {
  return `¥${toNumber(amount).toFixed(decimals)}`
}
