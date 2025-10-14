import { useCallback, useRef, useEffect } from "react";
import { Bodies, Body } from "matter-js";
import { BallBody, PegBody } from "../type";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "../constant";
import { PlinkoFinish } from "@plinko/shared/types/types";
import { buildVersion } from "@shared/constants";
import { logger } from "@plinko/services/logger";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const useBall = () => {
    const ballImageRef = useRef<HTMLImageElement | null>(null);
    const imageLoadedRef = useRef(false);

    useEffect(() => {
        const image = new Image();
        const imageUrl = `${basePath}/static/images/plinko/ball.png?v=${buildVersion}`;

        logger.logUIEvent('ball-image-loading', {
            imageUrl,
            buildVersion,
            basePath,
            deviceInfo: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            }
        });

        image.onload = () => {
            imageLoadedRef.current = true;
            logger.logUIEvent('ball-image-loaded', {
                success: true,
                imageDimensions: {
                    width: image.width,
                    height: image.height,
                }
            });
        };
        image.onerror = () => {
            imageLoadedRef.current = false;
            logger.logUIEvent('ball-image-load-failed', {
                imageUrl,
                error: 'Image failed to load',
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                }
            });
        };
        image.src = imageUrl;
        ballImageRef.current = image;
    }, []);

    const createBall = useCallback((finish: PlinkoFinish) => {
        const { width, ballConfig } = PlinkoCanvasConfig;
        const x = width / 2;
        const options = {
            restitution: 0,
            friction: 0,
            frictionAir: 0.01,
            collisionFilter: {
                group: -1,
            },
        };

        logger.logPhysicsEvent('ball-physics-creation', {
            finishData: finish,
            position: { x, y: 0 },
            config: ballConfig,
            physicsOptions: options,
            deviceInfo: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            }
        });

        const ball = Bodies.circle(x, 0, ballConfig.radius, options) as BallBody;
        ball.label = PLINKO_OBJECTS.BALL;
        ball.finish = finish;
        ball.collidedRowIndexes = [];

        logger.logPhysicsEvent('ball-created', {
            ballId: ball.id,
            position: {
                x: ball.position.x,
                y: ball.position.y,
            },
            radius: ballConfig.radius,
            finishRoundId: finish?.roundId,
        });

        return ball;
    }, []);

    const drawBall = useCallback((body: BallBody, context: CanvasRenderingContext2D) => {
        if (body.label !== PLINKO_OBJECTS.BALL) {
            return;
        }
        const { ballConfig } = PlinkoCanvasConfig;

        // Draw the image if it's loaded
        if (imageLoadedRef.current && ballImageRef.current) {
            context.drawImage(ballImageRef.current, -ballConfig.radius, -ballConfig.radius, ballConfig.radius * 2, ballConfig.radius * 2);

            // Log ball rendering periodically for performance monitoring
            if (Math.random() < 0.001) { // ~1/1000 chance to avoid spam
                logger.logUIEvent('ball-rendered', {
                    ballId: body.id,
                    position: {
                        x: body.position.x,
                        y: body.position.y,
                    },
                    imageLoaded: imageLoadedRef.current,
                    radius: ballConfig.radius,
                    deviceInfo: {
                        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    }
                });
            }
        } else if (Math.random() < 0.0001) { // Very rare logging for debugging image loading issues
            logger.logUIEvent('ball-render-skipped', {
                ballId: body.id,
                imageLoaded: imageLoadedRef.current,
                reason: 'Ball image not loaded',
                position: {
                    x: body.position.x,
                    y: body.position.y,
                }
            });
        }
    }, []);

    const handleRoad = useCallback((body: BallBody, peg: PegBody) => {
        Body.setStatic(body, true);
        const { pegRadius, ballConfig } = PlinkoCanvasConfig;

        if (!body.collidedRowIndexes?.includes(peg.rowIndex)) {
            const road = body.finish?.result[peg.rowIndex];
            const newPosition = {
                x: peg.position.x,
                y: peg.position.y - (peg.circleRadius || pegRadius) * 2,
            };

            logger.logPhysicsEvent('ball-road-direction', {
                ballId: body.id,
                pegId: peg.id,
                rowIndex: peg.rowIndex,
                roadDirection: road,
                currentPosition: {
                    x: body.position.x,
                    y: body.position.y,
                },
                newPosition,
                velocity: {
                    x: road === 0 ? -ballConfig.offsetVelocityX : ballConfig.offsetVelocityX,
                    y: ballConfig.offsetVelocityY,
                },
                deviceInfo: {
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                }
            });

            Body.setPosition(body, newPosition);
            setTimeout(() => {
                Body.setVelocity(body, {
                    x: road === 0 ? -ballConfig.offsetVelocityX : ballConfig.offsetVelocityX,
                    y: ballConfig.offsetVelocityY,
                });
            }, 0);
            body.collidedRowIndexes?.push(peg.rowIndex);
        }
        Body.setStatic(body, false);
    }, []);

    return {
        drawBall,
        createBall,
        handleRoad,
    };
};
