import {
	gotAllClothesDialog,
	gotAllToolsDialog,
	tractorDeliveryLine,
	vendorGreetings,
} from "../content/dialog";
import {
	animalDefs,
	cropDefs,
	itemIcons,
	itemNames,
	purchasableAnimalTypes,
	standardCropIds,
} from "../content/catalog";
import {
	cafeMenuItems,
	clothingShopItems,
	HEADLAMP_PRICE,
	TRACTOR_IRON_COST,
	TRACTOR_PRICE,
} from "../config/gameplay";
import { GLYPH } from "../config/glyphs";
import { getMarketBasePrice, getMarketSellPrice } from "./commerce";
import {
	TOOL_MAX_LEVEL,
	getToolLevelDescription,
	getToolTierName,
	getToolUpgradeGemCost,
	getToolUpgradeIronCost,
	getToolUpgradePrice,
	toolNames,
} from "./tools";
import type {
	Animal,
	AnimalDef,
	AnimalType,
	CropDef,
	CropId,
	ItemId,
	ToolId,
	ToolLevels,
	UnlockFlags,
	VendorKey,
} from "../shared/types";

type Point = { x: number; y: number };

type VendorContext = {
	key: VendorKey;
	money: number;
	prices: Record<ItemId, number>;
	initialPrices: Record<ItemId, number>;
	inventory: Record<ItemId, number>;
	animals: Animal[];
	animalTiles: Record<number, Point>;
	barnAnimalCap: number;
	ownedWardrobeLooks: string[];
	tools: ToolLevels;
	hasTractor: boolean;
	pendingTractorDelivery: boolean;
	hasHeadlamp: boolean;
	unlockFlags: UnlockFlags;
	randomInt: (min: number, max: number) => number;
	canAfford: (value: number) => boolean;
	applyMoneyDelta: (delta: number) => void;
	updateInventory: (item: ItemId, amount: number) => void;
	speakNpcLine: (line: string) => void;
	addLog: (line: string) => void;
	playBad: () => void;
	playChaChing: () => void;
	closeMenu: () => void;
	openMenu: (
		title: string,
		body: string[],
		options: Array<{
			label: string;
			onSelect: () => void;
			info?: string[];
			dealMeta?: {
				itemId: ItemId;
				mode: "buy" | "sell";
				unitPrice?: number;
				baseUnitPrice?: number;
			};
		}>,
	) => void;
	openQuantityPrompt: (cfg: {
		mode: "buy" | "sell";
		itemLabel: string;
		max: number;
		unitPrice: number;
		onConfirm: (quantity: number) => void;
	}) => void;
	startCafeOrder: (item: {
		name: string;
		price: number;
		stamina: number;
	}) => void;
	countOpenBarnTiles: (occupied: Record<number, Point>) => number;
	nextOpenBarnTile: (occupied: Record<number, Point>) => Point | null;
	setOwnedWardrobeLooks: (updater: (prev: string[]) => string[]) => void;
	setTools: (updater: (prev: ToolLevels) => ToolLevels) => void;
	setPendingTractorDelivery: (value: boolean) => void;
	setHasHeadlamp: (value: boolean) => void;
	setAnimals: (updater: (prev: Animal[]) => Animal[]) => void;
	setAnimalTiles: (
		updater: (prev: Record<number, Point>) => Record<number, Point>,
	) => void;
	setAnimalAnchors: (
		updater: (prev: Record<number, Point>) => Record<number, Point>,
	) => void;
};

const withBack = (closeMenu: () => void) => ({
	label: "Back",
	info: ["Close this shop menu."],
	onSelect: closeMenu,
});

const speakVendorGreeting = (
	randomInt: (min: number, max: number) => number,
	speakNpcLine: (line: string) => void,
) => {
	const line = vendorGreetings[randomInt(0, vendorGreetings.length - 1)]!;
	speakNpcLine(line);
};

export const interactVendorMenu = (ctx: VendorContext): boolean => {
	const {
		key,
		money,
		prices,
		initialPrices,
		inventory,
		animals,
		animalTiles,
		barnAnimalCap,
		ownedWardrobeLooks,
		tools,
		hasTractor,
		pendingTractorDelivery,
		hasHeadlamp,
		unlockFlags,
		randomInt,
		canAfford,
		applyMoneyDelta,
		updateInventory,
		speakNpcLine,
		addLog,
		playBad,
		playChaChing,
		closeMenu,
		openMenu,
		openQuantityPrompt,
		startCafeOrder,
		countOpenBarnTiles,
		nextOpenBarnTile,
		setOwnedWardrobeLooks,
		setTools,
		setPendingTractorDelivery,
		setHasHeadlamp,
		setAnimals,
		setAnimalTiles,
		setAnimalAnchors,
	} = ctx;

	if (key === "seed_vendor") {
		const cropList = standardCropIds.map((cropId) => [
			cropId,
			cropDefs[cropId],
		]) as [CropId, CropDef][];
		speakVendorGreeting(randomInt, speakNpcLine);
		openMenu(
			"Seed Vendor",
			["Buy seeds."],
			[
				...cropList.map(([, c]) => ({
					label: `${c.name} Seed $${prices[c.seedItem]}`,
					info: [
						`Seed Cost: $${prices[c.seedItem]}`,
						`Grow Time: ${c.growDays} day${c.growDays === 1 ? "" : "s"}`,
						`Harvest: ${itemNames[c.harvestItem]}`,
						`Current Sell Value: $${prices[c.harvestItem]}`,
					],
					dealMeta: {
						itemId: c.seedItem,
						mode: "buy" as const,
					},
					onSelect: () => {
						const p = prices[c.seedItem];
						openQuantityPrompt({
							mode: "buy",
							itemLabel: `${c.name} Seed`,
							max: Math.floor(money / p),
							unitPrice: p,
							onConfirm: (quantity) => {
								applyMoneyDelta(-p * quantity);
								updateInventory(c.seedItem, quantity);
								playChaChing();
								addLog(`Bought ${c.name} Seed x${quantity}.`);
							},
						});
					},
				})),
				withBack(closeMenu),
			],
		);
		return true;
	}

	if (key === "feed_vendor") {
		speakVendorGreeting(randomInt, speakNpcLine);
		openMenu(
			"Feed Vendor",
			["Animal feed for sale."],
			[
				{
					label: `Buy Feed $${prices.feed}`,
					info: [
						`Cost: $${prices.feed}`,
						"Use feed on animals daily.",
						"Fed animals produce goods next day.",
					],
					dealMeta: {
						itemId: "feed",
						mode: "buy" as const,
					},
					onSelect: () => {
						openQuantityPrompt({
							mode: "buy",
							itemLabel: "Animal Feed",
							max: Math.floor(money / prices.feed),
							unitPrice: prices.feed,
							onConfirm: (quantity) => {
								applyMoneyDelta(-prices.feed * quantity);
								updateInventory("feed", quantity);
								playChaChing();
								addLog(`Bought feed x${quantity}.`);
							},
						});
					},
				},
				withBack(closeMenu),
			],
		);
		return true;
	}

	if (key === "animal_vendor") {
		const openBarnSlots = Math.min(
			Math.max(0, barnAnimalCap - animals.length),
			countOpenBarnTiles(animalTiles),
		);
		if (openBarnSlots <= 0) {
			const line = "Your barn is full right now.";
			speakNpcLine(line);
			addLog(line);
			return true;
		}
		const animalsForSale = purchasableAnimalTypes.map((type) => [
			type,
			animalDefs[type],
		]) as [AnimalType, AnimalDef][];
		speakVendorGreeting(randomInt, speakNpcLine);
		openMenu(
			"Animal Vendor",
			["Animals for your barn."],
			[
				...animalsForSale.map(([type, def]) => ({
					label: `${def.name} $${def.buyPrice}`,
					info: [
						`Buy Cost: $${def.buyPrice}`,
						`Produces Daily (if fed): ${itemNames[def.productItem]}`,
						`Current Sell Value: $${prices[def.productItem]}`,
					],
					onSelect: () => {
						const capacityRemaining = Math.max(
							0,
							barnAnimalCap - animals.length,
						);
						const openSlots = Math.min(
							capacityRemaining,
							countOpenBarnTiles(animalTiles),
						);
						openQuantityPrompt({
							mode: "buy",
							itemLabel: def.name,
							max: Math.min(Math.floor(money / def.buyPrice), openSlots),
							unitPrice: def.buyPrice,
							onConfirm: (quantity) => {
								applyMoneyDelta(-def.buyPrice * quantity);
								const newAnimals: Animal[] = [];
								const newTileEntries: [number, Point][] = [];
								let nextId = Math.max(0, ...animals.map((a) => a.id)) + 1;
								const occupied = { ...animalTiles };
								for (let i = 0; i < quantity; i += 1) {
									const spawn = nextOpenBarnTile(occupied);
									if (!spawn) break;
									occupied[nextId] = spawn;
									newAnimals.push({
										id: nextId,
										type,
										fedToday: false,
										canProduceToday: false,
										hasProductReady: false,
									});
									newTileEntries.push([nextId, spawn]);
									nextId += 1;
								}
								setAnimals((prev) => [...prev, ...newAnimals]);
								setAnimalTiles((prev) => ({
									...prev,
									...Object.fromEntries(newTileEntries),
								}));
								setAnimalAnchors((prev) => ({
									...prev,
									...Object.fromEntries(newTileEntries),
								}));
								playChaChing();
								addLog(`Bought ${def.name} x${newAnimals.length}.`);
							},
						});
					},
				})),
				withBack(closeMenu),
			],
		);
		return true;
	}

	if (key === "clothing_vendor") {
		const availableLooks = clothingShopItems.filter(
			(item) => !ownedWardrobeLooks.includes(item.look),
		);
		if (availableLooks.length === 0) {
			const line =
				gotAllClothesDialog[randomInt(0, gotAllClothesDialog.length - 1)]!;
			speakNpcLine(line);
			addLog(line);
			return true;
		}
		speakVendorGreeting(randomInt, speakNpcLine);
		openMenu(
			"Clothing Vendor",
			["Fresh outfits and questionable style choices."],
			[
				...availableLooks.map((item) => ({
					label: `${item.look} Outfit ($${item.price})`,
					info: [`Price: $${item.price}`, "Buy this look for your wardrobe."],
					onSelect: () => {
						if (!canAfford(item.price)) {
							playBad();
							addLog("Not enough money for that outfit.");
							closeMenu();
							return;
						}
						applyMoneyDelta(-item.price);
						setOwnedWardrobeLooks((prev) => [...prev, item.look]);
						playChaChing();
						addLog(`Bought outfit ${item.look}.`);
						closeMenu();
					},
				})),
				withBack(closeMenu),
			],
		);
		return true;
	}

	if (key === "tool_vendor") {
		const toolOrder: ToolId[] = [
			"hoe",
			"wateringCan",
			"milkingGloves",
			"shears",
			"fishingRod",
			"smashAxe",
		];
		const upgradableTools = toolOrder.filter(
			(toolId) => tools[toolId] < TOOL_MAX_LEVEL,
		);
		const tractorAvailable = !hasTractor && !pendingTractorDelivery;
		const headlampUnlocked = unlockFlags.headlampVendorStock;
		const headlampAvailable = !hasHeadlamp && headlampUnlocked;
		const headlampLocked = !hasHeadlamp && !headlampUnlocked;
		if (
			upgradableTools.length === 0 &&
			!tractorAvailable &&
			!headlampAvailable &&
			!headlampLocked
		) {
			const line =
				gotAllToolsDialog[randomInt(0, gotAllToolsDialog.length - 1)]!;
			speakNpcLine(line);
			addLog(line);
			return true;
		}
		speakVendorGreeting(randomInt, speakNpcLine);
		openMenu(
			"Tool Vendor",
			["Upgrade your tools to improve farm efficiency."],
			[
				...upgradableTools.map((toolId) => {
					const level = tools[toolId];
					const atMax = level >= TOOL_MAX_LEVEL;
					const nextLevel = Math.min(level + 1, TOOL_MAX_LEVEL);
					const price = getToolUpgradePrice(toolId, nextLevel);
					const ironCost = getToolUpgradeIronCost(toolId, nextLevel);
					const gemCost = getToolUpgradeGemCost(toolId, nextLevel);
					const inlineIronLabel =
						ironCost > 0 ? ` + ${GLYPH.rock}x${ironCost}` : "";
					const inlineGemLabel = gemCost
						? ` + ${itemIcons[gemCost.item]}x${gemCost.qty}`
						: "";
					return {
						label: atMax
							? `${getToolTierName(level)} ${toolNames[toolId]} (MAX)`
							: level <= 0
								? `Buy ${getToolTierName(nextLevel)} ${toolNames[toolId]} ($${price})`
								: `Upgrade to ${getToolTierName(nextLevel)} ${toolNames[toolId]} ($${price}${inlineIronLabel}${inlineGemLabel})`,
						info: [
							getToolLevelDescription(toolId, nextLevel),
							...(atMax ? ["Already at maximum level."] : []),
						],
						onSelect: () => {
							if (atMax) {
								addLog(`${toolNames[toolId]} is already max level.`);
								closeMenu();
								return;
							}
							if (!canAfford(price)) {
								playBad();
								addLog("Not enough money for that upgrade.");
								closeMenu();
								return;
							}
							if (inventory.iron < ironCost) {
								playBad();
								addLog("Not enough iron for that upgrade.");
								closeMenu();
								return;
							}
							if (gemCost && inventory[gemCost.item] < gemCost.qty) {
								playBad();
								addLog(
									`Not enough ${itemNames[gemCost.item]} for that upgrade.`,
								);
								closeMenu();
								return;
							}
							applyMoneyDelta(-price);
							if (ironCost > 0) updateInventory("iron", -ironCost);
							if (gemCost) updateInventory(gemCost.item, -gemCost.qty);
							setTools((prev) => ({ ...prev, [toolId]: nextLevel }));
							playChaChing();
							addLog(
								level <= 0
									? `Bought ${getToolTierName(nextLevel)} ${toolNames[toolId]}.`
									: `${toolNames[toolId]} upgraded to ${getToolTierName(nextLevel)}.`,
							);
							closeMenu();
						},
					};
				}),
				...(tractorAvailable
					? [
							{
								label: `Buy Tractor ${GLYPH.tractor} ($${TRACTOR_PRICE} + ${GLYPH.rock}x${TRACTOR_IRON_COST})`,
								info: [
									"A farm tractor with no upgrades.",
									"Delivered tomorrow to your driveway.",
								],
								onSelect: () => {
									if (!canAfford(TRACTOR_PRICE)) {
										playBad();
										addLog("Not enough money for that tractor.");
										closeMenu();
										return;
									}
									if (inventory.iron < TRACTOR_IRON_COST) {
										playBad();
										addLog("Not enough iron for that tractor.");
										closeMenu();
										return;
									}
									applyMoneyDelta(-TRACTOR_PRICE);
									updateInventory("iron", -TRACTOR_IRON_COST);
									setPendingTractorDelivery(true);
									playChaChing();
									closeMenu();
									speakNpcLine(tractorDeliveryLine);
									addLog(tractorDeliveryLine);
								},
							},
						]
					: []),
				...(headlampAvailable
					? [
							{
								label: `Buy Headlamp ${GLYPH.bulb} ($${HEADLAMP_PRICE})`,
								info: ["A cave and forest visibility booster."],
								onSelect: () => {
									if (!canAfford(HEADLAMP_PRICE)) {
										playBad();
										addLog("Not enough money for that headlamp.");
										closeMenu();
										return;
									}
									applyMoneyDelta(-HEADLAMP_PRICE);
									setHasHeadlamp(true);
									playChaChing();
									addLog("Bought Headlamp.");
									closeMenu();
								},
							},
						]
					: []),
				...(headlampLocked
					? [
							{
								label: "???", // This is not a corrupted emoji. I actually want question marks here
								info: ["Unlocks after reaching Forest Lv5 or Cave Lv5."],
								onSelect: () => {
									playBad();
									addLog("Headlamp unlocks at Forest Lv5 or Cave Lv5.");
									closeMenu();
								},
							},
						]
					: []),
				withBack(closeMenu),
			],
		);
		return true;
	}

	if (key === "cafe_vendor") {
		speakVendorGreeting(randomInt, speakNpcLine);
		openMenu(
			"Cafe",
			["Order food and recover stamina."],
			[
				...cafeMenuItems.map((item) => ({
					label: `${item.name} $${item.price} (+${item.stamina} stamina)`,
					info: [
						`Price: $${item.price}`,
						`Stamina: +${item.stamina}`,
						"Freshly prepared. Please wait while we cook.",
					],
					onSelect: () => {
						if (!canAfford(item.price)) {
							playBad();
							addLog("Not enough money for that order.");
							closeMenu();
							return;
						}
						applyMoneyDelta(-item.price);
						startCafeOrder(item);
					},
				})),
				withBack(closeMenu),
			],
		);
		return true;
	}

	if (key === "market") {
		const sellables: ItemId[] = [
			"turnip_seed",
			"carrot_seed",
			"pumpkin_seed",
			"corn_seed",
			"turnip",
			"carrot",
			"pumpkin",
			"corn",
			"milk",
			"wool",
			"egg",
			"fish",
			"shell",
			"diamond",
			"emerald",
			"ruby",
			"coral_fruit",
		];
		const options = sellables
			.filter((id) => inventory[id] > 0)
			.map((id) => {
				const unitPrice = getMarketSellPrice(id, prices[id]);
				const baseUnitPrice = getMarketBasePrice(id, initialPrices[id]);
				return {
					label: `Sell ${itemNames[id]} ($${unitPrice})`,
					info: [
						`You have: ${inventory[id]}`,
						`Sell Price: $${unitPrice} each`,
						`Item: ${itemNames[id]}`,
					],
					dealMeta: {
						itemId: id,
						mode: "sell" as const,
						unitPrice,
						baseUnitPrice,
					},
					onSelect: () => {
						openQuantityPrompt({
							mode: "sell",
							itemLabel: itemNames[id],
							max: inventory[id],
							unitPrice,
							onConfirm: (quantity) => {
								updateInventory(id, -quantity);
								applyMoneyDelta(unitPrice * quantity);
								playChaChing();
								addLog(`Sold ${itemNames[id]} x${quantity}.`);
							},
						});
					},
				};
			});
		speakVendorGreeting(randomInt, speakNpcLine);
		openMenu(
			"Supermarket",
			["I buy local goods."],
			[...options, withBack(closeMenu)],
		);
		return true;
	}

	return false;
};
