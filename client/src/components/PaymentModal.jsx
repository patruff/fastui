import React, { useState } from 'react';

export default function PaymentModal({ isOpen, onClose, credits, phantom, onPurchaseComplete }) {
  const [status, setStatus] = useState('idle'); // idle | building | signing | confirming | done | error
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!phantom.publicKey) {
      setError('Connect your Phantom wallet first');
      return;
    }

    try {
      setStatus('building');
      setError('');

      // Get the transaction to sign from the server
      const buildRes = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress: phantom.publicKey }),
      });

      if (!buildRes.ok) {
        const data = await buildRes.json();
        throw new Error(data.error || 'Failed to build transaction');
      }

      const { transaction } = await buildRes.json();

      setStatus('signing');

      // Sign and send via Phantom
      const signature = await phantom.signAndSendTransaction(transaction);

      setStatus('confirming');

      // Verify on server and add credits
      const verifyRes = await fetch('/api/credits/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ signature }),
      });

      const result = await verifyRes.json();
      if (!result.success) throw new Error(result.error);

      setStatus('done');
      onPurchaseComplete?.(result);

      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.message || 'Transaction failed');
      setStatus('error');
    }
  };

  const statusMessages = {
    building: 'Preparing transaction...',
    signing: 'Approve in Phantom...',
    confirming: 'Confirming on Solana...',
    done: 'Credits added!',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 50,
        }}
      />

      {/* Modal */}
      <div
        className="fade-in"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg-surface)',
          borderRadius: '16px 16px 0 0',
          padding: '24px 20px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          zIndex: 51,
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Get More Credits</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          You have <strong style={{ color: credits.remaining > 0 ? 'var(--success)' : 'var(--danger)' }}>
            {credits.remaining}
          </strong> credits remaining
        </p>

        {/* Credit pack */}
        <div style={{
          border: '1px solid var(--primary)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          background: 'rgba(99, 102, 241, 0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>10 UI Credits</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Generate or modify 10 UI components
              </div>
            </div>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--primary-light)',
            }}>
              2 USDC
            </div>
          </div>
        </div>

        {/* Wallet connection */}
        {!phantom.publicKey ? (
          <button
            onClick={phantom.connect}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #ab9ff2, #6366f1)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <PhantomIcon />
            Connect Phantom Wallet
          </button>
        ) : (
          <>
            {/* Connected wallet info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              marginBottom: 12,
              fontSize: 12,
            }}>
              <span className="status-dot connected" />
              <span style={{ color: 'var(--text-muted)' }}>
                {phantom.publicKey.slice(0, 4)}...{phantom.publicKey.slice(-4)}
              </span>
              <button
                onClick={phantom.disconnect}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 11,
                  textDecoration: 'underline',
                }}
              >
                disconnect
              </button>
            </div>

            {/* Purchase button */}
            <button
              onClick={handlePurchase}
              disabled={status !== 'idle' && status !== 'error'}
              style={{
                width: '100%',
                padding: '14px',
                background: status === 'done'
                  ? 'var(--success)'
                  : 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: (status !== 'idle' && status !== 'error') ? 'wait' : 'pointer',
                opacity: (status !== 'idle' && status !== 'error') ? 0.8 : 1,
              }}
            >
              {statusMessages[status] || 'Pay 2 USDC for 10 Credits'}
            </button>
          </>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            borderRadius: 8,
            fontSize: 12,
          }}>
            {error}
          </div>
        )}

        {/* Info footer */}
        <div style={{
          marginTop: 16,
          fontSize: 11,
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          Payments are processed on Solana via USDC.
          <br />Credits are added instantly after confirmation.
        </div>
      </div>
    </>
  );
}

function PhantomIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
      <circle cx="64" cy="64" r="64" fill="url(#phantom-gradient)" />
      <path d="M110.584 64.914H99.142c0-24.098-19.539-43.637-43.637-43.637-23.655 0-42.91 18.841-43.604 42.326-.725 24.497 19.39 45.248 43.893 45.248h2.013c21.467 0 40.962-12.693 49.514-32.38a4.793 4.793 0 0 0-4.422-6.57h-5.297c-1.679 0-3.2.889-4.04 2.339-6.746 11.657-19.232 19.611-33.754 19.611h-2.013c-16.237 0-29.59-12.78-29.225-29.005.346-15.43 13.328-27.87 28.78-27.87 15.904 0 28.804 12.9 28.804 28.805v1.133a4.793 4.793 0 0 0 4.793 4.793h15.201a4.793 4.793 0 0 0 4.793-4.793z" fill="white"/>
      <circle cx="42" cy="63" r="5" fill="url(#phantom-gradient)" />
      <circle cx="62" cy="63" r="5" fill="url(#phantom-gradient)" />
      <defs>
        <linearGradient id="phantom-gradient" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
          <stop stopColor="#534BB1" />
          <stop offset="1" stopColor="#551BF9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
