import type {
	ProgressAlgorithmId,
	ProgressAlgorithmStoneDef,
} from "../shared/types";

export const progressAlgorithmStones: ProgressAlgorithmStoneDef[] = [
	{ id: "add_1", name: "+1 Stone", rarity: "common", description: "Adds +1." },
	{ id: "add_2", name: "+2 Stone", rarity: "common", description: "Adds +2." },
	{
		id: "add_3",
		name: "+3 Stone",
		rarity: "uncommon",
		description: "Adds +3.",
	},
	{
		id: "add_5",
		name: "+5 Stone",
		rarity: "uncommon",
		description: "Adds +5.",
	},
	{
		id: "add_diamond_count",
		name: "Diamond Count Stone",
		rarity: "uncommon",
		description: "Adds number of diamonds in inventory.",
	},
	{
		id: "add_barn_tier",
		name: "Barn Tier Stone",
		rarity: "uncommon",
		description: "Adds current barn tier.",
	},
	{
		id: "add_tier5_tools",
		name: "Tier 5 Tool Stone",
		rarity: "rare",
		description: "Adds number of tier-5 tools.",
	},
	{
		id: "mul_1_25",
		name: "x1.25 Stone",
		rarity: "uncommon",
		description: "Multiplies by 1.25.",
	},
	{
		id: "mul_1_5",
		name: "x1.5 Stone",
		rarity: "uncommon",
		description: "Multiplies by 1.5.",
	},
	{ id: "mul_2", name: "x2 Stone", rarity: "rare", description: "Multiplies by 2." },
	{
		id: "mul_donated_fish_count",
		name: "Donated Fish Multiplier Stone",
		rarity: "legendary",
		description: "Multiplies by donated fish count.",
	},
	{
		id: "add_cow_count",
		name: "Cow Count Stone",
		rarity: "legendary",
		description: "Adds number of cows owned.",
	},
	{
		id: "add_sheep_count",
		name: "Sheep Count Stone",
		rarity: "legendary",
		description: "Adds number of sheep owned.",
	},
	{
		id: "add_chicken_count",
		name: "Chicken Count Stone",
		rarity: "legendary",
		description: "Adds number of chickens owned.",
	},
	{
		id: "add_crop_count",
		name: "Crop Count Stone",
		rarity: "legendary",
		description: "Adds number of currently planted crops.",
	},
	{
		id: "add_highest_forest_level",
		name: "Forest Depth Record Stone",
		rarity: "legendary",
		description: "Adds highest reached forest level.",
	},
	{
		id: "add_highest_cave_level",
		name: "Cave Depth Record Stone",
		rarity: "legendary",
		description: "Adds highest reached cave level.",
	},
];

export const progressAlgorithmStoneIds = progressAlgorithmStones.map(
	(stone) => stone.id,
);

export const makeEmptyProgressAlgorithmCounts = (): Record<
	ProgressAlgorithmId,
	number
> =>
	Object.fromEntries(progressAlgorithmStoneIds.map((id) => [id, 0])) as Record<
		ProgressAlgorithmId,
		number
	>;

