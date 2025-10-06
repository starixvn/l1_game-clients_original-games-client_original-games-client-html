import { MULTIPLIER_COLORS } from "@/constants";

export function generateMultiplierColor(mode: number, numberOfRows: number): string[] {
    if (numberOfRows < 8) {
        return [];
    }

    const colors: string[] = new Array(numberOfRows).fill("");

    for (let i = 0; i < numberOfRows; i++) {
        const distance = Math.min(i, numberOfRows - i);
        let level = distance;
        if (level > 4) {
            level = 5;
        }

        // Ensure we have valid color data
        const modeColors = MULTIPLIER_COLORS[mode];
        if (!modeColors || !Array.isArray(modeColors)) {
            colors[i] = '#FFDC48'; // Default fallback
        } else {
            colors[i] = modeColors[level] || modeColors[0] || '#FFDC48';
        }
    }

    return colors;
}

export function getMultiplierColor(slotIndex: number, gameMode: number, numberOfRows: number): string {
    const colors = generateMultiplierColor(gameMode, numberOfRows);
    // Handle out-of-bounds indices by returning a default color
    if (slotIndex < 0 || slotIndex >= colors.length) {
        const modeColors = MULTIPLIER_COLORS[gameMode];
        return (modeColors && modeColors[0]) || '#FFDC48'; // Default to first color or fallback
    }
    return colors[slotIndex];
}
