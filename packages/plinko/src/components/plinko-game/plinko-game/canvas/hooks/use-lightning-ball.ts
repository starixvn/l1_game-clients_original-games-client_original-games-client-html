import { useCallback, useRef, useEffect } from "react";
import { BallBody, PegBody } from "../type";
import { PlinkoCanvasConfig } from "../constant";
import { buildVersion } from "@shared";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const useLightningBall = () => {
    const lightningBallImageRef = useRef<HTMLImageElement | null>(null);
    const lightningImageLoadedRef = useRef(false);

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

    const drawLightningBall = useCallback((context: CanvasRenderingContext2D, ballBody: BallBody) => {
        const { ballConfig } = PlinkoCanvasConfig;

        if (!lightningImageLoadedRef.current || !lightningBallImageRef.current) {
            context.fillStyle = "#FED701";
            context.beginPath();
            context.arc(0, 0, ballConfig.radius, 0, Math.PI * 2);
            context.fill();
            return;
        }

        const scale = 1.2;
        const radius = ballConfig.radius * scale;
        context.drawImage(lightningBallImageRef.current, -radius, -radius, radius * 2, radius * 2);
    }, []);

    const drawLightningBallMultiplier = useCallback((context: CanvasRenderingContext2D, ballBody: BallBody) => {
        const { ballConfig } = PlinkoCanvasConfig;

        if (!ballBody.multiplier || ballBody.multiplier <= 0) {
            return;
        }

        context.font = "700 36px Inter, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";

        context.shadowColor = "#001A11";
        context.shadowBlur = 6;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 4;

        const textY = -ballConfig.radius - 24;

        context.strokeStyle = "#008400";
        context.lineWidth = 8;
        context.strokeText(`${ballBody.multiplier}x`, 0, textY);

        context.fillStyle = "#FFF";
        context.fillText(`${ballBody.multiplier}x`, 0, textY);

        context.shadowColor = "transparent";
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
    }, []);

    const updateBallLightningStatus = useCallback((body: BallBody, peg: PegBody) => {
        if (peg.multiplier && peg.multiplier > 0) {
            body.isLightning = true;
            body.multiplier = (body.multiplier || 0) + peg.multiplier;
        }
    }, []);

    return {
        drawLightningBall,
        drawLightningBallMultiplier,
        updateBallLightningStatus,
    };
};
