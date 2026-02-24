import { TOWN_OCEAN_START_Y, TOWN_WIDTH } from "./layout";
import type { PetEmoji } from "../shared/types";
import { GLYPH } from "../config/glyphs";

export const townNpcNames: Record<string, string> = {
	neighbor_1: "Nora",
	neighbor_2: "Milo",
	neighbor_3: "Rhea",
	neighbor_4: "Gus",
};

export const townNpcAnchors: Record<string, { x: number; y: number }> = {
	neighbor_1: { x: 10, y: 10 },
	neighbor_2: { x: 20, y: 10 },
	neighbor_3: { x: 34, y: 10 },
	neighbor_4: { x: 46, y: 10 },
};
export const TOWN_NPC_GRASS_ROW_Y = 10;

export const SKETCHY_MERCHANT_POS = { x: TOWN_WIDTH - 3, y: 1 };
export const SKETCHY_CRATE_POS = {
	x: SKETCHY_MERCHANT_POS.x + 1,
	y: SKETCHY_MERCHANT_POS.y,
};
export const TRADER_POS = { x: 2, y: 7 };
export const TRADER_BOX_POS = { x: TRADER_POS.x + 1, y: TRADER_POS.y };
export const TRADER_HELI_POS = { x: TRADER_BOX_POS.x, y: TRADER_BOX_POS.y - 1 };
export const PET_VENDOR_POS = { x: 25, y: 7 };
export const DOCTOR_POS = { x: 30, y: 7 };
export const petOptions: PetEmoji[] = [GLYPH.cat, GLYPH.blackCat, GLYPH.dog, GLYPH.poodle];

export const boatNpcEmojis = {
	boat_1: GLYPH.sailboat,
	boat_2: GLYPH.canoe,
	boat_3: GLYPH.speedboat,
	boat_4: GLYPH.motorboat,
	boat_5: GLYPH.rowboatWoman,
} as const;

export const initialBoatTiles: Record<keyof typeof boatNpcEmojis, { x: number; y: number }> = {
	boat_1: { x: 10, y: TOWN_OCEAN_START_Y + 2 },
	boat_2: { x: 18, y: TOWN_OCEAN_START_Y + 4 },
	boat_3: { x: 30, y: TOWN_OCEAN_START_Y + 3 },
	boat_4: { x: 40, y: TOWN_OCEAN_START_Y + 5 },
	boat_5: { x: 48, y: TOWN_OCEAN_START_Y + 2 },
};

export const npcMoveDirections: Record<number, { dx: number; dy: number }> = {
	1: { dx: -1, dy: -1 },
	2: { dx: 0, dy: -1 },
	3: { dx: 1, dy: -1 },
	4: { dx: -1, dy: 0 },
	5: { dx: 1, dy: 0 },
	6: { dx: -1, dy: 1 },
	7: { dx: 0, dy: 1 },
	8: { dx: 1, dy: 1 },
};
