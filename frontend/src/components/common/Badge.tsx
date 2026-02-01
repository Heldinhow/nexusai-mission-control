import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-nexus-border text-nexus-text-secondary',
    success: 'bg-nexus-success/20 text-nexus-success border border-nexus-success/30',
    warning: 'bg-nexus-warning/20 text-nexus-warning border border-nexus-warning/30',
    danger: 'bg-nexus-danger/20 text-nexus-danger border border-nexus-danger/30',
    info: 'bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30',
  }
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }
  
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  )
}
