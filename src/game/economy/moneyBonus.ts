import type {
	AnimalType,
	IncomeSource,
	MoneyLoadoutRow,
	ToolId,
	ProgressAlgorithmId,
} from "../shared/types";
import {
	countTotalTownNpcFriendshipHearts,
	type StatisticsState,
} from "../statistics/statistics";

export type MoneyBonusState = {
	moneyLoadoutRows: [MoneyLoadoutRow, MoneyLoadoutRow, MoneyLoadoutRow];
	day: number;
	progressStoneAlgorithmCounts: Record<ProgressAlgorithmId, number>;
	inventory: Record<string, number>;
	aquariumDonations: Record<string, boolean>;
	animals: Array<{ type: AnimalType }>;
	plots: Record<string, { crop: string | null }>;
	tools: Record<ToolId, number>;
	barnTier: number;
	highestForestLevelReached: number;
	highestCaveLevelReached: number;
	statistics: StatisticsState;
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
	state: MoneyBonusState,
): number => {
	if (algorithmId === "add_1") return current + 10;
	if (algorithmId === "add_3") return current + 20;
	if (algorithmId === "add_5") return current + 30;
	if (algorithmId === "add_diamond_count")
		return current + 10 * (state.inventory.diamond ?? 0);
	if (algorithmId === "add_barn_tier") return current + 10 * state.barnTier;
	if (algorithmId === "add_tier5_tools")
		return current + 10 * countTier5Tools(state.tools);
	if (algorithmId === "mul_1_25") return current * 1.25;
	if (algorithmId === "mul_1_5") return current * 1.5;
	if (algorithmId === "mul_2") return current * 2;
	if (algorithmId === "mul_10") return current * 10;
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
		return current + Math.max(0, state.highestForestLevelReached) * 10;
	}
	if (algorithmId === "add_highest_cave_level") {
		return current + Math.max(0, state.highestCaveLevelReached) * 10;
	}
	if (algorithmId === "add_friendship_hearts") {
		return current + 20 * countTotalTownNpcFriendshipHearts(state.statistics);
	}
	if (algorithmId === "add_sleepyhead_day") {
		return current + 5 * Math.max(0, state.day);
	}
	if (algorithmId === "add_stone_stone_stone") {
		return current + 10 * (state.progressStoneAlgorithmCounts.add_stone_stone_stone ?? 0);
	}
	return current;
};

const evaluateRowBonus = (
	row: MoneyLoadoutRow,
	baseDelta: number,
	incomeSource: IncomeSource,
	transactionCount: number,
	state: MoneyBonusState,
): number => {
	if (!row.moneyStoneId || row.moneyStoneId !== incomeSource) return 0;
	if (baseDelta <= 0) return 0;
	const safeTxCount = Math.max(1, Math.floor(transactionCount));
	const basePerTransaction = baseDelta / safeTxCount;
	const perTransactionAfterChain = row.algorithmStoneIds.reduce((current, algorithmId) => {
		if (!algorithmId) return current;
		return applyAlgorithm(current, algorithmId, state);
	}, basePerTransaction);
	const roundedPerTransaction = Math.ceil(Math.max(0, perTransactionAfterChain));
	const totalAfterBonus = roundedPerTransaction * safeTxCount;
	return Math.max(0, totalAfterBonus - baseDelta);
};

export const getBonusDelta = (
	baseDelta: number,
	incomeSource: IncomeSource,
	transactionCount: number,
	state: MoneyBonusState,
): number => {
	if (baseDelta <= 0) return 0;
	if (incomeSource === "other" || incomeSource === "debug") return 0;
	return state.moneyLoadoutRows.reduce(
		(total, row) =>
			total +
			evaluateRowBonus(row, baseDelta, incomeSource, transactionCount, state),
		0,
	);
};
