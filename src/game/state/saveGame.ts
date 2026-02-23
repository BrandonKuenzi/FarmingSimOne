import type { SaveGameData } from "../shared/types";

export const SAVE_GAME_VERSION = 1;

export const serializeSaveGame = (save: SaveGameData): string => {
	return JSON.stringify(save);
};

export const parseSaveGame = (json: string): SaveGameData | null => {
	try {
		const parsed = JSON.parse(json) as Partial<SaveGameData> | null;
		if (!parsed || typeof parsed !== "object") return null;
		if (parsed.version !== SAVE_GAME_VERSION) return null;
		if (!parsed.player || !parsed.world || !parsed.dungeons || !parsed.progression) {
			return null;
		}
		return parsed as SaveGameData;
	} catch {
		return null;
	}
};
