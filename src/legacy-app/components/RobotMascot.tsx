import React from 'react';
import robotMascot from '@/assets/robot-mascot.png';

export const RobotMascot: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src={robotMascot}
    alt="Assistente"
    className={className}
    style={{ objectFit: 'contain' }}
  />
);
