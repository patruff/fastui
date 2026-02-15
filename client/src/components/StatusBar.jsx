import React from 'react';

export default function StatusBar({ message, type }) {
  if (!message) return null;

  const colors = {
    info: { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' },
    success: { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' },
    loading: { bg: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-light)' },
  };

  const style = colors[type] || colors.info;

  return (
    <div
      className="fade-in"
      style={{
        padding: '6px 12px',
        background: style.bg,
        color: style.color,
        fontSize: 12,
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      {type === 'loading' && (
        <svg width="14" height="14" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeLinecap="round" />
        </svg>
      )}
      {message}
    </div>
  );
}
