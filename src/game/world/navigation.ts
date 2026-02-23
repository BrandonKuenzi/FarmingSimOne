import {
	CAVE_GATE_Y,
	FARM_HEIGHT,
	FARM_WIDTH,
	FOREST_GATE_Y,
	SOUTH_GATE_X1,
	SOUTH_GATE_X2,
} from "./layout";
import type { Door, MapId, VendorKey } from "../shared/types";

export const vendorShopMapByKey: Record<VendorKey, MapId> = {
	seed_vendor: "seed_shop",
	feed_vendor: "feed_shop",
	animal_vendor: "animal_shop",
	market: "market_shop",
	tool_vendor: "tool_shop",
	clothing_vendor: "clothing_shop",
	cafe_vendor: "cafe_shop",
};

export const vendorByShopMap: Partial<Record<MapId, VendorKey>> = Object.fromEntries(
	Object.entries(vendorShopMapByKey).map(([k, v]) => [v, k as VendorKey]),
) as Partial<Record<MapId, VendorKey>>;

export const isShopMap = (
	mapId: MapId,
): mapId is Exclude<MapId, "farm" | "house" | "barn" | "town" | "forest" | "cave"> =>
	mapId in vendorByShopMap;

export const doors: Record<MapId, Door[]> = {
	farm: [
		{
			x: 7,
			y: 7,
			target: { map: "house", x: 7, y: 4 },
			label: "Farmhouse Door",
		},
		{
			x: SOUTH_GATE_X1,
			y: FARM_HEIGHT - 1,
			target: { map: "town", x: SOUTH_GATE_X1, y: 1 },
			label: "South Path",
		},
		{
			x: SOUTH_GATE_X2,
			y: FARM_HEIGHT - 1,
			target: { map: "town", x: SOUTH_GATE_X2, y: 1 },
			label: "South Path",
		},
		{
			x: FARM_WIDTH - 1,
			y: FOREST_GATE_Y,
			target: { map: "forest", x: 1, y: FOREST_GATE_Y },
			label: "Forest Entrance",
		},
		{
			x: FARM_WIDTH - 1,
			y: FOREST_GATE_Y + 1,
			target: { map: "forest", x: 1, y: FOREST_GATE_Y + 1 },
			label: "Forest Entrance",
		},
		{
			x: 0,
			y: CAVE_GATE_Y,
			target: { map: "cave", x: FARM_WIDTH - 2, y: CAVE_GATE_Y },
			label: "Cave Entrance",
		},
		{
			x: 0,
			y: CAVE_GATE_Y + 1,
			target: { map: "cave", x: FARM_WIDTH - 2, y: CAVE_GATE_Y + 1 },
			label: "Cave Entrance",
		},
	],
	house: [{ x: 7, y: 5, target: { map: "farm", x: 7, y: 8 }, label: "Exit House" }],
	barn: [],
	town: [
		{
			x: SOUTH_GATE_X1,
			y: 0,
			target: { map: "farm", x: SOUTH_GATE_X1, y: FARM_HEIGHT - 2 },
			label: "Road to Farm",
		},
		{
			x: SOUTH_GATE_X2,
			y: 0,
			target: { map: "farm", x: SOUTH_GATE_X2, y: FARM_HEIGHT - 2 },
			label: "Road to Farm",
		},
		{
			x: 8,
			y: 7,
			target: { map: "seed_shop", x: 7, y: 6 },
			label: "Seed Shop",
		},
		{
			x: 15,
			y: 7,
			target: { map: "feed_shop", x: 7, y: 6 },
			label: "Feed Shop",
		},
		{
			x: 22,
			y: 7,
			target: { map: "animal_shop", x: 7, y: 6 },
			label: "Animal Shop",
		},
		{
			x: 33,
			y: 7,
			target: { map: "tool_shop", x: 7, y: 6 },
			label: "Tool Shop",
		},
		{
			x: 39,
			y: 7,
			target: { map: "clothing_shop", x: 7, y: 6 },
			label: "Clothing Shop",
		},
		{ x: 45, y: 7, target: { map: "cafe_shop", x: 7, y: 6 }, label: "Cafe" },
		{
			x: 51,
			y: 7,
			target: { map: "market_shop", x: 7, y: 6 },
			label: "Market",
		},
	],
	seed_shop: [{ x: 7, y: 7, target: { map: "town", x: 8, y: 8 }, label: "Exit" }],
	feed_shop: [{ x: 7, y: 7, target: { map: "town", x: 15, y: 8 }, label: "Exit" }],
	animal_shop: [{ x: 7, y: 7, target: { map: "town", x: 22, y: 8 }, label: "Exit" }],
	market_shop: [{ x: 7, y: 7, target: { map: "town", x: 51, y: 8 }, label: "Exit" }],
	tool_shop: [{ x: 7, y: 7, target: { map: "town", x: 33, y: 8 }, label: "Exit" }],
	clothing_shop: [{ x: 7, y: 7, target: { map: "town", x: 39, y: 8 }, label: "Exit" }],
	cafe_shop: [{ x: 7, y: 7, target: { map: "town", x: 45, y: 8 }, label: "Exit" }],
	forest: [],
	cave: [],
};
