import React from 'react';
import robotMascotAsset from '@/assets/robot-mascot.png.asset.json';
const robotMascot = robotMascotAsset.url;

export const RobotMascot: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src={robotMascot}
    alt="Assistente"
    className={className}
    style={{ objectFit: 'contain' }}
  />
);
