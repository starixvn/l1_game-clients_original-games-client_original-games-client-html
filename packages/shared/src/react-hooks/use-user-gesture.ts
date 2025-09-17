import { addMultipleEventListeners } from "@shared/helpers/event-listener-helper";
import { useEffect, useState } from "react";

export const useUserGesture = () => {
    const [isUserGesture, setIsUserGesture] = useState(false);

    useEffect(() => {
        const onChangeGesture = () => {
            setIsUserGesture(!document.hidden);
        };

        const onAllowGesture = () => {
            setIsUserGesture(true);
        };

        // Listen for user interaction events
        const events = ["scroll", "touchstart", "click", "keydown", "mousedown"];
        const removeEventListeners = addMultipleEventListeners(document, events, onAllowGesture, { passive: true });

        // Listen for visibility changes
        document.addEventListener("visibilitychange", onChangeGesture);

        return () => {
            removeEventListeners();
            document.removeEventListener("visibilitychange", onChangeGesture);
        };
    }, []);

    return isUserGesture;
};