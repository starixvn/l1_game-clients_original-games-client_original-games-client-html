import React from 'react';
import { GameModeSelectorProps } from '../../../../shared/types';
import styles from './GameModeSelector.module.scss';
import { logger } from '../../../../services';

const GameModeSelector: React.FC<GameModeSelectorProps> = ({
    gameMode,
    onGameModeChange,
}) => {
    const gameModes = ['Lightning', 'Low', 'Medium', 'High'] as const;

    // Handle mode change with Lightning mode placeholder logic (Section 4.3)
    const handleModeChange = (mode: GameModeSelectorProps['gameMode']) => {
        onGameModeChange(mode);

        // Section 4.3: Lightning mode is TBD - log placeholder warning
        if (mode === 'Lightning') {
            console.warn('Lightning mode selected: This mode is currently under development (Section 4.3 - TBD). Using fallback payouts.');
        }
    };

    const getModeClass = (mode: string, isSelected: boolean) => {
        let baseClass = "";
        switch (mode) {
            case 'Lightning': baseClass = styles['div-lightning']; break;
            case 'Low': baseClass = styles['div-low']; break;
            case 'Medium': baseClass = styles['div-medium']; break;
            case 'High': baseClass = styles['div-high']; break;
            default: baseClass = styles['div-lightning']; break;
        }
        return isSelected ? `${baseClass} ${styles.selected}` : baseClass;
    };

    const getSpanClass = (mode: string) => {
        switch (mode) {
            case 'Lightning': return styles['span-number-ad'];
            case 'Low': return styles['span-number-ae'];
            case 'Medium': return styles['span-number-af'];
            case 'High': return styles['span-number-b0'];
            default: return styles['span-number-ad'];
        }
    };

    return (
        <div
            className={styles['span-game-mode']}
        >
            <span className={styles['span-title-ab']}>Game Mode</span>
            <div className={styles['input-ac']}>
                {gameModes.map((mode) => (
                    <button
                        key={`mode-${mode}`}
                        type="button"
                        className={getModeClass(mode, gameMode === mode)}
                        onClick={() => handleModeChange(mode)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleModeChange(mode);
                            }
                        }}
                        aria-pressed={gameMode === mode}
                    >
                        <span className={getSpanClass(mode)}>
                            {mode}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GameModeSelector;


