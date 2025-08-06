import { UserStakeLevel } from "../components/game-base/type";

export type Props = {
    setApiErrorMessage: Function;
    userStakeLevel: UserStakeLevel;
    updateUserStakeLevel: Function;
    openGameId: number;
    openGameName: string;
};
