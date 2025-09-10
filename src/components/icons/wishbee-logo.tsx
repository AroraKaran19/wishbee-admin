import React from 'react';

interface WishBeeLogoProps {
  className?: string;
}

export function WishBeeLogo({ className }: WishBeeLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="text-2xl font-bold text-primary">WishBee</span>
    </div>
  );
}
