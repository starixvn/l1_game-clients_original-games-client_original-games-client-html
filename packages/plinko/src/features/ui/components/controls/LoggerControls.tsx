import React, { useState, useEffect } from 'react';
import { logger } from '../../../../services';

interface LoggerControlsProps {
  className?: string;
}

const LoggerControls: React.FC<LoggerControlsProps> = ({ className = '' }) => {
  const [logCount, setLogCount] = useState(logger.getLogCount());
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentLogs, setRecentLogs] = useState<string[]>([]);

  const handleDownloadLogs = () => {
    logger.downloadLogs();
    // Update count after download (logs are not cleared)
    setLogCount(logger.getLogCount());
  };

  const handleClearLogs = () => {
    logger.clear();
    setLogCount(0);
    setRecentLogs([]);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Load recent logs when expanding
      const allLogs = logger.getLogs().split('\n').slice(3, -1); // Skip header, get last 10 logs
      setRecentLogs(allLogs.slice(-10));
    }
  };

  // Update log count when component mounts and periodically
  useEffect(() => {
    const updateCount = () => {
      setLogCount(logger.getLogCount());
      if (isExpanded) {
        const allLogs = logger.getLogs().split('\n').slice(3, -1);
        setRecentLogs(allLogs.slice(-10));
      }
    };
    updateCount(); // Initial update

    // Update every 5 seconds to show live count
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, [isExpanded]);

  return (
    <div style={{
      background: '#ef4444',
      border: '4px solid #eab308',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      minHeight: '50px',
      maxWidth: '400px',
      zIndex: 9999,
      position: 'relative'
    }} className={className}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onClick={toggleExpanded}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.3)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 'bold' }}>
            <span style={{
              width: '16px',
              height: '16px',
              background: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              border: '2px solid white'
            }}></span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>🚨 LOGGER</span>
          </div>
          <div style={{
            padding: '4px 8px',
            background: '#eab308',
            color: 'black',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '9999px',
            border: '1px solid #ca8a04',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}>
            {logCount}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadLogs();
            }}
            disabled={logCount === 0}
            style={{
              padding: '4px 8px',
              background: logCount === 0 ? '#6b7280' : 'linear-gradient(to right, #2563eb, #1d4ed8)',
              color: 'white',
              fontSize: '11px',
              fontWeight: '500',
              borderRadius: '4px',
              border: 'none',
              cursor: logCount === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              opacity: logCount === 0 ? 0.5 : 1
            }}
            title="Download logs as text file"
            onMouseEnter={(e) => {
              if (logCount > 0) {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (logCount > 0) {
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <span style={{ fontSize: '14px' }}>📥</span> Download
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearLogs();
            }}
            disabled={logCount === 0}
            style={{
              padding: '4px 8px',
              background: logCount === 0 ? '#6b7280' : 'linear-gradient(to right, #dc2626, #b91c1c)',
              color: 'white',
              fontSize: '11px',
              fontWeight: '500',
              borderRadius: '4px',
              border: 'none',
              cursor: logCount === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              opacity: logCount === 0 ? 0.5 : 1
            }}
            title="Clear all logs"
            onMouseEnter={(e) => {
              if (logCount > 0) {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (logCount > 0) {
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <span style={{ fontSize: '14px' }}>🗑️</span> Clear
          </button>

          <div style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>▼</span>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid #374151',
          background: 'rgba(17, 24, 39, 0.5)'
        }}>
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Recent Logs</h4>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '6px',
                border: '1px solid #4b5563',
                maxHeight: '192px',
                overflowY: 'auto'
              }}>
                {recentLogs.length > 0 ? (
                  <div style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {recentLogs.map((log, index) => (
                      <div key={index} style={{
                        color: '#d1d5db',
                        padding: '8px 4px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                    No logs available
                  </div>
                )}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              <span>Auto-updates every 5 seconds</span>
              <span>Max 10,000 entries</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggerControls;
