"use client";

import { Engine, Runner, Composite, Events, IEventCollision, Body } from "matter-js";
import { useEffect, useRef, useCallback } from "react";
import { BallBody, ExplosionEffect, PegEffect } from "./type";
import { useSlot, usePeg, useBall, usePegEffect, useExplosionEffect } from "./hooks";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "./constant";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { useShallow } from "zustand/shallow";
import { useGameStore } from "@shared/stores/game-store";
import { usePlinkoBallHitWinSound } from "@plinko/shared/hooks/use-sound";

const PlinkoCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Engine | null>(null);
    const sceneObjectsRef = useRef<Body[]>([]);
    const ballsRef = useRef<Body[]>([]);
    const animationRef = useRef<number | null>(null);
    const pegEffectsRef = useRef<PegEffect[]>([]);
    const explosionEffectsRef = useRef<ExplosionEffect[]>([]);

    const { finish, setFinishedBall, numberOfDroppingBall } = usePlinkoGameStore(
        useShallow((state) => ({
            finish: state.finish,
            setFinishedBall: state.actions.setFinishedBall,
            numberOfDroppingBall: state.numberOfDroppingBall,
        }))
    );

    // Peg hook
    const { createPegs, drawPeg } = usePeg();

    // Multiplier hook
    const { createSlot } = useSlot();

    // Ball hook
    const { createBall, drawBalls, handleRoad } = useBall({ ballsRef });

    // Peg effect hook
    const { createPegEffect, drawPegEffect } = usePegEffect({ pegEffectsRef });

    // Explosion effect hook
    const { createExplosionEffect, drawExplosionEffect } = useExplosionEffect({ explosionEffectsRef });

    // Sound hook
    const playPlinkoBallHitWinSound = usePlinkoBallHitWinSound();
    const playPlinkoBallHitWinSoundRef = useRef(playPlinkoBallHitWinSound);
    playPlinkoBallHitWinSoundRef.current = playPlinkoBallHitWinSound;

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
                    const ballBody = ball as BallBody;

                    setFinishedBall(ballBody.finish);
                    playPlinkoBallHitWinSoundRef.current();

                    createExplosionEffect(ball);

                    // remove ball
                    Composite.remove(engineRef.current.world, [ball]);
                    ballsRef.current.splice(ballsRef.current.indexOf(ball), 1);
                }
            }
        },
        [createPegEffect, handleRoad, setFinishedBall, createExplosionEffect]
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
            drawPeg(body, context);
            context.restore();
        },
        [drawPeg]
    );

    // Clear all objects
    const clear = useCallback(() => {
        if (engineRef.current) {
            Composite.clear(engineRef.current.world, true);
        }
        sceneObjectsRef.current = [];
        ballsRef.current = [];
        pegEffectsRef.current = [];
        explosionEffectsRef.current = [];
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
        const slot = createSlot();
        addObjects([...pegs, slot]);
    }, [clear, createPegs, createSlot, addObjects]);

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
        sceneObjectsRef.current.forEach((obj) => {
            drawSceneObject(obj);
        });

        // draw effects first (behind objects)
        drawPegEffect?.(context);

        // draw balls
        drawBalls?.(context);

        // Draw explosion effects
        drawExplosionEffect?.(context);

        animationRef.current = requestAnimationFrame(animate);
    }, [drawSceneObject, drawBalls, drawPegEffect, drawExplosionEffect]);

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
        canvas.style.width = `170%`;
        canvas.style.pointerEvents = "none";
        canvas.style.transform = `translateX(-20.5%)`;

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
            if (document.hidden) {
                setFinishedBall(finish);
                return;
            }
            if (!engineRef.current) {
                return;
            }
            const ballBody = createBall(finish);
            Composite.add(engineRef.current.world, ballBody);
            ballsRef.current.push(ballBody);
        }
    }, [finish, createBall, addObjects, setFinishedBall]);

    useEffect(() => {
        if (numberOfDroppingBall === 0) {
            useGameStore.getState().resetBettingInfo();
        }
    }, [numberOfDroppingBall]);

    return <canvas ref={canvasRef} />;
};

export default PlinkoCanvas;
