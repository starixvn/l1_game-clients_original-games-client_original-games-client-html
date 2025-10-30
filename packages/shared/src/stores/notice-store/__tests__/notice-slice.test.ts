import { create } from 'zustand';
import { createNoticeSlice, NoticeSlice } from '../notice-slice';
import { NoticeModel } from '@shared/components/game-base/type';

describe('NoticeSlice', () => {
    let useTestStore: any;
    const TEST_MESSAGE = 'test.message';

    beforeEach(() => {
        useTestStore = create<NoticeSlice>()((...args) => ({
            ...createNoticeSlice(...args),
        }));
    });

    describe('initial state', () => {
        it('should initialize notice to null', () => {
            const { notice } = useTestStore.getState();
            expect(notice).toBeNull();
        });
    });

    describe('setNotice', () => {
        it('should set notice to a valid NoticeModel', () => {
            const mockNotice: NoticeModel = {
                message: TEST_MESSAGE,
                duration: 3000,
                isWarning: false,
                gameName: 'baccarat',
                roundId: 12345
            };

            const { setNotice } = useTestStore.getState();

            setNotice(mockNotice);

            const { notice } = useTestStore.getState();
            expect(notice).toEqual(mockNotice);
        });

        it('should set notice to null', () => {
            // First set a notice
            const mockNotice: NoticeModel = {
                message: TEST_MESSAGE,
                duration: 3000,
                isWarning: false
            };

            const { setNotice } = useTestStore.getState();
            setNotice(mockNotice);

            // Then set to null
            setNotice(null);

            const { notice } = useTestStore.getState();
            expect(notice).toBeNull();
        });

        it('should set notice with minimal required fields', () => {
            const minimalNotice: NoticeModel = {
                message: 'minimal.message'
            };

            const { setNotice } = useTestStore.getState();

            setNotice(minimalNotice);

            const { notice } = useTestStore.getState();
            expect(notice).toEqual(minimalNotice);
        });

        it('should set notice with all optional fields', () => {
            const fullNotice: NoticeModel = {
                gameName: 'sedie',
                roundId: 67890,
                message: 'full.notice.message',
                duration: 5000,
                minBet: 100,
                maxBet: 10000,
                errorCode: 'ERR_001',
                position: { x: 10, y: 20 },
                isWarning: true
            };

            const { setNotice } = useTestStore.getState();

            setNotice(fullNotice);

            const { notice } = useTestStore.getState();
            expect(notice).toEqual(fullNotice);
        });
    });

    describe('clearNotice', () => {
        it('should clear notice when notice is set', () => {
            const mockNotice: NoticeModel = {
                message: TEST_MESSAGE,
                duration: 3000,
                isWarning: false
            };

            const { setNotice, clearNotice } = useTestStore.getState();

            // Set notice first
            setNotice(mockNotice);
            expect(useTestStore.getState().notice).toEqual(mockNotice);

            // Then clear it
            clearNotice();

            const { notice } = useTestStore.getState();
            expect(notice).toBeNull();
        });

        it('should not change state when notice is already null', () => {
            const { clearNotice } = useTestStore.getState();

            clearNotice();

            const { notice } = useTestStore.getState();
            expect(notice).toBeNull();
        });
    });

    describe('showNotice', () => {
        it('should set notice to the provided NoticeModel', () => {
            const mockNotice: NoticeModel = {
                message: 'show.notice.message',
                duration: 4000,
                isWarning: true,
                errorCode: 'INFO_001'
            };

            const { showNotice } = useTestStore.getState();

            showNotice(mockNotice);

            const { notice } = useTestStore.getState();
            expect(notice).toEqual(mockNotice);
        });

        it('should replace existing notice with new one', () => {
            const firstNotice: NoticeModel = {
                message: 'first.message',
                duration: 2000,
                isWarning: false
            };

            const secondNotice: NoticeModel = {
                message: 'second.message',
                duration: 5000,
                isWarning: true
            };

            const { showNotice } = useTestStore.getState();

            // Show first notice
            showNotice(firstNotice);
            expect(useTestStore.getState().notice).toEqual(firstNotice);

            // Show second notice
            showNotice(secondNotice);

            const { notice } = useTestStore.getState();
            expect(notice).toEqual(secondNotice);
        });
    });

    describe('notice state management', () => {
        it('should handle setNotice -> clearNotice -> showNotice sequence', () => {
            const setNoticeData: NoticeModel = {
                message: 'set.notice',
                duration: 3000,
                isWarning: false
            };

            const showNoticeData: NoticeModel = {
                message: 'show.notice',
                duration: 6000,
                isWarning: true
            };

            const { setNotice, clearNotice, showNotice } = useTestStore.getState();

            // Initial state
            expect(useTestStore.getState().notice).toBeNull();

            // Set notice
            setNotice(setNoticeData);
            expect(useTestStore.getState().notice).toEqual(setNoticeData);

            // Clear notice
            clearNotice();
            expect(useTestStore.getState().notice).toBeNull();

            // Show notice
            showNotice(showNoticeData);
            expect(useTestStore.getState().notice).toEqual(showNoticeData);
        });

        it('should maintain notice state independently', () => {
            const notice1: NoticeModel = {
                message: 'notice.one',
                duration: 1000,
                isWarning: false
            };

            const notice2: NoticeModel = {
                message: 'notice.two',
                duration: 2000,
                isWarning: true
            };

            // Create a second store instance to test isolation
            const useTestStore2 = create<NoticeSlice>()((...args) => ({
                ...createNoticeSlice(...args),
            }));

            const { setNotice } = useTestStore.getState();
            const { setNotice: setNotice2 } = useTestStore2.getState();

            // Set different notices in each store
            setNotice(notice1);
            setNotice2(notice2);

            // Verify they are independent
            expect(useTestStore.getState().notice).toEqual(notice1);
            expect(useTestStore2.getState().notice).toEqual(notice2);
        });
    });

    describe('edge cases', () => {
        it('should handle notice with empty message', () => {
            const emptyMessageNotice: NoticeModel = {
                message: '',
                duration: 1000,
                isWarning: false
            };

            const { setNotice } = useTestStore.getState();

            setNotice(emptyMessageNotice);

            const { notice } = useTestStore.getState();
            expect(notice).toEqual(emptyMessageNotice);
        });

        it('should handle notice with zero duration', () => {
            const zeroDurationNotice: NoticeModel = {
                message: 'zero.duration',
                duration: 0,
                isWarning: false
            };

            const { setNotice } = useTestStore.getState();

            setNotice(zeroDurationNotice);

            const { notice } = useTestStore.getState();
            expect(notice).toEqual(zeroDurationNotice);
        });
    });
});
