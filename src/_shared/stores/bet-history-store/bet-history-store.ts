import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BetHistorySlice, createBetHistorySlice } from "./bet-history-slice";

export type BetHistoryStore = BetHistorySlice;

export const useBetHistoryStore = create<BetHistoryStore>()(
    persist(
        (set, ...a) => {
            return createBetHistorySlice(set, ...a);
        },
        {
            name: "bet-history-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist the pending bet data (not the entire bet logs)
                pendingBetDetails: state.pendingBetDetails,
                pendingBetRoundId: state.pendingBetRoundId,
                pendingFirstBetTime: state.pendingFirstBetTime,
            }),
        }
    )
);

export default useBetHistoryStore;
