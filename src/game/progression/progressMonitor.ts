import type {
	AnimalType,
	ProgressAlgorithmId,
	ProgressEventPayload,
	ProgressLoadoutRow,
	ProgressTargetId,
	ToolId,
} from "../shared/types";

const PROGRESS_POINTS_TO_WIN = 1000;

export type ProgressComputationState = {
	progressPercent: number;
	progressWon: boolean;
	progressLoadoutRows: [ProgressLoadoutRow, ProgressLoadoutRow, ProgressLoadoutRow];
	inventory: Record<string, number>;
	aquariumDonations: Record<string, boolean>;
	animals: Array<{ type: AnimalType }>;
	plots: Record<string, { crop: string | null }>;
	tools: Record<ToolId, number>;
	barnTier: number;
	highestForestLevelReached: number;
	highestCaveLevelReached: number;
};

export const makeEmptyProgressLoadoutRows = (): [
	ProgressLoadoutRow,
	ProgressLoadoutRow,
	ProgressLoadoutRow,
] => [
	{
		targetStoneId: null,
		algorithmStoneIds: [null, null, null],
	},
	{
		targetStoneId: null,
		algorithmStoneIds: [null, null, null],
	},
	{
		targetStoneId: null,
		algorithmStoneIds: [null, null, null],
	},
];

const baseValueForEvent = (
	targetId: ProgressTargetId,
	event: ProgressEventPayload,
): number => {
	if (targetId !== event.type) return 0;
	if (event.type === "money_gained") {
		return Math.floor(Math.max(0, event.moneyDelta ?? 0) / 100);
	}
	if (event.type === "aquarium_donated") return 1;
	if (event.type === "forest_depth_advanced") return 1;
	if (event.type === "cave_depth_advanced") return 1;
	return Math.max(0, event.quantity ?? 0);
};

const countOwnedAnimals = (
	animals: Array<{ type: AnimalType }>,
	target: AnimalType,
): number => animals.filter((animal) => animal.type === target).length;

const countPlantedCrops = (plots: Record<string, { crop: string | null }>): number =>
	Object.values(plots).filter((plot) => !!plot.crop).length;

const countTier5Tools = (tools: Record<ToolId, number>): number =>
	(Object.values(tools) as number[]).filter((level) => level >= 5).length;

const countDonatedFish = (aquariumDonations: Record<string, boolean>): number =>
	Object.values(aquariumDonations).filter(Boolean).length;

const applyAlgorithm = (
	current: number,
	algorithmId: ProgressAlgorithmId,
	state: ProgressComputationState,
): number => {
	if (algorithmId === "add_1") return current + 1;
	if (algorithmId === "add_2") return current + 2;
	if (algorithmId === "add_3") return current + 3;
	if (algorithmId === "add_5") return current + 5;
	if (algorithmId === "add_diamond_count") return current + (state.inventory.diamond ?? 0);
	if (algorithmId === "add_barn_tier") return current + state.barnTier;
	if (algorithmId === "add_tier5_tools") return current + countTier5Tools(state.tools);
	if (algorithmId === "mul_1_25") return current * 1.25;
	if (algorithmId === "mul_1_5") return current * 1.5;
	if (algorithmId === "mul_2") return current * 2;
	if (algorithmId === "mul_donated_fish_count") {
		return current * countDonatedFish(state.aquariumDonations);
	}
	if (algorithmId === "add_cow_count") return current + countOwnedAnimals(state.animals, "cow");
	if (algorithmId === "add_sheep_count") {
		return current + countOwnedAnimals(state.animals, "sheep");
	}
	if (algorithmId === "add_chicken_count") {
		return current + countOwnedAnimals(state.animals, "chicken");
	}
	if (algorithmId === "add_crop_count") return current + countPlantedCrops(state.plots);
	if (algorithmId === "add_highest_forest_level") {
		return current + Math.max(0, state.highestForestLevelReached);
	}
	if (algorithmId === "add_highest_cave_level") {
		return current + Math.max(0, state.highestCaveLevelReached);
	}
	return current;
};

const evaluateRowIncrement = (
	state: ProgressComputationState,
	row: ProgressLoadoutRow,
	event: ProgressEventPayload,
): number => {
	if (!row.targetStoneId) return 0;
	const base = baseValueForEvent(row.targetStoneId, event);
	if (base <= 0) return 0;
	const chainResult = row.algorithmStoneIds.reduce((current, algorithmId) => {
		if (!algorithmId) return current;
		return applyAlgorithm(current, algorithmId, state);
	}, base);
	return Math.max(0, Math.floor(chainResult));
};

export const applyProgressEventToState = (
	state: ProgressComputationState,
	event: ProgressEventPayload,
): {
	progressPercent: number;
	progressWon: boolean;
	progressWinPopupShown: boolean;
	increment: number;
} => {
	const increment = state.progressLoadoutRows.reduce(
		(total, row) => total + evaluateRowIncrement(state, row, event),
		0,
	);
	if (increment <= 0) {
		return {
			progressPercent: state.progressPercent,
			progressWon: state.progressWon,
			progressWinPopupShown: false,
			increment: 0,
		};
	}
	const nextProgress = Math.min(
		PROGRESS_POINTS_TO_WIN,
		Math.max(0, state.progressPercent + increment),
	);
	const reachedWinNow = !state.progressWon && nextProgress >= PROGRESS_POINTS_TO_WIN;
	return {
		progressPercent: nextProgress,
		progressWon: state.progressWon || reachedWinNow,
		progressWinPopupShown: reachedWinNow,
		increment,
	};
};
