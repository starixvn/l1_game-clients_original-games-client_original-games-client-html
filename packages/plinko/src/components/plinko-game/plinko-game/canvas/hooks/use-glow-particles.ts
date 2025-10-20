import { useRef, useCallback, useMemo } from "react";
import { GlowParticle, GlowParticleConfig, PositionConfig } from "../type";

/**
 * Generates a cryptographically secure random number between 0 and 1.
 * Used for visual effects in the Plinko game where Math.random() would be flagged by SonarQube.
 * This is safe for game visuals but not suitable for cryptographic purposes.
 */
const secureRandom = (): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xFFFFFFFF + 1);
};

const DEFAULT_CONFIG: GlowParticleConfig = {
    positions: [
        { x: 200, y: 150 },
        { x: 600, y: 150 },
    ],
    particleCount: 10,
    baseRadius: 3,
    baseAlpha: 0.6,
    colors: [
        "#21F5DD",
    ],
    pulseSpeed: 0.005,
    driftSpeed: 0.03,
    maxDrift: 100,
};

export const useGlowParticles = (config: Partial<GlowParticleConfig> = {}) => {
    const particlesRef = useRef<GlowParticle[]>([]);
    const lastUpdateRef = useRef<number>(0);

    const mergedConfig = useMemo(() => ({
        ...DEFAULT_CONFIG,
        ...config,
    }), [config]);

    const createParticle = useCallback((
        baseX: number,
        baseY: number,
        positionConfig: Partial<PositionConfig> = {}
    ): GlowParticle => {
        const colorIndex = Math.floor(secureRandom() * mergedConfig.colors.length);

        const maxDrift = positionConfig.maxDrift ?? mergedConfig.maxDrift;
        const driftSpeed = positionConfig.driftSpeed ?? mergedConfig.driftSpeed;

        const ellipseA = maxDrift * (0.3 + secureRandom() * 0.8);
        const ellipseB = maxDrift * (0.2 + secureRandom() * 0.6);
        const ellipseRotation = secureRandom() * Math.PI * 2;
        const ellipseSpeed = driftSpeed * (0.3 + secureRandom() * 0.7);
        const ellipseAngle = secureRandom() * Math.PI * 2;

        // Calculate initial position on ellipse
        const cosAngle = Math.cos(ellipseAngle);
        const sinAngle = Math.sin(ellipseAngle);
        const cosRot = Math.cos(ellipseRotation);
        const sinRot = Math.sin(ellipseRotation);

        // Ellipse parametric equations with rotation
        const x = baseX + (ellipseA * cosAngle * cosRot - ellipseB * sinAngle * sinRot);
        const y = baseY + (ellipseA * cosAngle * sinRot + ellipseB * sinAngle * cosRot);

        return {
            x,
            y,
            baseX,
            baseY,
            radius: mergedConfig.baseRadius + secureRandom() * 3,
            baseRadius: mergedConfig.baseRadius,
            color: mergedConfig.colors[colorIndex],
            alpha: mergedConfig.baseAlpha + secureRandom() * 0.3,
            baseAlpha: mergedConfig.baseAlpha,
            pulseSpeed: mergedConfig.pulseSpeed + (secureRandom() - 0.5) * 0.003,
            pulsePhase: secureRandom() * Math.PI * 2,
            ellipseAngle,
            ellipseSpeed,
            ellipseA,
            ellipseB,
            ellipseRotation,
            driftX: 0,
            driftY: 0,
            driftSpeed: ellipseSpeed,
            maxDrift: maxDrift,
        };
    }, [mergedConfig]);

    // Khởi tạo particles
    const initializeParticles = useCallback(() => {
        particlesRef.current = [];

        for (const position of mergedConfig.positions) {
            const positionConfig = position as PositionConfig;

            const particleCount = positionConfig.particleCount ?? mergedConfig.particleCount;

            for (let i = 0; i < particleCount; i++) {
                const particle = createParticle(positionConfig.x, positionConfig.y, positionConfig);
                particlesRef.current.push(particle);
            }
        }
    }, [mergedConfig, createParticle]);

    const updateParticles = useCallback((deltaTime: number) => {
        const currentTime = Date.now();
        const dt = currentTime - lastUpdateRef.current;
        lastUpdateRef.current = currentTime;

        for (const particle of particlesRef.current) {
            particle.pulsePhase += particle.pulseSpeed * dt;

            particle.radius = particle.baseRadius + Math.sin(particle.pulsePhase) * 1.5;

            particle.alpha = Math.max(0.1, particle.baseAlpha + Math.sin(particle.pulsePhase * 0.6) * 0.2);

            particle.ellipseAngle += particle.ellipseSpeed * dt * 0.01;

            if (particle.ellipseAngle >= Math.PI * 2) {
                particle.ellipseAngle -= Math.PI * 2;
            }

            const cosAngle = Math.cos(particle.ellipseAngle);
            const sinAngle = Math.sin(particle.ellipseAngle);
            const cosRot = Math.cos(particle.ellipseRotation);
            const sinRot = Math.sin(particle.ellipseRotation);

            particle.x = particle.baseX + (particle.ellipseA * cosAngle * cosRot - particle.ellipseB * sinAngle * sinRot);
            particle.y = particle.baseY + (particle.ellipseA * cosAngle * sinRot + particle.ellipseB * sinAngle * cosRot);

        }
    }, [mergedConfig]);

    const drawParticles = useCallback((context: CanvasRenderingContext2D) => {
        for (const particle of particlesRef.current) {
            context.save();

            const glowRadius = particle.radius * 3;
            const gradient = context.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, glowRadius
            );

            const alpha1 = Math.floor(particle.alpha * 255).toString(16).padStart(2, '0');
            const alpha2 = Math.floor(particle.alpha * 0.6 * 255).toString(16).padStart(2, '0');
            const alpha3 = Math.floor(particle.alpha * 0.3 * 255).toString(16).padStart(2, '0');
            const alpha4 = Math.floor(particle.alpha * 0.1 * 255).toString(16).padStart(2, '0');

            gradient.addColorStop(0, `${particle.color}${alpha1}`);
            gradient.addColorStop(0.3, `${particle.color}${alpha2}`);
            gradient.addColorStop(0.6, `${particle.color}${alpha3}`);
            gradient.addColorStop(1, `${particle.color}${alpha4}`);

            context.fillStyle = gradient;
            context.beginPath();
            context.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
            context.fill();

            const middleGradient = context.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 1.5
            );
            middleGradient.addColorStop(0, `${particle.color}${alpha2}`);
            middleGradient.addColorStop(0.7, `${particle.color}${alpha3}`);
            middleGradient.addColorStop(1, `${particle.color}00`);

            context.fillStyle = middleGradient;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius * 1.5, 0, Math.PI * 2);
            context.fill();

            context.fillStyle = `${particle.color}${alpha1}`;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius * 0.4, 0, Math.PI * 2);
            context.fill();

            context.restore();
        }
    }, []);

    return {
        initializeParticles,
        updateParticles,
        drawParticles,
        particles: particlesRef.current,
    };
};
