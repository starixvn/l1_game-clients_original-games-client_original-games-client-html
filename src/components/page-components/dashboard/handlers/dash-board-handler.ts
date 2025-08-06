import { getOfferGamesIds } from "../../../../_shared/helpers";

import { DashboardProps } from "../type";

export class DashboardHandler {
    constructor(
        private readonly props: DashboardProps,
        private readonly updateGameTransmitters: Function
    ) {
        console.log("[DashboardHandler] constructor called with props:", {
            authorizeResponse: !!this.props.authorizeResponse,
            queryGame: this.props.queryGame
        });
    }

    checkIsNotOfferGame = () => {
        console.log("[DashboardHandler] checkIsNotOfferGame called");
        // Custom version: Simplified logic for direct-to-game functionality
        if (!this.props.authorizeResponse) {
            console.log("[DashboardHandler] no authorizeResponse, returning false");
            return false;
        }

        const offerGames = getOfferGamesIds(this.props.authorizeResponse);
        console.log("[DashboardHandler] offerGames:", offerGames, "queryGame:", this.props.queryGame);
        const isNotOfferGame = !offerGames?.includes(this.props.queryGame);
        console.log("[DashboardHandler] isNotOfferGame:", isNotOfferGame);
        return isNotOfferGame;
    };

    shouldRenderGames = (offerGames: number[], openGameId: number | null) => {
        console.log("[DashboardHandler] shouldRenderGames called with:", { offerGames, openGameId });
        // Custom version: Always render games, never render lobby
        console.log("[DashboardHandler] always returning true to render games");
        return true;
    };

    getOfferGamesIds = () => {
        console.log("[DashboardHandler] getOfferGamesIds called");
        const offerGames = getOfferGamesIds(this.props.authorizeResponse);
        console.log("[DashboardHandler] returning offerGames:", offerGames);
        return offerGames;
    };

    reset = () => {
        console.log("[DashboardHandler] reset called");
        // Custom version: No lobby connection to reset
    };
}
