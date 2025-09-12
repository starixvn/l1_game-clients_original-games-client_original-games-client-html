import { memo } from "react";

import { useRouter } from "next/router";
import { usePWAWoker } from "@shared/react-hooks/use-pwa-worker";
import SplashScreen from "@shared/components/page-components/splash-screen";

const Home = () => {
    usePWAWoker();
    const router = useRouter();

    if (!router?.isReady || typeof window === "undefined") {
        return <div></div>;
    }

    return <SplashScreen />;
};

export default memo(Home);
