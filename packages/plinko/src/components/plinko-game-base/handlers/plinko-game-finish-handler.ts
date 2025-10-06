import { GameFinishHandler } from "@shared/components/game-base/handlers/game-finish-handler";
import { PlinkoFinish } from "@/shared/types/types";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";

export class PlinkoGameFinishHandler extends GameFinishHandler {
    constructor(props: any) {
        super(props);
    }

    handleFinishHandler(data) {
        super.handleFinishHandler(data);
        this.handlePlinkoFinish(data.finish);
    }

    handlePlinkoFinish(finish: PlinkoFinish) {
        if (!finish) {
            return;
        }
        usePlinkoGameStore.getState().actions.setFinish(finish);
    }
}
