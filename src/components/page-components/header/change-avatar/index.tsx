import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { SettingEventActionType, usePlayerContext, useSettingContext, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useClickSound } from "../../../../_shared/react-hooks";
import { updateUserAvatar } from "../../../../services/user-setting-service";
import { AvatarGallery } from "../../../game-components/avatar-gallery";
import Styles from "./index.module.scss";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../../../../_shared/helpers/message-transmitter/global-transmitter";

const ChangeAvatar: React.FC = () => {
    const settingContext = useSettingContext();
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const { session, authorizeInfo } = usePlayerContext();
    const { user } = authorizeInfo;
    const [avatarId, setAvatarId] = useState<number>();

    useEffect(() => {
        if (user.avatarId > 0) {
            setAvatarId(user.avatarId);
        }
    }, [user]);

    const onClose = () => {
        document.body.classList.remove("no-scroll");
        clickSound();
        settingDispatch({
            type: SettingEventActionType.SHOW_AVATAR_GALLERY,
            payload: {
                isShowAvatarGallery: false,
            },
        });
    };

    const handleSelectAvatar = async (avatarId: number) => {
        setAvatarId(avatarId);
        AnalyticsHelper.trackFunction({ function: TrackingFunction.Avatar, action: TrackingAction.Change });
        const result = await updateUserAvatar(session, avatarId);

        if (result["ok"] === 1) { // TO DO: define Result type
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.CHANGE_AVATAR_ID]: avatarId });
        }
        else {
            Sentry.captureException(result);
        }
    };

    return (
        settingContext.isShowAvatarGallery && (
            <div className={Styles["gallery-bg"]}>
                <AvatarGallery
                    classCustomize={Styles["gallery-wrapper-customize"]}
                    selectedAvatarId={avatarId}
                    onSelectAvatar={handleSelectAvatar}
                    onClose={onClose}
                />
            </div>
        )
    );
};

export default ChangeAvatar;
