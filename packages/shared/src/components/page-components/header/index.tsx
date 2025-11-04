import { IFRAME_MESSAGES, sendMessageToParent } from "@shared/utils/iframe-messages";
import { UserInfo } from "./user-info";
import styles from "./header.module.scss";
import { getAppSettings } from "@shared/app-settings";

const Header = () => {
    const appType = getAppSettings().appType;

    return (
        <header className={`${styles.header} md:hidden`} data-testid="header">
            <div className="flex justify-between items-center w-full max-w-[1208px] mx-auto px-4">
                <div className="flex flex-1 gap-2 items-center">
                    {appType === 10 && (
                        <div
                            className="bg-primary-bg rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80"
                            onClick={() => sendMessageToParent(IFRAME_MESSAGES.BACK_TO_ORIGINAL_PAGE)}
                            role="button"
                            aria-label="Back"
                        >
                            <i className="icon-back text-lg"></i>
                        </div>
                    )}
                </div>
                <div className="flex flex-1 items-center justify-end">
                    <UserInfo />
                </div>
            </div>
        </header>
    );
};

export default Header;
