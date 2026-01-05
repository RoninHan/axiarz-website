import React from 'react'

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  children: React.ReactNode
}

export default function AdminButton({ 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  children, 
  className = '', 
  disabled,
  ...props 
}: AdminButtonProps) {
  const baseClasses = 'border-0 outline-none rounded-xl font-body font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center relative overflow-hidden'
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  }

  const variantClasses = {
    primary: 'bg-accent-orange text-white hover:bg-orange-600 active:bg-orange-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-transparent text-gray-700 hover:text-accent-orange hover:bg-orange-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0',
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      style={{ border: 'none', outline: 'none' }}
      {...props}
    >
      {loading && (
        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
      )}
      {children}
    </button>
  )
}
