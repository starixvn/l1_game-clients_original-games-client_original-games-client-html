# 🎯 Plinko 9 Rows Game

A modern, feature-rich Plinko gambling game built with Next.js, React, TypeScript, and Matter.js physics engine.

![Game Screenshot](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=Plinko+Game+Screenshot)

## ✨ Features

-   **🎮 Real-time Physics**: Advanced ball physics simulation with Matter.js
-   **💰 Advanced Betting**: Manual and auto-betting with customizable strategies
-   **🎨 Modern UI**: Responsive design with smooth animations and effects
-   **📊 Live Statistics**: Real-time bet tracking and payout history
-   **🔄 Auto-Betting**: Intelligent betting strategies with win/loss conditions
-   **📱 Mobile Optimized**: Seamless experience across all devices

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+
-   npm or yarn

### Installation

```bash
git clone <repository-url>
cd plinko-9-rows-solid
yarn install
yarn dev
```

Visit `http://localhost:3001` to play the game!

## 📁 Project Structure

This project follows a **modular component architecture** with **shared utilities**:

```
src/
├── components/        # React components organized by feature
│   ├── plinko-game/   # Main game components
│   │   ├── canvas/    # Canvas-based physics rendering
│   │   ├── slots/     # Multiplier slot display
│   │   └── ...
│   └── plinko-game-base/ # Base game wrapper and handlers
├── shared/            # Shared utilities and types
│   ├── stores/        # Zustand state management
│   ├── types/         # TypeScript type definitions
│   └── colors-util.ts # Color utility functions
├── services/          # External services and logging
└── utils/             # Utility functions
```

### Key Directories

-   **`components/`**: Feature-organized React components
-   **`shared/`**: Common types, stores, and utilities
-   **`services/`**: API integrations and logging system
-   **`utils/`**: Helper functions and utilities

## 🎯 Game Modes

### Risk Levels

-   **Lightning Mode**: High risk, high reward (0.5x - 190x multipliers)
-   **Low Mode**: Conservative risk profile
-   **Medium Mode**: Balanced risk/reward
-   **High Mode**: Aggressive risk profile

### Betting Features

-   **Manual Betting**: Direct control over each bet
-   **Auto-Betting**: Automated betting with custom strategies
-   **Win/Loss Conditions**: Automatic adjustments based on outcomes
-   **Stop Limits**: Balance protection with configurable limits

## 🛠️ Technology Stack

-   **Frontend**: Next.js 14, React 18, TypeScript
-   **Physics**: Matter.js for realistic ball physics
-   **Styling**: CSS Modules with responsive design
-   **State**: Custom hooks with Context API
-   **Testing**: Jest with React Testing Library
-   **Build**: Optimized production builds with code splitting

## 📚 Documentation

### 📖 Component Documentation

-   **[README_BET_AMOUNT_INPUT.md](./README_BET_AMOUNT_INPUT.md)** - Bet amount input component guide
-   **[LOGGING_README.md](./LOGGING_README.md)** - Logging system documentation

## 🎮 How to Play

1. **Choose Game Mode**: Select risk level (Lightning/Low/Medium/High)
2. **Set Bet Amount**: Enter your bet using the input controls
3. **Configure Rows**: Choose 8-16 rows for different payout structures
4. **Place Bet**: Click to drop the ball and watch the physics simulation
5. **Collect Winnings**: Multipliers determine your payout

### Auto-Betting Strategy

1. Set number of auto-bets
2. Configure win/loss percentage adjustments
3. Set stop limits for protection
4. Start automated betting sequence

## 🧪 Development

### Available Scripts

```bash
yarn dev          # Start development server
yarn build        # Create production build
yarn start        # Start production server
yarn test         # Run test suite
yarn lint         # Check code quality
```

### Code Quality

-   **TypeScript**: Strict type checking enabled
-   **ESLint**: Airbnb configuration with custom rules
-   **Prettier**: Automated code formatting
-   **Husky**: Pre-commit quality checks

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

-   Follow the established architecture patterns
-   Add tests for new features
-   Update documentation as needed
-   Ensure code passes all quality checks

## 📊 Performance

-   **60 FPS Physics**: Optimized Matter.js simulation
-   **Code Splitting**: Feature-based bundle optimization
-   **Lazy Loading**: Components loaded on demand
-   **Memory Efficient**: Proper cleanup and garbage collection

## 🔒 Security

-   **Input Validation**: Comprehensive client-side validation
-   **Type Safety**: Full TypeScript coverage
-   **XSS Protection**: Sanitized user inputs
-   **Rate Limiting**: API request throttling

## 📄 License

This project is proprietary software. All rights reserved.

## 🎯 Roadmap

### Current State ✅

-   Core game mechanics and physics with Matter.js
-   Manual and auto-betting systems
-   Responsive UI design
-   Modular component architecture
-   Canvas-based physics rendering

### Phase 2 🚧 (Next)

-   Advanced betting strategies
-   Multiplayer tournaments
-   Enhanced visual effects
-   Performance optimizations

### Phase 3 📋 (Future)

-   Mobile native apps
-   Advanced analytics
-   Social features
-   Custom game modes

---

**Built with ❤️ using modern web technologies**

For detailed technical information, see our [Architecture Guide](./ARCHITECTURE.md) and [Component Library](./COMPONENTS.md).
