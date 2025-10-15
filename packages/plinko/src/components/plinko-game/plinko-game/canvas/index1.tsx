"use client";

import { Engine, Runner, Composite, Events, IEventCollision, Body } from "matter-js";
import { useEffect, useRef, useCallback } from "react";
import { BallBody, PegEffect } from "./type";
import { useSlot, usePeg, useBall, usePegEffect } from "./hooks";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "./constant";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { useShallow } from "zustand/shallow";
import { logger } from "@plinko/services/logger";

const PlinkoCanvas1 = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Engine | null>(null);
    const sceneObjectsRef = useRef<Body[]>([]);
    const animationRef = useRef<number | null>(null);
    const pegEffectsRef = useRef<PegEffect[]>([]);
    const pegIdRef = useRef<number>(0);
    const { finish, setFinishedBall } = usePlinkoGameStore(
        useShallow((state) => ({ finish: state.finish, setFinishedBall: state.actions.setFinishedBall }))
    );

    // Log canvas initialization details for mobile debugging
    useEffect(() => {
        logger.startWorkflow('plinko-canvas-init', 'ui', 'Initialize PlinkoCanvas component');

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isIPhone = /iPhone/.test(navigator.userAgent);

        logger.logUIEvent('canvas-component-init', {
            config: PlinkoCanvasConfig,
            deviceInfo: {
                isMobile,
                isIOS,
                isIPhone,
                userAgent: navigator.userAgent.substring(0, 100), // Truncate for logging
                devicePixelRatio: window.devicePixelRatio,
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
            },
            canvas: {
                expectedWidth: PlinkoCanvasConfig.width,
                expectedHeight: PlinkoCanvasConfig.height,
                willBeCreated: true,
            },
            potentialIssues: {
                viewportTooSmall: window.innerWidth < PlinkoCanvasConfig.width * 0.5,
                highPixelRatio: window.devicePixelRatio > 2,
                iOSDevice: isIOS,
                iPhoneDevice: isIPhone,
            }
        });
    }, []);

    // Peg hook
    const { createPegs, drawPeg } = usePeg();

    // Multiplier hook
    const { createSlots } = useSlot();

    // Ball hook
    const { createBall, drawBall, handleRoad } = useBall();

    // Peg effect hook
    const { createPegEffect, drawPegEffect } = usePegEffect({
        pegEffectsRef,
        pegIdRef,
    });

    // Collision handler
    const handleCollision = useCallback(
        (event: IEventCollision<Engine>) => {
            const pairs = event.pairs;
            if (!engineRef.current) {
                return;
            }

            logger.logPhysicsEvent('collision-detected', {
                pairsCount: pairs.length,
                timestamp: Date.now(),
                deviceInfo: {
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                    }
                }
            });

            for (const pair of pairs) {
                const { bodyA, bodyB } = pair;
                const ball = bodyA.label === PLINKO_OBJECTS.BALL ? bodyA : bodyB;
                const object = bodyA.label === PLINKO_OBJECTS.BALL ? bodyB : bodyA;
                if (!ball) {
                    continue;
                }

                // collision with peg
                if (object?.label === PLINKO_OBJECTS.PEG) {
                    logger.logPhysicsEvent('peg-collision', {
                        ballId: ball.id,
                        pegId: object.id,
                        position: {
                            x: ball.position.x,
                            y: ball.position.y,
                        }
                    });
                    createPegEffect(object);
                    handleRoad(ball, object);
                }
                // collision with slot
                if (object?.label === PLINKO_OBJECTS.SLOT) {
                    logger.logPhysicsEvent('slot-collision', {
                        ballId: ball.id,
                        slotId: object.id,
                        finishData: (ball as BallBody).finish,
                        position: {
                            x: ball.position.x,
                            y: ball.position.y,
                        }
                    });

                    setFinishedBall((ball as BallBody).finish);

                    // remove ball
                    Composite.remove(engineRef.current.world, [ball]);
                    sceneObjectsRef.current.splice(sceneObjectsRef.current.indexOf(ball), 1);

                    logger.logPhysicsEvent('ball-removed', {
                        ballId: ball.id,
                        remainingBalls: sceneObjectsRef.current.length,
                    });
                }
            }
        },
        [createPegEffect, handleRoad, setFinishedBall]
    );

    // Draw scene object
    const drawSceneObject = useCallback(
        (body: Body) => {
            const context = canvasRef.current?.getContext("2d");
            if (!context) {
                return;
            }
            const x = body.position.x;
            const y = body.position.y;
            const angle = body.angle;
            context.save();
            context.translate(x, y);
            context.rotate(angle);
            drawBall(body, context);
            drawPeg(body, context);
            context.restore();
        },
        [drawBall, drawPeg]
    );

    // Clear all objects
    const clear = useCallback(() => {
        if (engineRef.current) {
            Composite.clear(engineRef.current.world, true);
        }
        sceneObjectsRef.current = [];
        pegEffectsRef.current = [];
        if (canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            if (context) {
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    }, []);

    const addObjects = useCallback(
        (bodies: Body[]) => {
            if (!engineRef.current) {
                return;
            }
            Composite.add(engineRef.current.world, [...bodies]);
            sceneObjectsRef.current.push(...bodies);
        },
        [sceneObjectsRef]
    );

    // Generate map
    const generateMap = useCallback(() => {
        const canvas = canvasRef.current;
        if (!engineRef.current || !canvas) {
            return;
        }
        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }

        clear();
        const pegs = createPegs();
        const slots = createSlots();
        addObjects([...pegs, ...slots]);
    }, [clear, createPegs, createSlots, addObjects]);

    // Animation loop
    const animate = useCallback(() => {
        if (!canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) {
            logger.logUIEvent('canvas-context-error', {
                message: 'Failed to get 2D context from canvas',
                canvasExists: !!canvas,
                canvasDimensions: {
                    width: canvas.width,
                    height: canvas.height,
                }
            });
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all scene objects
        sceneObjectsRef.current.forEach((obj) => {
            drawSceneObject(obj);
        });

        // draw effects
        drawPegEffect?.(context);
        animationRef.current = requestAnimationFrame(animate);

        // Log performance metrics periodically (every ~60 frames)
        if (Math.random() < 0.016) { // ~1/60 chance
            logger.logUIEvent('canvas-render-performance', {
                sceneObjectsCount: sceneObjectsRef.current.length,
                pegEffectsCount: pegEffectsRef.current.length,
                canvasDimensions: {
                    width: canvas.width,
                    height: canvas.height,
                },
                deviceInfo: {
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    devicePixelRatio: window.devicePixelRatio,
                }
            });
        }
    }, [drawSceneObject, drawPegEffect]);

    // Initialize Matter.js engine
    const initializeEngine = useCallback(() => {
        if (!canvasRef.current) {
            logger.logUIEvent('canvas-init-failed', {
                reason: 'canvasRef not available',
                component: 'PlinkoCanvas'
            });
            return undefined;
        }

        logger.logPhysicsEvent('engine-initialization', {
            canvasAvailable: !!canvasRef.current,
            canvasDimensions: {
                width: canvasRef.current.width,
                height: canvasRef.current.height,
            }
        });

        const engine = Engine.create();
        engineRef.current = engine;

        logger.logPhysicsEvent('engine-created', {
            worldId: engine.world.id
        });

        return engine;
    }, []);

    const startRunner = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            logger.logUIEvent('runner-start-failed', {
                reason: 'canvas not available'
            });
            return undefined;
        }

        const { width, height } = PlinkoCanvasConfig;

        logger.logUIEvent('canvas-setup', {
            config: PlinkoCanvasConfig,
            before: {
                width: canvas.width,
                height: canvas.height,
                styleWidth: canvas.style.width,
                styleHeight: canvas.style.height,
            }
        });

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.pointerEvents = "none";

        logger.logUIEvent('canvas-configured', {
            actualDimensions: {
                width: canvas.width,
                height: canvas.height,
                styleWidth: canvas.style.width,
                styleHeight: canvas.style.height,
            },
            expectedDimensions: {
                width,
                height,
            },
            deviceInfo: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                }
            }
        });

        const runner = Runner.create();
        Runner.run(runner, engineRef.current);

        logger.logPhysicsEvent('runner-started', {
            hasEngine: !!engineRef.current
        });

        return runner;
    }, []);

    // Initialize component
    useEffect(() => {
        const engine = initializeEngine();
        if (!engine || !canvasRef.current) {
            return undefined;
        }

        generateMap();
        Events.on(engine, "collisionStart", handleCollision);
        const runner = startRunner();
        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            Events.off(engine, "collisionStart", handleCollision);
            runner && Runner.stop(runner);
            engineRef.current && Engine.clear(engineRef.current);
        };
    }, [initializeEngine, generateMap, handleCollision, startRunner, animate]);

    // Add ball
    useEffect(() => {
        if (finish) {
            logger.logPhysicsEvent('ball-creation-triggered', {
                finishData: finish,
                existingBallsCount: sceneObjectsRef.current.length,
                deviceInfo: {
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                }
            });

            const ballBody = createBall(finish);
            addObjects([ballBody]);

            logger.logPhysicsEvent('ball-added-to-scene', {
                ballId: ballBody.id,
                totalBallsInScene: sceneObjectsRef.current.length,
                ballPosition: {
                    x: ballBody.position.x,
                    y: ballBody.position.y,
                }
            });
        }
    }, [finish, createBall, addObjects]);

    logger.endWorkflow('plinko-canvas-init');

    return <canvas ref={canvasRef} />;
};

export default PlinkoCanvas1;
