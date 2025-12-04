import ClubSplashScreen from "./club-splash-screen";
import OriginalSplashScreen from "./original-splash-screen";

interface SplashScreenProps {
    operator: string;
    locale: string;
    t: any;
    preloadProgress: number;
}

const SplashScreen = ({ operator, locale, t, preloadProgress }: SplashScreenProps) => {
    switch (operator) {
        case "SP":
        case "VG":
        case "SG":
        case "TIP88":
            return <ClubSplashScreen operator={operator} locale={locale} preloadProgress={preloadProgress} />;
        default:
            return <OriginalSplashScreen operator={operator} t={t} preloadProgress={preloadProgress} />;
    }
};

export default SplashScreen;
