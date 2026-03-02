import type { ProgressTargetId, ProgressTargetStoneDef } from "../shared/types";

export const progressTargetStones: ProgressTargetStoneDef[] = [
	{
		id: "money_gained",
		name: "Profit Stone",
		target: "money_gained",
		rarity: "common",
		description: "Tracks money gains in chunks of $100.",
	},
	{
		id: "fish_caught",
		name: "Fish Stone",
		target: "fish_caught",
		rarity: "common",
		description: "Triggers when fish are caught.",
	},
	{
		id: "forest_depth_advanced",
		name: "Forest Depth Stone",
		target: "forest_depth_advanced",
		rarity: "uncommon",
		description: "Triggers when advancing forest depth.",
	},
	{
		id: "cave_depth_advanced",
		name: "Cave Depth Stone",
		target: "cave_depth_advanced",
		rarity: "uncommon",
		description: "Triggers when advancing cave depth.",
	},
	{
		id: "crop_harvested",
		name: "Harvest Stone",
		target: "crop_harvested",
		rarity: "common",
		description: "Triggers when crops are harvested.",
	},
	{
		id: "animal_fed",
		name: "Feeding Stone",
		target: "animal_fed",
		rarity: "common",
		description: "Triggers when animals are fed.",
	},
	{
		id: "milk_collected",
		name: "Milk Stone",
		target: "milk_collected",
		rarity: "common",
		description: "Triggers when milk is collected.",
	},
	{
		id: "wool_collected",
		name: "Wool Stone",
		target: "wool_collected",
		rarity: "common",
		description: "Triggers when wool is collected.",
	},
	{
		id: "egg_collected",
		name: "Egg Stone",
		target: "egg_collected",
		rarity: "common",
		description: "Triggers when eggs are collected.",
	},
	{
		id: "crop_sold",
		name: "Crop Market Stone",
		target: "crop_sold",
		rarity: "uncommon",
		description: "Triggers when crops are sold.",
	},
	{
		id: "animal_product_sold",
		name: "Barn Market Stone",
		target: "animal_product_sold",
		rarity: "uncommon",
		description: "Triggers when animal products are sold.",
	},
	{
		id: "fish_sold",
		name: "Fish Market Stone",
		target: "fish_sold",
		rarity: "uncommon",
		description: "Triggers when fish are sold.",
	},
	{
		id: "aquarium_donated",
		name: "Donation Stone",
		target: "aquarium_donated",
		rarity: "rare",
		description: "Triggers on aquarium donation.",
	},
];

export const progressTargetStoneIds = progressTargetStones.map((stone) => stone.id);

export const makeEmptyProgressTargetCounts = (): Record<ProgressTargetId, number> =>
	Object.fromEntries(progressTargetStoneIds.map((id) => [id, 0])) as Record<
		ProgressTargetId,
		number
	>;

