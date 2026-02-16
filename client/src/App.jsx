import React, { useState, useCallback, useEffect } from 'react';
import { useRealtimeVoice } from './hooks/useRealtimeVoice';
import { usePhantomWallet } from './hooks/usePhantomWallet';
import LoginScreen from './components/LoginScreen';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import UIPreview from './components/UIPreview';
import VoiceButton from './components/VoiceButton';
import TranscriptPanel from './components/TranscriptPanel';
import CodePanel from './components/CodePanel';
import PaymentModal from './components/PaymentModal';
import DownloadModal from './components/DownloadModal';
import { DEFAULT_LANDING_PAGE } from './defaultTemplate';

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Credits state
  const [credits, setCredits] = useState({ remaining: 0, totalPurchased: 0, totalUsed: 0 });

  // UI builder state
  const [uiCode, setUiCode] = useState(DEFAULT_LANDING_PAGE);
  const [messages, setMessages] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ message: '', type: 'info' });
  const [showTranscript, setShowTranscript] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const phantom = usePhantomWallet();

  // Check auth on mount
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setUser(data.user);
        if (data.user) fetchCredits();
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/credits', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCredits(data);
      }
    } catch {}
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setCredits({ remaining: 0, totalPurchased: 0, totalUsed: 0 });
  }, []);

  const handleFunctionCall = useCallback(async (fnName, args, callId) => {
    if (fnName === 'generate_ui') {
      setIsGenerating(true);
      setStatusMsg({ message: 'Generating UI...', type: 'loading' });

      try {
        const res = await fetch('/api/generate-ui', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            description: args.description,
            componentType: args.component_type,
            currentCode: uiCode,
          }),
        });

        if (res.status === 402) {
          setStatusMsg({ message: 'No credits! Purchase more to continue.', type: 'error' });
          setShowPayment(true);
          voice.sendFunctionResult(callId, { success: false, error: 'No credits remaining' });
          return;
        }

        const data = await res.json();
        if (data.code) {
          setUiCode(data.code);
          if (data.credits) setCredits(data.credits);
          setStatusMsg({ message: 'UI generated!', type: 'success' });
          voice.sendFunctionResult(callId, { success: true, message: 'UI component generated and displayed' });
        } else {
          throw new Error('No code returned');
        }
      } catch (err) {
        setStatusMsg({ message: 'Failed to generate UI', type: 'error' });
        voice.sendFunctionResult(callId, { success: false, error: err.message });
      } finally {
        setIsGenerating(false);
        setTimeout(() => setStatusMsg({ message: '', type: 'info' }), 3000);
      }
    }

    if (fnName === 'modify_ui') {
      setIsGenerating(true);
      setStatusMsg({ message: 'Modifying UI...', type: 'loading' });

      try {
        const res = await fetch('/api/modify-ui', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            currentCode: uiCode,
            modification: args.modification,
            targetElement: args.target_element || selectedElement?.componentId,
          }),
        });

        if (res.status === 402) {
          setStatusMsg({ message: 'No credits! Purchase more to continue.', type: 'error' });
          setShowPayment(true);
          voice.sendFunctionResult(callId, { success: false, error: 'No credits remaining' });
          return;
        }

        const data = await res.json();
        if (data.code) {
          setUiCode(data.code);
          if (data.credits) setCredits(data.credits);
          setStatusMsg({ message: 'UI updated!', type: 'success' });
          voice.sendFunctionResult(callId, { success: true, message: 'UI modified successfully' });
        } else {
          throw new Error('No code returned');
        }
      } catch (err) {
        setStatusMsg({ message: 'Failed to modify UI', type: 'error' });
        voice.sendFunctionResult(callId, { success: false, error: err.message });
      } finally {
        setIsGenerating(false);
        setTimeout(() => setStatusMsg({ message: '', type: 'info' }), 3000);
      }
    }
  }, [uiCode, selectedElement]);

  const handleTranscript = useCallback((msg) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const handleAiSpeaking = useCallback((speaking) => {
    setAiSpeaking(speaking);
  }, []);

  const voice = useRealtimeVoice({
    onFunctionCall: handleFunctionCall,
    onTranscript: handleTranscript,
    onAiSpeaking: handleAiSpeaking,
  });

  const handleElementSelected = useCallback((element) => {
    setSelectedElement(element);
    if (voice.status === 'connected') {
      voice.sendTextMessage(
        `The user just tapped on a <${element.tagName?.toLowerCase()}> element containing: "${element.text}". They may want to modify this element.`
      );
    }
  }, [voice]);

  const handleClearUI = useCallback(() => {
    setUiCode('');
    setSelectedElement(null);
    setStatusMsg({ message: 'UI cleared', type: 'info' });
    setTimeout(() => setStatusMsg({ message: '', type: 'info' }), 2000);
  }, []);

  const handlePurchaseComplete = useCallback((result) => {
    if (result.remaining !== undefined) {
      setCredits(prev => ({ ...prev, remaining: result.remaining }));
    }
    fetchCredits();
  }, [fetchCredits]);

  // Show loading
  if (authLoading) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="3" fill="none" strokeDasharray="60" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* Top toolbar */}
      <Toolbar
        status={voice.status}
        onShowCode={() => setShowCode(!showCode)}
        onShowTranscript={() => setShowTranscript(!showTranscript)}
        onClearUI={handleClearUI}
        onDownload={() => setShowDownload(true)}
        hasCode={!!uiCode}
        selectedElement={selectedElement}
        user={user}
        credits={credits}
        onShowPayment={() => setShowPayment(true)}
        onLogout={handleLogout}
      />

      {/* Status bar */}
      <StatusBar
        message={voice.error || statusMsg.message}
        type={voice.error ? 'error' : statusMsg.type}
      />

      {/* Main preview area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative',
      }}>
        <UIPreview
          code={uiCode}
          onElementSelected={handleElementSelected}
          selectedElement={selectedElement}
        />

        {/* Loading overlay */}
        {isGenerating && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}>
            <div style={{
              background: 'var(--bg-surface)',
              padding: '16px 24px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="3" fill="none" strokeDasharray="60" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 14 }}>Building your UI...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom voice control bar */}
      <div style={{
        padding: '12px 16px 20px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      }}>
        <VoiceButton
          status={voice.status}
          isListening={voice.isListening}
          aiSpeaking={aiSpeaking}
          onConnect={voice.connect}
          onDisconnect={voice.disconnect}
          onToggleMute={voice.toggleMute}
        />
      </div>

      {/* Slide-up transcript panel */}
      <TranscriptPanel
        messages={messages}
        isOpen={showTranscript}
        onClose={() => setShowTranscript(false)}
      />

      {/* Slide-in code panel */}
      <CodePanel
        code={uiCode}
        isOpen={showCode}
        onClose={() => setShowCode(false)}
      />

      {/* Download modal */}
      <DownloadModal
        isOpen={showDownload}
        onClose={() => setShowDownload(false)}
        uiCode={uiCode}
      />

      {/* Payment modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        credits={credits}
        phantom={phantom}
        onPurchaseComplete={handlePurchaseComplete}
      />

      {/* Overlay for panels */}
      {(showTranscript || showCode) && (
        <div
          onClick={() => { setShowTranscript(false); setShowCode(false); }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 15,
          }}
        />
      )}
    </div>
  );
}
