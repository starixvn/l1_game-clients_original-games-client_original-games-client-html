import { GameRoundDataHandler } from "@shared/components/game-base/handlers/game-round-data-handler";

export class PlinkoGameRoundDataHandler extends GameRoundDataHandler {
    constructor() {
        super();
    }

    buildGameRoundDataAfterReceiveFinishEvent(previousRoundData: any, result: any, roundId: number): any {

        console.log("ZEPHYR LOG - PLINKO GAME ROUND DATA HANDLER - \npreviousRoundData:: ", previousRoundData, "\nresult:: ", result, "\n roundId:: ", roundId);
        

        // For Plinko, each "round" is a single ball drop
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
