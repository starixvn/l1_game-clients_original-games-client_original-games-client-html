import { useCallback, useRef, useEffect } from "react";
import { Bodies, Body } from "matter-js";
import { BallBody, PegBody } from "../type";
import { BALL_BODY_OPTIONS, PLINKO_OBJECTS, PlinkoCanvasConfig } from "../constant";
import { PlinkoFinish } from "@plinko/shared/types/types";
import { buildVersion } from "@shared/constants";
import { usePlinkoBallHitPinSound } from "@plinko/shared/hooks/use-sound";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const useBall = ({ ballsRef }: { ballsRef: React.RefObject<Body[]> }) => {
    const ballImageRef = useRef<HTMLImageElement | null>(null);
    const lightningBallImageRef = useRef<HTMLImageElement | null>(null);
    const imageLoadedRef = useRef(false);
    const lightningImageLoadedRef = useRef(false);
    const playPlinkoBallHitPinSound = usePlinkoBallHitPinSound();
    const playPlinkoBallHitPinSoundRef = useRef(playPlinkoBallHitPinSound);
    playPlinkoBallHitPinSoundRef.current = playPlinkoBallHitPinSound;

    useEffect(() => {
        const image = new Image();
        image.onload = () => {
            imageLoadedRef.current = true;
        };
        image.onerror = () => {
            console.error("Failed to load ball image");
            imageLoadedRef.current = false;
        };
        image.src = `${basePath}/static/images/plinko/ball.svg?v=${buildVersion}`;
        ballImageRef.current = image;
    }, []);

    useEffect(() => {
        const lightningImage = new Image();
        lightningImage.onload = () => {
            lightningImageLoadedRef.current = true;
        };
        lightningImage.onerror = () => {
            console.error("Failed to load lightning ball image");
            lightningImageLoadedRef.current = false;
        };
        lightningImage.src = `${basePath}/static/images/plinko/lightning-ball.svg?v=${buildVersion}`;
        lightningBallImageRef.current = lightningImage;
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
                const imageRef = isLightning ? lightningBallImageRef.current : ballImageRef.current;
                const imageLoaded = isLightning ? lightningImageLoadedRef.current : imageLoadedRef.current;

                const scale = isLightning ? 1.2 : 1;
                const radius = ballConfig.radius * scale;

                if (imageLoaded && imageRef) {
                    context.drawImage(imageRef, -radius, -radius, radius * 2, radius * 2);

                    if (isLightning && ballBody.multiplier && ballBody.multiplier > 0) {
                        context.font = "700 36px Inter, sans-serif";
                        context.textAlign = "center";
                        context.textBaseline = "middle";

                        context.shadowColor = "rgba(23, 255, 162, 0.80)";
                        context.shadowBlur = 6;
                        context.shadowOffsetX = 0;
                        context.shadowOffsetY = 1;

                        const textY = -ballConfig.radius - 8;

                        context.strokeStyle = "#007C51";
                        context.lineWidth = 6;
                        context.strokeText(`${ballBody.multiplier}x`, 0, textY);

                        context.fillStyle = "#FFF";
                        context.fillText(`${ballBody.multiplier}x`, 0, textY);

                        context.shadowColor = "transparent";
                        context.shadowBlur = 0;
                        context.shadowOffsetX = 0;
                        context.shadowOffsetY = 0;
                    }
                } else {
                    context.fillStyle = "#FED701";
                    context.beginPath();
                    context.arc(0, 0, ballConfig.radius, 0, Math.PI * 2);
                    context.fill();
                }
                context.restore();
            });
        },
        [ballsRef]
    );

    const handleRoad = useCallback((body: BallBody, peg: PegBody) => {
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

            if (peg.multiplier && peg.multiplier > 0) {
                console.log("peg.multiplier", peg.multiplier);
                body.isLightning = true;
                body.multiplier = (body.multiplier || 0) + peg.multiplier;
            }
        }
        Body.setStatic(body, false);
    }, []);

    return {
        drawBalls,
        createBall,
        handleRoad,
    };
};
