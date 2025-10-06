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
        colors[i] = MULTIPLIER_COLORS[mode][level];
    }

    return colors;
}

export function getMultiplierColor(slotIndex: number, gameMode: number, numberOfRows: number): string {
    return generateMultiplierColor(gameMode, numberOfRows)[slotIndex];
}
