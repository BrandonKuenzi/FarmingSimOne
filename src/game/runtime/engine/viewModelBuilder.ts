import type { GameRuntimeViewModel } from "../../ui/viewModel";
import type { ItemId, ToolLevels } from "../../shared/types";
import { fishItemIds } from "../../content/fishCatalog";

type BuildGameRuntimeViewModelArgs = Omit<
	GameRuntimeViewModel,
	"inventoryRows" | "marketRows" | "toolRows"
> & {
	inventory: Record<ItemId, number>;
	itemIcons: Record<ItemId, string>;
	itemNames: Record<ItemId, string>;
	priceItems: ItemId[];
	priceTrends: Record<ItemId, -1 | 0 | 1>;
	tools: ToolLevels;
};

export const buildGameRuntimeViewModel = (
	args: BuildGameRuntimeViewModelArgs,
): GameRuntimeViewModel => {
	const fishIdSet = new Set<ItemId>(fishItemIds as ItemId[]);
	const {
		inventory,
		itemIcons,
		itemNames,
		priceItems,
		priceTrends,
		prices,
		tools,
		...rest
	} = args;

	const inventoryRows = (Object.keys(inventory) as ItemId[])
		.filter((id) => inventory[id] > 0)
		.map((id) => ({
			id,
			icon: itemIcons[id],
			name: itemNames[id],
			amount: inventory[id],
		}));

	const marketRows = priceItems
		.filter((id) => !fishIdSet.has(id))
		.map((id) => ({
			id,
			name: itemNames[id],
			price: prices[id],
			trend: priceTrends[id],
		}));

	const toolRows = [
		{ id: "hoe", name: "Hoe", level: tools.hoe },
		{ id: "wateringCan", name: "Watering Can", level: tools.wateringCan },
		{ id: "milkingGloves", name: "Milking Gloves", level: tools.milkingGloves },
		{ id: "shears", name: "Shears", level: tools.shears },
		...(tools.fishingRod > 0
			? [{ id: "fishingRod", name: "Fishing Rod", level: tools.fishingRod }]
			: []),
		...(tools.smashAxe > 0
			? [{ id: "smashAxe", name: "Smash Axe", level: tools.smashAxe }]
			: []),
	];

	return {
		...rest,
		prices,
		inventoryRows,
		marketRows,
		toolRows,
	};
};
