import { createHash } from "crypto";
import { FC, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslator } from "@shared/react-hooks";
import { PFVerificationHeaderBlockBase, DefaultPFStyles as Styles } from "@shared/components/game-components/provably-fair";
import { Section } from "@shared/components/game-components/provably-fair/pf-form-components";
import { Markup } from "interweave";
import PfRoundBaseHelper from "@shared/helpers/pf/pf-round-base-helper";
import { ResourceTypes } from "@shared/resources";
import { useGameContext } from "@shared/react-contexts";
import { useShallow } from "zustand/react/shallow";
import { useBetDetailStore } from "@shared/stores/bet-detail-store/bet-detail-store";
import { gameModeMap } from "@shared/helpers/plinko";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
    const { t: translateInGame } = useTranslator([tolgeeNamespace]);
    const [combinedHash, setCombinedHash] = useState(betDetailData.drawInfo.pfResult.finalHash);

    const NUMBER_OF_ROWS = betDetailData.betLogDetails[0].choice;

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
                    {translateInGame(`mode`).capitalizeFirstLetter()}: {translateInGame(gameModeMap[betDetailData.betLogDetails[0].gameMode])}
                    <div className="flex gap-2 items-center">
                        {translateInGame(`row`).capitalizeFirstLetter()}: {betDetailData.betLogDetails[0].choice}
                    </div>
                </div>
                <Section title={t(`${ResourceTypes.COMMON}.pf_header_combined_sha512_hash`)} customTitleStyles="mt-2">
                    <p className={Styles["pf-word-break"]}>{combinedHash}</p>
                </Section>

                <Section title={translateInGame("pf_verifier_tool_para_24")}>
                    <p className="font-weight-medium">
                        {verifyInfo.convertNumber.map((item, index) => {
                            const rawDigit = verifyInfo.rawDigits[index];
                            return (
                                <span style={{ display: "block" }} key={uuidv4()}>
                                    {rawDigit} {"=>"} {item} {"mode 2 ="} {item % 2}
                                </span>
                            );
                        })}
                    </p>
                    
                </Section>
            </div>
        </div>
    );
};

export default PFVerification;
