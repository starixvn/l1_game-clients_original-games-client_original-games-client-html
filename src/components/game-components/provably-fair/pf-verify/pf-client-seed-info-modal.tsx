import { FC, useMemo } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { usePlayerContext } from "../../../../_shared/react-contexts";
import { useClickSound, useCommonTranslate, useSNTranslate } from "../../../../_shared/react-hooks";
import CopyableTextInput from "../copyable-text-input";
import Styles from "../provably-fair.module.scss";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { Section } from "../pf-form-components";
import { useShallow } from "zustand/shallow";
import usePopupStore from "../../../../_shared/stores/popup-store/popup-store";
import { renderPFVerifyResultBlock } from "../../../../games/sedie-multiplayer/provably-fair";
import useBetDetailStore from "../../../../_shared/stores/bet-detail-store/bet-detail-store";
import PFModalContainer from "../../pf-modal";

const PFClientSeedInfoModal: FC<{
    fileNameExport: (data?: any) => string;
}> = ({ fileNameExport }) => {
    const { isShowPFClientSeedInfo, togglePFClientSeedInfo } = usePopupStore(
        useShallow(
            (state) => ({
                isShowPFClientSeedInfo: state.isShowPFClientSeedInfo,
                togglePFClientSeedInfo: state.togglePFClientSeedInfo,
            })
        )
    );
    const { t: translateSNGames } = useSNTranslate();

    const handleCloseModal = () => {
        togglePFClientSeedInfo(false);
    };

    return (
        isShowPFClientSeedInfo &&
        createPortal(
            <PFModalContainer
                id="pf-client-seed-info-modal"
                title={
                    <div>
                        {translateSNGames("pf_title_client_seed_info")}
                    </div>
                }
                isOpen={isShowPFClientSeedInfo}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <PFClientSeedInfo fileNameExport={fileNameExport} />
            </PFModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const encryptName = (name: string) => {
    if (name.length <= 0) {
        return name;
    }

    return `${name.substring(0, 1)}***${name.substring(name.length - 3, name.length)}`;
};

const PFClientSeedInfo: FC<{ fileNameExport: (data?: any) => string }> = ({ fileNameExport }) => {
    const clickSound = useClickSound();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const betDetailData = useBetDetailStore((state) => state.betDetailData);

    const {
        authorizeInfo: {
            user: { name },
        },
    } = usePlayerContext();

    const handleClickExport = () => {
        clickSound();
        const header = `${translateSNGames("pf_export_csv_client_seed_info")},${translateSNGames(
            "pf_export_csv_client_seed_info_nickname"
        )},${translateSNGames("pf_export_csv_client_seed_info_seed")}`;
        const content = betDetailData.drawInfo.pfResult.clientSeeds
            .map((item, index) => {
                return `${index + 1},${item.name === name ? item.name : encryptName(item.name)},${item.clientSeed}`;
            })
            .join("\n");
        const data = `${header}\n${content}`;
        const link = document.createElement("a");
        link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(data)}`;
        link.download = `${fileNameExport(betDetailData.drawInfo.drawId)}`;
        link.click();
        AnalyticsHelper.trackFunction({
            function: TrackingFunction.PFExportClientSeeds,
            action: TrackingAction.Click,
        });
    };

    return useMemo(
        () => (
            <>
            <div className="result-block">{renderPFVerifyResultBlock(betDetailData.drawInfo)}</div>
            <div className={Styles["pf-setting-container"]}>
                <div className={Styles["client-seed-form"]}>
                    <div className="flex items-center justify-between">
                        <Section title={translateCommon("pf_new_client_seed_para_1")} customTitleStyles="m-0">
                            <div className="input-group width-small">
                                <CopyableTextInput value={betDetailData.drawInfo.clientSeed} id="client-seed" position="bottom" />
                            </div>
                        </Section>
                    </div>
                    <Section title={translateCommon("pf_ header_merge_client_seed")} customTitleStyles="mt-3">
                        <div className="input-group width-full">
                            <CopyableTextInput value={betDetailData.drawInfo.pfResult.mergeClientSeed} id="merge-client-seed" />
                        </div>
                    </Section>
                </div>
                <div className="form">
                    <div className="flex items-center justify-between mb-2">
                        <Section
                            title={
                                <>
                                    {translateSNGames("pf_client_seed_info_total_players")}{" "}
                                    <span className={Styles["text-highlight"]}>{betDetailData.drawInfo.pfResult.clientSeeds?.length}</span>
                                </>
                            }
                            customTitleStyles="m-0"
                        >
                            <button className={Styles["btn-export"]} onClick={handleClickExport}>
                                <span className="icon-file-csv" style={{ cursor: "pointer" }}>
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                    <span className="path3"></span>
                                    <span className="path4"></span>
                                    <span className="path5"></span>
                                </span>
                            </button>
                        </Section>
                    </div>
                    <div className={`table-container react-infinite-table ${Styles["pf-info"]}`}>
                        <table className={`table text-center ${Styles["table"]}`}>
                            <thead>
                                <tr>
                                    <th style={{ width: "25%" }}>{translateSNGames("pf_player")}</th>
                                    <th>{translateSNGames("pf_provably_fair_info_nickname")}</th>
                                    <th>{translateSNGames("pf_client_seed_info_subtitle_seed")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {betDetailData.drawInfo.pfResult.clientSeeds?.map((clientSeed, index) => (
                                    <tr key={uuidv4()}>
                                        <td>{index + 1}</td>
                                        {name === clientSeed.name ? (
                                            <>
                                                <td className={`${Styles["table-highlight"]} font-text`}>{clientSeed.name}</td>
                                                <td className={name === clientSeed.name ? Styles["table-highlight"] : ""}>
                                                    {clientSeed.clientSeed}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="font-text">{encryptName(clientSeed.name)}</td>
                                                <td>{clientSeed.clientSeed}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </>
        ),
        [betDetailData, name]
    );
};

export default PFClientSeedInfoModal;
