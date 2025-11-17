import { useCallback, useRef, useEffect } from "react";
import { Bodies, Body } from "matter-js";
import { BallBody, PegBody } from "../type";
import { BALL_BODY_OPTIONS, PLINKO_OBJECTS, PlinkoCanvasConfig } from "../constant";
import { PlinkoFinish } from "@plinko/shared/types/types";
import { usePlinkoBallHitPinSound } from "@plinko/shared/hooks/use-sound";
import { useLightningBall } from "./use-lightning-ball";
import { buildVersion } from "@shared";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const useBall = () => {
    const ballsRef = useRef<Body[]>([]);
    const ballImageRef = useRef<HTMLImageElement | null>(null);
    const imageLoadedRef = useRef(false);
    const playPlinkoBallHitPinSound = usePlinkoBallHitPinSound();
    const playPlinkoBallHitPinSoundRef = useRef(playPlinkoBallHitPinSound);
    playPlinkoBallHitPinSoundRef.current = playPlinkoBallHitPinSound;

    const { drawLightningBall, drawLightningBallMultiplier, updateBallLightningStatus } = useLightningBall();

    useEffect(() => {
        const image = new Image();
        image.onload = () => {
            imageLoadedRef.current = true;
        };
        image.onerror = () => {
            console.error("Failed to load ball image");
            imageLoadedRef.current = false;
        };
        image.src = `${basePath}/static/images/plinko/ball.webp?v=${buildVersion}`;
        ballImageRef.current = image;
    }, []);

    const createBall = useCallback((finish: PlinkoFinish) => {
        const { width, ballConfig } = PlinkoCanvasConfig;
        const x = width / 2;
        const ball = Bodies.circle(x, 0, ballConfig.radius, BALL_BODY_OPTIONS) as BallBody;
        ball.label = PLINKO_OBJECTS.BALL;
        ball.finish = finish;
        ball.collidedRowIndexes = [];
        ball.isLightning = false;
        ball.multiplier = 0;
        ballsRef.current.push(ball);
        return ball;
    }, []);

    const drawBalls = useCallback(
        (context: CanvasRenderingContext2D) => {
            if (!context) {
                return;
            }
            const { ballConfig } = PlinkoCanvasConfig;

            ballsRef.current.forEach((body: Body) => {
                const ballBody = body as BallBody;
                const x = body.position.x;
                const y = body.position.y;
                context.save();
                context.translate(x, y);

                const isLightning = ballBody.isLightning;

                if (isLightning) {
                    drawLightningBall(context, ballBody);
                    drawLightningBallMultiplier(context, ballBody);
                } else {
                    if (imageLoadedRef.current && ballImageRef.current) {
                        context.drawImage(
                            ballImageRef.current,
                            -ballConfig.radius,
                            -ballConfig.radius,
                            ballConfig.radius * 2,
                            ballConfig.radius * 2
                        );
                    } else {
                        context.fillStyle = "#FED701";
                        context.beginPath();
                        context.arc(0, 0, ballConfig.radius, 0, Math.PI * 2);
                        context.fill();
                    }
                }

                context.restore();
            });
        },
        [ballsRef, drawLightningBall, drawLightningBallMultiplier]
    );

    const handleRoad = useCallback(
        (body: BallBody, peg: PegBody) => {
            Body.setStatic(body, true);
            const { pegRadius, ballConfig } = PlinkoCanvasConfig;
            if (!body.collidedRowIndexes?.includes(peg.rowIndex)) {
                const road = body.finish?.result[peg.rowIndex];
                Body.setPosition(body, { x: peg.position.x, y: peg.position.y - pegRadius - ballConfig.radius });
                Body.setVelocity(body, {
                    x: road === 0 ? -ballConfig.offsetVelocityX : ballConfig.offsetVelocityX,
                    y: ballConfig.offsetVelocityY,
                });
                playPlinkoBallHitPinSoundRef.current();
                body.collidedRowIndexes?.push(peg.rowIndex);
                updateBallLightningStatus(body, peg);
            }
            Body.setStatic(body, false);
        },
        [updateBallLightningStatus]
    );

    const removeBall = useCallback((ball: BallBody) => {
        ballsRef.current.splice(ballsRef.current.indexOf(ball), 1);
    }, []);

    return {
        drawBalls,
        createBall,
        handleRoad,
        removeBall,
    };
};
