import { PegConfiguration, BoardConfiguration } from './types/calculation-types';

/**
 * Generate peg configuration from board setup
 */
export function generatePegConfiguration(boardConfig: BoardConfiguration): PegConfiguration {
    const pegs: Array<{ row: number; col: number; x: number; y: number }> = [];
    const pegsPerRow: number[] = [];

    // Calculate peg positions based on board layout
    const startY = 100; // Distance from top
    const pegSpacing = 60; // Standard peg spacing
    const pegRadius = 5;

    // For standard pyramid layout
    if (boardConfig.layout === 'pyramid') {
        const maxPegsInRow = boardConfig.slotCount;
        const startRow = Math.max(1, maxPegsInRow - 8); // Start with fewer pegs

        for (let row = 0; row < 8; row++) {
            const pegsInRow = startRow + row;
            pegsPerRow.push(pegsInRow);

            const rowWidth = (pegsInRow - 1) * pegSpacing;
            const startX = (boardConfig.width - rowWidth) / 2;

            for (let col = 0; col < pegsInRow; col++) {
                const x = startX + col * pegSpacing;
                const y = startY + row * (pegSpacing * 0.866); // Hexagonal spacing
                pegs.push({ row, col, x, y });
            }
        }
    }

    return {
        radius: pegRadius,
        spacing: pegSpacing,
        rowCount: pegsPerRow.length,
        pegsPerRow,
        positions: pegs
    };
}
