"use client";

import { Engine, Runner, Composite, Events, IEventCollision, Body } from "matter-js";
import { useEffect, useRef, useCallback } from "react";
import { BallBody, PegEffect, SlotBody } from "./type";
import { useSlot, usePeg, useBall, usePegEffect, useSlotValidationLogger } from "./hooks";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "./constant";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store";

const PlinkoCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Engine | null>(null);
    const sceneObjectsRef = useRef<Body[]>([]);
    const animationRef = useRef<number | null>(null);
    const pegEffectsRef = useRef<PegEffect[]>([]);
    const pegIdRef = useRef<number>(0);
    const { finish, setFinishedBall } = usePlinkoGameStore(
        useShallow((state) => ({ finish: state.finish, setFinishedBall: state.actions.setFinishedBall }))
    );

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

    // Slot validation logger hook
    const { logValidation, downloadLogs, clearLogs, getLogs } = useSlotValidationLogger();

    // Collision handler
    const handleCollision = useCallback(
        (event: IEventCollision<Engine>) => {
            const pairs = event.pairs;
            if (!engineRef.current) {
                return;
            }
            for (const pair of pairs) {
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
                    const slotBody = object as SlotBody;
                    const ballBody = ball as BallBody;               
                    
                    setFinishedBall(ballBody.finish);
                    
                    // Log validation data
                    logValidation({
                        slotIndex: slotBody.slotIndex,
                        settlementResultSlotIndex: ballBody.finish?.settlementResult.slotIndex,
                        ballId: ballBody.id?.toString(),
                        gameRoundId: ballBody.finish?.roundId,
                    });

                    // remove ball
                    Composite.remove(engineRef.current.world, [ball]);
                    sceneObjectsRef.current.splice(sceneObjectsRef.current.indexOf(ball), 1);
                }
            }
        },
        [createPegEffect, handleRoad, setFinishedBall, logValidation]
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
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        // draw effects first (behind objects)
        drawPegEffect?.(context);

        // Draw all scene objects
        sceneObjectsRef.current.forEach((obj) => {
            drawSceneObject(obj);
        });
        animationRef.current = requestAnimationFrame(animate);
    }, [drawSceneObject, drawPegEffect]);

    // Initialize Matter.js engine
    const initializeEngine = useCallback(() => {
        if (!canvasRef.current) {
            return undefined;
        }

        const engine = Engine.create();
        engineRef.current = engine;
        engineRef.current.timing.timeScale = 1.5;

        return engine;
    }, []);

    const startRunner = useCallback(() => {
        const canvas = canvasRef.current;
        const { width, height } = PlinkoCanvasConfig;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.pointerEvents = "none";

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

    // Add ball
    useEffect(() => {
        if (finish) {
            const ballBody = createBall(finish);
            addObjects([ballBody]);
            useGameStore.getState().resetBettingInfo();
        }
    }, [finish, createBall, addObjects]);

    // Expose logger functions to window for debugging
    useEffect(() => {
        (window as any).plinkoSlotValidation = {
            downloadLogs,
            clearLogs,
            getLogs,
        };
        
        return () => {
            delete (window as any).plinkoSlotValidation;
        };
    }, [downloadLogs, clearLogs, getLogs]);

    return <canvas ref={canvasRef} />;
};

export default PlinkoCanvas;
