import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCommonTranslate } from '@shared/react-hooks/use-translator';
import BackgroundComet from '@shared/components/page-components/background-error';
import ButtonReturnToURL from '@shared/components/page-components/button-return-to-url';
import { clearSession } from '@shared/services/auth-service';

const TimeOut = () => {
    const { t } = useCommonTranslate();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
        clearSession();

        (async () => {
            const audioContext: AudioContext = global.Howler?.ctx;
            audioContext && await audioContext.close();
        })();
    }, [router.isReady]);

    if (isLoading) {
        return <></>;
    }
    return (
        <div className="error-page">
            <div className="um-background">
                <div className="star-bg" />
                <div className="planet-center" />
            </div>
            <BackgroundComet />
            <div className="timeout-spaceman" />
            <p className="errorOccurred-info mt-2 break">{t("message_session_timeout_break")}</p>
            <ButtonReturnToURL />
        </div>
    );
};

export default TimeOut;
