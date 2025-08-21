import { useEffect, useState } from "react";
import usePFStore from "../stores/pf-store/pf-store";

export const useClientSeedPF = () => {
    const pfClientSeedSetting = usePFStore((state) => state.pfClientSeedSetting);
    const [clientSeed, setClientSeed] = useState("");
    useEffect(() => {
        let seed = pfClientSeedSetting?.useManualClientSeed ? pfClientSeedSetting?.manualClientSeed : pfClientSeedSetting?.randomClientSeed;
        if (!seed || String(seed).length === 0) {
            seed = pfClientSeedSetting?.randomClientSeed || "0000";
        }
        setClientSeed(seed);
    }, [pfClientSeedSetting]);
    return { clientSeed, setClientSeed };
};
