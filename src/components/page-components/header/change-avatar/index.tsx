import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { SettingEventActionType, usePlayerContext, useSettingContext, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useClickSound } from "../../../../_shared/react-hooks";
import { updateUserAvatar } from "../../../../services/user-setting-service";
import { AvatarGallery } from "../../../game-components/avatar-gallery";
import Styles from "./index.module.scss";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { broadcastAvatarId } from "../../../../_shared/helpers/global-events-helper";

const ChangeAvatar: React.FC = () => {
    console.log("[ChangeAvatar] ChangeAvatar component rendering");
    const settingContext = useSettingContext();
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const { session, authorizeInfo } = usePlayerContext();
    const { user } = authorizeInfo;
    const [avatarId, setAvatarId] = useState<number>();

    console.log("[ChangeAvatar] initial state:", { avatarId, userAvatarId: user.avatarId, isShowAvatarGallery: settingContext.isShowAvatarGallery });

    useEffect(() => {
        if (user.avatarId > 0) {
            console.log("[ChangeAvatar] setting avatarId from user:", user.avatarId);
            setAvatarId(user.avatarId);
        }
    }, [user]);

    const onClose = () => {
        console.log("[ChangeAvatar] onClose called");
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
        console.log("[ChangeAvatar] handleSelectAvatar called with avatarId:", avatarId);
        setAvatarId(avatarId);
        AnalyticsHelper.trackFunction({ function: TrackingFunction.Avatar, action: TrackingAction.Change });
        const result = await updateUserAvatar(session, avatarId);

        if (result["ok"] === 1) { // TO DO: define Result type
            console.log("[ChangeAvatar] avatar update successful");
            broadcastAvatarId(avatarId);
        }
        else {
            console.error("[ChangeAvatar] avatar update failed:", result);
            Sentry.captureException(result);
        }
    };

    if (!settingContext.isShowAvatarGallery) {
        console.log("[ChangeAvatar] not showing avatar gallery");
        return null;
    }

    console.log("[ChangeAvatar] rendering avatar gallery");
    return (
        <div className={Styles["gallery-bg"]}>
            <AvatarGallery
                classCustomize={Styles["gallery-wrapper-customize"]}
                selectedAvatarId={avatarId}
                onSelectAvatar={handleSelectAvatar}
                onClose={onClose}
            />
        </div>
    );
};

export default ChangeAvatar;
