import { GameFinishHandler } from "@shared/components/game-base/handlers/game-finish-handler";
import { PlinkoFinish } from "@plinko/shared/types/types";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";

export class PlinkoGameFinishHandler extends GameFinishHandler {
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
