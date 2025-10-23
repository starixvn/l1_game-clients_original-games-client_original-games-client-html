import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { PlinkoFinish } from "@plinko/shared/types/types";
import { useGlobalEventsStore } from "@shared";
import { broadcastUserInfoRed } from "@shared/helpers/global-events-helper";

export class PlinkoSyncBalanceHandler {
    registerEvents() {
        usePlinkoGameStore.subscribe((state) => state.finish, this.handleAfterPlacingBet.bind(this));
        usePlinkoGameStore.subscribe((state) => state.finishedBall, this.handleAfterSettlingBet.bind(this));
    }

    handleAfterPlacingBet(finish: PlinkoFinish) {
        if (!finish || !finish.amount) {
            return;
        }
        broadcastUserInfoRed(useGlobalEventsStore.getState().userInfoRed - finish.amount);
    }

    handleAfterSettlingBet(finish: PlinkoFinish) {
        if (!finish || !finish.winAmount) {
            return;
        }
        broadcastUserInfoRed(useGlobalEventsStore.getState().userInfoRed + finish.winAmount);
    }
}
