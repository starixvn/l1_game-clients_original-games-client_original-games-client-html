import { modalStackManager, useModalStack } from '../modal-stack-manager';

describe('ModalStackManager', () => {
    beforeEach(() => {
        modalStackManager.clear();
    });

    describe('addModal', () => {
        it('should add a modal with incremental ID', () => {
            const onClose1 = jest.fn();
            const onClose2 = jest.fn();

            modalStackManager.addModal(onClose1);
            modalStackManager.addModal(onClose2);

            const topModal = modalStackManager.getTopModal();
            expect(topModal?.id).toBe(2); // Higher ID comes first due to sorting
            expect(topModal?.onClose).toBe(onClose2);
        });

        it('should sort modals by ID descending', () => {
            const onClose1 = jest.fn();
            const onClose2 = jest.fn();
            const onClose3 = jest.fn();

            modalStackManager.addModal(onClose1); // ID: 1
            modalStackManager.addModal(onClose2); // ID: 2
            modalStackManager.addModal(onClose3); // ID: 3

            expect(modalStackManager.getTopModal()?.id).toBe(3);
            expect(modalStackManager.getTopModal()?.onClose).toBe(onClose3);
        });
    });

    describe('removeModal', () => {
        it('should remove the top modal', () => {
            const onClose1 = jest.fn();
            const onClose2 = jest.fn();

            modalStackManager.addModal(onClose1);
            modalStackManager.addModal(onClose2);

            expect(modalStackManager.getTopModal()?.id).toBe(2);
            modalStackManager.removeModal();
            expect(modalStackManager.getTopModal()?.id).toBe(1);
        });

        it('should handle removing from empty stack', () => {
            expect(() => modalStackManager.removeModal()).not.toThrow();
            expect(modalStackManager.getTopModal()).toBeNull();
        });
    });

    describe('getTopModal', () => {
        it('should return null when no modals exist', () => {
            expect(modalStackManager.getTopModal()).toBeNull();
        });

        it('should return the modal with highest ID', () => {
            const onClose1 = jest.fn();
            const onClose2 = jest.fn();

            modalStackManager.addModal(onClose1);
            modalStackManager.addModal(onClose2);

            const topModal = modalStackManager.getTopModal();
            expect(topModal?.id).toBe(2);
            expect(topModal?.onClose).toBe(onClose2);
        });
    });

    describe('closeTopModal', () => {
        it('should call onClose of top modal and remove it', () => {
            const onClose1 = jest.fn();
            const onClose2 = jest.fn();

            modalStackManager.addModal(onClose1);
            modalStackManager.addModal(onClose2);

            modalStackManager.closeTopModal();

            expect(onClose2).toHaveBeenCalledTimes(1);
            expect(modalStackManager.getTopModal()?.id).toBe(1);
        });

        it('should handle closing when no modals exist', () => {
            expect(() => modalStackManager.closeTopModal()).not.toThrow();
            expect(modalStackManager.getTopModal()).toBeNull();
        });
    });

    describe('clear', () => {
        it('should remove all modals', () => {
            const onClose1 = jest.fn();
            const onClose2 = jest.fn();

            modalStackManager.addModal(onClose1);
            modalStackManager.addModal(onClose2);

            expect(modalStackManager.getTopModal()).not.toBeNull();

            modalStackManager.clear();

            expect(modalStackManager.getTopModal()).toBeNull();
        });
    });
});

describe('useModalStack', () => {
    it('should return modal stack methods bound to the singleton instance', () => {
        const modalStack = useModalStack();

        expect(typeof modalStack.addModal).toBe('function');
        expect(typeof modalStack.removeModal).toBe('function');
        expect(typeof modalStack.closeTopModal).toBe('function');
    });

    it('should use the singleton modalStackManager instance', () => {
        const modalStack = useModalStack();
        const onClose = jest.fn();

        modalStack.addModal(onClose);

        expect(modalStackManager.getTopModal()?.onClose).toBe(onClose);
    });
});
