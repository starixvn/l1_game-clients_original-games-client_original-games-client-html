import { isAndroid, isIOS, osVersion } from "react-device-detect";

export const useLowPerformanceDevice = () => {
    const isLowPerformanceIOS = isIOS && +osVersion < 17;
    return isAndroid || isLowPerformanceIOS;
};
