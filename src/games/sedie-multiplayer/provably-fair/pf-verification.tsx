import { createHash } from "crypto";
import { FC, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslator } from "../../../_shared/react-hooks";
import { PFVerificationHeaderBlockBase, DefaultPFStyles as Styles } from "../../../components/game-components/provably-fair";
import { Section } from "../../../components/game-components/provably-fair/pf-form-components";
import { Markup } from "interweave";
import PfRoundBaseHelper from "../../../_shared/helpers/pf/pf-round-base-helper";
import { ResourceTypes } from "../../../_shared/resources";
import { useGameContext } from "../../../_shared/react-contexts";
import { useShallow } from "zustand/react/shallow";
import Image from "next/image";
import { getWinningSubOption } from "../history/sedie-multiplayer-bet-detail-result-block";
import { useBetDetailStore } from "../../../_shared/stores/bet-detail-store/bet-detail-store";

const PFVerification: FC = () => {
    const { tolgeeNamespace } = useGameContext();
    const { betDetailData, updateBetDetail } = useBetDetailStore(
        useShallow((state) => ({
            betDetailData: state.betDetailData,
            updateBetDetail: state.updateBetDetail,
        }))
    );
    
    const [mergeClientSeed, setMergeClientSeed] = useState(betDetailData.drawInfo.pfResult?.editedMergeClientSeed || betDetailData.drawInfo.pfResult?.mergeClientSeed || "");
    const { t } = useTranslator();
    const { t: translateInGame } = useTranslator([tolgeeNamespace]);
    const [combinedHash, setCombinedHash] = useState(betDetailData.drawInfo.pfResult.finalHash);

    const winningSubOption = getWinningSubOption(betDetailData.drawInfo.settlementResult);
    const IMAGE_SIZE = 36;
    const DICES_EACH_ROUND = 4; // Updated for Sedie Multi Player

    const verifyInfo = useMemo(
        () =>
            PfRoundBaseHelper.buildVerifyInfo({
                pfResult: betDetailData.drawInfo.pfResult,
                combinedHash,
                dicesEachRound: DICES_EACH_ROUND,
            }),
        [combinedHash]
    );

    const handleChangeMergeClientSeed = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        setMergeClientSeed(input.value);
    };

    const diceIndexRender = () => {
        return Array.from(Array(DICES_EACH_ROUND), (_, index) => {
            const { randomNumbers, convertNumber, diceIndexes } = verifyInfo;
            const diceIndexText = t(`${ResourceTypes.SEDIE_MULTIPLAYER}.pf_verifier_tool_button`, {
                value: index + 1,
            });

            const diceResult = diceIndexes[index] % 2 === 0 ? t(`${ResourceTypes.SEDIE_MULTIPLAYER}.glossary_white`) : t(`${ResourceTypes.SEDIE_MULTIPLAYER}.glossary_red`);

            const line = `<span style="color: #ffbc11; font-weight: 600">${diceIndexText}</span>
            - <span style="font-weight: 600">${t(`${ResourceTypes.COMMON}.pf_verification_para_1`)} </span> = ((${randomNumbers[index]}+${
                convertNumber[index]
            }) mod 2) = <span font-weight: 600">${diceIndexes[index]}</span> <span style="font-weight: 600">-> ${diceResult}</span>`;

            return (
                <p key={index}>
                    <Markup content={line} />
                </p>
            );
        });
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
        <div className={Styles["pf-setting-container"]}>
            <PFVerificationHeaderBlockBase
                handleChangeMergeClientSeed={handleChangeMergeClientSeed}
                mergeClientSeed={mergeClientSeed}
                severSeed={betDetailData.drawInfo.pfResult?.serverSeed}
                combinedHash={combinedHash}
                finalHash={betDetailData.drawInfo.pfResult?.finalHash}
            />

            <div className={`${Styles["client-seed-form"]} mt-3`}>
                <div className="flex items-center gap-4">
                    <Section
                        title={t(`${ResourceTypes.COMMON}.pf_verification_para_1`)}
                        customTitleStyles={`m-0 ${Styles["title-fix-width"]}`}
                    >
                        <div className="flex gap-2 items-center">
                        <Image 
                            src={`/static/images/sedie-multiplayer/bet-detail-${winningSubOption}.svg`} 
                            alt={`${winningSubOption} result`} 
                            width={IMAGE_SIZE} 
                            height={IMAGE_SIZE} 
                        />
                        </div>
                    </Section>
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
                                    {rawDigit} {"=>"} {item}
                                </span>
                            );
                        })}
                    </p>
                    <div className="mt-2 flex flex-col gap-1">
                        {diceIndexRender()}
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default PFVerification;
