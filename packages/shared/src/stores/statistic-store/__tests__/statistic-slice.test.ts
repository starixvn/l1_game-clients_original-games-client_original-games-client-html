import { create } from 'zustand';
import { createStatisticSlice, StatisticSlice } from '../statistic-slice';

describe('StatisticSlice', () => {
    let useTestStore: any;

    beforeEach(() => {
        useTestStore = create<StatisticSlice>()((...args) => ({
            ...createStatisticSlice(...args),
        }));
    });

    it('should initialize with default state', () => {
        const { isShowStatistic } = useTestStore.getState();
        expect(isShowStatistic).toBe(false);
    });

    describe('showStatistic', () => {
        it('should set isShowStatistic to true', () => {
            const { showStatistic } = useTestStore.getState();

            showStatistic();

            const { isShowStatistic } = useTestStore.getState();
            expect(isShowStatistic).toBe(true);
        });
    });

    describe('hideStatistic', () => {
        it('should set isShowStatistic to false', () => {
            const { showStatistic, hideStatistic } = useTestStore.getState();

            // First show the statistic
            showStatistic();
            expect(useTestStore.getState().isShowStatistic).toBe(true);

            // Then hide it
            hideStatistic();

            const { isShowStatistic } = useTestStore.getState();
            expect(isShowStatistic).toBe(false);
        });

        it('should set isShowStatistic to false when already false', () => {
            const { hideStatistic } = useTestStore.getState();

            hideStatistic();

            const { isShowStatistic } = useTestStore.getState();
            expect(isShowStatistic).toBe(false);
        });
    });

    describe('state transitions', () => {
        it('should handle multiple show/hide cycles', () => {
            const { showStatistic, hideStatistic } = useTestStore.getState();

            // Initial state
            expect(useTestStore.getState().isShowStatistic).toBe(false);

            // Show
            showStatistic();
            expect(useTestStore.getState().isShowStatistic).toBe(true);

            // Hide
            hideStatistic();
            expect(useTestStore.getState().isShowStatistic).toBe(false);

            // Show again
            showStatistic();
            expect(useTestStore.getState().isShowStatistic).toBe(true);
        });
    });
});
