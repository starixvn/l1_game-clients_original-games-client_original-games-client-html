import { memo } from "react";
import Image from "next/image";
import FadeContent from "../fade-content";
import { BASE_PATH } from "@shared/constants/base-path";
import Styles from "../splash-screen.module.scss";
interface OriginalSplashScreenProps {
    t: any;
    preloadProgress: number;
    operator: string;
}
const OriginalSplashScreen = ({ t, preloadProgress, operator }: OriginalSplashScreenProps) => {
    return (
        <div className={Styles.page} data-testid="splash-screen">
            <FadeContent blur={true} duration={200} easing="ease-out" initialOpacity={0}>
                <div className={Styles["center"]}>
                    <Logo operator={operator} />
                </div>
            </FadeContent>

            <div className={"loading"}>
                <div className={"progress"}>
                    <div
                        className={"progress-bar"}
                        id="progress-bar"
                        data-testid="progress-bar"
                        style={{ width: `${preloadProgress}%` }}
                    ></div>
                </div>
                <p className={"text-first-download"} data-testid="download-message">
                    {t("Common.message_download_first_visit")}
                    {preloadProgress > 0 && preloadProgress < 100 && <span> ({Math.floor(preloadProgress)}%)</span>}
                </p>
            </div>
        </div>
    );
};
const logoMapper = {
    "12BET": "logo-12bet",
    NOVA88: "logo-nova88",
};
const Logo = ({ operator }: { operator: string }) => {
    const logo = logoMapper[operator];
    if (!logo) {
        return null;
    }
    return (
        <div className={Styles[`logo-${operator}`]}>
            <Image
                className={`mx-auto ${Styles["logo"]}`}
                src={`${BASE_PATH}/static/images/splash-screen/${logo}.webp`}
                alt="power-by"
                width="0"
                height="0"
            />
        </div>
    );
};
export default memo(OriginalSplashScreen);
