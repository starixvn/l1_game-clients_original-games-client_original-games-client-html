import { memo, useEffect, useState } from "react";
import { useAutoRebet } from "../../../_shared/react-hooks/use-auto-rebet";
import AutoRebetPopup from "./auto-rebet-popup";
import useBettingStore from "../../../_shared/stores/betting-store/betting-store";

const AutoRebetIcon = () => {
    const isAutoRebetActive = useBettingStore((state) => state.isAutoRebetActive);
    const { remainingRounds, startAutoRebet, stopAutoRebet, isEnabled: isRebetEnabled } = useAutoRebet();
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        setIsEnabled(isRebetEnabled || isAutoRebetActive);
    }, [isRebetEnabled, isAutoRebetActive]);

    const handleIconClick = () => {
        if (isEnabled) {
            if (isAutoRebetActive) {
                stopAutoRebet();
            } else {
                setIsPopupOpen(true);
            }
        }
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleConfirmAutoRebet = (rounds: number) => {
        startAutoRebet(rounds);
        setIsPopupOpen(false);
    };

    return (
        <>
            <div
                className={`rounded-full w-[52px] h-[52px] flex items-center justify-center border border-solid bg-[#1a274999] border-[#0097ff33] transition-all duration-300 ${
                    isEnabled ? "cursor-pointer hover:scale-110 opacity-100" : "opacity-50 cursor-auto"
                }"`}
                onClick={handleIconClick}
            >
                {isAutoRebetActive ? (
                    <>
                        <div className="absolute">
                            <div className="relative -top-[16px] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white flex items-center justify-center font-bold">
                                {remainingRounds === Infinity ? "∞" : remainingRounds}
                            </div>
                        </div>
                        <IconStopAutoRebet />
                    </>
                ) : (
                    <IconRebet />
                )}
            </div>

            {isPopupOpen && <AutoRebetPopup onClose={handleClosePopup} onConfirm={handleConfirmAutoRebet} />}
        </>
    );
};
const IconRebet = () => {
    return (
        <svg width="32" height="30" viewBox="0 0 32 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_1283_14695)">
                <path
                    d="M15.7227 4.87024C18.1693 4.60407 20.6301 5.23301 22.6494 6.63977C24.6685 8.04648 26.1099 10.1366 26.708 12.5236C27.3061 14.9108 27.0208 17.4344 25.9033 19.6271C24.7858 21.8197 22.9119 23.5334 20.6289 24.4523C18.3458 25.3711 15.8073 25.4324 13.4824 24.6251C11.5345 23.9487 9.84684 22.7011 8.63184 21.0577C8.24086 20.5289 8.44382 19.7955 9.01465 19.4689C9.5854 19.1424 10.3063 19.348 10.7158 19.8624C11.6315 21.0128 12.8595 21.8885 14.2637 22.3761C16.0449 22.9946 17.99 22.9472 19.7393 22.2433C21.4887 21.5392 22.9249 20.2252 23.7812 18.545C24.6374 16.865 24.8567 14.9317 24.3984 13.1027C23.9401 11.2734 22.8345 9.67182 21.2871 8.59387C19.7399 7.51611 17.855 7.03452 15.9805 7.2384C14.1058 7.44235 12.3682 8.31791 11.0889 9.70325C10.492 10.3497 10.0139 11.0871 9.66797 11.881L11.7441 12.4952C12.1361 12.6113 12.2308 13.1237 11.9062 13.3722L7.6084 16.6603C7.33923 16.8662 6.94686 16.75 6.83301 16.4308L5.01562 11.3341C4.87826 10.949 5.23581 10.5708 5.62793 10.6866L7.37109 11.2013C7.82904 10.0617 8.49223 9.00492 9.33887 8.08801C11.0085 6.27991 13.276 5.13641 15.7227 4.87024ZM17.3496 10.3693C17.7138 10.3694 17.954 10.5631 18.0703 10.9513L20.4795 18.8156C20.557 19.0658 20.545 19.2645 20.4443 19.4113C20.3513 19.5581 20.1878 19.632 19.9551 19.632H19.1875C18.823 19.632 18.5822 19.4333 18.4658 19.0363L18.1172 17.6886H15.5225L15.1738 19.0363C15.073 19.4332 14.836 19.6319 14.4639 19.632H13.6953C13.4628 19.6319 13.2961 19.558 13.1953 19.4113C13.1024 19.2645 13.0944 19.0659 13.1719 18.8156L15.5811 10.9513C15.6974 10.5631 15.9375 10.3693 16.3018 10.3693H17.3496ZM16.6973 13.0636C16.6585 13.2275 16.6198 13.4 16.5811 13.5812C16.55 13.7625 16.5153 13.9275 16.4766 14.0743L15.999 15.8751H17.6396L17.1748 14.0743C17.136 13.9275 17.0974 13.7625 17.0586 13.5812C17.0276 13.4 16.9919 13.2276 16.9531 13.0636C16.9143 12.8736 16.8757 12.6792 16.8369 12.4806H16.8135C16.7747 12.6792 16.736 12.8737 16.6973 13.0636Z"
                    fill="white"
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_1283_14695"
                    x="0.98584"
                    y="0.810547"
                    width="30.0278"
                    height="28.3784"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1283_14695" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1283_14695" result="shape" />
                </filter>
            </defs>
        </svg>
    );
};

const IconStopAutoRebet = () => {
    return (
        <svg width="32" height="30" viewBox="0 0 32 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_583_29267)">
                <path
                    d="M15.7227 4.87056C18.1693 4.60438 20.6301 5.23234 22.6494 6.63911C24.6687 8.04588 26.1109 10.1367 26.709 12.5239C27.3069 14.9109 27.0207 17.4339 25.9033 19.6264C24.7858 21.8191 22.912 23.5337 20.6289 24.4526C18.3459 25.3713 15.8072 25.4327 13.4824 24.6254C11.5344 23.949 9.84686 22.7006 8.63184 21.0571C8.24091 20.5283 8.44398 19.7959 9.01465 19.4692C9.58534 19.1426 10.3062 19.3475 10.7158 19.8618C11.6315 21.0122 12.8595 21.8878 14.2637 22.3754C16.0451 22.994 17.9908 22.9467 19.7402 22.2426C21.4894 21.5385 22.925 20.2253 23.7812 18.5454C24.6376 16.8652 24.8568 14.9313 24.3984 13.102C23.9401 11.2729 22.8353 9.67112 21.2881 8.59322C19.7407 7.51528 17.8552 7.0338 15.9805 7.23775C14.1059 7.44169 12.3682 8.31729 11.0889 9.70259C10.492 10.349 10.0139 11.0866 9.66797 11.8803L11.7441 12.4946C12.1362 12.6105 12.2309 13.123 11.9062 13.3715L7.6084 16.6596C7.33928 16.8655 6.94695 16.7502 6.83301 16.4311L5.01562 11.3335C4.87844 10.9484 5.23596 10.5704 5.62793 10.686L7.37109 11.2016C7.82906 10.0617 8.49204 9.00446 9.33887 8.08736C11.0084 6.27931 13.2761 5.13678 15.7227 4.87056ZM19 10.9995C20.1046 10.9995 21 11.8949 21 12.9995V16.9995C21 18.104 20.1046 18.9995 19 18.9995H15C13.8955 18.9994 13 18.1039 13 16.9995V12.9995C13 11.895 13.8955 10.9996 15 10.9995H19Z"
                    fill="white"
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_583_29267"
                    x="0.985718"
                    y="0.810745"
                    width="30.0286"
                    height="28.3785"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_583_29267" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_583_29267" result="shape" />
                </filter>
            </defs>
        </svg>
    );
};
export default memo(AutoRebetIcon);
