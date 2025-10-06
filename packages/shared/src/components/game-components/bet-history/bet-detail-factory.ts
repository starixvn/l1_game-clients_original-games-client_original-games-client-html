import { BetDetailData } from "@shared/stores/bet-detail-store";

export interface BetHistoryTableRow {
    originalBetLog?: any;
    [key: string]: any;
}

/**
 * Centralized factory for creating game-specific bet detail data
 * This keeps game-specific logic in one place and shared components don't need to know about specific games
 */
export function createBetDetailData(
    gameId: string,
    roundId: number,
    row: BetHistoryTableRow
): BetDetailData {
    // Plinko-specific bet detail logic
    if (gameId === '145') {
        return {
            drawInfo: {
                roundId: roundId,
                result: row.originalBetLog?.result,
                odds: row.originalBetLog?.odds,
                settlementResult: row.originalBetLog?.settlementResult,
                reachMaxWin: row.originalBetLog?.reachMaxWin,
                pfResult: {
                    roundId: row.originalBetLog?.roundId,
                    serverSeedHash: "",
                    serverSeed: "",
                    clientSeeds: [],
                    mergeSeed: "",
                    mergeClientSeed: "",
                    roundResult: [],
                    finalHash: "",
                    clientSeed: row.originalBetLog?.clientSeed || "",
                    editedMergeClientSeed: "",
                },
                clientSeed: row.originalBetLog?.clientSeed,
            },
            betLogDetails: (row.originalBetLog?.betLogDetails && row.originalBetLog.betLogDetails.length > 0)
                ? // Client-side generated logs have detailed betLogDetails
                  row.originalBetLog.betLogDetails.map((detail: any) => {
                      // Parse Plinko choice format: "plinko-{gameMode}-{numberOfRows}"
                      const choiceParts = detail.choice?.split('-') || [];
                      const gameMode = parseInt(choiceParts[1]) || 0;
                      const numberOfRows = parseInt(choiceParts[2]) || 8;

                      return {
                          rawTime: detail.time,
                          amount: detail.amount,
                          choice: numberOfRows, // Use numberOfRows as choice
                          win: row.originalBetLog?.betwin || 0, // Total win for the round
                          gameMode: gameMode,
                          reachMaxWin: row.originalBetLog?.reachMaxWin,
                      };
                  })
                : // Server-side logs or logs without betLogDetails - create single item
                  [{
                      rawTime: row.originalBetLog?.time,
                      amount: row.originalBetLog?.totalAmount || row.originalBetLog?.amount,
                      choice: row.originalBetLog?.numberOfRows || 8,
                      win: row.originalBetLog?.betwin || row.originalBetLog?.betWin,
                      gameMode: row.originalBetLog?.gameMode || 0,
                      reachMaxWin: row.originalBetLog?.reachMaxWin,
                  }],
        };
    }

    // Default bet detail logic for other games
    return {
        drawInfo: {
            roundId: roundId,
            result: row.originalBetLog?.result,
            odds: row.originalBetLog?.odds,
            settlementResult: row.originalBetLog?.settlementResult,
            pfResult: {
                roundId: row.originalBetLog?.roundId,
                serverSeedHash: "",
                serverSeed: "",
                clientSeeds: [],
                mergeSeed: "",
                mergeClientSeed: "",
                roundResult: [],
                finalHash: "",
                clientSeed: row.originalBetLog?.clientSeed || "",
                editedMergeClientSeed: "",
            },
            clientSeed: row.originalBetLog?.clientSeed,
        },
        betLogDetails: row.originalBetLog?.betLogDetails || [],
    };
}
