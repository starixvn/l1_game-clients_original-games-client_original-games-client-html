import { useEffect, useState } from "react";
import Image from "next/image";
import { buildVersion } from "@shared/constants";
import { useCommonTranslate } from "@shared/react-hooks";
import { isMobile } from "react-device-detect";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const OrientationGuard = ({ children }: { children: React.ReactNode }) => {
    const [isLandscapeOnMobile, setIsLandscapeOnMobile] = useState(false);
    const { t } = useCommonTranslate();

    useEffect(() => {
        const check = () => {
            const isLandscape = globalThis.window.matchMedia("(orientation: landscape)").matches;

            setIsLandscapeOnMobile(isMobile && isLandscape);
        };
        check();
        globalThis.window.addEventListener("resize", check);
        globalThis.window.addEventListener("orientationchange", check);
        globalThis.window.addEventListener("touchmove", preventZoomBehavior, { passive: false });
        return () => {
            globalThis.window.removeEventListener("resize", check);
            globalThis.window.removeEventListener("orientationchange", check);
            globalThis.window.removeEventListener("touchmove", preventZoomBehavior);
        };
    }, []);

    const preventZoomBehavior = (event: TouchEvent) => {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };

    if (isLandscapeOnMobile) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center z-9999 text-center">
                <Image
                    src={`${basePath}/static/images/icons/icon-rotate.webp?v=${buildVersion}`}
                    alt="icon-rotate"
                    width={100}
                    height={100}
                />
                <p className="text-white text-lg font-semibold">{t("message_rotate_device")}</p>
            </div>
        );
    }

    return <>{children}</>;
};

export default OrientationGuard;
