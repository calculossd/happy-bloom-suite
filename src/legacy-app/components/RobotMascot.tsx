import React from 'react';

export const RobotMascot: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 128 128"
    className={className}
    role="img"
    aria-label="Assistente"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="robotGlow" cx="50%" cy="45%" r="58%">
        <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.95" />
        <stop offset="54%" stopColor="#2563EB" stopOpacity="0.34" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="helmet" x1="27" y1="23" x2="101" y2="105" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F8FAFC" />
        <stop offset="0.48" stopColor="#9FB7D8" />
        <stop offset="1" stopColor="#2A3A61" />
      </linearGradient>
      <linearGradient id="face" x1="33" y1="44" x2="95" y2="88" gradientUnits="userSpaceOnUse">
        <stop stopColor="#071B36" />
        <stop offset="1" stopColor="#020617" />
      </linearGradient>
      <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.55" />
        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#22D3EE" floodOpacity="0.36" />
      </filter>
    </defs>

    <circle cx="64" cy="68" r="52" fill="url(#robotGlow)" opacity="0.55" />
    <g filter="url(#softShadow)">
      <path
        d="M25 66C25 43.36 42.46 27 64 27s39 16.36 39 39-17.46 39-39 39-39-16.36-39-39Z"
        fill="url(#helmet)"
      />
      <path
        d="M37 64c0-14.91 11.5-24 27-24s27 9.09 27 24-11.5 24-27 24-27-9.09-27-24Z"
        fill="url(#face)"
        stroke="#7DD3FC"
        strokeWidth="3"
      />
      <path d="M20 60c0-8.28 5.15-15 11.5-15H36v30h-4.5C25.15 75 20 68.28 20 60Z" fill="#79A7DD" />
      <path d="M108 60c0-8.28-5.15-15-11.5-15H92v30h4.5c6.35 0 11.5-6.72 11.5-15Z" fill="#79A7DD" />
      <circle cx="52" cy="64" r="9" fill="#E0F2FE" />
      <circle cx="76" cy="64" r="9" fill="#E0F2FE" />
      <circle cx="52" cy="64" r="4" fill="#0284C7" />
      <circle cx="76" cy="64" r="4" fill="#0284C7" />
      <path d="M57 79c4.5 3.2 9.5 3.2 14 0" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M45 42c8-6.4 28-8.2 39.5 1.6" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.24" fill="none" />
      <path d="M42 101h44l-6 12H48l-6-12Z" fill="#58729B" opacity="0.9" />
    </g>
  </svg>
);
