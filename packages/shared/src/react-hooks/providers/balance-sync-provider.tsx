import React from "react";
import { useBalanceSync } from "../use-balance-sync";

interface BalanceSyncProviderProps {
    children: React.ReactNode;
}

export const BalanceSyncProvider: React.FC<BalanceSyncProviderProps> = ({ children }) => {
    useBalanceSync();

    return <>{children}</>;
};

export default BalanceSyncProvider;