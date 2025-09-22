import { memo } from "react";
import SplashScreen from "@shared/components/page-components/splash-screen";

const Home = () => {
    // Add any game-specific logic here if needed
    // For now, this is identical across games

    return <SplashScreen />;
};

export default memo(Home);
