import { SSOResponse } from "sc-user-service-client/dist/auth";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { Tolgee } from "@shared/tolgee";
import { UserStakeLevel } from "@shared/components/game-base/type";

export interface DashboardProps {
    session: SSOResponse;
    queryGame: number;
    setIsUm: (isUm: boolean) => void;
    tolgee: Tolgee;
    authorizeResponse: AuthorizeResponse;
}

export interface DashboardState {
    userStakeLevel: UserStakeLevel;
    authorizeInfo: AuthorizeResponse;
    isShowErrorModal: boolean;
    apiError: string | null;
    isBlockUI: boolean;
    queryGame: number;
    openGameId: number | null;
    openGameName: string;
}
