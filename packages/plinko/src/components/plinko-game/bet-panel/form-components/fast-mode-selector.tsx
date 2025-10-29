import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePlinkoSettingStore } from "@plinko/shared/stores/plinko-setting-store";
import Label from "./label";
import { useTranslator } from "@shared";
import { useGameContext } from "@shared/react-contexts";

export const FastModeSelector = ({ isDisabled }: { isDisabled: boolean }) => {
    const { isInstantMode, toggleInstantMode } = usePlinkoSettingStore(
        useShallow((state) => ({ isInstantMode: state.isInstantMode, toggleInstantMode: state.actions.toggleInstantMode }))
    );
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);
    return (
        <div className="flex items-center justify-between pr-1">
            <Label title={t("fast_mode")} />
            <input
                type="checkbox"
                className="input-checkbox disabled:opacity-50 mb-2"
                checked={isInstantMode}
                onChange={toggleInstantMode}
                disabled={isDisabled}
            />
        </div>
    );
};

export default memo(FastModeSelector);
