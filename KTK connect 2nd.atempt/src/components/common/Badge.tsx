import React from 'react';

const Badge: React.FC<{ label: string; tone?: 'info' | 'success' | 'warning' }> = ({
  label,
  tone = 'info',
}) => {
  const toneStyles = {
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
  } as const;

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneStyles[tone]}`}>{label}</span>;
};

export default Badge;
