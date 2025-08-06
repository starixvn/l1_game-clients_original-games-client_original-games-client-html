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
    lobbyConfigs: ILobbyConfigs;
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

export interface ILobbyConfigs {
    name: string;
    currencyGroupIds: string[];
    miniPanelGameIds: number[];
    categories: IGameCategory[];
    banners: IBanner[];
    gameSettings?: Record<number, any>;
    roundTimerGame?: number | null;
}

export interface IBanner {
    gameId: number;
    displayTime: number;
    path?: string;
}

export interface IGameCategory {
    name: any;
    gameSettings: IGameSetting[];
}

export interface IGameSetting {
    gameId: number;
    bigSize: boolean;
    newTag: boolean;
}
