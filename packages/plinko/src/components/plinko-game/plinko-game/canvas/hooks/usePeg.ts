import { useCallback, useRef } from "react";
import { Bodies } from "matter-js";
import { PegBody } from "../type";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "../constant";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { usePlinkoLightningModeGameStore } from "@plinko/shared/stores";
import { useShallow } from "zustand/shallow";

interface FlyingMultiplier {
    id: string;
    x: number;
    y: number;
    multiplier: number;
    startY: number;
    progress: number; // 0 to 1
    startTime: number;
}

const generateSecureId = (): string => {
    const array = new Uint32Array(2);
    crypto.getRandomValues(array);
    return `multiplier-${Date.now()}-${array[0].toString(16)}${array[1].toString(16)}`;
};

export const usePeg = () => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);

    const { isLightningMode, lightningConfig } = usePlinkoLightningModeGameStore(
        useShallow((state) => ({
            isLightningMode: state.isLightningMode,
            lightningConfig: state.lightningConfig,
        }))
    );

    const flyingMultipliersRef = useRef<FlyingMultiplier[]>([]);

    const triggerMultiplierAnimation = useCallback((x: number, y: number, multiplier: number) => {
        const newAnimation: FlyingMultiplier = {
            id: generateSecureId(),
            x,
            y,
            multiplier,
            startY: y,
            progress: 0,
            startTime: Date.now(),
        };
        flyingMultipliersRef.current.push(newAnimation);
    }, []);

    const updateFlyingMultipliers = useCallback(() => {
        const currentTime = Date.now();
        const animationDuration = 1000; // 1 second animation

        flyingMultipliersRef.current = flyingMultipliersRef.current
            .map(animation => {
                const elapsed = currentTime - animation.startTime;
                animation.progress = Math.min(elapsed / animationDuration, 1);

                // Update Y position with easing (ease-out)
                const easeOutProgress = 1 - Math.pow(1 - animation.progress, 3);
                animation.y = animation.startY - (easeOutProgress * 80); // Fly up 80 pixels

                return animation;
            })
            .filter(animation => animation.progress < 1); // Remove completed animations
    }, []);

    const createPegs = useCallback(() => {
        const initialColumns = 3;
        const { width, pegRadius, mapGap } = PlinkoCanvasConfig;
        const pegs: PegBody[] = [];

        const pegMultipliers = isLightningMode && lightningConfig?.lightningBoard?.pegMultipliers;

        for (let row = 1; row <= numberOfRows; row++) {
            const columnsInRow = initialColumns + (row - 1);
            for (let col = 1; col <= columnsInRow; col++) {
                const gap = pegRadius * 2 * mapGap;
                const space = (width - gap * columnsInRow) / 2;
                const x = space + col * gap - pegRadius * mapGap;
                const y = row * gap;
                const options = {
                    isStatic: true,
                };

                const body = Bodies.circle(x, y, pegRadius, options) as PegBody;
                body.label = PLINKO_OBJECTS.PEG;
                body.circleRadius = pegRadius;
                body.rowIndex = row - 1;

                if (pegMultipliers) {
                    const lightningPeg = pegMultipliers.find(
                        (peg) => peg.row === row - 1 && peg.column === col - 2
                    );
                    if (lightningPeg) {
                        body.lightningMultiplier = lightningPeg.multiplier;
                    }
                }

                pegs.push(body);
            }
        }
        return pegs;
    }, [numberOfRows, isLightningMode, lightningConfig]);

    const drawPeg = useCallback((body: PegBody, context: CanvasRenderingContext2D) => {
        if (body.label !== PLINKO_OBJECTS.PEG) {
            return;
        }
        const { pegRadius } = PlinkoCanvasConfig;
        const isLightningPeg = body.lightningMultiplier && body.lightningMultiplier > 1;

        // Layer 1: Bottom layer
        context.fillStyle = "#000";
        context.beginPath();
        context.arc(0, 2.5, pegRadius + 2.5, 0, Math.PI * 2);
        context.fill();

        // Layer 2 - Use different color for lightning pegs
        context.fillStyle = isLightningPeg ? "#FFD700" : "#6542FF";
        context.beginPath();
        context.arc(0, 2.5, pegRadius, 0, Math.PI * 2);
        context.fill();

        // Layer 3
        context.fillStyle = "#FFFFFF";
        context.beginPath();
        context.arc(0, 0, pegRadius, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = isLightningPeg ? "#FFA500" : "#BDD9E4";
        context.beginPath();
        context.arc(0, 1, pegRadius * 0.9, 0, Math.PI * 2);
        context.fill();

        if (isLightningPeg) {
            const badgeY = -pegRadius - 12; 

            // Draw multiplier text
            context.fillStyle = "#FFF600";
            context.font = "bold 30px Inter, sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";

            context.fillText(`${body.lightningMultiplier}x`, 0, badgeY);
        }
    }, []);

    const drawFlyingMultipliers = useCallback((context: CanvasRenderingContext2D) => {
        flyingMultipliersRef.current.forEach(animation => {
            // Calculate opacity based on progress (fade out at the end)
            const opacity = animation.progress < 0.8 ? 1 : (1 - animation.progress) * 5;

            context.save();

            // Set position
            context.translate(animation.x, animation.y);

            // Set text style
            context.fillStyle = `rgba(255, 246, 0, ${opacity})`;
            context.strokeStyle = `rgba(255, 165, 0, ${opacity})`;
            context.lineWidth = 2;
            context.font = "bold 24px Inter, sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";

            // Add slight scale animation
            const scale = 1 + (animation.progress * 0.3);
            context.scale(scale, scale);

            // Draw text with glow effect
            const text = `${animation.multiplier}x`;

            // Outer glow
            context.shadowColor = '#FFD700';
            context.shadowBlur = 10;
            context.strokeText(text, 0, 0);
            context.shadowBlur = 0;

            // Inner text
            context.fillText(text, 0, 0);

            context.restore();
        });
    }, []);

    return {
        createPegs,
        drawPeg,
        drawFlyingMultipliers,
        triggerMultiplierAnimation,
        updateFlyingMultipliers,
    };
};
