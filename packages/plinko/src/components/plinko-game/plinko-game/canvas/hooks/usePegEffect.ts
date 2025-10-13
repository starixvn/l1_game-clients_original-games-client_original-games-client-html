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
                y: body.position.y,
                radius: pegRadius,
                color: "#ffffff",
                borderColor: "#FFFFFFCC",
                borderRadius: pegRadius + 2.7,
                speed: 0,
                maxSpeed: 100,
            };

            pegEffectsRef.current.push(pegEffect);
        },
        [pegEffectsRef, pegIdRef]
    );

    const drawPegEffect = useCallback(
        (context: CanvasRenderingContext2D) => {
            for (let i = pegEffectsRef.current.length - 1; i >= 0; i--) {
                const effect = pegEffectsRef.current[i];
                effect.speed += 2;

                if (effect.speed < effect.maxSpeed) {
                    const currentOpacity = 1 - effect.speed / effect.maxSpeed;
                    context.globalAlpha = currentOpacity;
                    context.fillStyle = effect.borderColor;
                    context.beginPath();
                    context.arc(effect.x, effect.y, effect.borderRadius, 0, Math.PI * 2);
                    context.fill();
                    context.fillStyle = effect.color;
                    context.beginPath();
                    context.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                    context.fill();
                    context.globalAlpha = 1;
                } else {
                    pegEffectsRef.current.splice(i, 1);
                }
            }
        },
        [pegEffectsRef]
    );

    return {
        createPegEffect,
        drawPegEffect,
    };
};
