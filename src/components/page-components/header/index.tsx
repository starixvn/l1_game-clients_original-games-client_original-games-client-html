import { IFRAME_MESSAGES, sendMessageToParent } from "../../../_shared/utils/iframe-messages";
import HeaderTitle from "./header-title";
import { UserInfo } from "./user-info";
import { useGlobalEventsStore } from "../../../_shared/stores/global-events-store/global-events-store";
import styles from "./header.module.scss";
const Header = ({ tolgeeNamespace }: { tolgeeNamespace: string }) => {
    const { openingGameId } = useGlobalEventsStore();

    return (
        <header className={`${styles.header}`} data-testid="header">
            <div className="flex justify-between items-center w-full max-w-[1208px] mx-auto px-4">
                <div className="flex flex-1 gap-2 items-center">
                    <div
                        className="bg-primary-bg rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80"
                        onClick={() => sendMessageToParent(IFRAME_MESSAGES.BACK_TO_HOME)}
                        role="button"
                        aria-label="Back"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M5.18568 8.43376L10.6764 2.94304C11.2671 2.35232 12.2211 2.35232 12.8118 2.94304C13.4026 3.53376 13.4026 4.48776 12.8118 5.07848L8.38737 9.5L12.8118 13.9215C13.4026 14.5122 13.4026 15.4662 12.8118 16.057C12.2211 16.6477 11.2671 16.6477 10.6764 16.057L5.18568 10.5662C4.59792 9.97848 4.59792 9.02152 5.18568 8.43376Z"
                                fill="white"
                            />
                        </svg>
                    </div>
                    <HeaderTitle openingGameId={openingGameId} tolgeeNamespace={tolgeeNamespace} />
                </div>
                <div className="flex flex-1 items-center justify-end">
                    <UserInfo />
                </div>
            </div>
        </header>
    );
};

export default Header;
