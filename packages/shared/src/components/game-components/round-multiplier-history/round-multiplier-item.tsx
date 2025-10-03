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
      className={`flex items-center justify-center px-2 py-[2px] rounded-[6px] border border-[rgba(255,255,255,0.2)] bg-[rgba(172,164,255,0.8)] text-white whitespace-nowrap flex-shrink-0 min-w-10 text-sm font-semibold ${className}`}
    >
      {multiplier.toFixed(2)}x
    </div>
  );
};

export default RoundMultiplierItem;