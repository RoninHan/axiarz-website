import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-white' | 'gradient' | 'success' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  children: React.ReactNode
}

export default function Button({ 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  children, 
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'border-0 outline-none rounded-xl font-body font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center relative overflow-hidden'
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  }

  const variantClasses = {
    primary: 'bg-accent-orange text-white hover:bg-orange-600 active:bg-orange-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-transparent text-primary-white hover:bg-primary-white hover:text-primary-black',
    outline: 'bg-transparent text-gray-700 hover:text-accent-orange hover:bg-orange-50',
    'outline-white': 'bg-transparent text-primary-white hover:bg-primary-white hover:text-primary-black',
    gradient: 'bg-gradient-to-r from-accent-orange via-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:from-orange-600 hover:via-orange-500 hover:to-accent-orange transform hover:-translate-y-0.5 active:translate-y-0 relative before:absolute before:inset-0 before:bg-white before:opacity-0 hover:before:opacity-10 before:transition-opacity',
    success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0',
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
