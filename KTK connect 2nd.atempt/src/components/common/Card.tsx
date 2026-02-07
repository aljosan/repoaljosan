import React from 'react';

const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = '',
}) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
    {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
    <div className={title ? 'mt-4 space-y-4' : 'space-y-4'}>{children}</div>
  </section>
);

export default Card;
