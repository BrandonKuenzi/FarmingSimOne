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
		left: Math.random() * 96 + 2,
		top: Math.random() * 72 + 6,
		size: 16 + Math.floor(Math.random() * 16),
		delay: Math.random(),
		duration: 4 + Math.random() * 16,
		glyph: dayTransitionStarGlyphs[
			Math.floor(Math.random() * dayTransitionStarGlyphs.length)
		]!,
	}));
