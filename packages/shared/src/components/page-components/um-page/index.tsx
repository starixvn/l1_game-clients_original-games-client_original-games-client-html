import { Markup } from "interweave";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { UMInfo } from "sc-user-service-client/dist/auth";
import { StorageHelper, localStorageKeys } from '@shared/merged/_shared/helpers/storage-helper';
import { convertToGMT8, formatDate } from '@shared/merged/_shared/helpers/time-helper';
import { useTranslator } from '@shared/merged/_shared/react-hooks/use-translator';
import { ResourceTypes } from '@shared/merged/_shared/resources';
import ButtonReturnToURL from "../button-return-to-url";
import BackgroundComet from "../background-error";

const UMPage: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslator();
    const [startTime, setStartTime] = useState<string>(null);
    const [endTime, setEndTime] = useState<string>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (router.isReady) {
            const template = "hh:mm dd/MM/yyyy";
            const umInfo = StorageHelper.get<UMInfo>(localStorageKeys.umInfo);

            if (umInfo) {
                setStartTime(formatDate(convertToGMT8(new Date(umInfo.startTime)), template));
                setEndTime(formatDate(convertToGMT8(new Date(umInfo.endTime)), template));
            }

            setIsLoading(false);
        }
    }, [router]);

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
            <div className="um-spaceman" />
            <p className="um-title">
                {t(`${ResourceTypes.COMMON}.message_sys_maintenance`)} <br /> {t(`${ResourceTypes.SABA_NUMBER}.message_um_title`)}
            </p>
            <p className="highlight break">
                <Markup
                    content={t(`${ResourceTypes.SABA_NUMBER}.message_um_content`, { startTime, endTime }).replaceTolgeeFormat()}
                ></Markup>
            </p>
            <p>{t(`${ResourceTypes.COMMON}.under_maintenance_suggest`)}</p>
            <ButtonReturnToURL />
        </div>
    );
};

export default UMPage;
