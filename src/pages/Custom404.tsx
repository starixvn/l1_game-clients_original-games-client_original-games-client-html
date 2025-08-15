import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCommonTranslate } from "../_shared/react-hooks/use-translator";
import BackgroundComet from "../components/page-components/background-error";

const Custom404 = () => {
    const { t } = useCommonTranslate();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, [router.isReady]);

    if (isLoading) {
        return <></>;
    }

    return (
        <div className="error-page page-404">
            <div className="um-background">
                <div className="star-bg" />
                <div className="planet-center" />
                <div className="number-4 number-4-left" />
                <div className="number-4 number-4-right" />
            </div>
            <BackgroundComet />
            <p className="errorOccurred-info">{t("message_error_occurred", { errorCode: 404 }).replaceTolgeeFormat()}</p>
        </div>
    );
};

export default Custom404;
