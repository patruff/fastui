import React, { useState } from 'react';

export default function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '2px solid var(--border)',
          cursor: 'pointer',
          overflow: 'hidden',
          background: 'var(--bg-elevated)',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {user.displayName?.[0]?.toUpperCase() || '?'}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 40,
            }}
          />
          <div
            className="fade-in"
            style={{
              position: 'absolute',
              top: 36,
              right: 0,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 8,
              minWidth: 180,
              zIndex: 41,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border)',
              marginBottom: 4,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.displayName}</div>
              {user.email && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {user.email}
                </div>
              )}
              <div style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                via {user.provider === 'google' ? 'Google' : 'GitHub'}
              </div>
            </div>

            {user.solanaWallet && (
              <div style={{
                padding: '6px 12px',
                fontSize: 11,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span className="status-dot connected" />
                {user.solanaWallet.slice(0, 4)}...{user.solanaWallet.slice(-4)}
              </div>
            )}

            <button
              onClick={() => { setIsOpen(false); onLogout(); }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'left',
                borderRadius: 6,
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
