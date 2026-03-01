import { keyForPos } from "../shared/coords";
import { randomRoll } from "../shared/random";
import type { Animal, Point } from "../shared/types";

type Bounds = { minX: number; maxX: number; minY: number; maxY: number };
type Occupied = Record<number, Point>;

const manhattan = (a: Point, b: Point) =>
	Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const collectDoorEntryTiles = ({
	rows,
	bounds,
	isPassableTile,
}: {
	rows: string[];
	bounds: Bounds;
	isPassableTile: (tile: string) => boolean;
}): Point[] => {
	const seen = new Set<string>();
	const doors: Point[] = [];
	const tryAdd = (x: number, y: number) => {
		const tile = rows[y]?.[x];
		if (!tile) return;
		if (!isPassableTile(tile)) return;
		const key = `${x},${y}`;
		if (seen.has(key)) return;
		seen.add(key);
		doors.push({ x, y });
	};

	for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
		tryAdd(x, bounds.minY - 1);
		tryAdd(x, bounds.maxY + 1);
	}
	for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
		tryAdd(bounds.minX - 1, y);
		tryAdd(bounds.maxX + 1, y);
	}
	return doors;
};

const isBlockedByDoorBuffer = (
	pos: Point,
	doorTiles: Point[],
	doorBufferDistance: number,
) => {
	if (doorBufferDistance <= 0 || doorTiles.length <= 0) return false;
	return doorTiles.some((door) => manhattan(pos, door) <= doorBufferDistance);
};

const pickEvenSpreadTile = ({
	candidates,
	occupiedPoints,
	bounds,
}: {
	candidates: Point[];
	occupiedPoints: Point[];
	bounds: Bounds;
}): Point | null => {
	if (candidates.length <= 0) return null;
	const center = {
		x: (bounds.minX + bounds.maxX) / 2,
		y: (bounds.minY + bounds.maxY) / 2,
	};
	let best: Point | null = null;
	let bestPrimary = -Infinity;
	let bestSecondary = -Infinity;
	for (const candidate of candidates) {
		const centerDist =
			Math.abs(candidate.x - center.x) + Math.abs(candidate.y - center.y);
		if (occupiedPoints.length <= 0) {
			// First placement starts near center so later picks can spread outward.
			const primary = -centerDist;
			const secondary = -(candidate.y * 1000 + candidate.x);
			if (
				primary > bestPrimary ||
				(primary === bestPrimary && secondary > bestSecondary)
			) {
				best = candidate;
				bestPrimary = primary;
				bestSecondary = secondary;
			}
			continue;
		}
		let nearest = Number.POSITIVE_INFINITY;
		for (const occupied of occupiedPoints) {
			nearest = Math.min(nearest, manhattan(candidate, occupied));
		}
		// Maximize nearest-neighbor distance for even spread.
		const primary = nearest;
		// Tie-break away from center to keep spacing broad.
		const secondary = centerDist;
		if (
			primary > bestPrimary ||
			(primary === bestPrimary && secondary > bestSecondary)
		) {
			best = candidate;
			bestPrimary = primary;
			bestSecondary = secondary;
		}
	}
	return best;
};

export const countOpenBarnTilesInBounds = ({
	occupied,
	rows,
	bounds,
	isPassableChar,
	doorBufferDistance = 0,
}: {
	occupied: Occupied;
	rows: string[];
	bounds: Bounds;
	isPassableChar: (c: string) => boolean;
	doorBufferDistance?: number;
}): number => {
	const doorTiles = collectDoorEntryTiles({
		rows,
		bounds,
		isPassableTile: isPassableChar,
	});
	let count = 0;
	for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
		for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
			if (!isPassableChar(rows[y]?.[x] ?? "#")) continue;
			const used = Object.values(occupied).some((p) => p.x === x && p.y === y);
			if (used) continue;
			if (
				isBlockedByDoorBuffer(
					{ x, y },
					doorTiles,
					doorBufferDistance,
				)
			)
				continue;
			count += 1;
		}
	}
	return count;
};

export const nextOpenBarnTileInBounds = ({
	occupied,
	rows,
	bounds,
	isPassableChar,
	scanFromBottom = false,
	doorBufferDistance = 0,
}: {
	occupied: Occupied;
	rows: string[];
	bounds: Bounds;
	isPassableChar: (c: string) => boolean;
	scanFromBottom?: boolean;
	doorBufferDistance?: number;
}): Point | null => {
	const doorTiles = collectDoorEntryTiles({
		rows,
		bounds,
		isPassableTile: isPassableChar,
	});
	const occupiedPoints = Object.values(occupied);
	const candidates: Point[] = [];
	for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
		for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
			if (!isPassableChar(rows[y]?.[x] ?? "#")) continue;
			const used = occupiedPoints.some((p) => p.x === x && p.y === y);
			if (used) continue;
			if (
				isBlockedByDoorBuffer(
					{ x, y },
					doorTiles,
					doorBufferDistance,
				)
			)
				continue;
			candidates.push({ x, y });
		}
	}
	return pickEvenSpreadTile({ candidates, occupiedPoints, bounds });
};

export const getEggDropNearChicken = ({
	chickenPos,
	occupiedAnimals,
	existingEggs,
	rows,
	bounds,
	isPassableChar,
	chickenEggOffsets,
}: {
	chickenPos: Point;
	occupiedAnimals: Occupied;
	existingEggs: Record<string, boolean>;
	rows: string[];
	bounds: Bounds;
	isPassableChar: (c: string) => boolean;
	chickenEggOffsets: Array<{ dx: number; dy: number }>;
}): Point | null => {
	const candidates = [...chickenEggOffsets].sort(() => randomRoll() - 0.5);
	for (const { dx, dy } of candidates) {
		const x = chickenPos.x + dx;
		const y = chickenPos.y + dy;
		if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) continue;
		if (!isPassableChar(rows[y]?.[x] ?? "#")) continue;
		if (Object.values(occupiedAnimals).some((p) => p.x === x && p.y === y)) continue;
		const key = keyForPos(x, y);
		if (existingEggs[key]) continue;
		return { x, y };
	}
	return null;
};

export const placeAnimalsInBounds = ({
	animals,
	cap,
	bounds,
	rows,
	allowedTiles,
	scanFromBottom = false,
	doorBufferDistance = 0,
}: {
	animals: Animal[];
	cap: number;
	bounds: Bounds;
	rows?: string[];
	allowedTiles?: string[];
	scanFromBottom?: boolean;
	doorBufferDistance?: number;
}): {
	keptAnimals: Animal[];
	occupied: Occupied;
} => {
	const keptAnimals = animals.slice(0, cap);
	const occupied: Occupied = {};
	const allowedTileSet = allowedTiles ? new Set(allowedTiles) : null;
	const localRows = rows ?? [];
	const doorTiles = collectDoorEntryTiles({
		rows: localRows,
		bounds,
		isPassableTile: (tile) =>
			allowedTileSet ? allowedTileSet.has(tile) : tile !== "#",
	});
	keptAnimals.forEach((animal) => {
		const occupiedPoints = Object.values(occupied);
		const candidates: Point[] = [];
		for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
			for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
				if (allowedTileSet) {
					const tile = rows?.[y]?.[x] ?? "#";
					if (!allowedTileSet.has(tile)) continue;
				}
				const used = occupiedPoints.some((p) => p.x === x && p.y === y);
				if (used) continue;
				if (
					isBlockedByDoorBuffer(
						{ x, y },
						doorTiles,
						doorBufferDistance,
					)
				)
					continue;
				candidates.push({ x, y });
			}
		}
		const chosen = pickEvenSpreadTile({ candidates, occupiedPoints, bounds });
		if (chosen) {
			occupied[animal.id] = chosen;
		}
	});
	return { keptAnimals, occupied };
};
