import type { GameState } from "./gameState";
import { assignUniqueNpcInterests } from "../content/npcDialog";
import { makeEmptyProgressAlgorithmCounts } from "../progression/progressStonesAlgorithmic";
import { makeEmptyProgressTargetCounts } from "../progression/progressStonesTarget";
import { makeEmptyProgressLoadoutRows } from "../progression/progressMonitor";
import { makeEmptyStatisticsState } from "../statistics/statistics";
import { randomRoll } from "../shared/random";
import { assignTownNpcGlyphs, defaultTownNpcNames } from "../world/npcs";

export const SAVE_GAME_VERSION = 2;

const formatNewGameDate = (date: Date): string => {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${pad(date.getFullYear() % 100)}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
};

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
	const state = save.gameState as Partial<GameState>;
	const migratedTownNpcNames = {
		...defaultTownNpcNames,
		...(state.townNpcNames ?? {}),
	};
	const migrated = {
		...state,
		playerName: state.playerName?.trim() || "Player",
		newGameDate:
			typeof state.newGameDate === "string" && /^\d{6}$/.test(state.newGameDate)
				? state.newGameDate
				: formatNewGameDate(new Date()),
		townNpcNames: migratedTownNpcNames,
		townNpcInterests:
			state.townNpcInterests ??
			assignUniqueNpcInterests(
				Object.keys(migratedTownNpcNames),
				randomRoll,
			),
		townNpcGlyphs:
			state.townNpcGlyphs ??
			assignTownNpcGlyphs(Object.keys(migratedTownNpcNames), randomRoll),
		npcGiftLetter: state.npcGiftLetter ?? null,
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
		townTourSeen: state.townTourSeen ?? false,
		highestForestLevelReached: Math.max(1, state.highestForestLevelReached ?? state.forestLevel ?? 1),
		highestCaveLevelReached: Math.max(1, state.highestCaveLevelReached ?? state.caveLevel ?? 1),
		statistics: state.statistics ?? makeEmptyStatisticsState(),
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
