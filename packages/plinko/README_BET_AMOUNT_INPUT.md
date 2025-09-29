<!-- @format -->

# Bet Amount Input Implementation (Section 4.1)

This document describes the implementation of the Bet Amount Input feature for the Plinko game, adhering to Section 4.1 specifications.

## Overview

The Bet Amount Input component allows players to input a numeric bet amount with validation and auto-correction according to the game requirements.

## Features Implemented

### ✅ Frontend Component (`BetAmountInput.tsx`)

**Location**: `components/bet-controls/BetAmountInput.tsx`

**Key Features**:

- Numeric input field accepting decimals
- Real-time input validation (only 0-9 and decimal point allowed)
- Auto-correction on blur according to Section 4.1 rules
- Error message display with auto-dismiss after 3 seconds
- Integration with existing control buttons (1/2, 2x, Max)
- Accessibility support (ARIA labels, keyboard navigation)
- Styled with SCSS modules matching existing design patterns

**Validation Rules (Section 4.1)**:

- Only numeric input allowed (including decimals)
- Default value: minimum bet (1)
- Auto-correct to min bet if input < min bet
- Auto-correct to max bet if input > max bet
- Auto-correct to min bet if input is empty
- Round to 2 decimal places (e.g., 10.567 → 10.56)

### ✅ Backend API (`validate-bet-amount.js`)

**Location**: `api/validate-bet-amount.js`

**Endpoint**: `POST /api/validate-bet-amount`

**Features**:

- Validates bet amount against min/max limits
- Returns structured response with validation status
- Handles edge cases and error conditions
- Follows REST API best practices

**Request Body**:

```json
{
  "betAmount": "25.50"
}
```

**Response Format**:

```json
{
  "success": true,
  "isValid": true,
  "correctedAmount": 25.5,
  "message": "Bet amount is valid.",
  "originalAmount": "25.50",
  "minBet": 1,
  "maxBet": 100
}
```

### ✅ Comprehensive Tests

**Backend Tests**: `22 passing tests`

- Method validation (POST only)
- Input validation (missing, null, undefined)
- Numeric validation (valid/invalid strings)
- Range validation (min/max bounds)
- Decimal precision (2 decimal places)
- Edge cases (large numbers, boundaries)
- Error handling (internal server errors)

**Frontend Tests**: Comprehensive test suite covering:

- Component rendering and props
- Input validation and auto-correction
- Control button functionality
- Error message display and auto-dismiss
- Accessibility features
- Edge cases and boundary conditions

## Usage Example

### Basic Usage

```tsx
import { BetAmountInput } from "../components/bet-controls";

function GameControls({ betAmount, onBetAmountChange }) {
  return (
    <BetAmountInput
      betAmount={betAmount}
      onBetAmountChange={onBetAmountChange}
    />
  );
}
```

### With Custom Error Display

```tsx
<BetAmountInput
  betAmount={betAmount}
  onBetAmountChange={onBetAmountChange}
  showError={true}
  errorMessage='Custom validation error'
/>
```

### Backend Validation

```javascript
// Client-side call
const response = await fetch("/api/validate-bet-amount", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ betAmount: "25.50" }),
});

const result = await response.json();
if (result.isValid) {
  // Use result.correctedAmount
} else {
  // Handle validation error
}
```

## Configuration

**Constants** (defined in component and API):

- `MIN_BET = 1`
- `MAX_BET = 100`

**Validation Rules**:

1. Input must be numeric (including decimals)
2. Values below min are corrected to min
3. Values above max are corrected to max
4. Empty inputs are corrected to min
5. Decimals are rounded to 2 places

## Files Created/Modified

### New Files:

- `components/bet-controls/BetAmountInput.tsx`
- `components/bet-controls/BetAmountInput.module.scss`
- `api/validate-bet-amount.js`
- `__tests__/BetAmountInput.test.tsx`
- `__tests__/validate-bet-amount.test.js`
- `jest.config.js`
- `jest.setup.js`

### Modified Files:

- `types.ts` - Added `BetAmountInputProps` interface
- `components/bet-controls/index.ts` - Added component export
- `package.json` - Added test scripts and dependencies

## Testing

### Run Backend Tests

```bash
npm test __tests__/validate-bet-amount.test.js
```

### Run All Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

## Integration Notes

- **Styling**: Uses existing SCSS module pattern matching the current design system
- **State Management**: Integrates with existing `onBetAmountChange` callback pattern
- **Accessibility**: Includes ARIA labels and keyboard navigation support
- **Performance**: Input validation prevents unnecessary re-renders
- **Error Handling**: Graceful degradation with user-friendly error messages

## Section 4.1 Compliance

✅ **Player can input a bet amount**

- Implemented as controlled React input component

✅ **Only numeric input is allowed (including decimals)**

- Input validation prevents non-numeric characters
- Single decimal point enforcement

✅ **Default value is min bet**

- Component initializes with MIN_BET value

✅ **Auto-correct if smaller than min bet → min bet**

- Blur event validation enforces minimum

✅ **Auto-correct if larger than max bet → max bet**

- Blur event validation enforces maximum

✅ **Auto-correct if empty → min bet**

- Empty string validation on blur

✅ **Decimal precision limited to 2 digits**

- Math.round(amount \* 100) / 100 implementation

## Next Steps

1. **Integration**: Replace existing `BetAmountControls` with `BetAmountInput` in the main game component
2. **Styling Refinement**: Adjust styles to match exact mockup specifications
3. **Performance Testing**: Validate input handling with rapid typing
4. **Cross-browser Testing**: Ensure consistent behavior across browsers
5. **Accessibility Audit**: Complete WCAG compliance verification

## Dependencies Added

```json
{
  "devDependencies": {
    "jest": "^30.1.2",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest-environment-jsdom": "^30.1.2",
    "babel-jest": "^30.1.2",
    "identity-obj-proxy": "^3.0.0"
  }
}
```
