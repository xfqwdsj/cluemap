import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-10 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            error ? '' : ''
          } ${className}`}
          style={{
            border: `1px solid ${error ? 'var(--error-border)' : 'var(--border-secondary)'}`,
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            '--tw-ring-color': 'var(--accent-ring)',
          } as React.CSSProperties}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm" style={{ color: 'var(--error-text)' }}>{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
