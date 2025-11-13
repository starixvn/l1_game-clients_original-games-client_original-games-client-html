import { memo, useRef, useState } from "react";
import { useClickOutside, useCommonTranslate } from "@shared";

const IconInfoPercentageControl = ({ type }: { type: "on_win" | "on_loss" }) => {
    const [isShowGuide, setIsShowGuide] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const { t } = useCommonTranslate();
    useClickOutside([tooltipRef], () => setIsShowGuide(false));

    return (
        <>
            <div className="relative">
                <i
                    className="absolute -top-1 md:-top-0.5 left-0 icon-circle-info text-lg cursor-pointer"
                    data-testid="icon-guide-testid"
                    onClick={() => setIsShowGuide(true)}
                />
                {isShowGuide && (
                    <div
                        className={`absolute -top-2 left-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#2993f5]`}
                    ></div>
                )}
            </div>
            {isShowGuide && (
                <div
                    ref={tooltipRef}
                    className={`absolute -translate-y-[calc(100%+8px)] left-0 bg-[#2993f5] w-full text-white text-sm px-4 py-2 rounded-lg pointer-events-none flex flex-col gap-1`}
                >
                    <div>
                        <span className="font-semibold">{t("reset")}: </span>
                        {t(`pop_over_${type}_reset`)}
                    </div>
                    <div>
                        <span className="font-semibold">{t("increase_by")}: </span>
                        {t(`pop_over_${type}_increase_by`)}
                    </div>
                    <div className="italic">{t(`pop_over_${type}_example`)}</div>
                </div>
            )}
        </>
    );
};

export default memo(IconInfoPercentageControl);
