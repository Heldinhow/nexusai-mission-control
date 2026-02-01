import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-nexus-bg-tertiary text-nexus-text-secondary',
    primary: 'bg-nexus-primary-500/10 text-nexus-primary-500 border border-nexus-primary-500/20',
    success: 'bg-nexus-success/10 text-nexus-success border border-nexus-success/20',
    warning: 'bg-nexus-warning/10 text-nexus-warning border border-nexus-warning/20',
    danger: 'bg-nexus-danger/10 text-nexus-danger border border-nexus-danger/20',
    info: 'bg-nexus-accent-500/10 text-nexus-accent-500 border border-nexus-accent-500/20',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </span>
  );
};

export default Badge;
