import React from 'react';
import CreditsBadge from './CreditsBadge';
import UserMenu from './UserMenu';

export default function Toolbar({
  status,
  onShowCode,
  onShowTranscript,
  onClearUI,
  onDownload,
  hasCode,
  selectedElement,
  user,
  credits,
  onShowPayment,
  onLogout,
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Left: Logo + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>VoiceUI</span>
        <span className={`status-dot ${status}`} />
      </div>

      {/* Center: Selected element or credits */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {selectedElement && (
          <div style={{
            fontSize: 11,
            color: 'var(--primary-light)',
            background: 'var(--bg-elevated)',
            padding: '2px 8px',
            borderRadius: 4,
            maxWidth: 100,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            &lt;{selectedElement.tagName?.toLowerCase()}&gt;
          </div>
        )}
        {credits && (
          <CreditsBadge credits={credits} onClick={onShowPayment} />
        )}
      </div>

      {/* Right: Action buttons + user menu */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <ToolbarButton onClick={onShowTranscript} title="Transcript">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </ToolbarButton>

        <ToolbarButton onClick={onShowCode} disabled={!hasCode} title="View code">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </ToolbarButton>

        <ToolbarButton onClick={onDownload} disabled={!hasCode} title="Download UI">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </ToolbarButton>

        <ToolbarButton onClick={onClearUI} disabled={!hasCode} title="Clear">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </ToolbarButton>

        {user && <UserMenu user={user} onLogout={onLogout} />}
      </div>
    </div>
  );
}

function ToolbarButton({ children, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: 'none',
        border: 'none',
        color: disabled ? 'var(--border)' : 'var(--text-muted)',
        cursor: disabled ? 'default' : 'pointer',
        padding: 6,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}
