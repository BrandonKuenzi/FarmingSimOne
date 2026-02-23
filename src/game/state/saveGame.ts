import type { GameState } from "./gameState";

export const SAVE_GAME_VERSION = 1;

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
	return save.gameState;
};

export const serializeSaveGame = (save: SaveGameData): string => {
	return JSON.stringify(save);
};

export const parseSaveGame = (json: string): SaveGameData | null => {
	try {
		const parsed = JSON.parse(json) as Partial<SaveGameData> | null;
		if (!parsed || typeof parsed !== "object") return null;
		if (parsed.version !== SAVE_GAME_VERSION) return null;
		if (!parsed.gameState || typeof parsed.gameState !== "object") {
			return null;
		}
		return parsed as SaveGameData;
	} catch {
		return null;
	}
};
