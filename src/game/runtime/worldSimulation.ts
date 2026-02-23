import { useEffect } from "react";
import type { ForestEnemy, Point } from "../shared/types";
import type {
	AnimalTileMap,
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
		boatNpcKeys: string[];
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

	useEffect(() => {
		const interval = window.setInterval(() => {
			setTownNpcTiles((prev) => {
				const next = { ...prev };
				Object.keys(townNpcNames).forEach((npcKey) => {
					maybeMoveNPC(npcKey, next);
				});
				return next;
			});
			setBoatTiles((prev) => {
				const next = { ...prev };
				boatNpcKeys.forEach((boatKey) => {
					maybeMoveBoat(boatKey, next);
				});
				return next;
			});
			setAnimalTiles((prev) => {
				const next = { ...prev };
				animals.forEach((a) => {
					maybeMoveAnimal(a.id, next);
				});
				return next;
			});
			setPetTile((prev) => {
				if (!prev || playerRef.current.map !== "farm") return prev;
				const next = maybeMovePet(prev);
				if (next.x < prev.x) setPetFacing(1);
				else if (next.x > prev.x) setPetFacing(-1);
				return next;
			});
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
	]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			forestEnemyTickRef.current += 1;
			const isHalfTick = forestEnemyTickRef.current % 2 === 1;
			setForestEnemies((prev) =>
				prev.map((enemy) => maybeMoveForestEnemy(enemy, isHalfTick)),
			);
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
			setCaveEnemies((prev) =>
				prev.map((enemy) => maybeMoveCaveEnemy(enemy, isHalfTick)),
			);
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
