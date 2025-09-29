import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BetAmountInput from '../components/bet-controls/BetAmountInput';

// Mock the SCSS module
jest.mock('../components/bet-controls/BetAmountInput.module.scss', () => ({
    betAmountInput: 'betAmountInput',
    title: 'title',
    spanTitle: 'spanTitle',
    spanRoundId: 'spanRoundId',
    input: 'input',
    inputContainer: 'inputContainer',
    betInput: 'betInput',
    controlButtons: 'controlButtons',
    spanNumber: 'spanNumber',
    divContainerA6: 'divContainerA6',
    spanNumberA7: 'spanNumberA7',
    divContainerA8: 'divContainerA8',
    spanNumberA9: 'spanNumberA9',
    divContainerAa: 'divContainerAa',
    errorMessage: 'errorMessage',
}));

describe('BetAmountInput Component', () => {
    const mockOnBetAmountChange = jest.fn();
    const defaultProps = {
        betAmount: 10,
        onBetAmountChange: mockOnBetAmountChange,
    };

    beforeEach(() => {
        mockOnBetAmountChange.mockClear();
    });

    describe('Rendering', () => {
        it('should render the component with correct initial value', () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });
            expect(input).toBeInTheDocument();
            expect(input).toHaveValue('10');
        });

        it('should render the title and control buttons', () => {
            render(<BetAmountInput {...defaultProps} />);
            expect(screen.getByText('Bet Amount')).toBeInTheDocument();
            expect(screen.getByText('1/2')).toBeInTheDocument();
            expect(screen.getByText('2x')).toBeInTheDocument();
            expect(screen.getByText('Max')).toBeInTheDocument();
        });
    });

    describe('Input Validation and Auto-correction', () => {
        it('should accept valid numeric input', () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '25.5' } });
            expect(input).toHaveValue('25.5');
        });

        it('should reject non-numeric input', () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: 'abc' } });
            expect(input).toHaveValue('10'); // Should remain unchanged
        });

        it('should prevent multiple decimal points', () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '10.5.2' } });
            expect(input).toHaveValue('10'); // Should only accept first part
        });

        it('should auto-correct empty input to min bet on blur', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(input).toHaveValue('1');
                expect(mockOnBetAmountChange).toHaveBeenCalledWith(1);
                expect(screen.getByText('Bet adjusted to minimum amount')).toBeInTheDocument();
            });
        });

        it('should auto-correct value below min bet to min bet on blur', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '0.5' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(input).toHaveValue('1');
                expect(mockOnBetAmountChange).toHaveBeenCalledWith(1);
                expect(screen.getByText('Bet adjusted to minimum amount')).toBeInTheDocument();
            });
        });

        it('should auto-correct value above max bet to max bet on blur', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '150' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(input).toHaveValue('100');
                expect(mockOnBetAmountChange).toHaveBeenCalledWith(100);
                expect(screen.getByText('Bet adjusted to maximum amount')).toBeInTheDocument();
            });
        });

        it('should round decimals to 2 places on blur', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '10.567' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(input).toHaveValue('10.57'); // 10.567 rounded to 10.57
                expect(mockOnBetAmountChange).toHaveBeenCalledWith(10.57);
            });
        });

        it('should handle valid input without showing error', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '25' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(input).toHaveValue('25');
                expect(mockOnBetAmountChange).toHaveBeenCalledWith(25);
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });
        });
    });

    describe('Control Buttons', () => {
        it('should halve bet amount when 1/2 button is clicked', () => {
            render(<BetAmountInput {...defaultProps} />);
            const halfButton = screen.getByText('1/2');

            fireEvent.click(halfButton);
            expect(mockOnBetAmountChange).toHaveBeenCalledWith(5);
        });

        it('should double bet amount when 2x button is clicked', () => {
            render(<BetAmountInput {...defaultProps} />);
            const doubleButton = screen.getByText('2x');

            fireEvent.click(doubleButton);
            expect(mockOnBetAmountChange).toHaveBeenCalledWith(20);
        });

        it('should set max bet amount when Max button is clicked', () => {
            render(<BetAmountInput {...defaultProps} />);
            const maxButton = screen.getByText('Max');

            fireEvent.click(maxButton);
            expect(mockOnBetAmountChange).toHaveBeenCalledWith(100);
        });
    });

    describe('Error Message Display', () => {
        it('should show custom error message when showError prop is true', () => {
            render(<BetAmountInput {...defaultProps} showError={true} errorMessage="Custom error" />);
            expect(screen.getByText('Custom error')).toBeInTheDocument();
        });

        it('should clear error message after 3 seconds', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '0.5' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(screen.getByText('Bet adjusted to minimum amount')).toBeInTheDocument();
            });

            // Wait for error to clear
            await waitFor(() => {
                expect(screen.queryByText('Bet adjusted to minimum amount')).not.toBeInTheDocument();
            }, { timeout: 3500 });
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });
            expect(input).toHaveAttribute('aria-label', 'Bet amount input');
        });

        it('should have proper ARIA attributes for error messages', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '0.5' } });
            fireEvent.blur(input);

            await waitFor(() => {
                const errorElement = screen.getByRole('alert');
                expect(errorElement).toHaveAttribute('aria-live', 'polite');
            });
        });

        it('should support keyboard navigation for control buttons', () => {
            render(<BetAmountInput {...defaultProps} />);
            const halfButton = screen.getByText('1/2');

            expect(halfButton).toHaveAttribute('tabIndex', '0');
            expect(halfButton).toHaveAttribute('role', 'button');
        });
    });

    describe('Edge Cases', () => {
        it('should handle negative numbers by treating as invalid', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '-5' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(input).toHaveValue('1');
                expect(mockOnBetAmountChange).toHaveBeenCalledWith(1);
                expect(screen.getByText('Bet adjusted to minimum amount')).toBeInTheDocument();
            });
        });

        it('should handle zero as below minimum', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '0' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(input).toHaveValue('1');
                expect(mockOnBetAmountChange).toHaveBeenCalledWith(1);
                expect(screen.getByText('Bet adjusted to minimum amount')).toBeInTheDocument();
            });
        });

        it('should handle very large numbers', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '999999' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(input).toHaveValue('100');
                expect(mockOnBetAmountChange).toHaveBeenCalledWith(100);
                expect(screen.getByText('Bet adjusted to maximum amount')).toBeInTheDocument();
            });
        });

        it('should handle decimal precision correctly', async () => {
            render(<BetAmountInput {...defaultProps} />);
            const input = screen.getByRole('textbox', { name: /bet amount input/i });

            fireEvent.change(input, { target: { value: '10.123456' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(input).toHaveValue('10.12');
                expect(mockOnBetAmountChange).toHaveBeenCalledWith(10.12);
            });
        });
    });
});
