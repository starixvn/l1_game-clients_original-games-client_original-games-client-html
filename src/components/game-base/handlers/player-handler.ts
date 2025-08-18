import { broadcastNotice, createNoticeFromErrorCode } from "../../../_shared/helpers";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { ConnectFailedReasonKey } from "../../game-components/error-message/type";
import { GameMessageHandler, messageEventType } from "./game-message-handler";

export type PlayerHandlerProps = {
    gameName: string;
    dispatch: Function;
    gameMessageHandler: GameMessageHandler;
};
class Player {
    name: string;
    UID: number;
    avatarId: number;
    currency: string;
    joinedOn: string;
    red: number;
    scoins?: number;
    type: boolean;
    rate?: number;
    minBet: number;
    maxBet: number;
    offerGames?: { gameId: number }[];
    availSpins?: number;
    fractionalOddsFormat?: boolean;
    isDisplayPlayerCurrency?: boolean;
    disableJackpotGames?: boolean;
}

class UserStakeLevel {
    minBet: number;
    maxBet: number;
}

export class PlayerHandler {
    constructor(private readonly props: PlayerHandlerProps) {}

    registerEvents = () => {
        this.props.gameMessageHandler.register(messageEventType.USER, ({ user, gameConfigs }) => {
            this.handleUserData({ user, gameConfigs });
        });

        this.props.gameMessageHandler.register(messageEventType.USER_STAKE_LEVEL, this.handleUserStakeLevel.bind(this));
        this.props.gameMessageHandler.register(messageEventType.NOT_PERMITTED_TO_PLAY, this.handleRestrictPermission.bind(this));
    };

    handleRestrictPermission = ({
        notPermittedToPlay,
        userStakeLevel,
    }: {
        notPermittedToPlay: boolean;
        userStakeLevel: UserStakeLevel;
    }) => {
        if (notPermittedToPlay) {
            this.props.gameMessageHandler.broadcastGameEvent({ [messageEventType.GAME_DESTROY]: true });
            this.props.dispatch({
                type: GameEventActionType.DISCONNECT_ERROR,
                payload: { disconnectReason: ConnectFailedReasonKey.restrictPlayPermission },
            });
        }
        if (userStakeLevel) {
            this.handleUserStakeLevel({ userStakeLevel });
        }
    };

    handleUserStakeLevel({ userStakeLevel, hasNotice = true }) {
        this.props.dispatch({
            type: GameEventActionType.USER_STAKE_LEVEL,
            payload: { userStakeLevel },
        });

        hasNotice &&
            broadcastNotice({
                message: "Common.message_bet_limit_change",
                duration: 3,
                isWarning: false,
            });
    }

    handleUserData({ user, gameConfigs }: { user: Player; gameConfigs: any }) {
        if (gameConfigs) {
            useGameStore.getState().setRate({ rate: user.rate });
        }
    }
}
