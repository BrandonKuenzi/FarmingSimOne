import { keyForPos } from "../shared/coords";
import type { MapId, Position } from "../shared/types";

export type IntPoint = { x: number; y: number };
export type MoveDelta = { dx: number; dy: number };

type RandomFn = (min: number, max: number) => number;

const tryRandomWanderMove = (
	current: IntPoint,
	tryCount: number,
	randomInt: RandomFn,
	moveDirections: Record<number, MoveDelta>,
	canMoveTo: (next: IntPoint) => boolean,
): IntPoint | null => {
	let attempts = 0;
	while (attempts < tryCount) {
		attempts += 1;
		const delta = moveDirections[randomInt(1, 8)];
		if (!delta) continue;
		const next = { x: current.x + delta.dx, y: current.y + delta.dy };
		if (!canMoveTo(next)) continue;
		return next;
	}
	return null;
};

export const nextTownNpcTile = ({
	current,
	anchor,
	npcKey,
	nextNpcTiles,
		activeTownRows,
		isPassableChar,
		requiredRowY,
		petVendorActive,
		ownedPet,
	petVendorPos,
	doctorVendorActive,
	doctorPos,
	player,
	randomInt,
	moveDirections,
}: {
	current: IntPoint;
	anchor: IntPoint;
	npcKey: string;
	nextNpcTiles: Record<string, IntPoint>;
	activeTownRows: string[];
	isPassableChar: (c: string) => boolean;
	requiredRowY: number;
	petVendorActive: boolean;
	ownedPet: unknown;
	petVendorPos: IntPoint;
	doctorVendorActive: boolean;
	doctorPos: IntPoint;
	player: Position;
	randomInt: RandomFn;
	moveDirections: Record<number, MoveDelta>;
	}): IntPoint | null =>
	tryRandomWanderMove(current, 128, randomInt, moveDirections, (next) => {
		if (Math.max(Math.abs(next.x - anchor.x), Math.abs(next.y - anchor.y)) > 2) return false;
		if (next.y !== requiredRowY) return false;
		if (
			next.y < 0 ||
			next.y >= activeTownRows.length ||
			next.x < 0 ||
			next.x >= activeTownRows[0].length
		)
			return false;
		const tile = activeTownRows[next.y]?.[next.x] ?? "#";
		if (tile !== ",") return false;
		if (!isPassableChar(tile)) return false;

		const occupiedByNpc = Object.entries(nextNpcTiles).some(
			([otherKey, pos]) => otherKey !== npcKey && pos.x === next.x && pos.y === next.y,
		);
		if (occupiedByNpc) return false;
		if (petVendorActive && !ownedPet && next.x === petVendorPos.x && next.y === petVendorPos.y) {
			return false;
		}
		if (doctorVendorActive && next.x === doctorPos.x && next.y === doctorPos.y) return false;
		if (player.map === "town" && player.x === next.x && player.y === next.y) return false;
		return true;
	});

export const nextBoatTile = ({
	current,
	boatKey,
	nextBoatTiles,
	activeTownRows,
	player,
	randomInt,
	moveDirections,
}: {
	current: IntPoint;
	boatKey: string;
	nextBoatTiles: Record<string, IntPoint>;
	activeTownRows: string[];
	player: Position;
	randomInt: RandomFn;
	moveDirections: Record<number, MoveDelta>;
}): IntPoint | null =>
	tryRandomWanderMove(current, 128, randomInt, moveDirections, (next) => {
		if (
			next.y < 0 ||
			next.y >= activeTownRows.length ||
			next.x < 0 ||
			next.x >= activeTownRows[0].length
		)
			return false;
		if (activeTownRows[next.y]?.[next.x] !== "~") return false;

		const occupiedByBoat = Object.entries(nextBoatTiles).some(
			([otherKey, pos]) => otherKey !== boatKey && pos.x === next.x && pos.y === next.y,
		);
		if (occupiedByBoat) return false;
		if (player.map === "town" && player.x === next.x && player.y === next.y) return false;
		return true;
	});

export const nextAnimalTile = ({
	current,
	animalId,
	nextAnimalTiles,
	anchor,
	allowOutsideBarn,
	barnInteriorBounds,
	activeMapRows,
	isPassableChar,
	farmEggDrops,
	player,
	randomInt,
	moveDirections,
	playerMapWhenBlocking,
}: {
	current: IntPoint;
	animalId: number;
	nextAnimalTiles: Record<number, IntPoint>;
	anchor: IntPoint;
	allowOutsideBarn: boolean;
	barnInteriorBounds: { minX: number; maxX: number; minY: number; maxY: number };
	activeMapRows: string[];
	isPassableChar: (c: string) => boolean;
	farmEggDrops: Record<string, boolean>;
	player: Position;
	randomInt: RandomFn;
	moveDirections: Record<number, MoveDelta>;
	playerMapWhenBlocking: MapId;
}): IntPoint | null => {
	let attempts = 0;
	while (attempts < 128) {
		attempts += 1;
		const delta = moveDirections[randomInt(1, 8)];
		if (!delta) continue;
		const next = { x: current.x + delta.dx, y: current.y + delta.dy };
		if (
			!allowOutsideBarn &&
			Math.max(Math.abs(next.x - anchor.x), Math.abs(next.y - anchor.y)) > 2
		)
			continue;
		if (!allowOutsideBarn) {
			if (
				next.x < barnInteriorBounds.minX ||
				next.x > barnInteriorBounds.maxX ||
				next.y < barnInteriorBounds.minY ||
				next.y > barnInteriorBounds.maxY
			)
				continue;
		}
		const tile = activeMapRows[next.y]?.[next.x] ?? "#";
		if (tile === "~") continue;
		if (!isPassableChar(tile)) continue;
		if (farmEggDrops[keyForPos(next.x, next.y)]) continue;

		const occupiedByAnimal = Object.entries(nextAnimalTiles).some(
			([otherId, pos]) =>
				Number(otherId) !== animalId && pos.x === next.x && pos.y === next.y,
		);
		if (occupiedByAnimal) continue;
		if (player.map === playerMapWhenBlocking && player.x === next.x && player.y === next.y)
			continue;
		return next;
	}
	return null;
};
