import { getOfferGamesIds } from '@shared/helpers';

import { DashboardProps } from "../type";

export class DashboardHandler {
    constructor(private readonly props: DashboardProps) { }

    checkIsNotOfferGame = () => {
        // Custom version: Simplified logic for direct-to-game functionality
        if (!this.props.authorizeResponse) {
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
        
        // Custom version: No lobby connection to reset
    };
}
