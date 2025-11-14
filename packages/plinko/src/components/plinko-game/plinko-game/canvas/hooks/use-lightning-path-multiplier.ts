import { useCallback } from "react";
import { PegBody, MultiplierAnimationEffect, PathPreview } from "../type";

const MULTIPLIER_ANIM_DURATION = 400;
const MULTIPLIER_START_OFFSET = -10;
const MULTIPLIER_END_OFFSET = -50;

export const useLightningPathMultiplier = ({
    pegsRef,
    multiplierAnimationsRef
}: {
    pegsRef: React.RefObject<PegBody[]>;
    multiplierAnimationsRef: React.RefObject<MultiplierAnimationEffect[]>;
}) => {

    const findPeg = useCallback(
        (x: number, y: number) =>
            pegsRef.current?.find((peg) => peg.position.x === x && peg.position.y === y),
        [pegsRef]
    );

    const getFirstMultiplierPegIndex = useCallback(
        (path: PathPreview) => {
            const pegs = pegsRef.current;
            if (!pegs) {
                return -1;
            }

            // Skip first & last point
            for (let i = 1; i < path.points.length - 1; i++) {
                const pt = path.points[i];
                const peg = findPeg(pt.x, pt.y);
                if (peg?.multiplier && peg.multiplier > 0) {
                    return i;
                }
            }
            return -1;
        },
        [pegsRef, findPeg]
    );

    // Calculate sum of multipliers in a range of points
    const sumMultipliersInRange = useCallback(
        (points: { x: number; y: number }[], startIndex: number, endIndex: number) => {
            let sum = 0;
            for (let i = startIndex; i <= endIndex && i < points.length; i++) {
                const pt = points[i];
                const peg = findPeg(pt.x, pt.y);
                if (peg?.multiplier && peg.multiplier > 0) {
                    sum += peg.multiplier;
                }
            }
            return sum;
        },
        [findPeg]
    );

    const getAccumulatedMultiplier = useCallback(
        (path: PathPreview, index: number) => {
            const pegs = pegsRef.current;
            if (!pegs) {
                return 0;
            }

            return sumMultipliersInRange(path.points, 1, Math.min(index, path.points.length - 2));
        },
        [pegsRef, sumMultipliersInRange]
    );

    // Multiplier Animations
    const hasAnimation = useCallback(
        (x: number, y: number) =>
            multiplierAnimationsRef.current?.some((anim) => anim.x === x && anim.y === y) ?? false,
        [multiplierAnimationsRef]
    );

    const addAnimation = useCallback(
        (x: number, y: number, multiplier: number) => {
            multiplierAnimationsRef.current?.push({
                x,
                y,
                multiplier,
                opacity: 1,
                startY: y + MULTIPLIER_START_OFFSET,
                endY: y + MULTIPLIER_END_OFFSET,
                createdAt: Date.now(),
                duration: MULTIPLIER_ANIM_DURATION,
            });
        },
        [multiplierAnimationsRef]
    );

    const processMultiplierAnimations = useCallback(
        (path: PathPreview, visiblePoints: number) => {
            for (let i = 1; i < visiblePoints && i < path.points.length - 1; i++) {
                const pt = path.points[i];
                const peg = findPeg(pt.x, pt.y);
                if (!peg?.multiplier || peg.multiplier <= 0) {
                    continue;
                }

                if (!hasAnimation(pt.x, pt.y)) {
                    const accMul = getAccumulatedMultiplier(path, i);
                    addAnimation(pt.x, pt.y, accMul);
                }
            }
        },
        [findPeg, hasAnimation, getAccumulatedMultiplier, addAnimation]
    );

    const drawMultiplierAnimations = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            const anims = multiplierAnimationsRef.current;
            if (!anims) {
                return;
            }

            const now = Date.now();

            for (let i = anims.length - 1; i >= 0; i--) {
                const a = anims[i];
                const progress = Math.max(0, Math.min(1, (now - a.createdAt) / a.duration));

                if (progress >= 1) {
                    anims.splice(i, 1);
                    continue;
                }

                const y = a.startY + (a.endY - a.startY) * progress;
                const opacity = 1 - progress * 0.5;

                ctx.save();
                ctx.globalAlpha = opacity;

                ctx.font = "700 36px Inter, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.shadowColor = "#001A11";
                ctx.shadowBlur = 6;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 4;

                ctx.strokeStyle = "#008400";
                ctx.lineWidth = 8;
                ctx.strokeText(`${a.multiplier}x`, a.x, y);

                ctx.fillStyle = "#FFF";
                ctx.fillText(`${a.multiplier}x`, a.x, y);

                ctx.restore();
            }
        },
        [multiplierAnimationsRef]
    );

    return {
        getFirstMultiplierPegIndex,
        processMultiplierAnimations,
        drawMultiplierAnimations,
    };
};
