import { useEffect } from "react";

export const useClickOutside = (refs: React.RefObject<HTMLElement>[], callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (refs.every((ref) => ref.current && !ref.current.contains(event.target as Node))) {
                callback();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [refs, callback]);
};
