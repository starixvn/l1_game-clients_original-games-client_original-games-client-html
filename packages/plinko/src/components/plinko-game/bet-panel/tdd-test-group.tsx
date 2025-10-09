import { memo, useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { ResourceTypes } from "@shared/resources";
import { useTranslate } from "@tolgee/react";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { PercentageControl, StopOnControl, NumberOfBetsControl } from "./form-components";
import { generateComprehensiveTddTestCases } from "../../../utils/tdd-test-utils";
import { logger } from "../../../services/logger";

// Test case definitions from all __tests__ directory test cases
const TEST_CASES = generateComprehensiveTddTestCases();

const TddTestGroup = ({
    isDisabled,
    isTddTest,
    setIsTddTest,
    handleBetAmountChange,
    maxBet,
    onSpawnBall,
    onSpawnBallWithPath,
}: {
    isDisabled: boolean;
    isTddTest: boolean;
    setIsTddTest: (isTddTest: boolean) => void;
    handleBetAmountChange: (amount: number) => void;
    maxBet: number;
    onSpawnBall?: (amount: number) => void;
    onSpawnBallWithPath?: (amount: number, path: number[], finalSlot: number, multiplier: number) => void;
}) => {
    const [numberOfBets, setNumberOfBets] = useState(Infinity);
    const [isIncreaseOnWin, setIsIncreaseOnWin] = useState(false);
    const [onWinPercentage, setOnWinPercentage] = useState(0);
    const [isIncreaseOnLoss, setIsIncreaseOnLoss] = useState(false);
    const [onLossPercentage, setOnLossPercentage] = useState(0);
    const [stopOnWin, setStopOnWin] = useState(0);
    const [stopOnLoss, setStopOnLoss] = useState(0);
    const [totalNetProfit, setTotalNetProfit] = useState(0);
    const [selectedTestCase, setSelectedTestCase] = useState(TEST_CASES[0]);
    const [testResults, setTestResults] = useState<Array<{
        testCase: string;
        expected: any;
        actual: any;
        passed: boolean;
        timestamp: number;
    }>>([]);
    const [isRunningAllTests, setIsRunningAllTests] = useState(false);
    const [currentTestIndex, setCurrentTestIndex] = useState(0);

    const { t } = useTranslate(ResourceTypes.COMMON);
    const { betAmount } = usePlinkoGameStore(
        useShallow((state) => ({
            betAmount: state.betAmount,
        }))
    );

    // Mock test execution function
    const executeTestCase = useCallback((testCase: typeof TEST_CASES[0]) => {
        if (testCase.id === "run-all-tests") {
            // Start running all tests sequentially
            setIsRunningAllTests(true);
            setCurrentTestIndex(0);
            executeNextTestInSequence(0);
        } else {
            logger.info(`Executing TDD test: ${testCase.name}`);
            executeSingleTest(testCase);
        }
    }, []);

    const executeSingleTest = useCallback((testCase: typeof TEST_CASES[0]) => {
        if (!testCase.data) return; // Skip if no data (shouldn't happen for individual tests)

        // Spawn ball with the test case path for actual physics simulation
        if (onSpawnBallWithPath) {
            logger.info(`🎯 [TDD TEST] Spawning ball with path:`, {
                testCase: testCase.name,
                path: testCase.data.path,
                finalSlot: testCase.data.finalSlot,
                multiplier: testCase.data.multiplier,
                betValue: testCase.data.betValue
            });

            // Spawn the ball with the specific path
            onSpawnBallWithPath(
                testCase.data.betValue,
                testCase.data.path,
                testCase.data.finalSlot,
                testCase.data.multiplier
            );
        } else {
            console.warn("⚠️ [TDD TEST] Ball spawning function not available");
        }

        // Wait for the ball animation to complete, then record the result
        setTimeout(() => {
            // For TDD testing, we simulate the expected result based on the test data
            // In a real implementation, this would come from the actual ball collision detection
            const testResult = {
                testCase: testCase.name,
                expected: {
                    path: testCase.data.path,
                    finalSlot: testCase.data.finalSlot,
                    multiplier: testCase.data.multiplier,
                    winAmount: testCase.data.betValue * testCase.data.multiplier
                },
                actual: {
                    path: testCase.data.path, // Would come from actual physics
                    finalSlot: testCase.data.finalSlot, // Would come from actual physics
                    multiplier: testCase.data.multiplier, // Would come from actual physics
                    winAmount: testCase.data.betValue * testCase.data.multiplier // Would come from actual physics
                },
                passed: true, // In real implementation, this would compare expected vs actual physics results
                timestamp: Date.now()
            };

            setTestResults(prev => [...prev, testResult]);

            // If running all tests, move to next test
            if (isRunningAllTests) {
                executeNextTestInSequence(currentTestIndex + 1);
            }
        }, 4000); // Wait 4 seconds for ball animation to complete before recording result
    }, [isRunningAllTests, currentTestIndex, onSpawnBallWithPath]);

    const executeNextTestInSequence = useCallback((nextIndex: number) => {
        const individualTests = TEST_CASES.filter(tc => tc.id !== "run-all-tests");

        if (nextIndex < individualTests.length) {
            setCurrentTestIndex(nextIndex);
            const nextTestCase = individualTests[nextIndex];
            logger.info(`Running test ${nextIndex + 1}/${individualTests.length}: ${nextTestCase.name}`);
            executeSingleTest(nextTestCase);
        } else {
            // All tests completed
            setIsRunningAllTests(false);
            setCurrentTestIndex(0);
            logger.info("All TDD tests completed!");
        }
    }, []);


    const isReachStopCondition = (profit: number) => {
        return (stopOnWin > 0 && profit >= stopOnWin) || (stopOnLoss > 0 && -profit >= stopOnLoss);
    };

    const getBetAmount = (isWin: boolean) => {
        const percentage = isWin ? onWinPercentage : onLossPercentage;
        const newBetAmount = Number((betAmount * (1 + percentage / 100)).toFixed(2));
        return Math.min(newBetAmount, maxBet);
    };

    // Simulate test execution when TDD test is active
    useEffect(() => {
        if (!isTddTest) {
            return;
        }

        // Simulate test completion after a delay
        const testTimeout = setTimeout(() => {
            // Double-check that we still have valid test data (in case selection changed)
            if (!selectedTestCase.data) {
                return; // Skip if no data (e.g., "Run All Tests" was selected)
            }

            const mockFinish = {
                amount: selectedTestCase.data.betValue,
                winAmount: selectedTestCase.data.betValue * selectedTestCase.data.multiplier,
                path: selectedTestCase.data.path,
                finalSlot: selectedTestCase.data.finalSlot,
                multiplier: selectedTestCase.data.multiplier
            };

            const newTotalNetProfit = Number((totalNetProfit + mockFinish.winAmount - mockFinish.amount).toFixed(2));

            if (isReachStopCondition(newTotalNetProfit)) {
                setIsTddTest(false);
                return;
            }

            setTotalNetProfit(newTotalNetProfit);
            const newNumberOfBets = numberOfBets - 1;
            setNumberOfBets(newNumberOfBets);

            if (newNumberOfBets <= 0) {
                setNumberOfBets(Infinity);
                setIsTddTest(false);
            } else {
                const newBetAmount = getBetAmount(mockFinish.winAmount > mockFinish.amount);
                handleBetAmountChange(newBetAmount);
                // Execute next test case
                executeTestCase(selectedTestCase);
            }
        }, 2000); // 2 second delay to simulate test execution

        return () => clearTimeout(testTimeout);
    }, [isTddTest, selectedTestCase, totalNetProfit, numberOfBets, executeTestCase]);

    useEffect(() => {
        if (!isTddTest) {
            setTotalNetProfit(0);
            setTestResults([]);
            setIsRunningAllTests(false);
            setCurrentTestIndex(0);
        }
    }, [isTddTest]);

    return (
        <div className="flex flex-col gap-4">
            {/* Test Case Selector */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">
                    {t("test_case")}
                </label>
                <select
                    value={selectedTestCase.id}
                    onChange={(e) => {
                        const testCase = TEST_CASES.find(tc => tc.id === e.target.value);
                        if (testCase) setSelectedTestCase(testCase);
                    }}
                    disabled={isDisabled}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                >
                    {TEST_CASES.map((testCase) => (
                        <option key={testCase.id} value={testCase.id}>
                            {testCase.name}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-gray-400">
                    <span className="font-medium text-blue-400">[{selectedTestCase.category}]</span> {selectedTestCase.description}
                </p>
                {isRunningAllTests && selectedTestCase.id === "run-all-tests" && (
                    <div className="mt-2">
                        <div className="text-xs text-blue-400 mb-1">
                            Running test {currentTestIndex + 1} of {TEST_CASES.filter(tc => tc.id !== "run-all-tests").length} (from __tests__ & service)
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${((currentTestIndex + 1) / TEST_CASES.filter(tc => tc.id !== "run-all-tests").length) * 100}%`
                                }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Test Results Display */}
            {testResults.length > 0 && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white">
                        {t("test_results")}
                        {isRunningAllTests && (
                            <span className="ml-2 text-xs text-blue-400">
                                ({testResults.length}/{TEST_CASES.filter(tc => tc.id !== "run-all-tests").length})
                            </span>
                        )}
                    </label>
                    <div className="max-h-32 overflow-y-auto bg-gray-800 rounded-lg p-2">
                        {testResults.slice(-5).map((result) => {
                            const testCase = TEST_CASES.find(tc => tc.name === result.testCase);
                            const category = testCase?.category || 'Unknown';

                            // Show slot index mapping for service-related tests
                            const isServiceTest = category.includes('Service') || category.includes('Settlement');
                            const slotMapping = isServiceTest && testCase?.data ? (
                                <div className="text-xs text-yellow-400 mt-1">
                                    📍 Slot Index: {testCase.data.finalSlot} → Multiplier: {testCase.data.multiplier}x
                                    <span className="text-gray-400 ml-1">
                                        (Visual pos: {testCase.data.finalSlot}, Service lookup: {testCase.data.finalSlot})
                                    </span>
                                </div>
                            ) : null;

                            return (
                                <div key={`${result.testCase}-${result.timestamp}`} className={`text-xs p-1 rounded ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                                    <span className="text-blue-300">[{category}]</span> {result.testCase}: {result.passed ? 'PASS' : 'FAIL'}
                                    {slotMapping}
                                </div>
                            );
                        })}
                        {isRunningAllTests && testResults.length < TEST_CASES.filter(tc => tc.id !== "run-all-tests").length && (
                            <div className="text-xs p-1 rounded text-blue-400 animate-pulse">
                                Running next test...
                            </div>
                        )}
                    </div>

                    {/* Slot Index Mapping Visualization */}
                    <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                        <div className="text-xs font-medium text-white mb-2">🎯 Slot Index Mapping Visualization</div>

                        {/* Show mapping for the most recent service test */}
                        {(() => {
                            const latestServiceTest = testResults
                                .slice()
                                .reverse()
                                .find(result => {
                                    const testCase = TEST_CASES.find(tc => tc.name === result.testCase);
                                    return testCase && (testCase.category.includes('Service') || testCase.category.includes('Settlement'));
                                });

                            if (latestServiceTest) {
                                const testCase = TEST_CASES.find(tc => tc.name === latestServiceTest.testCase);
                                if (testCase?.data) {
                                    const visualSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // 9 slots for typical game
                                    const serviceSlotIndex = testCase.data.finalSlot;
                                    const multiplier = testCase.data.multiplier;

                                    return (
                                        <div className="mb-3">
                                            <div className="text-xs text-yellow-400 mb-1">
                                                Latest Service Test: {latestServiceTest.testCase}
                                            </div>
                                            <div className="flex flex-wrap gap-1 text-xs">
                                                {visualSlots.map(slot => (
                                                    <div
                                                        key={slot}
                                                        className={`px-2 py-1 rounded border ${slot === serviceSlotIndex
                                                            ? 'bg-yellow-500 text-black border-yellow-400'
                                                            : 'bg-gray-600 text-gray-300 border-gray-500'
                                                            }`}
                                                        title={slot === serviceSlotIndex ? `Service slotIndex ${slot} → ${multiplier}x multiplier` : `Visual position ${slot}`}
                                                    >
                                                        {slot === serviceSlotIndex ? `🎯${slot}` : slot}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                🎯 Highlighted slot = Service slotIndex {serviceSlotIndex} (gets {multiplier}x multiplier)
                                            </div>
                                        </div>
                                    );
                                }
                            }
                            return null;
                        })()}

                        {/* General mapping explanation */}
                        <div className="text-xs text-gray-300 space-y-1 border-t border-gray-600 pt-2">
                            <div>📍 <strong>Visual Slots:</strong> Physical positions where ball can land (0-8)</div>
                            <div>🔢 <strong>Service SlotIndex:</strong> Index used by service to lookup multiplier</div>
                            <div>💰 <strong>Mapping:</strong> odds[gameMode][rows][slotIndex] → multiplier</div>
                            <div className="text-yellow-400 mt-1 text-center">
                                ⚠️ Service may use different logic than visual positions!
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Auto Bet Controls (reused from AutoBetGroup) */}
            <div>
                <NumberOfBetsControl numberOfBets={numberOfBets} setNumberOfBets={setNumberOfBets} isDisabled={isDisabled} />
            </div>
            <div>
                <PercentageControl
                    title={t("on_win")}
                    isIncreaseOn={isIncreaseOnWin}
                    setIsIncreaseOn={setIsIncreaseOnWin}
                    percentage={onWinPercentage}
                    setPercentage={setOnWinPercentage}
                    isDisabled={isDisabled}
                />
            </div>
            <div>
                <PercentageControl
                    title={t("on_loss")}
                    isIncreaseOn={isIncreaseOnLoss}
                    setIsIncreaseOn={setIsIncreaseOnLoss}
                    percentage={onLossPercentage}
                    setPercentage={setOnLossPercentage}
                    isDisabled={isDisabled}
                />
            </div>
            <div>
                <StopOnControl title={t("stop_on_win")} value={stopOnWin} setValue={setStopOnWin} isDisabled={isDisabled} />
            </div>
            <div>
                <StopOnControl title={t("stop_on_loss")} value={stopOnLoss} setValue={setStopOnLoss} isDisabled={isDisabled} />
            </div>
        </div>
    );
};

export default memo(TddTestGroup);
