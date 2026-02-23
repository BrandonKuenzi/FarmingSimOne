import { cropDefs } from "../content/catalog";
import { GEM_SELL_PRICES } from "../systems/commerce";
import { getHoeShape } from "../systems/tools";
import { keyForPos } from "../shared/coords";
import type {
	BarnTier,
	CafeOrderItem,
	Dir,
	Inventory,
	ItemId,
	MapId,
	PriceState,
	PriceTrendState,
} from "../shared/types";
import { collectBeachTiles, type XY } from "../world/beach";
import {
	CAVE_GATE_Y,
	FARM_HEIGHT,
	FARM_WIDTH,
	FOREST_GATE_Y,
	TOWN_SAND_Y,
	getFarmBarnOuterRect,
	mapLayouts,
} from "../world/layout";

export const STARTER_CHEST_POS = { x: 7, y: 8 };
export const TRACTOR_PARK_POS = { x: 14, y: 8 };
export const TRACTOR_PRICE = 10000;
export const TRACTOR_IRON_COST = 50;
export const HEADLAMP_PRICE = 1000;

export const FARM_FOREST_BLOCKER_POSITIONS = [
	{ x: FARM_WIDTH - 2, y: FOREST_GATE_Y },
	{ x: FARM_WIDTH - 2, y: FOREST_GATE_Y + 1 },
];

export const FARM_CAVE_BLOCKER_POSITIONS = [
	{ x: 1, y: CAVE_GATE_Y },
	{ x: 1, y: CAVE_GATE_Y + 1 },
];

export const starterWardrobeLooks = ["🧑‍🌾", "👨‍🌾", "👩‍🌾"] as const;

export const purchasableClassicLooks = [
	"🙂",
	"😎",
	"🥸",
	"👱",
	"🧔",
	"🧑‍🦰",
	"🧑‍🦱",
	"🧑‍🦳",
	"🧑‍🦲",
	"🧓",
	"🙍‍♀️",
	"🙎‍♀️",
	"👩",
	"🧔‍♀️",
	"👩‍🦰",
	"👩‍🦱",
	"👩‍🦳",
	"👩‍🦲",
] as const;

export const purchasableFunnyLooks = [
	"🐸",
	"🐄",
	"🐟",
	"🛸",
	"🐙",
	"🐧",
	"🦊",
	"🐵",
	"🐼",
	"🦖",
	"💡",
] as const;

export const clothingShopItems = [
	...purchasableClassicLooks.map((look) => ({ look, price: 300 })),
	...purchasableFunnyLooks.map((look) => ({ look, price: 1000 })),
] as const;

export const allWardrobeLooks = [
	...starterWardrobeLooks,
	...clothingShopItems.map((item) => item.look),
] as const;

export const shopMaps: Exclude<
	MapId,
	"farm" | "house" | "barn" | "town" | "forest" | "cave"
>[] = [
	"seed_shop",
	"feed_shop",
	"animal_shop",
	"market_shop",
	"tool_shop",
	"clothing_shop",
	"cafe_shop",
];

export const shopDecorForSaleItems: Record<
	Exclude<MapId, "farm" | "house" | "barn" | "town" | "forest" | "cave">,
	string[]
> = {
	seed_shop: ["🌱"],
	feed_shop: ["🧺"],
	animal_shop: ["🐄", "🐑", "🐔"],
	market_shop: ["💵", "💲", "💹", "💰"],
	tool_shop: ["🧰"],
	clothing_shop: ["👕", "👒", "👢", "🧥"],
	cafe_shop: ["☕", "🍔", "🥗", "🍕"],
};

export const shopDecorSlots: Array<{ x: number; y: number }> = [
	{ x: 2, y: 1 },
	{ x: 4, y: 1 },
	{ x: 6, y: 1 },
	{ x: 8, y: 1 },
	{ x: 10, y: 1 },
	{ x: 12, y: 1 },
	{ x: 3, y: 2 },
	{ x: 5, y: 2 },
	{ x: 9, y: 2 },
	{ x: 11, y: 2 },
];

export const cafeCounterPrepDecor: Array<{ x: number; emoji: string }> = [
	{ x: 3, emoji: "🥗" },
	{ x: 5, emoji: "🍕" },
	{ x: 9, emoji: "☕" },
	{ x: 11, emoji: "🍔" },
];

export const priceItems: ItemId[] = [
	"turnip_seed",
	"carrot_seed",
	"pumpkin_seed",
	"corn_seed",
	"turnip",
	"carrot",
	"pumpkin",
	"corn",
	"feed",
	"milk",
	"wool",
	"egg",
	"fish",
	"shell",
];

export const cafeMenuItems: CafeOrderItem[] = [
	{ name: "Coffee", price: 3, stamina: 15 },
	{ name: "Hamburger", price: 8, stamina: 45 },
	{ name: "Salad", price: 7, stamina: 30 },
	{ name: "Pizza", price: 15, stamina: 75 },
];

export const dirDelta: Record<Dir, { dx: number; dy: number }> = {
	up: { dx: 0, dy: -1 },
	down: { dx: 0, dy: 1 },
	left: { dx: -1, dy: 0 },
	right: { dx: 1, dy: 0 },
};

export const getHoeTargets = (
	px: number,
	py: number,
	dir: Dir,
	hoeLevel: number,
): Array<{ x: number; y: number }> => {
	const { width, depth } = getHoeShape(hoeLevel);
	const fwd = dirDelta[dir];
	const perp = { dx: -fwd.dy, dy: fwd.dx };
	const half = Math.floor(width / 2);
	const out: Array<{ x: number; y: number }> = [];
	for (let step = 1; step <= depth; step += 1) {
		for (let offset = -half; offset <= half; offset += 1) {
			out.push({
				x: px + fwd.dx * step + perp.dx * offset,
				y: py + fwd.dy * step + perp.dy * offset,
			});
		}
	}
	return out;
};

export const vendorMenuTitles = new Set([
	"Seed Vendor",
	"Feed Vendor",
	"Animal Vendor",
	"Clothing Vendor",
	"Tool Vendor",
	"Cafe",
	"Supermarket",
	"Sketchy Merchant",
	"Trader",
	"Doctor",
]);

export const townBeachBottleTiles: XY[] = collectBeachTiles(
	mapLayouts.town[TOWN_SAND_Y] ?? "",
	TOWN_SAND_Y,
);

export const makeEmptyInventory = (): Inventory => ({
	turnip_seed: 0,
	carrot_seed: 0,
	pumpkin_seed: 0,
	corn_seed: 0,
	turnip: 0,
	carrot: 0,
	pumpkin: 0,
	corn: 0,
	feed: 0,
	milk: 0,
	wool: 0,
	egg: 0,
	fish: 0,
	iron: 0,
	shell: 0,
	diamond: 0,
	emerald: 0,
	ruby: 0,
	coral_fruit: 0,
});

export const initialPrices: PriceState = {
	turnip_seed: cropDefs.turnip.buyPrice,
	carrot_seed: cropDefs.carrot.buyPrice,
	pumpkin_seed: cropDefs.pumpkin.buyPrice,
	corn_seed: cropDefs.corn.buyPrice,
	turnip: cropDefs.turnip.baseSell,
	carrot: cropDefs.carrot.baseSell,
	pumpkin: cropDefs.pumpkin.baseSell,
	corn: cropDefs.corn.baseSell,
	feed: 8,
	milk: 30,
	wool: 28,
	egg: 16,
	fish: 5,
	iron: 40,
	shell: 10,
	diamond: GEM_SELL_PRICES.diamond,
	emerald: GEM_SELL_PRICES.emerald,
	ruby: GEM_SELL_PRICES.ruby,
	coral_fruit: 500,
};

export const initialPriceTrends: PriceTrendState = {
	turnip_seed: 0,
	carrot_seed: 0,
	pumpkin_seed: 0,
	corn_seed: 0,
	turnip: 0,
	carrot: 0,
	pumpkin: 0,
	corn: 0,
	feed: 0,
	milk: 0,
	wool: 0,
	egg: 0,
	fish: 0,
	iron: 0,
	shell: 0,
	diamond: 0,
	emerald: 0,
	ruby: 0,
	coral_fruit: 0,
};

export const getFarmBarnInteriorBounds = (barnTier: BarnTier) => {
	const { x, y, w, h } = getFarmBarnOuterRect(barnTier);
	return { minX: x + 1, maxX: x + w - 2, minY: y + 1, maxY: y + h - 2 };
};

export const chickenEggOffsets = [
	{ dx: -1, dy: -1 },
	{ dx: 0, dy: -1 },
	{ dx: 1, dy: -1 },
	{ dx: -1, dy: 0 },
	{ dx: 1, dy: 0 },
	{ dx: -1, dy: 1 },
	{ dx: 0, dy: 1 },
	{ dx: 1, dy: 1 },
];

const buildInitialFarmExpansionBlockers = () => {
	const farmRows = mapLayouts.farm;
	const reserved = new Set<string>([
		...FARM_FOREST_BLOCKER_POSITIONS.map((p) => keyForPos(p.x, p.y)),
		...FARM_CAVE_BLOCKER_POSITIONS.map((p) => keyForPos(p.x, p.y)),
	]);
	const wood: Record<string, boolean> = {};
	const stone: Record<string, number> = {};
	const hash2d = (x: number, y: number) => {
		let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) >>> 0;
		h = (h ^ (h >>> 13)) >>> 0;
		h = Math.imul(h, 1274126177) >>> 0;
		return (h ^ (h >>> 16)) >>> 0;
	};
	const keepSparseWood = (x: number, y: number) => (hash2d(x, y) % 100) < 25;
	const keepSparseStone = (x: number, y: number) => (hash2d(x, y) % 100) < 33;
	const canPlace = (x: number, y: number) => {
		if (x < 1 || y < 1 || x >= FARM_WIDTH - 1 || y >= FARM_HEIGHT - 1) return false;
		const key = keyForPos(x, y);
		if (reserved.has(key)) return false;
		return farmRows[y]?.[x] === ",";
	};
	const addWood = (x: number, y: number) => {
		if (!keepSparseWood(x, y) || !canPlace(x, y)) return;
		wood[keyForPos(x, y)] = true;
	};
	const addStone = (x: number, y: number) => {
		if (!keepSparseStone(x, y) || !canPlace(x, y)) return;
		stone[keyForPos(x, y)] = 24;
	};

	for (let x = 37; x <= FARM_WIDTH - 2; x += 1) {
		addWood(x, 10);
		if (x % 3 !== 0) addWood(x, 9);
		if (x % 4 !== 1) addWood(x, 11);
		for (let y = 12; y <= 17; y += 1) {
			if ((x + y) % 3 !== 0) addWood(x, y);
		}
	}

	const centerX = 9;
	const centerY = FARM_HEIGHT - 5;
	for (let y = centerY - 6; y <= FARM_HEIGHT - 2; y += 1) {
		for (let x = 1; x <= 44; x += 1) {
			const dx = (x - centerX) / 16;
			const dy = (y - centerY) / 5;
			if (dx * dx + dy * dy > 1.05) continue;
			if ((x * 13 + y * 7) % 4 === 0 && x > 4) continue;
			addStone(x, y);
		}
	}

	for (let y = Math.max(1, FARM_HEIGHT - 10); y <= FARM_HEIGHT - 2; y += 1) {
		addStone(1, y);
	}
	for (let x = 1; x <= 22; x += 1) {
		addStone(x, FARM_HEIGHT - 2);
	}

	const usedKeys = new Set<string>([...Object.keys(wood), ...Object.keys(stone)]);
	const randomCandidates: Array<{ x: number; y: number }> = [];
	for (let y = 1; y < FARM_HEIGHT - 1; y += 1) {
		for (let x = 1; x < FARM_WIDTH - 1; x += 1) {
			const key = keyForPos(x, y);
			if (usedKeys.has(key) || !canPlace(x, y)) continue;
			randomCandidates.push({ x, y });
		}
	}
	const shuffled = randomCandidates.sort(() => Math.random() - 0.5);
	shuffled.slice(0, 5).forEach(({ x, y }) => {
		stone[keyForPos(x, y)] = 24;
		usedKeys.add(keyForPos(x, y));
	});
	let logsAdded = 0;
	for (const { x, y } of shuffled.slice(5)) {
		if (logsAdded >= 5) break;
		const key = keyForPos(x, y);
		if (usedKeys.has(key)) continue;
		wood[key] = true;
		usedKeys.add(key);
		logsAdded += 1;
	}

	return { wood, stone };
};

export const initialFarmExpansionBlockers = buildInitialFarmExpansionBlockers();
