import { GameMessageHandler } from "@shared/components/game-base/handlers/game-message-handler";
import { usePlinkoLightningModeGameStore } from "@plinko/shared/stores";
import { MESSAGE_EVENT_TYPE } from "@plinko/constants";

export interface PlinkoLightningConfigHandlerProps {
    gameMessageHandler: GameMessageHandler;
}

export class PlinkoLightningConfigHandler {
    constructor(private readonly props: PlinkoLightningConfigHandlerProps) {}

    registerEvents() {
        this.props.gameMessageHandler.register(MESSAGE_EVENT_TYPE.LIGHTNING_CONFIG, this.handleLightningConfig.bind(this));
    }

    private handleLightningConfig(data: { lightningConfig: { lightningKey: string; lightningBoard: any } }) {
        const lightningModeGameStore = usePlinkoLightningModeGameStore.getState();
        if (data.lightningConfig) {
            lightningModeGameStore.actions.setLightningConfig(data.lightningConfig);
        }
    }

}
