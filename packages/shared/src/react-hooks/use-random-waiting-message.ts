import { useEffect, useState, useRef } from "react";

// Waiting messages for different locales
const waitingMessages: Record<string, string[]> = {
    en: ["If this is your first visit, downloading may take a while", "Checking and downloading the latest update packages..."],
    vi: ["Lần truy cập đầu tiên, việc tải dữ liệu sẽ mất chút thời gian.", "Đang kiểm tra và tải gói cập nhật game mới nhất..."],
    id: [
        "Jika ini adalah kunjungan pertama Anda, pengunduhan mungkin memakan waktu cukup lama.",
        "Memeriksa dan mengunduh paket pembaruan terbaru...",
    ],
    th: ["หากคุณเข้าชมครั้งแรก อาจใช้เวลาในการดาวน์โหลดสักครู่", "กำลังตรวจสอบและกำลังดาวน์โหลดเกมของการอัพเดทล่าสุด"],
    zh_cn: ["如果这是您第一次访问，下载可能需要一段时间。", "正在检查和下载最新的更新包..."],
    zh_tw: ["如果這是您第一次訪問，下載可能需要一段時間。", "正在檢查和下載最新的更新包..."],
    ja: ["初回アクセス時は、ダウンロードに時間がかかる場合があります。", "最新のアップデートパッケージを確認し、ダウンロードしています..."],
};

export interface UseRandomWaitingMessageOptions {
    locale?: string;
    appTypeClass?: string;
    interval?: number; // Total cycle time in ms (default: 5000)
    showDuration?: number; // How long to show message in ms (default: 4000)
}

export const useRandomWaitingMessage = ({
    locale = "en",
    appTypeClass,
    interval = 5000,
    showDuration = 4000,
}: UseRandomWaitingMessageOptions = {}) => {
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const fadeOutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentIndexRef = useRef<number>(0);

    useEffect(() => {
        const messages = waitingMessages[locale] || waitingMessages.en;

        if (messages.length === 0) {
            return;
        }

        const handleFadeOut = () => {
            setIsVisible(false);
            setIsFadingOut(true);
        };

        const handleFadeIn = () => {
            setCurrentMessage(messages[currentIndexRef.current]);
            setIsVisible(true);
            fadeOutTimeoutRef.current = setTimeout(handleFadeOut, showDuration);
        };

        const showMessage = () => {
            setIsFadingOut(false);
            setIsVisible(false);
            requestAnimationFrame(handleFadeIn);
        };

        showMessage();

        intervalRef.current = setInterval(() => {
            currentIndexRef.current = (currentIndexRef.current + 1) % messages.length;
            showMessage();
        }, interval);

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (fadeOutTimeoutRef.current) {
                clearTimeout(fadeOutTimeoutRef.current);
            }
        };
    }, [locale, interval, showDuration]);

    return {
        message: currentMessage,
        isVisible,
        isFadingOut,
        className: appTypeClass,
    };
};

