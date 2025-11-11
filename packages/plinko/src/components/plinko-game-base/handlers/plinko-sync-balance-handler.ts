import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { PlinkoFinish } from "@plinko/shared/types/types";
import { useGlobalEventsStore } from "@shared";
import { broadcastUserInfoRed } from "@shared/helpers/global-events-helper";
import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers";

export type PlinkoSyncBalanceHandlerProps = {
    gameMessageHandler: GameMessageHandler;
};

export class PlinkoSyncBalanceHandler {
    constructor(private readonly props: PlinkoSyncBalanceHandlerProps) {}
    registerEvents() {
        usePlinkoGameStore.subscribe((state) => state.finish, this.handleAfterPlacingBet.bind(this));
        usePlinkoGameStore.subscribe((state) => state.finishedBall, this.handleAfterSettlingBet.bind(this));
        usePlinkoGameStore.subscribe((state) => state.numberOfDroppingBall, this.handleAfterDroppingBall.bind(this));
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

    handleAfterDroppingBall(numberOfDroppingBall: number) {
        if (numberOfDroppingBall !== 0) {
            return;
        }
        this.props.gameMessageHandler.broadcastGameEvent({ [messageEventType.UPDATE_PLAYER_BALANCE]: true });
    }
}
