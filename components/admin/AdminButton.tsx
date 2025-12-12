import React from 'react'

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  children: React.ReactNode
}

export default function AdminButton({ variant = 'primary', children, className = '', ...props }: AdminButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-default font-body text-body font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-accent-orange text-primary-white hover:opacity-90 active:opacity-75',
    secondary: 'border border-neutral-medium text-primary-black hover:bg-neutral-light',
    danger: 'bg-red-500 text-primary-white hover:bg-red-600',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

