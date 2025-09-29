<!-- @format -->

# Visual Comparison: Mockup vs Current Implementation

## Key Visual Elements Comparison

### 1. Background System

#### Mockup (Plinko-9 rows (2))

```css
.bg-game-plinko {
  width: 591px;
  height: 441.92px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-40.52%, 0);
  z-index: 1;
  overflow: hidden;
}

.polygon {
  background: url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-24/ySSad3UCBr.png)
}

.light-bg-pc-caad {
  background: url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-24/1VRU0yow1y.png)
  opacity: 0.5;
}

.group {
  background: url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-24/N9tzHzCu0z.png)
}
```

#### Current Implementation (Plinko-9 rows (1))

```scss
.bg-game-plinko {
  position: absolute;
  width: 591px;
  height: 441.92px;
  top: 0;
  left: 50%;
  transform: translate(-40.52%, 0);
  z-index: 1;
  overflow: hidden;
}

.polygon {
  background: url(/static/images/plinko/ySSad3UCBr.svg) no-repeat center;
  background-size: cover;
}

.light-bg-pc-caad {
  background: url(/static/images/plinko/1VRU0yow1y.svg) no-repeat center;
  background-size: cover;
  opacity: 0.5;
}

.group {
  background: url(/static/images/plinko/N9tzHzCu0z.svg) no-repeat center;
  background-size: cover;
}
```

### 2. Ball Layout System

#### Mockup Ball Classes (First Row Example)

```css
.row {
  /* Row container styles */
}

.ball-size {
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 0;
  background: url(...) no-repeat center;
  background-size: cover;
  transform: translate(0, -50%);
  z-index: 35;
}

.ball-size-13 {
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 20px;
  background: url(...) no-repeat center;
  background-size: cover;
  transform: translate(0, -50%);
  z-index: 35;
}

.ball-size-15 {
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 40px;
  background: url(...) no-repeat center;
  background-size: cover;
  transform: translate(0, -50%);
  z-index: 35;
}
```

#### Current Ball Classes (Generic System)

```scss
.ball-type {
  position: absolute;
  width: 100%;
  height: 16px;
  top: 50%;
  left: 0;
  background: url(/static/images/plinko/WD7Dfw1Xq2.svg) no-repeat center;
  background-size: cover;
  transform: translate(0, -50%);
  z-index: 35;
}

.ball-type-orange {
  position: absolute;
  width: 100%;
  height: 16px;
  top: 50%;
  left: 0;
  background: url(/static/images/plinko/nhUHx3HHyi.svg) no-repeat center;
  background-size: cover;
  transform: translate(0, -50%);
  z-index: 35;
}

.ball-type-gray {
  position: absolute;
  width: 100%;
  height: 16px;
  top: 50%;
  left: 0;
  background: url(/static/images/plinko/WD7Dfw1Xq2.svg) no-repeat center;
  background-size: cover;
  transform: translate(0, -50%);
  z-index: 35;
  filter: grayscale(100%) brightness(0.8);
}
```

### 3. Layout Structure Comparison

#### Mockup Layout (Single File)

```jsx
<div className='main-container'>
  <div className='game-info'>
    <div className='bg-game-plinko'>
      <div className='polygon' />
      <div className='light-bg-pc-caad' />
      <div className='group' />
      <div className='bg' />
      <div className='frame' />
      <div className='bottom' />
      <div className='light-ray' />
      <div className='bottom-1' />
    </div>
    <div className='frame-game'>
      <div className='frame-2'>
        <div className='multifiler'>{/* 9 multiplier values */}</div>
        <div className='ball-layout'>
          {/* 9 rows of balls with specific positioning */}
        </div>
        <div className='value'>{/* 10 value display elements */}</div>
      </div>
      <div className='mess-win'>
        <div className='score'>
          <span className='span-player-win'>WIN 106</span>
        </div>
      </div>
    </div>
    {/* Additional UI sections */}
  </div>
  <div className='pic-28' />
</div>
```

#### Current Layout (Modular Components)

```jsx
<div className='main-container'>
  <div className='game-info'>
    <GameBackground />
    <div className='frame-game'>
      <div className='frame-2'>
        <MultiplierDisplay multipliers={multipliers} />
        <div className='ball-layout'>
          <BallLayout rows={9} ballsPerRow={ballsPerRow} />
          <ValueDisplay values={values} />
        </div>
      </div>
      <WinMessage winAmount={gameState.currentWin} />
    </div>
    <div className='button-bet'>
      <span className='span-bet'>START AUTO BET</span>
    </div>
    <BetControls
      betAmount={gameState.betAmount}
      gameMode={gameState.gameMode}
      // ... other props
    />
    <GameTabs
      activeTab={gameState.activeTab}
      onTabChange={(tab) => updateGameState({ activeTab: tab })}
      soundEnabled={gameState.soundEnabled}
      onSoundToggle={() =>
        updateGameState({ soundEnabled: !gameState.soundEnabled })
      }
    />
    <GameInfo gameName='Plinko' rtp='97%' />
    <BetsTable
      bets={gameState.bets}
      activeTab={gameState.betsTab}
      onTabChange={(tab) => updateGameState({ betsTab: tab })}
    />
  </div>
  <div className='pic-28' />
</div>
```

### 4. Bet Controls Layout Comparison

#### Mockup Bet Controls

```
┌─────────────────────────────────────────────────────────────┐
│ Bet Amount: [10000] [1/2] [2x] [Max]                         │
├─────────────────────────────────────────────────────────────┤
│ Game Mode: [Lightning] [Low] [Medium] [High]                 │
├─────────────────────────────────────────────────────────────┤
│ Rows: [9] [Slider]                                           │
├─────────────────────────────────────────────────────────────┤
│ Number of Bets: [20000] [∞] [10] [100]                       │
├─────────────────────────────────────────────────────────────┤
│ On Win: [Reset] [Increase by] [0] [%]                        │
├─────────────────────────────────────────────────────────────┤
│ On Loss: [Reset] [Increase by] [0] [%]                       │
├─────────────────────────────────────────────────────────────┤
│ Stop On Win: [0]                                             │
├─────────────────────────────────────────────────────────────┤
│ Stop On Loss: [0]                                            │
└─────────────────────────────────────────────────────────────┘
```

#### Current Bet Controls (Component-based)

```
BetAmountControls: [Amount Input] [Quick Bet Buttons]
GameModeSelector: [Mode Buttons]
RowsSelector: [Rows Input] [Slider]
NumberOfBetsSelector: [Bets Input] [Preset Buttons]
OnWinControls: [Action Dropdown] [Percentage Input]
OnLossControls: [Action Dropdown] [Percentage Input]
StopOnWinControls: [Amount Input]
StopOnLossControls: [Amount Input]
```

### 5. Tab Navigation Comparison

#### Mockup Tab System

```jsx
<div className="tab-ui">
  <div className="tab-ui-mobile">
    <div className="auto">Manual</div>
    <div className="manual">Auto</div>
  </div>
  <div className="icons">
    <div className="frame-e2">Nova88 Original</div>
    <div className="sound-icon">[Sound Toggle]</div>
    <div className="help-icon">[Help]</div>
    <div className="security-icon">[Security]</div>
  </div>
</div>

<div className="my-bets">
  <div className="frame-f0">
    <div className="tab-ui-mobile-f1">All Bets</div>
    <div className="tab-ui-mobile-f2">My Bets</div>
    <div className="tab-ui-mobile-f3">High Roller</div>
  </div>
</div>
```

#### Current Tab System

```jsx
<GameTabs
  activeTab={gameState.activeTab}  // 'Manual' | 'Auto'
  onTabChange={handleTabChange}
  soundEnabled={gameState.soundEnabled}
  onSoundToggle={handleSoundToggle}
/>

<BetsTable
  bets={gameState.bets}
  activeTab={gameState.betsTab}  // 'All' | 'My' | 'HighRoller'
  onTabChange={handleBetsTabChange}
/>
```

## Migration Requirements

### High Priority Changes

1. **Background Layer Implementation**: Add missing background layers from mockup
2. **Ball Positioning Precision**: Map exact ball positions from mockup
3. **Bet Controls Layout**: Restructure to match mockup grid layout
4. **Image Asset Integration**: Ensure all decorative images are loaded

### Medium Priority Changes

1. **Visual Effects**: Add blur overlays and lighting effects
2. **Animation System**: Implement win message animations
3. **Responsive Adjustments**: Fine-tune spacing and positioning

### Low Priority Changes

1. **Performance Optimizations**: Bundle size and loading optimizations
2. **Advanced Interactions**: Enhanced hover states and micro-interactions

## Success Criteria

### Visual Fidelity (100% Match Required)

- [ ] All background layers positioned correctly
- [ ] Ball layout matches pixel-perfect positioning
- [ ] Bet controls arranged in mockup grid layout
- [ ] All decorative elements present and positioned
- [ ] Color scheme matches exactly
- [ ] Typography and spacing consistent

### Functional Parity (100% Required)

- [ ] All interactive elements work correctly
- [ ] State management preserves all functionality
- [ ] Form inputs and controls fully operational
- [ ] Tab navigation switches correctly
- [ ] Bet calculation and display accurate

### Performance Standards (Target Metrics)

- [ ] First Contentful Paint: < 2.0s
- [ ] Bundle Size: < 500KB (gzipped)
- [ ] Lighthouse Score: > 90
- [ ] No layout shifts during interactions
- [ ] Smooth 60fps animations
