import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-md
    transition-all duration-150 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-nexus-bg-primary focus:ring-nexus-primary-500
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
  `;

  const variantStyles = {
    primary: `
      bg-nexus-primary-500 text-white
      hover:bg-nexus-primary-600
      active:bg-nexus-primary-700
      focus:ring-nexus-primary-500
    `,
    secondary: `
      bg-transparent border border-nexus-border text-nexus-text-secondary
      hover:bg-nexus-bg-tertiary hover:text-nexus-text-primary
      active:bg-nexus-bg-secondary
      focus:ring-nexus-border
    `,
    danger: `
      bg-nexus-danger text-white
      hover:bg-red-700
      active:bg-red-800
      focus:ring-nexus-danger
    `,
    ghost: `
      bg-transparent text-nexus-text-secondary
      hover:bg-nexus-bg-tertiary hover:text-nexus-text-primary
      active:bg-nexus-bg-secondary
      focus:ring-nexus-border
    `,
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
