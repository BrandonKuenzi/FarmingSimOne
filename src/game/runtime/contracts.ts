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
export type BoatKey = "boat_1" | "boat_2" | "boat_3" | "boat_4" | "boat_5";
export type BoatTileMap = Record<BoatKey, Point>;
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
	dispatchBatch?: (updates: {
		townNpcTiles?: TownNpcTileMap;
		boatTiles?: BoatTileMap;
		animalTiles?: AnimalTileMap;
		petTile?: Point | null;
		petFacing?: 1 | -1;
		forestEnemies?: ForestEnemy[];
		caveEnemies?: ForestEnemy[];
	}) => void;
};

export type WorldSimulationState = {
	animals: Array<{ id: number }>;
	pauseGame: boolean;
	playerRef: MutableRefObject<Position>;
	townNpcTiles: TownNpcTileMap;
	boatTiles: BoatTileMap;
	animalTiles: AnimalTileMap;
	petTile: Point | null;
	petFacing: 1 | -1;
	forestChest: ForestChest;
	forestObstacles: ForestObstacle[];
	forestBonusChests: ForestChest[];
	caveObstacles: ForestObstacle[];
	caveLadderPos: Point | null;
	activeMapLayouts: Record<string, string[]>;
};
