import { useTranslator } from "@shared/react-hooks";
import { useGlobalEventsStore } from "@shared/stores/global-events-store/global-events-store";

export const RTP = ({ rtp, tolgeeNamespace }: { rtp: number; tolgeeNamespace: string }) => {
    const { openingGameId } = useGlobalEventsStore();
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <div className="flex flex-wrap items-start md:items-center gap-3 justify-between rounded-xl px-3 py-4 md:py-6 bg-primary-bg border-stroke">
            <div className="text-base md:text-lg font-semibold">
                {openingGameId > 0 && t(`${tolgeeNamespace}.game_name_${openingGameId}`)}
            </div>
            <div className="text-sm md:text-base font-semibold">
                RTP: <span className="text-[#8eff77]">{rtp}%</span>
            </div>
        </div>
    );
};

export default RTP;
