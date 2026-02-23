import { keyForPos } from "../shared/coords";
import { randomRoll } from "../shared/random";
import type { Animal, Point } from "../shared/types";

type Bounds = { minX: number; maxX: number; minY: number; maxY: number };
type Occupied = Record<number, Point>;

export const countOpenBarnTilesInBounds = ({
	occupied,
	rows,
	bounds,
	isPassableChar,
}: {
	occupied: Occupied;
	rows: string[];
	bounds: Bounds;
	isPassableChar: (c: string) => boolean;
}): number => {
	let count = 0;
	for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
		for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
			if (!isPassableChar(rows[y]?.[x] ?? "#")) continue;
			const used = Object.values(occupied).some((p) => p.x === x && p.y === y);
			if (!used) count += 1;
		}
	}
	return count;
};

export const nextOpenBarnTileInBounds = ({
	occupied,
	rows,
	bounds,
	isPassableChar,
}: {
	occupied: Occupied;
	rows: string[];
	bounds: Bounds;
	isPassableChar: (c: string) => boolean;
}): Point | null => {
	for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
		for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
			if (!isPassableChar(rows[y]?.[x] ?? "#")) continue;
			const used = Object.values(occupied).some((p) => p.x === x && p.y === y);
			if (!used) return { x, y };
		}
	}
	return null;
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
}: {
	animals: Animal[];
	cap: number;
	bounds: Bounds;
}): {
	keptAnimals: Animal[];
	occupied: Occupied;
} => {
	const keptAnimals = animals.slice(0, cap);
	const occupied: Occupied = {};
	keptAnimals.forEach((animal) => {
		let placed = false;
		for (let y = bounds.minY; y <= bounds.maxY && !placed; y += 1) {
			for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
				const used = Object.values(occupied).some((p) => p.x === x && p.y === y);
				if (used) continue;
				occupied[animal.id] = { x, y };
				placed = true;
				break;
			}
		}
	});
	return { keptAnimals, occupied };
};
