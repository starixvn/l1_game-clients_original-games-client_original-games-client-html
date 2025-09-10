import { getOfferGamesIds } from '@shared/helpers';
import { GameIds } from '@shared/constants';

import { DashboardProps } from "../type";

export class DashboardHandler {
    constructor(private readonly props: DashboardProps) {}

    checkIsNotOfferGame = () => {
        // Custom version: Simplified logic for direct-to-game functionality
        if (!this.props.authorizeResponse) {
            return false;
        }

        // Allow direct access for SeDieMultiplayer (VG) even if not in offerGames
        if (this.props.queryGame === GameIds.SeDieMultiplayer) {
            return false;
        }

        const offerGames = getOfferGamesIds(this.props.authorizeResponse);
        return !offerGames?.includes(this.props.queryGame);
    };

    shouldRenderGames = (offerGames: number[], openGameId: number | null) => {
        return true;
    };

    getOfferGamesIds = () => {
        return getOfferGamesIds(this.props.authorizeResponse);
    };

    reset = () => {
        console.log("[DashboardHandler] reset called");
        // Custom version: No lobby connection to reset
    };
}
