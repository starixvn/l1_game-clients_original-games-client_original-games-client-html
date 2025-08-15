import { createHash } from "crypto";
import { FC, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslator } from "../../../_shared/react-hooks";
import { PFVerificationHeaderBlockBase, DefaultPFStyles as Styles } from "../../../components/game-components/provably-fair";
import { Section } from "../../../components/game-components/provably-fair/pf-form-components";
import { usePFContext, usePFDispatch } from "../../../_shared/react-contexts/game-state-context/pf/pf-context";
import { PFEventActionType } from "../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { Markup } from "interweave";
import PfRoundBaseHelper from "../../../_shared/helpers/pf/pf-round-base-helper";
import { ResourceTypes } from "../../../_shared/resources";
import { useGameContext } from "../../../_shared/react-contexts";

const PFVerification: FC = () => {
    const { tolgeeNamespace } = useGameContext();
    const { pfVerifyModalData: pfResult } = usePFContext();
    const [mergeClientSeed, setMergeClientSeed] = useState(pfResult?.editedMergeClientSeed || pfResult?.mergeClientSeed || "");
    const dispatch = usePFDispatch();
    const { t } = useTranslator();
    const { t: translateInGame } = useTranslator([tolgeeNamespace]);
    const [combinedHash, setCombinedHash] = useState(pfResult.finalHash);

    const BALLS_EACH_ROUND = 6; // Updated for Sedie Multi Player
    const TOTAL_BALLS = 60;

    const verifyInfo = useMemo(
        () =>
            PfRoundBaseHelper.buildVerifyInfo({
                pfResult,
                combinedHash,
                totalBalls: TOTAL_BALLS,
                ballsEachRound: BALLS_EACH_ROUND,
            }),
        [combinedHash]
    );

    const handleChangeMergeClientSeed = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        setMergeClientSeed(input.value);
    };

    const ballIndexRender = () => {
        return Array.from(Array(BALLS_EACH_ROUND), (_, index) => {
            const { randomNumbers, convertNumber, ballIndexes } = verifyInfo;
            const ballIndexText = t(`${ResourceTypes.SABA_NUMBER}.pf_verifier_tool_ball`, {
                value: index + 1,
            });

            const line = `<span style="color: #ffbc11; font-weight: 600">${ballIndexText} - ${t(
                `${ResourceTypes.SABA_NUMBER}.pf_index`
            )} (1-${TOTAL_BALLS - index})</span> = ((${randomNumbers[index]}+${convertNumber[index]}) mod ${TOTAL_BALLS - index
                }) + 1 = <span style="color: #ffbc11; font-weight: 600">${ballIndexes[index]}</span>`;

            return (
                <p key={index}>
                    <Markup content={line} />
                </p>
            );
        });
    };

    const renderFinalResult = () => {
        const { remainingBalls, ballIndexes } = verifyInfo;
        const finalResult = [];

        for (let i = 0; i < BALLS_EACH_ROUND; i++) {
            finalResult.push(
                <div key={`final-result-${i}`} style={{ marginBottom: "1rem" }}>
                    <div className={Styles["section-title"]}>
                        {t(`${ResourceTypes.SABA_NUMBER}.pf_verifier_tool_ball`, { value: i + 1 })} -{" "}
                        {t(`${ResourceTypes.COMMON}.pf_verification_para_1`)}
                    </div>
                    <div className={Styles["result-numbers"]}>
                        {remainingBalls[i].map((item, index) => {
                            return index + 1 === ballIndexes[i] ? (
                                <span key={uuidv4()} className={Styles["text-yellow"]}>
                                    {item}{" "}
                                </span>
                            ) : (
                                `${item} `
                            );
                        })}
                    </div>
                </div>
            );
        }

        return finalResult;
    };

    useEffect(() => {
        const mergeSeed = `${pfResult.serverSeed}${mergeClientSeed}`;
        const hash = createHash("sha512").update(mergeSeed).digest("hex");
        setCombinedHash(hash);

        return () => {
            dispatch({
                type: PFEventActionType.UPDATE_PF_VERIFY,
                payload: {
                    pfVerifyModalData: {
                        ...pfResult,
                        editedMergeClientSeed: mergeClientSeed,
                    },
                },
            });
        };
    }, [mergeClientSeed]);

    const hightlightStyle = Styles["text-highlight"];

    return (
        <div className={Styles["pf-setting-container"]}>
            <PFVerificationHeaderBlockBase
                handleChangeMergeClientSeed={handleChangeMergeClientSeed}
                mergeClientSeed={mergeClientSeed}
                severSeed={pfResult?.serverSeed}
                combinedHash={combinedHash}
                finalHash={pfResult?.finalHash}
            />

            <div className={Styles["client-seed-form"]}>
                <div className="flex items-center gap-4">
                    <Section
                        title={t(`${ResourceTypes.COMMON}.pf_verification_para_1`)}
                        customTitleStyles={`m-0 ${Styles["title-fix-width"]}`}
                    >
                        <div className="flex gap-2 items-center">
                            {verifyInfo.results.map((item) => (
                                <span key={uuidv4()} className="ball-number">{item}</span>
                            ))}
                        </div>
                    </Section>
                </div>
                <Section title={t(`${ResourceTypes.COMMON}.pf_header_combined_sha512_hash`)} customTitleStyles="mt-2">
                    <p className="text-wrap">{combinedHash}</p>
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
                    <p className="break-word">
                        <span className={hightlightStyle}>{t(`${ResourceTypes.SABA_NUMBER}.pf_verification_para_4`)}</span>
                        <span>
                            {" "}
                            = (({t(`${ResourceTypes.SABA_NUMBER}.pf_algorithm_random_number`)} + X) mod{" "}
                            {t(`${ResourceTypes.SABA_NUMBER}.pf_verification_para_5`)}) + 1
                        </span>
                    </p>

                    {ballIndexRender()}
                </Section>

                <Section title={t(`${ResourceTypes.SABA_NUMBER}.pf_verification_para_8`)}>{renderFinalResult()}</Section>
            </div>
        </div>
    );
};

export default PFVerification;
