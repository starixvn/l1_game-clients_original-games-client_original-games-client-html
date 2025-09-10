import React from "react";
import { getExtendMessageByErrorCode } from '@shared/merged/_shared/helpers';
import { useTranslator } from '@shared/merged/_shared/react-hooks';

export const ErrorApiText: React.FC<{ errorMessage: string; errorCode: string }> = ({ errorMessage, errorCode }) => {
    const { t } = useTranslator();
    return (
        <>
            {t(errorMessage, { errorCode }).replaceTolgeeFormat()}
            {getExtendMessageByErrorCode(errorCode)}
        </>
    );
};
