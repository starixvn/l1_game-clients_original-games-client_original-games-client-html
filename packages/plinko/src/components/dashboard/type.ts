import { TolgeeInstance } from "@tolgee/react";
import { WithRouterProps } from "next/dist/client/with-router";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";

import { UserStakeLevel } from "@shared/components/game-base/type";

export interface DashboardProps extends WithRouterProps {
    session: SSOResponse;
    queryGame: number;
    setIsUm: Function;
    tolgee: TolgeeInstance;
    authorizeResponse: AuthorizeResponse;
}

type APIErrorProp = {
    message: string;
    errorCode: string;
};

export interface DashboardState {
    userStakeLevel: UserStakeLevel;
    authorizeInfo: AuthorizeResponse;
    isShowErrorModal: boolean;
    apiError: APIErrorProp | null;
    isBlockUI: boolean;
    queryGame: number;
    openGameId: number | null;
    openGameName: string;
}
