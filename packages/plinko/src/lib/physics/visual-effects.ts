/**
 * Visual Effects Module
 * Handles all visual effects, particles, and animations for the Plinko game
 */

/**
 * Create a floating text particle showing the win amount
 * @param winAmount - The amount won
 * @param x - X position to display the text
 * @param y - Y position to display the text
 */
export function createWinTextParticle(winAmount: number, x: number, y: number): void {
    // Create a temporary DOM element for the win text
    const winText = document.createElement('div');
    winText.textContent = `+$${winAmount.toFixed(0)}`;
    winText.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        color: #ffd700;
        font-size: 20px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 1000;
        animation: winTextFloat 2s ease-out forwards;
    `;

    // Add custom keyframes for floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes winTextFloat {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            50% {
                opacity: 0.9;
                transform: translateY(-30px) scale(1.2);
            }
            100% {
                opacity: 0;
                transform: translateY(-60px) scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);

    // Find the canvas container and add the text
    const canvasContainer = document.querySelector('.canvas-ball-layout');
    if (canvasContainer) {
        canvasContainer.appendChild(winText);

        // Remove the text after animation completes
        setTimeout(() => {
            if (winText.parentNode) {
                winText.parentNode.removeChild(winText);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 2000);
    }
}

/**
 * Play collision sound effect based on multiplier value
 * @param multiplier - The multiplier value to determine sound type
 */
export function playCollisionSound(multiplier: number): void {
    // Sound effect hooks - implement based on your audio system
    const soundType = multiplier >= 10 ? 'jackpot' :
        multiplier >= 5 ? 'big_win' :
            multiplier >= 2 ? 'win' : 'small_win';

    // Example: playSound(`${soundType}.mp3`);
    // Example: AudioManager.play('bounce.mp3', { volume: 0.7 });

    console.log(`🔊 Playing ${soundType} sound effect`);
}

/**
 * Create a visual pulse effect at a specific position
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param color - Color of the pulse effect
 * @param duration - Duration in milliseconds
 */
export function createPulseEffect(x: number, y: number, color: string = '#ffd700', duration: number = 500): void {
    const pulseElement = document.createElement('div');
    pulseElement.style.cssText = `
        position: absolute;
        left: ${x - 25}px;
        top: ${y - 25}px;
        width: 50px;
        height: 50px;
        border: 2px solid ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 999;
        animation: pulseEffect ${duration}ms ease-out forwards;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulseEffect {
            0% {
                transform: scale(0.5);
                opacity: 1;
            }
            50% {
                transform: scale(1.2);
                opacity: 0.8;
            }
            100% {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    const canvasContainer = document.querySelector('.canvas-ball-layout');
    if (canvasContainer) {
        canvasContainer.appendChild(pulseElement);

        setTimeout(() => {
            if (pulseElement.parentNode) {
                pulseElement.parentNode.removeChild(pulseElement);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, duration);
    }
}

/**
 * Create a sparkle effect around a winning slot
 * @param x - X coordinate of the center
 * @param y - Y coordinate of the center
 * @param count - Number of sparkles to create
 */
export function createSparkleEffect(x: number, y: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const angle = (Math.PI * 2 * i) / count;
            const distance = 20 + Math.random() * 30;
            const sparkleX = x + Math.cos(angle) * distance;
            const sparkleY = y + Math.sin(angle) * distance;

            const sparkle = document.createElement('div');
            sparkle.textContent = '✨';
            sparkle.style.cssText = `
                position: absolute;
                left: ${sparkleX - 10}px;
                top: ${sparkleY - 10}px;
                font-size: 16px;
                pointer-events: none;
                z-index: 999;
                animation: sparkleFade 1s ease-out forwards;
            `;

            const style = document.createElement('style');
            style.textContent = `
                @keyframes sparkleFade {
                    0% {
                        opacity: 1;
                        transform: scale(0);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.5);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0);
                    }
                }
            `;
            document.head.appendChild(style);

            const canvasContainer = document.querySelector('.canvas-ball-layout');
            if (canvasContainer) {
                canvasContainer.appendChild(sparkle);

                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                    if (style.parentNode) {
                        style.parentNode.removeChild(style);
                    }
                }, 1000);
            }
        }, i * 100); // Stagger the sparkles
    }
}

/**
 * Apply a screen shake effect to the canvas container
 * @param intensity - Intensity of the shake (1-10)
 * @param duration - Duration in milliseconds
 */
export function createScreenShake(intensity: number = 5, duration: number = 200): void {
    const canvasContainer = document.querySelector('.canvas-ball-layout') as HTMLElement;
    if (!canvasContainer) return;

    const originalTransform = canvasContainer.style.transform || '';
    const startTime = Date.now();

    function shake(): void {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            const shakeX = (Math.random() - 0.5) * intensity;
            const shakeY = (Math.random() - 0.5) * intensity;
            canvasContainer.style.transform = `${originalTransform} translate(${shakeX}px, ${shakeY}px)`;

            requestAnimationFrame(shake);
        } else {
            canvasContainer.style.transform = originalTransform;
        }
    }

    shake();
}
