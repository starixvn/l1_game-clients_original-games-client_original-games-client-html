import React, { useState, useEffect } from 'react';
import { logger } from '../../../../services';

interface LoggerControlsProps {
  className?: string;
}

const color = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';

// Style constants
const CONTAINER_STYLES = {
  background: '#ef4444',
  border: '4px solid #eab308',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
  maxWidth: '400px',
  zIndex: 9999,
  position: 'relative' as const,
  transition: 'all 0.3s ease'
};

const STATUS_INDICATOR_STYLES = {
  borderRadius: '50%',
  boxShadow: color,
  border: '1px solid white'
};

const BUTTON_BASE_STYLES = {
  padding: '4px 8px',
  color: 'white',
  fontSize: '11px',
  fontWeight: '500',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  boxShadow: color,
};

// Helper functions
const getRecentLogs = () => {
  const allLogs = logger.getLogs().split('\n').slice(3, -1);
  return allLogs.slice(-10);
};

const updateLogData = (setLogCount: (count: number) => void, setRecentLogs: (logs: string[]) => void, isExpanded: boolean) => {
  setLogCount(logger.getLogCount());
  if (isExpanded) {
    setRecentLogs(getRecentLogs());
  }
};

// Event handlers
const createLogHandlers = (
  setLogCount: (count: number) => void,
  setRecentLogs: (logs: string[]) => void,
  setIsLoggingEnabled: (enabled: boolean) => void
) => ({
  handleDownloadLogs: () => {
    logger.downloadLogs();
    setLogCount(logger.getLogCount());
  },

  handleClearLogs: () => {
    logger.clear();
    setLogCount(0);
    setRecentLogs([]);
  },

  handleStartLogging: () => {
    logger.start();
    setIsLoggingEnabled(true);
  },

  handleStopLogging: () => {
    logger.stop();
    setIsLoggingEnabled(false);
  }
});

// Sub-components
interface StatusIndicatorProps {
  isEnabled: boolean;
  size: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isEnabled, size }) => (
  <span style={{
    width: `${size}px`,
    height: `${size}px`,
    background: isEnabled ? '#10b981' : '#ef4444',
    ...STATUS_INDICATOR_STYLES,
    animation: isEnabled ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
    border: size > 12 ? '2px solid white' : '1px solid white'
  }} />
);

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
  background: string;
  icon: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled = false, children, title, background, icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      ...BUTTON_BASE_STYLES,
      background: disabled ? '#6b7280' : background,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1
    }}
    title={title}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.boxShadow = color;
        e.currentTarget.style.transform = 'scale(1)';
      }
    }}
  >
    <span style={{ fontSize: '14px' }}>{icon}</span> {children}
  </button>
);

interface CollapsedHeaderProps {
  isLoggingEnabled: boolean;
  logCount: number;
  onToggle: () => void;
}

const CollapsedHeader: React.FC<CollapsedHeaderProps> = ({ isLoggingEnabled, logCount, onToggle }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 12px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }}
    onClick={onToggle}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.3)'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    role="button"
    tabIndex={0}
    aria-expanded={false}
    aria-label="Expand Logger Controls"
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <StatusIndicator isEnabled={isLoggingEnabled} size={12} />
      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>
        🚨 LOGGER
      </span>
      {logCount > 0 && (
        <span style={{
          padding: '2px 6px',
          background: '#eab308',
          color: 'black',
          fontSize: '10px',
          fontWeight: 'bold',
          borderRadius: '9999px',
          border: '1px solid #ca8a04'
        }}>
          {logCount}
        </span>
      )}
      <span style={{ color: '#9ca3af', fontSize: '12px' }}>▶️</span>
    </div>
  </div>
);

interface ExpandedHeaderProps {
  isLoggingEnabled: boolean;
  logCount: number;
  onToggle: () => void;
  onStartLogging: () => void;
  onStopLogging: () => void;
  onDownloadLogs: () => void;
  onClearLogs: () => void;
}

const ExpandedHeader: React.FC<ExpandedHeaderProps> = ({
  isLoggingEnabled,
  logCount,
  onToggle,
  onStartLogging,
  onStopLogging,
  onDownloadLogs,
  onClearLogs
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }}
    onClick={onToggle}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.3)'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    role="button"
    tabIndex={0}
    aria-expanded={true}
    aria-label="Collapse Logger Controls"
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 'bold' }}>
        <StatusIndicator isEnabled={isLoggingEnabled} size={16} />
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
          🚨 LOGGER {isLoggingEnabled ? '(ON)' : '(OFF)'}
        </span>
      </div>
      <div style={{
        padding: '4px 8px',
        background: '#eab308',
        color: 'black',
        fontSize: '12px',
        fontWeight: 'bold',
        borderRadius: '9999px',
        border: '1px solid #ca8a04',
        boxShadow: color,
      }}>
        {logCount}
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          isLoggingEnabled ? onStopLogging() : onStartLogging();
        }}
        title={isLoggingEnabled ? 'Stop logging' : 'Start logging'}
        background={isLoggingEnabled ? 'linear-gradient(to right, #dc2626, #b91c1c)' : 'linear-gradient(to right, #16a34a, #15803d)'}
        icon={isLoggingEnabled ? '⏸️' : '▶️'}
      >
        {isLoggingEnabled ? 'Stop' : 'Start'}
      </ActionButton>

      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          onDownloadLogs();
        }}
        disabled={logCount === 0}
        title="Download logs as text file"
        background="linear-gradient(to right, #2563eb, #1d4ed8)"
        icon="📥"
      >
        Download
      </ActionButton>

      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          onClearLogs();
        }}
        disabled={logCount === 0}
        title="Clear all logs"
        background="linear-gradient(to right, #dc2626, #b91c1c)"
        icon="🗑️"
      >
        Clear
      </ActionButton>

      <div style={{
        transform: 'rotate(180deg)',
        transition: 'transform 0.2s'
      }}>
        <span style={{ color: '#9ca3af', fontSize: '14px' }}>▼</span>
      </div>
    </div>
  </div>
);

interface LogsDisplayProps {
  recentLogs: string[];
}

const LogsDisplay: React.FC<LogsDisplayProps> = ({ recentLogs }) => (
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
                <button
                  key={`log-${index}-${log.substring(0, 20)}`}
                  style={{
                    color: '#d1d5db',
                    padding: '8px 4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s',
                    background: 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  aria-label={`Log entry: ${log}`}
                  title="Click to view full log details"
                >
                  {log}
                </button>
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
);

const LoggerControls: React.FC<LoggerControlsProps> = ({ className = '' }) => {
  const [logCount, setLogCount] = useState(logger.getLogCount());
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentLogs, setRecentLogs] = useState<string[]>([]);
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(false);

  const handlers = createLogHandlers(setLogCount, setRecentLogs, setIsLoggingEnabled);

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    if (newExpanded) {
      logger.expand();
      setRecentLogs(getRecentLogs());
    } else {
      logger.collapse();
    }
  };

  useEffect(() => {
    const updateCount = () => updateLogData(setLogCount, setRecentLogs, isExpanded);
    updateCount();

    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, [isExpanded]);

  return (
    <div style={{
      ...CONTAINER_STYLES,
      minHeight: isExpanded ? '50px' : '32px'
    }} className={className}>
      {!isExpanded ? (
        <CollapsedHeader
          isLoggingEnabled={isLoggingEnabled}
          logCount={logCount}
          onToggle={toggleExpanded}
        />
      ) : (
        <ExpandedHeader
          isLoggingEnabled={isLoggingEnabled}
          logCount={logCount}
          onToggle={toggleExpanded}
          onStartLogging={handlers.handleStartLogging}
          onStopLogging={handlers.handleStopLogging}
          onDownloadLogs={handlers.handleDownloadLogs}
          onClearLogs={handlers.handleClearLogs}
        />
      )}

      {isExpanded && <LogsDisplay recentLogs={recentLogs} />}
    </div>
  );
};

export default LoggerControls;
