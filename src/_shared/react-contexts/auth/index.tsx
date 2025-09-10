import React from "react";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { locales } from "../../constants";

export type PlayerContextModel = {
    authorizeInfo?: AuthorizeResponse;
    session?: SSOResponse;
    locale?: string;
    setBalance?: (balance: number) => void;
    signOut?: () => void;
    setSession?: (session: SSOResponse) => void;
    setAuthorizeInfo?: (authorizeInfo: AuthorizeResponse) => void;
    setLocale?: (locale: string) => void;
    fractionalOddsFormat?: boolean;
    enableQuickBet: boolean
};

export const PlayerContext = React.createContext<PlayerContextModel>({
    locale: locales.en,
    enableQuickBet: true
});
PlayerContext.displayName = "AuthContext";

export const PlayerContextProvider = PlayerContext.Provider;
export const PlayerContextConsumer = PlayerContext.Consumer;
export const usePlayerContext = () => React.useContext(PlayerContext);
