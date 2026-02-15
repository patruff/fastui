import { useState, useRef, useCallback } from 'react';

export function useRealtimeVoice({ onFunctionCall, onTranscript, onAiSpeaking }) {
  const [status, setStatus] = useState('disconnected'); // disconnected | connecting | connected
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const audioElementRef = useRef(null);

  const connect = useCallback(async () => {
    try {
      setStatus('connecting');
      setError(null);

      // Get ephemeral token from our server
      const tokenRes = await fetch('/api/realtime/token');
      if (!tokenRes.ok) throw new Error('Failed to get session token');
      const session = await tokenRes.json();

      if (!session.client_secret?.value) {
        throw new Error('Invalid session response - no client secret');
      }

      // Create peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Set up audio playback for AI responses
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;

      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0];
      };

      // Get microphone access and add track
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = stream.getTracks()[0];
      pc.addTrack(audioTrack, stream);

      // Create data channel for events
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        setStatus('connected');
        setIsListening(true);
      };

      dc.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleServerEvent(msg);
        } catch (e) {
          console.error('Error parsing realtime event:', e);
        }
      };

      dc.onclose = () => {
        setStatus('disconnected');
        setIsListening(false);
      };

      // Create and set local offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to OpenAI Realtime API
      const sdpRes = await fetch(
        `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.client_secret.value}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      );

      if (!sdpRes.ok) throw new Error('Failed to connect to Realtime API');

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      setStatus('disconnected');
      cleanup();
    }
  }, []);

  const handleServerEvent = useCallback((event) => {
    switch (event.type) {
      case 'response.audio_transcript.done':
        onTranscript?.({ role: 'assistant', text: event.transcript });
        break;

      case 'conversation.item.input_audio_transcription.completed':
        onTranscript?.({ role: 'user', text: event.transcript });
        break;

      case 'response.function_call_arguments.done':
        try {
          const args = JSON.parse(event.arguments);
          onFunctionCall?.(event.name, args, event.call_id);
        } catch (e) {
          console.error('Error parsing function call args:', e);
        }
        break;

      case 'response.audio.started':
        onAiSpeaking?.(true);
        break;

      case 'response.audio.done':
      case 'response.done':
        onAiSpeaking?.(false);
        break;

      case 'error':
        console.error('Realtime API error:', event.error);
        setError(event.error?.message || 'Unknown error');
        break;
    }
  }, [onFunctionCall, onTranscript, onAiSpeaking]);

  const sendFunctionResult = useCallback((callId, result) => {
    const dc = dataChannelRef.current;
    if (!dc || dc.readyState !== 'open') return;

    dc.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(result),
      },
    }));

    dc.send(JSON.stringify({ type: 'response.create' }));
  }, []);

  const sendTextMessage = useCallback((text) => {
    const dc = dataChannelRef.current;
    if (!dc || dc.readyState !== 'open') return;

    dc.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    }));

    dc.send(JSON.stringify({ type: 'response.create' }));
  }, []);

  const cleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach(sender => {
        if (sender.track) sender.track.stop();
      });
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }
    dataChannelRef.current = null;
  }, []);

  const disconnect = useCallback(() => {
    cleanup();
    setStatus('disconnected');
    setIsListening(false);
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    if (peerConnectionRef.current) {
      const senders = peerConnectionRef.current.getSenders();
      senders.forEach(sender => {
        if (sender.track && sender.track.kind === 'audio') {
          sender.track.enabled = !sender.track.enabled;
          setIsListening(sender.track.enabled);
        }
      });
    }
  }, []);

  return {
    status,
    isListening,
    error,
    connect,
    disconnect,
    toggleMute,
    sendFunctionResult,
    sendTextMessage,
  };
}
