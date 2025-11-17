import React from "react";
import styles from "./particles.module.scss";

// ParticlesContainer component that renders all particles
const ParticlesContainer: React.FC = () => (
    <div className={styles["particles-container"]}>
        {particles.map((particle, index) => (
            <Particle key={index} particle={particle} />
        ))}
    </div>
);

// Particle data structure
export interface ParticleData {
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
    { top: "12%", left: "8%", width: "2px", height: "2px", delay: "0.5s", duration: "4.5s" },
    { top: "15%", left: "15%", width: "3px", height: "3px", delay: "0.7s", duration: "4s" },
    { top: "12%", left: "88%", width: "3px", height: "3px", delay: "0.9s", duration: "3.8s", isRight: true },
    { top: "18%", left: "6%", width: "1px", height: "1px", delay: "0.1s", duration: "4.5s" },
    { top: "22%", left: "12%", width: "3px", height: "3px", delay: "0.5s", duration: "3.8s" },
    { top: "25%", left: "82%", width: "1px", height: "1px", delay: "1s", duration: "5.5s", isRight: true },
    { top: "28%", left: "88%", width: "3px", height: "3px", delay: "0.4s", duration: "4.8s", isRight: true },
    { top: "20%", left: "95%", width: "2px", height: "2px", delay: "1.2s", duration: "5.2s", isRight: true },
    { top: "10%", left: "78%", width: "3px", height: "3px", delay: "0.25s", duration: "5.5s", isRight: true },
    { top: "35%", left: "8%", width: "2px", height: "2px", delay: "1.5s", duration: "4s" },
    { top: "40%", left: "15%", width: "3px", height: "3px", delay: "1.8s", duration: "6s" },
    { top: "45%", left: "5%", width: "1px", height: "1px", delay: "1.4s", duration: "4.5s" },
    { top: "38%", left: "85%", width: "3px", height: "3px", delay: "1.1s", duration: "3.8s", isRight: true },
    { top: "42%", left: "92%", width: "1px", height: "1px", delay: "1.8s", duration: "6.2s", isRight: true },
    { top: "48%", left: "88%", width: "2px", height: "2px", delay: "0.9s", duration: "4.8s", isRight: true },
    { top: "32%", left: "75%", width: "2px", height: "2px", delay: "1.3s", duration: "5.5s", isRight: true },
    { top: "55%", left: "12%", width: "3px", height: "3px", delay: "1.2s", duration: "5.2s" },
    { top: "60%", left: "8%", width: "1px", height: "1px", delay: "1.7s", duration: "4.5s" },
    { top: "58%", left: "88%", width: "3px", height: "3px", delay: "2s", duration: "7s", isRight: true },
    { top: "52%", left: "85%", width: "1px", height: "1px", delay: "0.8s", duration: "6s", isRight: true },
    { top: "12%", left: "8%", width: "2px", height: "2px", delay: "0.5s", duration: "4.5s" },
    { top: "12%", left: "88%", width: "2px", height: "2px", delay: "0.9s", duration: "3.8s", isRight: true },
    { top: "18%", left: "6%", width: "1px", height: "1px", delay: "0.1s", duration: "4.5s" },
    { top: "25%", left: "82%", width: "3px", height: "3px", delay: "1s", duration: "5.5s", isRight: true },
    { top: "35%", left: "8%", width: "2px", height: "2px", delay: "1.5s", duration: "4s" },
    { top: "45%", left: "5%", width: "1px", height: "1px", delay: "1.4s", duration: "4.5s" },
    { top: "38%", left: "85%", width: "3px", height: "3px", delay: "1.1s", duration: "3.8s", isRight: true },
    { top: "48%", left: "88%", width: "1px", height: "1px", delay: "0.9s", duration: "4.8s", isRight: true },
    { top: "55%", left: "12%", width: "2px", height: "2px", delay: "1.2s", duration: "5.2s" },
    { top: "60%", left: "8%", width: "3px", height: "3px", delay: "1.7s", duration: "4.5s" },
    { top: "58%", left: "88%", width: "2px", height: "2px", delay: "2s", duration: "7s", isRight: true },
];

// Particle component
interface ParticleProps {
    particle: ParticleData;
}

const Particle: React.FC<ParticleProps> = ({ particle }) => {
    const classes = [styles.particle, styles["particle-cyan"], particle.isRight && styles["particle-right"]].filter(Boolean).join(" ");

    const particleStyle = {
        top: particle.top,
        left: particle.left,
        width: particle.width,
        height: particle.height,
        animationDuration: particle.duration,
        animationDelay: particle.delay,
    };

    return (
        <div className={classes} style={particleStyle}>
            <div className={styles["particle-core"]}></div>
        </div>
    );
};

export default ParticlesContainer;
