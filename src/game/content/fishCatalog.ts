import fishData from "../../data/fish.json";
import type {
	AquariumFishNpcBehavior,
	FishDefinition,
	FishItemId,
	FishingCategory,
} from "../shared/types";

export type FishItemMeta = {
	itemId: FishItemId;
	name: string;
	glyph: string;
	sellPrice: number;
	category: FishingCategory;
	aquariumNpcBehavior: AquariumFishNpcBehavior;
};

const allFish = fishData as FishDefinition[];

export const fishItemCatalog: FishItemMeta[] = allFish.map((fish) => ({
	itemId: fish.id as FishItemId,
	name: fish.name,
	glyph: fish.glyph,
	sellPrice: fish.sellPrice,
	category: fish.category,
	aquariumNpcBehavior: fish.aquariumNpcBehavior ?? "simple_wander",
}));

export const fishItemIds: FishItemId[] = fishItemCatalog.map((fish) => fish.itemId);

const fishItemById = Object.fromEntries(
	fishItemCatalog.map((fish) => [fish.itemId, fish]),
) as Partial<Record<FishItemId, FishItemMeta>>;

export const getFishItemMetaById = (fishId: string | null): FishItemMeta | null => {
	if (!fishId) return null;
	return fishItemById[fishId as FishItemId] ?? null;
};
