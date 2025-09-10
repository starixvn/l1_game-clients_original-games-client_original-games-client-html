import { useTranslator } from '@shared/merged/_shared/react-hooks';
import { useGlobalEventsStore } from '@shared/merged/_shared/stores/global-events-store/global-events-store';

export const RTP = ({ rtp, tolgeeNamespace }: { rtp: number; tolgeeNamespace: string }) => {
    const { openingGameId } = useGlobalEventsStore();
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <div className="flex flex-wrap items-center justify-between rounded-xl px-2 lg:px-4 py-3 bg-primary-bg border border-primary-border">
            <div className="text-base font-semibold">{openingGameId > 0 && t(`${tolgeeNamespace}.game_name_${openingGameId}`)}</div>
            <div className="text-base font-semibold">
                RTP: <span className="text-[#8eff77]">{rtp}%</span>
            </div>
        </div>
    );
};

export default RTP;
