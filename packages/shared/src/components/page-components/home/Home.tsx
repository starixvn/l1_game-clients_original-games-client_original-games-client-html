import { memo } from "react";
import dynamic from "next/dynamic";

const SplashScreen = dynamic(() => import("@shared/components/page-components/splash-screen"), { ssr: false });

const Home = () => {
    // Add any game-specific logic here if needed
    // For now, this is identical across games

    return <SplashScreen />;
};

export default memo(Home);
