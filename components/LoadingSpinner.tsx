

import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg', color?: string }> = ({ size = 'md', color = '#10B981' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  return (
    <div className={`sk-chase ${sizeClasses[size]}`}>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <style>{`
        .sk-chase {
          animation: sk-chase 2.5s infinite linear both;
        }
        
        .sk-chase-dot {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0; 
          animation: sk-chase-dot 2.0s infinite ease-in-out both; 
        }
        
        .sk-chase-dot:before {
          content: '';
          display: block;
          width: 25%;
          height: 25%;
          background-color: ${color};
          border-radius: 100%;
          animation: sk-chase-dot-before 2.0s infinite ease-in-out both; 
        }
        
        .sk-chase-dot:nth-of-type(1) { animation-delay: -1.1s; }
        .sk-chase-dot:nth-of-type(2) { animation-delay: -1.0s; }
        .sk-chase-dot:nth-of-type(3) { animation-delay: -0.9s; }
        .sk-chase-dot:nth-of-type(4) { animation-delay: -0.8s; }
        .sk-chase-dot:nth-of-type(5) { animation-delay: -0.7s; }
        .sk-chase-dot:nth-of-type(6) { animation-delay: -0.6s; }
        .sk-chase-dot:nth-of-type(1):before { animation-delay: -1.1s; }
        .sk-chase-dot:nth-of-type(2):before { animation-delay: -1.0s; }
        .sk-chase-dot:nth-of-type(3):before { animation-delay: -0.9s; }
        .sk-chase-dot:nth-of-type(4):before { animation-delay: -0.8s; }
        .sk-chase-dot:nth-of-type(5):before { animation-delay: -0.7s; }
        .sk-chase-dot:nth-of-type(6):before { animation-delay: -0.6s; }
        
        @keyframes sk-chase {
          100% { transform: rotate(360deg); } 
        }
        
        @keyframes sk-chase-dot {
          80%, 100% { transform: rotate(360deg); } 
        }
        
        @keyframes sk-chase-dot-before {
          50% {
            transform: scale(0.4); 
          } 100%, 0% {
            transform: scale(1.0); 
          } 
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;