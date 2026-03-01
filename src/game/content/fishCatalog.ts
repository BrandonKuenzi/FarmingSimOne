import fishData from "../../data/fish.json";
import type { FishDefinition, FishItemId } from "../shared/types";

export type FishItemMeta = {
	itemId: FishItemId;
	name: string;
	glyph: string;
	sellPrice: number;
};

const allFish = fishData as FishDefinition[];

export const fishItemCatalog: FishItemMeta[] = allFish.map((fish) => ({
	itemId: fish.id as FishItemId,
	name: fish.name,
	glyph: fish.glyph,
	sellPrice: fish.sellPrice,
}));

export const fishItemIds: FishItemId[] = fishItemCatalog.map((fish) => fish.itemId);

const fishItemById = Object.fromEntries(
	fishItemCatalog.map((fish) => [fish.itemId, fish]),
) as Partial<Record<FishItemId, FishItemMeta>>;

export const getFishItemMetaById = (fishId: string | null): FishItemMeta | null => {
	if (!fishId) return null;
	return fishItemById[fishId as FishItemId] ?? null;
};
