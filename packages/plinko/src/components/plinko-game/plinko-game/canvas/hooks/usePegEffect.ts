import { useCallback } from "react";
import { PegBody, PegEffect } from "../type";
import { PlinkoCanvasConfig } from "../constant";

interface UsePegEffectProps {
    pegEffectsRef: React.RefObject<PegEffect[]>;
    pegIdRef: React.RefObject<number>;
}

export const usePegEffect = ({ pegEffectsRef, pegIdRef }: UsePegEffectProps) => {
    const createPegEffect = useCallback(
        (body: PegBody) => {
            const { pegRadius } = PlinkoCanvasConfig;
            const pegEffect: PegEffect = {
                x: body.position.x,
                y: body.position.y + pegRadius * 0.3,
                radius: pegRadius * 0.7,
                color: "#ffffff",
                borderColor: "#FFFFFFCC",
                borderRadius: pegRadius + 2.7,
                speed: 0,
                elapsed: 0,
                maxSpeed: 1000,
            };

            pegEffectsRef.current.push(pegEffect);
        },
        [pegEffectsRef, pegIdRef]
    );

    const drawPegEffect = useCallback(
        (context: CanvasRenderingContext2D) => {
            const effects = pegEffectsRef.current;
            const effectsToRemove: number[] = [];

            for (let i = 0; i < effects.length; i++) {
                const effect = effects[i];
                effect.elapsed += 46;

                const progress = effect.elapsed / effect.maxSpeed;

                if (progress >= 1) {
                    effectsToRemove.push(i);
                    continue;
                }

                const pulseRadius = effect.radius + progress * 20;

                const alpha = 0.5 * (1 - progress);

                context.beginPath();
                context.arc(effect.x, effect.y, pulseRadius, 0, Math.PI * 2);
                context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                context.fill();
            }

            for (let i = effectsToRemove.length - 1; i >= 0; i--) {
                effects.splice(effectsToRemove[i], 1);
            }
        },
        [pegEffectsRef]
    );

    return {
        createPegEffect,
        drawPegEffect,
    };
};
