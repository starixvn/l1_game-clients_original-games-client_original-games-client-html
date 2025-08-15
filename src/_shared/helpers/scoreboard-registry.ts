// Simple scoreboard registry for custom version without lobby
export const registerBigRoadElement = (element: any, converter: any, ...gameIds: number[]) => {
    console.log("[ScoreboardRegistry] registerBigRoadElement called with:", { element: !!element, converter: !!converter, gameIds });
};
