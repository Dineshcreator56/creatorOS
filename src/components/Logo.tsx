import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background rounded square */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="20"
          ry="20"
          fill="url(#logoGradient)"
        />
        
        {/* Gear/Settings icon */}
        <path
          d="M50 30c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20zm0 30c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z"
          fill="white"
        />
        
        {/* Gear teeth */}
        <path
          d="M50 20v10m0 40v10m20-30h-10m-40 0h10m17.071-17.071l-7.071 7.071m28.284 28.284l-7.071-7.071m0-28.284l7.071 7.071m-28.284 28.284l7.071-7.071"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Center circle */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="url(#centerGradient)"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;