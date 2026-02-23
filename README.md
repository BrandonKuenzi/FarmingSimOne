# FarmingSimOne

Browser-based farming sim built with React + TypeScript + Vite.

## Commands

- `npm install`
- `npm run dev`
- `npm run build`

## Project Layout

- `src/App.tsx`: main game loop + UI composition.
- `src/game/config/gameplay.ts`: gameplay constants, initial economy state, wardrobe/shop config, blocker generation.
- `src/game/config/visuals.ts`: tile glyph mapping + ground class rules.
- `src/game/content/*`: dialog/content catalogs.
- `src/game/systems/*`: game rules (tools, weeds, weather, commerce, movement, etc.).
- `src/game/world/*`: map layouts, generation, doors/navigation, NPC anchors.
- `src/game/state/actions.ts`: state action helpers for economy/inventory updates.
- `src/game/shared/*`: cross-cutting types and utility helpers.

## Save/Load Readiness

The codebase now includes domain-oriented save types in `src/game/shared/types.ts`:

- `SaveGameData`
- `PlayerState`
- `WorldState`
- `DungeonState`
- `ProgressionState`

These are intended to become the serialization contract for future save/load.
