import { useEffect } from 'react';

export interface UseGameSettingsProps {
    gameMode: string;
    rows: number;
    onGameModeChange: (mode: string) => void;
    onRowsChange: (rows: number) => void;
}

export const useGameSettings = ({
    gameMode,
    rows,
    onGameModeChange,
    onRowsChange,
}: UseGameSettingsProps) => {
    // Load persisted settings on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('plinko-gameMode');
        const savedRows = localStorage.getItem('plinko-rows');

        if (savedMode && ['Lightning', 'Low', 'Medium', 'High'].includes(savedMode)) {
            onGameModeChange(savedMode);
        }

        if (savedRows) {
            const rowsNum = parseInt(savedRows, 10);
            if (rowsNum >= 8 && rowsNum <= 16) {
                onRowsChange(rowsNum);
            }
        }
    }, [onGameModeChange, onRowsChange]);

    // Persist settings to localStorage
    useEffect(() => {
        localStorage.setItem('plinko-gameMode', gameMode);
    }, [gameMode]);

    useEffect(() => {
        localStorage.setItem('plinko-rows', rows.toString());
    }, [rows]);
};
