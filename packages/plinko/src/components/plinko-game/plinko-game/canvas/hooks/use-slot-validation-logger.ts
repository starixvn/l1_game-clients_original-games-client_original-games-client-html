import { useRef, useCallback } from 'react';

export interface SlotValidationData {
    id?: number;
    timestamp: string;
    slotIndex: number;
    settlementResultSlotIndex: number;
    isMatch: boolean;
    ballId?: string;
    gameRoundId?: number;
}

export interface SlotValidationLogger {
    logValidation: (data: Omit<SlotValidationData, 'timestamp' | 'isMatch'>) => void;
    downloadLogs: () => void;
    clearLogs: () => void;
    getLogs: () => SlotValidationData[];
}

export const useSlotValidationLogger = (): SlotValidationLogger => {
    const logsRef = useRef<SlotValidationData[]>([]);

    const logValidation = useCallback((data: Omit<SlotValidationData, 'timestamp' | 'isMatch'>) => {
        const validationData: SlotValidationData = {
            id: logsRef.current.length + 1,
            ...data,
            timestamp: new Date().toISOString(),
            isMatch: data.slotIndex === data.settlementResultSlotIndex,
        };

        logsRef.current.push(validationData);
    }, []);

    const downloadLogs = useCallback(() => {
        console.log("🔄 Attempting to download logs...", { logCount: logsRef.current.length });
        
        if (logsRef.current.length === 0) {
            console.warn("No validation logs to download");
            alert("No validation logs to download");
            return;
        }

        try {
            const dataStr = JSON.stringify(logsRef.current, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `plinko-slot-validation-${Date.now()}.json`;
            
            // Make sure the link is visible and clickable
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            console.log(`📥 Downloaded ${logsRef.current.length} validation logs`);
            alert(`Downloaded ${logsRef.current.length} validation logs successfully!`);
        } catch (error) {
            console.error("Error downloading logs:", error);
            alert("Error downloading logs: " + error);
        }
    }, []);

    const clearLogs = useCallback(() => {
        logsRef.current = [];
        console.log("🗑️ Validation logs cleared");
    }, []);

    const getLogs = useCallback(() => {
        return [...logsRef.current];
    }, []);

    return {
        logValidation,
        downloadLogs,
        clearLogs,
        getLogs,
    };
};
