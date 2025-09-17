import { useTranslator } from '@shared/react-hooks';
import { useGlobalEventsStore } from '@shared/stores/global-events-store/global-events-store';

export const RTP = ({ rtp, tolgeeNamespace }: { rtp: number; tolgeeNamespace: string }) => {
    const { openingGameId } = useGlobalEventsStore();
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-3 justify-between rounded-xl px-3 py-4 md:py-6 bg-primary-bg border-stroke">
            <div className="text-base md:text-lg font-medium md:font-semibold">{openingGameId > 0 && t(`${tolgeeNamespace}.game_name_${openingGameId}`)}</div>
            <div className="text-sm md:text-base font-medium md:font-semibold">
                RTP: <span className="text-[#8eff77]">{rtp}%</span>
            </div>
        </div>
    );
};

export default RTP;
