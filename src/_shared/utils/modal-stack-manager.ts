interface ModalInfo {
    id: number;
    onClose: () => void;
}

class ModalStackManager {
    private modals: ModalInfo[] = [];
    private nextId = 0;


    addModal(onClose: () => void): number {
        const id = this.nextId++;
        
        this.modals.push({
            id,
            onClose,
        });
        
        this.modals.sort((a, b) => b.id - a.id);
        return id;
    }

    removeModal(): void {
        this.modals.shift();
    }

    getTopModal(): ModalInfo | null {
        return this.modals[0] || null;
    }

    closeTopModal(): void {
        const topModal = this.getTopModal();
        if (topModal) {
            topModal.onClose();
            this.removeModal();
        }
    }

    clear(): void {
        this.modals = [];
    }
}

export const modalStackManager = new ModalStackManager();

export const useModalStack = () => {
    return {
        addModal: modalStackManager.addModal.bind(modalStackManager),
        removeModal: modalStackManager.removeModal.bind(modalStackManager),
        closeTopModal: modalStackManager.closeTopModal.bind(modalStackManager),
    };
};
