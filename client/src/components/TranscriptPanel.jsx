import React, { useRef, useEffect } from 'react';

export default function TranscriptPanel({ messages, isOpen, onClose }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: isOpen ? '40vh' : 0,
        background: 'var(--bg-surface)',
        borderTop: isOpen ? '1px solid var(--border)' : 'none',
        transition: 'max-height 0.3s ease',
        overflow: 'hidden',
        zIndex: 20,
        borderRadius: '12px 12px 0 0',
      }}
    >
      {/* Handle bar */}
      <div
        onClick={onClose}
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '8px 0 4px',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 36,
          height: 4,
          borderRadius: 2,
          background: 'var(--border)',
        }} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px 8px',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Conversation</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          &times;
        </button>
      </div>

      <div
        ref={scrollRef}
        style={{
          padding: '0 16px 16px',
          overflowY: 'auto',
          maxHeight: 'calc(40vh - 60px)',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 16 }}>
            Start speaking to see the conversation here
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className="fade-in"
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 8,
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-elevated)',
                fontSize: 13,
                lineHeight: 1.4,
              }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
