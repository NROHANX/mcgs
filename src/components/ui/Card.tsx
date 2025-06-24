import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden';
  const hoverClasses = hoverable ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{children: React.ReactNode, className?: string}> = ({
  children,
  className = ''
}) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export const CardContent: React.FC<{children: React.ReactNode, className?: string}> = ({
  children,
  className = ''
}) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{children: React.ReactNode, className?: string}> = ({
  children,
  className = ''
}) => {
  return <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>{children}</div>;
};

export default Card;