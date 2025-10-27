// Plinko Game Page Component
// This is the main entry point for both Plinko and Plinko X games in the monorepo
// Uses the PlinkoGameBase which extends the shared GameBase
// Game configuration is initialized dynamically based on URL path

import { useRouter } from "next/router";
import { useEffect } from "react";
import { initializeGameConfig } from "./game-config";
import { updateGameConfig } from "./games/games";
import PlinkoGameBase from "./components/plinko-game-base";

// Helper function to extract game ID from URL path
const extractGameIdFromPath = (path: string): number => {
    const pathGameIdMatch = path.match(/\/game-(\d+)/);
    return pathGameIdMatch ? parseInt(pathGameIdMatch[1]) : null; // Return null if no match
};

// Helper function to get game ID (prioritizes env var over URL)
const getGameId = (urlPath?: string): number => {
    console.log('🔍 DEBUG getGameId called:', { urlPath });

    // First priority: Environment variable (for dedicated game servers)
    const envGameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID;
    console.log('🔍 DEBUG env check:', { envGameId, envExists: !!envGameId });

    if (envGameId && !isNaN(Number(envGameId))) {
        const parsedEnvId = Number(envGameId);
        console.log('🔍 DEBUG returning env game ID:', parsedEnvId);
        return parsedEnvId;
    }

    // Second priority: Extract from URL path (for multi-game deployments)
    if (urlPath) {
        const urlGameId = extractGameIdFromPath(urlPath);
        console.log('🔍 DEBUG URL path extraction:', { urlPath, extractedGameId: urlGameId });

        if (urlGameId !== null) {
            console.log('🔍 DEBUG returning URL game ID:', urlGameId);
            return urlGameId;
        }
    } else {
        console.log('🔍 DEBUG no URL path provided');
    }

    // Default fallback
    console.log('🔍 DEBUG using default fallback: 145');
    return 145;
};

// Dynamic page component that initializes game config based on URL path
const PlinkoPage = (props: any) => {
    const router = useRouter();

    useEffect(() => {
        const gameId = getGameId(router.asPath);

        console.log(`Client-side initialization from URL path: ${router.asPath}, final gameId: ${gameId} (${gameId === 145 ? 'Plinko' : 'Plinko X'})`);
        initializeGameConfig(gameId);
        updateGameConfig(gameId);

        // Debug: Check for unexpected redirects
        console.log('🔍 DEBUG: Page loaded, checking for redirects...');

        const checkRedirect = () => {
            const expectedPath = gameId === 159 ? '/game-159/' : '/game-145/';
            if (window.location.pathname !== expectedPath) {
                console.error('🚨 REDIRECT DETECTED:', {
                    expected: expectedPath,
                    actual: window.location.pathname,
                    href: window.location.href,
                    gameId: gameId
                });
            }
        };

        // Check immediately and after delays
        checkRedirect();
        setTimeout(checkRedirect, 1000);
        setTimeout(checkRedirect, 5000);
    }, [router.asPath]);

    return <PlinkoGameBase {...props} />;
};

// Server-side initialization - Next.js will call this during SSR
PlinkoPage.getInitialProps = async (ctx: any) => {
    const url = ctx.req?.url || ctx.asPath || '';
    const gameId = getGameId(url);

    console.log(`Server-side getInitialProps initialization, URL: ${url}, final gameId: ${gameId} (${gameId === 145 ? 'Plinko' : 'Plinko X'})`);
    initializeGameConfig(gameId);
    updateGameConfig(gameId);

    return { gameId };
};

export default PlinkoPage;
