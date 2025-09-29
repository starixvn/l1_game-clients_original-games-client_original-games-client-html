import { Dashboard } from "../Dashboard";
import { reCheckIn } from "@shared/services/auth-service";
import { logger as plinkoLogger } from "../../../services/logger";

export class NotificationHandler {
    private dashboard: Dashboard;

    constructor(dashboard: Dashboard) {
        this.dashboard = dashboard;
    }

    initialize() {
        plinkoLogger.info('🔔 [DASHBOARD] Initializing notification handler');
    }

    async handleReCheckIn() {
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
}
