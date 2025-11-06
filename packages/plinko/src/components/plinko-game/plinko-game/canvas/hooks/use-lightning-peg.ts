import { useCallback, useRef, useEffect } from "react";
import { PegBody } from "../type";
import { PlinkoCanvasConfig } from "../constant";
import { buildVersion } from "@shared/constants";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const useLightningPeg = () => {
    const lightningPegImageRef = useRef<HTMLImageElement | null>(null);
    const glowAnimationTimeRef = useRef(0);

    useEffect(() => {
        const img = new Image();
        img.src = `${basePath}/static/images/plinko/lightning-peg.svg?v=${buildVersion}`;
        img.onload = () => {
            lightningPegImageRef.current = img;
        };
    }, []);

    useEffect(() => {
        const animationDuration = 2000;
        const interval = setInterval(() => {
            glowAnimationTimeRef.current = (glowAnimationTimeRef.current + 50) % animationDuration;
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const drawLightningPegGlow = useCallback((context: CanvasRenderingContext2D, pegBody: PegBody) => {
        const { pegRadius } = PlinkoCanvasConfig;
        const isLightningPeg = pegBody.multiplier && pegBody.multiplier > 1;

        if (!isLightningPeg) {
            return;
        }

        const glowProgress = (glowAnimationTimeRef.current / 2000) * Math.PI * 2;
        const glowOpacity = (Math.sin(glowProgress) + 1) / 2;

        const glowRadius = pegRadius * 4;
        context.save();
        context.globalAlpha = glowOpacity * 0.6;

        const pegCenterX = pegRadius / 2;
        const pegCenterY = pegRadius / 2;

        const gradient = context.createRadialGradient(pegCenterX, pegCenterY, 0, pegCenterX, pegCenterY, glowRadius);
        gradient.addColorStop(0, 'rgba(23, 255, 162, 1)');
        gradient.addColorStop(0.3, 'rgba(0, 124, 81, 0.8)');
        gradient.addColorStop(0.7, 'rgba(23, 255, 162, 0.4)');
        gradient.addColorStop(1, 'rgba(23, 255, 162, 0)');

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(pegCenterX, pegCenterY, glowRadius, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }, []);

    const drawLightningPegImage = useCallback((context: CanvasRenderingContext2D, pegBody: PegBody) => {
        const { pegRadius } = PlinkoCanvasConfig;
        const isLightningPeg = pegBody.multiplier && pegBody.multiplier > 1;

        if (!isLightningPeg || !lightningPegImageRef.current) {
            return;
        }

        const imageSize = pegRadius * 3;
        context.drawImage(
            lightningPegImageRef.current,
            -imageSize / 3,
            -imageSize / 3,
            imageSize,
            imageSize
        );
    }, []);

    const drawLightningPegMultiplier = useCallback((context: CanvasRenderingContext2D, pegBody: PegBody) => {
        const { pegRadius } = PlinkoCanvasConfig;
        const isLightningPeg = pegBody.multiplier && pegBody.multiplier > 1;

        if (!isLightningPeg) {
            return;
        }

        const badgeY = -pegRadius - 10;

        context.font = "700 28px Inter, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";

        context.shadowColor = '#001A11';
        context.shadowBlur = 4;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 4;

        context.strokeStyle = '#161616';
        context.lineWidth = 6;
        context.strokeText(`${pegBody.multiplier}x`, 30, badgeY);

        context.fillStyle = '#FFF';
        context.fillText(`${pegBody.multiplier}x`, 30, badgeY);

        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
    }, []);

    return {
        drawLightningPegGlow,
        drawLightningPegImage,
        drawLightningPegMultiplier,
    };
};
