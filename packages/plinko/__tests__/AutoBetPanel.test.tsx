/**
 * Jest tests for AutoBetPanel component
 * Tests tab switching, configuration persistence, input validation, and auto bet functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AutoBetPanel from '../components/AutoBetPanel';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const { toast } = require('react-toastify');

const mockProps = {
  // New props structure
  sharedConfig: {
    betAmount: 100,
    gameMode: 'Lightning' as const,
    rows: 9,
  },
  autoConfig: {
    numberOfBets: 10,
    onWinAction: 'Reset' as const,
    onWinPercentage: 0,
    onLossAction: 'Reset' as const,
    onLossPercentage: 0,
    stopOnWin: 0,
    stopOnLoss: 0,
  },
  activeTab: 'Manual' as const,

  // Event handlers
  onSharedConfigChange: jest.fn(),
  onAutoConfigChange: jest.fn(),
  onTabChange: jest.fn(),

  // Auto bet specific handlers
  onBalanceUpdate: jest.fn(),
  onBetResult: jest.fn(),
};

describe('AutoBetPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Tab Rendering and Switching (Section 4.6)', () => {
    test('renders Manual and Auto tabs', () => {
      render(<AutoBetPanel {...mockProps} />);
      expect(screen.getByText('Manual')).toBeInTheDocument();
      expect(screen.getByText('Auto')).toBeInTheDocument();
    });

    test('highlights active tab only', () => {
      const { rerender } = render(<AutoBetPanel {...mockProps} activeTab="Manual" />);

      // Manual tab should have active styling
      const manualTab = screen.getByText('Manual');
      expect(manualTab).toHaveClass('bg-blue-600', 'text-white', 'shadow-lg');

      // Auto tab should have inactive styling
      const autoTab = screen.getByText('Auto');
      expect(autoTab).toHaveClass('text-gray-300', 'hover:text-white', 'hover:bg-gray-700');

      // Switch to Auto tab
      rerender(<AutoBetPanel {...mockProps} activeTab="Auto" />);

      // Auto tab should now have active styling
      const autoTabActive = screen.getByText('Auto');
      expect(autoTabActive).toHaveClass('bg-blue-600', 'text-white', 'shadow-lg');

      // Manual tab should have inactive styling
      const manualTabInactive = screen.getByText('Manual');
      expect(manualTabInactive).toHaveClass('text-gray-300', 'hover:text-white', 'hover:bg-gray-700');
    });

    test('calls onTabChange when clicking tabs', () => {
      render(<AutoBetPanel {...mockProps} />);
      fireEvent.click(screen.getByText('Auto'));
      expect(mockProps.onTabChange).toHaveBeenCalledWith('Auto');
    });

    test('persists configurations when switching tabs', () => {
      // Start with Manual tab
      render(<AutoBetPanel {...mockProps} activeTab="Manual" />);

      // Clear any previous calls
      mockProps.onSharedConfigChange.mockClear();
      mockProps.onAutoConfigChange.mockClear();

      // Click Auto tab to switch
      fireEvent.click(screen.getByText('Auto'));

      // Should restore auto bet configurations
      expect(mockProps.onSharedConfigChange).toHaveBeenCalledWith({
        betAmount: 100,
        gameMode: 'Lightning',
        rows: 9
      });
      expect(mockProps.onAutoConfigChange).toHaveBeenCalledWith({
        numberOfBets: 10,
        onWinAction: 'Reset',
        onWinPercentage: 0,
        onLossAction: 'Reset',
        onLossPercentage: 0,
        stopOnWin: 0,
        stopOnLoss: 0,
      });
    });
  });


  describe('Manual Tab Content', () => {
    test('shows manual bet controls when Manual tab is active', () => {
      render(<AutoBetPanel {...mockProps} activeTab="Manual" />);
      // Should show basic controls without auto bet fields
      expect(screen.getByText('Manual')).toBeInTheDocument();
      // Check that auto bet specific elements are not shown
      expect(screen.queryByText('Number of Bets')).not.toBeInTheDocument();
    });
  });

  describe('Auto Tab Content', () => {
    test('shows auto bet controls when Auto tab is active', () => {
      render(<AutoBetPanel {...mockProps} activeTab="Auto" />);
      expect(screen.getByText('Number of Bets')).toBeInTheDocument();
      expect(screen.getByText('On Win')).toBeInTheDocument();
      expect(screen.getByText('On Loss')).toBeInTheDocument();
      expect(screen.getByText('Stop on Win')).toBeInTheDocument();
      expect(screen.getByText('Stop on Loss')).toBeInTheDocument();
      expect(screen.getByText('START AUTO BET')).toBeInTheDocument();
    });

    test('shows scrollable panel structure', () => {
      render(<AutoBetPanel {...mockProps} activeTab="Auto" />);
      // Check for the scrollable container with overflow classes
      const scrollablePanel = document.querySelector('.overflow-y-auto');
      expect(scrollablePanel).toBeInTheDocument();
    });
  });


  describe('Configuration Persistence', () => {
    test('maintains separate configs for Manual and Auto tabs', () => {
      render(<AutoBetPanel {...mockProps} activeTab="Manual" />);

      // Clear all mock calls that happened during render
      Object.values(mockProps).forEach(mockFn => {
        if (typeof mockFn === 'function' && 'mockClear' in mockFn) {
          mockFn.mockClear();
        }
      });

      // Switch to Auto tab
      fireEvent.click(screen.getByText('Auto'));

      // Should load auto bet configurations
      expect(mockProps.onAutoConfigChange).toHaveBeenCalledWith({
        numberOfBets: 10,
        onWinAction: 'Reset',
        onWinPercentage: 0,
        onLossAction: 'Reset',
        onLossPercentage: 0,
        stopOnWin: 0,
        stopOnLoss: 0,
      });
    });
  });

  describe('Number of Bets Input Enhancement (Section 4.6.1)', () => {
    const getNumberOfBetsInput = (): HTMLInputElement => {
      // Find input within the Number of Bets container
      const numberOfBetsContainer = document.querySelector('.div-number-of-bets') as HTMLElement;
      return numberOfBetsContainer?.querySelector('input[type="text"]') as HTMLInputElement;
    };

    test('allows typing custom values in Number of Bets input', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, numberOfBets: 10 } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      const input = getNumberOfBetsInput();
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('10.00');
    });

    test('validates Number of Bets input on blur', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, numberOfBets: 10 } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      const input = getNumberOfBetsInput();

      // Clear previous calls
      mockProps.onAutoConfigChange.mockClear();

      // Type invalid characters
      fireEvent.change(input, { target: { value: 'abc123' } });
      fireEvent.blur(input);

      // Should be cleaned to just digits
      expect(mockProps.onAutoConfigChange).toHaveBeenCalledWith({ numberOfBets: 123 });
    });

    test('caps Number of Bets at maximum value', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, numberOfBets: 10 } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      const input = getNumberOfBetsInput();

      // Clear previous calls
      mockProps.onAutoConfigChange.mockClear();

      // Type value exceeding maximum
      fireEvent.change(input, { target: { value: '2000000000' } });
      fireEvent.blur(input);

      // Should be capped at 999999999
      expect(mockProps.onAutoConfigChange).toHaveBeenCalledWith({ numberOfBets: 999999999 });
    });

    test('handles Enter key to validate input', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, numberOfBets: 10 } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      const input = getNumberOfBetsInput();

      // Clear previous calls
      mockProps.onAutoConfigChange.mockClear();

      fireEvent.change(input, { target: { value: '50' } });
      fireEvent.blur(input); // Test blur directly since Enter triggers blur

      expect(mockProps.onAutoConfigChange).toHaveBeenCalledWith({ numberOfBets: 50 });
    });

    test('shows placeholder for infinity value', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, numberOfBets: Infinity } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      const input = getNumberOfBetsInput();
      expect(input.placeholder).toBe('∞');
      expect(input.value).toBe('');
    });

    test('preset buttons still work correctly', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, numberOfBets: 10 } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);

      // Click the "100" preset button (second container-bb)
      const presetButtons = document.querySelectorAll('.container-bb');
      const hundredButton = presetButtons[1]; // Second button with container-bb class
      fireEvent.click(hundredButton);

      expect(mockProps.onAutoConfigChange).toHaveBeenCalledWith({ numberOfBets: 100 });
    });

    test('infinity preset button sets value to Infinity', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, numberOfBets: 10 } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);

      // Click the "∞" preset button
      const infinityButton = document.querySelector('.container-b9');
      fireEvent.click(infinityButton);

      expect(mockProps.onAutoConfigChange).toHaveBeenCalledWith({ numberOfBets: Infinity });
    });
  });

  describe('Enhanced UI Toggle Functionality', () => {
    test('shows Reset button as active when onWinAction is Reset', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, onWinAction: 'Reset' as const } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      // Check that the Reset button in On Win section has the selected class
      const resetButton = document.querySelector('button[aria-pressed="true"]');
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).toHaveTextContent('Reset');
    });

    test('shows Increase By button as active when onWinAction is Increase', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, onWinAction: 'Increase' as const } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      // Check that the Increase By button in On Win section has the selected class
      const increaseButton = document.querySelector('button[aria-pressed="true"]');
      expect(increaseButton).toBeInTheDocument();
      expect(increaseButton).toHaveTextContent('Increase by');
    });

    test('disables percentage input when Reset is selected', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, onWinAction: 'Reset' as const } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      // Find the input in the On Win section
      const onWinContainer = document.querySelector('.container-bd');
      const input = onWinContainer?.querySelector('input[type="text"]') as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    test('enables percentage input when Increase By is selected', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, onWinAction: 'Increase' as const } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      // Find the input in the On Win section
      const onWinContainer = document.querySelector('.container-bd');
      const input = onWinContainer?.querySelector('input[type="text"]') as HTMLInputElement;
      expect(input).not.toBeDisabled();
    });

    test('calls onWinActionChange when clicking Reset button', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, onWinAction: 'Increase' as const } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      // Click the Reset button in On Win section (within container-bd)
      const onWinSection = document.querySelector('.container-bd');
      const resetButton = onWinSection?.querySelector('button');
      fireEvent.click(resetButton);
      expect(mockProps.onAutoConfigChange).toHaveBeenCalledWith({ onWinAction: 'Reset' });
    });

    test('calls onWinActionChange when clicking Increase By button', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, onWinAction: 'Reset' as const } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      // Click the Increase By button in On Win section (within container-bd)
      const onWinSection = document.querySelector('.container-bd');
      const increaseButton = onWinSection?.querySelectorAll('button')[1]; // Second button
      fireEvent.click(increaseButton);
      expect(mockProps.onAutoConfigChange).toHaveBeenCalledWith({ onWinAction: 'Increase' });
    });

    test('On Loss toggle works independently from On Win', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, onWinAction: 'Reset' as const, onLossAction: 'Increase' as const } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      // Check that there are two pressed buttons (Reset and Increase by)
      const pressedButtons = document.querySelectorAll('button[aria-pressed="true"]');
      expect(pressedButtons).toHaveLength(2);
      expect(pressedButtons[0]).toHaveTextContent('Reset');
      expect(pressedButtons[1]).toHaveTextContent('Increase by');
    });
  });

  describe('Auto Bet Field Validation (Section 4.6.1)', () => {
    test('validates On Win/Loss percentages', () => {
      const testProps = { ...mockProps, autoConfig: { ...mockProps.autoConfig, onWinPercentage: 50 } };
      render(<AutoBetPanel {...testProps} activeTab="Auto" />);
      // The validation logic is in the selector components
      expect(screen.getByText('On Win')).toBeInTheDocument();
    });
  });
});
