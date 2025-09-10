import { usePlayerContext } from "../react-contexts";
import { useGlobalEventsStore } from "../stores/global-events-store/global-events-store";

export const useBalance = () => {
    const { authorizeInfo } = usePlayerContext();
    const userInfoRed = useGlobalEventsStore((state) => state.userInfoRed);

    return userInfoRed !== null ? userInfoRed : authorizeInfo?.user?.red || 0;
};
