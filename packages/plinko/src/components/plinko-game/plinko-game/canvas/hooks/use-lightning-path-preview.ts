import { useCallback } from "react";
import { PegBody, PathPreview } from "../type";
import { calculateProgress, getVisiblePoints, interpolatePoint } from "../utils";
import { useLightningPathMultiplier } from "./use-lightning-path-multiplier";
import { LIGHTNING_PATH_COLOR } from "../constant";

const MIN_VISIBLE_POINTS = 2;

interface DrawSegmentOptions {
    ctx: CanvasRenderingContext2D;
    points: { x: number; y: number }[];
    start: number;
    end: number;
    color: string;
    progress: number;
    total: number;
    visible: number;
}

export const useLightningPathPreview = ({
    pathPreviewsRef,
    pegsRef,
}: {
    pathPreviewsRef: React.RefObject<PathPreview[]>;
    pegsRef: React.RefObject<PegBody[]>;
}) => {
    const { getFirstMultiplierPegIndex, processMultiplierAnimations, drawMultiplierAnimations } = useLightningPathMultiplier({
        pegsRef,
    });

    // Drawing Logic
    const setupContext = (ctx: CanvasRenderingContext2D) => {
        ctx.shadowBlur = 0;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
    };

    const drawSegment = useCallback(
        ({ ctx, points, start, end, color, progress, total, visible }: DrawSegmentOptions) => {
            ctx.strokeStyle = color;
            ctx.beginPath();

            const actualEnd = Math.min(end, visible - 1);

            for (let i = start; i <= actualEnd; i++) {
                const pt = points[i];
                if (i === start) {
                    ctx.moveTo(pt.x, pt.y);
                } else {
                    ctx.lineTo(pt.x, pt.y);
                }
            }

            if (progress < 1 && actualEnd === visible - 1 && visible < total) {
                const last = points[visible - 1];
                const next = points[visible];
                const subProg = (progress * total) % 1;
                if (next) {
                    const interp = interpolatePoint(last, next, subProg);
                    ctx.lineTo(interp.x, interp.y);
                }
            }
            ctx.stroke();
        },
        [interpolatePoint]
    );

    const drawPath = useCallback(
        (ctx: CanvasRenderingContext2D, path: PathPreview, now: number) => {
            const progress = calculateProgress(path.createdAt, path.animationDuration, now);
            const total = path.points.length;
            const visible = getVisiblePoints(total, progress, MIN_VISIBLE_POINTS);

            if (visible < MIN_VISIBLE_POINTS) {
                return;
            }

            processMultiplierAnimations(path, visible);

            const idx = getFirstMultiplierPegIndex(path);
            setupContext(ctx);

            // Case: no multiplier or not yet reached
            if (idx === -1 || idx >= visible) {
                drawSegment({
                    ctx,
                    points: path.points,
                    start: 0,
                    end: visible - 1,
                    color: LIGHTNING_PATH_COLOR.DEFAULT,
                    progress,
                    total,
                    visible,
                });
                return;
            }

            // Default part
            drawSegment({
                ctx,
                points: path.points,
                start: 0,
                end: idx,
                color: LIGHTNING_PATH_COLOR.DEFAULT,
                progress,
                total,
                visible,
            });

            // Multiplier part
            drawSegment({
                ctx,
                points: path.points,
                start: idx,
                end: total - 1,
                color: LIGHTNING_PATH_COLOR.PEG_MULTIPLIER,
                progress,
                total,
                visible,
            });
        },
        [processMultiplierAnimations, getFirstMultiplierPegIndex, drawSegment]
    );

    // Main Renderer

    const drawLightningPathPreview = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            const paths = pathPreviewsRef.current;
            if (!paths) {
                return;
            }
            const now = Date.now();

            const active = paths.filter((p) => now - p.createdAt < p.duration);
            paths.length = 0;
            paths.push(...active);

            active.forEach((p) => {
                ctx.save();
                drawPath(ctx, p, now);
                ctx.restore();
            });

            drawMultiplierAnimations(ctx);
        },
        [pathPreviewsRef, drawPath, drawMultiplierAnimations]
    );

    return { drawLightningPathPreview };
};
