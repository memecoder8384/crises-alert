import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  loading = false,
  ...props 
}) => {
  const baseClasses = `inline-flex items-center justify-center font-bold rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5`;
  const sizeClasses = {
    sm: 'py-2 px-4 text-xs',
    md: 'py-3 px-6 text-sm',
    lg: 'py-4 px-8 text-base tracking-wide'
  }[size];

  const variantClasses = {
    primary: 'bg-gradient-to-br from-primary to-primary-dim text-on-primary shadow-lg shadow-primary/20 hover:shadow-primary/40',
    danger: 'bg-gradient-to-br from-error to-error-dim text-on-error shadow-lg shadow-error/20 hover:shadow-error/40',
    safe: 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-700',
    outline: 'border-2 border-outline-variant text-on-surface hover:bg-surface-container hover:border-primary',
    ghost: 'bg-transparent text-primary hover:bg-primary/5'
  }[variant] || variantClasses.primary;

  const fullWidthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${fullWidthClass} ${className}`} 
      disabled={loading || props.disabled} 
      {...props}
    >
      {loading && (
        <span className="material-symbols-outlined animate-spin mr-2 text-[18px]">progress_activity</span>
      )}
      {children}
    </button>
  );
};

export default Button;
