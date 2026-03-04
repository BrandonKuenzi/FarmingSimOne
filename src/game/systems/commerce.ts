import { randomInt, randomRoll } from "../shared/random";
import type { ItemId, PriceState, SketchyStockEntry, TraderTradeEntry } from "../shared/types";

export type DealBadge =
	| {
			label: string;
			color: string;
			scaleUp: number;
	  }
	| undefined;

export const getSeedSellbackPrice = (price: number) => Math.max(1, Math.floor(price / 2));

export const CORAL_FRUIT_SELL_PRICE = 500;
export const GEM_SELL_PRICES: Record<"diamond" | "emerald" | "ruby", number> = {
	diamond: 2000,
	emerald: 1000,
	ruby: 250,
};

const gemItemPriceById: Partial<Record<ItemId, number>> = {
	diamond: GEM_SELL_PRICES.diamond,
	emerald: GEM_SELL_PRICES.emerald,
	ruby: GEM_SELL_PRICES.ruby,
};

export const getMarketSellPrice = (itemId: ItemId, marketPrice: number): number => {
	if (itemId === "coral_fruit") return CORAL_FRUIT_SELL_PRICE;
	const gemPrice = gemItemPriceById[itemId];
	if (gemPrice !== undefined) return gemPrice;
	if (itemId.endsWith("_seed")) return getSeedSellbackPrice(marketPrice);
	return marketPrice;
};

export const getMarketBasePrice = (itemId: ItemId, baseMarketPrice: number): number => {
	if (itemId === "coral_fruit") return CORAL_FRUIT_SELL_PRICE;
	const gemPrice = gemItemPriceById[itemId];
	if (gemPrice !== undefined) return gemPrice;
	return baseMarketPrice;
};

export const getSketchyPriceMultiplier = () => {
	const roll = randomRoll();
	if (roll < 0.2) return 0.8;
	if (roll < 0.4) return 0.7;
	if (roll < 0.6) return 0.5;
	if (roll < 0.7) return 0.2;
	if (roll < 0.8) return 1.2;
	if (roll < 0.9) return 1.5;
	return 1;
};

const sketchyItemPool: ItemId[] = [
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
	"iron",
	"shell",
	"diamond",
	"emerald",
	"ruby",
];

export const generateSketchyMerchantStock = (marketPrices: PriceState) => {
	const distinct = randomInt(2, 5);
	const chosen = [...sketchyItemPool].sort(() => randomRoll() - 0.5).slice(0, distinct);
	return chosen.map((item) => {
		const basePrice = marketPrices[item];
		const price = Math.max(1, Math.floor(basePrice * getSketchyPriceMultiplier()));
		return {
			item,
			qty: randomInt(1, 10),
			price,
			basePrice,
		} satisfies SketchyStockEntry;
	});
};

const traderItemPool: ItemId[] = [
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
	"iron",
	"shell",
	"coral_fruit",
];

const traderItemTradeCap: Partial<Record<ItemId, number>> = {
	iron: 10,
	pumpkin: 50,
	coral_fruit: 20,
};

export const generateTraderTrades = () => {
	const count = randomInt(3, 5);
	const out: TraderTradeEntry[] = [];
	const used = new Set<string>();
	let attempts = 0;
	while (out.length < count && attempts < 200) {
		attempts += 1;
		const giveItem = traderItemPool[randomInt(0, traderItemPool.length - 1)]!;
		const wantItem = traderItemPool[randomInt(0, traderItemPool.length - 1)]!;
		if (giveItem === wantItem) continue;
		const key = `${wantItem}->${giveItem}`;
		if (used.has(key)) continue;
		const cap = traderItemTradeCap[giveItem] ?? 100;
		out.push({
			id: out.length + 1,
			giveItem,
			wantItem,
			remaining: randomInt(1, cap),
		});
		used.add(key);
	}
	return out;
};

export const getDealBadge = (
	mode: "buy" | "sell",
	currentPrice: number,
	basePrice: number,
): DealBadge => {
	const delta = currentPrice - basePrice;
	if (Math.abs(delta) <= 1) return undefined;

	const isVery = Math.abs(delta) > 5;
	const isGood = mode === "buy" ? currentPrice < basePrice : currentPrice > basePrice;

	if (isGood) {
		return {
			label: isVery ? "Very good deal!" : "Good deal",
			color: "#1f7a2d",
			scaleUp: isVery ? 1.1 : 1.05,
		};
	}
	return {
		label: isVery ? "Very bad deal!" : "Bad deal",
		color: "#a02020",
		scaleUp: isVery ? 1.1 : 1.05,
	};
};
