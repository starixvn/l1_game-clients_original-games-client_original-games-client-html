/**
 * Diagnostic tool to help identify why balls aren't spawning
 */
export const diagnosticTool = {
    /**
     * Check if the component ref is properly connected
     */
    checkComponentRef: (componentRef: any) => {
        const result = {
            refExists: !!componentRef,
            refCurrent: !!componentRef?.current,
            hasSpawnBall: typeof componentRef?.current?.spawnBall === 'function',
            hasSpawnBallWithPath: typeof componentRef?.current?.spawnBallWithPath === 'function',
            hasIsReady: typeof componentRef?.current?.isReady === 'function',
            isReady: componentRef?.current?.isReady?.()
        };

        console.log('🔍 [DIAGNOSTIC] Component ref check:', result);
        return result;
    },

    /**
     * Test ball spawning directly
     */
    testBallSpawning: (componentRef: any) => {
        console.log('🧪 [DIAGNOSTIC] Testing ball spawning...');

        if (!componentRef?.current) {
            console.error('❌ [DIAGNOSTIC] Component ref is null or undefined');
            return false;
        }

        if (!componentRef.current.isReady()) {
            console.error('❌ [DIAGNOSTIC] Component is not ready');
            return false;
        }

        try {
            console.log('🎯 [DIAGNOSTIC] Attempting to spawn ball...');
            componentRef.current.spawnBall(100);
            console.log('✅ [DIAGNOSTIC] Ball spawn command sent successfully');
            return true;
        } catch (error) {
            console.error('❌ [DIAGNOSTIC] Error spawning ball:', error);
            return false;
        }
    },

    /**
     * Check game state and events
     */
    checkGameState: () => {
        console.log('🎮 [DIAGNOSTIC] Checking game state...');

        // Check if we're in a browser environment
        const isBrowser = typeof window !== 'undefined';
        console.log('🌐 [DIAGNOSTIC] Environment:', { isBrowser });

        let playButton = null;
        let betButton = null;
        let spinButton = null;

        if (isBrowser) {
            // Check for common game elements
            playButton = document.querySelector('[data-testid="play-button"], .play-button, button[class*="play"]');
            betButton = document.querySelector('[data-testid="bet-button"], .bet-button, button[class*="bet"]');
            spinButton = document.querySelector('[data-testid="spin-button"], .spin-button, button[class*="spin"]');

            console.log('🎮 [DIAGNOSTIC] Game UI elements:', {
                playButton: !!playButton,
                betButton: !!betButton,
                spinButton: !!spinButton,
                playButtonText: playButton?.textContent,
                betButtonText: betButton?.textContent,
                spinButtonText: spinButton?.textContent
            });

            // Check for event listeners on buttons
            if (playButton) {
                const events = playButton._events || 'No events found';
                console.log('🎮 [DIAGNOSTIC] Play button events:', { events });
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
        console.log('🔍 [DIAGNOSTIC] Running full diagnostic...');

        const refCheck = diagnosticTool.checkComponentRef(componentRef);
        const gameState = diagnosticTool.checkGameState();
        const spawnTest = diagnosticTool.testBallSpawning(componentRef);

        const summary = {
            refCheck,
            gameState,
            spawnTest,
            timestamp: new Date().toISOString()
        };

        console.log('📊 [DIAGNOSTIC] Full diagnostic summary:', summary);

        return summary;
    }
};

// Make diagnostic tool available globally
if (typeof window !== 'undefined') {
    (window as any).plinkoDiagnostic = diagnosticTool;
}
