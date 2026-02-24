import type { WeatherId } from "../shared/types";
import { randomInt } from "../shared/random";
import { GLYPH } from "../config/glyphs";

export const weatherOptions: WeatherId[] = ["sunny", "windy", "rainy"];

export const randomWeather = (): WeatherId =>
	weatherOptions[randomInt(0, weatherOptions.length - 1)]!;

export const weatherEmojiById: Record<WeatherId, string> = {
	sunny: GLYPH.sunFace,
	windy: GLYPH.windBlows,
	rainy: GLYPH.umbrellaRain,
};
