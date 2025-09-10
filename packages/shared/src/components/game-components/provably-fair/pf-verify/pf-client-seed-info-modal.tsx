import { FC, useMemo } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { usePlayerContext } from '@shared/react-contexts';
import { useCommonTranslate, useSNTranslate } from '@shared/react-hooks';
import CopyableTextInput from "../copyable-text-input";
import Styles from "../provably-fair.module.scss";
import { Section } from "../pf-form-components";
import { useShallow } from "zustand/shallow";
import usePopupStore from '@shared/stores/popup-store/popup-store';
import useBetDetailStore from '@shared/stores/bet-detail-store/bet-detail-store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";
import { cn } from '@shared/utils/merge-tailwind-util';
import ModalContainer from "../../modal-container";
import { ButtonPFGuide } from "../pf-guide";

const PFClientSeedInfoModal: FC<{
    fileNameExport: (data?: any) => string;
    renderResultBlock: Function;
}> = ({ fileNameExport, renderResultBlock }) => {
    const { isShowPFClientSeedInfo, togglePFClientSeedInfo } = usePopupStore(
        useShallow((state) => ({
            isShowPFClientSeedInfo: state.isShowPFClientSeedInfo,
            togglePFClientSeedInfo: state.togglePFClientSeedInfo,
        }))
    );
    const { t: translateSNGames } = useSNTranslate();

    const handleCloseModal = () => {
        togglePFClientSeedInfo(false);
    };

    return (
        isShowPFClientSeedInfo &&
        createPortal(
            <ModalContainer
                id="pf-client-seed-info-modal"
                title={
                    <div>
                        <ButtonPFGuide />
                        <div className="flex-1 text-center">{translateSNGames("pf_title_client_seed_info")}</div>
                    </div>
                }
                isOpen={isShowPFClientSeedInfo}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <PFClientSeedInfo fileNameExport={fileNameExport} renderResultBlock={renderResultBlock} />
            </ModalContainer>,
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

const renderBetDetailHeader = (translateSNGames: any) => {
    const headerColumns = [
        { key: "player", label: translateSNGames("pf_player") },
        { key: "nickname", label: translateSNGames("pf_provably_fair_info_nickname") },
        { key: "seed", label: translateSNGames("pf_client_seed_info_subtitle_seed") },
    ];

    return (
        <TableHeader className="bg-[#27374a]">
            <TableRow>
                {headerColumns.map((column) => (
                    <TableHead key={column.key} className="w-1/3  text-center p-3 text-sm font-medium text-secondary-text">
                        {column.label}
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
};

const PFClientSeedInfo: FC<{ fileNameExport: (data?: any) => string; renderResultBlock: Function }> = ({
    fileNameExport,
    renderResultBlock,
}) => {
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const betDetailData = useBetDetailStore((state) => state.betDetailData);

    const {
        authorizeInfo: {
            user: { name },
        },
    } = usePlayerContext();

    return useMemo(
        () => (
            <>
                {betDetailData && (
                    <div className={Styles["pf-setting-container"]}>
                        <div className="result-block mb-[8px]">{renderResultBlock(betDetailData.drawInfo)}</div>

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
                        <div className="form flex flex-col gap-[4px]">
                            <div className="flex items-center justify-between">
                                <Section
                                    title={
                                        <>
                                            {translateSNGames("pf_client_seed_info_total_players")}{" "}
                                            <span className={Styles["text-highlight"]}>
                                                {betDetailData.drawInfo.pfResult.clientSeeds?.length}
                                            </span>
                                        </>
                                    }
                                    customTitleStyles="m-0"
                                ></Section>
                            </div>
                            <div
                                className={`table-container react-infinite-table ${Styles["pf-info"]} rounded-lg overflow-hidden border border-primary-border overflow-y-auto pb-[0px]`}
                            >
                                <Table className="w-full h-screen">
                                    {renderBetDetailHeader(translateSNGames)}
                                    <TableBody>
                                        {betDetailData.drawInfo.pfResult.clientSeeds?.map((clientSeed, index) => (
                                            <TableRow
                                                key={uuidv4()}
                                                className={cn(
                                                    "border-none last:border-b-0",
                                                    index % 2 === 0 ? "bg-bet-detail-row-1" : "bg-bet-detail-row-2"
                                                )}
                                            >
                                                <TableCell className="w-1/3 text-sm text-secondary-text text-center p-3">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="w-1/3 text-sm text-secondary-text text-center p-3">
                                                    {name === clientSeed.name ? (
                                                        <span className="font-semibold text-winning-highlight">{clientSeed.name}</span>
                                                    ) : (
                                                        <span className="font-text">{encryptName(clientSeed.name)}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="w-1/3 text-sm text-secondary-text text-center p-3">
                                                    {name === clientSeed.name ? (
                                                        <span className="font-semibold text-winning-highlight">
                                                            {clientSeed.clientSeed}
                                                        </span>
                                                    ) : (
                                                        <span>{clientSeed.clientSeed}</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}
            </>
        ),
        [betDetailData, name]
    );
};

export default PFClientSeedInfoModal;
