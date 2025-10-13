import { useCallback } from "react";
import { Bodies, Body } from "matter-js";
import { BallBody, PegBody } from "../type";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "../constant";
import { PlinkoFinish } from "@plinko/shared/types/types";

export const useBall = () => {
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

        const ball = Bodies.circle(x, 0, ballConfig.radius, options) as BallBody;
        ball.label = PLINKO_OBJECTS.BALL;
        ball.finish = finish;
        ball.collidedRowIndexes = [];
        return ball;
    }, []);

    const drawBall = useCallback((body: BallBody, context: CanvasRenderingContext2D) => {
        if (body.label !== PLINKO_OBJECTS.BALL) {
            return;
        }
        const { ballConfig } = PlinkoCanvasConfig;
        context.fillStyle = "#d0a025";
        context.beginPath();
        context.arc(0, 0, ballConfig.radius, 0, Math.PI * 2);
        context.fill();
    }, []);

    const handleRoad = useCallback((body: BallBody, peg: PegBody) => {
        Body.setStatic(body, true);
        const { pegRadius, ballConfig } = PlinkoCanvasConfig;
        if (!body.collidedRowIndexes?.includes(peg.rowIndex)) {
            const road = body.finish?.result[peg.rowIndex];
            Body.setPosition(body, {
                x: peg.position.x,
                y: peg.position.y - (peg.circleRadius || pegRadius) * 2,
            });
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
