import { memo, useRef } from "react";
import Image from "next/image";
import { buildVersion } from "@shared/constants";
import styles from "./particles.module.scss";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Particle data structure
interface ParticleData {
    id: number;
    top: string;
    left: string;
    width: string;
    height: string;
    delay: string;
    duration: string;
    isRight?: boolean;
}

// Particle configuration
const particles: ParticleData[] = [
    { id: 1, top: "8%", left: "15%", width: "3px", height: "3px", delay: "0s", duration: "12s" },
    { id: 2, top: "12%", left: "35%", width: "2.5px", height: "2.5px", delay: "2s", duration: "15s" },
    { id: 4, top: "10%", left: "65%", width: "3.5px", height: "3.5px", delay: "1s", duration: "13s", isRight: true },
    { id: 5, top: "25%", left: "75%", width: "2px", height: "2px", delay: "3s", duration: "11s", isRight: true },
    { id: 7, top: "45%", left: "25%", width: "2px", height: "2px", delay: "4s", duration: "14s" },
    { id: 8, top: "60%", left: "80%", width: "3px", height: "3px", delay: "1.5s", duration: "16s", isRight: true },
    { id: 10, top: "35%", left: "45%", width: "2.5px", height: "2.5px", delay: "2.5s", duration: "13s", isRight: true },
    { id: 11, top: "50%", left: "55%", width: "2px", height: "2px", delay: "3.2s", duration: "11s" },
    { id: 12, top: "70%", left: "85%", width: "3.5px", height: "3.5px", delay: "0.8s", duration: "17s", isRight: true },
    { id: 13, top: "15%", left: "50%", width: "2.5px", height: "2.5px", delay: "4.2s", duration: "12s" },
    { id: 14, top: "80%", left: "90%", width: "2px", height: "2px", delay: "1.8s", duration: "15s", isRight: true },
    { id: 15, top: "55%", left: "30%", width: "3px", height: "3px", delay: "3.5s", duration: "10s" },
    { id: 16, top: "40%", left: "70%", width: "2.5px", height: "2.5px", delay: "2.1s", duration: "18s", isRight: true },
    { id: 17, top: "75%", left: "40%", width: "2px", height: "2px", delay: "0.5s", duration: "14s" },
    { id: 18, top: "28%", left: "60%", width: "3px", height: "3px", delay: "3.8s", duration: "13s", isRight: true },
    { id: 19, top: "20%", left: "10%", width: "3px", height: "3px", delay: "1.2s", duration: "14s" },
    { id: 20, top: "35%", left: "20%", width: "2.5px", height: "2.5px", delay: "2.8s", duration: "16s" },
    { id: 21, top: "55%", left: "15%", width: "2px", height: "2px", delay: "4.5s", duration: "12s" },
    { id: 22, top: "70%", left: "35%", width: "3px", height: "3px", delay: "1.8s", duration: "15s" },
    { id: 23, top: "30%", left: "85%", width: "2.5px", height: "2.5px", delay: "3.1s", duration: "11s", isRight: true },
    { id: 24, top: "50%", left: "65%", width: "2px", height: "2px", delay: "4.8s", duration: "17s", isRight: true },
    { id: 25, top: "75%", left: "50%", width: "3.5px", height: "3.5px", delay: "1.3s", duration: "13s" },
    { id: 26, top: "18%", left: "75%", width: "2.5px", height: "2.5px", delay: "5.1s", duration: "14s", isRight: true },
    { id: 27, top: "85%", left: "25%", width: "2px", height: "2px", delay: "2.4s", duration: "16s" },
    { id: 28, top: "60%", left: "10%", width: "3px", height: "3px", delay: "4.2s", duration: "12s" },
    { id: 29, top: "40%", left: "90%", width: "2.5px", height: "2.5px", delay: "2.9s", duration: "18s", isRight: true },
    { id: 30, top: "80%", left: "60%", width: "2px", height: "2px", delay: "1.1s", duration: "15s" },
    { id: 31, top: "25%", left: "40%", width: "3px", height: "3px", delay: "4.6s", duration: "13s" },
    { id: 32, top: "45%", left: "80%", width: "2.5px", height: "2.5px", delay: "3.7s", duration: "16s", isRight: true },
    { id: 33, top: "65%", left: "70%", width: "3px", height: "3px", delay: "2.2s", duration: "14s", isRight: true },
    { id: 34, top: "20%", left: "55%", width: "2px", height: "2px", delay: "4.9s", duration: "17s" },
    { id: 35, top: "90%", left: "45%", width: "3.5px", height: "3.5px", delay: "1.7s", duration: "11s" },
    { id: 36, top: "22%", left: "85%", width: "2px", height: "2px", delay: "5.3s", duration: "19s", isRight: true },
    { id: 37, top: "22%", left: "12%", width: "3px", height: "3px", delay: "1.4s", duration: "15s" },
    { id: 38, top: "35%", left: "72%", width: "2.5px", height: "2.5px", delay: "3.0s", duration: "17s", isRight: true },
    { id: 39, top: "55%", left: "78%", width: "2px", height: "2px", delay: "4.7s", duration: "13s", isRight: true },
    { id: 40, top: "70%", left: "22%", width: "3px", height: "3px", delay: "2.0s", duration: "16s" },
    { id: 41, top: "30%", left: "48%", width: "2.5px", height: "2.5px", delay: "3.3s", duration: "12s" },
    { id: 42, top: "50%", left: "32%", width: "2px", height: "2px", delay: "5.0s", duration: "18s" },
    { id: 43, top: "75%", left: "95%", width: "3.5px", height: "3.5px", delay: "1.5s", duration: "14s", isRight: true },
    { id: 44, top: "16%", left: "88%", width: "2.5px", height: "2.5px", delay: "5.2s", duration: "15s", isRight: true },
    { id: 45, top: "85%", left: "5%", width: "2px", height: "2px", delay: "2.6s", duration: "17s" },
    { id: 46, top: "60%", left: "95%", width: "3px", height: "3px", delay: "4.4s", duration: "13s", isRight: true },
    { id: 47, top: "40%", left: "95%", width: "2.5px", height: "2.5px", delay: "3.1s", duration: "19s", isRight: true },
    { id: 48, top: "80%", left: "8%", width: "2px", height: "2px", delay: "1.3s", duration: "16s" },
    { id: 49, top: "25%", left: "95%", width: "3px", height: "3px", delay: "4.8s", duration: "14s", isRight: true },
    { id: 50, top: "45%", left: "18%", width: "2.5px", height: "2.5px", delay: "3.9s", duration: "17s" },
    { id: 51, top: "65%", left: "82%", width: "3px", height: "3px", delay: "2.4s", duration: "15s", isRight: true },
    { id: 52, top: "20%", left: "68%", width: "2px", height: "2px", delay: "5.1s", duration: "18s", isRight: true },
    { id: 53, top: "90%", left: "28%", width: "3.5px", height: "3.5px", delay: "1.9s", duration: "12s" },
    { id: 54, top: "24%", left: "58%", width: "2px", height: "2px", delay: "5.5s", duration: "20s" },
];

// Particle component
interface ParticleProps {
    particle: ParticleData;
}

const Particle: React.FC<ParticleProps> = ({ particle }) => {
    const classes = [
        styles.particle,
        styles[`particle-${particle.id}`],
        styles["particle-cyan"],
        particle.isRight && styles["particle-right"]
    ].filter(Boolean).join(" ");

    return (
        <div className={classes}>
            <div className={styles["particle-core"]}></div>
        </div>
    );
};

const Background: React.FC = () => {
    const particlesContainerRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <Image
                src={`${basePath}/static/images/background/bg.webp?v=${buildVersion}`}
                alt="Background"
                fill
                className={`absolute top-0 z-[-100] bg-size-[100%_100%] bg-position-center bg-repeat-no-repeat w-[calc(100%+24px)] h-full md:left-0 md:w-full md:rounded-tr-xl`}
            />
            <div className="absolute z-[-100] h-[862px] w-full overflow-hidden md:h-full">
                {/* CSS-based particle effects */}
                <div ref={particlesContainerRef} className={styles["particles-container"]}>
                    {particles.map((particle) => (
                        <Particle key={particle.id} particle={particle} />
                    ))}
                </div>

                <div id="background-polygon"
                    className="relative h-[862px] w-full bg-center"
                    style={{ backgroundImage: `url('${basePath}/static/images/background/polygon.webp?v=${buildVersion}')` }}
                ></div>
            </div>
        </>
    );
};

export default memo(Background);