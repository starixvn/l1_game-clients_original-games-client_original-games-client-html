import { useState, useEffect, useRef } from "react";

export const useLightningKeyTooltip = (isLightningMode: boolean) => {
    const [forceShowTooltip, setForceShowTooltip] = useState(false);
    const forceShowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const prevIsLightningModeRef = useRef(isLightningMode);

    useEffect(() => {
        const prevIsLightningMode = prevIsLightningModeRef.current;
        prevIsLightningModeRef.current = isLightningMode;
        if (!prevIsLightningMode && isLightningMode) {
            setForceShowTooltip(true);
            if (forceShowTimeoutRef.current) {
                clearTimeout(forceShowTimeoutRef.current);
            }
            forceShowTimeoutRef.current = setTimeout(() => {
                setForceShowTooltip(false);
            }, 3000);
        }
    }, [isLightningMode]);

    useEffect(() => {
        return () => {
            if (forceShowTimeoutRef.current) {
                clearTimeout(forceShowTimeoutRef.current);
            }
        };
    }, []);

    return forceShowTooltip;
};
