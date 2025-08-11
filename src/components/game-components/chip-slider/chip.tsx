import React from "react";

import { resolveChipColorHex, systemName } from "../../../_shared/constants";
import { useSystemContext } from "../../../_shared/react-contexts";
import Styles from "./chip-slider.module.scss";
import { CachedImage } from "../cached-image";

export const Chip: React.FC<{ value: number; onClickChip: Function; text: string; image: string }> = ({
    value,
    onClickChip,
    text,
    image,
}) => {
    const systemContext = useSystemContext();

    const { selectedChip } = systemContext;

    const getChipClassName = () => {
        return `${Styles["chip-container"]} ${selectedChip === value ? Styles["selected"] : ""}`;
    };

    const getDefaultChipText = () => {
        return value < 1000 ? value.toString() : `${value / 1000}K`;
    };

    return (
        <div id={`chip-${value}`} key={value} className={getChipClassName()} onClick={() => onClickChip(value)}>
            {image && (
                <CachedImage
                    src={`/static/images/chips/${systemName === "vg" ? "gn" : systemName}/${resolveChipColorHex(image)}.svg`}
                    fallbackSrcs={[`/static/images/chips/gn/${resolveChipColorHex(image)}.svg`]}
                    className={`img-fluid ${Styles["chip"]}`}
                    width={65}
                    height={66}
                    alt="Chip"
                    priority={true}
                />
            )}
            <span className={Styles["value"]}>{text || getDefaultChipText()}</span>
        </div>
    );
};
