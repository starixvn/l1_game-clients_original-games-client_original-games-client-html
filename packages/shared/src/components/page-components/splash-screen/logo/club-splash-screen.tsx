import Image from "next/image";
import Styles from "../splash-screen.module.scss";
import { BASE_PATH } from "@shared/constants/base-path";
import { useRandomWaitingMessage } from "@shared/react-hooks/use-random-waiting-message";
import { cn } from "@shared/utils";
import { memo } from "react";
const logoMapper = {
    VG: { logo: "logo-vgaming", text: "splash_text_", poweredBy: "" },
    SG: { logo: "logo-saba", text: "splash_text_", poweredBy: "powered_by" },
    SP: { logo: "logo-sabaplay", text: "slogan-sabaplay-", poweredBy: "" },
    TIP88: { logo: "logo-tip88", text: "splash_text_", poweredBy: "" },
};
interface ClubSplashScreenProps {
    preloadProgress: number;
    operator: string;
    locale: string;
}

const ClubSplashScreen = ({ locale = "en", preloadProgress, operator }: ClubSplashScreenProps) => {
    const config = logoMapper[operator];
    if (!config) {
        return null;
    }

    return (
        <div className="flex flex-col w-full h-full items-center justify-end relative">
            <div className={cn("flex flex-col w-full h-full items-center justify-center relative", Styles[`logo-${operator}`])}>
                <Image
                    src={`${BASE_PATH}/static/images/splash-screen/${config.logo}.webp`}
                    alt="logo"
                    width="0"
                    height="0"
                    className={Styles["logo"]}
                    priority
                />
                <Image
                    src={`${BASE_PATH}/static/images/splash-screen/splash-text/${config.text + locale}.webp`}
                    alt="text"
                    width="0"
                    height="0"
                    className="w-[300px] h-auto"
                />
                <Image
                    className={Styles["loading-bar"]}
                    src={`${BASE_PATH}/static/images/splash-screen/loading-bar-sabaplay.gif`}
                    alt="loading-bar"
                    width="0"
                    height="0"
                />
                <p
                    className={"text-first-download text-sm md:text-base mt-[20px] font-semibold text-[#C1D8C3]"}
                    data-testid="download-message"
                >
                    {preloadProgress > 0 && preloadProgress < 100 && <span> {Math.floor(preloadProgress)}%</span>}
                </p>
            </div>
            {config.poweredBy && (
                <Image
                    className="absolute w-[100px] bottom-[120px] h-auto"
                    src={`${BASE_PATH}/static/images/splash-screen/${config.poweredBy}.webp`}
                    alt="power-by"
                    width="0"
                    height="0"
                />
            )}
            <WaitingMessage locale={locale} />
        </div>
    );
};

interface WaitingMessageProps {
    locale: string;
}
const WaitingMessage = ({ locale }: WaitingMessageProps) => {
    const { message, isVisible, isFadingOut, className } = useRandomWaitingMessage({
        locale: locale,
        interval: 5000,
        showDuration: 4000,
    });

    const messageClassName = [Styles["waiting-message"], isVisible && Styles.show, isFadingOut && Styles["fade-out"], className]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={`${messageClassName} text-[#C1D8C3]`} id="waiting-message">
            {message}
        </div>
    );
};

export default memo(ClubSplashScreen);
