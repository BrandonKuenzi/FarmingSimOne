import type { GameState } from "./gameState";
import { makeEmptyProgressAlgorithmCounts } from "../progression/progressStonesAlgorithmic";
import { makeEmptyProgressTargetCounts } from "../progression/progressStonesTarget";
import { makeEmptyProgressLoadoutRows } from "../progression/progressMonitor";

export const SAVE_GAME_VERSION = 2;

export type SaveGameData = {
	version: number;
	gameState: GameState;
};

export const toSaveGameData = (gameState: GameState): SaveGameData => {
	return {
		version: SAVE_GAME_VERSION,
		gameState,
	};
};

export const fromSaveGameData = (save: SaveGameData): GameState => {
	if (save.version === SAVE_GAME_VERSION) return save.gameState;
	const state = save.gameState as Partial<GameState>;
	const migrated = {
		...state,
		progressPercent: Math.max(0, Math.min(1000, state.progressPercent ?? 0)),
		progressWon: state.progressWon ?? false,
		progressWinPopupShown: state.progressWinPopupShown ?? false,
		progressStoneTargetCounts: {
			...makeEmptyProgressTargetCounts(),
			...(state.progressStoneTargetCounts ?? {}),
		},
		progressStoneAlgorithmCounts: {
			...makeEmptyProgressAlgorithmCounts(),
			...(state.progressStoneAlgorithmCounts ?? {}),
		},
		progressLoadoutRows: state.progressLoadoutRows ?? makeEmptyProgressLoadoutRows(),
		highestForestLevelReached: Math.max(1, state.highestForestLevelReached ?? state.forestLevel ?? 1),
		highestCaveLevelReached: Math.max(1, state.highestCaveLevelReached ?? state.caveLevel ?? 1),
	};
	return migrated as GameState;
};

export const serializeSaveGame = (save: SaveGameData): string => {
	return JSON.stringify(save);
};

export const parseSaveGame = (json: string): SaveGameData | null => {
	try {
		const parsed = JSON.parse(json) as Partial<SaveGameData> | null;
		if (!parsed || typeof parsed !== "object") return null;
		if (parsed.version !== 1 && parsed.version !== SAVE_GAME_VERSION) return null;
		if (!parsed.gameState || typeof parsed.gameState !== "object") {
			return null;
		}
		return {
			version:
				parsed.version === SAVE_GAME_VERSION ? SAVE_GAME_VERSION : parsed.version,
			gameState: parsed.gameState as GameState,
		};
	} catch {
		return null;
	}
};
