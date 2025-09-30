import { RoundGameSoundHandler, IGameSoundHandler } from "@shared/components/round-base/round-game-sound-handler";
import { RoundState } from "@shared/components/game-base/type";

export class PlinkoGameSoundHandler extends RoundGameSoundHandler implements IGameSoundHandler {
    constructor(props: any) {
        super(props);
    }

    handleSound(newRoundState: RoundState) {
        // Plinko uses continuous sounds rather than round-based sounds
        // We can customize this for plinko-specific sounds
        super.handleSound(newRoundState);

        // Add plinko-specific sound handling here if needed
        // For example, ball drop sounds, multiplier hit sounds, etc.
    }
}
