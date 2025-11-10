import { create } from "zustand";
import { BetLog } from "@shared/components/game-base/type";
export interface BetDetailStore {
    data: BetLog | null;
    setData: (data: any) => void;
}

export const useBetDetailStore = create<BetDetailStore>((set) => ({
    data: null,
    setData: (data: any) => set({ data }),
}));

export default useBetDetailStore;
