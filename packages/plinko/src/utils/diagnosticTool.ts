import { logger } from '../services/logger';

/**
 * Diagnostic tool to help identify why balls aren't spawning
 */
export const diagnosticTool = {
    /**
     * Check if the component ref is properly connected
     */
    checkComponentRef: (componentRef: any) => {
        logger.info('🔍 [DIAGNOSTIC] Checking component ref:', {
            refExists: !!componentRef,
            refCurrent: !!componentRef?.current,
            hasSpawnBall: typeof componentRef?.current?.spawnBall === 'function',
            hasSpawnBallWithPath: typeof componentRef?.current?.spawnBallWithPath === 'function',
            hasIsReady: typeof componentRef?.current?.isReady === 'function',
            isReady: componentRef?.current?.isReady?.()
        });

        return {
            refExists: !!componentRef,
            refCurrent: !!componentRef?.current,
            hasSpawnBall: typeof componentRef?.current?.spawnBall === 'function',
            hasSpawnBallWithPath: typeof componentRef?.current?.spawnBallWithPath === 'function',
            hasIsReady: typeof componentRef?.current?.isReady === 'function',
            isReady: componentRef?.current?.isReady?.()
        };
    },

    /**
     * Test ball spawning directly
     */
    testBallSpawning: (componentRef: any) => {
        logger.info('🧪 [DIAGNOSTIC] Testing ball spawning...');

        if (!componentRef?.current) {
            logger.error('❌ [DIAGNOSTIC] Component ref is null or undefined');
            return false;
        }

        if (!componentRef.current.isReady()) {
            logger.error('❌ [DIAGNOSTIC] Component is not ready');
            return false;
        }

        try {
            logger.info('🎯 [DIAGNOSTIC] Attempting to spawn ball...');
            componentRef.current.spawnBall(100);
            logger.info('✅ [DIAGNOSTIC] Ball spawn command sent successfully');
            return true;
        } catch (error) {
            logger.error('❌ [DIAGNOSTIC] Error spawning ball:', error);
            return false;
        }
    },

    /**
     * Check game state and events
     */
    checkGameState: () => {
        logger.info('🎮 [DIAGNOSTIC] Checking game state...');

        // Check if we're in a browser environment
        const isBrowser = typeof window !== 'undefined';
        logger.info('🌐 [DIAGNOSTIC] Environment:', { isBrowser });

        let playButton = null;
        let betButton = null;
        let spinButton = null;

        if (isBrowser) {
            // Check for common game elements
            playButton = document.querySelector('[data-testid="play-button"], .play-button, button[class*="play"]');
            betButton = document.querySelector('[data-testid="bet-button"], .bet-button, button[class*="bet"]');
            spinButton = document.querySelector('[data-testid="spin-button"], .spin-button, button[class*="spin"]');

            logger.info('🎮 [DIAGNOSTIC] Game UI elements:', {
                playButton: !!playButton,
                betButton: !!betButton,
                spinButton: !!spinButton,
                playButtonText: playButton?.textContent,
                betButtonText: betButton?.textContent,
                spinButtonText: spinButton?.textContent
            });

            // Check for event listeners on buttons
            if (playButton) {
                const events = (playButton as any)._events || 'No events found';
                logger.info('🎮 [DIAGNOSTIC] Play button events:', { events });
            }
        }

        return {
            isBrowser,
            playButton: !!playButton,
            betButton: !!betButton,
            spinButton: !!spinButton
        };
    },

    /**
     * Run full diagnostic
     */
    runFullDiagnostic: (componentRef: any) => {
        logger.info('🔍 [DIAGNOSTIC] Running full diagnostic...');

        const refCheck = diagnosticTool.checkComponentRef(componentRef);
        const gameState = diagnosticTool.checkGameState();
        const spawnTest = diagnosticTool.testBallSpawning(componentRef);

        const summary = {
            refCheck,
            gameState,
            spawnTest,
            timestamp: new Date().toISOString()
        };

        logger.info('📊 [DIAGNOSTIC] Full diagnostic summary:', summary);

        return summary;
    }
};

// Make diagnostic tool available globally
if (typeof window !== 'undefined') {
    (window as any).plinkoDiagnostic = diagnosticTool;
}
