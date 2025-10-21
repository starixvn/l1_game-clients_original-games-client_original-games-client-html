import { memo, useRef } from "react";
import Image from "next/image";
import { buildVersion } from "@shared/constants";
import styles from "./particles.module.scss";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Particle data structure
interface ParticleData {
    id: number | string;
    top: string;
    left: string;
    width: string;
    height: string;
    delay: string;
    duration: string;
    isRight?: boolean;
}

// Particle configuration - gradual increase from bottom to top, most on left/right edges
const particles: ParticleData[] = [
    // Desktop particles - 30 total, gradual increase from bottom to top, most on left/right edges
    // Bottom area (60-100% top) - 4 particles (fewest, concentrated on edges)
    { id: 1, top: "75%", left: "15%", width: "4px", height: "4px", delay: "3.5s", duration: "10s" },
    { id: 2, top: "85%", left: "85%", width: "3px", height: "3px", delay: "3.2s", duration: "11s", isRight: true },
    { id: 3, top: "65%", left: "8%", width: "3.5px", height: "3.5px", delay: "3.9s", duration: "17s" },
    { id: 4, top: "90%", left: "92%", width: "3px", height: "3px", delay: "4.8s", duration: "17s", isRight: true },

    // Lower middle area (40-60% top) - 6 particles (more, still edge-focused)
    { id: 5, top: "45%", left: "12%", width: "3px", height: "3px", delay: "5.0s", duration: "18s" },
    { id: 6, top: "55%", left: "88%", width: "3.5px", height: "3.5px", delay: "2.5s", duration: "13s", isRight: true },
    { id: 7, top: "40%", left: "6%", width: "3.5px", height: "3.5px", delay: "2.1s", duration: "18s" },
    { id: 8, top: "50%", left: "94%", width: "3.5px", height: "3.5px", delay: "3.0s", duration: "17s", isRight: true },
    { id: 9, top: "45%", left: "25%", width: "3.5px", height: "3.5px", delay: "3.3s", duration: "12s" },
    { id: 10, top: "55%", left: "75%", width: "4px", height: "4px", delay: "4.6s", duration: "13s", isRight: true },

    // Upper middle area (20-40% top) - 8 particles (more edge concentration)
    { id: 11, top: "25%", left: "50%", width: "3.5px", height: "3.5px", delay: "4.2s", duration: "12s" },
    { id: 12, top: "30%", left: "35%", width: "3px", height: "3px", delay: "4.9s", duration: "17s" },
    { id: 13, top: "35%", left: "65%", width: "3px", height: "3px", delay: "5.5s", duration: "20s", isRight: true },
    { id: 14, top: "28%", left: "2%", width: "4px", height: "4px", delay: "3.8s", duration: "13s" },
    { id: 15, top: "35%", left: "98%", width: "3.5px", height: "3.5px", delay: "3.1s", duration: "11s", isRight: true },
    { id: 16, top: "25%", left: "95%", width: "3px", height: "3px", delay: "5.1s", duration: "18s", isRight: true },
    { id: 17, top: "22%", left: "5%", width: "3px", height: "3px", delay: "2.5s", duration: "14s" },
    { id: 18, top: "20%", left: "22%", width: "3px", height: "3px", delay: "3.2s", duration: "15s" },

    // Top area (0-20% top) - 12 particles (most, heavily concentrated on edges)
    { id: 19, top: "8%", left: "15%", width: "4px", height: "4px", delay: "0s", duration: "12s" },
    { id: 20, top: "5%", left: "8%", width: "3px", height: "3px", delay: "0.5s", duration: "10s" },
    { id: 21, top: "12%", left: "22%", width: "3.5px", height: "3.5px", delay: "1.2s", duration: "13s" },
    { id: 22, top: "3%", left: "5%", width: "4px", height: "4px", delay: "0.8s", duration: "11s" },
    { id: 23, top: "8%", left: "25%", width: "3.5px", height: "3.5px", delay: "1.8s", duration: "12s" },
    { id: 24, top: "12%", left: "35%", width: "3.5px", height: "3.5px", delay: "2s", duration: "15s" },
    { id: 25, top: "10%", left: "65%", width: "4.5px", height: "4.5px", delay: "1s", duration: "13s", isRight: true },
    { id: 26, top: "15%", left: "75%", width: "3px", height: "3px", delay: "3s", duration: "11s", isRight: true },
    { id: 27, top: "6%", left: "85%", width: "4px", height: "4px", delay: "0.3s", duration: "13s", isRight: true },
    { id: 28, top: "15%", left: "92%", width: "3px", height: "3px", delay: "1.5s", duration: "11s", isRight: true },
    { id: 29, top: "18%", left: "78%", width: "3.5px", height: "3.5px", delay: "2.8s", duration: "16s", isRight: true },
    { id: 30, top: "8%", left: "72%", width: "3px", height: "3px", delay: "1.1s", duration: "14s", isRight: true },

    // Mobile particles - 24 total, concentrated on top left/right edges (hidden on desktop via CSS)
    // Top area (0-30% top) - 14 particles (most, heavily concentrated on left/right edges)
    { id: 31, top: "5%", left: "5%", width: "3px", height: "3px", delay: "0s", duration: "12s" },
    { id: 32, top: "8%", left: "12%", width: "3.5px", height: "3.5px", delay: "0.5s", duration: "10s" },
    { id: 33, top: "12%", left: "8%", width: "4px", height: "4px", delay: "1.2s", duration: "13s" },
    { id: 34, top: "3%", left: "18%", width: "3px", height: "3px", delay: "0.8s", duration: "11s" },
    { id: 35, top: "15%", left: "15%", width: "3.5px", height: "3.5px", delay: "1.8s", duration: "12s" },
    { id: 36, top: "8%", left: "85%", width: "3px", height: "3px", delay: "2s", duration: "15s", isRight: true },
    { id: 37, top: "5%", left: "92%", width: "3.5px", height: "3.5px", delay: "1s", duration: "13s", isRight: true },
    { id: 38, top: "12%", left: "88%", width: "4px", height: "4px", delay: "2.5s", duration: "11s", isRight: true },
    { id: 39, top: "18%", left: "6%", width: "3px", height: "3px", delay: "0.3s", duration: "13s" },
    { id: 40, top: "22%", left: "12%", width: "3.5px", height: "3.5px", delay: "1.5s", duration: "11s" },
    { id: 41, top: "25%", left: "82%", width: "3px", height: "3px", delay: "2.8s", duration: "16s", isRight: true },
    { id: 42, top: "28%", left: "88%", width: "3.5px", height: "3.5px", delay: "1.1s", duration: "14s", isRight: true },
    { id: 43, top: "20%", left: "95%", width: "3px", height: "3px", delay: "3.2s", duration: "15s", isRight: true },
    { id: 44, top: "10%", left: "78%", width: "3.5px", height: "3.5px", delay: "0.7s", duration: "16s", isRight: true },

    // Upper middle area (30-50% top) - 6 particles (less, still edge-focused)
    { id: 45, top: "35%", left: "8%", width: "3px", height: "3px", delay: "4.2s", duration: "12s" },
    { id: 46, top: "40%", left: "15%", width: "3.5px", height: "3.5px", delay: "4.9s", duration: "17s" },
    { id: 47, top: "45%", left: "5%", width: "3px", height: "3px", delay: "3.8s", duration: "13s" },
    { id: 48, top: "38%", left: "85%", width: "3.5px", height: "3.5px", delay: "3.1s", duration: "11s", isRight: true },
    { id: 49, top: "42%", left: "92%", width: "3px", height: "3px", delay: "5.1s", duration: "18s", isRight: true },
    { id: 50, top: "48%", left: "88%", width: "3.5px", height: "3.5px", delay: "2.5s", duration: "14s", isRight: true },

    // Lower middle area (50-70% top) - 3 particles (fewer)
    { id: 51, top: "55%", left: "12%", width: "3px", height: "3px", delay: "3.2s", duration: "15s" },
    { id: 52, top: "60%", left: "8%", width: "3.5px", height: "3.5px", delay: "4.6s", duration: "13s" },
    { id: 53, top: "58%", left: "88%", width: "3px", height: "3px", delay: "5.5s", duration: "20s", isRight: true },

    // Bottom area (70-100% top) - 1 particle (fewest)
    { id: 54, top: "75%", left: "15%", width: "3px", height: "3px", delay: "3.5s", duration: "10s" },
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
