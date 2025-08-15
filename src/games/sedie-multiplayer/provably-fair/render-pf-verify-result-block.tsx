import { FC, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslator } from "../../../_shared/react-hooks";
import { PFResult } from "../../../components/game-base/type";
import Styles from "./pf-sedie-multiplayer.module.scss";
import { ResourceTypes } from "../../../_shared/resources";

const PFVerifyResultBlock: FC<{ pfResult: PFResult }> = ({ pfResult }) => {
    const { t } = useTranslator();

    const drawResult = useMemo(() => {
        const beforeDrawResult = [];
        for (const item of pfResult?.roundResult || []) {
            beforeDrawResult.push(item);
            if (Number(item?.drawId) === pfResult?.drawId) {
                break;
            }
        }

        return {
            drawID: pfResult?.drawId,
            order: t(`${ResourceTypes.SABA_NUMBER}.pf_draw_${beforeDrawResult.length}`),
            result: beforeDrawResult,
        };
    }, [pfResult]);

    const ballItems = drawResult.result.map((item) => item.balls).flat();

    return (
        <>
            <div className="text-white font-weight-medium mb-2">
                {t(`${ResourceTypes.COMMON}.round`).capitalizeFirstLetter()}: {drawResult?.drawID}
            </div>
            <div className="flex justify-center">
                <div className={Styles["balls-container"]}>
                    {ballItems.map((item, _) => (
                        <span key={uuidv4()} className="ball-number">{item}</span>
                    ))}
                </div>
            </div>
        </>
    );
};

const renderPFVerifyResultBlock = (pfResult: PFResult) => {
    return <PFVerifyResultBlock pfResult={pfResult} />;
};

export default renderPFVerifyResultBlock;
