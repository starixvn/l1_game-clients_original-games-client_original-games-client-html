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

// Particle configuration - gradual increase from bottom to top, most on left/right edges
const particles: ParticleData[] = [
    // Bottom area (60-100% top) - 4 particles (fewest, concentrated on edges)
    { id: 15, top: "75%", left: "15%", width: "4px", height: "4px", delay: "3.5s", duration: "10s" },
    { id: 11, top: "85%", left: "85%", width: "3px", height: "3px", delay: "3.2s", duration: "11s", isRight: true },
    { id: 50, top: "65%", left: "8%", width: "3.5px", height: "3.5px", delay: "3.9s", duration: "17s" },
    { id: 24, top: "90%", left: "92%", width: "3px", height: "3px", delay: "4.8s", duration: "17s", isRight: true },

    // Lower middle area (40-60% top) - 6 particles (more, still edge-focused)
    { id: 42, top: "45%", left: "12%", width: "3px", height: "3px", delay: "5.0s", duration: "18s" },
    { id: 10, top: "55%", left: "88%", width: "3.5px", height: "3.5px", delay: "2.5s", duration: "13s", isRight: true },
    { id: 16, top: "40%", left: "6%", width: "3.5px", height: "3.5px", delay: "2.1s", duration: "18s" },
    { id: 38, top: "50%", left: "94%", width: "3.5px", height: "3.5px", delay: "3.0s", duration: "17s", isRight: true },
    { id: 41, top: "45%", left: "25%", width: "3.5px", height: "3.5px", delay: "3.3s", duration: "12s" },
    { id: 31, top: "55%", left: "75%", width: "4px", height: "4px", delay: "4.6s", duration: "13s", isRight: true },

    // Upper middle area (20-40% top) - 8 particles (more edge concentration)
    { id: 13, top: "25%", left: "50%", width: "3.5px", height: "3.5px", delay: "4.2s", duration: "12s" },
    { id: 34, top: "30%", left: "35%", width: "3px", height: "3px", delay: "4.9s", duration: "17s" },
    { id: 54, top: "35%", left: "65%", width: "3px", height: "3px", delay: "5.5s", duration: "20s", isRight: true },
    { id: 18, top: "28%", left: "2%", width: "4px", height: "4px", delay: "3.8s", duration: "13s" },
    { id: 23, top: "35%", left: "98%", width: "3.5px", height: "3.5px", delay: "3.1s", duration: "11s", isRight: true },
    { id: 52, top: "25%", left: "95%", width: "3px", height: "3px", delay: "5.1s", duration: "18s", isRight: true },
    { id: 56, top: "22%", left: "5%", width: "3px", height: "3px", delay: "2.5s", duration: "14s" },
    { id: 58, top: "20%", left: "22%", width: "3px", height: "3px", delay: "3.2s", duration: "15s" },

    // Top area (0-20% top) - 12 particles (most, heavily concentrated on edges)
    { id: 1, top: "8%", left: "15%", width: "4px", height: "4px", delay: "0s", duration: "12s" },
    { id: 3, top: "5%", left: "8%", width: "3px", height: "3px", delay: "0.5s", duration: "10s" },
    { id: 6, top: "12%", left: "22%", width: "3.5px", height: "3.5px", delay: "1.2s", duration: "13s" },
    { id: 55, top: "3%", left: "5%", width: "4px", height: "4px", delay: "0.8s", duration: "11s" },
    { id: 57, top: "8%", left: "25%", width: "3.5px", height: "3.5px", delay: "1.8s", duration: "12s" },
    { id: 2, top: "12%", left: "35%", width: "3.5px", height: "3.5px", delay: "2s", duration: "15s" },
    { id: 4, top: "10%", left: "65%", width: "4.5px", height: "4.5px", delay: "1s", duration: "13s", isRight: true },
    { id: 5, top: "15%", left: "75%", width: "3px", height: "3px", delay: "3s", duration: "11s", isRight: true },
    { id: 59, top: "6%", left: "85%", width: "4px", height: "4px", delay: "0.3s", duration: "13s", isRight: true },
    { id: 60, top: "15%", left: "92%", width: "3px", height: "3px", delay: "1.5s", duration: "11s", isRight: true },
    { id: 61, top: "18%", left: "78%", width: "3.5px", height: "3.5px", delay: "2.8s", duration: "16s", isRight: true },
    { id: 62, top: "8%", left: "72%", width: "3px", height: "3px", delay: "1.1s", duration: "14s", isRight: true },
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
