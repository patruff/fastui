import React from 'react';

export default function CodePanel({ code, isOpen, onClose }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code || '').then(() => {
      // Brief visual feedback handled by button state
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: isOpen ? '85vw' : 0,
        maxWidth: 500,
        background: 'var(--bg-surface)',
        borderLeft: isOpen ? '1px solid var(--border)' : 'none',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Generated Code</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={copyToClipboard}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Copy
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 20,
            }}
          >
            &times;
          </button>
        </div>
      </div>

      <pre style={{
        flex: 1,
        overflow: 'auto',
        padding: 16,
        margin: 0,
        fontSize: 12,
        lineHeight: 1.5,
        color: '#a5b4fc',
        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {code || 'No code generated yet.'}
      </pre>
    </div>
  );
}
