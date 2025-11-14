import { useCallback } from "react";
import { MoneyFlyAnimationEffect } from "../type";

const MONEY_FLY_ANIM_DURATION = 600;
const MONEY_START_OFFSET = -10;
const MONEY_END_OFFSET = -80;

export const useMoneyFlyAnimation = ({
    moneyFlyAnimationsRef
}: {
    moneyFlyAnimationsRef: React.RefObject<MoneyFlyAnimationEffect[]>;
}) => {
    const createMoneyFlyAnimation = useCallback(
        (x: number, y: number, amount: number) => {
            const anims = moneyFlyAnimationsRef.current;
            if (!anims) {
                return;
            }

            anims.push({
                x,
                y,
                amount,
                startY: y + MONEY_START_OFFSET,
                endY: y + MONEY_END_OFFSET,
                createdAt: Date.now(),
                duration: MONEY_FLY_ANIM_DURATION,
            });
        },
        [moneyFlyAnimationsRef]
    );

    const drawMoneyFlyAnimations = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            const anims = moneyFlyAnimationsRef.current;
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

                ctx.shadowColor = "#000";
                ctx.shadowBlur = 6;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 4;

                ctx.fillStyle = "#fff600";
                ctx.fillText(`+${a.amount}`, a.x, y);

                ctx.restore();
            }
        },
        [moneyFlyAnimationsRef]
    );

    return {
        createMoneyFlyAnimation,
        drawMoneyFlyAnimations,
    };
};
