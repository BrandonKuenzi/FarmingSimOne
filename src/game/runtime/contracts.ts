import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type {
	ForestChest,
	ForestEnemy,
	ForestObstacle,
	MapId,
	Point,
	Position,
} from "../shared/types";

export type TownNpcTileMap = Record<string, Point>;
export type BoatTileMap = Record<string, Point>;
export type AnimalTileMap = Record<number, Point>;

export type GameStateSnapshot = {
	player: Position;
	day: number;
	map: MapId;
};

export type GameStateActions = {
	setTownNpcTiles: Dispatch<SetStateAction<TownNpcTileMap>>;
	setBoatTiles: Dispatch<SetStateAction<BoatTileMap>>;
	setAnimalTiles: Dispatch<SetStateAction<AnimalTileMap>>;
	setPetTile: Dispatch<SetStateAction<Point | null>>;
	setPetFacing: Dispatch<SetStateAction<1 | -1>>;
	setForestEnemies: Dispatch<SetStateAction<ForestEnemy[]>>;
	setCaveEnemies: Dispatch<SetStateAction<ForestEnemy[]>>;
};

export type WorldSimulationState = {
	animals: Array<{ id: number }>;
	pauseGame: boolean;
	playerRef: MutableRefObject<Position>;
	forestChest: ForestChest;
	forestObstacles: ForestObstacle[];
	forestBonusChests: ForestChest[];
	caveObstacles: ForestObstacle[];
	caveLadderPos: Point | null;
	activeMapLayouts: Record<string, string[]>;
};
