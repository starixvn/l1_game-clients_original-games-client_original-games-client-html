import BaseDialog from "@shared/components/game-components/base-dialog";
import { ModalType } from "@shared/components/game-components/base-dialog/type";
import { useCommonTranslate } from "@shared/react-hooks";
import { memo } from "react";
import { createPortal } from "react-dom";

const PARAPHRASES = [
    { main: "auto_bet_para_2", sub: [] },
    { main: "auto_bet_para_3", sub: ["auto_bet_para_3_1", "auto_bet_para_3_2", "auto_bet_para_3_3"] },
    { main: "auto_bet_para_4", sub: ["auto_bet_para_4_1", "auto_bet_para_4_2", "auto_bet_para_4_3"] },
    { main: "auto_bet_para_5", sub: [] },
    { main: "auto_bet_para_6", sub: [] },
];

const AutoBetInstruction = ({
    setIsShowAutoBetInstruction,
}: {
    setIsShowAutoBetInstruction: (isShowAutoBetInstruction: boolean) => void;
}) => {
    const { t } = useCommonTranslate();

    const handleClose = () => {
        setIsShowAutoBetInstruction(false);
    };

    return createPortal(
        <BaseDialog
            onCloseModal={handleClose}
            type={ModalType.Full}
            enableBackdrop={true}
            extendedClassName="bg-popup-gradient bottom-0 top-auto p-4 md:top-[20%] md:bottom-auto md:max-w-2xl md:mx-auto"
        >
            <div>
                <div className="relative mb-4 px-5">
                    <div className="text-white text-lg font-semibold text-center">{t("auto_bet_header")}</div>
                    <button onClick={handleClose} className="absolute top-1/2 right-0 -translate-y-1/2">
                        <i className="icon-close text-sm md:text-base w-4 h-4"></i>
                    </button>
                </div>
                <div className="text-[var(--text-content-color)] max-h-[30rem] overflow-y-auto">
                    <div className="text-sm mb-2 md:text-base">{t("auto_bet_para_1")}</div>
                    <ul className="list-disc ml-6">
                        {PARAPHRASES.map((phrase) => (
                            <li key={phrase.main}>
                                <div className="text-sm md:text-base">{t(phrase.main)}</div>
                                <ul className="list-disc ml-6">
                                    {phrase.sub.map((sub) => (
                                        <li className="text-sm md:text-base" key={sub}>
                                            {t(sub)}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </BaseDialog>,
        document.getElementById("dashboard")
    );
};

export default memo(AutoBetInstruction);
