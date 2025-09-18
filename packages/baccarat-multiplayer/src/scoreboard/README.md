# Baccarat Multiplayer Scoreboard with Statistics

This document describes the comprehensive scoreboard implementation for the Baccarat Multiplayer game, featuring horizontal statistics bar, Big Road, and Bead Plate with advanced scrolling and pair detection capabilities.

## Overview

The Baccarat scoreboard system consists of two main components:

-   **Horizontal Statistics Bar**: Always visible, showing recent round results with pair indicators
-   **Expandable Scoreboard**: Big Road and Bead Plate with toggle functionality and scrolling support
-   **Pair Detection**: Visual indicators for Player Pair and Banker Pair results
-   **Advanced Scrolling**: Horizontal scrolling with drag support for large datasets

## 4.5 Statistics Bar

### Visual Representation

The horizontal statistics bar is **always visible** and displays results from previous rounds with the following color coding:

-   **Red (R)**: Banker wins
-   **Blue (P)**: Player wins  
-   **Green (T)**: Tie results

### Pair Indicators

When a round has any Pair (Player Pair or Banker Pair):
-   Displays **both** the round result AND the corresponding pair indicator
-   Pair indicator appears as a **white dot** on top of the result circle
-   The newest result is always appended to the **right side** of the statistics bar

### Example Statistics Bar
```
P  B  B  P  P  B  T  P  T  P  P  B  P  [Statistics Icon]
```

## Scoreboard Behavior

### Opening the Scoreboard

When the player clicks the **Statistics button**:
-   Scoreboard opens with **Big Road expanded**
-   **Bead Plate collapsed** by default
-   Shows total counts based on the latest **102 rounds**

### Toggle Functionality

**Expand Button Behavior:**
-   Toggles between expanded Big Road or expanded Bead Plate
-   When one is expanded, the other automatically collapses
-   **Collapsed board** displays only the **latest 3 columns** of results

**Close Functionality:**
-   Click the Statistics icon again to collapse the Big Road
-   Returns to statistics bar only view

### Statistics Counts

The scoreboard displays totals for:
-   **Player wins** (P count)
-   **Banker wins** (B count)  
-   **Tie results** (T count)
-   **Pair occurrences** (Pair count)

All counts are based on the **latest 102 rounds**.

## V. Statistic Components

### Bead Road

**Matrix Specifications:**
-   **Dimension**: 6 (rows) × 17 (columns)
-   **Total**: 102 cells
-   **Display**: Show full board

**Insert Rules:**
-   Results are inserted sequentially from left to right, top to bottom
-   Each cell represents one round result
-   Colors: Red (Banker), Blue (Player), Green (Tie)
-   Pair indicators shown as white dots on result circles
-   Fill first column completely (6 cells) before moving to second column
-   Continue pattern until all 102 cells are filled

**Visual Layout:**
```
Column A → Column B → ... → Column 17
  ↓         ↓                   ↓
[Row 1] [Row 1] ... [Row 1]
[Row 2] [Row 2] ... [Row 2]
[Row 3] [Row 3] ... [Row 3]
[Row 4] [Row 4] ... [Row 4]
[Row 5] [Row 5] ... [Row 5]
[Row 6] [Row 6] ... [Row 6]
                    [Tie]
```

### Big Road

**Matrix Specifications:**
-   **Dimension**: 6 (rows) × 17 (columns)  
-   **Total**: 102 cells
-   **Display**: Show full board

**Insert Rules:**

1. **Consecutive Wins Logic:**
   -   Each filled column on this board shows how many consecutive wins have happened for either Player or Banker
   -   Entries will only be added in the same column if they are the **same color** as the previous entry
   -   If the entries are in a **different color** than the previous entry → add them to the **next column**

2. **"Tie" Results Shown in Big Road:**
   -   Ties are **NOT** shown as a separate icon
   -   Instead, they are shown as a **green slash "/"**, embedded inside the circle of the last round
   -   If there is more than 1 consecutive Tie, the **number of Ties will be written on the "Slash"**
   -   Examples:
     - First Tie → Shows "/" 
     - Second consecutive Tie → Shows "/2"
     - Third consecutive Tie → Shows "/3"

**Tie Handling Examples:**

| Round | Result | Insert Rule | Scoreboard Display |
|-------|--------|-------------|-------------------|
| 1st   | Tie    | /          | Green slash only  |
| 2nd   | Tie    | /2         | Slash with "2"    |
| 3rd   | A      | ○/2        | Red circle with slash showing 2 ties |

**Column Logic Example:**
```
Column 1: P-P-P (3 consecutive Player wins)
Column 2: B-B (2 consecutive Banker wins)  
Column 3: P/2-P (Player win, 2 ties, then Player win)
```

### Dragon Tail

A **"Dragon Tail"** is formed when a column on a board is filled and there is no room left for another entry in the same column, it turns right from the bottom.

**Basic Dragon Tail Rules:**
1. When a column reaches the bottom (6th row) and needs more entries of the same color
2. The tail turns **right** and continues horizontally
3. Each subsequent entry of the same color extends the tail to the right

**Multiple Dragon Tails:**
-   If multiple consecutive dragon tails exist, they turn right at the bottom instead of overlapping with the previous tails
-   Each new tail starts on a separate row to avoid collision

**Dragon Tail Length Management:**
-   If there are consecutive dragon tails, and the tail above gets longer than the one below, it is common for the tail above to **drop down**
-   This prevents overcrowding and maintains visual clarity

**Same Color Dragon Tail Logic:**
-   If the tails are the **same color**, then we move **one extra cell forward** before dropping down
-   This way we can clearly distinguish where both tails start and end
-   **Red tails**: Move one cell forward before dropping
-   **Blue tails**: Move one cell forward before dropping

**Dragon Tail Visual Examples:**

```
Standard Dragon Tail:
Column fills vertically → Tail extends horizontally
P
P  
P
P
P
P → P → P → P

Multiple Dragon Tails (Different Colors):
P                    B
P                    B  
P                    B
P                    B
P                    B
P → P → P → P        B → B → B

Same Color Dragon Tails (with offset):
P                    P
P                    P  
P                    P
P                    P
P                    P
P → P → P → P        P → → P → P → P
                     (extra cell forward)
```

**Statistical Display:**
```
Player:  54% ○○○○○○○○○○○○○○○○○○○
Banker:  42% ○○○○○○○○○○○○○○○ 
Tie:     4%  ○○
```

## Technical Implementation

### Key Components

#### 1. BaccaratMultiplayerRoundHistoryItem

**Location**: `src/round-history/baccarat-multiplayer-round-history-item.tsx`

**Features:**
-   Unified `RoundHistoryItem` component for all result types
-   Automatic pair detection and white dot rendering
-   Color coding: Red (Banker), Blue (Player), Green (Tie)

**Props:**
```typescript
type RoundHistoryItemProps = {
    label: string;
    variant: "player-item" | "banker-item" | "tie-item";
    hasPair: boolean;
};
```

#### 2. Enhanced Scoreboard Component

**Location**: `src/scoreboard/scoreboard.tsx`

**Features:**
-   Big Road and Bead Road rendering with separate methods
-   Advanced Dragon Tail handling for column overflow
-   Dynamic matrix calculation for 102-cell layout (6×17)
-   Tie slash embedding with consecutive tie counting
-   Natural outcome detection and visual indicators
-   Horizontal scrolling with smooth animations

### Usage Examples

#### Basic Statistics Bar Implementation

```tsx
import { BaccaratMultiplayerRoundHistoryItem } from "./round-history-item";

const StatisticsBar = () => {
    const [roundHistory, setRoundHistory] = useState([]);

    return (
        <div className="horizontal-statistics-bar">
            {roundHistory.map((result, index) => (
                <BaccaratMultiplayerRoundHistoryItem 
                    key={result.roundId}
                    result={result}
                    index={index}
                />
            ))}
            <StatisticsButton onClick={openScoreboard} />
        </div>
    );
};
```

#### Scoreboard with Toggle Functionality

```tsx
const BaccaratScoreboard = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedView, setExpandedView] = useState('bigroad'); // 'bigroad' | 'beadplate'
    const [roundHistory, setRoundHistory] = useState([]);

    const toggleView = () => {
        setExpandedView(prev => prev === 'bigroad' ? 'beadplate' : 'bigroad');
    };

    const closeScoreboard = () => {
        setIsExpanded(false);
    };

    return (
        <div className="baccarat-scoreboard">
            {/* Statistics Bar - Always Visible */}
            <StatisticsBar roundHistory={roundHistory} />
            
            {isExpanded && (
                <div className="scoreboard-container">
                    <div className="statistics-summary">
                        <div>Player: {playerCount}</div>
                        <div>Banker: {bankerCount}</div>
                        <div>Tie: {tieCount}</div>
                        <div>Pairs: {pairCount}</div>
                    </div>
                    
                    <div className="boards-container">
                        <BigRoad 
                            expanded={expandedView === 'bigroad'}
                            roundHistory={roundHistory}
                            onToggle={toggleView}
                        />
                        <BeadPlate 
                            expanded={expandedView === 'beadplate'}
                roundHistory={roundHistory}
                            onToggle={toggleView}
                        />
                    </div>
                    
                    <button onClick={closeScoreboard}>Close</button>
                </div>
            )}
        </div>
    );
};
```

## Scrolling and Performance

### SwipeScrollGrid Integration

The scoreboard uses `SwipeScrollGrid` for smooth horizontal scrolling:

```typescript
interface SwipeScrollGridProps {
    children: React.ReactNode;
    scrollRightSignal?: boolean;
    initialScrollRight?: boolean;
}
```

### Performance Optimizations

**Large Dataset Handling (102+ rounds):**
-   Virtual scrolling for efficient rendering
-   Dynamic column calculation
-   Smooth scroll animations
-   Memory-efficient event handling

**Matrix Calculations:**
-   6 rows × 17 columns = 102 cells maximum
-   Dragon Tail overflow handling for column extensions
-   Column grouping for Big Road consecutive wins logic
-   Same-color tail offset calculations (+1 cell forward)

**Dragon Tail Implementation:**
-   **Column Overflow Detection**: Automatically detects when columns reach 6 rows
-   **Horizontal Tail Extension**: Creates horizontal tails when columns are full
-   **Multi-Tail Management**: Handles multiple dragon tails without overlap
-   **Same Color Logic**: Implements +1 cell offset for same-color consecutive tails
-   **Tail Drop-Down**: Manages tail length balancing to prevent overcrowding

## Data Flow and State Management

### Round Result Processing

**Service Response Structure:**

The actual round result received from the service follows this exact format:

```typescript
// Actual service response structure
interface BaccaratRoundResult {
    roundId: number;
    result: {
        player: {
            card1: {
                rank: number;  // 0-12 (Ace=0, 2-9, 10=Jack/Queen/King, 11=Ace?)
                suit: number;  // 0-3 (Spades, Hearts, Diamonds, Clubs)
            };
            card2: {
                rank: number;
                suit: number;
            };
            card3: {
                rank: number;
                suit: number;
            } | null;  // Third card is optional
            score: number;  // Baccarat score (0-9)
        };
        banker: {
            card1: {
                rank: number;
                suit: number;
            };
            card2: {
                rank: number;
                suit: number;
            };
            card3: {
                rank: number;
                suit: number;
            } | null;  // Third card is optional
            score: number;  // Baccarat score (0-9)
        };
    };
    settlementResult: {
        player: boolean;   // true if Player wins
        banker: boolean;   // true if Banker wins
        tie: boolean;      // true if Tie
        anyPair: boolean;  // true if any pair occurred
    };
}
```

**Example Service Response:**

```json
{
    "roundId": 16692,
    "result": {
        "player": {
            "card1": {
                "rank": 5,
                "suit": 1
            },
            "card2": {
                "rank": 10,
                "suit": 1
            },
            "card3": null,
            "score": 6
        },
        "banker": {
            "card1": {
                "rank": 3,
                "suit": 1
            },
            "card2": {
                "rank": 12,
                "suit": 1
            },
            "card3": {
                "rank": 3,
                "suit": 2
            },
            "score": 8
        }
    },
    "settlementResult": {
        "player": false,
        "banker": true,
        "tie": false,
        "anyPair": false
    }
}
```

**Processing Example Round 16692:**

This specific round would be processed as follows:

- **Player Cards**: 6♥ + 10♥ = 6 points (no third card)
- **Banker Cards**: 4♥ + K♥ + 4♦ = 8 points (third card drawn)
- **Result**: Banker wins (8 > 6)
- **Pairs**: No pairs detected (`anyPair: false`)
- **Display**: Red "B" circle in statistics bar (no white dot)

```typescript
// How this round would be processed
const processedRound = {
    roundId: 16692,
    winner: 'banker',          // banker: true
    hasPlayerPair: false,      // no matching ranks in player cards
    hasBankerPair: true,       // rank 3 appears in card1 and card3
    displayColor: 'red',       // banker win = red
    showPairDot: false         // anyPair is false from service
};
```

**Note**: In this example, while the banker has two cards with rank 3, the `anyPair` flag from the service is `false`, so no pair indicator would be displayed. The application should trust the service's `anyPair` determination over local card analysis.

**Card Rank Mapping:**
```typescript
const CARD_RANKS = {
    0: "A",    // Ace
    1: "2",    // Two
    2: "3",    // Three
    3: "4",    // Four
    4: "5",    // Five
    5: "6",    // Six
    6: "7",    // Seven
    7: "8",    // Eight
    8: "9",    // Nine
    9: "10",   // Ten
    10: "J",   // Jack
    11: "Q",   // Queen
    12: "K"    // King
};
```

**Suit Mapping:**
```typescript
const CARD_SUITS = {
    0: "♠", // Spades
    1: "♥", // Hearts
    2: "♦", // Diamonds
    3: "♣"  // Clubs
};
```

### Pair Detection Logic

The system automatically detects pairs and applies visual indicators:

```typescript
const RoundHistoryItem = ({ label, variant, hasPair }) => (
    <div className={`round-history-item ${variant} relative`}>
        <div className="text">{label}</div>
        <div className="border"></div>
        {hasPair && <PairDot />}
    </div>
);
```

## Styling and Visual Design

### Color Scheme

-   **Player (Blue)**: `#2741c2` background, `linear-gradient(180deg, #274dc2 0%, #3d81ff 100%)` border
-   **Banker (Red)**: `#960322` background, `linear-gradient(180deg, #a10325 0%, #fb2956 100%)` border  
-   **Tie (Green)**: `#1B9603` background, `linear-gradient(180deg, #10b981 0%, #0e2e18 100%)` border

### Pair Dot Styling

```scss
.pair-dot {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #ffffff;
    border-radius: 50%;
    top: -2.5px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
}
```

### Responsive Design

-   **Desktop**: Full scoreboard with drag scrolling
-   **Tablet**: Touch-optimized scrolling
-   **Mobile**: Swipe gesture support with simplified UI

## Testing and Quality Assurance

### Test Coverage

1. **Statistics Bar Tests**
   -   Correct color rendering (Red/Blue/Green)
   -   Pair indicator display
   -   Right-side appending of new results

2. **Scoreboard Toggle Tests**
   -   Big Road default expanded state
   -   Bead Plate collapse/expand functionality
   -   Statistics counts accuracy (102 rounds)

3. **Big Road Algorithm Tests**
   -   Consecutive wins column logic
   -   Tie slash representation
   -   Multiple tie numbering

4. **Performance Tests**
   -   102+ round handling
   -   Smooth scrolling performance
   -   Memory usage optimization

### Running Tests

```bash
# Run Baccarat scoreboard tests
npm test -- --testPathPattern=baccarat.*scoreboard

# Test specific functionality
npm test -- --testPathPattern=round-history-item

# Performance testing with large datasets
npm test -- --testPathPattern=scoreboard.*performance
```

## Migration and Integration

### Integration with Game State

```typescript
// Connect to Zustand store
const useBaccaratStore = () => {
    const roundHistory = useStore(state => state.roundHistory);
    const isScoreboardOpen = useStore(state => state.isScoreboardOpen);
    
    return {
        roundHistory: roundHistory.slice(-102), // Latest 102 rounds
        isScoreboardOpen,
        openScoreboard: () => store.setState({ isScoreboardOpen: true }),
        closeScoreboard: () => store.setState({ isScoreboardOpen: false })
    };
};
```

### WebSocket Integration

```typescript
// Handle new round results from service
const handleNewRoundResult = (result: BaccaratRoundResult) => {
    console.log('New round result received:', result);
    
    // Process the result and determine winner
    const processedResult = {
        ...result,
        winner: result.settlementResult.player ? 'player' : 
                result.settlementResult.banker ? 'banker' : 'tie',
        hasPlayerPair: result.settlementResult.anyPair && hasPlayerPair(result.result.player),
        hasBankerPair: result.settlementResult.anyPair && hasBankerPair(result.result.banker)
    };
    
    // Update round history (keep latest 102 rounds)
    setRoundHistory(prev => [...prev, processedResult].slice(-102));
    
    // Update statistics counts
    updateStatisticsCounts(processedResult);
    
    // Trigger statistics bar animation
    setPlayResultAnimation(true);
    
    // Auto-scroll to newest result
    setTimeout(() => setPlayResultAnimation(false), 1000);
};

// Helper function to detect Player Pair
const hasPlayerPair = (playerCards: BaccaratRoundResult['result']['player']): boolean => {
    const cards = [playerCards.card1, playerCards.card2, playerCards.card3].filter(Boolean);
    return cards.some((card1, i) => 
        cards.some((card2, j) => i !== j && card1?.rank === card2?.rank)
    );
};

// Helper function to detect Banker Pair
const hasBankerPair = (bankerCards: BaccaratRoundResult['result']['banker']): boolean => {
    const cards = [bankerCards.card1, bankerCards.card2, bankerCards.card3].filter(Boolean);
    return cards.some((card1, i) => 
        cards.some((card2, j) => i !== j && card1?.rank === card2?.rank)
    );
};

// Update statistics based on actual service data
const updateStatisticsCounts = (result: BaccaratRoundResult) => {
    const counts = {
        player: result.settlementResult.player ? 1 : 0,
        banker: result.settlementResult.banker ? 1 : 0,
        tie: result.settlementResult.tie ? 1 : 0,
        pairs: result.settlementResult.anyPair ? 1 : 0
    };
    
    // Update running totals for latest 102 rounds
    updateRunningTotals(counts);
};

// Data validation for service responses
const validateRoundResult = (result: any): result is BaccaratRoundResult => {
    return (
        result &&
        typeof result.roundId === 'number' &&
        result.result &&
        result.result.player &&
        result.result.banker &&
        result.settlementResult &&
        typeof result.settlementResult.player === 'boolean' &&
        typeof result.settlementResult.banker === 'boolean' &&
        typeof result.settlementResult.tie === 'boolean' &&
        typeof result.settlementResult.anyPair === 'boolean'
    );
};

// Safe handling of service data
const handleServiceMessage = (data: unknown) => {
    if (!validateRoundResult(data)) {
        console.error('Invalid round result received:', data);
        return;
    }
    
    handleNewRoundResult(data);
};
```

## Future Enhancements

### Planned Features

1. **Dragon Tail Implementation** (High Priority)
   -   Full Dragon Tail algorithm implementation
   -   Column overflow detection and horizontal tail creation
   -   Multi-tail collision management
   -   Same-color tail offset logic (+1 cell forward)
   -   Tail drop-down and length balancing

2. **Advanced Analytics**
   -   Streak tracking and predictions
   -   Pattern recognition algorithms
   -   Historical trend analysis
   -   Dragon Tail pattern analysis

3. **Export Functionality**
   -   Save scoreboard as image
   -   Export statistics to CSV/PDF
   -   Share functionality

4. **Customization Options**
   -   Theme selection
   -   Color customization
   -   Layout preferences
   -   Dragon Tail visualization settings

### Performance Improvements

1. **Virtual Scrolling**: For datasets > 500 rounds
2. **Canvas Rendering**: Ultra-smooth animations
3. **Worker Threads**: Background calculations
4. **Caching**: Optimized state management

## Troubleshooting

### Common Issues

1. **Statistics bar not updating**
   -   Verify WebSocket connection
   -   Check round result data structure matches service format
   -   Ensure state management is working
   -   Validate `roundId` is incrementing correctly

2. **Pair indicators not showing**
   -   Confirm `anyPair` field in settlement result
   -   Check card rank comparison logic (rank 3 matching rank 3)
   -   Verify CSS z-index for white dot visibility
   -   Ensure pair detection handles null `card3` values

3. **Service data validation errors**
   -   Check if `card3` is properly handled as `null`
   -   Verify card rank values are within 0-12 range
   -   Confirm suit values are within 0-3 range
   -   Validate score values are within 0-9 range

4. **Scoreboard toggle not working**
   -   Check expand/collapse state management
   -   Verify button click handlers
   -   Ensure proper CSS transitions

5. **Big Road algorithm issues**
   -   Verify consecutive wins logic
   -   Check tie slash implementation
   -   Test column transition rules
   -   Debug Dragon Tail formation and positioning

6. **Dragon Tail rendering issues**
   -   Verify column overflow detection (when reaching 6th row)
   -   Check horizontal tail extension logic
   -   Ensure same-color tail offset (+1 cell) is applied
   -   Test multi-tail collision avoidance
   -   Validate tail drop-down behavior for length management

7. **Card display issues**
   -   Verify rank/suit mapping functions
   -   Check for undefined card values
   -   Handle optional third card properly
   -   Ensure card symbols render correctly

### Debug Mode

```typescript
const DEBUG_BACCARAT_SCOREBOARD = process.env.NODE_ENV === 'development';

if (DEBUG_BACCARAT_SCOREBOARD) {
    console.log('Round History:', roundHistory);
    console.log('Statistics Counts:', { playerCount, bankerCount, tieCount, pairCount });
    console.log('Scoreboard State:', { isExpanded, expandedView });
    
    // Dragon Tail debugging
    console.log('Column Heights:', columnHeights);
    console.log('Dragon Tails:', activeDragonTails);
    console.log('Tail Positions:', dragonTailPositions);
    console.log('Same Color Offsets:', sameColorTailOffsets);
}
```

## Contributing

When contributing to the Baccarat scoreboard:

1. **Follow Baccarat Rules**: Understand the game logic and statistics requirements
2. **Dragon Tail Logic**: Implement proper Dragon Tail algorithms following the specifications
3. **Test with Real Data**: Use actual round results for testing, including column overflow scenarios
4. **Matrix Management**: Ensure 6×17 matrix constraints and Dragon Tail extensions work correctly
5. **Performance Focus**: Ensure smooth operation with 102+ rounds and Dragon Tail rendering
6. **Mobile Optimization**: Test Dragon Tail visualization on various screen sizes
7. **Accessibility**: Ensure proper keyboard navigation and screen reader support for Dragon Tails

## License

This Baccarat multiplayer scoreboard implementation follows the same license as the parent project.