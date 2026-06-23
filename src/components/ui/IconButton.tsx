import { ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', className = '', children, ...props }, ref) => {
    const sizeStyles = {
      sm: 'p-1.5',
      md: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
