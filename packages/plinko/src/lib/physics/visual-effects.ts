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

}

