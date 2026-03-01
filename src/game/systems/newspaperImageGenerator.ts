import { GLYPH } from "../config/glyphs";

const WORD_TO_EMOJI: Array<{ words: string[]; emojis: string[] }> = [
	{ words: ["seed", "seeds"], emojis: [GLYPH.seedling] },
	{ words: ["turnip"], emojis: [GLYPH.turnip] },
	{ words: ["carrot"], emojis: [GLYPH.carrot] },
	{ words: ["pumpkin"], emojis: [GLYPH.pumpkin] },
	{ words: ["corn"], emojis: [GLYPH.corn] },
	{ words: ["feed", "barn"], emojis: [GLYPH.basket] },
	{ words: ["milk"], emojis: [GLYPH.milk] },
	{ words: ["wool"], emojis: [GLYPH.yarn] },
	{ words: ["egg", "omelet"], emojis: [GLYPH.egg] },
	{ words: ["fish", "fishing", "sushi"], emojis: [GLYPH.fish, GLYPH.fishingPole] },
	{ words: ["iron", "blacksmith", "forge"], emojis: [GLYPH.rock, GLYPH.toolbox] },
	{ words: ["shell", "beach", "tourist"], emojis: [GLYPH.shell, GLYPH.palm] },
	{ words: ["diamond", "gem", "jewel"], emojis: [GLYPH.diamond] },
	{ words: ["emerald"], emojis: [GLYPH.greenCircle] },
	{ words: ["ruby"], emojis: [GLYPH.redCircle] },
	{ words: ["coral", "fruit"], emojis: [GLYPH.coral, GLYPH.pumpkin] },
	{ words: ["cow", "chicken"], emojis: [GLYPH.cow, GLYPH.chicken] },
];

const FALLBACK_EMOJIS = [
	GLYPH.newspaper,
	GLYPH.seedling,
	GLYPH.cow,
	GLYPH.fish,
	GLYPH.diamond,
] as const;

const GRID_SIZE = 9;

const randInt = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const tokenize = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter(Boolean);

const pickFromPool = (pool: string[], count: number): string[] => {
	const out: string[] = [];
	for (let i = 0; i < count; i += 1) {
		const pick = pool[randInt(0, pool.length - 1)];
		if (pick) out.push(pick);
	}
	return out;
};

const placeInGrid = (emojis: string[]): string[] => {
	const grid = Array.from({ length: GRID_SIZE }, () => "");
	const freeIndexes = Array.from({ length: GRID_SIZE }, (_, idx) => idx);
	emojis.forEach((emoji) => {
		if (freeIndexes.length <= 0) return;
		const freeIdx = randInt(0, freeIndexes.length - 1);
		const index = freeIndexes.splice(freeIdx, 1)[0];
		if (index === undefined) return;
		grid[index] = emoji;
	});
	return grid;
};

export const generateNewspaperEmojiPicture = (newspaperText: string): string[] => {
	const tokens = tokenize(newspaperText);
	const candidatePool: string[] = [];

	WORD_TO_EMOJI.forEach((entry) => {
		const matchesWord = entry.words.some((word) =>
			tokens.some((token) => token === word || token.startsWith(word)),
		);
		if (!matchesWord) return;
		entry.emojis.forEach((emoji) => {
			candidatePool.push(emoji);
			candidatePool.push(emoji);
		});
	});

	const pool = candidatePool.length > 0 ? candidatePool : [...FALLBACK_EMOJIS];
	const emojiCount = randInt(2, 4);
	const chosen = pickFromPool(pool, emojiCount);
	return placeInGrid(chosen);
};
