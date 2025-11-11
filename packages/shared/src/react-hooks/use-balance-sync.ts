import { useEffect, useRef, useMemo } from "react";
import { sendBalanceUpdateToParent } from "../utils/iframe-messages";
import { usePlayerContext } from "../react-contexts/auth";
import { useGlobalEventsStore } from "../stores/global-events-store/global-events-store";
import { getBalance } from "@shared/services/auth-service";

export const useBalanceSync = () => {
    const { session, authorizeInfo } = usePlayerContext();
    const userInfoRed = useGlobalEventsStore((state) => state.userInfoRed);

    // Track last sent values to avoid duplicate messages
    const lastBalanceRef = useRef<number | null>(null);
    const getBalanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const getBalanceTimeout = 1000;

    const userInfo = useMemo(
        () => ({
            ...authorizeInfo?.user,
            red: userInfoRed !== null ? userInfoRed : authorizeInfo?.user?.red || 0,
        }),
        [authorizeInfo?.user, userInfoRed]
    );

    const updateBalance = (balance: number) => {
        if (lastBalanceRef.current !== balance) {
            sendBalanceUpdateToParent(balance, userInfo);
            lastBalanceRef.current = balance;
        }
    };

    // Send balance updates to parent when they change
    useEffect(() => {
        if (!userInfo) {
            return () => {};
        }

        try {
            // Handle balance updates
            const balance = userInfo.red;
            if (balance !== undefined && balance !== null && balance >= 0) {
                updateBalance(balance);
            }
        } catch (error) {
            console.error("Error sending balance update to parent:", error);
        }

        return () => {};
    }, [userInfo]);

    const pollBalance = async () => {
        try {
            const balanceResponse = await getBalance(session);
            if (balanceResponse?.isSuccessful && balanceResponse?.balance !== undefined && balanceResponse.balance >= 0) {
                updateBalance(balanceResponse.balance);
            } else if (balanceResponse && !balanceResponse.isSuccessful) {
                console.warn("Balance API call failed:", balanceResponse.errorCode);
            }
        } catch (error) {
            console.warn("Failed to poll balance:", error);
        }
    };

    // Set up polling for balance updates as fallback
    useEffect(() => {
        if (!session || !userInfo) {
            return () => {};
        }

        // Initial poll
        getBalanceTimeoutRef.current && clearTimeout(getBalanceTimeoutRef.current);
        getBalanceTimeoutRef.current = setTimeout(pollBalance, getBalanceTimeout);

        // Cleanup function
        return () => {
            if (getBalanceTimeoutRef.current) {
                clearTimeout(getBalanceTimeoutRef.current);
                getBalanceTimeoutRef.current = null;
            }
        };
    }, [session, userInfo]);
};

export default useBalanceSync;
