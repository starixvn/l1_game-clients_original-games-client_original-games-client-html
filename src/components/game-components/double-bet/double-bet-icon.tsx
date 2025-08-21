import { memo } from "react";
import { useRebet } from "../../../_shared/react-hooks/use-rebet";

const DoubleBetIcon = () => {
    const { isEnabled, handleClickRebet } = useRebet(true);

    return (
        <div
            className={`rounded-full w-[52px] h-[52px] flex items-center justify-center border border-solid bg-[#1a274999] border-[#0097ff33] transition-all duration-300 ${
                isEnabled ? "cursor-pointer hover:scale-110 opacity-100" : "opacity-50 cursor-auto"
            }"`}
            onClick={isEnabled ? handleClickRebet : undefined}
        >
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_1283_14656)">
                    <path
                        d="M18.1733 4.81702C19.6026 4.81707 20.7902 5.21926 21.7271 6.02991C22.668 6.84424 23.1352 7.96809 23.1353 9.38831C23.1353 10.4999 22.817 11.4738 22.1792 12.3043C21.7413 12.8749 21.0587 13.459 20.1392 14.0592C19.5548 14.4683 18.9772 14.8754 18.4058 15.278L18.4048 15.277C18.0218 15.5603 17.7162 15.8182 17.4858 16.0485C17.3158 16.2185 17.1897 16.3719 17.104 16.5084H21.8364C22.575 16.5084 23.1743 17.1077 23.1743 17.8463C23.1741 18.5847 22.5749 19.1832 21.8364 19.1832H15.3794C14.8004 19.1832 14.2578 18.9429 13.9009 18.5602C13.5424 18.1757 13.3701 17.6446 13.5425 17.0778C13.6104 16.8546 13.6921 16.6443 13.7866 16.4479L13.8862 16.2545C14.4109 15.2865 15.3297 14.3255 16.6333 13.3707C17.79 12.5195 18.5296 11.9505 18.8569 11.6617H18.8579C19.7268 10.9078 20.1479 10.108 20.1479 9.26233C20.1479 8.83275 20.0348 8.45571 19.8081 8.12854L19.7036 7.99084C19.368 7.58199 18.9006 7.37463 18.2896 7.37463C17.4518 7.37474 16.909 7.66793 16.6255 8.23499V8.23596C16.5752 8.33478 16.5307 8.45094 16.4937 8.58459C16.2866 9.3313 15.7072 10.0055 14.894 10.0055C14.0952 10.0053 13.4033 9.34773 13.5493 8.53479C13.7156 7.60912 14.0645 6.8437 14.6001 6.24377L14.7632 6.06995C15.5988 5.23136 16.7399 4.81702 18.1733 4.81702Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="0.2"
                    />
                    <path
                        d="M9.45722 14.4098L11.371 17.0052C12.0059 17.8662 11.3912 19.0833 10.3214 19.0833C9.8755 19.0833 9.46049 18.8554 9.22112 18.4792L7.85459 16.3312L6.48519 18.4951C6.25347 18.8613 5.85034 19.0833 5.41701 19.0833C4.38231 19.0833 3.78586 17.9081 4.39671 17.0729L6.3446 14.4098L4.54145 11.9714C3.91888 11.1296 4.51988 9.93762 5.56695 9.93762C5.99981 9.93762 6.40313 10.1572 6.63811 10.5207L7.97502 12.589L9.27861 10.5162C9.50508 10.1561 9.90063 9.93762 10.326 9.93762C11.3441 9.93762 11.9265 11.0985 11.3179 11.9146L9.45722 14.4098Z"
                        fill="white"
                    />
                </g>
                <defs>
                    <filter
                        id="filter0_d_1283_14656"
                        x="0.150879"
                        y="0.716675"
                        width="27.123"
                        height="22.5667"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                    >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                        />
                        <feOffset />
                        <feGaussianBlur stdDeviation="2" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0" />
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1283_14656" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1283_14656" result="shape" />
                    </filter>
                </defs>
            </svg>
        </div>
    );
};

export default memo(DoubleBetIcon);
