import { RoundGameSoundHandler, IGameSoundHandler } from "@shared/components/round-base/round-game-sound-handler";

export class PlinkoGameSoundHandler extends RoundGameSoundHandler implements IGameSoundHandler {
    constructor(props: any) {
        super(props);
    }

    handleSound(_) {
        return;
    }
}
