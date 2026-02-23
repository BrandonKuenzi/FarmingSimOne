import type {
	Animal,
	ItemId,
	Plot,
	PriceState,
	PriceTrendState,
	SketchyStockEntry,
	TraderTradeEntry,
	WeatherId,
} from "../shared/types";
import { randomRoll } from "../shared/random";

export const advancePlotsForNewDay = (
	prevPlots: Record<string, Plot>,
	nextWeather: WeatherId,
): Record<string, Plot> => {
	const out: Record<string, Plot> = {};
	Object.entries(prevPlots).forEach(([key, plot]) => {
		if (!plot.crop) {
			out[key] = { ...plot, watered: false };
			return;
		}
		out[key] = {
			...plot,
			growthDays: plot.growthDays + (plot.watered ? 1 : 0),
			watered: nextWeather === "rainy" && !!plot.crop,
		};
	});
	return out;
};

export const resetAnimalsForNewDay = (animals: Animal[]): Animal[] =>
	animals.map((animal) => ({
		...animal,
		hasProductReady: animal.type === "chicken" ? false : animal.fedToday,
		canProduceToday: animal.fedToday,
		fedToday: false,
	}));

export const rollDailyMarketState = ({
	oldPrices,
	defaultPrices,
	initialPriceTrends,
	priceItems,
	randomInt,
}: {
	oldPrices: PriceState;
	defaultPrices: PriceState;
	initialPriceTrends: PriceTrendState;
	priceItems: ItemId[];
	randomInt: (min: number, max: number) => number;
}): {
	newPrices: PriceState;
	newTrends: PriceTrendState;
	changedItems: ItemId[];
} => {
	const deltaMultipliers = [1, 1, 1, 1, 1.2, 1.5, 2] as const;
	const rollDeltaSize = (defaultPrice: number) => {
		const percent = randomInt(1, 20);
		const multiplier =
			deltaMultipliers[randomInt(0, deltaMultipliers.length - 1)] ?? 1;
		return Math.max(1, Math.round((defaultPrice * percent * multiplier) / 100));
	};
	const newPrices: PriceState = { ...oldPrices };
	const newTrends: PriceTrendState = { ...initialPriceTrends };
	const actuallyChangedItems: ItemId[] = [];
	const deltaByItem: Partial<Record<ItemId, number>> = {};
	const forceChange = (item: ItemId) => {
		const oldPrice = newPrices[item];
		const defaultPrice = defaultPrices[item];
		const rawDelta = rollDeltaSize(defaultPrice);
		const direction: -1 | 1 = oldPrice <= 2 ? 1 : randomRoll() < 0.5 ? -1 : 1;
		const nextPrice = Math.max(2, oldPrice + rawDelta * direction);
		const delta = nextPrice - oldPrice;
		newPrices[item] = nextPrice;
		newTrends[item] = delta > 0 ? 1 : delta < 0 ? -1 : 0;
		deltaByItem[item] = delta;
		if (delta !== 0 && !actuallyChangedItems.includes(item)) {
			actuallyChangedItems.push(item);
		}
	};
	priceItems.forEach((item) => {
		const oldPrice = oldPrices[item];
		const defaultPrice = defaultPrices[item];
		if (randomRoll() < 0.5) {
			newTrends[item] = 0;
			return;
		}
		const moveTowardDefault = randomRoll() < 0.75;
		let direction: -1 | 1;
		if (oldPrice === defaultPrice) {
			direction = randomRoll() < 0.5 ? -1 : 1;
		} else if (moveTowardDefault) {
			direction = oldPrice < defaultPrice ? 1 : -1;
		} else {
			direction = oldPrice < defaultPrice ? -1 : 1;
		}
		const rawDelta = rollDeltaSize(defaultPrice);
		let nextPrice = oldPrice + rawDelta * direction;
		if (moveTowardDefault) {
			if (direction > 0) {
				nextPrice = Math.min(nextPrice, defaultPrice);
			} else {
				nextPrice = Math.max(nextPrice, defaultPrice);
			}
		}
		nextPrice = Math.max(2, nextPrice);
		newPrices[item] = nextPrice;
		const delta = nextPrice - oldPrice;
		newTrends[item] = delta > 0 ? 1 : delta < 0 ? -1 : 0;
		deltaByItem[item] = delta;
		if (delta !== 0) {
			actuallyChangedItems.push(item);
		}
	});
	const targetReportedItems = Math.min(2, priceItems.length);
	if (actuallyChangedItems.length < targetReportedItems) {
		const candidates = [...priceItems]
			.filter((item) => !actuallyChangedItems.includes(item))
			.sort(() => randomRoll() - 0.5);
		for (const item of candidates) {
			if (actuallyChangedItems.length >= targetReportedItems) break;
			forceChange(item);
		}
	}
	const changedItems = [...actuallyChangedItems]
		.sort((a, b) => Math.abs((deltaByItem[b] ?? 0)) - Math.abs((deltaByItem[a] ?? 0)))
		.slice(0, targetReportedItems);
	return { newPrices, newTrends, changedItems };
};

export const rollDailyVendorState = ({
	newPrices,
	ownedPet,
	deliveredPet,
	generateSketchyMerchantStock,
	generateTraderTrades,
}: {
	newPrices: PriceState;
	ownedPet: unknown;
	deliveredPet: unknown;
	generateSketchyMerchantStock: (marketPrices: PriceState) => SketchyStockEntry[];
	generateTraderTrades: () => TraderTradeEntry[];
}): {
	showSketchy: boolean;
	sketchyStock: SketchyStockEntry[];
	showTrader: boolean;
	traderTrades: TraderTradeEntry[];
	doctorVendorActive: boolean;
	petVendorActive: boolean;
} => {
	const showSketchy = randomRoll() < 0.25;
	const showTrader = randomRoll() < 0.5;
	return {
		showSketchy,
		sketchyStock: showSketchy ? generateSketchyMerchantStock(newPrices) : [],
		showTrader,
		traderTrades: showTrader ? generateTraderTrades() : [],
		doctorVendorActive: randomRoll() < 1 / 3,
		petVendorActive: !ownedPet && !deliveredPet && randomRoll() < 0.5,
	};
};
