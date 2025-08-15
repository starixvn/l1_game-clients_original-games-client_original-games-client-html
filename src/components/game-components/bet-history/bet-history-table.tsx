import { useEffect, useRef, useState } from 'react';
import { Table, TableColumn } from '../table';
import { useGameContext } from '../../../_shared/react-contexts';
import { LoadingSpinner } from '../game-loading/loading-spinner';
import { useCommonTranslate } from '../../../_shared/react-hooks';
import useGameStore from '../../../_shared/stores/game-store/game-store';
import { BetHistoryHandler } from '../../game-base/handlers/bet-history-handler';
import { 
    transformBetLogsToDisplayData, 
    getWinValueColorClass,
    scrollBetHistoryToTop,
    BetHistoryDisplayData 
} from './bet-history-utils';
import styles from './bet-history.module.scss';

export const BetHistoryTable = () => {
    const { gameMessageHandler } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    
    // Store state
    const {
        getDisplayedBetLogs,
        isLoading,
        isExpanded,
        totalPages,
    } = useGameStore();
    
    // Local state
    const [betHistoryHandler, setBetHistoryHandler] = useState<BetHistoryHandler | null>(null);
    const isInitialized = useRef(false);

    // Initialize bet history handler
    useEffect(() => {
        if (!isInitialized.current) {
            const handler = new BetHistoryHandler({ gameMessageHandler });
            setBetHistoryHandler(handler);
            
            // Load initial data
            handler.requestHistory(1);
            isInitialized.current = true;
            
            return () => {
                handler.cleanup();
            };
        }
    }, [gameMessageHandler]);

    // Table column configuration
    const columns: TableColumn<BetHistoryDisplayData>[] = createTableColumns(translateCommon);

    // Get displayed data from store
    const displayedBetLogs = getDisplayedBetLogs();
    const tableData = transformBetLogsToDisplayData(displayedBetLogs);

    // Handle toggle expand/collapse
    const handleToggleExpand = () => {
        if (!betHistoryHandler) return;
        
        const wasExpanded = isExpanded;
        betHistoryHandler.toggleExpanded();
        
        // Scroll to top when collapsing
        if (wasExpanded) {
            setTimeout(scrollBetHistoryToTop, 100);
        }
    };

    // Show loading spinner for initial load
    if (isLoading && displayedBetLogs.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className={`${styles['bet-history-container']} rounded bg-white dark:bg-primary-bg p-2`}>
            <div
                className={`bet-history-scroll-wrapper ${styles['table-scroll-wrapper']} ${isExpanded ? styles.expanded : ''}`}
            >
                <Table
                    columns={columns}
                    data={tableData}
                    emptyMessage={translateCommon("no_data")}
                    className="bet-history-table"
                />
            </div>

            {renderToggleButton(totalPages, isExpanded, isLoading, handleToggleExpand, styles)}
        </div>
    );
};

// Extracted function for creating table columns
function createTableColumns(translateCommon: any): TableColumn<BetHistoryDisplayData>[] {
    return [
        {
            key: 'time',
            header: translateCommon("time"),
            render: (value: string) => (
                <div style={{ whiteSpace: 'pre-line' }}>
                    {value}
                </div>
            ),
        },
        {
            key: 'round',
            header: translateCommon("round").capitalizeFirstLetter(),
            isClickable: true,
            render: (value: string) => (
                <span className="text-blue-500 hover:text-blue-700 cursor-pointer">
                    {value}
                </span>
            ),
        },
        {
            key: 'betAmount',
            header: translateCommon("total_stake"),
        },
        {
            key: 'win',
            header: translateCommon("win"),
            render: (value: string) => (
                <div className={getWinValueColorClass(value)}>
                    {value}
                </div>
            ),
        },
    ];
}

// Extracted function for rendering toggle button
function renderToggleButton(
    totalPages: number,
    isExpanded: boolean,
    isLoading: boolean,
    handleToggleExpand: () => void,
    styles: any
) {
    if (totalPages <= 1) return null;

    return (
        <div className={styles['toggle-button-container']}>
            <button
                className={styles['toggle-button']}
                onClick={handleToggleExpand}
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <LoadingSpinner />
                        Loading...
                    </span>
                ) : (
                    isExpanded ? "Show Less" : "Show More"
                )}
            </button>
        </div>
    );
}
