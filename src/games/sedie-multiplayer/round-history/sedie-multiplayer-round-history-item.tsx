import { SeDieResult, SeDieSettlementResult } from "../sedie-multiplayer-constants";

export const SedieMultiplayerRoundHistoryItem = ({
    result,
    index,
}: {
    result: { result: SeDieResult; settlementResult: SeDieSettlementResult; roundId: number };
    index: number;
}) => {
    if (!result?.settlementResult) {
        return null;
    }
    const isOdd = result.settlementResult.odd;
    return <div key={index}>{isOdd ? <OddItem /> : <EvenItem />}</div>;
};

const OddItem = () => {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="8.5" fill="#960322" stroke="url(#paint0_linear_741_11701)" />
            <path
                d="M8.99854 13.1758C8.32666 13.1732 7.74854 13.0078 7.26416 12.6797C6.78239 12.3516 6.4113 11.8763 6.15088 11.2539C5.89307 10.6315 5.76546 9.88281 5.76807 9.00781C5.76807 8.13542 5.89697 7.39193 6.15479 6.77734C6.4152 6.16276 6.7863 5.69531 7.26807 5.375C7.75244 5.05208 8.32926 4.89062 8.99854 4.89062C9.66781 4.89062 10.2433 5.05208 10.7251 5.375C11.2095 5.69792 11.5819 6.16667 11.8423 6.78125C12.1027 7.39323 12.2316 8.13542 12.229 9.00781C12.229 9.88542 12.0988 10.6354 11.8384 11.2578C11.5806 11.8802 11.2108 12.3555 10.729 12.6836C10.2472 13.0117 9.67041 13.1758 8.99854 13.1758ZM8.99854 11.7734C9.45687 11.7734 9.82275 11.543 10.0962 11.082C10.3696 10.6211 10.505 9.92969 10.5024 9.00781C10.5024 8.40104 10.4399 7.89583 10.3149 7.49219C10.1925 7.08854 10.0181 6.78516 9.7915 6.58203C9.56755 6.37891 9.30322 6.27734 8.99854 6.27734C8.54281 6.27734 8.17822 6.50521 7.90479 6.96094C7.63135 7.41667 7.49333 8.09896 7.49072 9.00781C7.49072 9.6224 7.55192 10.1354 7.67432 10.5469C7.79932 10.9557 7.9751 11.263 8.20166 11.4687C8.42822 11.6719 8.69385 11.7734 8.99854 11.7734Z"
                fill="white"
            />
            <defs>
                <linearGradient id="paint0_linear_741_11701" x1="9" y1="0" x2="9" y2="18" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A10325" />
                    <stop offset="1" stopColor="#FB2956" />
                </linearGradient>
            </defs>
        </svg>
    );
};

const EvenItem = () => {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="8.5" fill="#2741C2" stroke="url(#paint0_linear_741_11705)" />
            <path d="M6.32764 13V5H11.7183V6.39453H8.01904V8.30078H11.4409V9.69531H8.01904V11.6055H11.7339V13H6.32764Z" fill="white" />
            <defs>
                <linearGradient id="paint0_linear_741_11705" x1="9" y1="0" x2="9" y2="18" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#274DC2" />
                    <stop offset="1" stopColor="#3D81FF" />
                </linearGradient>
            </defs>
        </svg>
    );
};
