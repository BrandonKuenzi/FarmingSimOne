import type { MoneyStoneDef, MoneyStoneId, MoneyLoadoutRow } from "../shared/types";

export const progressMoneyStones: MoneyStoneDef[] = [
	{
		id: "loot_box",
		name: "Exploration Money Stone",
		incomeSource: "loot_box",
		rarity: "common",
		description: "Boosts money gained from exploration loot rewards.",
	},
	{
		id: "grass_breaking_award",
		name: "Grass Money Stone",
		incomeSource: "grass_breaking_award",
		rarity: "common",
		description: "Boosts money found while clearing grass and weeds.",
	},
	{
		id: "npc_gift",
		name: "Gift Money Stone",
		incomeSource: "npc_gift",
		rarity: "rare",
		description: "Boosts money gained from NPC gift rewards.",
	},
	{
		id: "milk_sales",
		name: "Milk Money Stone",
		incomeSource: "milk_sales",
		rarity: "common",
		description: "Boosts money from milk sales.",
	},
	{
		id: "wool_sales",
		name: "Wool Money Stone",
		incomeSource: "wool_sales",
		rarity: "common",
		description: "Boosts money from wool sales.",
	},
	{
		id: "egg_sales",
		name: "Egg Money Stone",
		incomeSource: "egg_sales",
		rarity: "common",
		description: "Boosts money from egg sales.",
	},
	{
		id: "crop_sales",
		name: "Crop Money Stone",
		incomeSource: "crop_sales",
		rarity: "uncommon",
		description: "Boosts money from crop sales.",
	},
	{
		id: "gem_sales",
		name: "Gem Money Stone",
		incomeSource: "gem_sales",
		rarity: "rare",
		description: "Boosts money from gem sales.",
	},
	{
		id: "fish_sales",
		name: "Fish Money Stone",
		incomeSource: "fish_sales",
		rarity: "uncommon",
		description: "Boosts money from fish sales.",
	},
];

export const progressMoneyStoneIds = progressMoneyStones.map((stone) => stone.id);

export const makeEmptyMoneyStoneCounts = (): Record<MoneyStoneId, number> =>
	Object.fromEntries(progressMoneyStoneIds.map((id) => [id, 0])) as Record<
		MoneyStoneId,
		number
	>;

export const makeEmptyMoneyLoadoutRows = (): [
	MoneyLoadoutRow,
	MoneyLoadoutRow,
	MoneyLoadoutRow,
] => [
	{
		moneyStoneId: null,
		algorithmStoneIds: [null, null, null],
	},
	{
		moneyStoneId: null,
		algorithmStoneIds: [null, null, null],
	},
	{
		moneyStoneId: null,
		algorithmStoneIds: [null, null, null],
	},
];
