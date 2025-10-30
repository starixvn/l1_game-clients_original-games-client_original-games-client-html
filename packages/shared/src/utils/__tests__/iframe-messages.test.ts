import { IFRAME_MESSAGES, sendMessageToParent, sendBalanceUpdateToParent } from '../iframe-messages';

describe('IFRAME_MESSAGES', () => {
    it('should have correct message constants', () => {
        expect(IFRAME_MESSAGES.BACK_TO_ORIGINAL_PAGE).toBe('backToOriginalPage');
        expect(IFRAME_MESSAGES.BALANCE_UPDATE).toBe('balanceUpdate');
    });
});

describe('sendMessageToParent', () => {
    const originalWindow = global.window;
    let mockPostMessage: jest.Mock;

    beforeEach(() => {
        mockPostMessage = jest.fn();
        // Properly mock window.parent using Object.defineProperty
        Object.defineProperty(global.window, 'parent', {
            value: {
                postMessage: mockPostMessage,
            },
            writable: true,
        });
    });

    afterEach(() => {
        // Restore original window.parent
        Object.defineProperty(global.window, 'parent', {
            value: originalWindow.parent,
            writable: true,
        });
        jest.clearAllMocks();
    });

    it('should send message to parent window when parent exists and is different', () => {
        const action = 'testAction';
        const payload = { data: 'test' };

        sendMessageToParent(action, payload);

        expect(mockPostMessage).toHaveBeenCalledWith({ action, payload }, '*');
    });

    it('should not send message when parent window is the same as current window', () => {
        (global.window as any).parent = global.window;

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        sendMessageToParent('testAction');

        expect(mockPostMessage).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith('No parent window found - not running in iframe');

        consoleSpy.mockRestore();
    });

    it('should handle errors when posting message', () => {
        mockPostMessage.mockImplementation(() => {
            throw new Error('Post message failed');
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        sendMessageToParent('testAction');

        expect(consoleSpy).toHaveBeenCalledWith('Error sending message to parent:', expect.any(Error));

        consoleSpy.mockRestore();
    });

    it('should handle missing payload', () => {
        sendMessageToParent('testAction');

        expect(mockPostMessage).toHaveBeenCalledWith({ action: 'testAction', payload: undefined }, '*');
    });
});

describe('sendBalanceUpdateToParent', () => {
    const originalWindow = global.window;
    let mockPostMessage: jest.Mock;

    beforeEach(() => {
        mockPostMessage = jest.fn();
        // Properly mock window.parent using Object.defineProperty
        Object.defineProperty(global.window, 'parent', {
            value: {
                postMessage: mockPostMessage,
            },
            writable: true,
        });
    });

    afterEach(() => {
        // Restore original window.parent
        Object.defineProperty(global.window, 'parent', {
            value: originalWindow.parent,
            writable: true,
        });
        jest.clearAllMocks();
    });

    it('should send balance update with valid balance and currency', () => {
        const balance = 1000;
        const userInfo = { currency: 'USD' };

        sendBalanceUpdateToParent(balance, userInfo);

        expect(mockPostMessage).toHaveBeenCalledWith({
            action: IFRAME_MESSAGES.BALANCE_UPDATE,
            payload: { balance: 1000, currency: 'USD' }
        }, '*');
    });

    it('should use empty string for currency when userInfo is not provided', () => {
        const balance = 500;

        sendBalanceUpdateToParent(balance);

        expect(mockPostMessage).toHaveBeenCalledWith({
            action: IFRAME_MESSAGES.BALANCE_UPDATE,
            payload: { balance: 500, currency: '' }
        }, '*');
    });

    it('should not send message for invalid balance values', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        sendBalanceUpdateToParent(NaN);
        sendBalanceUpdateToParent(-100);
        sendBalanceUpdateToParent('invalid' as any);

        expect(mockPostMessage).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledTimes(3);

        consoleSpy.mockRestore();
    });


    it('should accept zero balance', () => {
        sendBalanceUpdateToParent(0);

        expect(mockPostMessage).toHaveBeenCalledWith({
            action: IFRAME_MESSAGES.BALANCE_UPDATE,
            payload: { balance: 0, currency: '' }
        }, '*');
    });
});
