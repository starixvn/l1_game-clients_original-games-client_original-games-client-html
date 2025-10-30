import { create } from "zustand";
import { DrawInfo } from '@shared/components/game-base/type';

export interface BetDetailData {
    drawInfo: DrawInfo;
    betLogDetails: any[];
}

export interface BetDetailStore {
    betDetailData: BetDetailData | null;
    updateBetDetail: (betDetailData: BetDetailData) => void;
}

export const useBetDetailStore = create<BetDetailStore>((set) => ({
    betDetailData: null,
    updateBetDetail: (betDetailData: BetDetailData) => set({ betDetailData }),
}));

export default useBetDetailStore;
