import { getProviderInstance } from "@tolgee/react";
import { ComponentClass, ReactNode, createElement } from "react";
import { parseTranslationKey } from '@shared/merged/_shared/react-hooks';

export type TranslatorProps = {
    t?: (key: string) => string;
};

export function withTranslator(component: ComponentClass<any>) {
    const { Consumer } = getProviderInstance();

    return function Translator(props: any, ...children: ReactNode[]) {
        return (
            <Consumer>
                {({ tolgee }) => {
                    const t = (key: string) => {
                        const { key: parsedKey, ns } = parseTranslationKey(key);

                        return tolgee.t(parsedKey, { ns });
                    };

                    return createElement(component, { ...props, t }, children);
                }}
            </Consumer>
        );
    };
}
