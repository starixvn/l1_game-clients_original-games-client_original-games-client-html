import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers/game-message-handler";
import { usePlinkoLightningModeGameStore } from "@plinko/shared/stores";

export interface PlinkoLightningConfigHandlerProps {
    gameMessageHandler: GameMessageHandler;
}

export class PlinkoLightningConfigHandler {
    constructor(private readonly props: PlinkoLightningConfigHandlerProps) {}

    registerEvents() {
        this.props.gameMessageHandler.register(messageEventType.LIGHTNING_CONFIG, this.handleLightningConfig.bind(this));
    }

    private handleLightningConfig(data: { lightningConfig: { lightningKey: string; lightningBoard: any } }) {
        const lightningModeGameStore = usePlinkoLightningModeGameStore.getState();
        if (data.lightningConfig) {
            lightningModeGameStore.actions.setLightningConfig(data.lightningConfig);
        }
    }

}
