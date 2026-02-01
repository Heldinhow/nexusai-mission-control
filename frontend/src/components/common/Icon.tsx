import React from 'react';
import * as LucideIcons from 'lucide-react';

type IconName = keyof typeof LucideIcons;

export interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  strokeWidth = 2,
}) => {
  const LucideIcon = LucideIcons[name] as React.ComponentType<{
    size?: number | string;
    className?: string;
    strokeWidth?: number;
  }>;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide icons`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
};

export default Icon;
