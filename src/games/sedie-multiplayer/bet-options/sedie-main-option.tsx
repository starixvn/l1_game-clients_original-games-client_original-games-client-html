import dynamic from "next/dynamic";
import styles from "./style.module.scss";
import { SeDieBetOptions } from "../sedie-multiplayer-constants";
const Odds = dynamic(() => import("../../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../../components/game-components/bet-option/own-bet"));
const TotalBet = dynamic(() => import("../../../components/game-components/bet-option/total-bet"));
const RippleButton = dynamic(() => import("../../../components/game-components/bet-option/ripple-button"));
const BetChoice = dynamic(() => import("../../../components/game-components/bet-option/bet-choice"));
const HighlightBetOption = dynamic(() => import("./highlight-bet-option"));
const ChipEffect = dynamic(() => import("../../../components/game-components/bet-option/chip-effect"));

export const SedieMultiplayerMainOption = ({ tolgeeNamespace, choice }: { tolgeeNamespace: string; choice: string }) => {
    const choiceStyle = styles[choice];
    const buttonId = `${tolgeeNamespace}-choice-${choice}`;

    return (
        <div className="relative">
            <div className={` text-white relative w-[180px] h-[138px] flex flex-col justify-around ${choiceStyle}`}>
                <div className="absolute top-0 left-0 w-full h-full z-[var(--bg-index)]">
                    {choice === SeDieBetOptions.ODD ? <BgOdd /> : <BgEven />}
                </div>
                <TotalBet choice={choice} className={"h-6 pt-1 flex items-center justify-center"} tolgeeNamespace={tolgeeNamespace} />
                <div>
                    <BetChoice tolgeeNamespace={tolgeeNamespace} choice={choice} className=" text-xl font-bold" />
                    <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} isFormatOddsAuto={true} className={"text-lg"} />
                </div>
                <div className="h-5">
                    <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} />
                </div>
                <RippleButton className={`${styles["btn-ripple"]}`} id={buttonId} choice={choice} />
            </div>
            <ChipEffect choice={choice} />
            <HighlightBetOption choice={choice} />
        </div>
    );
};
const BgEven = () => {
    return (
        <svg width="181" height="137" viewBox="0 0 181 137" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect
                x="-0.5"
                y="0.5"
                width="179"
                height="135"
                rx="19.5"
                transform="matrix(-1 0 0 1 179.5 0.75)"
                fill="#131C38"
                fillOpacity="0.8"
                stroke="url(#paint0_linear_503_21830)"
            />
            <mask id="mask0_503_21830" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="181" height="137">
                <rect
                    x="-0.5"
                    y="0.5"
                    width="179"
                    height="135"
                    rx="19.5"
                    transform="matrix(-1 0 0 1 179.5 0.75)"
                    fill="#131C38"
                    stroke="url(#paint1_linear_503_21830)"
                />
            </mask>
            <g mask="url(#mask0_503_21830)">
                <g filter="url(#filter0_f_503_21830)">
                    <ellipse cx="89.0039" cy="135.25" rx="63" ry="59.5" fill="#1658FF" />
                </g>
                <g filter="url(#filter1_f_503_21830)">
                    <ellipse cx="89.0039" cy="135.25" rx="63" ry="59.5" fill="#1658FF" />
                </g>
            </g>
            <defs>
                <filter
                    id="filter0_f_503_21830"
                    x="-83.9961"
                    y="-34.25"
                    width="346"
                    height="339"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="55" result="effect1_foregroundBlur_503_21830" />
                </filter>
                <filter
                    id="filter1_f_503_21830"
                    x="-83.9961"
                    y="-34.25"
                    width="346"
                    height="339"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="55" result="effect1_foregroundBlur_503_21830" />
                </filter>
                <linearGradient
                    id="paint0_linear_503_21830"
                    x1="64.5"
                    y1="139.971"
                    x2="64.5735"
                    y2="4.0451e-05"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#0C8AFF" />
                    <stop offset="1" stopColor="#23244B" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_503_21830"
                    x1="170.11"
                    y1="5.70803"
                    x2="4.94435"
                    y2="9.64939"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopOpacity="0" />
                    <stop offset="1" stopColor="#8A9ED1" />
                </linearGradient>
            </defs>
        </svg>
    );
};
const BgOdd = () => {
    return (
        <svg width="181" height="138" viewBox="0 0 181 138" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="179" height="136" rx="19.5" fill="#131C38" fillOpacity="0.8" stroke="url(#paint0_linear_503_21848)" />

            <mask id="mask0_503_21848" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="181" height="138">
                <rect x="0.5" y="0.5" width="180" height="137" rx="20" fill="#131C38" />
            </mask>

            <g mask="url(#mask0_503_21848)">
                <g filter="url(#filter0_f_503_21848)">
                    <ellipse cx="96.5" cy="134" rx="63" ry="59.5" fill="#D80432" />
                </g>
                <g filter="url(#filter1_f_503_21848)">
                    <ellipse cx="96.5" cy="134" rx="63" ry="59.5" fill="#D80432" fillOpacity="0.5" />
                </g>
            </g>

            <defs>
                <filter
                    id="filter0_f_503_21848"
                    x="-76.5"
                    y="-35.5"
                    width="346"
                    height="339"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="55" result="effect1_foregroundBlur_503_21848" />
                </filter>

                <filter
                    id="filter1_f_503_21848"
                    x="-76.5"
                    y="-35.5"
                    width="346"
                    height="339"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="55" result="effect1_foregroundBlur_503_21848" />
                </filter>

                <linearGradient id="paint0_linear_503_21848" x1="91" y1="137.5" x2="91.0725" y2="0.500042" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF0921" />
                    <stop offset="1" stopColor="#23244B" />
                </linearGradient>
            </defs>
        </svg>
    );
};
