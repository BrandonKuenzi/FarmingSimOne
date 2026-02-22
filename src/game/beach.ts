export type XY = { x: number; y: number };
type RandomIntFn = (min: number, max: number) => number;
type KeyForPosFn = (x: number, y: number) => string;

export const collectBeachTiles = (row: string, y: number): XY[] => {
	const out: XY[] = [];
	for (let x = 0; x < row.length; x += 1) {
		if (row[x] === ":") out.push({ x, y });
	}
	return out;
};

export const rollBeachBottleSpawn = (
	tiles: XY[],
	randomInt: RandomIntFn,
): XY | null => {
	if (Math.random() >= 0.2) return null;
	if (tiles.length < 1) return null;
	return tiles[randomInt(0, tiles.length - 1)]!;
};

export const rollBeachShellDrops = (
	tiles: XY[],
	keyForPos: KeyForPosFn,
	randomInt: RandomIntFn,
	blockedKeys = new Set<string>(),
) => {
	const count = randomInt(0, 3);
	const available = tiles.filter((pos) => !blockedKeys.has(keyForPos(pos.x, pos.y)));
	const picks = [...available].sort(() => Math.random() - 0.5).slice(0, count);
	return Object.fromEntries(
		picks.map((pos) => [keyForPos(pos.x, pos.y), true]),
	) as Record<string, boolean>;
};
