import type {
	ProgressAlgorithmId,
	ProgressAlgorithmStoneDef,
} from "../shared/types";

export const progressAlgorithmStones: ProgressAlgorithmStoneDef[] = [
	{ id: "add_1", name: "+10 Stone", rarity: "common", description: "Adds +10." },
	{
		id: "add_3",
		name: "+20 Stone",
		rarity: "common",
		description: "Adds +20.",
	},
	{
		id: "add_5",
		name: "+30 Stone",
		rarity: "uncommon",
		description: "Adds +30.",
	},
	{
		id: "add_diamond_count",
		name: "Diamond Stone",
		rarity: "uncommon",
		description: "Adds +(10 x number of diamonds in inventory).",
	},
	{
		id: "add_barn_tier",
		name: "Barn Stone",
		rarity: "uncommon",
		description: "Adds +(10 x current barn tier).",
	},
	{
		id: "add_tier5_tools",
		name: "Tool Stone",
		rarity: "rare",
		description: "Adds +(10 x number of tier-5 tools).",
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
		id: "mul_10",
		name: "x10 Stone",
		rarity: "legendary",
		description: "Multiplies by 10.",
	},
	{
		id: "mul_donated_fish_count",
		name: "Fish Stone",
		rarity: "legendary",
		description: "Multiplies by donated fish count.",
	},
	{
		id: "add_cow_count",
		name: "Cow Stone",
		rarity: "common",
		description: "Adds number of cows owned.",
	},
	{
		id: "add_sheep_count",
		name: "Sheep Stone",
		rarity: "common",
		description: "Adds number of sheep owned.",
	},
	{
		id: "add_chicken_count",
		name: "Chicken Stone",
		rarity: "common",
		description: "Adds number of chickens owned.",
	},
	{
		id: "add_crop_count",
		name: "Crop Stone",
		rarity: "rare",
		description: "Adds number of currently planted crops.",
	},
	{
		id: "add_highest_forest_level",
		name: "Forest Stone",
		rarity: "rare",
		description: "Adds +(10 x highest reached forest level).",
	},
	{
		id: "add_highest_cave_level",
		name: "Cave Stone",
		rarity: "rare",
		description: "Adds +(10 x highest reached cave level).",
	},
	{
		id: "add_friendship_hearts",
		name: "Friendship Stone",
		rarity: "legendary",
		description: "Adds +(20 x total NPC friendship hearts).",
	},
	{
		id: "add_sleepyhead_day",
		name: "Sleepyhead Stone",
		rarity: "legendary",
		description: "Adds +(5 x current day number).",
	},
	{
		id: "add_stone_stone_stone",
		name: "Stone Stone Stone",
		rarity: "uncommon",
		description: "Adds +(10 x number of Stone Stone Stone stones you own).",
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

