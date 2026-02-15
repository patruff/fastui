import React from 'react';

export default function CreditsBadge({ credits, onClick }) {
  const isLow = credits.remaining <= 2;
  const isEmpty = credits.remaining <= 0;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        background: isEmpty
          ? 'rgba(239, 68, 68, 0.15)'
          : isLow
            ? 'rgba(234, 179, 8, 0.15)'
            : 'var(--bg-elevated)',
        border: `1px solid ${isEmpty ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--border)'}`,
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        color: isEmpty ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--text)',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      {credits.remaining}
    </button>
  );
}
