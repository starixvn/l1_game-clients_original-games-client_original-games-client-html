import { TolgeeInstance } from "@tolgee/react";
import { WithRouterProps } from "next/dist/client/with-router";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";

import { UserStakeLevel } from "../../game-base/type";

export type DashboardProps = {
    session: SSOResponse;
    queryGame: number;
    setIsUm: Function;
    tolgee: TolgeeInstance;
    authorizeResponse: AuthorizeResponse;
} & WithRouterProps;

type APIErrorProp = {
    message: string;
    errorCode: string;
};

export type DashboardState = {
    userStakeLevel: UserStakeLevel;
    authorizeInfo: AuthorizeResponse;
    isShowErrorModal: boolean;  
    apiError: APIErrorProp;
    isBlockUI: boolean;
    queryGame: number;
    openGameId: number;
    openGameName: string;
    isLandscapeMode: boolean;

    dashBoardHeight: number;
};

export type GameOffer = {
    gameId: number;
    maxBet: number;
    minBet: number;
    _id: string;
    maxBetPerChoices: any;
};
