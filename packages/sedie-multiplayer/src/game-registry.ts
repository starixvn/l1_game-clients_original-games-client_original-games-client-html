// Import game configuration first
import "./game-config";

// Import shared game registry template
import { registerCurrentGame } from "@shared/game-registry/game-registry-template";

// Register the SeDie game
registerCurrentGame(() => import("./page"));