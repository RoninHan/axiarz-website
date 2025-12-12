import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-white'
  children: React.ReactNode
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-default font-body text-body font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-accent-orange text-primary-white hover:opacity-90 active:opacity-75',
    secondary: 'border-2 border-primary-white text-primary-white hover:bg-primary-white hover:text-primary-black',
    outline: 'border-2 border-primary-black text-primary-black hover:bg-primary-black hover:text-primary-white',
    'outline-white': 'border-2 border-primary-white text-primary-white hover:bg-primary-white hover:text-primary-black',
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

