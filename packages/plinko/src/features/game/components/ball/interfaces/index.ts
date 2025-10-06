/**
 * Ball Game Interfaces
 * Defines contracts and abstractions for dependency injection and testing
 * Follows Dependency Inversion Principle - depend on abstractions, not concretions
 */

// Physics System Interfaces
export interface IPhysicsEngine {
    initialize(config: PhysicsConfig): Promise<PhysicsState>;
    updateCollisions(engine: any, options: CollisionOptions): void;
    cleanup(engine: any): void;
}

export interface IBodyFactory {
    createBodies(config: BodyCreationConfig): PhysicsBodies;
    createWalls(dimensions: Dimensions): any[];
}

export interface ICollisionHandler {
    handleCollision(ballBody: any, obstacleBody: any, engine: any, options: CollisionOptions): void;
    processWin(ballExtension: any, finalSlot: number, multiplier: number, betValue: number, onWin: (multiplier: number, betValue: number) => void): void;
}

// Rendering System Interfaces
export interface IRenderer {
    render(context: CanvasRenderingContext2D, gameState: RenderState): void;
    calculateLayout(config: LayoutConfig): LayoutData;
}

export interface IDrawingUtils {
    drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, options?: DrawOptions): void;
    drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, options?: TextOptions): void;
    createGradient(ctx: CanvasRenderingContext2D, colors: string[]): CanvasGradient;
}

// Component Interfaces
export interface IBallSpawner {
    spawnBall(betValue?: number): void;
    spawnBallWithPath(betValue: number, path: number[], finalSlot: number, multiplier: number): void;
}

export interface IEventHandler {
    handleMouseMove(event: MouseEvent, containerRect: DOMRect): SlotHoverInfo | null;
    handleMouseLeave(): void;
}

export interface IHoverManager {
    updateHover(slotIndex: number, event: MouseEvent): void;
    getHoverData(): HoverData | null;
}

// Data Transfer Objects
export interface PhysicsConfig {
    rows: number;
    multipliers: number[];
    gameMode: number;
    canvasWidth: number;
    canvasHeight: number;
    gravity: number;
}

export interface PhysicsState {
    engine: any;
    bodies: any[];
    isReady: boolean;
}

export interface BodyCreationConfig {
    rows: number;
    multipliers: number[];
    gameMode: number;
    dimensions: Dimensions;
}

export interface PhysicsBodies {
    pins: any[];
    slots: any[];
    walls: any[];
}

export interface CollisionOptions {
    onBallHit?: (multiplier: number, betValue: number) => void;
    removedBalls: Set<number>;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface LayoutConfig {
    rows: number;
    canvasWidth: number;
    canvasHeight: number;
}

export interface LayoutData {
    scaleFactor: number;
    pegRadius: number;
    pegGap: number;
    lastRowY: number;
    slotWidth: number;
    numberOfSlots: number;
}

export interface RenderState {
    balls: any[];
    pins: any[];
    slots: SlotRenderData[];
    dimensions: Dimensions;
}

export interface SlotRenderData {
    x: number;
    y: number;
    width: number;
    height: number;
    multiplier: number;
    color: string;
}

export interface DrawOptions {
    fillColor?: string;
    strokeColor?: string;
    lineWidth?: number;
}

export interface TextOptions {
    font?: string;
    fillStyle?: string;
    align?: CanvasTextAlign;
}

export interface SlotHoverInfo {
    slotIndex: number;
    multiplier: number;
    probability: number;
    position: { x: number; y: number };
}

export interface HoverData {
    multiplier: number;
    winAmount: number;
    probability: number;
    x: number;
    y: number;
}

// Service Interfaces for External Dependencies
export interface ILogger {
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
}

export interface IGameStore {
    getState(): GameState;
    subscribe(listener: (state: GameState) => void): () => void;
}

export interface GameState {
    numberOfRows: number;
    betAmount: number;
    gameMode: number;
    multipliers: number[];
    probabilities: number[];
}

// Canvas and DOM Interfaces
export interface ICanvasManager {
    getContainer(): HTMLElement | null;
    getCanvas(): HTMLCanvasElement | null;
    getContext(): CanvasRenderingContext2D | null;
    resize(): void;
}

export interface IDOMUtils {
    getBoundingRect(element: HTMLElement): DOMRect;
    addEventListener(element: HTMLElement, event: string, handler: EventListener): void;
    removeEventListener(element: HTMLElement, event: string, handler: EventListener): void;
}
