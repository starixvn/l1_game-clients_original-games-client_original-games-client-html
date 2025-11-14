import { useCallback, useRef } from "react";
import { Body } from "matter-js";
import { ExplosionEffect } from "../type";
import { PlinkoCanvasConfig } from "../constant";

export const useExplosionEffect = () => {
    const explosionEffectsRef = useRef<ExplosionEffect[]>([]);
    const random = useCallback((min: number, max: number): number => {
        return Math.random() * (max - min) + min; // NOSONAR
    }, []);

    const createExplosionEffect = useCallback((body: Body) => {
        createExplosionEffectAtPosition(body.position.x, body.position.y);
    }, []);

    const createExplosionEffectAtPosition = useCallback((x: number, y: number) => {
        // Fire colors for slot firing effect
        const fireColors = ["#ff6b35", "#ff8c42", "#ffa726", "#ffb74d"]; // orange fire
        const color = fireColors[Math.floor(random(0, fireColors.length))];

        // Calculate slot width based on the same formula used in useSlot.ts
        const { pegRadius, mapGap } = PlinkoCanvasConfig;
        const gap = pegRadius * 2 * mapGap;
        const slotWidth = gap - 6;

        // Phase 1: Initial impact boom effect
        const impactEffect: ExplosionEffect = {
            x,
            y,
            radius: 0,
            maxRadius: 30, // Small impact radius
            color: color,
            opacity: 1.0,
            speed: 15, // Very fast initial expansion
            columnWidth: slotWidth,
            gradient: true,
            initialOpacity: 1.0,
            fadeSpeed: 0.08, // Fast fade for impact
            phase: "impact", // Track animation phase
        };

        // Phase 2: Explosion particles shooting upward
        for (let i = 0; i < 8; i++) {
            // Slight randomness
            const angle = (Math.PI * 2 * i) / 8 + random(-0.5, 0.5) * 0.3;
            const velocity = random(8, 12);
            const vx = Math.cos(angle) * velocity * 0.3; // Less horizontal movement
            const vy = -Math.abs(Math.sin(angle)) * velocity; // Always upward

            const explosionParticle: ExplosionEffect = {
                x,
                y,
                radius: random(2, 5),
                maxRadius: random(42, 45),
                color: color,
                opacity: random(0.9, 1.0),
                speed: random(0.5, 0.8),
                vx: vx,
                vy: vy,
                columnWidth: random(2, 4),
                gradient: false, // No gradient for particles
                initialOpacity: random(0.9, 1.0),
                fadeSpeed: random(0.03, 0.05),
                phase: "explosion", // Track animation phase
            };

            explosionEffectsRef.current.push(explosionParticle);
        }

        explosionEffectsRef.current.push(impactEffect);
    }, []);

    const drawExplosionEffect = useCallback((context: CanvasRenderingContext2D) => {
        for (let i = explosionEffectsRef.current.length - 1; i >= 0; i--) {
            const effect = explosionEffectsRef.current[i];

            // Handle different animation phases
            if (effect.phase === "impact") {
                // Impact boom effect - expanding circle
                effect.radius += effect.speed;

                if (effect.radius < effect.maxRadius) {
                    // Decrease opacity over time
                    effect.opacity = Math.max(0, effect.opacity - (effect.fadeSpeed || 0.08));

                    const currentOpacity = effect.opacity;

                    // Draw impact circle
                    context.globalAlpha = currentOpacity;
                    context.fillStyle = effect.color;
                    context.beginPath();
                    context.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                    context.fill();

                    // Add glow effect
                    context.globalAlpha = currentOpacity * 0.3;
                    context.beginPath();
                    context.arc(effect.x, effect.y, effect.radius * 1.5, 0, Math.PI * 2);
                    context.fill();

                    context.globalAlpha = 1;
                } else {
                    explosionEffectsRef.current.splice(i, 1);
                }
            } else if (effect.phase === "explosion") {
                // Explosion particles - move and fade
                effect.x += effect.vx || 0;
                effect.y += effect.vy || 0;
                effect.radius += effect.speed;

                // Decrease opacity over time
                effect.opacity = Math.max(0, effect.opacity - (effect.fadeSpeed || 0.03));

                if (effect.radius < effect.maxRadius && effect.opacity > 0) {
                    const currentOpacity = effect.opacity;
                    const columnWidth = effect.columnWidth || 2;

                    // Draw explosion particle
                    context.globalAlpha = currentOpacity;
                    context.fillStyle = effect.color;
                    context.fillRect(effect.x - columnWidth / 2, effect.y - columnWidth / 2, columnWidth, columnWidth);

                    // Add small glow
                    context.globalAlpha = currentOpacity * 0.4;
                    context.fillRect(effect.x - columnWidth, effect.y - columnWidth, columnWidth * 2, columnWidth * 2);

                    context.globalAlpha = 1;
                } else {
                    explosionEffectsRef.current.splice(i, 1);
                }
            }
        }
    }, []);

    return {
        createExplosionEffect,
        createExplosionEffectAtPosition,
        drawExplosionEffect,
    };
};
