import React, { useEffect, useMemo, useState } from "react";
import { User } from "sc-user-service-client/dist/auth";
import {
    GlobalTransmitterEvent,
    registerGlobalMessageEvent,
    unsubscribeGlobalMessageEvent,
} from "../../../../_shared/helpers/message-transmitter/global-transmitter";
import { numberRoundDownWithCommas } from "../../../../_shared/helpers/number-helper";
import { usePlayerContext } from "../../../../_shared/react-contexts";

export const UserInfo: React.FC<{
    customizeClass?: string;
}> = ({ customizeClass }) => {
    const { authorizeInfo } = usePlayerContext();
    const [userInfo, setUserInfo] = useState<User>(authorizeInfo?.user);

    useEffect(() => {
        const userInfoRedHandlerId = registerGlobalMessageEvent(GlobalTransmitterEvent.USER_INFO_RED, ({ userInfoRed }) => {
            setUserInfo({
                ...userInfo,
                red: userInfoRed,
            });
        });

        return () => {
            unsubscribeGlobalMessageEvent(userInfoRedHandlerId as any);
        };
    }, []);

    return (
        <div className={`${customizeClass}`} data-testid="balance">
            <span id="user-info_balance">
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
                <span data-testid="amount">{numberRoundDownWithCommas(amount)}</span>
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

        return <span data-testid="currency">{currency}</span>;
    }, [currency, isDisplayPlayerCurrency]);
};

export default UserInfo;
