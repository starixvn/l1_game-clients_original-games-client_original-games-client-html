import { getMultiplierColors } from "@plinko/constants";

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
        const modeColors = getMultiplierColors(mode);
        if (!modeColors || !Array.isArray(modeColors)) {
            colors[i] = "#FFDC48"; // Default fallback
        } else {
            colors[i] = modeColors[level] || modeColors[0] || "#FFDC48";
        }
    }

    return colors;
}

export function getMultiplierColor(slotIndex: number, gameMode: number, numberOfRows: number): string {
    const colors = generateMultiplierColor(gameMode, numberOfRows);
    // Handle out-of-bounds indices by returning a default color
    if (slotIndex < 0 || slotIndex >= colors.length) {
        return getMultiplierColors(gameMode)?.[0] || "#FFDC48";
    }
    return colors[slotIndex];
}

export function getLightningMultiplierColor(multiplier: number): string {
    if (multiplier >= 0 && multiplier <= 0.5) {
        return "#004A24";
    } else if (multiplier > 0.5 && multiplier <= 1) {
        return "#0D5B10";
    } else if (multiplier > 1 && multiplier <= 10) {
        return "#187C19";
    } else if (multiplier > 10 && multiplier < 100) {
        return "#69B31E";
    } else if (multiplier >= 100) {
        return "#8DC71D";
    }

    return "#004A24";
}
