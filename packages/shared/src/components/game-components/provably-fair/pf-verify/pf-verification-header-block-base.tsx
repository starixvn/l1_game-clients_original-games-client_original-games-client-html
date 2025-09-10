import { FC } from "react";
import Styles from "../provably-fair.module.scss";
import EditableTextInput from "../editable-text-input";
import { useCommonTranslate, useSNTranslate } from '@shared/react-hooks';
import CopyableTextInput from "../copyable-text-input";
import { Section } from "../pf-form-components";

const PFVerificationHeaderBlockBase: FC<{
    handleChangeMergeClientSeed: (event: React.ChangeEvent<HTMLInputElement>) => void;
    mergeClientSeed?: string;
    severSeed?: string;
    finalHash?: string;
    combinedHash?: string;
}> = ({ handleChangeMergeClientSeed, mergeClientSeed, severSeed, finalHash, combinedHash }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();

    return (
        <>
            <Section title={translateCommon("pf_ header_merge_client_seed")}>
                <EditableTextInput handleOnChangeValue={handleChangeMergeClientSeed} value={mergeClientSeed} />
            </Section>
            <Section title={translateCommon("pf_header_server_seed")}>
                <div className="input-group width-full mb-3">
                    <CopyableTextInput value={severSeed} id="server-seed" />
                </div>
            </Section>
            <Section title={translateCommon("pf_header_combined_sha512_hash")}>
                <p className={Styles["pf-word-break"]}>{finalHash}</p>
                {combinedHash === finalHash ? (
                    <p className={Styles["text-successful"]}>{translateSNGames("pf_verification_msg_verify_successful")}</p>
                ) : (
                    <p className={Styles["text-unsuccessful"]}>{translateSNGames("pf_verification_msg_verify_unsuccessful")}</p>
                )}
            </Section>
        </>
    );
};

export default PFVerificationHeaderBlockBase;
