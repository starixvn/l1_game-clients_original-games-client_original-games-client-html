import { GameRoundDataHandler } from "@shared/components/game-base/handlers/game-round-data-handler";

export class PlinkoGameRoundDataHandler extends GameRoundDataHandler {
    constructor() {
        super();
    }

    buildGameRoundDataAfterReceiveFinishEvent(previousRoundData: any, result: any, roundId: number): any {
        const resultRoundData = {
            roundId: roundId,
            path: result,
            timestamp: new Date().toISOString(),
        };

        const mergedHistory = (previousRoundData?.history || []).concat([{ ...resultRoundData }]);

        return {
            history: mergedHistory,
            last: resultRoundData,
            roundId,
            gameType: 'plinko',
        };
    }
}
