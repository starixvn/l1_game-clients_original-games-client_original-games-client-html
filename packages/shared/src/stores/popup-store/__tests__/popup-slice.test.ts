import { create } from 'zustand';
import { createPopupSlice, PopupSlice } from '../popup-slice';

describe('PopupSlice', () => {
    let useTestStore: any;

    beforeEach(() => {
        useTestStore = create<PopupSlice>()((...args) => ({
            ...createPopupSlice(...args),
        }));
    });

    describe('initial state', () => {
        it('should initialize all popup states to false', () => {
            const state = useTestStore.getState();

            expect(state.isShowBetHistory).toBe(false);
            expect(state.isShowBetDetail).toBe(false);
            expect(state.isShowGameGuide).toBe(false);
            expect(state.isShowPFSetting).toBe(false);
            expect(state.isShowPFVerify).toBe(false);
            expect(state.isShowPFClientSeedInfo).toBe(false);
            expect(state.isShowPFVerification).toBe(false);
            expect(state.expandGuideFirst).toBe(false);
            expect(state.isShowConfetti).toBe(false);
        });
    });

    describe('toggleBetHistory', () => {
        it('should set isShowBetHistory to true', () => {
            const { toggleBetHistory } = useTestStore.getState();

            toggleBetHistory(true);

            expect(useTestStore.getState().isShowBetHistory).toBe(true);
        });

        it('should set isShowBetHistory to false', () => {
            const { toggleBetHistory } = useTestStore.getState();

            toggleBetHistory(false);

            expect(useTestStore.getState().isShowBetHistory).toBe(false);
        });
    });

    describe('toggleBetDetail', () => {
        it('should set isShowBetDetail to true', () => {
            const { toggleBetDetail } = useTestStore.getState();

            toggleBetDetail(true);

            expect(useTestStore.getState().isShowBetDetail).toBe(true);
        });

        it('should set isShowBetDetail to false', () => {
            const { toggleBetDetail } = useTestStore.getState();

            toggleBetDetail(false);

            expect(useTestStore.getState().isShowBetDetail).toBe(false);
        });
    });

    describe('toggleGameGuide', () => {
        it('should set isShowGameGuide to true', () => {
            const { toggleGameGuide } = useTestStore.getState();

            toggleGameGuide(true);

            expect(useTestStore.getState().isShowGameGuide).toBe(true);
        });

        it('should set isShowGameGuide to false', () => {
            const { toggleGameGuide } = useTestStore.getState();

            toggleGameGuide(false);

            expect(useTestStore.getState().isShowGameGuide).toBe(false);
        });
    });

    describe('togglePFSetting', () => {
        it('should set isShowPFSetting to true', () => {
            const { togglePFSetting } = useTestStore.getState();

            togglePFSetting(true);

            expect(useTestStore.getState().isShowPFSetting).toBe(true);
        });

        it('should set isShowPFSetting to false', () => {
            const { togglePFSetting } = useTestStore.getState();

            togglePFSetting(false);

            expect(useTestStore.getState().isShowPFSetting).toBe(false);
        });
    });

    describe('togglePFVerify', () => {
        it('should set isShowPFVerify to true', () => {
            const { togglePFVerify } = useTestStore.getState();

            togglePFVerify(true);

            expect(useTestStore.getState().isShowPFVerify).toBe(true);
        });

        it('should set isShowPFVerify to false', () => {
            const { togglePFVerify } = useTestStore.getState();

            togglePFVerify(false);

            expect(useTestStore.getState().isShowPFVerify).toBe(false);
        });
    });

    describe('togglePFClientSeedInfo', () => {
        it('should set isShowPFClientSeedInfo to true', () => {
            const { togglePFClientSeedInfo } = useTestStore.getState();

            togglePFClientSeedInfo(true);

            expect(useTestStore.getState().isShowPFClientSeedInfo).toBe(true);
        });

        it('should set isShowPFClientSeedInfo to false', () => {
            const { togglePFClientSeedInfo } = useTestStore.getState();

            togglePFClientSeedInfo(false);

            expect(useTestStore.getState().isShowPFClientSeedInfo).toBe(false);
        });
    });

    describe('togglePFVerification', () => {
        it('should set isShowPFVerification to true', () => {
            const { togglePFVerification } = useTestStore.getState();

            togglePFVerification(true);

            expect(useTestStore.getState().isShowPFVerification).toBe(true);
        });

        it('should set isShowPFVerification to false', () => {
            const { togglePFVerification } = useTestStore.getState();

            togglePFVerification(false);

            expect(useTestStore.getState().isShowPFVerification).toBe(false);
        });
    });

    describe('toggleExpandGuideFirst', () => {
        it('should set expandGuideFirst to true', () => {
            const { toggleExpandGuideFirst } = useTestStore.getState();

            toggleExpandGuideFirst(true);

            expect(useTestStore.getState().expandGuideFirst).toBe(true);
        });

        it('should set expandGuideFirst to false', () => {
            const { toggleExpandGuideFirst } = useTestStore.getState();

            toggleExpandGuideFirst(false);

            expect(useTestStore.getState().expandGuideFirst).toBe(false);
        });
    });

    describe('toggleConfetti', () => {
        it('should set isShowConfetti to true', () => {
            const { toggleConfetti } = useTestStore.getState();

            toggleConfetti(true);

            expect(useTestStore.getState().isShowConfetti).toBe(true);
        });

        it('should set isShowConfetti to false', () => {
            const { toggleConfetti } = useTestStore.getState();

            toggleConfetti(false);

            expect(useTestStore.getState().isShowConfetti).toBe(false);
        });
    });

    describe('multiple popup states', () => {
        it('should handle multiple popups being open simultaneously', () => {
            const {
                toggleBetHistory,
                toggleBetDetail,
                toggleGameGuide,
                toggleConfetti
            } = useTestStore.getState();

            toggleBetHistory(true);
            toggleBetDetail(true);
            toggleGameGuide(true);
            toggleConfetti(true);

            const state = useTestStore.getState();
            expect(state.isShowBetHistory).toBe(true);
            expect(state.isShowBetDetail).toBe(true);
            expect(state.isShowGameGuide).toBe(true);
            expect(state.isShowConfetti).toBe(true);
        });

        it('should handle toggling multiple popups independently', () => {
            const {
                toggleBetHistory,
                toggleBetDetail
            } = useTestStore.getState();

            toggleBetHistory(true);
            toggleBetDetail(false);

            expect(useTestStore.getState().isShowBetHistory).toBe(true);
            expect(useTestStore.getState().isShowBetDetail).toBe(false);

            toggleBetHistory(false);
            toggleBetDetail(true);

            expect(useTestStore.getState().isShowBetHistory).toBe(false);
            expect(useTestStore.getState().isShowBetDetail).toBe(true);
        });
    });
});
