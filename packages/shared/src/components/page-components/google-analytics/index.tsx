import Script from "next/script";
import { getAppSettings } from "../../../_shared/app-settings";

export function GoogleAnalytic() {
    if (getAppSettings().googleAnalyticId === null) {
        return <></>;
    }

    return (
        <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${getAppSettings().googleAnalyticId}`}></Script>
            <Script
                id="google-analytic-script"
                dangerouslySetInnerHTML={{
                    __html: `
                            globalThis.dataLayer = globalThis.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${getAppSettings().googleAnalyticId}', {
                            page_path: globalThis.location.pathname,
                            });
                        `,
                }}
            />
        </>
    );
}
