import { SSOResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings, getGameSettings } from "../app-settings";
import { URLContextModel } from "../react-contexts";
import { getDefaultGameId } from "../utils";

export enum TrackingEvent {
    Function = "function_event",
    SSO = "sso_event",
}

export enum TrackingAction {
    ToggleOn = "ToggleOn",
    ToggleOff = "ToggleOff",
    Click = "Click",
    Show = "Show",
    Select = "Select",
    Open = "Open",
    Close = "Close",
    Change = "Change",
    Swipe = "Swipe",
    Create = "Create",
    GenerateRandom = "GenerateRandom",
}

export enum TrackingFunction {
    Music = "Music",
    Sound = "Sound",
    PFSetting = "PFSetting",
    PFGuide = "PFGuide",
    BetHistory = "BetHistory",
    BetDetails = "BetDetails",
    GameGuide = "GameGuide",
    PFBetHistory = "PFBetHistory",
    PFClientSeeds = "PFClientSeeds",
    PFVerify = "PFVerify",
    PFExportClientSeeds = "PFExportClientSeeds",
    SelectChip = "SelectChip",
    Banner = "Banner",
    Avatar = "Avatar",
    JoinGame = "JoinGame",
    Nickname = "Nickname",
    Lobby = "Lobby",
    SwitchGame = "SwitchGame",
}

export interface TrackingParameter {
    function: string;
    action?: string;
    page?: string;
    playerId?: string;
}

const eventNames = { page_view: "page_view", login: "login_type" };
const commandNames = { event: "event", config: "config" };

type PlayerContext = {
    playerId: string;
    page: string;
    language: string;
};

type SSOContext = {
    ssoMethod: string;
    gameId: number;
    gameName?: string;
    language: string;
};

export class AnalyticsHelper {
    private static readonly playerContext: PlayerContext = { playerId: "", page: "", language: "" };
    private static ssoContext: SSOContext;

    static setPlayerSession(playerSession: SSOResponse) {
        AnalyticsHelper.playerContext.playerId = playerSession?.username;
    }

    static injectPlayerInfo(analyticParams: any, propertyName) {
        if (AnalyticsHelper.playerContext?.playerId) {
            analyticParams[propertyName] = AnalyticsHelper.playerContext?.playerId;
        }
    }

    static trackEvent(event: string, params: TrackingParameter) {
        AnalyticsHelper.send(commandNames.event, event, params);
    }

    static login(urlContext: URLContextModel) {
        try {
            const ssoMethod = "SSO_To_Game";

            AnalyticsHelper.ssoContext = {
                ssoMethod,
                gameId: getDefaultGameId(),
                language: urlContext.language,
            };

            AnalyticsHelper.ssoContext.gameName = getGameSettings(getDefaultGameId())?.gameName;
        } catch (e) {
            console.error("[AnalyticsHelper] login error:", e);
        }
    }

    static trackFunction(params: TrackingParameter) {
        try {
            params.page = AnalyticsHelper.playerContext.page;
            params.playerId = AnalyticsHelper.playerContext.playerId;

            AnalyticsHelper.send(commandNames.event, TrackingEvent.Function, params);
        } catch (e) {
            console.error("[AnalyticsHelper] trackFunction error:", e);
        }
    }

    static trackPage(params: { page_title: string; language?: string }) {
        AnalyticsHelper.injectPlayerInfo(params, "client_id");
        AnalyticsHelper.playerContext.page = params?.page_title;
        AnalyticsHelper.playerContext.language = params?.language;
        params?.page_title && AnalyticsHelper.send(commandNames.event, eventNames.page_view, params);

        if (params.page_title !== TrackingFunction.Lobby) {
            AnalyticsHelper.trackFunction({ function: TrackingFunction.JoinGame, action: TrackingAction.Show });
        }
    }

    static trackLobby() {
        AnalyticsHelper.trackPage({ page_title: TrackingFunction.Lobby });
    }

    static setUser(playerId: string, tagId?: string) {
        if (!tagId) {
            tagId = getAppSettings().googleAnalyticId;
        }

        AnalyticsHelper.send(commandNames.config, tagId, {
            user_id: playerId,
        });

        AnalyticsHelper.send(commandNames.event, TrackingEvent.SSO, {
            ...AnalyticsHelper.ssoContext,
            playerId,
        });
    }

    static send(command: string, event: string, params: any) {
        try {
            globalThis.gtag && globalThis.gtag(command, event, params);
        } catch (e) {
            console.error("[AnalyticsHelper] send error:", e);
        }
    }
}
