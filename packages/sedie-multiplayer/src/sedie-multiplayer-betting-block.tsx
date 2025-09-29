import { FC } from "react";
import SeDieMultiplayerBetOptions from "./bet-options/sedie-multiplayer-bet-options";
import { logger } from '@shared/services/logger';
import LoggerControls from "./features/ui/components/controls/LoggerControls";

const SeDieMultiplayerBettingBlock: FC = () => {
    logger.info('🎲 [SEDIE-BETTING] SeDie Multiplayer Betting Block component rendered', {
        timestamp: new Date().toISOString(),
        componentName: 'SeDieMultiplayerBettingBlock'
    });

    return (
        <div className="relative">
            <SeDieMultiplayerBetOptions />
            <LoggerControls className="fixed top-4 right-4 z-50" />
        </div>
    );
};

export default SeDieMultiplayerBettingBlock;
