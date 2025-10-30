import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import BaccaratScoreboardGuidePopup from '../baccarat-scoreboard-guide-popup';

// Mock all dependencies
jest.mock('@shared/react-hooks/use-translator', () => ({
    useTranslator: jest.fn(() => ({ t: (key: string) => `translated_${key}` })),
}));

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, width, height, className, ...props }: any) => (
        <div
            data-src={src}
            data-alt={alt}
            data-width={width}
            data-height={height}
            className={className}
            data-testid={`image-${alt}`}
            {...props}
        />
    ),
}));

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('BaccaratScoreboardGuidePopup', () => {
    const GUIDE_ITEM_COUNT = 6;
    const ANIMATION_DELAY = 10;
    const ANIMATION_DURATION = 300;

    const mockOnClose = jest.fn();
    let mockContainerRef: React.RefObject<HTMLDivElement>;

    beforeEach(() => {
        const containerElement = document.createElement('div');
        mockContainerRef = { current: containerElement };
    });

    const defaultProps = {
        isVisible: true,
        onClose: mockOnClose,
        containerRef: mockContainerRef,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_BASE_PATH = '';

        const { useTranslator } = require('@shared/react-hooks/use-translator');
        useTranslator.mockReturnValue({ t: (key: string) => `translated_${key}` });
    });

    afterEach(() => {
        jest.clearAllTimers();
        delete process.env.NEXT_PUBLIC_BASE_PATH;
    });

    describe('rendering behavior', () => {
        it('should not render when isVisible is false', () => {
            render(
                <BaccaratScoreboardGuidePopup
                    {...defaultProps}
                    isVisible={false}
                />
            );

            expect(screen.queryByRole('img')).toBeNull();
        });

        it('should render immediately when isVisible is true', async () => {
            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            await waitFor(() => {
                const images = screen.getAllByTestId(/^image-/);
                expect(images.length).toBe(GUIDE_ITEM_COUNT);
            });

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });
        });

        it('should render all guide items', async () => {
            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });

            await waitFor(() => {
                const images = screen.getAllByTestId(/^image-/);
                expect(images.length).toBe(GUIDE_ITEM_COUNT);
            });
        });

        it('should render translated labels for all guide items', async () => {
            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });

            await waitFor(() => {
                expect(screen.getByText('translated_glossary_player')).toBeInTheDocument();
                expect(screen.getByText('translated_glossary_banker')).toBeInTheDocument();
                expect(screen.getByText('translated_glossary_tie')).toBeInTheDocument();
                expect(screen.getByText('translated_glossary_player_pair')).toBeInTheDocument();
                expect(screen.getByText('translated_glossary_banker_pair')).toBeInTheDocument();
                expect(screen.getByText('translated_glossary_natural')).toBeInTheDocument();
            });
        });
    });

    describe('animation behavior', () => {
        it('should apply animation classes correctly when visible', async () => {
            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });

            await waitFor(() => {
                const popup = document.querySelector('[class*="opacity-100"]');
                expect(popup).toBeInTheDocument();
            });
        });

        it('should apply initial animation classes before animation completes', () => {
            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            const popup = document.querySelector('[class*="opacity-0"]');
            expect(popup).toBeInTheDocument();
        });

        it('should hide popup after animation duration when isVisible becomes false', async () => {
            const { rerender } = render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            // Make visible first
            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });
            await waitFor(() => {
                expect(screen.getAllByTestId(/^image-/)).toHaveLength(GUIDE_ITEM_COUNT);
            });

            rerender(
                <BaccaratScoreboardGuidePopup
                    {...defaultProps}
                    isVisible={false}
                />
            );

            expect(screen.getAllByTestId(/^image-/)).toHaveLength(GUIDE_ITEM_COUNT);

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DURATION);
            });

            await waitFor(() => {
                expect(screen.queryByTestId(/^image-/)).toBeNull();
            });
        });
    });

    describe('click outside behavior', () => {
        it('should add event listener when visible', async () => {
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

            addEventListenerSpy.mockRestore();
        });

        it('should remove event listener on unmount', () => {
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

            const { unmount } = render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });

        it('should handle containerRef being null gracefully', async () => {
            const nullContainerRef = { current: null };

            expect(() => {
                render(
                    <BaccaratScoreboardGuidePopup
                        {...defaultProps}
                        containerRef={nullContainerRef}
                    />
                );
            }).not.toThrow();
        });
    });

    describe('base path handling', () => {
        it('should use base path in image sources when NEXT_PUBLIC_BASE_PATH is set', async () => {
            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });

            await waitFor(() => {
                const playerImage = screen.getByTestId('image-glossary_player');
                expect(playerImage).toHaveAttribute('data-src', expect.stringContaining('static/images/baccarat/scoreboard/scoreboard-guide/player.svg'));
            });
        });

        it('should construct correct image paths for all guide items', async () => {
            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });

            await waitFor(() => {
                const images = screen.getAllByTestId(/^image-/);
                expect(images).toHaveLength(GUIDE_ITEM_COUNT);

                // Check that all images have correct paths
                images.forEach(img => {
                    expect(img).toHaveAttribute('data-src', expect.stringContaining('/static/images/baccarat/scoreboard/scoreboard-guide/'));
                });
            });
        });
    });

    describe('accessibility and structure', () => {
        it('should have proper ARIA attributes', async () => {
            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });

            await waitFor(() => {
                // Check that images have alt data attributes
                const images = screen.getAllByTestId(/^image-/);
                expect(images.length).toBe(GUIDE_ITEM_COUNT);
                images.forEach(img => {
                    expect(img).toHaveAttribute('data-alt');
                });
            });
        });

        it('should render items in two columns', async () => {
            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });

            await waitFor(() => {
                // Should have flex containers for columns
                const flexContainers = document.querySelectorAll('[class*="flex flex-col"]');
                expect(flexContainers.length).toBe(2);
            });
        });

        it('should render first 3 items in first column and last 3 in second column', async () => {
            render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });

            await waitFor(() => {
                // Check first column has first 3 items
                expect(screen.getByText('translated_glossary_player')).toBeInTheDocument();
                expect(screen.getByText('translated_glossary_banker')).toBeInTheDocument();
                expect(screen.getByText('translated_glossary_tie')).toBeInTheDocument();

                // Check second column has last 3 items
                expect(screen.getByText('translated_glossary_player_pair')).toBeInTheDocument();
                expect(screen.getByText('translated_glossary_banker_pair')).toBeInTheDocument();
                expect(screen.getByText('translated_glossary_natural')).toBeInTheDocument();
            });
        });
    });

    describe('edge cases', () => {
        it('should handle containerRef being null', async () => {
            const nullContainerRef = { current: null };

            render(
                <BaccaratScoreboardGuidePopup
                    {...defaultProps}
                    containerRef={nullContainerRef}
                />
            );

            await act(async () => {
                jest.advanceTimersByTime(ANIMATION_DELAY);
            });

            await waitFor(() => {
                // Should still render without errors
                expect(screen.getAllByTestId(/^image-/)).toHaveLength(GUIDE_ITEM_COUNT);
            });
        });

        it('should clean up event listeners on unmount', () => {
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

            const { unmount } = render(<BaccaratScoreboardGuidePopup {...defaultProps} />);

            expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

            addEventListenerSpy.mockRestore();
            removeEventListenerSpy.mockRestore();
        });
    });
});
