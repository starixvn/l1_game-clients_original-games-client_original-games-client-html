import React from "react";

import { buildVersion } from "../../../_shared/constants";
import { MAX_AVATAR_ID } from "../../../_shared/helpers/avatar-helper";
import Styles from "./profile-picture.module.scss";
import Image from "next/image";

const ProfilePicture: React.FC<{ avatarId: number; isEditable?: boolean; onClick?: () => void }> = ({
    avatarId,
    isEditable = false,
    onClick,
}) => {
    console.log("[ProfilePicture] ProfilePicture component rendering with:", { avatarId, isEditable });

    const handleClick = () => {
        console.log("[ProfilePicture] handleClick called");
        onClick && onClick();
    };

    const hasValidAvatar = avatarId > 0 && avatarId <= MAX_AVATAR_ID;
    console.log("[ProfilePicture] hasValidAvatar:", hasValidAvatar);

    return (
        <div className={Styles["profile-picture"]} onClick={handleClick} data-testid="profile-picture">
            {hasValidAvatar ? (
                <Image
                    src={`/static/images/avatar/${avatarId}.jpg?v=${buildVersion}`}
                    className={`img-fluid ${Styles["avatar"]}`}
                    height={162}
                    width={162}
                    quality={100}
                    alt="Avatar"
                />
            ) : (
                <div data-testid="default-avatar" className={Styles["default-avatar"]}></div>
            )}
            {isEditable && <EditIcon />}
        </div>
    );
};

const EditIcon = () => {
    console.log("[ProfilePicture] EditIcon component rendering");
    return (
        <div className={Styles["chose-avatar"]} data-testid="edit-icon">
            <span className={`icon-pencil ${Styles["icon-edit"]}`}></span>
        </div>
    );
};

export default ProfilePicture;
