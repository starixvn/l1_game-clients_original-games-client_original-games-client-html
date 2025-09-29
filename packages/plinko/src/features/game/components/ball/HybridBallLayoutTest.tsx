import React, { useRef } from 'react';
import CanvasBallLayout, { CanvasBallLayoutRef } from './CanvasBallLayout';

const CanvasBallLayoutTest: React.FC = () => {
    const ballLayoutRef = useRef<CanvasBallLayoutRef>(null);

    const handleSpawnBall = () => {
        if (ballLayoutRef.current) {
            ballLayoutRef.current.spawnBall(1);
        }
    };

    const handleSpawnMultipleBalls = () => {
        if (ballLayoutRef.current) {
            // Spawn 5 balls with random delays
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    ballLayoutRef.current?.spawnBall(Math.random() * 10 + 1);
                }, i * 500);
            }
        }
    };

    // Sample data for 9 rows of balls
    const rows = 9;
    const ballsPerRow = [3, 4, 5, 6, 7, 8, 9, 10, 11];
    const multipliers = [0.3, 0.5, 1, 1.5, 2, 3, 5, 10, 25, 41, 88];

    return (
        <div style={{ padding: '20px', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
            <h1 style={{ color: 'white', marginBottom: '20px' }}>Canvas Ball Layout Test</h1>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={handleSpawnBall}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Spawn Single Ball
                </button>

                <button
                    onClick={handleSpawnMultipleBalls}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4ecdc4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Spawn Multiple Balls
                </button>
            </div>

            <div style={{
                border: '2px solid #333',
                borderRadius: '10px',
                padding: '20px',
                backgroundColor: '#1a1a1a',
                display: 'inline-block'
            }}>
                <CanvasBallLayout
                    ref={ballLayoutRef}
                    rows={rows}
                    ballsPerRow={ballsPerRow}
                    multipliers={multipliers}
                />
            </div>

            <div style={{ color: 'white', marginTop: '20px', maxWidth: '600px' }}>
                <h2>How the Pure Canvas Approach Works:</h2>
                <ul>
                    <li><strong>Pure Canvas Rendering:</strong> All physics and visuals rendered directly to HTML5 Canvas</li>
                    <li><strong>Realistic Physics:</strong> Matter.js engine handles gravity, collisions, and ball movement</li>
                    <li><strong>Triangular Pin Layout:</strong> Pins arranged in proper triangular formation for authentic Plinko</li>
                    <li><strong>Dynamic Multipliers:</strong> Color-coded multiplier slots at bottom with collision detection</li>
                    <li><strong>Performance Optimized:</strong> 60fps physics simulation with efficient rendering</li>
                    <li><strong>Game-like Experience:</strong> Immersive physics-based gameplay similar to casino Plinko</li>
                </ul>
            </div>
        </div>
    );
};

export default CanvasBallLayoutTest;
