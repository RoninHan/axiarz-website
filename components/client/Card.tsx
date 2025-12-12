import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-primary-white border border-neutral-medium rounded-default p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

