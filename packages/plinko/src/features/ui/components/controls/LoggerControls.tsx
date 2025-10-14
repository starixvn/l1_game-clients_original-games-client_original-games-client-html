import React, { useState, useEffect } from 'react';
import { logger } from '@plinko/services/logger';

interface LoggerControlsProps {
  className?: string;
}

// Action Button Component
interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  disabled: boolean;
  icon: string;
  label: string;
  variant: 'download' | 'clear';
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled, icon, label, variant }) => {
  const baseClasses = "px-2 py-1 text-white text-xs font-medium rounded transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md";
  const variantClasses = variant === 'download'
    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700"
    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} disabled:cursor-not-allowed`}
      title={`${label} logs`}
    >
      <span className="text-xs">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

// Log Display Component
interface LogDisplayProps {
  logs: string[];
}

const LogDisplay: React.FC<LogDisplayProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="p-2 text-center text-gray-500 text-xs">
        No logs available
      </div>
    );
  }

  return (
    <div className="p-2 space-y-0.5 font-mono text-xs">
      {logs.map((log, index) => (
        <div key={`${log}-${index}`} className="text-gray-300 hover:bg-gray-800/50 px-1 py-0.5 rounded text-xs">
          {log}
        </div>
      ))}
    </div>
  );
};

// Expandable Content Component
interface ExpandableContentProps {
  logs: string[];
}

interface ExpandableContentPropsWithStatus extends ExpandableContentProps {
  downloadStatus: string;
}

const ExpandableContent: React.FC<ExpandableContentPropsWithStatus> = ({ logs, downloadStatus }) => (
  <div className="border-t border-gray-700 bg-gray-900/50">
    <div className="p-2">
      {downloadStatus && (
        <div className="mb-2 p-1.5 bg-green-900/30 border border-green-600 rounded">
          <div className="text-green-300 text-xs font-medium">{downloadStatus}</div>
        </div>
      )}
      <div className="mb-2">
        <h4 className="text-gray-300 text-xs font-medium mb-1">Recent Logs</h4>
        <div className="bg-black/30 rounded border border-gray-600 max-h-32 overflow-y-auto">
          <LogDisplay logs={logs} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>🔄 30s | 📥 5min</span>
          <span>💾 localStorage</span>
        </div>
      </div>
    </div>
  </div>
);

// Header Component
interface HeaderProps {
  logCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ logCount, isExpanded, onToggle }) => (
  <button
    type="button"
    className="flex items-center justify-between p-2 w-full cursor-pointer hover:bg-gray-700/30 transition-colors duration-200 border-none bg-transparent text-left"
    onClick={onToggle}
    aria-expanded={isExpanded}
  >
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-white font-bold">
        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse border border-white"></span>
        <span className="text-xs font-bold text-white">🔧 LOGGER</span>
      </div>
      <div className="px-1.5 py-0.5 bg-yellow-400 text-black text-xs font-bold rounded border border-yellow-600">
        {logCount}
      </div>
    </div>

    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
      <span className="text-gray-400 text-xs">▼</span>
    </div>
  </button>
);

// Main Component - Now globally positioned in App.tsx
const LoggerControls: React.FC<LoggerControlsProps> = ({ className = '' }) => {

  const [logCount, setLogCount] = useState(logger.getLogCount());
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentLogs, setRecentLogs] = useState<string[]>([]);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  const handleDownloadLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    const filename = logger.downloadLogs();
    setDownloadStatus(`✅ Downloaded: ${filename}`);
    setLogCount(logger.getLogCount());
    setTimeout(() => setDownloadStatus(''), 3000);
  };

  const handleDownloadNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const filename = logger.downloadLogs(`manual-game-logs-${new Date().toISOString().split('T')[0]}-${Date.now()}.txt`);
    setDownloadStatus(`⚡ Force downloaded: ${filename}`);
    setLogCount(logger.getLogCount());
    setTimeout(() => setDownloadStatus(''), 3000);
  };

  const handleClearLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    logger.clear();
    setLogCount(0);
    setRecentLogs([]);
    setDownloadStatus('🗑️ Logs cleared');
    setTimeout(() => setDownloadStatus(''), 2000);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      const allLogs = logger.getLogs().split('\n').slice(3, -1);
      setRecentLogs(allLogs.slice(-10));
    }
  };

  const updateLogData = () => {
    setLogCount(logger.getLogCount());
    if (isExpanded) {
      const allLogs = logger.getLogs().split('\n').slice(3, -1);
      setRecentLogs(allLogs.slice(-10));
    }
  };

  useEffect(() => {
    updateLogData();
    const interval = setInterval(updateLogData, 5000);
    return () => clearInterval(interval);
  }, [isExpanded]);

  return (
    <div className={`bg-red-500 border-2 border-yellow-400 shadow-lg overflow-hidden ${className}`} style={{ minHeight: '48px' }}>
      <div className="flex items-center justify-between px-3 py-2 w-full">
        <Header
          logCount={logCount}
          isExpanded={isExpanded}
          onToggle={toggleExpanded}
        />
        <div className="flex items-center gap-1">
          <ActionButton
            onClick={handleDownloadLogs}
            disabled={logCount === 0}
            icon="📥"
            label="All"
            variant="download"
          />
          <ActionButton
            onClick={handleDownloadNow}
            disabled={logCount === 0}
            icon="⚡"
            label="Now"
            variant="download"
          />
          <ActionButton
            onClick={handleClearLogs}
            disabled={logCount === 0}
            icon="🗑️"
            label=""
            variant="clear"
          />
        </div>
      </div>
      {isExpanded && <ExpandableContent logs={recentLogs} downloadStatus={downloadStatus} />}
    </div>
  );
};

// Export the component
export default LoggerControls;