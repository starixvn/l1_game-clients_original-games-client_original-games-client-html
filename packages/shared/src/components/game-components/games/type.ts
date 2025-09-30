import { UserStakeLevel } from "@shared/components/game-base/type";

export interface Props {
    setApiErrorMessage: (errorCode: string, isDisableAccount?: boolean) => void;
    userStakeLevel: UserStakeLevel;
    updateUserStakeLevel: (level: UserStakeLevel) => void;
    openGameId: number;
    openGameName: string;
}

export interface GameComponentProps {
    gameSound: any;
    setApiErrorMessage: (errorCode: string, isDisableAccount?: boolean) => void;
    theme: string | undefined;
    userStakeLevel: UserStakeLevel;
    updateUserStakeLevel: (level: UserStakeLevel) => void;
    [key: string]: any;
}

export interface GameComponentRegistry {
    [gameId: number]: React.ComponentType<any>;
}
