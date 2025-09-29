/**
 * Unit tests for PayoutsRow component
 * Tests rendering, hover tooltips, dynamic updates, and error handling
 *
 * @format
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PayoutsRow from '../components/PayoutsRow';

// Mock fetch for API calls
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('PayoutsRow Component', () => {
    const defaultProps = {
        gameMode: 'Medium' as const,
        rows: 8,
        betAmount: 10,
    };

    const mockPayoutData = {
        success: true,
        mode: 'Medium',
        rows: 8,
        multipliers: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
        probabilities: [0.0039, 0.0312, 0.1094, 0.2188, 0.2734, 0.2188, 0.1094, 0.0312, 0.0039],
        isPlaceholder: false,
        message: 'Payouts generated successfully.',
    };

    beforeEach(() => {
        mockFetch.mockClear();
    });

    test('should render loading state initially', () => {
        mockFetch.mockImplementationOnce(() => new Promise(() => { })); // Never resolves

        render(<PayoutsRow {...defaultProps} />);

        expect(screen.getByText('Loading payouts...')).toBeInTheDocument();
    });

    test('should render error state when API fails', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    success: false,
                    error: 'Test error message',
                }),
            } as Response)
        );

        render(<PayoutsRow {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
        });
    });

    test('should render correct number of payout slots', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockPayoutData),
            } as Response)
        );

        render(<PayoutsRow {...defaultProps} />);

        await waitFor(() => {
            // Should render 9 slots for 8 rows (rows + 1)
            const slots = screen.getAllByText(/\d+\.\dx/);
            expect(slots).toHaveLength(9);
        });
    });

    test('should display correct multipliers', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockPayoutData),
            } as Response)
        );

        render(<PayoutsRow {...defaultProps} />);

        await waitFor(() => {
            // Check that all expected multipliers are present (allowing for duplicates)
            expect(screen.getAllByText('5.6x')).toHaveLength(2); // Edge multipliers
            expect(screen.getAllByText('2.1x')).toHaveLength(2); // Second from edge
            expect(screen.getAllByText('1.1x')).toHaveLength(2); // Symmetric multipliers
            expect(screen.getAllByText('1.0x')).toHaveLength(2); // Center multipliers
            expect(screen.getByText('0.5x')).toBeInTheDocument();
        });
    });

    test('should show tooltip on hover with correct estimated win and probability', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockPayoutData),
            } as Response)
        );

        render(<PayoutsRow {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getAllByText('5.6x')).toHaveLength(2);
        });

        // Check that tooltips are rendered with correct content for each slot
        await waitFor(() => {
            expect(screen.getAllByText('Win: $56.00')).toHaveLength(2); // Two slots with 5.6x multiplier
            expect(screen.getAllByText('Probability: 0.39%')).toHaveLength(2);
            expect(screen.getAllByText('Win: $21.00')).toHaveLength(2); // Two slots with 2.1x multiplier
            expect(screen.getAllByText('Probability: 3.12%')).toHaveLength(2);
        });
    });

    test('should calculate estimated win correctly for different bet amounts', async () => {
        const customProps = { ...defaultProps, betAmount: 25 };

        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockPayoutData),
            } as Response)
        );

        render(<PayoutsRow {...customProps} />);

        await waitFor(() => {
            expect(screen.getAllByText('5.6x')).toHaveLength(2);
        });

        // Check that tooltips show correct win amounts for betAmount = 25
        await waitFor(() => {
            // 25 * 5.6 = 140
            expect(screen.getAllByText('Win: $140.00')).toHaveLength(2);
            // 25 * 2.1 = 52.5
            expect(screen.getAllByText('Win: $52.50')).toHaveLength(2);
        });
    });

    test('should fetch new data when gameMode changes', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockPayoutData),
            } as Response)
        );

        const { rerender } = render(<PayoutsRow {...defaultProps} />);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/generate-payouts?mode=Medium&rows=8');
        });

        // Change game mode
        const newProps = { ...defaultProps, gameMode: 'High' as const };
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    ...mockPayoutData,
                    mode: 'High',
                    multipliers: [29, 4, 1.5, 1.0, 0.3, 1.0, 1.5, 4, 29],
                }),
            } as Response)
        );

        rerender(<PayoutsRow {...newProps} />);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/generate-payouts?mode=High&rows=8');
            expect(screen.getAllByText('29.0x')).toHaveLength(2); // High mode has 29x at edges
        });
    });

    test('should fetch new data when rows change', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockPayoutData),
            } as Response)
        );

        const { rerender } = render(<PayoutsRow {...defaultProps} />);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/generate-payouts?mode=Medium&rows=8');
        });

        // Change rows
        const newProps = { ...defaultProps, rows: 12 };
        const mock12RowData = {
            ...mockPayoutData,
            rows: 12,
            multipliers: [10, 3, 1.6, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 1.6, 3, 10],
            probabilities: Array(13).fill(0.01), // Mock probabilities
        };

        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(mock12RowData),
            } as Response)
        );

        rerender(<PayoutsRow {...newProps} />);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/generate-payouts?mode=Medium&rows=12');
            // Should now have 13 slots (12 + 1)
            const slots = screen.getAllByText(/\d+\.\dx/);
            expect(slots).toHaveLength(13);
        });
    });

    test('should handle Lightning mode as placeholder', async () => {
        const lightningProps = { ...defaultProps, gameMode: 'Lightning' as const };
        const lightningData = {
            ...mockPayoutData,
            mode: 'Lightning',
            isPlaceholder: true,
        };

        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(lightningData),
            } as Response)
        );

        render(<PayoutsRow {...lightningProps} />);

        await waitFor(() => {
            expect(screen.getAllByText('5.6x')).toHaveLength(2); // Should use Medium multipliers (which have 5.6x at edges)
        });
    });

    test('should handle network errors gracefully', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.reject(new Error('Network error'))
        );

        render(<PayoutsRow {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('Error: Network error while fetching payouts')).toBeInTheDocument();
        });
    });

    test('should display no data message when payoutData is null', async () => {
        // This shouldn't normally happen, but test edge case
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({ success: true }),
            } as Response)
        );

        render(<PayoutsRow {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('No payout data available')).toBeInTheDocument();
        });
    });

    test('should have responsive styling classes', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockPayoutData),
            } as Response)
        );

        render(<PayoutsRow {...defaultProps} />);

        await waitFor(() => {
            const slots = screen.getAllByText('5.6x');
            expect(slots).toHaveLength(2);
            // Check that the slots have the styled-components classes
            const firstSlot = slots[0].closest('div');
            expect(firstSlot).toHaveAttribute('class');
            expect(firstSlot!.className).toMatch(/sc-/); // styled-components class pattern
        });
    });
});
