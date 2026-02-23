# Architecture

## Runtime Flow

1. Input (`keydown`) drives intent (`movePlayer`, `interact`, modal actions).
2. Intent updates state (`set*` hooks and `src/game/state/actions.ts` helpers).
3. Rendering maps + overlays derives from current state.
4. Timers (`useEffect`) drive ambient loops, NPC movement, and day transitions.

## Module Responsibilities

- `src/game/config/gameplay.ts`
  - Shared gameplay config.
  - Economy seeds (`initialPrices`, `initialPriceTrends`).
  - Utility rules (`getHoeTargets`, barn bounds).
  - Deterministic starter state builders (`makeEmptyInventory`).
- `src/game/config/visuals.ts`
  - Visual tile mapping.
  - Ground blending logic.
- `src/game/systems/movement.ts`
  - Pure wandering movement resolution for NPCs/boats/animals.
- `src/game/systems/commerce.ts`
  - Trade stock generation.
  - Sell/base market pricing policy (`getMarketSellPrice`, `getMarketBasePrice`).
- `src/game/state/actions.ts`
  - Action-style helpers to keep state mutation rules centralized.

## Save/Load Plan (Next Step)

Use `SaveGameData` from `src/game/shared/types.ts` as the save schema.

1. Add `serializeGameState(appState): SaveGameData`.
2. Add `hydrateGameState(save: SaveGameData)` for startup restoration.
3. Keep volatile runtime-only fields out of save files (timers, refs, audio handles, open modal).
4. Version saves with `save.version` and migrate forward when schema changes.
