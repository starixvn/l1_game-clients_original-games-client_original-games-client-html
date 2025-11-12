import { localStorageKeys, StorageHelper } from "./storage-helper";
import { languageMapper, locales } from "../constants";

/**
 * Gets operator from query parameter or localStorage
 * Query parameter takes precedence and is converted to uppercase
 * @param queryOperator - operator from URL query parameter
 * @returns uppercase operator string or localStorage value
 */
export const getOperator = (queryOperator?: string): string | null => {
    if (queryOperator) {
        const operator = queryOperator.toUpperCase();
        StorageHelper.set(localStorageKeys.operator, operator);

        return operator;
    }

    return StorageHelper.get(localStorageKeys.operator);
};

export const getLanguage = (queryLanguage?: string): string => {
    if (queryLanguage) {
        const language = languageMapper[queryLanguage.toLowerCase()];
        StorageHelper.set(localStorageKeys.language, language);
        return language;
    }

    return StorageHelper.get(localStorageKeys.language) || locales.en;
};
