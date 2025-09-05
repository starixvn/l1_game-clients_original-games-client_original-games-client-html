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
                        onClick={() => sendMessageToParent(IFRAME_MESSAGES.BACK_TO_ORIGINAL_PAGE)}
                        role="button"
                        aria-label="Back"
                    >
                        <i className="icon-back text-lg"></i>
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
