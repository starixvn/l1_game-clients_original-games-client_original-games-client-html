# Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Modern web browser

### Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd plinko-9-rows-solid

# Install dependencies
yarn install

# Start development server
yarn dev

# Open http://localhost:3001
```

## 💻 Development Workflow

### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/new-component

# Make changes and commit
git add .
git commit -m "feat: add new betting control component"

# Push and create PR
git push origin feature/new-component
```

### Code Quality
```bash
# Run linting
yarn lint

# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Build for production
yarn build
```

## 🏗️ Adding New Components

### Step-by-Step Guide

#### 1. Identify the Feature
Determine which feature your component belongs to:
- `game` - Ball physics, multipliers, game displays
- `betting` - Bet controls, tables, auto-bet logic
- `ui` - Shared navigation, controls, info displays

#### 2. Choose UI Layout Group
Select the appropriate subdirectory based on component purpose:

**Game Components:**
- `ball/` - Ball physics, rendering, layout
- `display/` - Multipliers, payouts, value displays
- `layout/` - Backgrounds, containers, messages

**Betting Components:**
- `controls/` - Input controls, selectors, form elements
- `panels/` - Main configuration panels and interfaces
- `tables/` - Data display, history, statistics

**UI Components:**
- `navigation/` - Tabs, navigation, routing
- `controls/` - Buttons, toggles, interactive elements
- `info/` - Information displays, status indicators

#### 3. Create Component Structure

```bash
# Example: Creating a new betting control
mkdir -p src/features/betting/components/controls
touch src/features/betting/components/controls/NewBetControl.tsx
touch src/features/betting/components/controls/NewBetControl.module.scss
```

#### 4. Implement Component

```typescript
// src/features/betting/components/controls/NewBetControl.tsx
import React from 'react';
import { NewBetControlProps } from '../../../../shared/types';
import styles from './NewBetControl.module.scss';

const NewBetControl: React.FC<NewBetControlProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className={styles.container}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={styles.input}
      />
    </div>
  );
};

export default NewBetControl;
```

```scss
// src/features/betting/components/controls/NewBetControl.module.scss
.container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;

  &:focus {
    outline: 2px solid #4a90e2;
    border-color: #4a90e2;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

#### 5. Add Type Definitions

```typescript
// src/shared/types/types.ts
export interface NewBetControlProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}
```

#### 6. Update Barrel Exports

```typescript
// src/features/betting/components/index.ts
export { default as NewBetControl } from './controls/NewBetControl';
// ... other exports
```

#### 7. Add Tests

```typescript
// __tests__/NewBetControl.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NewBetControl from '../src/features/betting/components/controls/NewBetControl';

describe('NewBetControl', () => {
  test('renders with initial value', () => {
    render(<NewBetControl value={100} onChange={() => {}} />);
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  test('calls onChange when value changes', () => {
    const mockOnChange = jest.fn();
    render(<NewBetControl value={100} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('100');
    fireEvent.change(input, { target: { value: '200' } });

    expect(mockOnChange).toHaveBeenCalledWith(200);
  });
});
```

## 🎨 Styling Guidelines

### CSS Modules Structure

```scss
// ComponentName.module.scss
.container {
  // Main container styles
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
}

.title {
  // Title styles
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.input {
  // Input field styles
  flex: 1;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;

  &:focus {
    outline: 2px solid #4a90e2;
    border-color: #4a90e2;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
}

// State modifiers
.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.error {
  border-color: #ef4444;

  &:focus {
    outline-color: #ef4444;
  }
}
```

### Responsive Design

```scss
.container {
  padding: 12px;

  @media (min-width: 768px) {
    padding: 16px;
  }

  @media (min-width: 1024px) {
    padding: 20px;
  }
}
```

## 🔄 State Management

### Local Component State

```typescript
const [value, setValue] = useState<number>(0);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
```

### Custom Hooks for Logic

```typescript
// src/features/betting/hooks/useBetValidation.ts
export const useBetValidation = (amount: number, balance: number) => {
  const isValid = useMemo(() => {
    return amount > 0 && amount <= balance;
  }, [amount, balance]);

  const errorMessage = useMemo(() => {
    if (amount <= 0) return 'Bet amount must be greater than 0';
    if (amount > balance) return 'Insufficient balance';
    return null;
  }, [amount, balance]);

  return { isValid, errorMessage };
};
```

### Context for Feature State

```typescript
// src/features/betting/hooks/useBettingContext.tsx
interface BettingContextType {
  bets: BetRecord[];
  addBet: (bet: BetRecord) => void;
  clearBets: () => void;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export const BettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bets, setBets] = useState<BetRecord[]>([]);

  const addBet = useCallback((bet: BetRecord) => {
    setBets(prev => [...prev, bet]);
  }, []);

  const clearBets = useCallback(() => {
    setBets([]);
  }, []);

  return (
    <BettingContext.Provider value={{ bets, addBet, clearBets }}>
      {children}
    </BettingContext.Provider>
  );
};

export const useBetting = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within BettingProvider');
  }
  return context;
};
```

## 🧪 Testing Patterns

### Component Testing

```typescript
// __tests__/BetAmountInput.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BetAmountInput from '../src/features/betting/components/controls/BetAmountInput';

describe('BetAmountInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders with initial value', () => {
    render(
      <BetAmountInput
        betAmount={100}
        onBetAmountChange={mockOnChange}
      />
    );

    expect(screen.getByDisplayValue('100.00')).toBeInTheDocument();
  });

  test('formats input with commas', () => {
    render(
      <BetAmountInput
        betAmount={1000}
        onBetAmountChange={mockOnChange}
      />
    );

    expect(screen.getByDisplayValue('1,000.00')).toBeInTheDocument();
  });

  test('calls onChange on valid input', async () => {
    render(
      <BetAmountInput
        betAmount={100}
        onBetAmountChange={mockOnChange}
      />
    );

    const input = screen.getByDisplayValue('100.00');
    fireEvent.change(input, { target: { value: '250.50' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(250.50);
    });
  });

  test('shows error for invalid input', () => {
    render(
      <BetAmountInput
        betAmount={100}
        onBetAmountChange={mockOnChange}
        showError={true}
        errorMessage="Invalid bet amount"
      />
    );

    expect(screen.getByText('Invalid bet amount')).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// __tests__/useBetValidation.test.ts
import { renderHook } from '@testing-library/react';
import { useBetValidation } from '../src/features/betting/hooks/useBetValidation';

describe('useBetValidation', () => {
  test('returns valid for positive amount within balance', () => {
    const { result } = renderHook(() =>
      useBetValidation(50, 100)
    );

    expect(result.current.isValid).toBe(true);
    expect(result.current.errorMessage).toBeNull();
  });

  test('returns invalid for amount exceeding balance', () => {
    const { result } = renderHook(() =>
      useBetValidation(150, 100)
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.errorMessage).toBe('Insufficient balance');
  });

  test('returns invalid for zero amount', () => {
    const { result } = renderHook(() =>
      useBetValidation(0, 100)
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.errorMessage).toBe('Bet amount must be greater than 0');
  });
});
```

## 🔧 Utility Functions

### Number Formatting

```typescript
// src/lib/utils/numberFormatting.ts
export const formatNumberWithCommas = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatCurrency = (amount: number): string => {
  return `$${formatNumberWithCommas(amount)}`;
};

export const formatPercentage = (value: number): string => {
  return `${formatNumberWithCommas(value)}%`;
};
```

### Validation Helpers

```typescript
// src/lib/utils/validation.ts
export const validateBetAmount = (amount: number, balance: number): string | null => {
  if (amount <= 0) return 'Bet amount must be greater than 0';
  if (amount > balance) return 'Insufficient balance';
  if (amount < 1) return 'Minimum bet is $1.00';
  if (amount > 10000) return 'Maximum bet is $10,000.00';
  return null;
};

export const validatePercentage = (percentage: number): string | null => {
  if (percentage < 0) return 'Percentage cannot be negative';
  if (percentage > 10000) return 'Percentage cannot exceed 10,000%';
  return null;
};
```

## 🚀 Performance Best Practices

### React Optimization

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  console.log('Rendering expensive component');
  return <div>{/* expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return data.filter(item => item.active).map(item => ({
    ...item,
    processedValue: expensiveCalculation(item.value)
  }));
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  onAction(selectedItem);
}, [onAction, selectedItem]);
```

### Bundle Optimization

```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Code splitting by route
const GamePage = lazy(() => import('../pages/GamePage'));
const BettingPage = lazy(() => import('../pages/BettingPage'));
```

## 🔒 Security Guidelines

### Input Sanitization

```typescript
// Sanitize user inputs
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 100); // Limit length
};
```

### API Security

```typescript
// Validate API requests
export const validateBetRequest = (data: BetRequest): ValidationResult => {
  const errors: string[] = [];

  if (!data.amount || data.amount <= 0) {
    errors.push('Invalid bet amount');
  }

  if (!data.gameMode || !['Lightning', 'Low', 'Medium', 'High'].includes(data.gameMode)) {
    errors.push('Invalid game mode');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## 📊 Debugging

### Logging Strategy

```typescript
// src/services/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data);
    }
    // Send to logging service in production
  },

  error: (message: string, error?: Error, data?: any) => {
    console.error(`[ERROR] ${message}`, error, data);
    // Send to error tracking service
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

### Development Tools

```typescript
// Debug component renders
const DebugComponent: React.FC = () => {
  console.log('DebugComponent rendered');
  return <div>Debug Component</div>;
};

// Performance monitoring
useEffect(() => {
  const start = performance.now();

  return () => {
    const end = performance.now();
    console.log(`Component render time: ${end - start}ms`);
  };
});
```

## 📚 Resources

### Key Files
- `src/shared/types/types.ts` - Global type definitions
- `src/lib/utils/` - Shared utilities
- `src/services/` - API and service integrations

### Useful Commands
```bash
# Development
yarn dev              # Start dev server
yarn build            # Production build
yarn start            # Production server

# Testing
yarn test             # Run tests
yarn test:watch       # Watch mode
yarn test:coverage    # Coverage report

# Code Quality
yarn lint             # ESLint check
```

### Naming Conventions
- **Components**: PascalCase (e.g., `BetAmountControls`)
- **Files**: PascalCase for components, camelCase for utilities
- **Hooks**: camelCase with `use` prefix (e.g., `useBetLogic`)
- **Types**: PascalCase with descriptive names
- **CSS Classes**: kebab-case in stylesheets

---

This guide provides the foundation for contributing to the Plinko game project. Follow these patterns to maintain code quality, consistency, and scalability.
