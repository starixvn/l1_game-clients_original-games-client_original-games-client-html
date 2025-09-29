import React, { useState, useEffect } from 'react';
import { logger } from '@shared/services/logger';

interface LoggerControlsProps {
    className?: string;
}

const LoggerControls: React.FC<LoggerControlsProps> = ({ className = '' }) => {
    console.log('LoggerControls component rendering', { logCount: logger.getLogCount(), className });

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
        <div className={`bg-red-500 border-4 border-yellow-400 shadow-xl overflow-hidden ${className}`} style={{ minHeight: '60px', zIndex: 9999, position: 'relative' }}>
            {/* Header */}
            <button
                type="button"
                className="flex items-center justify-between p-4 w-full cursor-pointer hover:bg-gray-700/30 transition-colors duration-200 border-none bg-transparent text-left"
                onClick={toggleExpanded}
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-white font-bold">
                        <span className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg border-2 border-white"></span>
                        <span className="text-lg font-bold text-white">🚨 LOGGER CONTROLS - VISIBLE TEST 🚨</span>
                    </div>
                    <div className="px-3 py-2 bg-yellow-400 text-black text-sm font-bold rounded-full border-2 border-yellow-600 shadow-lg">
                        📊 {logCount} LOGS 📊
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadLogs();
                        }}
                        disabled={logCount === 0}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        title="Download logs as text file"
                    >
                        <span className="text-sm">📥</span>{' '}
                        Download
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClearLogs();
                        }}
                        disabled={logCount === 0}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        title="Clear all logs"
                    >
                        <span className="text-sm">🗑️</span>{' '}
                        Clear
                    </button>

                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <span className="text-gray-400 text-sm">▼</span>
                    </div>
                </div>
            </button>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="border-t border-gray-700 bg-gray-900/50">
                    <div className="p-4">
                        <div className="mb-3">
                            <h4 className="text-gray-300 text-sm font-medium mb-2">Recent Logs</h4>
                            <div className="bg-black/30 rounded-md border border-gray-600 max-h-48 overflow-y-auto">
                                {recentLogs.length > 0 ? (
                                    <div className="p-3 space-y-1 font-mono text-xs">
                                        {recentLogs.map((log, index) => (
                                            <div key={`${log}-${index}`} className="text-gray-300 hover:bg-gray-800/50 px-2 py-1 rounded">
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        No logs available
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400">
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

