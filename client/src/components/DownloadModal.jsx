import React, { useState } from 'react';

export default function DownloadModal({ isOpen, onClose, uiCode }) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !uiCode) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: uiCode }),
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-ui-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(onClose, 500);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
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
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Download Your UI</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Export as a standalone HTML file with Tailwind CSS included.
        </p>

        {/* Preview of what they're downloading */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
          background: 'var(--bg-elevated)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Standalone HTML</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Complete HTML file with Tailwind CSS CDN, responsive meta tags, and your generated UI. Open in any browser — no build step needed.
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: downloading ? 'wait' : 'pointer',
            opacity: downloading ? 0.8 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {downloading ? 'Downloading...' : 'Download HTML File'}
        </button>

        <div style={{
          marginTop: 12,
          fontSize: 11,
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          Powered by OpenAI Codex
        </div>
      </div>
    </>
  );
}
