import type { CropId, ItemId, ProgressRarity } from "../shared/types";

export type StatisticsState = {
	counters: Record<string, number>;
};

export const makeEmptyStatisticsState = (): StatisticsState => ({
	counters: {},
});

export const incrementStatisticsState = (
	state: StatisticsState,
	key: string,
	amount = 1,
): StatisticsState => {
	if (amount <= 0) return state;
	const current = state.counters[key] ?? 0;
	return {
		counters: {
			...state.counters,
			[key]: current + amount,
		},
	};
};

export const getStatistic = (state: StatisticsState, key: string): number =>
	state.counters[key] ?? 0;

export const PLAYER_STAT_KEYS = {
	fishCaughtTotal: "fish_caught_total",
	shadyMerchantDollarsSpent: "shady_merchant_dollars_spent",
	traderExchangeValueTotal: "trader_exchange_value_total",
	cowMilkingInteractions: "cow_milking_interactions",
	sheepShearingInteractions: "sheep_shearing_interactions",
	eggsPickedTotal: "eggs_picked_total",
	animalFeedFromGrassTotal: "animal_feed_from_grass_total",
	rockObstaclesDestroyedTotal: "rock_obstacles_destroyed_total",
	woodObstaclesDestroyedTotal: "wood_obstacles_destroyed_total",
	forestLevelsCompleted: "forest_levels_completed",
	caveLevelsCompleted: "cave_levels_completed",
	diamondsFoundTotal: "diamonds_found_total",
	emeraldsFoundTotal: "emeralds_found_total",
	rubiesFoundTotal: "rubies_found_total",
	townNpcUniqueTalksTotal: "town_npc_unique_talks_total",
} as const;

export const makeFishCaughtByTypeKey = (fishItemId: string): string =>
	`fish_caught_by_type:${fishItemId}`;

export const makeCropHarvestedKey = (cropId: CropId): string =>
	`crop_harvested:${cropId}`;

export const makeTownNpcUniqueTalkKey = (npcKey: string): string =>
	`town_npc_unique_talks:${npcKey}`;

export const resolveGemFoundStatKey = (itemId: ItemId): string | null => {
	if (itemId === "diamond") return PLAYER_STAT_KEYS.diamondsFoundTotal;
	if (itemId === "emerald") return PLAYER_STAT_KEYS.emeraldsFoundTotal;
	if (itemId === "ruby") return PLAYER_STAT_KEYS.rubiesFoundTotal;
	return null;
};

export const TRADER_ALGORITHM_STONE_DEFAULT_VALUE_BY_RARITY: Record<
	ProgressRarity,
	number
> = {
	common: 100,
	uncommon: 250,
	rare: 700,
	legendary: 1500,
};

