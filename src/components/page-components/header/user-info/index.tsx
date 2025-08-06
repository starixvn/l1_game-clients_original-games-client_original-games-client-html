import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { User } from "sc-user-service-client/dist/auth";

import { buildVersion } from "../../../../_shared/constants";
import {
    GlobalTransmitterEvent,
    registerGlobalMessageEvent,
    unsubscribeGlobalMessageEvent,
} from "../../../../_shared/helpers/message-transmitter/global-transmitter";
import { numberRoundDownWithCommas } from "../../../../_shared/helpers/number-helper";
import { SettingEventActionType, usePlayerContext, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useClickSound } from "../../../../_shared/react-hooks";
import { MAX_AVATAR_ID } from "../../../../_shared/helpers/avatar-helper";
import Styles from "./user-info.module.scss";

export const UserInfo: React.FC<{
    customizeClass?: string;
    isLobby: boolean;
}> = ({ customizeClass, isLobby }) => {
    console.log("[UserInfo] UserInfo component rendering with:", { customizeClass, isLobby });
    const clickSound = useClickSound();
    const [classCursor, setClassCursor] = useState<string>();
    const settingDispatch = useSettingDispatch();
    const { authorizeInfo } = usePlayerContext();
    const [userInfo, setUserInfo] = useState<User>(authorizeInfo?.user);

    console.log("[UserInfo] initial userInfo:", {
        name: userInfo?.name,
        red: userInfo?.red,
        avatarId: userInfo?.avatarId,
        currency: userInfo?.currency
    });

    let deviceClass = "";
    if (isMobileOnly) {
        deviceClass = isIOS ? Styles["ios-device"] : Styles["android-device"];
    }

    const handleClickAvatar = () => {
        console.log("[UserInfo] handleClickAvatar called, isLobby:", isLobby);
        if (isLobby) {
            document.body.classList.add("no-scroll");
            clickSound();
            settingDispatch({
                type: SettingEventActionType.SHOW_AVATAR_GALLERY,
                payload: {
                    isShowAvatarGallery: true,
                },
            });
        }
    };

    useEffect(() => {
        console.log("[UserInfo] setting up userInfoRed event listener");
        const userInfoRedHandlerId = registerGlobalMessageEvent(GlobalTransmitterEvent.USER_INFO_RED, ({ userInfoRed }) => {
            console.log("[UserInfo] userInfoRed event received:", userInfoRed);
            setUserInfo({
                ...userInfo,
                red: userInfoRed,
            });
        });

        return () => {
            console.log("[UserInfo] cleaning up userInfoRed event listener");
            unsubscribeGlobalMessageEvent(userInfoRedHandlerId as any);
        };
    }, []);

    useEffect(() => {
        console.log("[UserInfo] setting up event listeners for user info updates");
        const userInfoRedHandlerId = registerGlobalMessageEvent(GlobalTransmitterEvent.USER_INFO_RED, ({ userInfoRed }) => {
            console.log("[UserInfo] userInfoRed event received:", userInfoRed);
            setUserInfo({
                ...userInfo,
                red: userInfoRed,
            });
        });

        const avatarIdHandlerId = registerGlobalMessageEvent(GlobalTransmitterEvent.CHANGE_AVATAR_ID, ({ avatarId }) => {
            console.log("[UserInfo] changeAvatarId event received:", avatarId);
            setUserInfo({
                ...userInfo,
                avatarId: avatarId,
            });
        });

        return () => {
            console.log("[UserInfo] cleaning up event listeners");
            unsubscribeGlobalMessageEvent(userInfoRedHandlerId as any);
            unsubscribeGlobalMessageEvent(avatarIdHandlerId as any);
        };
    }, []);

    useEffect(() => {
        if (isLobby) {
            console.log("[UserInfo] setting cursor class for lobby");
            setClassCursor(Styles["user-cursor"]);
        } else {
            console.log("[UserInfo] clearing cursor class");
            setClassCursor("");
        }
    }, [isLobby]);

    return (
        <div className={`${Styles["user"]} ${customizeClass ? Styles[customizeClass] : ""} ${deviceClass}`}>
            <div className={Styles["info"]}>
                <UserName name={userInfo?.name || ""} />
                <div className={`${Styles.balance}`} data-testid="balance">
                    <span id="user-info_balance" className={Styles["balance-text"]}>
                        <UserAmount amount={userInfo?.red || 0} />
                        <UserCurrency currency={userInfo.currency} isDisplayPlayerCurrency={userInfo.isDisplayPlayerCurrency} />
                    </span>
                    <Image className="img-fluid" src={`/static/images/icons/icon-coin.svg`} width={10} height={11} alt={`icon-coin`} />
                </div>
            </div>
            <UserAvatar avatarId={userInfo?.avatarId} classCursor={classCursor} handleClickAvatar={handleClickAvatar} />
        </div>
    );
};

const UserName: React.FC<{ name: string }> = ({ name }) => {
    console.log("[UserInfo] UserName component rendering with name:", name);
    return useMemo(() => {
        return (
            <div id="user-info_user-name" className={Styles["user-name"]} data-testid="user-name">
                {name}
            </div>
        );
    }, [name]);
};

const UserAmount: React.FC<{ amount: number }> = ({ amount }) => {
    console.log("[UserInfo] UserAmount component rendering with amount:", amount);
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
    console.log("[UserInfo] UserCurrency component rendering with:", { currency, isDisplayPlayerCurrency });
    return useMemo(() => {
        if (!isDisplayPlayerCurrency) {
            return <></>;
        }

        return <span data-testid="currency">{currency}</span>;
    }, [currency, isDisplayPlayerCurrency]);
};

const UserAvatar: React.FC<{ avatarId: number; classCursor: string; handleClickAvatar: Function }> = ({
    avatarId,
    classCursor,
    handleClickAvatar,
}) => {
    console.log("[UserInfo] UserAvatar component rendering with:", { avatarId, classCursor: !!classCursor });
    return (
        <div data-testid="avatar" className={`${Styles["avatar"]} ${classCursor}`} onClick={() => handleClickAvatar?.()}>
            {avatarId > 0 && avatarId <= MAX_AVATAR_ID ? (
                <Image
                    src={`/static/images/avatar/${avatarId}.jpg?v=${buildVersion}`}
                    className="img-fluid circle"
                    height={162}
                    width={162}
                    quality={100}
                    alt="Avatar"
                />
            ) : (
                <span className={`icon-user ${Styles["icon-user"]}`} data-testid="icon-user"></span>
            )}

            {classCursor !== "" && <span className={`icon-pencil ${Styles["icon-edit"]}`}></span>}
        </div>
    );
};

export default UserInfo;
