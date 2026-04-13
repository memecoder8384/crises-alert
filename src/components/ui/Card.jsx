import React from 'react';

const Card = ({ children, className = '', padding = 'p-6' }) => {
  return (
    <div className={`bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_rgba(50,50,53,0.06)] border border-outline-variant/10 hover:shadow-[0_16px_50px_rgba(50,50,53,0.09)] transition-shadow duration-300 ${padding} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
