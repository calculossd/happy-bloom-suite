import React from 'react';
import robotMascotAsset from '@/assets/robot-mascot.png.asset.json';

const robotMascot = robotMascotAsset.url;

const normalizeRobotClasses = (className = '') =>
  className
    .split(/\s+/)
    .filter((token) => token && !/^(w-|h-|scale-|translate-y-|object-)/.test(token))
    .join(' ');

export const RobotMascot: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src={robotMascot}
    alt="Assistente"
    className={`w-20 h-20 object-contain ${normalizeRobotClasses(className)}`}
    draggable={false}
    decoding="async"
    loading="eager"
    style={{ objectFit: 'contain', background: 'transparent' }}
  />
);
