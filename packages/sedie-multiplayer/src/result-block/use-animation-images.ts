import { useMemo, useState, useEffect } from "react";
import { useMemoriedImage } from "@shared/react-hooks/use-memoried-image";
import { getWinningSubOption } from "../history/sedie-multiplayer-bet-detail-result-block";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";

interface AnimationImages {
    animationPhase1: any;
    animationPhase2: any;
}

// Define all available variants for each option
const ANIMATION_VARIANTS = {
    [SeDieBetOptions.RED2]: ["red2-op-1", "red2-op-2", "red2-op-3", "red2-op-4", "red2-op-5", "red2-op-6"],
    [SeDieBetOptions.RED3]: ["red3-op-1", "red3-op-2", "red3-op-3", "red3-op-4"],
    [SeDieBetOptions.WHITE3]: ["white3-op-1", "white3-op-2", "white3-op-3", "white3-op-4"],
    // red4 and white4 don't have variants, use original names
    [SeDieBetOptions.RED4]: ["red4"],
    [SeDieBetOptions.WHITE4]: ["white4"],
};

export const useAnimationImages = (settlementResult: any) => {
    const { roundId } = useGameStateContext();
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

    // Load animation phase 1
    const { data: animationPhase1 } = useMemoriedImage(`/static/images/sedie-multiplayer/animation/phase-1/animation-phase-1.webp`);

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

    // Load all phase 2 animations with their selected variants
    const { data: red2 } = useMemoriedImage(
        `/static/images/sedie-multiplayer/animation/phase-2/${selectedVariants[SeDieBetOptions.RED2] || "red2-op-1"}.webp`
    );
    const { data: red3 } = useMemoriedImage(
        `/static/images/sedie-multiplayer/animation/phase-2/${selectedVariants[SeDieBetOptions.RED3] || "red3-op-1"}.webp`
    );
    const { data: white3 } = useMemoriedImage(
        `/static/images/sedie-multiplayer/animation/phase-2/${selectedVariants[SeDieBetOptions.WHITE3] || "white3-op-1"}.webp`
    );

    const { data: red4 } = useMemoriedImage(`/static/images/sedie-multiplayer/animation/phase-2/red4.webp`);
    const { data: white4 } = useMemoriedImage(`/static/images/sedie-multiplayer/animation/phase-2/white4.webp`);

    const phase2Images = useMemo(
        () => ({
            [SeDieBetOptions.RED2]: red2,
            [SeDieBetOptions.RED3]: red3,
            [SeDieBetOptions.RED4]: red4,
            [SeDieBetOptions.WHITE3]: white3,
            [SeDieBetOptions.WHITE4]: white4,
        }),
        [red2, red3, red4, white3, white4]
    );

    const animationPhase2 = useMemo(() => {
        const winningOption = getWinningSubOption(settlementResult);
        return phase2Images[winningOption] || null;
    }, [settlementResult, phase2Images]);

    return {
        animationPhase1,
        animationPhase2,
    } as AnimationImages;
};
