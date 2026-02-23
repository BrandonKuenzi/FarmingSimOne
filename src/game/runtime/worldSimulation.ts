import { useEffect, useRef } from "react";
import type { ForestEnemy, Point } from "../shared/types";
import type {
	AnimalTileMap,
	BoatKey,
	BoatTileMap,
	GameStateActions,
	TownNpcTileMap,
	WorldSimulationState,
} from "./contracts";

type WorldSimulationDeps = WorldSimulationState &
	GameStateActions & {
		maybeMoveNPC: (npcKey: string, nextTiles: TownNpcTileMap) => void;
		maybeMoveBoat: (boatKey: string, nextTiles: BoatTileMap) => void;
		maybeMoveAnimal: (animalId: number, nextTiles: AnimalTileMap) => void;
		maybeMovePet: (current: Point) => Point;
		maybeMoveForestEnemy: (
			enemy: ForestEnemy,
			isHalfTick: boolean,
		) => ForestEnemy;
		maybeMoveCaveEnemy: (enemy: ForestEnemy, isHalfTick: boolean) => ForestEnemy;
		forestEnemyTickRef: { current: number };
		caveEnemyTickRef: { current: number };
		townNpcNames: Record<string, string>;
		boatNpcKeys: BoatKey[];
		farmEggDrops: Record<string, boolean>;
		farmForestBlockers: Record<string, boolean>;
		farmCaveBlockers: Record<string, number>;
		petGraveObstacles: Record<string, number>;
		farmWeedObstacles: Record<string, boolean>;
		plots: Record<string, unknown>;
		starterChestOpened: boolean;
		petVendorActive: boolean;
		ownedPet: string | null;
	};

export const useWorldSimulation = (deps: WorldSimulationDeps): void => {
	const {
		animals,
		pauseGame,
		playerRef,
		townNpcTiles,
		boatTiles,
		animalTiles,
		petTile,
		petFacing,
		activeMapLayouts,
		forestObstacles,
		forestChest,
		forestBonusChests,
		caveObstacles,
		caveLadderPos,
		setTownNpcTiles,
		setBoatTiles,
		setAnimalTiles,
		setPetTile,
		setPetFacing,
		setForestEnemies,
		setCaveEnemies,
		dispatchBatch,
		maybeMoveNPC,
		maybeMoveBoat,
		maybeMoveAnimal,
		maybeMovePet,
		maybeMoveForestEnemy,
		maybeMoveCaveEnemy,
		forestEnemyTickRef,
		caveEnemyTickRef,
		townNpcNames,
		boatNpcKeys,
		farmEggDrops,
		farmForestBlockers,
		farmCaveBlockers,
		petGraveObstacles,
		farmWeedObstacles,
		plots,
		starterChestOpened,
		petVendorActive,
		ownedPet,
	} = deps;

	const equalPoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
	const maybeMoveNPCRef = useRef(maybeMoveNPC);
	const maybeMoveBoatRef = useRef(maybeMoveBoat);
	const maybeMoveAnimalRef = useRef(maybeMoveAnimal);
	const maybeMovePetRef = useRef(maybeMovePet);
	const boatNpcKeysRef = useRef(boatNpcKeys);
	const dispatchBatchRef = useRef(dispatchBatch);
	const animalsRef = useRef(animals);
	const pauseGameRef = useRef(pauseGame);
	const townNpcTilesRef = useRef(townNpcTiles);
	const boatTilesRef = useRef(boatTiles);
	const animalTilesRef = useRef(animalTiles);
	const petTileRef = useRef(petTile);
	const petFacingRef = useRef(petFacing);
	const townNpcNamesRef = useRef(townNpcNames);
	const maybeMoveForestEnemyRef = useRef(maybeMoveForestEnemy);
	const maybeMoveCaveEnemyRef = useRef(maybeMoveCaveEnemy);
	const setForestEnemiesRef = useRef(setForestEnemies);
	const setCaveEnemiesRef = useRef(setCaveEnemies);

	maybeMoveNPCRef.current = maybeMoveNPC;
	maybeMoveBoatRef.current = maybeMoveBoat;
	maybeMoveAnimalRef.current = maybeMoveAnimal;
	maybeMovePetRef.current = maybeMovePet;
	maybeMoveForestEnemyRef.current = maybeMoveForestEnemy;
	maybeMoveCaveEnemyRef.current = maybeMoveCaveEnemy;
	boatNpcKeysRef.current = boatNpcKeys;
	dispatchBatchRef.current = dispatchBatch;
	setForestEnemiesRef.current = setForestEnemies;
	setCaveEnemiesRef.current = setCaveEnemies;
	animalsRef.current = animals;
	pauseGameRef.current = pauseGame;
	townNpcTilesRef.current = townNpcTiles;
	boatTilesRef.current = boatTiles;
	animalTilesRef.current = animalTiles;
	petTileRef.current = petTile;
	petFacingRef.current = petFacing;
	townNpcNamesRef.current = townNpcNames;

	useEffect(() => {
		const interval = window.setInterval(() => {
			if (pauseGameRef.current) return;

			const currentTownNpcTiles = townNpcTilesRef.current;
			const currentBoatTiles = boatTilesRef.current;
			const currentAnimalTiles = animalTilesRef.current;
			const currentAnimals = animalsRef.current;
			const currentPetTile = petTileRef.current;
			const currentPetFacing = petFacingRef.current;
			const currentTownNpcNames = townNpcNamesRef.current;

			const nextTownNpcTiles = { ...currentTownNpcTiles };
			Object.keys(currentTownNpcNames).forEach((npcKey) => {
				maybeMoveNPCRef.current(npcKey, nextTownNpcTiles);
			});
			const townChanged = Object.keys(currentTownNpcTiles).some((k) => {
				const prev = currentTownNpcTiles[k];
				const next = nextTownNpcTiles[k];
				return !!prev && !!next && !equalPoint(prev, next);
			});

			const nextBoatTiles = { ...currentBoatTiles };
			boatNpcKeysRef.current.forEach((boatKey) => {
				maybeMoveBoatRef.current(boatKey, nextBoatTiles);
			});
			const boatChanged = boatNpcKeysRef.current.some((k) => {
				const prev = currentBoatTiles[k];
				const next = nextBoatTiles[k];
				return !!prev && !!next && !equalPoint(prev, next);
			});

			const nextAnimalTiles = { ...currentAnimalTiles };
			currentAnimals.forEach((a) => {
				maybeMoveAnimalRef.current(a.id, nextAnimalTiles);
			});
			const animalChanged = Object.keys(nextAnimalTiles).some((k) => {
				const prev = currentAnimalTiles[Number(k)];
				const next = nextAnimalTiles[Number(k)];
				return !!prev && !!next && !equalPoint(prev, next);
			});

			let nextPetTile = currentPetTile;
			let nextPetFacing = currentPetFacing;
			let petChanged = false;
			let petFacingChanged = false;
			if (currentPetTile && playerRef.current.map === "farm") {
				const candidate = maybeMovePetRef.current(currentPetTile);
				if (!equalPoint(candidate, currentPetTile)) {
					nextPetTile = candidate;
					petChanged = true;
					if (candidate.x < currentPetTile.x && currentPetFacing !== 1) {
						nextPetFacing = 1;
						petFacingChanged = true;
					} else if (candidate.x > currentPetTile.x && currentPetFacing !== -1) {
						nextPetFacing = -1;
						petFacingChanged = true;
					}
				}
			}

			if (dispatchBatchRef.current) {
				if (!townChanged && !boatChanged && !animalChanged && !petChanged && !petFacingChanged)
					return;
				dispatchBatchRef.current({
					townNpcTiles: townChanged ? nextTownNpcTiles : undefined,
					boatTiles: boatChanged ? nextBoatTiles : undefined,
					animalTiles: animalChanged ? nextAnimalTiles : undefined,
					petTile: petChanged ? nextPetTile : undefined,
					petFacing: petFacingChanged ? nextPetFacing : undefined,
				});
				return;
			}

			if (townChanged) setTownNpcTiles(nextTownNpcTiles);
			if (boatChanged) setBoatTiles(nextBoatTiles);
			if (animalChanged) setAnimalTiles(nextAnimalTiles);
			if (petChanged) setPetTile(nextPetTile);
			if (petFacingChanged) setPetFacing(nextPetFacing);
		}, 1000);

		return () => window.clearInterval(interval);
	}, []);

	useEffect(() => {
		const interval = window.setInterval(() => {
			if (pauseGameRef.current) return;
			forestEnemyTickRef.current += 1;
			const isHalfTick = forestEnemyTickRef.current % 2 === 1;
			setForestEnemiesRef.current((prev) => {
				let changed = false;
				const next = prev.map((enemy) => {
					const moved = maybeMoveForestEnemyRef.current(enemy, isHalfTick);
					if (moved !== enemy) changed = true;
					return moved;
				});
				return changed ? next : prev;
			});
		}, 500);
		return () => window.clearInterval(interval);
	}, []);

	useEffect(() => {
		const interval = window.setInterval(() => {
			if (pauseGameRef.current) return;
			caveEnemyTickRef.current += 1;
			const isHalfTick = caveEnemyTickRef.current % 2 === 1;
			setCaveEnemiesRef.current((prev) => {
				let changed = false;
				const next = prev.map((enemy) => {
					const moved = maybeMoveCaveEnemyRef.current(enemy, isHalfTick);
					if (moved !== enemy) changed = true;
					return moved;
				});
				return changed ? next : prev;
			});
		}, 500);
		return () => window.clearInterval(interval);
	}, []);
};
