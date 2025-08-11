# SeDie Multiplayer Game

## Overview

SeDie is a multiplayer dice-based betting game where players can bet on various outcomes based on dice rolls. The game features real-time multiplayer functionality with comprehensive betting options and visual feedback.

## Game Rules

### Betting Options

#### Main Options

-   **ODD**: Bet on the sum of dice being odd
-   **EVEN**: Bet on the sum of dice being even

#### Sub Options

-   **RED2**: Bet on specific red dice combinations
-   **RED3**: Bet on specific red dice combinations
-   **RED4**: Bet on specific red dice combinations
-   **WHITE3**: Bet on specific white dice combinations
-   **WHITE4**: Bet on specific white dice combinations

### Game Flow

1. **Betting Phase**: Players place bets on their chosen options
2. **Locking Phase**: Betting is closed, no more bets accepted
3. **Result Phase**: Dice are rolled and results displayed
4. **Settlement Phase**: Winners are determined and payouts calculated

## Components

### Core Components

-   **SeDieMultiPlayer**: Main game class extending GameBase
-   **SeDieBettingBlock**: Betting interface container
-   **SeDieBetOptionsComponent**: Individual betting options with visual feedback
-   **SeDieResultBlock**: Game results display with statistics
-   **SeDieWinningAnimation**: Winning animations and effects
-   **SeDieGameRoundDataHandler**: Game data processing and validation

### Features

-   **Real-time Multiplayer**: Live betting and result updates
-   **Visual Feedback**: Hover effects, animations, and state indicators
-   **Statistics**: Comprehensive game statistics and history
-   **Responsive Design**: Mobile-friendly interface
-   **Accessibility**: Clear visual indicators and feedback

## Technical Implementation

### Architecture

-   **Event-driven**: Uses event consumers and publishers for real-time updates
-   **State Management**: Centralized game state with React contexts
-   **Dependency Injection**: Awilix container for managing dependencies
-   **Modular Design**: Separated concerns for maintainability

### Key Technologies

-   **React**: Component-based UI framework
-   **TypeScript**: Type-safe development
-   **SCSS**: Advanced CSS preprocessing
-   **Socket.io**: Real-time communication
-   **MongoDB**: Data persistence

### Styling

-   **Modern UI**: Gradient backgrounds, shadows, and animations
-   **Responsive**: Mobile-first design approach
-   **Theming**: Consistent color scheme and visual hierarchy
-   **Animations**: Smooth transitions and hover effects

## Configuration

### Game Settings

-   Betting limits and validation
-   Round timing and phases
-   Animation durations and effects
-   Localization support

### Environment Variables

-   API endpoints
-   Database connections
-   Socket configurations
-   Feature flags

## Development

### Setup

1. Install dependencies: `npm install`
2. Configure environment variables
3. Start development server: `npm run dev`

### Testing

-   Unit tests for game logic
-   Integration tests for components
-   E2E tests for game flow

### Building

-   Production build: `npm run build`
-   Docker containerization support
-   Environment-specific configurations

## Deployment

### Requirements

-   Node.js 16+
-   MongoDB 4.4+
-   Redis (for session management)
-   WebSocket support

### Deployment Options

-   **Docker**: Containerized deployment
-   **Kubernetes**: Scalable orchestration
-   **Cloud Platforms**: AWS, GCP, Azure support
-   **On-premise**: Traditional server deployment

## Monitoring

### Metrics

-   Game performance indicators
-   User engagement statistics
-   Error rates and debugging
-   Real-time game analytics

### Logging

-   Structured logging with sc-common
-   Error tracking and reporting
-   Performance monitoring
-   Audit trails for compliance

## Future Enhancements

### Planned Features

-   Advanced betting strategies
-   Tournament modes
-   Social features and leaderboards
-   AI-powered game analysis
-   Mobile app development

### Technical Improvements

-   Performance optimization
-   Enhanced security measures
-   Better error handling
-   Improved accessibility
-   Internationalization support

## Contributing

### Guidelines

-   Follow established coding standards
-   Write comprehensive tests
-   Update documentation
-   Review and test changes
-   Follow the project's architecture patterns

### Code Style

-   4-space indentation
-   140 character line limit
-   ES6+ features
-   TypeScript strict mode
-   Consistent naming conventions

## License

This project is proprietary software. All rights reserved.
