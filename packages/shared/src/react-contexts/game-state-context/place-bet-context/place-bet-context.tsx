import { Dispatch, createContext, useContext, useReducer } from "react";
import { PlaceBetEventAction, PlaceBetEventActionType } from "./place-bet-action";
import { PlaceBetContextModel, initialPlaceBetContext } from "./place-bet-context-model";

export const PlaceBetContext = createContext({} as PlaceBetContextModel);
const PlaceBetDispatchContext = createContext({} as Dispatch<PlaceBetEventAction>);

export function PlaceBetProvider({ children }) {
    const [placeBetContextModel, dispatch] = useReducer(placeBetReducer, initialPlaceBetContext());

    return (
        <PlaceBetContext.Provider value={placeBetContextModel}>
            <PlaceBetDispatchContext.Provider value={dispatch}>{children}</PlaceBetDispatchContext.Provider>
        </PlaceBetContext.Provider>
    );
}

export const usePlaceBetContext = () => {
    return useContext(PlaceBetContext);
};

export function usePlaceBetDispatch() {
    return useContext(PlaceBetDispatchContext);
}

function placeBetReducer(state: PlaceBetContextModel, action: PlaceBetEventAction) {
    const { type, payload } = action;
    const { ownBets, suggestBet, notConfirmOwnBets, showConfirmBet, showConfirmDialog } = payload;

    switch (type) {
        case PlaceBetEventActionType.OWN_BETS: {
            return {
                ...state,
                ownBets,
            };
        }

        case PlaceBetEventActionType.SUGGEST_BET: {
            return {
                ...state,
                suggestBet,
            };
        }

        case PlaceBetEventActionType.RESET_OWN_BETS_AND_SUGGEST_BET: {
            return {
                ...state,
                ownBets: {},
                suggestBet: {},
            };
        }

        case PlaceBetEventActionType.CLOSE_ALL_DIALOGS: {
            return {
                ...state,
                notConfirmOwnBets: {},
                showConfirmBet: false,
                showConfirmDialog: false
            };
        }

        case PlaceBetEventActionType.NOT_CONFIRM_OWN_BETS: {
            return {
                ...state,
                notConfirmOwnBets,
            };
        }

        case PlaceBetEventActionType.SHOW_CONFIRM_BET: {
            return {
                ...state,
                showConfirmBet,
            };
        }

        case PlaceBetEventActionType.SHOW_CONFIRM_DIALOG: {
            return {
                ...state,
                showConfirmDialog,
            };
        }

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
}
