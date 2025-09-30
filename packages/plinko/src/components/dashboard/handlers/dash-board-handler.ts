import Dashboard from "../Dashboard";
import { reCheckIn } from "@shared/services/auth-service";
import { logger as plinkoLogger } from "../../../services/logger";

export class DashboardHandler {
    private dashboard: Dashboard;

    constructor(dashboard: Dashboard) {
        this.dashboard = dashboard;
    }

    async reCheckIn() {
        const { session } = this.dashboard.props;
        if (session) {
            plinkoLogger.info('Re-check-in initiated', {
                username: session.username
            });
            try {
                await reCheckIn(session);
                plinkoLogger.info('Re-check-in completed successfully', {
                    username: session.username
                });
            } catch (error) {
                plinkoLogger.error('Re-check-in failed', {
                    error: error.message,
                    username: session.username
                });
            }
        }
    }

    checkGameOffer() {
        plinkoLogger.debug('🎮 [DASHBOARD] Performing initial game offer check');
        plinkoLogger.debug('🎮 [DASHBOARD] Checking game offer availability');

        // For Plinko, we assume the game is always available
        plinkoLogger.debug('✅ [DASHBOARD] Game offer available');
    }

    openGame(gameId: number) {
        if (gameId) {
            plinkoLogger.info('🎮 [DASHBOARD] Query game specified, opening game', {
                queryGame: gameId
            });
            this.dashboard.openGame(gameId);
        }
    }
}
