import React, { useState, useEffect } from 'react';
import ScoreboardSeDie from './scoreboard';
import { Round } from '../../../components/game-base/type';
import { SeDieResult, SeDieSettlementResult } from '../sedie-multiplayer-constants';

/**
 * Example component demonstrating the enhanced scoreboard with scrolling functionality
 * This shows how to handle large datasets (100+ records) with automatic scrolling
 */
const ScoreboardExample: React.FC = () => {
    const [roundHistory, setRoundHistory] = useState<Round<SeDieResult, SeDieSettlementResult>[]>([]);
    const [isShowBlink, setIsShowBlink] = useState(false);
    const [playResultAnimation, setPlayResultAnimation] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate mock data for demonstration
    const generateMockRound = (drawId: number): Round<SeDieResult, SeDieSettlementResult> => {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const dice3 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2 + dice3;
        const isOdd = total % 2 === 1;

        return {
            result: {
                drawId,
                dice1,
                dice2,
                dice3
            },
            settlementResult: {
                odd: isOdd,
                even: !isOdd,
                drawId
            }
        };
    };

    // Generate initial dataset
    useEffect(() => {
        const initialData = Array.from({ length: 50 }, (_, index) => 
            generateMockRound(index + 1)
        );
        setRoundHistory(initialData);
    }, []);

    // Simulate new results being added
    const addNewResult = () => {
        const newDrawId = roundHistory.length + 1;
        const newRound = generateMockRound(newDrawId);
        
        setRoundHistory(prev => [...prev, newRound]);
        setPlayResultAnimation(true);
        
        // Reset animation flag after animation completes
        setTimeout(() => {
            setPlayResultAnimation(false);
        }, 1000);
    };

    // Generate large dataset for testing
    const generateLargeDataset = async () => {
        setIsGenerating(true);
        
        // Generate 102 rounds in batches to avoid blocking UI
        const newRounds: Round<SeDieResult, SeDieSettlementResult>[] = [];
        const startId = roundHistory.length + 1;
        
        for (let i = 0; i < 102; i++) {
            newRounds.push(generateMockRound(startId + i));
            
            // Yield control every 10 rounds to keep UI responsive
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        
        setRoundHistory(prev => [...prev, ...newRounds]);
        setPlayResultAnimation(true);
        
        setTimeout(() => {
            setPlayResultAnimation(false);
            setIsGenerating(false);
        }, 1000);
    };

    // Clear all data
    const clearData = () => {
        setRoundHistory([]);
        setPlayResultAnimation(false);
    };

    // Toggle blink effect
    const toggleBlink = () => {
        setIsShowBlink(!isShowBlink);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Enhanced Scoreboard Example</h1>
            <p>This demonstrates the scoreboard with scrolling functionality for large datasets.</p>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Controls</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={addNewResult}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Add Single Result
                    </button>
                    
                    <button 
                        onClick={generateLargeDataset}
                        disabled={isGenerating}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isGenerating ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: isGenerating ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isGenerating ? 'Generating...' : 'Generate 102 Rounds'}
                    </button>
                    
                    <button 
                        onClick={clearData}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear All Data
                    </button>
                    
                    <button 
                        onClick={toggleBlink}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isShowBlink ? '#ffc107' : '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        {isShowBlink ? 'Disable' : 'Enable'} Blink Effect
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Statistics</h3>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div>
                        <strong>Total Rounds:</strong> {roundHistory.length}
                    </div>
                    <div>
                        <strong>Odd Results:</strong> {roundHistory.filter(r => r.settlementResult?.odd).length}
                    </div>
                    <div>
                        <strong>Even Results:</strong> {roundHistory.filter(r => r.settlementResult?.even).length}
                    </div>
                    <div>
                        <strong>Animation Active:</strong> {playResultAnimation ? 'Yes' : 'No'}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Instructions</h3>
                <ul style={{ lineHeight: '1.6' }}>
                    <li><strong>Scroll horizontally</strong> by dragging the scoreboard or using the scrollbar</li>
                    <li><strong>Add results</strong> to see automatic scrolling to the right</li>
                    <li><strong>Generate large dataset</strong> to test performance with 100+ records</li>
                    <li><strong>Toggle blink effect</strong> to see the visual indicator for pending results</li>
                </ul>
            </div>

            <div style={{ 
                border: '2px solid #ccc', 
                borderRadius: '10px', 
                padding: '20px',
                backgroundColor: '#f8f9fa'
            }}>
                <h3>Scoreboard</h3>
                <div style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    overflow: 'hidden'
                }}>
                    <ScoreboardSeDie
                        roundHistory={roundHistory}
                        isShowBlink={isShowBlink}
                        isOddEven={true}
                        playResultAnimation={playResultAnimation}
                    />
                </div>
            </div>

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <h4>Features Demonstrated:</h4>
                <ul>
                    <li>✅ Horizontal scrolling with drag support</li>
                    <li>✅ Automatic scroll-to-right on new results</li>
                    <li>✅ Dynamic column calculation</li>
                    <li>✅ Custom scrollbar styling</li>
                    <li>✅ Performance optimization for large datasets</li>
                    <li>✅ Blink effect for pending results</li>
                    <li>✅ Responsive design</li>
                </ul>
            </div>
        </div>
    );
};

export default ScoreboardExample;
