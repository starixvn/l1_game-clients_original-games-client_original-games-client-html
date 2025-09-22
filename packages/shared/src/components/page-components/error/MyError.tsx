import * as Sentry from "@sentry/nextjs";
import { NextPageContext } from "next";
import { useTheme } from "next-themes";
import NextErrorComponent from "next/error";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { buildVersion } from "@shared/constants";
import { useCommonTranslate } from "@shared/react-hooks";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const MyError = ({ statusCode, hasGetInitialPropsRun, err }) => {
    if (!hasGetInitialPropsRun && err) {
        Sentry.captureException(err);
    }
    const { t } = useCommonTranslate();
    const router = useRouter();
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, [router.isReady]);

    if (isLoading) {
        return <></>;
    }

    return (
        <div className="error-page">
            <img className="error-background small" src={`${basePath}/static/images/error-${theme}.svg?v=${buildVersion}`} alt="error" />
            <p className="info">{t("message_error_occurred", { errorCode: statusCode }).replaceTolgeeFormat()}</p>
        </div>
    );
};

MyError.getInitialProps = async (context: NextPageContext) => {
    const initialProps = await NextErrorComponent.getInitialProps(context);

    const errorInitialProps = {
        ...initialProps,
        hasGetInitialPropsRun: true,
    };

    context.err
        ? Sentry.captureException(context.err)
        : Sentry.captureException(new Error(`_error.js getInitialProps missing data at path: ${context.asPath}`));

    await Sentry.flush(2000);

    return errorInitialProps;
};

export default MyError;
