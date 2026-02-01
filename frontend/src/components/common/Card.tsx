import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  footer,
  padding = 'md',
  bordered = true,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        bg-nexus-bg-secondary 
        ${bordered ? 'border border-nexus-border' : ''}
        rounded-lg
        ${paddingStyles[padding]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-nexus-text-primary">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-nexus-text-secondary mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-nexus-border">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
