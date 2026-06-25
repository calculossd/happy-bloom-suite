import React from 'react';
import robotMascot from '@/assets/robot-mascot-transparent.png';

export const RobotMascot: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src={robotMascot}
    alt="Assistente"
    className={className}
    draggable={false}
    decoding="async"
    loading="eager"
    style={{ objectFit: 'contain', background: 'transparent' }}
  />
);
