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
  const baseClasses = "px-3 py-1.5 text-white text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95";
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
      <span className="text-sm">{icon}</span>
      {label}
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
      <div className="p-4 text-center text-gray-500 text-sm">
        No logs available
      </div>
    );
  }

  return (
    <div className="p-3 space-y-1 font-mono text-xs">
      {logs.map((log, index) => (
        <div key={`${log}-${index}`} className="text-gray-300 hover:bg-gray-800/50 px-2 py-1 rounded">
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
    <div className="p-4">
      {downloadStatus && (
        <div className="mb-3 p-2 bg-green-900/30 border border-green-600 rounded-md">
          <div className="text-green-300 text-sm font-medium">{downloadStatus}</div>
          <div className="text-green-400 text-xs mt-1">📁 Check your browser's Downloads folder</div>
        </div>
      )}
      <div className="mb-3">
        <h4 className="text-gray-300 text-sm font-medium mb-2">Recent Logs</h4>
        <div className="bg-black/30 rounded-md border border-gray-600 max-h-48 overflow-y-auto">
          <LogDisplay logs={logs} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>🔄 Auto-save: 30s | 📥 Auto-download: 5min</span>
          <span>💾 Persisted to localStorage</span>
        </div>
        <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
          <div className="font-medium text-gray-400 mb-1">📂 Download Locations:</div>
          <div>• <strong>Browser Downloads folder</strong> (check your default download location)</div>
          <div>• Manual: <code className="bg-gray-800 px-1 rounded">game-logs-YYYY-MM-DD.txt</code></div>
          <div>• Force download: <code className="bg-gray-800 px-1 rounded">manual-game-logs-YYYY-MM-DD-[timestamp].txt</code></div>
          <div>• Auto-download: <code className="bg-gray-800 px-1 rounded">auto-game-logs-YYYY-MM-DD-[timestamp].txt</code></div>
          <div className="mt-2 text-yellow-400 text-xs">
            💡 <strong>Tip:</strong> Files download automatically every 5 minutes, or click buttons above to download immediately
          </div>
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
    className="flex items-center justify-between p-4 w-full cursor-pointer hover:bg-gray-700/30 transition-colors duration-200 border-none bg-transparent text-left"
    onClick={onToggle}
    aria-expanded={isExpanded}
  >
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-white font-bold">
        <span className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg border-2 border-white"></span>
        <span className="text-lg font-bold text-white">🚨 LOGGER CONTROLS - VISIBLE TEST 🚨</span>
      </div>
      <div className="px-3 py-2 bg-yellow-400 text-black text-sm font-bold rounded-full border-2 border-yellow-600 shadow-lg">
        📊 {logCount} LOGS 📊 🤖 AUTO
      </div>
    </div>

    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
      <span className="text-gray-400 text-sm">▼</span>
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
    <div className={`bg-red-500 border-4 border-yellow-400 shadow-xl overflow-hidden ${className}`} style={{ minHeight: '60px' }}>
      <div className="flex items-center justify-between p-4 w-full">
        <Header
          logCount={logCount}
          isExpanded={isExpanded}
          onToggle={toggleExpanded}
        />
        <div className="flex items-center gap-2">
          <ActionButton
            onClick={handleDownloadLogs}
            disabled={logCount === 0}
            icon="📥"
            label="Download All Logs"
            variant="download"
          />
          <ActionButton
            onClick={handleDownloadNow}
            disabled={logCount === 0}
            icon="⚡"
            label="Download Now"
            variant="download"
          />
          <ActionButton
            onClick={handleClearLogs}
            disabled={logCount === 0}
            icon="🗑️"
            label="Clear"
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