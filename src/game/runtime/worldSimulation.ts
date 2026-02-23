import { useEffect } from "react";
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

	useEffect(() => {
		const interval = window.setInterval(() => {
			const nextTownNpcTiles = { ...townNpcTiles };
			Object.keys(townNpcNames).forEach((npcKey) => {
				maybeMoveNPC(npcKey, nextTownNpcTiles);
			});
			const townChanged = Object.keys(townNpcTiles).some((k) => {
				const prev = townNpcTiles[k];
				const next = nextTownNpcTiles[k];
				return !!prev && !!next && !equalPoint(prev, next);
			});

			const nextBoatTiles = { ...boatTiles };
			boatNpcKeys.forEach((boatKey) => {
				maybeMoveBoat(boatKey, nextBoatTiles);
			});
			const boatChanged = boatNpcKeys.some((k) => {
				const prev = boatTiles[k];
				const next = nextBoatTiles[k];
				return !!prev && !!next && !equalPoint(prev, next);
			});

			const nextAnimalTiles = { ...animalTiles };
			animals.forEach((a) => {
				maybeMoveAnimal(a.id, nextAnimalTiles);
			});
			const animalChanged = Object.keys(nextAnimalTiles).some((k) => {
				const prev = animalTiles[Number(k)];
				const next = nextAnimalTiles[Number(k)];
				return !!prev && !!next && !equalPoint(prev, next);
			});

			let nextPetTile = petTile;
			let nextPetFacing = petFacing;
			let petChanged = false;
			let petFacingChanged = false;
			if (petTile && playerRef.current.map === "farm") {
				const candidate = maybeMovePet(petTile);
				if (!equalPoint(candidate, petTile)) {
					nextPetTile = candidate;
					petChanged = true;
					if (candidate.x < petTile.x && petFacing !== 1) {
						nextPetFacing = 1;
						petFacingChanged = true;
					} else if (candidate.x > petTile.x && petFacing !== -1) {
						nextPetFacing = -1;
						petFacingChanged = true;
					}
				}
			}

			if (dispatchBatch) {
				if (!townChanged && !boatChanged && !animalChanged && !petChanged && !petFacingChanged)
					return;
				dispatchBatch({
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
	}, [
		animals,
		farmEggDrops,
		farmForestBlockers,
		farmCaveBlockers,
		petGraveObstacles,
		farmWeedObstacles,
		plots,
		starterChestOpened,
		petVendorActive,
		ownedPet,
		pauseGame,
		townNpcTiles,
		boatTiles,
		animalTiles,
		petTile,
		petFacing,
		setTownNpcTiles,
		setBoatTiles,
		setAnimalTiles,
		setPetTile,
		setPetFacing,
		playerRef,
		maybeMoveNPC,
		maybeMoveBoat,
		maybeMoveAnimal,
		maybeMovePet,
		townNpcNames,
		boatNpcKeys,
		dispatchBatch,
	]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			forestEnemyTickRef.current += 1;
			const isHalfTick = forestEnemyTickRef.current % 2 === 1;
			setForestEnemies((prev) => {
				let changed = false;
				const next = prev.map((enemy) => {
					const moved = maybeMoveForestEnemy(enemy, isHalfTick);
					if (moved !== enemy) changed = true;
					return moved;
				});
				return changed ? next : prev;
			});
		}, 500);
		return () => window.clearInterval(interval);
	}, [
		pauseGame,
		activeMapLayouts,
		forestObstacles,
		forestChest,
		forestBonusChests,
		setForestEnemies,
		maybeMoveForestEnemy,
		forestEnemyTickRef,
	]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			caveEnemyTickRef.current += 1;
			const isHalfTick = caveEnemyTickRef.current % 2 === 1;
			setCaveEnemies((prev) => {
				let changed = false;
				const next = prev.map((enemy) => {
					const moved = maybeMoveCaveEnemy(enemy, isHalfTick);
					if (moved !== enemy) changed = true;
					return moved;
				});
				return changed ? next : prev;
			});
		}, 500);
		return () => window.clearInterval(interval);
	}, [
		pauseGame,
		activeMapLayouts,
		caveObstacles,
		caveLadderPos,
		setCaveEnemies,
		maybeMoveCaveEnemy,
		caveEnemyTickRef,
	]);
};
