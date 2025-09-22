export const getDefaultGameId = (): number => {
    // Use environment variable if set, otherwise fallback to a known game ID

    const envGameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID;
    if (envGameId) {
        return Number(envGameId);
    }

    return 148;
};
