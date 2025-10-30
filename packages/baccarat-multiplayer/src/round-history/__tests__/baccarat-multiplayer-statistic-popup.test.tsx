import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { BaccaratMultiplayerStatisticPopup } from "../baccarat-multiplayer-statistic-popup";
jest.mock("@shared/react-hooks", () => ({
  useClickSound: jest.fn(() => jest.fn()),
}));

jest.mock("@shared/stores/game-store/game-store", () => ({
  __esModule: true,
  default: jest.fn((selector: any) =>
    selector({
      roundHistory: [{ id: 1 }],
      isShowBlink: false,
    })
  ),
  getState: jest.fn(() => ({
    setShouldShowResults: jest.fn(),
  })),
}));

jest.mock("@shared/components/game-components/animations/animated-content", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="animated-content">{children}</div>,
}));

jest.mock("../../scoreboard/scoreboard", () => ({
  __esModule: true,
  default: function MockScoreboard({ onSwiperReady, onSlideChange }: any) {
      React.useLayoutEffect(() => {
        const mockSwiper = { slideTo: jest.fn(), activeIndex: 0 };
        onSwiperReady?.(mockSwiper);
      }, [onSwiperReady]);

    return (
      <div
        data-testid="scoreboard"
        onClick={() => onSlideChange?.({ activeIndex: 1 })}
      />
    );
  },
}));

jest.mock("../baccarat-bet-counts", () => ({
  __esModule: true,
  default: ({ onOpenGuide, onCloseGuide }: any) => (
    <div>
      <button onClick={onOpenGuide} data-testid="open-guide">open-guide</button>
      <button onClick={onCloseGuide} data-testid="close-guide">close-guide</button>
    </div>
  ),
}));

jest.mock("../baccarat-scoreboard-guide-popup", () => ({
  __esModule: true,
  default: ({ isVisible }: any) => (
    <div data-testid="guide-popup">{isVisible ? "visible" : "hidden"}</div>
  ),
}));

jest.mock("@shared/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

describe("BaccaratMultiplayerStatisticPopup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders component with required elements", async () => {
    await act(async () => {
      render(<BaccaratMultiplayerStatisticPopup />);
    });
    expect(screen.getByTestId("statistic-popup")).toBeInTheDocument();
    expect(screen.getByTestId("animated-content")).toBeInTheDocument();
    expect(screen.getByTestId("scoreboard")).toBeInTheDocument();
  });

  it("calls clickSound and onClose when close button clicked (inline=false)", async () => {
    const onClose = jest.fn();
    const clickSound = jest.fn();
    const mockUseClickSound = require("@shared/react-hooks").useClickSound;
    mockUseClickSound.mockReturnValue(clickSound);

    await act(async () => {
      render(<BaccaratMultiplayerStatisticPopup onClose={onClose} inline={false} />);
    });

    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);

    expect(clickSound).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("delays closing animation when inline=true", async () => {
    jest.useFakeTimers();
    const onClose = jest.fn();

    await act(async () => {
      render(<BaccaratMultiplayerStatisticPopup onClose={onClose} inline={true} />);
    });

    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(onClose).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("handles expand and collapse with clickSound", async () => {
    const clickSound = jest.fn();
    const mockUseClickSound = require("@shared/react-hooks").useClickSound;
    mockUseClickSound.mockReturnValue(clickSound);

    await act(async () => {
      render(<BaccaratMultiplayerStatisticPopup inline={true} />);
    });

    const expandBtn = screen.getByRole("button", { name: "Expand" });
    fireEvent.click(expandBtn);
    expect(clickSound).toHaveBeenCalled();
  });

  it("handles slide change (swiper index change)", async () => {
    const clickSound = jest.fn();
    const mockUseClickSound = require("@shared/react-hooks").useClickSound;
    mockUseClickSound.mockReturnValue(clickSound);

    await act(async () => {
      render(<BaccaratMultiplayerStatisticPopup inline />);
    });

    const scoreboard = screen.getByTestId("scoreboard");
    fireEvent.click(scoreboard);
    expect(clickSound).toHaveBeenCalled();
  });

  it("opens and closes guide popup correctly", async () => {
    await act(async () => {
      render(<BaccaratMultiplayerStatisticPopup inline />);
    });

    fireEvent.click(screen.getByTestId("open-guide"));
    expect(screen.getByTestId("guide-popup")).toHaveTextContent("visible");

    fireEvent.click(screen.getByTestId("close-guide"));
    expect(screen.getByTestId("guide-popup")).toHaveTextContent("hidden");
  });

  it("resets isExpanded to false on mount", async () => {
    await act(async () => {
      render(<BaccaratMultiplayerStatisticPopup />);
    });

    await waitFor(() => {
      const expandBtn = screen.getByRole("button", { name: "Expand" });
      expect(expandBtn).toBeInTheDocument();
    });
  });

});
