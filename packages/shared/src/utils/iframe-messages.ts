export const IFRAME_MESSAGES = {
    BACK_TO_ORIGINAL_PAGE: "backToOriginalPage",
    BALANCE_UPDATE: "balanceUpdate",
} as const;

export interface BalanceUpdatePayload {
    balance: number;
    currency: string;
}

export const sendMessageToParent = (action: string, payload?: any): void => {
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ action, payload }, "*");
        } else {
            console.warn("No parent window found - not running in iframe");
        }
    } catch (error) {
        console.error("Error sending message to parent:", error);
    }
};


export const sendBalanceUpdateToParent = (balance: number, userInfo?: any): void => {
    try {
        if (typeof balance !== 'number' || isNaN(balance) || balance < 0) {
            console.warn("Invalid balance value, not sending to parent:", balance);
            return;
        }

        const currency = userInfo?.currency || "";
        const payload: BalanceUpdatePayload = { balance, currency };

        sendMessageToParent(IFRAME_MESSAGES.BALANCE_UPDATE, payload);
    } catch (error) {
        console.error("Error sending balance update to parent:", error);
    }
};
