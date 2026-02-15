import React from 'react';

export default function LoginScreen() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 32,
    }}>
      <div style={{
        maxWidth: 360,
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Logo / Title */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 24px rgba(99, 102, 241, 0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Voice UI Builder</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Speak your UI into existence. Powered by AI, pay with crypto.
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, opacity: 0.7 }}>
            10 free builds, then 2 USDC per 10 on Solana
          </p>
        </div>

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a
            href="/api/auth/google"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '12px 20px',
              background: 'white',
              color: '#1f1f1f',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.2s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <a
            href="/api/auth/github"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '12px 20px',
              background: '#24292f',
              color: 'white',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.2s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </a>
        </div>

        {/* Footer info */}
        <div style={{
          marginTop: 32,
          padding: '16px 0',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
            <Feature icon="10" label="Free builds" />
            <Feature icon="2" label="USDC / 10 credits" />
            <Feature icon="DL" label="Download HTML" />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Powered by OpenAI Codex on Cerebras. Pay with Phantom on Solana.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 14,
        fontWeight: 700,
        color: 'var(--primary-light)',
        marginBottom: 2,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
