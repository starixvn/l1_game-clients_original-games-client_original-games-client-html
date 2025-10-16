import { useEffect, useCallback } from "react";
import { useSettingStore } from "@shared/stores/setting-store";

interface UseHotKeyOptions {
    onSpaceKey?: () => void;
    onDKey?: () => void;
    onSKey?: () => void;
    onAKey?: () => void;
    isEnabled?: boolean;
}

export const useHotKey = ({
    onSpaceKey,
    onDKey,
    onSKey,
    onAKey,
    isEnabled = true,
}: UseHotKeyOptions) => {
    const isToggleHotKey = useSettingStore((state) => state.isToggleHotKey);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!isEnabled || !isToggleHotKey) return;

            const target = event.target as HTMLElement;
            const isInputElement = 
                target.tagName === "INPUT" || 
                target.tagName === "TEXTAREA" || 
                target.contentEditable === "true" ||
                target.isContentEditable;

            if (isInputElement) return;

            if (event.code === "Space" || event.key === "d" || event.key === "D" || event.key === "s" || event.key === "S" || event.key === "a" || event.key === "A") {
                event.preventDefault();
            }

            switch (event.code) {
                case "Space":
                    onSpaceKey?.();
                    break;
                case "KeyD":
                    onDKey?.();
                    break;
                case "KeyS":
                    onSKey?.();
                    break;
                case "KeyA":
                    onAKey?.();
                    break;
                default:
                    break;
            }
        },
        [isEnabled, isToggleHotKey, onSpaceKey, onDKey, onSKey, onAKey]
    );

    useEffect(() => {
        if (!isEnabled || !isToggleHotKey) return;

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown, isEnabled, isToggleHotKey]);
};
