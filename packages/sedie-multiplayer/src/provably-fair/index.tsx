import { formatDate } from "../../../_shared/helpers";
import PFVerification from "./pf-verification";
import renderPFVerifyResultBlock from "./render-pf-verify-result-block";

const makeFileNameExport = (roundId: number) => {
    return `ROUND_${roundId}_${formatDate(new Date(), "ddMMyyyy")}.csv`;
};

export { renderPFVerifyResultBlock, PFVerification, makeFileNameExport };
