import { useEffect, useState } from "react";
import Styles from "./styles.module.scss";
import { TimeOutConstants } from '@shared/merged/_shared/constants';

export const LoadingSpinner = ({ removeSpinner = false, timeOut = TimeOutConstants.OverlayMask }) => {
    const [isClearSpinner, setIsClearSpinner] = useState(false);

    useEffect(() => {
        const timeOutId = null;;

        if (removeSpinner) {
            setTimeout(() => {
                setIsClearSpinner(true);
            }, timeOut);
        }

        return () => {
            timeOutId && clearTimeout(timeOutId);
        }
    }, [removeSpinner])

    if (isClearSpinner) {
        return <></>;
    }

    return <div className={Styles["spinner-container"]}>
        <div className={Styles["loader"]}></div>
    </div>
};
