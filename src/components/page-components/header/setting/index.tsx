import { SettingEventActionType, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useClickSound } from "../../../../_shared/react-hooks";
import Styles from "./setting.module.scss";

const Setting = () => {
    const clickSound = useClickSound();

    const settingDispatch = useSettingDispatch();
    const openSetting = () => {
        console.log("[Header.Setting] open.click");
        document.body.classList.add("overflow-hidden");
        clickSound();
        console.log("[Header.Setting] dispatch.toggle", { isShowedSetting: true });
        settingDispatch({
            type: SettingEventActionType.TOGGLE_SETTING,
            payload: {
                isShowedSetting: true,
            },
        });
    };
    return (
        <button className={Styles["button-setting"]} onClick={openSetting}>
            <span className={`icon-setting ${Styles["icon-setting"]}`} />
        </button>
    );
};
export default Setting;
