import React, { useMemo } from "react";
import { numberRoundDownWithCommas } from "../../../../_shared/helpers/number-helper";
import { usePlayerContext } from "../../../../_shared/react-contexts";
import { useGlobalEventsStore } from "../../../../_shared/stores/global-events-store/global-events-store";
import styles from "./user-info.module.scss";

export const UserInfo: React.FC<{
    customizeClass?: string;
}> = ({ customizeClass }) => {
    const { authorizeInfo } = usePlayerContext();
    const userInfoRed = useGlobalEventsStore((state) => state.userInfoRed);

    // Use userInfoRed from store if available, otherwise use from authorizeInfo
    const userInfo = {
        ...authorizeInfo?.user,
        red: userInfoRed !== null ? userInfoRed : authorizeInfo?.user?.red || 0,
    };

    return (
        <div className={`${customizeClass}`} data-testid="balance">
            <span id="user-info_balance" className={`${styles.balanceContainer}`}>
                <UserAmount amount={userInfo?.red || 0} />
                <UserCurrency currency={userInfo.currency} isDisplayPlayerCurrency={userInfo.isDisplayPlayerCurrency} />
            </span>
        </div>
    );
};

const UserAmount: React.FC<{ amount: number }> = ({ amount }) => {
    return useMemo(() => {
        return (
            <>
                <span data-testid="amount" className="font-semibold text-base leading-[26px]">{numberRoundDownWithCommas(amount)}</span>
                <span>{` `}</span>
            </>
        );
    }, [amount]);
};

const UserCurrency: React.FC<{ currency: string; isDisplayPlayerCurrency: boolean }> = ({ currency, isDisplayPlayerCurrency }) => {
    return useMemo(() => {
        if (!isDisplayPlayerCurrency) {
            return <></>;
        }

        return <span data-testid="currency" className="font-semibold text-base leading-[26px]">{currency}</span>;
    }, [currency, isDisplayPlayerCurrency]);
};

export default UserInfo;
