// Plinko Game Page Component
// This is the main entry point for both Plinko and Plinko X games in the monorepo
// Uses the PlinkoGameBase which extends the shared GameBase
// Game configuration is initialized dynamically based on URL path

import { useRouter } from "next/router";
import { ComponentProps, useEffect } from "react";
import { initializeGameConfig } from "./game-config";
import { updateGameConfig } from "./games/games";
import PlinkoGameBase from "./components/plinko-game-base";
// Helper function to extract game ID from URL path
const extractGameIdFromPath = (path: string): number | null => {
    const pathGameIdMatch = path.match(/\/site-(\d+)/);
    return pathGameIdMatch ? parseInt(pathGameIdMatch[1]) : null; // Return null if no match
};

// Helper function to get game ID (prioritizes env var over URL)
const getGameId = (urlPath?: string): number => {
    // First priority: Environment variable (for dedicated game servers)
    const envGameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID;

    if (envGameId && !isNaN(Number(envGameId))) {
        return Number(envGameId);
    }

    // Second priority: Extract from URL path (for multi-game deployments)
    if (urlPath) {
        const urlGameId = extractGameIdFromPath(urlPath);

        if (urlGameId !== null) {
            return urlGameId;
        }
    }

    // Default fallback

    return 145;
};
type PlinkoPageProps = ComponentProps<typeof PlinkoGameBase>;

const initialConfig = (gameId: number) => {
    initializeGameConfig(gameId);
    updateGameConfig(gameId);
};

// Dynamic page component that initializes game config based on URL path
const Page = (props: PlinkoPageProps) => {
    const router = useRouter();

    useEffect(() => {
        const gameId = getGameId(router.asPath);

        initialConfig(gameId);

        // Return cleanup function for useEffect
        return () => {
            // No cleanup needed as no event listeners or intervals were added
        };
    }, [router.asPath]);

    return <PlinkoGameBase {...props} />;
};

// Server-side initialization - Next.js will call this during SSR
Page.getInitialProps = async (ctx: any) => {
    const url = ctx.req?.url || ctx.asPath || "";
    const gameId = getGameId(url);

    initialConfig(gameId);

    return { gameId };
};

export default Page;
