import { randomInt, randomRoll } from "../shared/random";
import { CAVE_GATE_Y, FARM_HEIGHT, FARM_WIDTH, FOREST_GATE_Y } from "./layout";
import type {
	CaveGenerationResult,
	ForestChest,
	ForestEnemy,
	ForestEnemyType,
	ForestGenConfig,
	ForestGenerationResult,
	ForestObstacle,
	ForestObstacleType,
	ForestSide,
} from "../shared/types";
export const isForestWalkableTile = (tile: string) => tile === "," || tile === "+";
export const isForestBlockedTile = (tile: string) => tile === "T" || tile === "G";
export const isCaveWalkableTile = (tile: string) =>
	tile === "=" || tile === ")" || tile === "+" || tile === "/";
export const isCaveBlockedTile = (tile: string) =>
	tile === "<" || tile === ">" || tile === "*";
const forestSideOrder: ForestSide[] = ["top", "right", "bottom", "left"];
export const oppositeForestSide = (side: ForestSide): ForestSide =>
	side === "left"
		? "right"
		: side === "right"
			? "left"
			: side === "top"
				? "bottom"
				: "top";
const sideIndex = (side: ForestSide) => forestSideOrder.indexOf(side);
const getForestTurnSign = (
	entranceSide: ForestSide,
	exitSide: ForestSide,
): -1 | 0 | 1 => {
	const facing = oppositeForestSide(entranceSide);
	const delta = (sideIndex(exitSide) - sideIndex(facing) + 4) % 4;
	if (delta === 3) return -1;
	if (delta === 1) return 1;
	return 0;
};
const makeForestDoorBySide = (
	side: ForestSide,
	coord?: number,
): { door: { x: number; y: number }; inside: { x: number; y: number } } => {
	if (side === "left") {
		const y = coord ?? randomInt(2, FARM_HEIGHT - 3);
		return { door: { x: 0, y }, inside: { x: 1, y } };
	}
	if (side === "right") {
		const y = coord ?? randomInt(2, FARM_HEIGHT - 3);
		return { door: { x: FARM_WIDTH - 1, y }, inside: { x: FARM_WIDTH - 2, y } };
	}
	if (side === "top") {
		const x = coord ?? randomInt(2, FARM_WIDTH - 3);
		return { door: { x, y: 0 }, inside: { x, y: 1 } };
	}
	const x = coord ?? randomInt(2, FARM_WIDTH - 3);
	return { door: { x, y: FARM_HEIGHT - 1 }, inside: { x, y: FARM_HEIGHT - 2 } };
};

const carveForestLine = (
	grid: string[][],
	x1: number,
	y1: number,
	x2: number,
	y2: number,
) => {
	let x = x1;
	let y = y1;
	grid[y]![x] = ",";
	while (x !== x2) {
		x += x < x2 ? 1 : -1;
		grid[y]![x] = ",";
		if (randomRoll() < 0.16) {
			const yOffset = randomInt(-1, 1);
			const ny = Math.max(1, Math.min(FARM_HEIGHT - 2, y + yOffset));
			grid[ny]![x] = ",";
		}
	}
	while (y !== y2) {
		y += y < y2 ? 1 : -1;
		grid[y]![x] = ",";
		if (randomRoll() < 0.14) {
			const xOffset = randomInt(-1, 1);
			const nx = Math.max(1, Math.min(FARM_WIDTH - 2, x + xOffset));
			grid[y]![nx] = ",";
		}
	}
};

const carveCaveLine = (
	grid: string[][],
	x1: number,
	y1: number,
	x2: number,
	y2: number,
) => {
	let x = x1;
	let y = y1;
	grid[y]![x] = ")";
	while (x !== x2) {
		x += x < x2 ? 1 : -1;
		grid[y]![x] = ")";
		if (randomRoll() < 0.16) {
			const yOffset = randomInt(-1, 1);
			const ny = Math.max(1, Math.min(FARM_HEIGHT - 2, y + yOffset));
			grid[ny]![x] = ")";
		}
	}
	while (y !== y2) {
		y += y < y2 ? 1 : -1;
		grid[y]![x] = ")";
		if (randomRoll() < 0.14) {
			const xOffset = randomInt(-1, 1);
			const nx = Math.max(1, Math.min(FARM_WIDTH - 2, x + xOffset));
			grid[y]![nx] = ")";
		}
	}
};

const carveForestStraightLine = (
	grid: string[][],
	x1: number,
	y1: number,
	x2: number,
	y2: number,
) => {
	if (x1 === x2) {
		const [from, to] = y1 <= y2 ? [y1, y2] : [y2, y1];
		for (let y = from; y <= to; y += 1) {
			grid[y]![x1] = ",";
		}
		return;
	}
	const [from, to] = x1 <= x2 ? [x1, x2] : [x2, x1];
	for (let x = from; x <= to; x += 1) {
		grid[y1]![x] = ",";
	}
};

const randomForestOpenCell = (
	grid: string[][],
	isBlocked: (x: number, y: number) => boolean,
	requireRightHalf = false,
): { x: number; y: number } | null => {
	for (let tries = 0; tries < 800; tries += 1) {
		const x = randomInt(
			requireRightHalf ? Math.floor(FARM_WIDTH / 2) : 1,
			FARM_WIDTH - 2,
		);
		const y = randomInt(1, FARM_HEIGHT - 2);
		if (!isForestWalkableTile(grid[y]![x]!)) continue;
		if (isBlocked(x, y)) continue;
		return { x, y };
	}
	return null;
};

const generateBonusForestState = (cfg?: ForestGenConfig): ForestGenerationResult => {
	const level = Math.max(1, cfg?.level ?? 1);
	const entranceSide = cfg?.entranceSide ?? "left";
	const entrancePair = makeForestDoorBySide(
		entranceSide,
		cfg?.entranceCoord ??
			(entranceSide === "left" ? FOREST_GATE_Y : undefined),
	);
	const exitSide = oppositeForestSide(entranceSide);
	const alignedCoord =
		entranceSide === "left" || entranceSide === "right"
			? entrancePair.door.y
			: entrancePair.door.x;
	const exitPair = makeForestDoorBySide(exitSide, alignedCoord);
	const turnSign = getForestTurnSign(entranceSide, exitSide);

	const grid = Array.from({ length: FARM_HEIGHT }, () =>
		Array.from({ length: FARM_WIDTH }, () => "T"),
	);
	for (let i = 0; i < 44; i += 1) {
		const cx = randomInt(2, FARM_WIDTH - 3);
		const cy = randomInt(2, FARM_HEIGHT - 3);
		const radius = randomInt(1, 3);
		for (let y = cy - radius; y <= cy + radius; y += 1) {
			for (let x = cx - radius; x <= cx + radius; x += 1) {
				if (x <= 0 || y <= 0 || x >= FARM_WIDTH - 1 || y >= FARM_HEIGHT - 1)
					continue;
				if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= radius * radius + 1) {
					grid[y]![x] = "G";
				}
			}
		}
	}

	const centerX = Math.floor(FARM_WIDTH / 2);
	const centerY = Math.floor(FARM_HEIGHT / 2);
	const rx = Math.floor(FARM_WIDTH * 0.34);
	const ry = Math.floor(FARM_HEIGHT * 0.34);
	for (let y = 1; y < FARM_HEIGHT - 1; y += 1) {
		for (let x = 1; x < FARM_WIDTH - 1; x += 1) {
			const nx = (x - centerX) / rx;
			const ny = (y - centerY) / ry;
			if (nx * nx + ny * ny <= 1) grid[y]![x] = ",";
		}
	}

	const pondGroupCount = randomInt(2, 4);
	for (let i = 0; i < pondGroupCount; i += 1) {
		const cx = randomInt(Math.max(2, centerX - rx + 2), Math.min(FARM_WIDTH - 3, centerX + rx - 2));
		const cy = randomInt(Math.max(2, centerY - ry + 2), Math.min(FARM_HEIGHT - 3, centerY + ry - 2));
		const blobCount = randomInt(2, 4);
		for (let b = 0; b < blobCount; b += 1) {
			const ox = cx + randomInt(-3, 3);
			const oy = cy + randomInt(-2, 2);
			const brx = randomInt(1, 3);
			const bry = randomInt(1, 2);
			for (let y = oy - bry - 1; y <= oy + bry + 1; y += 1) {
				for (let x = ox - brx - 1; x <= ox + brx + 1; x += 1) {
					if (x <= 0 || y <= 0 || x >= FARM_WIDTH - 1 || y >= FARM_HEIGHT - 1)
						continue;
					const nx = (x - ox) / brx;
					const ny = (y - oy) / bry;
					if (nx * nx + ny * ny > 1.2) continue;
					if (grid[y]![x] === ",") grid[y]![x] = "~";
				}
			}
		}
	}

	carveForestStraightLine(
		grid,
		entrancePair.inside.x,
		entrancePair.inside.y,
		exitPair.inside.x,
		exitPair.inside.y,
	);
	grid[entrancePair.door.y]![entrancePair.door.x] = "+";
	grid[entrancePair.inside.y]![entrancePair.inside.x] = ",";
	grid[exitPair.door.y]![exitPair.door.x] = ",";
	grid[exitPair.inside.y]![exitPair.inside.x] = ",";

	const obstacleCells = new Set<string>();
	const enemyCells = new Set<string>();
	const chestBlockKey = new Set<string>([
		`${entrancePair.inside.x},${entrancePair.inside.y}`,
		`${exitPair.inside.x},${exitPair.inside.y}`,
	]);
	const reservedPathCells = new Set<string>();
	if (entrancePair.inside.x === exitPair.inside.x) {
		const [fromY, toY] =
			entrancePair.inside.y <= exitPair.inside.y
				? [entrancePair.inside.y, exitPair.inside.y]
				: [exitPair.inside.y, entrancePair.inside.y];
		for (let y = fromY; y <= toY; y += 1) {
			reservedPathCells.add(`${entrancePair.inside.x},${y}`);
		}
	} else {
		const [fromX, toX] =
			entrancePair.inside.x <= exitPair.inside.x
				? [entrancePair.inside.x, exitPair.inside.x]
				: [exitPair.inside.x, entrancePair.inside.x];
		for (let x = fromX; x <= toX; x += 1) {
			reservedPathCells.add(`${x},${entrancePair.inside.y}`);
		}
	}
	const isBlocked = (x: number, y: number) =>
		obstacleCells.has(`${x},${y}`) ||
		enemyCells.has(`${x},${y}`) ||
		chestBlockKey.has(`${x},${y}`) ||
		reservedPathCells.has(`${x},${y}`);

	const chestCount = Math.max(1, Math.floor(level / 5));
	const centerChestCell = () => {
		for (let tries = 0; tries < 500; tries += 1) {
			const x = randomInt(
				Math.max(1, centerX - 8),
				Math.min(FARM_WIDTH - 2, centerX + 8),
			);
			const y = randomInt(
				Math.max(1, centerY - 5),
				Math.min(FARM_HEIGHT - 2, centerY + 5),
			);
			if (!isForestWalkableTile(grid[y]![x]!)) continue;
			if (isBlocked(x, y)) continue;
			return { x, y };
		}
		return randomForestOpenCell(grid, isBlocked, false) ?? { x: centerX, y: centerY };
	};

	const chestCell = centerChestCell();
	let chest: ForestChest = { id: 1, ...chestCell, opened: false };
	chestBlockKey.add(`${chest.x},${chest.y}`);

	const bonusChests: ForestChest[] = [];
	for (let i = 1; i < chestCount; i += 1) {
		const cell = centerChestCell();
		chestBlockKey.add(`${cell.x},${cell.y}`);
		bonusChests.push({ id: 10 + i, ...cell, opened: false });
	}

	const obstacles: ForestObstacle[] = [];
	const weedGroupCount = randomInt(4, 7);
	let nextObstacleId = 1;
	for (let i = 0; i < weedGroupCount; i += 1) {
		const cx = randomInt(Math.max(2, centerX - rx + 2), Math.min(FARM_WIDTH - 3, centerX + rx - 2));
		const cy = randomInt(Math.max(2, centerY - ry + 2), Math.min(FARM_HEIGHT - 3, centerY + ry - 2));
		const radius = randomInt(1, 2);
		for (let y = cy - radius; y <= cy + radius; y += 1) {
			for (let x = cx - radius; x <= cx + radius; x += 1) {
				if (x <= 0 || y <= 0 || x >= FARM_WIDTH - 1 || y >= FARM_HEIGHT - 1)
					continue;
				if ((x - cx) * (x - cx) + (y - cy) * (y - cy) > radius * radius + 1)
					continue;
				if (grid[y]![x] !== ",") continue;
				if (isBlocked(x, y)) continue;
				obstacleCells.add(`${x},${y}`);
				obstacles.push({
					id: nextObstacleId++,
					type: "weed",
					x,
					y,
					hitsRemaining: 1,
				});
			}
		}
	}

	return {
		layout: grid.map((row) => row.join("")),
		enemies: [],
		obstacles,
		chest,
		bonusChests,
		isBonusLevel: true,
		entranceSide,
		exitSide,
		entranceDoor: entrancePair.door,
		entranceInside: entrancePair.inside,
		exitDoor: exitPair.door,
		exitInside: exitPair.inside,
		turnSign,
		level,
	};
};

export const generateForestState = (cfg?: ForestGenConfig): ForestGenerationResult => {
	const level = Math.max(1, cfg?.level ?? 1);
	if (level % 5 === 0) {
		return generateBonusForestState(cfg);
	}
	const entranceSide = cfg?.entranceSide ?? "left";
	const lastTurn = cfg?.lastTurn ?? 0;
	const entrancePair = makeForestDoorBySide(
		entranceSide,
		cfg?.entranceCoord ??
			(entranceSide === "left" ? FOREST_GATE_Y : undefined),
	);
	let exitChoices: ForestSide[] = ["top", "right", "bottom"].filter(
		(side) => side !== entranceSide,
	) as ForestSide[];
	if (lastTurn !== 0 && exitChoices.length > 1) {
		const filtered = exitChoices.filter(
			(side) => getForestTurnSign(entranceSide, side) !== lastTurn,
		);
		if (filtered.length > 0) exitChoices = filtered;
	}
	const exitSide = exitChoices[randomInt(0, exitChoices.length - 1)] ?? "right";
	const exitPair = makeForestDoorBySide(exitSide);
	const turnSign = getForestTurnSign(entranceSide, exitSide);

	const grid = Array.from({ length: FARM_HEIGHT }, () =>
		Array.from({ length: FARM_WIDTH }, () => "T"),
	);
	for (let y = 0; y < FARM_HEIGHT; y += 1) {
		for (let x = 0; x < FARM_WIDTH; x += 1) {
			if (x === 0 || y === 0 || x === FARM_WIDTH - 1 || y === FARM_HEIGHT - 1) {
				grid[y]![x] = "T";
			}
		}
	}

	for (let i = 0; i < 44; i += 1) {
		const cx = randomInt(2, FARM_WIDTH - 3);
		const cy = randomInt(2, FARM_HEIGHT - 3);
		const radius = randomInt(1, 3);
		for (let y = cy - radius; y <= cy + radius; y += 1) {
			for (let x = cx - radius; x <= cx + radius; x += 1) {
				if (x <= 0 || y <= 0 || x >= FARM_WIDTH - 1 || y >= FARM_HEIGHT - 1)
					continue;
				if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= radius * radius + 1) {
					grid[y]![x] = "G";
				}
			}
		}
	}

	const pondCount = randomInt(0, 3);
	for (let i = 0; i < pondCount; i += 1) {
		const cx = randomInt(2, FARM_WIDTH - 3);
		const cy = randomInt(2, FARM_HEIGHT - 3);
		const blobCount = randomInt(2, 4);
		for (let b = 0; b < blobCount; b += 1) {
			const ox = cx + randomInt(-3, 3);
			const oy = cy + randomInt(-2, 2);
			const rx = randomInt(1, 3);
			const ry = randomInt(1, 3);
			for (let y = oy - ry - 1; y <= oy + ry + 1; y += 1) {
				for (let x = ox - rx - 1; x <= ox + rx + 1; x += 1) {
					if (x <= 0 || y <= 0 || x >= FARM_WIDTH - 1 || y >= FARM_HEIGHT - 1)
						continue;
					const nx = (x - ox) / rx;
					const ny = (y - oy) / ry;
					if (nx * nx + ny * ny > 1.15) continue;
					const tile = grid[y]![x]!;
					if (tile === "T" || tile === "G") {
						grid[y]![x] = "~";
					}
				}
			}
		}
	}

	const roomCenters: Array<{ x: number; y: number }> = [];
	const carveRoom = (x: number, y: number, w: number, h: number) => {
		for (let yy = y; yy < y + h; yy += 1) {
			for (let xx = x; xx < x + w; xx += 1) {
				if (xx <= 0 || yy <= 0 || xx >= FARM_WIDTH - 1 || yy >= FARM_HEIGHT - 1)
					continue;
				grid[yy]![xx] = ",";
			}
		}
		roomCenters.push({ x: x + Math.floor(w / 2), y: y + Math.floor(h / 2) });
	};

	const seedRoomX = Math.max(1, Math.min(FARM_WIDTH - 10, entrancePair.inside.x - 3));
	const seedRoomY = Math.max(1, Math.min(FARM_HEIGHT - 6, entrancePair.inside.y - 2));
	carveRoom(seedRoomX, seedRoomY, 8, 5);
	const roomCount = randomInt(12, 18);
	for (let i = 0; i < roomCount; i += 1) {
		const w = randomInt(4, 10);
		const h = randomInt(3, 7);
		const x = randomInt(1, FARM_WIDTH - w - 2);
		const y = randomInt(1, FARM_HEIGHT - h - 2);
		carveRoom(x, y, w, h);
	}

	const pathPoints = [entrancePair.inside, ...roomCenters, exitPair.inside];
	for (let i = 1; i < pathPoints.length; i += 1) {
		const from = pathPoints[i - 1]!;
		const to = pathPoints[i]!;
		carveForestLine(grid, from.x, from.y, to.x, to.y);
	}

	grid[entrancePair.door.y]![entrancePair.door.x] = "+";
	grid[entrancePair.inside.y]![entrancePair.inside.x] = ",";
	grid[exitPair.door.y]![exitPair.door.x] = ",";
	grid[exitPair.inside.y]![exitPair.inside.x] = ",";

	const obstacleCells = new Set<string>();
	const enemyCells = new Set<string>();
	const chestBlockKey = new Set<string>([
		`${entrancePair.inside.x},${entrancePair.inside.y}`,
		`${exitPair.inside.x},${exitPair.inside.y}`,
	]);
	const isBlocked = (x: number, y: number) =>
		obstacleCells.has(`${x},${y}`) ||
		enemyCells.has(`${x},${y}`) ||
		chestBlockKey.has(`${x},${y}`);

	const lootVariance = randomInt(0, 1) * (randomRoll() < 0.5 ? -1 : 1);
	const totalLootBoxes = Math.max(1, level + lootVariance);
	const hasGoodChest = randomRoll() < 0.5;
	let chest: ForestChest = { id: 1, x: 1, y: 1, opened: true };
	if (hasGoodChest) {
		const chestCell = randomForestOpenCell(grid, isBlocked, true) ?? {
			x: Math.max(2, FARM_WIDTH - 4),
			y: entrancePair.inside.y,
		};
		chest = { id: 1, ...chestCell, opened: false };
		chestBlockKey.add(`${chest.x},${chest.y}`);
	}

	const bonusChests: ForestChest[] = [];
	const basicChestCount = Math.max(0, totalLootBoxes - (hasGoodChest ? 1 : 0));
	for (let i = 0; i < basicChestCount; i += 1) {
		let cell: { x: number; y: number } | null = null;
		for (let tries = 0; tries < 300; tries += 1) {
			const candidate = randomForestOpenCell(grid, isBlocked, false);
			if (candidate && candidate.x >= Math.floor(FARM_WIDTH / 4)) {
				cell = candidate;
				break;
			}
		}
		if (!cell) {
			break;
		}
		chestBlockKey.add(`${cell.x},${cell.y}`);
		bonusChests.push({ id: 10 + i, ...cell, opened: false });
	}

	const obstacles: ForestObstacle[] = [];
	const obstacleCount = randomInt(26, 42);
	for (let i = 0; i < obstacleCount; i += 1) {
		const cell = randomForestOpenCell(grid, isBlocked);
		if (!cell) break;
		obstacleCells.add(`${cell.x},${cell.y}`);
		obstacles.push({
			id: i + 1,
			type: "wood",
			x: cell.x,
			y: cell.y,
			hitsRemaining: 1,
		});
	}
	const rockCount = randomInt(3, 20);
	for (let i = 0; i < rockCount; i += 1) {
		const cell = randomForestOpenCell(grid, isBlocked);
		if (!cell) break;
		obstacleCells.add(`${cell.x},${cell.y}`);
		obstacles.push({
			id: obstacleCount + i + 1,
			type: "rock",
			x: cell.x,
			y: cell.y,
			hitsRemaining: 24,
		});
	}
	const weedCount = randomInt(8, 16);
	for (let i = 0; i < weedCount; i += 1) {
		const cell = randomForestOpenCell(grid, isBlocked);
		if (!cell) break;
		obstacleCells.add(`${cell.x},${cell.y}`);
		obstacles.push({
			id: obstacleCount + rockCount + i + 1,
			type: "weed",
			x: cell.x,
			y: cell.y,
			hitsRemaining: 1,
		});
	}

	const enemyTypesWeighted: ForestEnemyType[] = [
		"bear",
		"bear",
		"snake",
		"snake",
		"poop",
	];
	const enemies: ForestEnemy[] = [];
	const enemyCount = 3 + level;
	const isTooCloseToEntrance = (x: number, y: number) =>
		Math.max(
			Math.abs(x - entrancePair.inside.x),
			Math.abs(y - entrancePair.inside.y),
		) <= 7;
	for (let i = 0; i < enemyCount; i += 1) {
		let cell: { x: number; y: number } | null = null;
		for (let tries = 0; tries < 300; tries += 1) {
			const candidate = randomForestOpenCell(grid, isBlocked);
			if (candidate && !isTooCloseToEntrance(candidate.x, candidate.y)) {
				cell = candidate;
				break;
			}
		}
		if (!cell) break;
		enemyCells.add(`${cell.x},${cell.y}`);
		enemies.push({
			id: i + 1,
			type: enemyTypesWeighted[randomInt(0, enemyTypesWeighted.length - 1)]!,
			x: cell.x,
			y: cell.y,
			anchorX: cell.x,
			anchorY: cell.y,
		});
	}

	return {
		layout: grid.map((row) => row.join("")),
		enemies,
		obstacles,
		chest,
		bonusChests,
		isBonusLevel: false,
		entranceSide,
		exitSide,
		entranceDoor: entrancePair.door,
		entranceInside: entrancePair.inside,
		exitDoor: exitPair.door,
		exitInside: exitPair.inside,
		turnSign,
		level,
	};
};

const caveWallTiles = ["<", ">", "*"] as const;
const randomCaveWallTile = () =>
	caveWallTiles[randomInt(0, caveWallTiles.length - 1)]!;

const makeCaveDoorBySide = (
	side: ForestSide,
	coord?: number,
): { door: { x: number; y: number }; inside: { x: number; y: number } } => {
	if (side === "left") {
		const y = coord ?? randomInt(2, FARM_HEIGHT - 3);
		return { door: { x: 0, y }, inside: { x: 1, y } };
	}
	if (side === "right") {
		const y = coord ?? randomInt(2, FARM_HEIGHT - 3);
		return { door: { x: FARM_WIDTH - 1, y }, inside: { x: FARM_WIDTH - 2, y } };
	}
	if (side === "top") {
		const x = coord ?? randomInt(2, FARM_WIDTH - 3);
		return { door: { x, y: 0 }, inside: { x, y: 1 } };
	}
	const x = coord ?? randomInt(2, FARM_WIDTH - 3);
	return { door: { x, y: FARM_HEIGHT - 1 }, inside: { x, y: FARM_HEIGHT - 2 } };
};

const randomCaveOpenCell = (
	grid: string[][],
	isBlocked: (x: number, y: number) => boolean,
): { x: number; y: number } | null => {
	for (let tries = 0; tries < 900; tries += 1) {
		const x = randomInt(1, FARM_WIDTH - 2);
		const y = randomInt(1, FARM_HEIGHT - 2);
		if (!isCaveWalkableTile(grid[y]![x]!)) continue;
		if (isBlocked(x, y)) continue;
		return { x, y };
	}
	return null;
};

const caveRubbleChars = [".", ":", '"', "`"] as const;
export const buildCaveRubble = (layout: string[]): Record<string, string> => {
	const rubble: Record<string, string> = {};
	for (let y = 0; y < layout.length; y += 1) {
		const row = layout[y] ?? "";
		for (let x = 0; x < row.length; x += 1) {
			if (row[x] !== ")") continue;
			if (randomRoll() > 0.085) continue;
			rubble[`${x},${y}`] =
				caveRubbleChars[randomInt(0, caveRubbleChars.length - 1)] ?? ".";
		}
	}
	return rubble;
};

export const generateCaveState = (cfg?: ForestGenConfig): CaveGenerationResult => {
	const level = Math.max(1, cfg?.level ?? 1);
	const entranceSide = cfg?.entranceSide ?? "left";
	const entrancePair = makeCaveDoorBySide(
		entranceSide,
		cfg?.entranceCoord ?? (entranceSide === "left" ? CAVE_GATE_Y : undefined),
	);

	const grid: string[][] = Array.from({ length: FARM_HEIGHT }, () =>
		Array.from({ length: FARM_WIDTH }, () => randomCaveWallTile()),
	);
	for (let y = 0; y < FARM_HEIGHT; y += 1) {
		for (let x = 0; x < FARM_WIDTH; x += 1) {
			if (x === 0 || y === 0 || x === FARM_WIDTH - 1 || y === FARM_HEIGHT - 1) {
				grid[y]![x] = randomCaveWallTile();
			}
		}
	}

	const roomCenters: Array<{ x: number; y: number }> = [];
	const carveRoom = (x: number, y: number, w: number, h: number) => {
		for (let yy = y; yy < y + h; yy += 1) {
			for (let xx = x; xx < x + w; xx += 1) {
				if (xx <= 0 || yy <= 0 || xx >= FARM_WIDTH - 1 || yy >= FARM_HEIGHT - 1)
					continue;
				grid[yy]![xx] = ")";
			}
		}
		roomCenters.push({ x: x + Math.floor(w / 2), y: y + Math.floor(h / 2) });
	};

	const seedRoomX = Math.max(1, Math.min(FARM_WIDTH - 10, entrancePair.inside.x - 3));
	const seedRoomY = Math.max(1, Math.min(FARM_HEIGHT - 6, entrancePair.inside.y - 2));
	carveRoom(seedRoomX, seedRoomY, 8, 5);
	const roomCount = randomInt(10, 16);
	for (let i = 0; i < roomCount; i += 1) {
		const w = randomInt(5, 11);
		const h = randomInt(4, 8);
		const x = randomInt(1, FARM_WIDTH - w - 2);
		const y = randomInt(1, FARM_HEIGHT - h - 2);
		carveRoom(x, y, w, h);
	}

	const levelOneExitInside = { x: -1, y: -1 };
	const pathPoints = [
		entrancePair.inside,
		...roomCenters,
	];
	for (let i = 1; i < pathPoints.length; i += 1) {
		const from = pathPoints[i - 1]!;
		const to = pathPoints[i]!;
		carveCaveLine(grid, from.x, from.y, to.x, to.y);
	}

	grid[entrancePair.door.y]![entrancePair.door.x] = level === 1 ? "+" : "/";
	grid[entrancePair.inside.y]![entrancePair.inside.x] = ")";
	if (level === 1) {
		for (let y = 1; y < FARM_HEIGHT - 1; y += 1) {
			for (let x = 1; x <= 6; x += 1) {
				grid[y]![x] = randomCaveWallTile();
			}
		}
	}

	const obstacleCells = new Set<string>();
	const enemyCells = new Set<string>();
	const reserved = new Set<string>([`${entrancePair.inside.x},${entrancePair.inside.y}`]);
	const isBlocked = (x: number, y: number) =>
		obstacleCells.has(`${x},${y}`) ||
		enemyCells.has(`${x},${y}`) ||
		reserved.has(`${x},${y}`);

	const obstacles: ForestObstacle[] = [];
	const rockCount = 4 + level;
	for (let i = 0; i < rockCount; i += 1) {
		const cell = randomCaveOpenCell(grid, isBlocked);
		if (!cell) break;
		obstacleCells.add(`${cell.x},${cell.y}`);
		obstacles.push({
			id: i + 1,
			type: "rock",
			x: cell.x,
			y: cell.y,
			hitsRemaining: 24,
		});
	}

	const enemyTypesWeighted: ForestEnemyType[] = ["bear", "bat", "bat", "poop"];
	const enemies: ForestEnemy[] = [];
	const enemyCount = 4 + level * randomInt(1, 2);
	const isTooCloseToEntrance = (x: number, y: number) =>
		Math.max(
			Math.abs(x - entrancePair.inside.x),
			Math.abs(y - entrancePair.inside.y),
		) <= 7;
	for (let i = 0; i < enemyCount; i += 1) {
		let cell: { x: number; y: number } | null = null;
		for (let tries = 0; tries < 300; tries += 1) {
			const candidate = randomCaveOpenCell(grid, isBlocked);
			if (candidate && !isTooCloseToEntrance(candidate.x, candidate.y)) {
				cell = candidate;
				break;
			}
		}
		if (!cell) break;
		enemyCells.add(`${cell.x},${cell.y}`);
		enemies.push({
			id: i + 1,
			type: enemyTypesWeighted[randomInt(0, enemyTypesWeighted.length - 1)]!,
			x: cell.x,
			y: cell.y,
			anchorX: cell.x,
			anchorY: cell.y,
		});
	}

	return {
		layout: grid.map((row) => row.join("")),
		enemies,
		obstacles,
		entranceSide,
		entranceDoor: entrancePair.door,
		entranceInside: entrancePair.inside,
		levelOneExitInside,
		startingRockCount: Math.max(1, obstacles.length),
		level,
	};
};

