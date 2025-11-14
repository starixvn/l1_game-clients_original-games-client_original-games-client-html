export const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

export const calculateProgress = (createdAt: number, duration: number, now: number) => clamp01((now - createdAt) / duration);

export const getVisiblePoints = (total: number, progress: number, minVisiblePoints: number) => Math.max(minVisiblePoints, Math.ceil(total * progress));

export const interpolatePoint = (p1: { x: number; y: number }, p2: { x: number; y: number }, t: number) => ({
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
})
