import React from 'react';

const MATERIAL_COLORS: Record<string, string> = {
  PLA: '#b7ff00',
  PETG: '#ff8a2a',
  TPU: '#22d3ee',
  ABS: '#ef4444',
  ASA: '#a78bfa',
  NYLON: '#f472b6',
  PC: '#60a5fa',
  HIPS: '#fbbf24',
};

export function materialColor(type?: string, fallback = '#b7ff00') {
  if (!type) return fallback;
  const key = String(type).toUpperCase().replace(/[^A-Z]/g, '');
  return MATERIAL_COLORS[key] || fallback;
}

interface FilamentSpoolProps {
  color?: string;
  size?: number;
  className?: string;
  label?: string;
}

export function FilamentSpool({ color = '#b7ff00', size = 40, className, label }: FilamentSpoolProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
    >
      {label && <title>{label}</title>}
      {/* Outer flange */}
      <circle cx="32" cy="32" r="30" fill="#15181a" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {/* Wound filament disc */}
      <circle cx="32" cy="32" r="24" fill={color} />
      {/* Filament wound strands */}
      <g stroke="rgba(0,0,0,0.28)" strokeWidth="0.6" fill="none">
        <circle cx="32" cy="32" r="22" />
        <circle cx="32" cy="32" r="19" />
        <circle cx="32" cy="32" r="16" />
        <circle cx="32" cy="32" r="13" />
      </g>
      {/* Hub */}
      <circle cx="32" cy="32" r="9" fill="#0c0e0d" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      {/* Center hole */}
      <circle cx="32" cy="32" r="3.4" fill="#000" />
      {/* Specular highlight */}
      <ellipse cx="22" cy="22" rx="7" ry="3" fill="rgba(255,255,255,0.22)" transform="rotate(-35 22 22)" />
    </svg>
  );
}

export default FilamentSpool;