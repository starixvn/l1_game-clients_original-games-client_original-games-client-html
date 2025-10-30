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
            <input className={cn(`${className} form-control text-sm md:text-base font-normal text-white py-3 leading-5 md:leading-7`)} type="text" name={id} id={id} readOnly value={value || ""} />
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
