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
            const pegEffect: PegEffect = {
                x: body.position.x,
                y: body.position.y + 2.5,
                radius: 2,
                maxRadius: 24,
                color: "#ffffff",
                opacity: 1.0,
                speed: 1.5,
            };

            pegEffectsRef.current.push(pegEffect);
        },
        [pegEffectsRef, pegIdRef]
    );

    const drawPegEffect = useCallback(
        (context: CanvasRenderingContext2D) => {
            for (let i = pegEffectsRef.current.length - 1; i >= 0; i--) {
                const effect = pegEffectsRef.current[i];
                effect.radius += effect.speed;

                if (effect.radius < effect.maxRadius) {
                    const currentOpacity = effect.opacity - (effect.radius / effect.maxRadius) * effect.opacity;
                    context.globalAlpha = currentOpacity;
                    context.strokeStyle = effect.color;
                    context.fillStyle = effect.color;
                    context.lineWidth = 4;
                    context.beginPath();
                    context.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                    context.fill();
                    context.stroke();
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
