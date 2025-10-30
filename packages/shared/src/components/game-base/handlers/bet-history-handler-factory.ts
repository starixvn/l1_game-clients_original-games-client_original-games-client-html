import { BetHistoryHandler, BetHistoryHandlerProps } from './bet-history-handler';

export function createBetHistoryHandler(props: BetHistoryHandlerProps): BetHistoryHandler {
    const { gameId } = props;

    // Try to load game-specific handler factory
    if (gameId === '145') {
        // Plinko uses a different handler
        try {
            const { PlinkoBetHistoryHandler } = require("@plinko/components/plinko-game-base/handlers/plinko-bet-history-handler");
            return new PlinkoBetHistoryHandler(props);
        } catch (error) {
            console.warn('Failed to load Plinko bet history handler, falling back to base handler:', error);
            return new BetHistoryHandler(props);
        }
    }

    return new BetHistoryHandler(props);
}
