import React from 'react'

interface AdminCardProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export default function AdminCard({ children, className = '', title }: AdminCardProps) {
  return (
    <div className={`bg-primary-white border border-neutral-medium rounded-default p-6 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-title-small font-title mb-4">{title}</h3>
      )}
      {children}
    </div>
  )
}

