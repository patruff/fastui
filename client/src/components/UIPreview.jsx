import React, { useRef, useEffect, useState, useCallback } from 'react';

export default function UIPreview({ code, onElementSelected, selectedElement }) {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState('100%');

  const updateIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !code) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body {
      margin: 0; padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      background: white;
    }
    [data-component-id] {
      cursor: pointer;
      transition: outline 0.15s ease;
    }
    [data-component-id]:hover {
      outline: 2px dashed #6366f1;
      outline-offset: 2px;
    }
    .selected-element {
      outline: 2px solid #6366f1 !important;
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  ${code}
  <script>
    // Report clicks on elements with data-component-id
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-component-id]');
      if (target) {
        // Remove previous selection
        document.querySelectorAll('.selected-element').forEach(el =>
          el.classList.remove('selected-element'));
        // Add selection
        target.classList.add('selected-element');

        window.parent.postMessage({
          type: 'element-selected',
          componentId: target.dataset.componentId,
          tagName: target.tagName,
          text: target.textContent?.substring(0, 100),
          classes: target.className,
        }, '*');
      }
    });

    // Report height for auto-sizing
    const reportHeight = () => {
      window.parent.postMessage({
        type: 'iframe-height',
        height: document.body.scrollHeight,
      }, '*');
    };
    reportHeight();
    new ResizeObserver(reportHeight).observe(document.body);
  <\/script>
</body>
</html>`;

    iframe.srcdoc = html;
  }, [code]);

  useEffect(() => {
    updateIframe();
  }, [updateIframe]);

  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === 'element-selected') {
        onElementSelected?.(event.data);
      }
      if (event.data?.type === 'iframe-height') {
        setIframeHeight(event.data.height + 32);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onElementSelected]);

  if (!code) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        padding: 32,
        textAlign: 'center',
        gap: 16,
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No UI yet</div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            Tap the mic button and describe what you want to build
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#fff', borderRadius: 8 }}>
      <iframe
        ref={iframeRef}
        title="UI Preview"
        sandbox="allow-scripts"
        style={{
          width: '100%',
          height: typeof iframeHeight === 'number' ? `${iframeHeight}px` : iframeHeight,
          border: 'none',
          background: 'white',
        }}
      />
    </div>
  );
}
