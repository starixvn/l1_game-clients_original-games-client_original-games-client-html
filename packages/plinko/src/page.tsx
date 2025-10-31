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

// Dynamic page component that initializes game config based on URL path
const PlinkoPage = (props: any) => {
    const router = useRouter();

    useEffect(() => {
        const gameId = getGameId(router.asPath);


        initializeGameConfig(gameId);
        updateGameConfig(gameId);

        // Debug: Monitor for unexpected redirects (comprehensive)


        let redirectCheckCount = 0;
        const maxChecks = 20; // Check for 20 seconds

        const checkRedirect = () => {
            redirectCheckCount++;
            const expectedPath = gameId === 159 ? '/site-159/' : '/site-145/';
            const currentPath = window.location.pathname;
            const currentHref = window.location.href;

            if (currentPath !== expectedPath) {
                console.error('🚨 REDIRECT DETECTED:', {
                    checkNumber: redirectCheckCount,
                    expected: expectedPath,
                    actual: currentPath,
                    href: currentHref,
                    gameId: gameId,
                    timestamp: new Date().toISOString()
                });

                // Stop checking once we detect a redirect
                return true;
            }
            return false;
        };

        // Check immediately
        if (!checkRedirect()) {
            // Continue checking every 1 second for 20 seconds if no redirect detected
            const intervalId = setInterval(() => {
                if (checkRedirect() || redirectCheckCount >= maxChecks) {
                    clearInterval(intervalId);
                }
            }, 1000);
        }

        // Also monitor for external navigation (popstate, beforeunload)
        const handleNavigation = (event: Event) => {
            console.warn('🚨 EXTERNAL NAVIGATION DETECTED:', {
                type: event.type,
                currentPath: window.location.pathname,
                currentHref: window.location.href,
                gameId: gameId,
                timestamp: new Date().toISOString()
            });
        };

        window.addEventListener('popstate', handleNavigation);
        window.addEventListener('beforeunload', handleNavigation);

        // Additional monitoring: Check for URL changes via location.href polling
        let lastHref = window.location.href;
        const pollForUrlChanges = () => {
            const currentHref = window.location.href;
            if (currentHref !== lastHref) {
                console.error('🚨 URL CHANGE DETECTED (polling):', {
                    from: lastHref,
                    to: currentHref,
                    gameId: gameId,
                    timestamp: new Date().toISOString()
                });
                lastHref = currentHref;
            }
        };

        // Poll every 500ms for URL changes
        const pollIntervalId = setInterval(pollForUrlChanges, 500);

        // Return cleanup function for useEffect
        return () => {
            window.removeEventListener('popstate', handleNavigation);
            window.removeEventListener('beforeunload', handleNavigation);
            clearInterval(pollIntervalId);
        };
    }, [router.asPath]);

    return <PlinkoGameBase {...props} />;
};

// Server-side initialization - Next.js will call this during SSR
PlinkoPage.getInitialProps = async (ctx: any) => {
    const url = ctx.req?.url || ctx.asPath || '';
    const gameId = getGameId(url);


    initializeGameConfig(gameId);
    updateGameConfig(gameId);

    return { gameId };
};

export default PlinkoPage;
