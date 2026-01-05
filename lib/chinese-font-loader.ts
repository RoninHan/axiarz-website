/**
 * 中文字体加载器
 * 为 jsPDF 添加中文字体支持
 * 
 * 注意：这个文件用于集成中文字体
 * 由于字体文件较大，这里提供两种方案：
 * 1. 使用在线字体 URL
 * 2. 使用本地字体文件（需要转换为 base64）
 */

import { jsPDF } from 'jspdf'

/**
 * 添加中文字体到 jsPDF
 * 这个函数目前使用浏览器字体回退机制
 * 
 * 完整实现需要：
 * 1. 下载开源中文字体（如思源黑体 Noto Sans SC）
 * 2. 转换为 base64 格式
 * 3. 使用 jsPDF.addFileToVFS 和 addFont 添加
 */
export function addChineseFontSupport(doc: jsPDF): void {
  // 暂时使用标准字体
  // TODO: 添加真实的中文字体文件
  doc.setFont('helvetica')
}

/**
 * 检查文本是否包含中文字符
 */
export function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text)
}

/**
 * 为包含中文的文本应用特殊处理
 */
export function formatTextForPDF(text: string): string {
  // 如果包含中文，可以在这里做一些预处理
  // 例如：添加空格、调整格式等
  return text
}
