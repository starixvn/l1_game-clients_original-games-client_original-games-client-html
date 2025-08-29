export const IFRAME_MESSAGES = {
    BACK_TO_ORIGINAL_PAGE: "backToOriginalPage",
} as const;

export const sendMessageToParent = (action: string, payload?: any): void => {
    try {
        if (window.parent && window.parent !== window) {
            const message = { action, payload };
            window.parent.postMessage(message, "*");
        } else {
            console.warn("No parent window found - not running in iframe");
        }
    } catch (error) {
        console.error("Error sending message to parent:", error);
    }
}