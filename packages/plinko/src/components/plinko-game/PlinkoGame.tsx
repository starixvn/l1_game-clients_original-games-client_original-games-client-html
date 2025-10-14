import React, { useState, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/shallow";
import { BallLayout, SimplifiedCanvasBallLayoutRef } from "../../features/game/components";
import { LoggerControls } from "../../features/ui/components";
import { logger } from "../../services/logger";
import { useGameStore } from "@shared/stores";
import { useGameContext } from "@shared/react-contexts";
import { usePlinkoGameStore } from "../../shared/stores/plinko-game-store";
import { calculateProbability } from "@plinko/utils/helper";

const WinningAmountEffect = dynamic(() => import("./winning-amount-effect"), { ssr: false });

const PlinkoGame = () => {
    logger.startWorkflow('plinko-game-init', 'game-init', 'Initialize PlinkoGame component');

    const [payoutProbabilities, setPayoutProbabilities] = useState<number[]>([]);
    const ballLayoutRef = useRef<SimplifiedCanvasBallLayoutRef>(null);

    // Track expected slots per round ID to handle concurrent bets and avoid race conditions
    const [expectedSlotsByRound, setExpectedSlotsByRound] = useState<Map<number, number>>(new Map());

    logger.logGameEvent('plinko-game-component-created', {
        component: 'PlinkoGame',
        initialState: {
            payoutProbabilities: [],
            expectedSlotsByRound: new Map(),
            ballLayoutRef: null
        }
    }, {
        category: 'game-init',
        workflow: 'plinko-game-init'
    });

    // Log device and viewport information for canvas scaling debugging
    useEffect(() => {
        const logDeviceInfo = () => {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isIPhone = /iPhone/.test(navigator.userAgent);

            logger.logUIEvent('device-detection', {
                userAgent: navigator.userAgent,
                isMobile,
                isIOS,
                isIPhone,
                platform: navigator.platform,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio,
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                    screenAvailWidth: window.screen.availWidth,
                    screenAvailHeight: window.screen.availHeight,
                },
                touchSupport: {
                    maxTouchPoints: navigator.maxTouchPoints,
                    hasTouchScreen: 'ontouchstart' in window,
                },
                canvasSupport: {
                    supportsCanvas: !!document.createElement('canvas').getContext,
                    webglSupport: (() => {
                        try {
                            const canvas = document.createElement('canvas');
                            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                        } catch (e) {
                            return false;
                        }
                    })(),
                },
                performance: {
                    memory: (performance as any).memory ? {
                        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
                    } : 'Not available',
                }
            });

            // Log orientation changes
            const handleOrientationChange = () => {
                logger.logUIEvent('orientation-change', {
                    orientation: (screen as any).orientation?.type || 'unknown',
                    angle: (screen as any).orientation?.angle || 0,
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                    }
                });
            };

            window.addEventListener('orientationchange', handleOrientationChange);
            window.addEventListener('resize', () => {
                logger.logUIEvent('window-resize', {
                    newViewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                        devicePixelRatio: window.devicePixelRatio,
                    }
                });
            });

            return () => {
                window.removeEventListener('orientationchange', handleOrientationChange);
                window.removeEventListener('resize', () => { });
            };
        };

        const cleanup = logDeviceInfo();

        return cleanup;
    }, []);

    // Shared game context and betting store
    const { endBet, socket, gameConfigs } = useGameStore(
        useShallow((state) => ({
            endBet: state.endBet,
            socket: state.socket,
            gameConfigs: state.gameConfigs,
        }))
    );
    const { gameMode, numberOfRows } = usePlinkoGameStore();

    logger.logGameEvent('plinko-game-stores-initialized', {
        sharedStore: {
            endBet,
            socketConnected: !!socket,
            gameConfigsAvailable: !!gameConfigs
        },
        plinkoStore: {
            gameMode,
            numberOfRows
        }
    }, {
        category: 'game-init',
        workflow: 'plinko-game-init'
    });

    // Use shared PF system for clientSeed (like sedie-multiplayer)
    const { gameMessageHandler } = useGameContext();
    // Register Plinko-specific handlers when component mounts
    useEffect(() => {
        if (!gameMessageHandler) {
            return undefined;
        }

        // Register handler for endBet message (contains the finish object with result path)
        const endBetHandlerId = gameMessageHandler.register("endBet", (action) => {
            logger.logBetAction('endBet-handler-called', action, {
                category: 'betting',
                workflow: 'plinko-game-init'
            });

            if (action?.finish?.result) {
                const resultPath = action.finish.result;
                const slotIndex = action.finish.settlementResult?.slotIndex || 4;
                const multiplier = action.finish.settlementResult?.multiplier || 1;
                const betAmount = action.finish.amount || action.endBet || 100;
                const winAmount = action.finish.winAmount;
                const countOfOnes = resultPath.filter((p: number) => p === 1).length;
                const roundId = action.finish.roundId;

                // Store the expected slot for this round for validation when ball lands
                // console.log('🎯 [PLINKO GAME] STORING EXPECTED SLOT', {
                //     roundId,
                //     slotIndex,
                //     actionRoundId: action.finish.roundId,
                //     mapSizeBefore: expectedSlotsByRound.size
                // });
                setExpectedSlotsByRound((prev) => {
                    return new Map(prev.set(roundId, slotIndex));
                });

                logger.logGameEvent('ball-spawn-attempt', {
                    resultPath,
                    pathLength: resultPath.length,
                    slotIndex,
                    multiplier,
                    betAmount,
                    winAmount,
                    countOfOnes,
                    validation: {
                        pathLengthMatchesRows: resultPath.length === 9, // Assuming 9 rows
                        slotIndexMatchesCount: countOfOnes === slotIndex,
                        multiplierValid: multiplier > 0,
                        betAmountValid: betAmount > 0,
                    },
                }, {
                    category: 'game-init',
                    roundId: roundId?.toString(),
                    workflow: 'plinko-game-init'
                });

                // Function to attempt spawning with retry logic
                const attemptSpawnBall = (retryCount = 0) => {
                    const maxRetries = 10; // Try for up to ~1 second (10 * 100ms)

                    if (ballLayoutRef.current?.spawnBallWithPath) {
                        try {
                            logger.logGameEvent('ball-spawn-attempt', {
                                retryCount,
                                roundId,
                                betAmount,
                                pathLength: resultPath.length,
                                slotIndex,
                                multiplier,
                                canvasReady: !!ballLayoutRef.current,
                                deviceInfo: {
                                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                                    viewport: {
                                        width: window.innerWidth,
                                        height: window.innerHeight,
                                        devicePixelRatio: window.devicePixelRatio,
                                    }
                                }
                            });

                            ballLayoutRef.current.spawnBallWithPath(betAmount, resultPath, slotIndex, multiplier, undefined, roundId);

                            logger.logGameEvent('ball-spawn-success', {
                                roundId,
                                betAmount,
                                pathLength: resultPath.length,
                                slotIndex,
                                multiplier,
                                countOfOnes,
                                retryCount
                            }, {
                                category: 'game-init',
                                roundId: roundId?.toString(),
                                workflow: 'plinko-game-init'
                            });
                            return true; // Success
                        } catch (error) {
                            logger.logError(error as Error, {
                                context: 'ball-spawn-attempt',
                                roundId,
                                betAmount,
                                resultPath,
                                slotIndex,
                                multiplier,
                                retryCount,
                                deviceInfo: {
                                    viewport: {
                                        width: window.innerWidth,
                                        height: window.innerHeight,
                                    }
                                }
                            }, {
                                category: 'error',
                                roundId: roundId?.toString(),
                                workflow: 'plinko-game-init'
                            });
                            return false; // Failed
                        }
                    } else {
                        if (retryCount < maxRetries) {
                            logger.logGameEvent('ball-spawn-retry', {
                                retryCount,
                                maxRetries,
                                roundId,
                                canvasReady: !!ballLayoutRef.current
                            }, {
                                category: 'game-init',
                                roundId: roundId?.toString(),
                                workflow: 'plinko-game-init'
                            });
                            // Retry after 100ms
                            setTimeout(() => attemptSpawnBall(retryCount + 1), 100);
                        } else {
                            logger.logError(new Error('ballLayoutRef not available after max retries'), {
                                context: 'ball-spawn-timeout',
                                roundId,
                                maxRetries,
                                canvasReady: !!ballLayoutRef.current,
                                deviceInfo: {
                                    viewport: {
                                        width: window.innerWidth,
                                        height: window.innerHeight,
                                    }
                                }
                            }, {
                                category: 'error',
                                roundId: roundId?.toString(),
                                workflow: 'plinko-game-init'
                            });
                        }
                        return false; // Still not ready, will retry
                    }
                };

                // Start attempting to spawn the ball
                attemptSpawnBall();
            } else {
                logger.warn("⚠️ [PLINKO GAME] EndBet message received but no result path found", action);
            }
        });

        return () => {
            // Cleanup handlers when component unmounts
            if (gameMessageHandler.removeHandler) {
                gameMessageHandler.removeHandler(endBetHandlerId);
            }
        };
    }, [gameMessageHandler, socket]);

    // Get multipliers from odds config based on current game mode and rows
    const payoutMultipliers = useMemo(() => {
        try {
            return gameConfigs?.odds?.[gameMode][numberOfRows] as unknown as number[];
        } catch (error) {
            console.warn("Failed to get odds for mode, using fallback multipliers", { gameMode, numberOfRows, error });
            // Fallback multipliers if config is invalid
            return [];
        }
    }, [gameMode, numberOfRows, gameConfigs]);

    // Update probabilities based on multipliers
    useEffect(() => {
        if (payoutMultipliers && payoutMultipliers.length > 0) {
            const defaultProbabilities = payoutMultipliers.map((val, index) => {
                return calculateProbability(numberOfRows, index);
            });
            setPayoutProbabilities(defaultProbabilities);
        }
    }, [payoutMultipliers]);

    useEffect(() => {
        if (endBet !== -1) {
            useGameStore.getState().resetBettingInfo();
        }
    }, [endBet]);

    // Socket connection is now handled by shared InitSocketIO in page.tsx

    // Handle bet results for auto bet - disabled since lastBetResult is not provided by shared system
    // Plinko handles bet results through its own internal logic

    // Update multipliers from service configs - disabled since gameConfigs is not provided by shared system
    // Plinko uses hardcoded multipliers for now

    // Handle ball collision with multiplier slots
    const handleBallHit = () => {
        logger.logPhysicsEvent('ball-hit-multiplier', {
            context: 'handleBallHit callback',
            deviceInfo: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                }
            }
        });
    };

    // Handle ball landing result validation against service result
    const handleBallLanded = (success: boolean, roundId?: number) => {
        const expectedSlot = roundId ? expectedSlotsByRound.get(roundId) : undefined;

        logger.logGameEvent('ball-landed-validation', {
            success,
            roundId,
            expectedSlot,
            validation: {
                ballLandedCorrectly: success,
                expectedSlotFromService: expectedSlot,
                roundId,
                hasServiceResult: expectedSlot !== undefined,
                slotValidationEnabled: true,
            },
            deviceInfo: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio,
                }
            }
        });

        if (expectedSlot !== undefined && roundId !== undefined) {
            if (success) {
                logger.logGameEvent('ball-landed-success', {
                    expectedSlot,
                    roundId,
                    serviceResultSlot: expectedSlot,
                    status: "SUCCESS",
                    message: `Ball successfully landed in slot ${expectedSlot} as expected by service`
                });
            } else {
                logger.logError(new Error(`Ball landed in wrong slot - expected ${expectedSlot}`), {
                    context: 'ball-landing-validation',
                    expectedSlot,
                    roundId,
                    serviceResultSlot: expectedSlot,
                    status: "FAILED",
                    actionRequired: "Check physics engine slot detection logic",
                    deviceInfo: {
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight,
                        }
                    }
                });
            }

            // Clear the expected slot after validation
            setExpectedSlotsByRound((prev) => {
                const newMap = new Map(prev);
                newMap.delete(roundId);
                return newMap;
            });
        } else {
            logger.logGameEvent('ball-landed-no-validation', {
                success,
                roundId,
                expectedSlot: null,
                message: "Ball landed but no expected slot was stored from service result",
            });
        }
    };

    logger.logUIEvent('plinko-game-render', {
        payoutProbabilitiesCount: payoutProbabilities.length,
        expectedSlotsCount: expectedSlotsByRound.size,
        gameMode,
        numberOfRows,
        deviceInfo: {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            }
        }
    });

    // End workflow on component unmount
    useEffect(() => {
        return () => {
            logger.endWorkflow('plinko-game-init');
        };
    }, []);

    return (
        <div className="" style={{ position: 'relative', overflow: 'visible' }}>
            {/* Logger Controls - positioned outside game-info to avoid clipping */}
            <div
                style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    right: "10px",
                    zIndex: 10000,
                }}
            >
                <LoggerControls className="w-full" />
            </div>

            <div className="game-info">
                <div className="frame-game">
                    <div className="frame-2">
                        <div className="game-layout-container">
                            <div className="ball-layout-wrapper">
                                <BallLayout
                                    ref={ballLayoutRef}
                                    multipliers={payoutMultipliers}
                                    probabilities={payoutProbabilities}
                                    onBallHit={handleBallHit}
                                    onBallLanded={handleBallLanded}
                                />
                            </div>

                            {/* <PayoutsDisplay
                                multipliers={payoutMultipliers}
                                probabilities={payoutProbabilities}
                                betAmount={endBet}
                                rows={numberOfRows}
                            /> */}

                            {/* Temporary bet button for testing */}
                            {/* <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 100 }}>
                                <button
                                    onClick={() => placeBet(100, 1, 9)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    Place Bet ($100)
                                </button>
                            </div> */}
                        </div>
                    </div>
                    <WinningAmountEffect />
                </div>
            </div>
        </div>
    );
};

export default PlinkoGame;
