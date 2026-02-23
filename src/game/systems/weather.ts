import type { WeatherId } from "../shared/types";
import { randomInt } from "../shared/random";

export const weatherOptions: WeatherId[] = ["sunny", "windy", "rainy"];

export const randomWeather = (): WeatherId =>
	weatherOptions[randomInt(0, weatherOptions.length - 1)]!;

export const weatherEmojiById: Record<WeatherId, string> = {
	sunny: "🌞", // sunny
	windy: "🍃", // windy
	rainy: "☔", // rainy
};
