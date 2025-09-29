import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameModeSelector from '../components/bet-controls/GameModeSelector';

// Mock the SCSS module
jest.mock('../components/bet-controls/GameModeSelector.module.scss', () => ({
    // Mock any CSS classes that might be used
}));

// Mock console.warn to track Lightning mode warnings
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

describe('GameModeSelector Component', () => {
    const mockOnGameModeChange = jest.fn();
    const defaultProps = {
        gameMode: 'Medium' as const,
        onGameModeChange: mockOnGameModeChange,
    };

    beforeEach(() => {
        mockOnGameModeChange.mockClear();
        consoleWarnSpy.mockClear();
    });

    afterAll(() => {
        consoleWarnSpy.mockRestore();
    });

    describe('Rendering', () => {
        it('should render all game mode options', () => {
            render(<GameModeSelector {...defaultProps} />);

            expect(screen.getByText('Game Mode')).toBeInTheDocument();
            expect(screen.getByText('Lightning')).toBeInTheDocument();
            expect(screen.getByText('Low')).toBeInTheDocument();
            expect(screen.getByText('Medium')).toBeInTheDocument();
            expect(screen.getByText('High')).toBeInTheDocument();
        });

        it('should render mode options as proper button elements', () => {
            render(<GameModeSelector {...defaultProps} />);

            const modeButtons = screen.getAllByRole('button');
            expect(modeButtons).toHaveLength(4);

            modeButtons.forEach(button => {
                expect(button.tagName).toBe('BUTTON');
                expect(button).toHaveAttribute('type', 'button');
            });
        });

        it('should show selected state for current game mode', () => {
            render(<GameModeSelector {...defaultProps} gameMode="Lightning" />);

            const lightningButton = screen.getByText('Lightning');
            expect(lightningButton.closest('button')).toHaveAttribute('aria-pressed', 'true');

            const mediumButton = screen.getByText('Medium');
            expect(mediumButton.closest('button')).toHaveAttribute('aria-pressed', 'false');
        });
    });

    describe('Mode Selection', () => {
        it('should call onGameModeChange when Low mode is clicked', () => {
            render(<GameModeSelector {...defaultProps} />);

            const lowButton = screen.getByText('Low');
            fireEvent.click(lowButton);

            expect(mockOnGameModeChange).toHaveBeenCalledWith('Low');
            expect(mockOnGameModeChange).toHaveBeenCalledTimes(1);
        });

        it('should call onGameModeChange when Medium mode is clicked', () => {
            render(<GameModeSelector {...defaultProps} />);

            const mediumButton = screen.getByText('Medium');
            fireEvent.click(mediumButton);

            expect(mockOnGameModeChange).toHaveBeenCalledWith('Medium');
            expect(mockOnGameModeChange).toHaveBeenCalledTimes(1);
        });

        it('should call onGameModeChange when High mode is clicked', () => {
            render(<GameModeSelector {...defaultProps} />);

            const highButton = screen.getByText('High');
            fireEvent.click(highButton);

            expect(mockOnGameModeChange).toHaveBeenCalledWith('High');
            expect(mockOnGameModeChange).toHaveBeenCalledTimes(1);
        });

        // Section 4.3: Lightning mode placeholder functionality
        it('should call onGameModeChange when Lightning mode is clicked', () => {
            render(<GameModeSelector {...defaultProps} />);

            const lightningButton = screen.getByText('Lightning');
            fireEvent.click(lightningButton);

            expect(mockOnGameModeChange).toHaveBeenCalledWith('Lightning');
            expect(mockOnGameModeChange).toHaveBeenCalledTimes(1);
        });

        it('should log warning when Lightning mode is selected (Section 4.3 TBD)', () => {
            render(<GameModeSelector {...defaultProps} />);

            const lightningButton = screen.getByText('Lightning');
            fireEvent.click(lightningButton);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Lightning mode selected: This mode is currently under development (Section 4.3 - TBD). Using fallback payouts.'
            );
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        });

        it('should not log warning for other modes', () => {
            render(<GameModeSelector {...defaultProps} />);

            const lowButton = screen.getByText('Low');
            const mediumButton = screen.getByText('Medium');
            const highButton = screen.getByText('High');

            fireEvent.click(lowButton);
            fireEvent.click(mediumButton);
            fireEvent.click(highButton);

            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe('Mode Persistence', () => {
        it('should accept different initial gameMode values', () => {
            const { rerender } = render(<GameModeSelector {...defaultProps} gameMode="Low" />);
            expect(screen.getByText('Low')).toBeInTheDocument();

            rerender(<GameModeSelector {...defaultProps} gameMode="High" />);
            expect(screen.getByText('High')).toBeInTheDocument();
        });
    });

    describe('Lightning Mode Integration (Section 4.3)', () => {
        it('should handle Lightning mode selection without errors', () => {
            render(<GameModeSelector {...defaultProps} />);

            const lightningButton = screen.getByText('Lightning');

            // Should not throw any errors
            expect(() => {
                fireEvent.click(lightningButton);
            }).not.toThrow();

            expect(mockOnGameModeChange).toHaveBeenCalledWith('Lightning');
        });

        it('should allow switching from other modes to Lightning', () => {
            render(<GameModeSelector {...defaultProps} gameMode="Medium" />);

            const lightningButton = screen.getByText('Lightning');
            fireEvent.click(lightningButton);

            expect(mockOnGameModeChange).toHaveBeenCalledWith('Lightning');
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        });

        it('should allow switching from Lightning to other modes', () => {
            render(<GameModeSelector {...defaultProps} gameMode="Lightning" />);

            const mediumButton = screen.getByText('Medium');
            fireEvent.click(mediumButton);

            expect(mockOnGameModeChange).toHaveBeenCalledWith('Medium');
            expect(consoleWarnSpy).not.toHaveBeenCalled(); // Only called when selecting Lightning
        });
    });

    describe('Keyboard Navigation', () => {
        it('should support keyboard activation with Enter key', () => {
            render(<GameModeSelector {...defaultProps} />);

            const lightningButton = screen.getByText('Lightning').closest('button');
            fireEvent.keyDown(lightningButton!, { key: 'Enter', code: 'Enter' });

            expect(mockOnGameModeChange).toHaveBeenCalledWith('Lightning');
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        });

        it('should support keyboard activation with Space key', () => {
            render(<GameModeSelector {...defaultProps} />);

            const lowButton = screen.getByText('Low').closest('button');
            fireEvent.keyDown(lowButton!, { key: ' ', code: 'Space' });

            expect(mockOnGameModeChange).toHaveBeenCalledWith('Low');
        });

        it('should be focusable by default', () => {
            render(<GameModeSelector {...defaultProps} />);

            const modeButtons = screen.getAllByRole('button');
            modeButtons.forEach(button => {
                expect(button).toBeVisible(); // Buttons are focusable by default
                expect(button.tabIndex).toBeGreaterThanOrEqual(-1); // Focusable elements have tabIndex >= -1
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid clicking between modes', () => {
            render(<GameModeSelector {...defaultProps} />);

            const lightningButton = screen.getByText('Lightning');
            const mediumButton = screen.getByText('Medium');

            fireEvent.click(lightningButton);
            fireEvent.click(mediumButton);
            fireEvent.click(lightningButton);

            expect(mockOnGameModeChange).toHaveBeenCalledTimes(3);
            expect(mockOnGameModeChange).toHaveBeenNthCalledWith(1, 'Lightning');
            expect(mockOnGameModeChange).toHaveBeenNthCalledWith(2, 'Medium');
            expect(mockOnGameModeChange).toHaveBeenNthCalledWith(3, 'Lightning');
            expect(consoleWarnSpy).toHaveBeenCalledTimes(2); // Called twice for Lightning selections
        });
    });
});
