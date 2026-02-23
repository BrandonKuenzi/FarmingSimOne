import { keyForPos } from "../shared/coords";
import { randomInt } from "../shared/random";
import { FARM_HEIGHT, FARM_WIDTH } from "../world/layout";

const farmWeedSpreadDirections = [
	{ dx: -1, dy: -1 },
	{ dx: 0, dy: -1 },
	{ dx: 1, dy: -1 },
	{ dx: -1, dy: 0 },
	{ dx: 1, dy: 0 },
	{ dx: -1, dy: 1 },
	{ dx: 0, dy: 1 },
	{ dx: 1, dy: 1 },
];

const canPlaceFarmWeedAt = (
	x: number,
	y: number,
	occupiedWeeds: Set<string>,
	plotKeys: Set<string>,
	forestBlockers: Record<string, boolean>,
	caveBlockers: Record<string, number>,
	farmRows: string[],
	includeStarterChestBlock: boolean,
	starterChestPos: { x: number; y: number },
) => {
	if (x < 1 || y < 1 || x >= FARM_WIDTH - 1 || y >= FARM_HEIGHT - 1) return false;
	if (farmRows[y]?.[x] !== ",") return false;
	const key = keyForPos(x, y);
	if (occupiedWeeds.has(key)) return false;
	if (plotKeys.has(key)) return false;
	if (forestBlockers[key]) return false;
	if ((caveBlockers[key] ?? 0) > 0) return false;
	if (includeStarterChestBlock && x === starterChestPos.x && y === starterChestPos.y) return false;
	return true;
};

const rollRandomFarmWeedDrops = (
	occupiedWeeds: Set<string>,
	plotKeys: Set<string>,
	forestBlockers: Record<string, boolean>,
	caveBlockers: Record<string, number>,
	farmRows: string[],
	includeStarterChestBlock: boolean,
	starterChestPos: { x: number; y: number },
) => {
	const dropCount = randomInt(0, 2);
	if (dropCount <= 0) return;
	const candidates: Array<{ x: number; y: number }> = [];
	for (let y = 1; y < FARM_HEIGHT - 1; y += 1) {
		for (let x = 1; x < FARM_WIDTH - 1; x += 1) {
			if (
				canPlaceFarmWeedAt(
					x,
					y,
					occupiedWeeds,
					plotKeys,
					forestBlockers,
					caveBlockers,
					farmRows,
					includeStarterChestBlock,
					starterChestPos,
				)
			) {
				candidates.push({ x, y });
			}
		}
	}
	const picks = candidates.sort(() => Math.random() - 0.5).slice(0, dropCount);
	picks.forEach(({ x, y }) => occupiedWeeds.add(keyForPos(x, y)));
};

export const generateInitialFarmWeedField = (
	farmRows: string[],
	forestBlockers: Record<string, boolean>,
	caveBlockers: Record<string, number>,
	plotKeys: Set<string>,
	starterChestPos: { x: number; y: number },
) => {
	const weeds = new Set<string>();
	const blobCount = randomInt(3, 5);
	for (let i = 0; i < blobCount; i += 1) {
		const cx = randomInt(Math.floor(FARM_WIDTH * 0.62), FARM_WIDTH - 3);
		const cy = randomInt(Math.floor(FARM_HEIGHT * 0.6), FARM_HEIGHT - 3);
		const radiusX = randomInt(1, 2);
		const radiusY = randomInt(1, 2);
		for (let y = cy - radiusY; y <= cy + radiusY; y += 1) {
			for (let x = cx - radiusX; x <= cx + radiusX; x += 1) {
				if (Math.random() < 0.35) continue;
				if (
					canPlaceFarmWeedAt(
						x,
						y,
						weeds,
						plotKeys,
						forestBlockers,
						caveBlockers,
						farmRows,
						true,
						starterChestPos,
					)
				) {
					weeds.add(keyForPos(x, y));
				}
			}
		}
	}
	if (weeds.size < 1) {
		for (let y = FARM_HEIGHT - 3; y >= Math.floor(FARM_HEIGHT * 0.55); y -= 1) {
			for (let x = FARM_WIDTH - 3; x >= Math.floor(FARM_WIDTH * 0.58); x -= 1) {
				if (
					canPlaceFarmWeedAt(
						x,
						y,
						weeds,
						plotKeys,
						forestBlockers,
						caveBlockers,
						farmRows,
						true,
						starterChestPos,
					)
				) {
					weeds.add(keyForPos(x, y));
					y = -1;
					break;
				}
			}
		}
	}
	return Object.fromEntries(Array.from(weeds).map((key) => [key, true])) as Record<string, boolean>;
};

export const evolveFarmWeeds = (
	prev: Record<string, boolean>,
	farmRows: string[],
	forestBlockers: Record<string, boolean>,
	caveBlockers: Record<string, number>,
	plotKeys: Set<string>,
	includeStarterChestBlock: boolean,
	starterChestPos: { x: number; y: number },
) => {
	const weeds = new Set<string>(
		Object.entries(prev)
			.filter(([, present]) => present)
			.map(([key]) => key),
	);
	const baseWeeds = Array.from(weeds);
	baseWeeds.forEach((key) => {
		if (Math.random() >= 0.5) return;
		const [xStr, yStr] = key.split(",");
		const x = Number(xStr);
		const y = Number(yStr);
		if (!Number.isFinite(x) || !Number.isFinite(y)) return;
		const dir = farmWeedSpreadDirections[randomInt(0, farmWeedSpreadDirections.length - 1)]!;
		const nx = x + dir.dx;
		const ny = y + dir.dy;
		if (
			canPlaceFarmWeedAt(
				nx,
				ny,
				weeds,
				plotKeys,
				forestBlockers,
				caveBlockers,
				farmRows,
				includeStarterChestBlock,
				starterChestPos,
			)
		) {
			weeds.add(keyForPos(nx, ny));
		}
	});

	rollRandomFarmWeedDrops(
		weeds,
		plotKeys,
		forestBlockers,
		caveBlockers,
		farmRows,
		includeStarterChestBlock,
		starterChestPos,
	);
	return Object.fromEntries(Array.from(weeds).map((key) => [key, true])) as Record<string, boolean>;
};
