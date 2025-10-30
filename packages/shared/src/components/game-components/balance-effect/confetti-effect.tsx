import { useRef, useCallback, useEffect } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import usePopupStore from "@shared/stores/popup-store/popup-store";

const ConfettiEffect = () => {
    const animationInstance = useRef(null);
    const isShowConfetti = usePopupStore((state) => state.isShowConfetti);  
    const toggleConfetti = usePopupStore((state) => state.toggleConfetti);

    const fireConfetti = useCallback(() => {
        if (!animationInstance.current) {
            return;
        }

        makeShot(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        makeShot(0.2, {
            spread: 60,
        });

        makeShot(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }, []);

    const getInstance = (instance: any) => {
        animationInstance.current = instance;
    };

    const makeShot = (particleRatio: number, opts: any) => {
        animationInstance.current &&
            animationInstance.current({
                ...opts,
                origin: { y: 0.5, x: 0.5 },
                particleCount: Math.floor(140 * particleRatio),
            });
    };

    useEffect(() => {
        if (isShowConfetti) {
            fireConfetti();
            toggleConfetti(false);
        }
    }, [isShowConfetti]);

    return (
        <ReactCanvasConfetti
            refConfetti={getInstance}
            style={{
                position: "absolute",
                pointerEvents: "none",
                width: "100%",
                height: "100%",
                top: 50,
                left: 0,
                zIndex: 9999,
            }}
        />
    );
};

export default ConfettiEffect;
