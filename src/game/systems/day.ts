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
	initialPriceTrends,
	priceItems,
	generatePriceChange,
	randomInt,
}: {
	oldPrices: PriceState;
	initialPriceTrends: PriceTrendState;
	priceItems: ItemId[];
	generatePriceChange: (basePrice: number, randomInt: (min: number, max: number) => number) => number;
	randomInt: (min: number, max: number) => number;
}): {
	newPrices: PriceState;
	newTrends: PriceTrendState;
	changedItems: ItemId[];
} => {
	const newPrices: PriceState = { ...oldPrices };
	const newTrends: PriceTrendState = { ...initialPriceTrends };
	const shuffled = [...priceItems].sort(() => Math.random() - 0.5);
	const changedItems = shuffled.slice(0, Math.min(2, shuffled.length));
	changedItems.forEach((item) => {
		newPrices[item] = Math.max(
			2,
			oldPrices[item] + generatePriceChange(oldPrices[item], randomInt),
		);
		const delta = newPrices[item] - oldPrices[item];
		newTrends[item] = delta > 0 ? 1 : delta < 0 ? -1 : 0;
	});
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
	const showSketchy = Math.random() < 0.25;
	const showTrader = Math.random() < 0.5;
	return {
		showSketchy,
		sketchyStock: showSketchy ? generateSketchyMerchantStock(newPrices) : [],
		showTrader,
		traderTrades: showTrader ? generateTraderTrades() : [],
		doctorVendorActive: Math.random() < 1 / 3,
		petVendorActive: !ownedPet && !deliveredPet && Math.random() < 0.5,
	};
};
