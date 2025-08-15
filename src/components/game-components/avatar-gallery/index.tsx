import { useState } from "react";

import { useTranslator } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { Avatar } from "./avatar";
import Styles from "./avatar-gallery.module.scss";
import { MAX_AVATAR_ID } from "../../../_shared/helpers/avatar-helper";

export type AvatarGalleryProps = {
    selectedAvatarId: number;
    onSelectAvatar: (imgId: number) => Promise<void>;
    onClose: () => void;
    classCustomize?: any;
};

export type AvatarsProps = {
    selected: number;
    onSelect: (id: number) => void;
};

const Avatars: React.FC<AvatarsProps> = ({ selected, onSelect }) => {
    console.log("[AvatarGallery] Avatars component rendering with selected:", selected);
    const avatars = [];
    for (let i = 1; i <= MAX_AVATAR_ID; i++) {
        avatars.push(
            <Avatar
                key={i}
                imgId={i}
                selected={selected === i}
                onSelect={() => onSelect(i)}
            />
        );
    }
    return <>{avatars}</>;
};

export const AvatarGallery: React.FC<AvatarGalleryProps> = ({ selectedAvatarId, onSelectAvatar, onClose, classCustomize }) => {
    console.log("[AvatarGallery] AvatarGallery component rendering with selectedAvatarId:", selectedAvatarId);
    const { t } = useTranslator();
    const [selected, setSelected] = useState<number>(selectedAvatarId);

    const handleSelect = async (id: number) => {
        console.log("[AvatarGallery] handleSelect called with id:", id);
        setSelected(id);
        await onSelectAvatar(id);
    };

    const handleClose = () => {
        console.log("[AvatarGallery] handleClose called");
        onClose();
    };

    return (
        <BaseDialog type={ModalType.Center} isOpen={true} onCloseModal={handleClose}>
            <div className={`${Styles.gallery} ${classCustomize || ""}`}>
                <div className={Styles.header}>
                    <h3>{t("Common.select_avatar")}</h3>
                    <div className={`icon-close ${Styles.close}`} onClick={handleClose}></div>
                </div>
                <div className={Styles.content}>
                    <Avatars selected={selected} onSelect={handleSelect} />
                </div>
            </div>
        </BaseDialog>
    );
};
