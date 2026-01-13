import React, { useState, useEffect } from 'react';

const NovaraLoader = () => {
  const [loadingState, setLoadingState] = useState({
    progress: 0,
    status: 'initializing',
    message: 'Initializing...',
    isOnline: navigator.onLine
  });

  const [startTime] = useState(Date.now());
  const [resourcesLoaded, setResourcesLoaded] = useState({
    fonts: false,
    images: false,
    scripts: false,
    styles: false,
    dom: false
  });

  useEffect(() => {
    let progressInterval;
    let timeoutWarning;
    let criticalTimeout;

    const handleOnline = () => {
      setLoadingState(prev => ({ ...prev, isOnline: true, status: 'loading', message: 'Connection restored...' }));
    };

    const handleOffline = () => {
      setLoadingState(prev => ({ ...prev, isOnline: false, status: 'error', message: 'No internet connection' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setLoadingState({
        progress: 0,
        status: 'error',
        message: 'No internet connection',
        isOnline: false
      });
      return;
    }

    const checkResources = () => {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        setResourcesLoaded(prev => ({ ...prev, dom: true }));
      }

      if (document.fonts && document.fonts.status === 'loaded') {
        setResourcesLoaded(prev => ({ ...prev, fonts: true }));
      }

      const images = Array.from(document.images);
      const imagesLoaded = images.length === 0 || images.every(img => img.complete);
      if (imagesLoaded) {
        setResourcesLoaded(prev => ({ ...prev, images: true }));
      }

      const stylesheets = Array.from(document.styleSheets);
      const stylesLoaded = stylesheets.length === 0 || stylesheets.every(sheet => {
        try {
          return sheet.cssRules !== null;
        } catch {
          return false;
        }
      });
      if (stylesLoaded) {
        setResourcesLoaded(prev => ({ ...prev, styles: true }));
      }

      const scripts = Array.from(document.scripts);
      const scriptsLoaded = scripts.every(script => script.readyState === 'complete' || !script.readyState);
      if (scriptsLoaded) {
        setResourcesLoaded(prev => ({ ...prev, scripts: true }));
      }
    };

    progressInterval = setInterval(() => {
      checkResources();

      setLoadingState(prev => {
        const elapsed = Date.now() - startTime;
        
        // Get current resource count using functional update
        setResourcesLoaded(currentResources => {
          const resourceCount = Object.values(currentResources).filter(Boolean).length;
          const totalResources = Object.keys(currentResources).length;
          
          let calculatedProgress = (resourceCount / totalResources) * 90;
          const timeProgress = Math.min(elapsed / 50, 95);
          const newProgress = Math.max(calculatedProgress, timeProgress, prev.progress);

          let newMessage = prev.message;
          let newStatus = prev.status;

          if (newProgress < 20) {
            newMessage = 'Loading Novara Jewels...';
            newStatus = 'loading';
          } else if (newProgress < 40) {
            newMessage = 'Loading precious collections...';
            newStatus = 'loading';
          } else if (newProgress < 60) {
            newMessage = 'Preparing your experience...';
            newStatus = 'loading';
          } else if (newProgress < 80) {
            newMessage = 'Almost ready...';
            newStatus = 'loading';
          } else if (newProgress < 95) {
            newMessage = 'Polishing the final touches...';
            newStatus = 'loading';
          }

          if (elapsed > 8000 && newProgress < 80) {
            newMessage = 'Taking longer than usual...';
            newStatus = 'slow';
          }

          // Update loading state without triggering re-render
          setTimeout(() => {
            setLoadingState({
              ...prev,
              progress: Math.min(newProgress, 95),
              message: newMessage,
              status: newStatus
            });
          }, 0);

          return currentResources; // Return unchanged to avoid re-render
        });

        return prev; // Return unchanged
      });
    }, 100);

    timeoutWarning = setTimeout(() => {
      setLoadingState(prev => {
        if (prev.progress < 70) {
          return {
            ...prev,
            status: 'slow',
            message: 'Slow connection detected...'
          };
        }
        return prev;
      });
    }, 8000);

    criticalTimeout = setTimeout(() => {
      setLoadingState(prev => {
        if (prev.progress < 50) {
          return {
            ...prev,
            status: 'error',
            message: 'Loading timeout. Please refresh.'
          };
        }
        return prev;
      });
    }, 20000);

    const handleLoad = () => {
      checkResources();
      
      setTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          progress: 100,
          status: 'complete',
          message: 'Welcome to Novara Jewels!'
        }));
      }, 500);
    };

    const handleDOMContentLoaded = () => {
      setResourcesLoaded(prev => ({ ...prev, dom: true }));
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    }

    if (document.fonts) {
      document.fonts.ready.then(() => {
        setResourcesLoaded(prev => ({ ...prev, fonts: true }));
      });
    }

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeoutWarning);
      clearTimeout(criticalTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('load', handleLoad);
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
    };
  }, [startTime]); // ✅ REMOVED resourcesLoaded from dependencies

  const { progress, status, message, isOnline } = loadingState;

  if (status === 'complete' && progress === 100) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a0404 0%, #300708 50%, #4a0a0c 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      animation: status === 'complete' ? 'fadeOut 0.8s ease-out forwards' : 'none'
    }}>
      <style>{`
        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '300',
          letterSpacing: '8px',
          color: '#d4af37',
          margin: '0 0 10px 0',
          fontFamily: 'serif',
          textShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
          animation: status === 'error' ? 'pulse 1.5s ease-in-out infinite' : 'none'
        }}>
          NOVARA
        </h1>
        <p style={{
          fontSize: '14px',
          letterSpacing: '4px',
          color: '#b8925f',
          margin: 0,
          fontFamily: 'serif'
        }}>
          JEWELS
        </p>
      </div>

      <div style={{ position: 'relative', marginBottom: '30px' }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              background: '#d4af37',
              transform: 'rotate(45deg)',
              left: `${i * 20 - 20}px`,
              top: '0',
              opacity: 0,
              animation: `sparkle 2s ease-in-out infinite ${i * 0.3}s`
            }}
          />
        ))}
      </div>

      {!isOnline && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          padding: '10px 20px',
          background: 'rgba(220, 38, 38, 0.2)',
          borderRadius: '20px',
          border: '1px solid rgba(220, 38, 38, 0.3)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#dc2626',
            animation: 'pulse 1s ease-in-out infinite'
          }} />
          <span style={{ color: '#fca5a5', fontSize: '13px' }}>Offline</span>
        </div>
      )}

      <div style={{ width: '300px', marginBottom: '30px' }}>
        <div style={{
          width: '100%',
          height: '2px',
          background: 'rgba(212, 175, 55, 0.2)',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: status === 'error' 
              ? 'linear-gradient(90deg, #dc2626, #ef4444)' 
              : status === 'slow'
              ? 'linear-gradient(90deg, #f59e0b, #d97706)'
              : 'linear-gradient(90deg, #d4af37, #f4e4b8)',
            borderRadius: '10px',
            transition: 'width 0.3s ease-out',
            position: 'relative',
            boxShadow: status === 'error' 
              ? '0 0 10px rgba(220, 38, 38, 0.5)'
              : '0 0 10px rgba(212, 175, 55, 0.5)'
          }}>
            {progress < 100 && status !== 'error' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                animation: 'shimmer 1.5s infinite'
              }} />
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '15px'
        }}>
          <span style={{
            fontSize: '13px',
            color: status === 'error' ? '#fca5a5' : status === 'slow' ? '#fcd34d' : '#b8925f',
            letterSpacing: '1px'
          }}>
            {message}
          </span>
          <span style={{
            fontSize: '13px',
            color: status === 'error' ? '#fca5a5' : '#d4af37',
            fontWeight: '500',
            minWidth: '45px',
            textAlign: 'right'
          }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {status === 'loading' && progress < 95 && (
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderTopColor: '#d4af37',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}

      {status === 'error' && (
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '12px 30px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid #d4af37',
            borderRadius: '25px',
            color: '#d4af37',
            fontSize: '14px',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'serif'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(212, 175, 55, 0.2)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(212, 175, 55, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Refresh Page
        </button>
      )}
    </div>
  );
};

export default NovaraLoader;