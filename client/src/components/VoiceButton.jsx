import React from 'react';

export default function VoiceButton({ status, isListening, aiSpeaking, onConnect, onDisconnect, onToggleMute }) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  const handlePress = () => {
    if (isConnecting) return;
    if (!isConnected) {
      onConnect();
    } else if (isListening) {
      onToggleMute();
    } else {
      onToggleMute();
    }
  };

  const handleLongPress = () => {
    if (isConnected) onDisconnect();
  };

  let timerRef = React.useRef(null);

  const onTouchStart = () => {
    timerRef.current = setTimeout(handleLongPress, 800);
  };

  const onTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div
        className={isConnected && isListening ? 'voice-active' : ''}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Pulse ring */}
        {isConnected && isListening && (
          <div
            className="pulse-ring"
            style={{
              position: 'absolute',
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--primary)',
            }}
          />
        )}

        {/* Main button */}
        <button
          onClick={handlePress}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onTouchStart}
          onMouseUp={onTouchEnd}
          disabled={isConnecting}
          className="pulse-dot"
          style={{
            position: 'relative',
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: 'none',
            cursor: isConnecting ? 'wait' : 'pointer',
            background: !isConnected
              ? 'var(--primary)'
              : isListening
                ? aiSpeaking ? 'var(--success)' : 'var(--primary)'
                : 'var(--bg-elevated)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            boxShadow: isConnected && isListening
              ? '0 0 20px rgba(99, 102, 241, 0.4)'
              : '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {isConnecting ? (
            <LoadingSpinner />
          ) : !isConnected ? (
            <MicIcon />
          ) : isListening ? (
            aiSpeaking ? <SpeakerIcon /> : <AudioBars />
          ) : (
            <MicOffIcon />
          )}
        </button>
      </div>

      <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
        {isConnecting
          ? 'Connecting...'
          : !isConnected
            ? 'Tap to start'
            : aiSpeaking
              ? 'AI speaking...'
              : isListening
                ? 'Listening...'
                : 'Muted (tap to unmute)'}
      </span>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function AudioBars() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="audio-bar" />
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="60" strokeLinecap="round" />
    </svg>
  );
}
