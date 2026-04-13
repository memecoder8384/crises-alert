import React from 'react';

const Input = React.forwardRef(({ label, error, rightElement, className = '', ...props }, ref) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && <label className="block text-xs font-semibold text-primary uppercase tracking-wider">{label}</label>}
      <div className="relative flex items-center">
        <input 
          ref={ref} 
          className={`w-full px-4 py-3.5 rounded-lg bg-surface-container-high border-none focus:ring-2 focus:bg-surface-container-lowest transition-all duration-300 text-on-surface placeholder:text-outline-variant ${error ? 'focus:ring-error shadow-sm shadow-error/10' : 'focus:ring-primary/20'}`} 
          style={{ paddingRight: rightElement ? '2.5rem' : '1rem' }}
          {...props} 
        />
        {rightElement && (
          <div className="absolute right-3 flex text-secondary">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-[10px] font-bold text-error uppercase tracking-wider mt-1 block">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
