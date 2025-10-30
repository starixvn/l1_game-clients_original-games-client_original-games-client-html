type EventOptions = boolean | AddEventListenerOptions;

export const addMultipleEventListeners = (
    element: Document | HTMLElement,
    events: string[],
    handler: EventListener,
    options?: EventOptions
): () => void => {
    events.forEach(event => element.addEventListener(event, handler, options));

    return () => {
        events.forEach(event => element.removeEventListener(event, handler, options));
    };
};
