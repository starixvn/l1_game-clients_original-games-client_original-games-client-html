import { createHash } from "crypto";
import { FC, useEffect, useMemo, useState } from "react";
import { useTranslator } from "@shared/react-hooks";
import { PFVerificationHeaderBlockBase, DefaultPFStyles as Styles } from "@shared/components/game-components/provably-fair";
import { Section } from "@shared/components/game-components/provably-fair/pf-form-components";
import PfRoundBaseHelper from "@shared/helpers/pf/pf-round-base-helper";
import { ResourceTypes } from "@shared/resources";
import { useGameContext } from "@shared/react-contexts";
import { useShallow } from "zustand/react/shallow";
import { useBetDetailStore } from "@shared/stores/bet-detail-store/bet-detail-store";
import { gameModeMap } from "@shared/helpers/plinko";

const PFVerification: FC = () => {
    const { tolgeeNamespace } = useGameContext();
    const { betDetailData, updateBetDetail } = useBetDetailStore(
        useShallow((state) => ({
            betDetailData: state.betDetailData,
            updateBetDetail: state.updateBetDetail,
        }))
    );

    const [mergeClientSeed, setMergeClientSeed] = useState(
        betDetailData.drawInfo.pfResult?.editedMergeClientSeed || betDetailData.drawInfo.pfResult?.mergeClientSeed || ""
    );
    const { t } = useTranslator();
    const [combinedHash, setCombinedHash] = useState(betDetailData.drawInfo.pfResult.finalHash);

    const NUMBER_OF_ROWS = useMemo(() => betDetailData.betLogDetails[0].choice, [betDetailData.betLogDetails[0].choice]);
    const gameMode = useMemo(() => betDetailData.betLogDetails[0].gameMode, [betDetailData.betLogDetails[0].gameMode]);

    const verifyInfo = useMemo(
        () =>
            PfRoundBaseHelper.buildVerifyInfoPlinko({
                pfResult: betDetailData.drawInfo.pfResult,
                combinedHash,
                numberOfRows: NUMBER_OF_ROWS,
            }),
        [combinedHash]
    );

    const handleChangeMergeClientSeed = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        setMergeClientSeed(input.value);
    };

    useEffect(() => {
        const mergeSeed = `${betDetailData.drawInfo.pfResult.serverSeed}${mergeClientSeed}`;
        const hash = createHash("sha512").update(mergeSeed).digest("hex");
        setCombinedHash(hash);

        return () => {
            updateBetDetail({
                ...betDetailData,
                drawInfo: {
                    ...betDetailData.drawInfo,
                    pfResult: {
                        ...betDetailData.drawInfo.pfResult,
                        editedMergeClientSeed: mergeClientSeed,
                    },
                },
            });
        };
    }, [mergeClientSeed]);

    return (
        <div className={`${Styles["pf-setting-container"]} text-sm md:text-base`}>
            <PFVerificationHeaderBlockBase
                handleChangeMergeClientSeed={handleChangeMergeClientSeed}
                mergeClientSeed={mergeClientSeed}
                severSeed={betDetailData.drawInfo.pfResult?.serverSeed}
                combinedHash={combinedHash}
                finalHash={betDetailData.drawInfo.pfResult?.finalHash}
            />

            <div className={`${Styles["client-seed-form"]} mt-3`}>
                <div className="flex items-center justify-between gap-4">
                    <Section
                        title={t(`${ResourceTypes.COMMON}.pf_verification_para_1`)}
                        customTitleStyles={`m-0 ${Styles["title-fix-width"]}`}
                    ></Section>
                    <div className="flex gap-2 items-center">{betDetailData.drawInfo.settlementResult.multiplier}x</div>
                </div>
                <div className="flex items-center justify-between gap-4 ">
                    {t(`${tolgeeNamespace}.mode`).capitalizeFirstLetter()}: {t(`${tolgeeNamespace}.${gameModeMap[gameMode]}`)}
                    <div className="flex gap-2 items-center">
                        {t(`${tolgeeNamespace}.row`).capitalizeFirstLetter()}: {betDetailData.betLogDetails[0].choice}
                    </div>
                </div>
                <Section title={t(`${ResourceTypes.COMMON}.pf_header_combined_sha512_hash`)} customTitleStyles="mt-1">
                    <p className={Styles["pf-word-break"]}>{combinedHash}</p>
                </Section>

                <Section title={t(`${tolgeeNamespace}.pf_verifier_tool_para_24`)}>
                    <div className="flex flex-col gap-2">
                        <p className="font-weight-medium">
                            {verifyInfo.convertNumber.map((item, index) => {
                                const rawDigit = verifyInfo.rawDigits[index];
                                return (
                                    <span style={{ display: "block" }} key={`${rawDigit}-${index}`}>
                                        {rawDigit} {"=>"} {item} {"mod 2 ="} {item % 2}
                                    </span>
                                );
                            })}
                        </p>
                        <p>
                            {t(`${tolgeeNamespace}.slot_index`)}:{" "}
                            {verifyInfo.convertNumber.map((item, index) => {
                                return (
                                    <span key={`${item}-${index}`}>
                                        {item % 2} {index === verifyInfo.convertNumber.length - 1 ? "=" : "+ "}{" "}
                                    </span>
                                );
                            })}{" "}
                            {betDetailData.drawInfo.settlementResult.slotIndex}
                        </p>
                        <div className="flex items-center gap-5 overflow-x-auto">
                            {betDetailData.drawInfo.odds?.[gameMode]?.[NUMBER_OF_ROWS]?.map((item, index) => {
                                return (
                                    <div
                                        key={`${item}-${index}`}
                                        className={`flex flex-col items-center  ${
                                            index === betDetailData.drawInfo.settlementResult.slotIndex ? Styles["text-successful"] : ""
                                        }`}
                                    >
                                        <span>{index} </span>
                                        <span>{item} </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default PFVerification;
