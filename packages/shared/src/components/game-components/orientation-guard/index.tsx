import { useEffect, useState } from "react";
import Image from "next/image";
import { buildVersion } from "@shared/constants";
import { useCommonTranslate } from "@shared/react-hooks";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const OrientationGuard = ({ children }: { children: React.ReactNode }) => {
    const [isLandscape, setIsLandscape] = useState(false);
    const { t } = useCommonTranslate();
  
    useEffect(() => {
      const check = () => {
        setIsLandscape(globalThis.window.matchMedia("(orientation: landscape)").matches);
      };
  
      check();
      globalThis.window.addEventListener("resize", check);
      globalThis.window.addEventListener("orientationchange", check);
      return () => {
        globalThis.window.removeEventListener("resize", check);
        globalThis.window.removeEventListener("orientationchange", check);
      };
    }, []);
  
    if (isLandscape) {
      return (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center z-9999 text-center"
        >
            <Image src={`${basePath}/static/images/icons/icon-rotate.webp?v=${buildVersion}`} alt="icon-rotate" width={100} height={100} />
          <p className="text-white text-lg font-semibold">{t("message_rotate_device")}</p>
        </div>
      );
    }
  
    return <>{children}</>;
};

export default OrientationGuard;
  