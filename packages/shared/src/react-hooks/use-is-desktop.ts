import { useEffect, useState } from "react";

export const useIsDesktop = (): boolean => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkViewport = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        checkViewport();
        window.addEventListener("resize", checkViewport);

        return () => window.removeEventListener("resize", checkViewport);
    }, []);

    return isDesktop;
};
