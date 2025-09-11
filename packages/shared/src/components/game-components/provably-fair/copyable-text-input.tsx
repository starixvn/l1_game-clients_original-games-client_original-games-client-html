import { FC, useState } from "react";
import { useClickSound, useCommonTranslate } from '@shared/react-hooks';
import Styles from "./provably-fair.module.scss";
import { cn } from "@shared/utils";

const CopyableTextInput: FC<{ value: string; id: string; position?: string; className?: string }> = ({
    value,
    id,
    position = "top",
    className = "",
}) => {
    const [isCopySuccess, setIsCopySuccess] = useState(false);
    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();
    const handleCopy = () => {
        clickSound();
        navigator.clipboard?.writeText(value);
        setIsCopySuccess(true);
        setTimeout(() => {
            setIsCopySuccess(false);
        }, 500);
    };

    return (
        <>
            <input className={cn(`form-control text-sm font-normal text-white ${className}`)} type="text" name={id} id={id} readOnly value={value || ""} />
            <button className={Styles["copy-btn"]} onClick={handleCopy}>
                <span className="icon-copy" />
            </button>
            {isCopySuccess && (
                <div className={`${Styles["copy-success"]} ${Styles[position]}`}>{translateCommon("pf_copy_successfully ")}</div>
            )}
        </>
    );
};

export default CopyableTextInput;
