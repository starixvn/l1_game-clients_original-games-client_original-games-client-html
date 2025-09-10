import { useCommonTranslate } from "../../../_shared/react-hooks/use-translator";
import Tooltip from "../tooltip";
import Styles from "./icon-statistic.module.scss";

export const IconStatistic = ({ onClick }: { onClick?: () => void }) => {
    const { t } = useCommonTranslate();
    return (
        <div className="relative group">
            <div data-testid="icon-statistic" className={`cursor-pointer h-10 w-10 flex items-center justify-center`} onClick={onClick}>
                <div className={`${Styles["icon"]} absolute h-10 w-10 rounded-full`}></div>
                <i className="icon-statistic"></i>
            </div>
            <Tooltip message={t("tooltip_stat")} classArrow="rotate-180 bottom-[35px]" className="top-[47px]" />

        </div>
    );
};
