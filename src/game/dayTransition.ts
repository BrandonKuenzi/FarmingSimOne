import { randomRoll } from "./shared/random";

export const moonPhases = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"] as const;
const dayTransitionStarGlyphs = ["⭐", "✨", "🌟"] as const;

export const nextDayPrompts = [
	"Onward!",
	"Let's do this!",
	"I'm ready to wake up now.",
	"Back to work!",
	"New day, new goals.",
	"Rise and grind.",
	"Let's get moving.",
	"Another day begins.",
	"Time to farm!",
	"Let's make progress.",
	"No time to snooze.",
	"Morning mode on.",
	"Let's roll!",
	"Fresh start, go!",
	"Back in action!",
	"Bring it on.",
	"Ready when you are.",
	"Let's chase profits.",
	"Wake up, farmer.",
	"To the fields!",
	"Let's run it back.",
	"Game on.",
	"Here we go again.",
	"I'm up. Let's go.",
] as const;

export type DayTransitionStar = {
	id: number;
	left: number;
	top: number;
	size: number;
	delay: number;
	duration: number;
	glyph: (typeof dayTransitionStarGlyphs)[number];
};

export const createDayTransitionStars = (count = 22): DayTransitionStar[] =>
	Array.from({ length: count }, (_, i) => ({
		id: i,
		left: randomRoll() * 96 + 2,
		top: randomRoll() * 72 + 6,
		size: 16 + Math.floor(randomRoll() * 16),
		delay: randomRoll(),
		duration: 4 + randomRoll() * 16,
		glyph: dayTransitionStarGlyphs[
			Math.floor(randomRoll() * dayTransitionStarGlyphs.length)
		]!,
	}));
