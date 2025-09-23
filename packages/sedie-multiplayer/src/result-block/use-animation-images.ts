import { useMemo, useState, useEffect } from "react";
import { useMemoriedImage } from "@shared/react-hooks/use-memoried-image";
import { getWinningSubOption } from "../history/sedie-multiplayer-bet-detail-result-block";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
console.log(`[use-animation-images] basePath: "${basePath}"`);
console.log(`[use-animation-images] NEXT_PUBLIC_BASE_PATH: "${process.env.NEXT_PUBLIC_BASE_PATH}"`);

interface AnimationImages {
    animationPhase1: any;
    animationPhase2: any;
}

// Define all available variants for each option
const ANIMATION_VARIANTS = {
    [SeDieBetOptions.RED2]: ["red2-op-1", "red2-op-2"],
    [SeDieBetOptions.RED3]: ["red3-op-1", "red3-op-2"],
    [SeDieBetOptions.WHITE3]: ["white3-op-1", "white3-op-2"],
    // red4 and white4 don't have variants, use original names
    [SeDieBetOptions.RED4]: ["red4"],
    [SeDieBetOptions.WHITE4]: ["white4"],
};

export const useAnimationImages = (settlementResult: any) => {
    const { roundId } = useGameStateContext();
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

    // Load animation phase 1
    const { data: animationPhase1 } = useMemoriedImage(`${basePath}/static/images/sedie-multiplayer/animation/phase-1/animation-phase-1.webp`);

    // Randomize variants based on roundId for consistent animation across players
    useEffect(() => {
        const newVariants: Record<string, string> = {};

        const seededRandom = (seed: string, max: number) => {
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                const char = seed.charCodeAt(i);
                hash = (hash << 5) - hash + char;
                hash = hash & hash;
            }

            return Math.abs(hash) % max;
        };

        const winningOption = getWinningSubOption(settlementResult);
        const variants = ANIMATION_VARIANTS[winningOption];

        if (variants.length > 1) {
            // Use roundId as seed for consistent randomization
            const randomIndex = seededRandom(`${roundId}-${winningOption}`, variants.length);
            newVariants[winningOption] = variants[randomIndex];
        } else {
            // Use the only variant for red4 and white4
            newVariants[winningOption] = variants[0];
        }

        setSelectedVariants(newVariants);
    }, [roundId, settlementResult]);

    // Load all phase 2 animations
    const { data: red2Op1 } = useMemoriedImage(`${basePath}/static/images/sedie-multiplayer/animation/phase-2/red2-op-1.webp`);
    const {
        data: red2Op2,
        isLoading: red2Op2Loading,
        error: red2Op2Error,
    } = useMemoriedImage(`${basePath}/static/images/sedie-multiplayer/animation/phase-2/red2-op-2.webp`);

    const { data: red3Op1 } = useMemoriedImage(`${basePath}/static/images/sedie-multiplayer/animation/phase-2/red3-op-1.webp`);
    const {
        data: red3Op2,
        isLoading: red3Op2Loading,
        error: red3Op2Error,
    } = useMemoriedImage(`${basePath}/static/images/sedie-multiplayer/animation/phase-2/red3-op-2.webp`);

    const { data: white3Op1 } = useMemoriedImage(`${basePath}/static/images/sedie-multiplayer/animation/phase-2/white3-op-1.webp`);
    const {
        data: white3Op2,
        isLoading: white3Op2Loading,
        error: white3Op2Error,
    } = useMemoriedImage(`${basePath}/static/images/sedie-multiplayer/animation/phase-2/white3-op-2.webp`);

    const { data: red4 } = useMemoriedImage(`${basePath}/static/images/sedie-multiplayer/animation/phase-2/red4.webp`);
    const { data: white4 } = useMemoriedImage(`${basePath}/static/images/sedie-multiplayer/animation/phase-2/white4.webp`);

    // Create a map for all variants
    const allVariants = useMemo(
        () => ({
            [SeDieBetOptions.RED2]: [red2Op1, red2Op2],
            [SeDieBetOptions.RED3]: [red3Op1, red3Op2],
            [SeDieBetOptions.WHITE3]: [white3Op1, white3Op2],
            [SeDieBetOptions.RED4]: [red4],
            [SeDieBetOptions.WHITE4]: [white4],
        }),
        [red2Op1, red2Op2, red3Op1, red3Op2, white3Op1, white3Op2, red4, white4]
    );

    const animationPhase2 = useMemo(() => {
        const winningOption = getWinningSubOption(settlementResult);
        const variants = allVariants[winningOption];
        const selectedVariant = selectedVariants[winningOption];

        if (!variants || !selectedVariant) {
            return null;
        }

        // Find the selected variant index
        const variantIndex = ANIMATION_VARIANTS[winningOption]?.indexOf(selectedVariant);
        const selectedData = variants[variantIndex];

        // loading or has error, use default animation
        if (winningOption === SeDieBetOptions.RED2) {
            if (variantIndex === 1 && (red2Op2Loading || red2Op2Error)) {
                return red2Op1;
            }
        } else if (winningOption === SeDieBetOptions.RED3) {
            if (variantIndex === 1 && (red3Op2Loading || red3Op2Error)) {
                return red3Op1;
            }
        } else if (winningOption === SeDieBetOptions.WHITE3) {
            if (variantIndex === 1 && (white3Op2Loading || white3Op2Error)) {
                return white3Op1;
            }
        }

        return selectedData;
    }, [
        settlementResult,
        allVariants,
        selectedVariants,
        red2Op1,
        red2Op2,
        red2Op2Loading,
        red2Op2Error,
        red3Op1,
        red3Op2,
        red3Op2Loading,
        red3Op2Error,
        white3Op1,
        white3Op2,
        white3Op2Loading,
        white3Op2Error,
    ]);

    return {
        animationPhase1,
        animationPhase2,
    } as AnimationImages;
};
