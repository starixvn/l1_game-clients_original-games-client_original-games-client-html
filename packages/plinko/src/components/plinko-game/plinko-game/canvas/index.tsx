"use client";

import { Engine, Runner, Composite, Events, IEventCollision, Body } from "matter-js";
import { useEffect, useRef, useCallback } from "react";
import { BallBody } from "./type";
import { useSlot, usePeg, useBall, usePegEffect, useExplosionEffect, usePathPreview, useMoneyFlyAnimation } from "./hooks";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "./constant";
import { usePlinkoSettingStore, usePlinkoGameStore } from "@plinko/shared/stores";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store";
import { usePlinkoBallHitWinSound } from "@plinko/shared/hooks/use-sound";
import { PlinkoFinish } from "@plinko/shared/types/types";

const PlinkoCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Engine | null>(null);
    const pegsRef = useRef<Body[]>([]);
    const animationRef = useRef<number | null>(null);
    const explosionTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const PATH_ANIMATION_DURATION = 300;

    const { finish, setFinishedBall, isDroppingBall } = usePlinkoGameStore(
        useShallow((state) => ({
            finish: state.finish,
            setFinishedBall: state.actions.setFinishedBall,
            isDroppingBall: state.numberOfDroppingBall > 0,
        }))
    );
    const isInstantMode = usePlinkoSettingStore((state) => state.isInstantMode);

    // Calculate final ball position for fast mode
    const calculateFinalBallPosition = useCallback((finish: PlinkoFinish) => {
        const { width, pegRadius, mapGap } = PlinkoCanvasConfig;
        const initialColumns = 3;
        const finalRow = finish.result.length;
        const finalColumnsInRow = initialColumns + finalRow;
        const gap = pegRadius * 2 * mapGap;
        const space = (width - gap * finalColumnsInRow) / 2;

        // Calculate final column position
        let currentColumnIndex = 1; // middle of first row
        for (const direction of finish.result) {
            if (direction === 1) {
                currentColumnIndex += 1;
            }
        }
        const finalColNumber = currentColumnIndex + 1;
        const slotX = space + finalColNumber * gap - pegRadius * mapGap;
        const slotY = (finalRow + 1) * gap;

        return { x: slotX, y: slotY };
    }, []);

    // Peg hook
    const { createPegs, drawPeg } = usePeg();

    // Multiplier hook
    const { createSlot } = useSlot();

    // Ball hook
    const { createBall, drawBalls, handleRoad, removeBall } = useBall();

    // Peg effect hook
    const { createPegEffect, drawPegEffect } = usePegEffect();

    // Explosion effect hook
    const { createExplosionEffect, createExplosionEffectAtPosition, drawExplosionEffect } = useExplosionEffect();

    // Path preview hook
    const { createPathPreview, drawPathPreview } = usePathPreview({ pegsRef });

    // Money fly animation hook
    const { createMoneyFlyAnimation, drawMoneyFlyAnimations } = useMoneyFlyAnimation();

    // Sound hook
    const playPlinkoBallHitWinSound = usePlinkoBallHitWinSound();
    const playPlinkoBallHitWinSoundRef = useRef(playPlinkoBallHitWinSound);
    playPlinkoBallHitWinSoundRef.current = playPlinkoBallHitWinSound;

    // Collision handler
    const handleCollision = useCallback(
        (event: IEventCollision<Engine>) => {
            if (!engineRef.current) {
                return;
            }

            for (const pair of event.pairs) {
                const { bodyA, bodyB } = pair;
                const ball = bodyA.label === PLINKO_OBJECTS.BALL ? bodyA : bodyB;
                const object = bodyA.label === PLINKO_OBJECTS.BALL ? bodyB : bodyA;

                if (!ball) {
                    continue;
                }
                // collision with peg
                if (object?.label === PLINKO_OBJECTS.PEG) {
                    createPegEffect(object);
                    handleRoad(ball, object);
                }
                // collision with slot
                if (object?.label === PLINKO_OBJECTS.SLOT) {
                    const ballBody = ball as BallBody;

                    setFinishedBall(ballBody.finish);
                    playPlinkoBallHitWinSoundRef.current();

                    createExplosionEffect(ball);

                    // Create money fly animation at ball position
                    const winningAmount = ballBody.finish?.winAmount || 0;
                    if (winningAmount > 0) {
                        createMoneyFlyAnimation(ball.position.x, ball.position.y, winningAmount);
                    }

                    // remove ball
                    Composite.remove(engineRef.current.world, [ball]);
                    removeBall(ball);
                }
            }
        },
        [createPegEffect, handleRoad, setFinishedBall, createExplosionEffect, createMoneyFlyAnimation, removeBall]
    );

    // Clear all objects
    const clear = useCallback(() => {
        if (engineRef.current) {
            Composite.clear(engineRef.current.world, true);
        }
        pegsRef.current = [];
        if (canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            if (context) {
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    }, []);

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
        const slot = createSlot();
        Composite.add(engineRef.current.world, [...pegs, slot]);
        pegsRef.current = pegs;
    }, [clear, createPegs, createSlot]);

    // Animation loop
    const animate = useCallback(() => {
        if (!canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all scene objects
        pegsRef.current.forEach((obj) => {
            drawPeg(obj, context);
        });

        // draw effects first (behind objects)
        drawPegEffect?.(context);

        // draw path preview
        drawPathPreview?.(context);

        // draw balls
        drawBalls?.(context);

        // Draw explosion effects
        drawExplosionEffect?.(context);

        // Draw money fly animations
        drawMoneyFlyAnimations?.(context);

        animationRef.current = requestAnimationFrame(animate);
    }, [drawPeg, drawBalls, drawPegEffect, drawExplosionEffect, drawPathPreview, drawMoneyFlyAnimations]);

    // Initialize Matter.js engine
    const initializeEngine = useCallback(() => {
        if (!canvasRef.current) {
            return undefined;
        }

        const engine = Engine.create();
        engine.timing.timeScale = 2.2;
        engineRef.current = engine;

        return engine;
    }, []);

    const startRunner = useCallback(() => {
        const canvas = canvasRef.current;
        const { width, height } = PlinkoCanvasConfig;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `185%`;
        canvas.style.pointerEvents = "none";
        canvas.style.transform = `translateX(-23%)`;

        const runner = Runner.create();
        Runner.run(runner, engineRef.current);
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

    // Handle instant mode finish
    const handleInstantModeFinish = useCallback(
        (finish: PlinkoFinish) => {
            createPathPreview(finish);

            const finishKey = `finish_${Date.now()}_${Math.random()}`; // NOSONAR
            const timeout = setTimeout(() => {
                setFinishedBall(finish);
                playPlinkoBallHitWinSoundRef.current?.();

                const finalPosition = calculateFinalBallPosition(finish);
                createExplosionEffectAtPosition(finalPosition.x, finalPosition.y);

                // Create money fly animation at final slot position
                const winningAmount = finish.winAmount || 0;
                if (winningAmount > 0) {
                    createMoneyFlyAnimation(finalPosition.x, finalPosition.y, winningAmount);
                }

                explosionTimeoutsRef.current.delete(finishKey);
            }, PATH_ANIMATION_DURATION);

            explosionTimeoutsRef.current.set(finishKey, timeout);
        },
        [createPathPreview, setFinishedBall, calculateFinalBallPosition, createExplosionEffectAtPosition, createMoneyFlyAnimation]
    );

    // Add ball
    useEffect(() => {
        if (finish) {
            if (document.hidden) {
                setFinishedBall(finish);
            } else if (!engineRef.current) {
                // Engine not ready, skip
            } else if (isInstantMode) {
                handleInstantModeFinish(finish);
            } else {
                const ballBody = createBall(finish);
                Composite.add(engineRef.current.world, ballBody);
            }
        }
    }, [finish, createBall, setFinishedBall, handleInstantModeFinish]);

    useEffect(() => {
        if (!isDroppingBall) {
            useGameStore.getState().resetBettingInfo();
        }
    }, [isDroppingBall]);

    // Cleanup timeouts when component unmounts
    useEffect(() => {
        return () => {
            explosionTimeoutsRef.current.forEach((timeout) => {
                clearTimeout(timeout);
            });
            explosionTimeoutsRef.current.clear();
        };
    }, []);

    return <canvas ref={canvasRef} />;
};

export default PlinkoCanvas;
