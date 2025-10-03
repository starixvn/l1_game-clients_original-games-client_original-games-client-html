import React from 'react';

interface RoundMultiplierItemProps {
  multiplier: number;
  className?: string;
}

const RoundMultiplierItem: React.FC<RoundMultiplierItemProps> = ({
  multiplier,
  className = ''
}) => {
  return (
    <div 
      className={`flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white font-bold rounded whitespace-nowrap flex-shrink-0 min-w-[60px] text-sm ${className}`}
    >
      {multiplier.toFixed(2)}x
    </div>
  );
};

export default RoundMultiplierItem;