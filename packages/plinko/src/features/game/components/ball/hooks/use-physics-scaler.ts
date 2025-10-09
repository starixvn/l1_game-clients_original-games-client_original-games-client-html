import { useRef, useCallback } from 'react';
import { logger } from '../../../../../services/logger';
import { PhysicsScaler } from '../physics/scaling/physics-scaler';
import { physicsConfig } from '../physics';

interface UsePhysicsScalerProps {
    baseRows?: number;
}

interface UsePhysicsScalerReturn {
    scaler: React.MutableRefObject<PhysicsScaler | null>;
    setRows: (rows: number) => void;
    getScaledFactors: () => any;
    updateGravity: (containerSize: { width: number; height: number }, canvasSize: { width: number; height: number }) => number;
}

/**
 * Custom hook for managing physics scaling based on row count and container size
 * Handles row-based scaling and gravity adjustments
 */
export const usePhysicsScaler = ({
    baseRows = 8
}: UsePhysicsScalerProps = {}): UsePhysicsScalerReturn => {
    const scalerRef = useRef<PhysicsScaler | null>(null);

    // Initialize scaler on first use
    const initializeScaler = useCallback(() => {
        if (!scalerRef.current) {
            scalerRef.current = new PhysicsScaler(physicsConfig.engine.engineGravity, baseRows);
        }
    }, [baseRows]);

    // Set rows for scaling
    const setRows = useCallback((rows: number) => {
        initializeScaler();
        if (scalerRef.current) {
            scalerRef.current.setRows(rows);
            logger.debug('🔧 [SCALER] Row scaling updated', {
                rows,
                baseRows,
                rowRatio: rows / baseRows
            });
        }
    }, [initializeScaler, baseRows]);

    // Get current scaled factors
    const getScaledFactors = useCallback(() => {
        initializeScaler();
        return scalerRef.current?.getScaledFactors() || {
            gravity: physicsConfig.engine.engineGravity,
            restitution: 0.5,
            friction: 0.3
        };
    }, [initializeScaler]);

    // Calculate gravity based on container and canvas size
    const updateGravity = useCallback((containerSize: { width: number; height: number }, canvasSize: { width: number; height: number }) => {
        const scaledFactors = getScaledFactors();
        const scaleFactor = Math.min(containerSize.width / canvasSize.width, containerSize.height / canvasSize.height);
        return scaledFactors.gravity * scaleFactor * 0.75; // 75% of scaled gravity
    }, [getScaledFactors]);

    return {
        scaler: scalerRef as React.MutableRefObject<PhysicsScaler | null>,
        setRows,
        getScaledFactors,
        updateGravity
    };
};
