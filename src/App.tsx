import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import bgMusicSrc from "./assets/bgMusic.mp3";
import bgFarmSrc from "./assets/bgFarm.ogg";
import townBGSrc from "./assets/GameBananaFeildloop.mp3";
import beachAmbienceSrc from "./assets/beach.wav";
import chaChingSrc from "./assets/chaching.ogg";
import endOfDaySrc from "./assets/summerDreamBoat.mp3";
import hoeSoundSrc from "./assets/hoe.mp3";
import munchSoundSrc from "./assets/munch.m4a";
import badSoundSrc from "./assets/bad.m4a";
import waterSoundSrc from "./assets/water.m4a";
import yayaSoundSrc from "./assets/yaya.ogg";
import tooTiredSoundSrc from "./assets/imTooTired.m4a";
import cafeOrderMusicSrc from "./assets/SpaceStore.mp3";
import notificationSoundSrc from "./assets/shuffle.m4a";
import forestMusicSrc from "./assets/GameDeepForest.mp3";
import caveMusicSrc from "./assets/CaveTheme.mp3";
import gotRewardSoundSrc from "./assets/gotReward.mp3";
import snakeSoundSrc from "./assets/snake.m4a";
import bearSoundSrc from "./assets/bear.m4a";
import pooSoundSrc from "./assets/poo.m4a";
import bathSoundSrc from "./assets/bath.m4a";
import pluckSoundSrc from "./assets/pluck.m4a";
import ploopSoundSrc from "./assets/ploop.m4a";
import seagullsSoundSrc from "./assets/seagulls.mp3";
import meowSoundSrc from "./assets/meow.m4a";
import woofSoundSrc from "./assets/woof.m4a";
import tractorSoundSrc from "./assets/tractor.wav";
import {
	generateDailyAssignmentsForNpcs,
	generateNpcDialogLine,
	generateNpcGreetingLine,
	generateOverfedAnimalLine,
	type NpcDailyAssignment,
} from "./npcDialogue";
import {
	boatDialogArray,
	cafeWaitingObservations,
	cowHarvestTtsLines,
	doctorFinishedTodayLine,
	doctorGrindingMedicineSpeech,
	doctorIntroLines,
	doctorWaitingObservations,
	dontTouchSketchy,
	gotAllClothesDialog,
	gotAllToolsDialog,
	orderCompleteDialog,
	orderMiddleDialog,
	orderStartedDialog,
	petVendorSoldLine,
	sheepHarvestTtsLines,
	sketchyMerchantIntro,
	sketchyVendorSales,
	townTips,
	traderAfterSaleLines,
	traderBoxLines,
	traderHeliLines,
	traderIntroLines,
	traderSoldOutLines,
	tractorDeliveryLine,
	vendorGreetings,
} from "./game/content/dialog";
import {
	createDayTransitionStars,
	moonPhases,
	nextDayPrompts,
	type DayTransitionStar,
} from "./game/content/dayTransition";
import {
	allPlantableCropIds,
	animalDefs,
	cropDefs,
	highValueChestAnimalTypes,
	isCowLikeAnimal,
	itemIcons,
	itemNames,
	makeSnakeDirections,
	petOptions,
	purchasableAnimalTypes,
	rareCowVariantTypes,
	standardCropIds,
} from "./game/content/catalog";
import { makeGaryBottleMessage } from "./game/content/garyBottle";
import {
	collectBeachTiles,
	rollBeachBottleSpawn,
	rollBeachShellDrops,
	type XY,
} from "./game/world/beach";
import {
	BARN_EXTERIOR_ENTRY_XS,
	BARN_EXTERIOR_ENTRY_Y,
	BARN_MAX_TIER,
	BARN_TIER_NAMES,
	CAVE_GATE_Y,
	FARM_HEIGHT,
	FARM_WIDTH,
	FOREST_GATE_Y,
	TOWN_OCEAN_START_Y,
	TOWN_SAND_Y,
	TOWN_WIDTH,
	buildBarnLayout,
	buildFarmLayout,
	getBarnAnimalCap,
	getBarnInteriorSizeByTier,
	getBarnStructureRect,
	getBarnUpgradeCost,
	getFarmBarnOuterRect,
	isBarnExternal,
	mapLayouts,
	mapTiles,
} from "./game/world/layout";
import { doors, isShopMap, vendorByShopMap, vendorShopMapByKey } from "./game/world/navigation";
import {
	buildCaveRubble,
	generateCaveState,
	generateForestState,
	isCaveBlockedTile,
	isCaveWalkableTile,
	isForestBlockedTile,
	isForestWalkableTile,
	oppositeForestSide,
} from "./game/world/generation";
import { generateDailyNewspaper, generatePriceChange } from "./game/systems/news";
import {
	STAMINA_MAX,
	TOOL_MAX_LEVEL,
	getFishingRodMaxWaitSeconds,
	getFishingRodUiText,
	getHoeShape,
	getRandomCropId,
	getSmashAxeActionCost,
	getSmashAxeIronChance,
	getSmashAxeRockDamage,
	getSmashAxeRockHits,
	getSmashAxeWoodSeedChance,
	getToolActionCost,
	getToolLevelDescription,
	getToolTierName,
	getToolUpgradeGemCost,
	getToolUpgradeIronCost,
	getToolUpgradePrice,
	getWaterCapacity,
	initialToolLevels,
	rollLivestockYield,
	toolNames,
} from "./game/systems/tools";
import type {
	Animal,
	AnimalDef,
	AnimalType,
	BarnTier,
	CafeOrderItem,
	CaveGenerationResult,
	CloudSprite,
	CropDef,
	CropId,
	DayTransitionState,
	Dir,
	FishingState,
	ForestChest,
	ForestEnemy,
	ForestEnemyType,
	ForestGenConfig,
	ForestGenerationResult,
	ForestObstacle,
	ForestObstacleType,
	ForestSide,
	Inventory,
	ItemId,
	MapId,
	ModalOption,
	ModalState,
	PetEmoji,
	Point,
	Plot,
	Position,
	PriceState,
	PriceTrendState,
	QuantityPromptState,
	SketchyStockEntry,
	SnakePatrolState,
	Tile,
	ToolId,
	ToolLevels,
	TractorImplement,
	TraderTradeEntry,
	VendorKey,
	VisualCell,
	Warp,
	WeatherId,
} from "./game/shared/types";
import { keyForPos } from "./game/shared/coords";
import { clampMin, randomInt } from "./game/shared/random";

const STARTER_CHEST_POS = { x: 7, y: 8 };
const TRACTOR_PARK_POS = { x: 14, y: 8 };
const TRACTOR_PRICE = 10000;
const TRACTOR_IRON_COST = 50;
const HEADLAMP_PRICE = 1000;

const FARM_FOREST_BLOCKER_POSITIONS = [
	{ x: FARM_WIDTH - 2, y: FOREST_GATE_Y },
	{ x: FARM_WIDTH - 2, y: FOREST_GATE_Y + 1 },
];
const FARM_CAVE_BLOCKER_POSITIONS = [
	{ x: 1, y: CAVE_GATE_Y },
	{ x: 1, y: CAVE_GATE_Y + 1 },
];


const townNpcNames: Record<string, string> = {
	neighbor_1: "Nora",
	neighbor_2: "Milo",
	neighbor_3: "Rhea",
	neighbor_4: "Gus",
};

const townNpcAnchors: Record<string, { x: number; y: number }> = {
	neighbor_1: { x: 10, y: 10 },
	neighbor_2: { x: 20, y: 10 },
	neighbor_3: { x: 34, y: 10 },
	neighbor_4: { x: 46, y: 10 },
};
const SKETCHY_MERCHANT_POS = { x: TOWN_WIDTH - 3, y: 1 };
const SKETCHY_CRATE_POS = {
	x: SKETCHY_MERCHANT_POS.x + 1,
	y: SKETCHY_MERCHANT_POS.y,
};
const TRADER_POS = { x: 2, y: 7 };
const TRADER_BOX_POS = { x: TRADER_POS.x + 1, y: TRADER_POS.y };
const TRADER_HELI_POS = { x: TRADER_BOX_POS.x, y: TRADER_BOX_POS.y - 1 };
const PET_VENDOR_POS = { x: 25, y: 7 };
const DOCTOR_POS = { x: 30, y: 7 };

const boatNpcEmojis = {
	boat_1: "⛵", // sailboat
	boat_2: "🛶", // canoe
	boat_3: "🚤", // speedboat
	boat_4: "🛥️", // motorboat
	boat_5: "🚣‍♀️", // rowboat
} as const;

const initialBoatTiles: Record<
	keyof typeof boatNpcEmojis,
	{ x: number; y: number }
> = {
	boat_1: { x: 10, y: TOWN_OCEAN_START_Y + 2 },
	boat_2: { x: 18, y: TOWN_OCEAN_START_Y + 4 },
	boat_3: { x: 30, y: TOWN_OCEAN_START_Y + 3 },
	boat_4: { x: 40, y: TOWN_OCEAN_START_Y + 5 },
	boat_5: { x: 48, y: TOWN_OCEAN_START_Y + 2 },
};

const npcMoveDirections: Record<number, { dx: number; dy: number }> = {
	1: { dx: -1, dy: -1 },
	2: { dx: 0, dy: -1 },
	3: { dx: 1, dy: -1 },
	4: { dx: -1, dy: 0 },
	5: { dx: 1, dy: 0 },
	6: { dx: -1, dy: 1 },
	7: { dx: 0, dy: 1 },
	8: { dx: 1, dy: 1 },
};

const starterWardrobeLooks = ["🧑‍🌾", "👨‍🌾", "👩‍🌾"] as const; // starter farmers
const purchasableClassicLooks = [
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
const purchasableFunnyLooks = [
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
const clothingShopItems = [
	...purchasableClassicLooks.map((look) => ({ look, price: 300 })),
	...purchasableFunnyLooks.map((look) => ({ look, price: 1000 })),
] as const;
const allWardrobeLooks = [
	...starterWardrobeLooks,
	...clothingShopItems.map((item) => item.look),
] as const;

const shopMaps: Exclude<
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

const shopDecorForSaleItems: Record<
	Exclude<MapId, "farm" | "house" | "barn" | "town" | "forest" | "cave">,
	string[]
> = {
	seed_shop: ["🌱"], // seeds
	feed_shop: ["🧺"], // feed
	animal_shop: ["🐄", "🐑", "🐔"], // cow, sheep, chicken
	market_shop: ["💵", "💲", "💹", "💰"], // money signs
	tool_shop: ["🧰"], // tools
	clothing_shop: ["👕", "👒", "👢", "🧥"], // clothing
	cafe_shop: ["☕", "🍔", "🥗", "🍕"], // cafe menu
};

const shopDecorSlots: Array<{ x: number; y: number }> = [
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

const cafeCounterPrepDecor: Array<{ x: number; emoji: string }> = [
	{ x: 3, emoji: "🥗" }, // salad
	{ x: 5, emoji: "🍕" }, // pizza
	{ x: 9, emoji: "☕" }, // coffee
	{ x: 11, emoji: "🍔" }, // burger
];

const tileVisuals: Record<string, VisualCell> = {
	"#": { glyph: "🧱" }, // brick wall
	",": { glyph: "", className: "tile-grass" },
	":": { glyph: "", className: "tile-sand" },
	";": { glyph: "", className: "tile-soil" },
	"=": { glyph: "", className: "tile-path" },
	")": { glyph: "", className: "tile-cave-path" },
	".": { glyph: "", className: "tile-floor" },
	"~": { glyph: "", className: "tile-water" },
	_: { glyph: "", className: "tile-gravel" },
	"^": { glyph: "", className: "tile-forest-grass" },
	"<": { glyph: "", className: "tile-cave-wall-dark" },
	">": { glyph: "", className: "tile-cave-wall-mid" },
	"*": { glyph: "", className: "tile-cave-wall-light" },
	"/": { glyph: "🪜", className: "tile-path" }, // ladder
	T: { glyph: "🌲" }, // pine tree
	G: { glyph: "🌳" }, // tree
	C: { glyph: "🌵" }, // cactus
	L: { glyph: "🪵" }, // log
	O: { glyph: "🪨" }, // rock
	J: { glyph: "🌿" }, // weed
	X: { glyph: "🎁" }, // loot chest
	M: { glyph: "🍾", className: "tile-sand" }, // message bottle
	S: { glyph: "🐚", className: "tile-sand" }, // shell
	"0": { glyph: "😉" }, // sketchy vendor
	"6": { glyph: "📦", className: "tile-grass" }, // sketchy crate
	"4": { glyph: "🥷" }, // trader
	"5": { glyph: "📦" }, // trader crate
	"7": { glyph: "🚁" }, // trader helicopter
	"8": { glyph: "🧍‍♂️" }, // pet vendor
	"9": { glyph: "❤️" }, // pet heart
	Z: { glyph: "🧑‍⚕️", className: "tile-grass" }, // doctor
	"{": { glyph: "🚜" }, // parked tractor
	"}": { glyph: "🚜" }, // moving tractor alt
	"@": { glyph: "🐈" }, // pet cat
	"%": { glyph: "🐈‍⬛" }, // pet black cat
	"&": { glyph: "🐕" }, // pet dog
	"?": { glyph: "🐩" }, // pet poodle
	K: { glyph: "🪸" }, // coral fruit crop
	e: { glyph: "🐻" }, // bear
	y: { glyph: "🐍" }, // snake
	"!": { glyph: "💩" }, // poop enemy
	"+": { glyph: "🚪" }, // door
	d: { glyph: "🛏️" }, // bed
	w: { glyph: "👕" }, // wardrobe
	U: { glyph: "🛁" }, // bath
	V: { glyph: "🛀" }, // bathing
	j: { glyph: "🙂" }, // shopkeeper
	l: { glyph: "🪟" }, // window
	x: { glyph: "🧱" }, // counter
	h: { glyph: "🪑" }, // chair
	B: { glyph: "", className: "tile-barn-wall" },
	H: { glyph: "🧱" }, // house wall
	Y: { glyph: "🌱" }, // growing crop
	i: { glyph: "🌿" }, // animated weed/foliage
	"'": { glyph: "'" },
	s: { glyph: "🌱", className: "tile-shop-sign" }, // seed shop sign
	f: { glyph: "🧺", className: "tile-shop-sign" }, // feed shop sign
	a: { glyph: "🐄", className: "tile-shop-sign" }, // animal shop sign
	$: { glyph: "💰", className: "tile-shop-sign" }, // market sign
	t: { glyph: "🧰", className: "tile-shop-sign" }, // tool shop sign
	c: { glyph: "👕", className: "tile-shop-sign" }, // clothes sign
	k: { glyph: "☕", className: "tile-shop-sign" }, // cafe sign
	n: { glyph: "🙂" }, // town npc 1
	b: { glyph: "👷", className: "tile-floor" }, // builder
	m: { glyph: "😎" }, // town npc 2
	o: { glyph: "🥸" }, // town npc 3
	p: { glyph: "🤠" }, // town npc 4
	q: { glyph: "⛵" }, // boat 1
	r: { glyph: "🛶" }, // boat 2
	u: { glyph: "🚤" }, // boat 3
	v: { glyph: "🛥️" }, // boat 4
	z: { glyph: "🚣‍♀️" }, // boat 5
	"[": { glyph: "⛲", className: "tile-grass" }, // fountain
	"]": { glyph: "🌴", className: "tile-grass" }, // palm tree
	"`": { glyph: "🦇" }, // bat
	"1": { glyph: "🐄" }, // cow
	"2": { glyph: "🐑" }, // sheep
	"3": { glyph: "🐔" }, // chicken
	A: { glyph: "🦛" }, // hippo
	D: { glyph: "🦄" }, // unicorn
	F: { glyph: "🦣" }, // mammoth
	I: { glyph: "🐌" }, // slug
	N: { glyph: "🦍" }, // gorilla
	E: { glyph: "🥚" }, // egg pickup
	R: { glyph: "", className: "tile-roof-blue" },
	W: { glyph: "", className: "tile-roof-white" },
	g: { glyph: "", className: "tile-roof-gray" },
	Q: { glyph: "", className: "tile-roof-red" },
};

const toVisual = (tile: string): VisualCell => {
	if (tileVisuals[tile]) return tileVisuals[tile];
	return { glyph: tile };
};

const groundClassForTile = (tile: string, mapId?: MapId): string | undefined => {
	if (tile === ",") return "tile-grass";
	if (tile === ":") return "tile-sand";
	if (tile === ";") return "tile-soil-dry";
	if (tile === "=") return "tile-path";
	if (tile === ")") return "tile-cave-path";
	if (tile === "_") return "tile-gravel";
	if (tile === ".") return "tile-floor";
	if (tile === "U") return "tile-floor";
	if (tile === "T" || tile === "G" || tile === "^")
		return mapId === "forest" ? "tile-forest-grass" : "tile-grass";
	if (tile === "x" || tile === "j" || tile === "h") return "tile-floor";
	if (tile === "~") return "tile-water";
	return undefined;
};

const spriteTilesNeedingGround = new Set([
	"P",
	"+",
	"d",
	"w",
	"U",
	"V",
	"j",
	"l",
	"x",
	"h",
	"Y",
	"i",
	"'",
	"1",
	"2",
	"3",
	"A",
	"D",
	"F",
	"I",
	"N",
	"E",
	"s",
	"f",
	"a",
	"$",
	"t",
	"c",
	"k",
	"b",
	"n",
	"m",
	"o",
	"p",
	"q",
	"r",
	"u",
	"v",
	"z",
	"T",
	"G",
	"C",
	"L",
	"O",
	"J",
	"X",
	"0",
	"4",
	"5",
	"7",
	"8",
	"9",
	"{",
	"}",
	"@",
	"%",
	"&",
	"?",
	"K",
	"e",
	"y",
	"!",
	"`",
]);

const priceItems: ItemId[] = [
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

const cafeMenuItems: CafeOrderItem[] = [
	{ name: "Coffee", price: 3, stamina: 15 },
	{ name: "Hamburger", price: 8, stamina: 45 },
	{ name: "Salad", price: 7, stamina: 30 },
	{ name: "Pizza", price: 15, stamina: 75 },
];

const dirDelta: Record<Dir, { dx: number; dy: number }> = {
	up: { dx: 0, dy: -1 },
	down: { dx: 0, dy: 1 },
	left: { dx: -1, dy: 0 },
	right: { dx: 1, dy: 0 },
};

const getHoeTargets = (
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

const getSeedSellbackPrice = (price: number) => Math.max(1, Math.floor(price / 2));
const CORAL_FRUIT_SELL_PRICE = 500;
const GEM_SELL_PRICES: Record<"diamond" | "emerald" | "ruby", number> = {
	diamond: 2000,
	emerald: 1000,
	ruby: 250,
};
const getSketchyPriceMultiplier = () => {
	const roll = Math.random();
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
	"fish",
	"iron",
	"shell",
	"diamond",
	"emerald",
	"ruby",
];
const generateSketchyMerchantStock = (marketPrices: PriceState) => {
	const distinct = randomInt(2, 5);
	const chosen = [...sketchyItemPool]
		.sort(() => Math.random() - 0.5)
		.slice(0, distinct);
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
	"fish",
	"iron",
	"shell",
	"coral_fruit",
];
const traderItemTradeCap: Partial<Record<ItemId, number>> = {
	iron: 10,
	pumpkin: 50,
	coral_fruit: 20,
};
const generateTraderTrades = () => {
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
const vendorMenuTitles = new Set([
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
const townBeachBottleTiles: XY[] = collectBeachTiles(
	mapLayouts.town[TOWN_SAND_Y] ?? "",
	TOWN_SAND_Y,
);
type DealBadge =
	| {
			label: string;
			color: string;
			scaleUp: number;
	  }
	| undefined;

const getDealBadge = (
	mode: "buy" | "sell",
	currentPrice: number,
	basePrice: number,
): DealBadge => {
	const delta = currentPrice - basePrice;
	if (Math.abs(delta) <= 1) return undefined;

	const isVery = Math.abs(delta) > 5;
	const isGood =
		mode === "buy"
			? currentPrice < basePrice
			: currentPrice > basePrice;

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

const makeEmptyInventory = (): Inventory => ({
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

const initialPrices: PriceState = {
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
const initialPriceTrends: PriceTrendState = {
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

const farmWeedSpreadDirections = [
	{ dx: -1, dy: -1 },
	{ dx: 0, dy: -1 },
	{ dx: 1, dy: -1 },
	{ dx: -1, dy: 0 },
	{ dx: 1, dy: 0 },
	{ dx: -1, dy: 1 },
	{ dx: 0, dy: 1 },
	{ dx: 1, dy: 1 },
];
const canPlaceFarmWeedAt = (
	x: number,
	y: number,
	occupiedWeeds: Set<string>,
	plotKeys: Set<string>,
	forestBlockers: Record<string, boolean>,
	caveBlockers: Record<string, number>,
	includeStarterChestBlock: boolean,
) => {
	if (x < 1 || y < 1 || x >= FARM_WIDTH - 1 || y >= FARM_HEIGHT - 1) return false;
	if (mapLayouts.farm[y]?.[x] !== ",") return false;
	const key = keyForPos(x, y);
	if (occupiedWeeds.has(key)) return false;
	if (plotKeys.has(key)) return false;
	if (forestBlockers[key]) return false;
	if ((caveBlockers[key] ?? 0) > 0) return false;
	if (
		includeStarterChestBlock &&
		x === STARTER_CHEST_POS.x &&
		y === STARTER_CHEST_POS.y
	)
		return false;
	return true;
};
const rollRandomFarmWeedDrops = (
	occupiedWeeds: Set<string>,
	plotKeys: Set<string>,
	forestBlockers: Record<string, boolean>,
	caveBlockers: Record<string, number>,
	includeStarterChestBlock: boolean,
) => {
	const dropCount = randomInt(0, 2);
	if (dropCount <= 0) return;
	const candidates: Array<{ x: number; y: number }> = [];
	for (let y = 1; y < FARM_HEIGHT - 1; y += 1) {
		for (let x = 1; x < FARM_WIDTH - 1; x += 1) {
			if (
				canPlaceFarmWeedAt(
					x,
					y,
					occupiedWeeds,
					plotKeys,
					forestBlockers,
					caveBlockers,
					includeStarterChestBlock,
				)
			) {
				candidates.push({ x, y });
			}
		}
	}
	const picks = candidates.sort(() => Math.random() - 0.5).slice(0, dropCount);
	picks.forEach(({ x, y }) => {
		occupiedWeeds.add(keyForPos(x, y));
	});
};
const generateInitialFarmWeedField = (
	forestBlockers: Record<string, boolean>,
	caveBlockers: Record<string, number>,
	plotKeys: Set<string>,
) => {
	const weeds = new Set<string>();
	const blobCount = randomInt(3, 5);
	for (let i = 0; i < blobCount; i += 1) {
		const cx = randomInt(Math.floor(FARM_WIDTH * 0.62), FARM_WIDTH - 3);
		const cy = randomInt(Math.floor(FARM_HEIGHT * 0.6), FARM_HEIGHT - 3);
		const radiusX = randomInt(1, 2);
		const radiusY = randomInt(1, 2);
		for (let y = cy - radiusY; y <= cy + radiusY; y += 1) {
			for (let x = cx - radiusX; x <= cx + radiusX; x += 1) {
				if (Math.random() < 0.35) continue;
				if (canPlaceFarmWeedAt(x, y, weeds, plotKeys, forestBlockers, caveBlockers, true)) {
					weeds.add(keyForPos(x, y));
				}
			}
		}
	}
	if (weeds.size < 1) {
		for (let y = FARM_HEIGHT - 3; y >= Math.floor(FARM_HEIGHT * 0.55); y -= 1) {
			for (let x = FARM_WIDTH - 3; x >= Math.floor(FARM_WIDTH * 0.58); x -= 1) {
				if (canPlaceFarmWeedAt(x, y, weeds, plotKeys, forestBlockers, caveBlockers, true)) {
					weeds.add(keyForPos(x, y));
					y = -1;
					break;
				}
			}
		}
	}
	return Object.fromEntries(Array.from(weeds).map((key) => [key, true])) as Record<
		string,
		boolean
	>;
};
const evolveFarmWeeds = (
	prev: Record<string, boolean>,
	forestBlockers: Record<string, boolean>,
	caveBlockers: Record<string, number>,
	plotKeys: Set<string>,
	includeStarterChestBlock: boolean,
) => {
	const weeds = new Set<string>(
		Object.entries(prev)
			.filter(([, present]) => present)
			.map(([key]) => key),
	);
	const baseWeeds = Array.from(weeds);
	baseWeeds.forEach((key) => {
		if (Math.random() >= 0.5) return;
		const [xStr, yStr] = key.split(",");
		const x = Number(xStr);
		const y = Number(yStr);
		if (!Number.isFinite(x) || !Number.isFinite(y)) return;
		const dir =
			farmWeedSpreadDirections[
				randomInt(0, farmWeedSpreadDirections.length - 1)
			]!;
		const nx = x + dir.dx;
		const ny = y + dir.dy;
		if (
			canPlaceFarmWeedAt(
				nx,
				ny,
				weeds,
				plotKeys,
				forestBlockers,
				caveBlockers,
				includeStarterChestBlock,
			)
		) {
			weeds.add(keyForPos(nx, ny));
		}
	});
	rollRandomFarmWeedDrops(
		weeds,
		plotKeys,
		forestBlockers,
		caveBlockers,
		includeStarterChestBlock,
	);
	return Object.fromEntries(Array.from(weeds).map((key) => [key, true])) as Record<
		string,
		boolean
	>;
};
const weatherOptions: WeatherId[] = ["sunny", "windy", "rainy"];
const randomWeather = (): WeatherId =>
	weatherOptions[randomInt(0, weatherOptions.length - 1)]!;
const weatherEmojiById: Record<WeatherId, string> = {
	sunny: "🌞", // sunny
	windy: "🍃", // windy
	rainy: "☔", // rainy
};

const getFarmBarnInteriorBounds = (barnTier: BarnTier) => {
	const { x, y, w, h } = getFarmBarnOuterRect(barnTier);
	return { minX: x + 1, maxX: x + w - 2, minY: y + 1, maxY: y + h - 2 };
};
const chickenEggOffsets = [
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
		if (!keepSparseWood(x, y)) return;
		if (!canPlace(x, y)) return;
		wood[keyForPos(x, y)] = true;
	};
	const addStone = (x: number, y: number) => {
		if (!keepSparseStone(x, y)) return;
		if (!canPlace(x, y)) return;
		stone[keyForPos(x, y)] = 24;
	};

	for (let x = 37; x <= FARM_WIDTH - 2; x += 1) {
		addWood(x, 10);
		if (x % 3 !== 0) addWood(x, 9);
		if (x % 4 !== 1) addWood(x, 11);
		for (let y = 12; y <= 17; y += 1) {
			if ((x + y) % 3 === 0) continue;
			addWood(x, y);
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
			if (usedKeys.has(key)) continue;
			if (!canPlace(x, y)) continue;
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
const initialFarmExpansionBlockers = buildInitialFarmExpansionBlockers();

function App() {
	const shellRef = useRef<HTMLDivElement | null>(null);
	const notificationRef = useRef<HTMLAudioElement | null>(null);
	const farmMusicRef = useRef<HTMLAudioElement | null>(null);
	const townMusicRef = useRef<HTMLAudioElement | null>(null);
	const beachAmbienceRef = useRef<HTMLAudioElement | null>(null);
	const houseMusicRef = useRef<HTMLAudioElement | null>(null);
	const forestMusicRef = useRef<HTMLAudioElement | null>(null);
	const caveMusicRef = useRef<HTMLAudioElement | null>(null);
	const chaChingRef = useRef<HTMLAudioElement | null>(null);
	const endOfDayRef = useRef<HTMLAudioElement | null>(null);
	const hoeSoundRef = useRef<HTMLAudioElement | null>(null);
	const munchSoundRef = useRef<HTMLAudioElement | null>(null);
	const badSoundRef = useRef<HTMLAudioElement | null>(null);
	const waterSoundRef = useRef<HTMLAudioElement | null>(null);
	const yayaSoundRef = useRef<HTMLAudioElement | null>(null);
	const tooTiredRef = useRef<HTMLAudioElement | null>(null);
	const gotRewardRef = useRef<HTMLAudioElement | null>(null);
	const snakeSoundRef = useRef<HTMLAudioElement | null>(null);
	const bearSoundRef = useRef<HTMLAudioElement | null>(null);
	const pooSoundRef = useRef<HTMLAudioElement | null>(null);
	const bathSoundRef = useRef<HTMLAudioElement | null>(null);
	const pluckSoundRef = useRef<HTMLAudioElement | null>(null);
	const ploopSoundRef = useRef<HTMLAudioElement | null>(null);
	const seagullsSoundRef = useRef<HTMLAudioElement | null>(null);
	const meowSoundRef = useRef<HTMLAudioElement | null>(null);
	const woofSoundRef = useRef<HTMLAudioElement | null>(null);
	const tractorSoundRef = useRef<HTMLAudioElement | null>(null);
	const cafeOrderMusicRef = useRef<HTMLAudioElement | null>(null);
	const currentAreaMusicRef = useRef<HTMLAudioElement | null>(null);
	const musicFadeIntervalRef = useRef<number | null>(null);
	const musicFadeFromRef = useRef<HTMLAudioElement | null>(null);
	const musicFadeToRef = useRef<HTMLAudioElement | null>(null);
	const bgMusicTransitionUntilRef = useRef(0);
	const townBeachFadeIntervalRef = useRef<number | null>(null);
	const beachPauseTimeoutRef = useRef<number | null>(null);
	const seagullsFadeIntervalRef = useRef<number | null>(null);
	const fishingWaitTimeoutRef = useRef<number | null>(null);
	const fishingCatchTimeoutRef = useRef<number | null>(null);
	const fishingResolveTimeoutRef = useRef<number | null>(null);
	const fishingWaterIntervalRef = useRef<number | null>(null);
	const waterRefillTileTimeoutRef = useRef<number | null>(null);
	const tiredDuckTimeoutRef = useRef<number | null>(null);
	const tiredFaceTimeoutRef = useRef<number | null>(null);
	const petRunoverBadTimeoutRef = useRef<number | null>(null);
	const forestHitTimeoutRef = useRef<number | null>(null);
	const orderMidTimeoutRef = useRef<number | null>(null);
	const orderCompleteTimeoutRef = useRef<number | null>(null);
	const orderRewardTimeoutRef = useRef<number | null>(null);
	const cafeObservationIntervalRef = useRef<number | null>(null);
	const doctorProcessTimeoutRef = useRef<number | null>(null);
	const doctorRewardTimeoutRef = useRef<number | null>(null);
	const doctorObservationIntervalRef = useRef<number | null>(null);
	const cafeShopkeeperMoveIntervalRef = useRef<number | null>(null);
	const cafeShopkeeperDirRef = useRef<1 | -1>(1);
	const cloudIntervalRef = useRef<number | null>(null);
	const grassWindStartTimeoutRef = useRef<number | null>(null);
	const grassWindSweepIntervalRef = useRef<number | null>(null);
	const grassWindBandStartTimeoutsRef = useRef<number[]>([]);
	const nextWindBandIdRef = useRef(1);
	const nextCloudIdRef = useRef(1);
	const initialForestStateRef = useRef(
		generateForestState({
			level: 1,
			entranceSide: "left",
			entranceCoord: FOREST_GATE_Y,
			lastTurn: 0,
		}),
	);
	const initialCaveStateRef = useRef(
		generateCaveState({
			level: 1,
			entranceSide: "right",
			entranceCoord: CAVE_GATE_Y,
			lastTurn: 0,
		}),
	);
	const startedRef = useRef(false);
	const [player, setPlayer] = useState<Position>({ map: "farm", x: 6, y: 10 });
	const [day, setDay] = useState(1);
	const [forestLayout, setForestLayout] = useState<string[]>(
		() => initialForestStateRef.current.layout,
	);
	const [forestEnemies, setForestEnemies] = useState<ForestEnemy[]>(
		() => initialForestStateRef.current.enemies,
	);
	const forestSnakeDirsRef = useRef<Record<number, SnakePatrolState>>(
		makeSnakeDirections(initialForestStateRef.current.enemies),
	);
	const forestAggroRef = useRef<Record<number, boolean>>({});
	const forestEnemyTickRef = useRef(0);
	const [forestObstacles, setForestObstacles] = useState<ForestObstacle[]>(
		() => initialForestStateRef.current.obstacles,
	);
	const [forestChest, setForestChest] = useState<ForestChest>(
		() => initialForestStateRef.current.chest,
	);
	const [forestBonusChests, setForestBonusChests] = useState<ForestChest[]>(
		() => initialForestStateRef.current.bonusChests,
	);
	const [forestLevel, setForestLevel] = useState<number>(
		() => initialForestStateRef.current.level,
	);
	const [forestEntranceDoorPos, setForestEntranceDoorPos] = useState<Point>(
		() => initialForestStateRef.current.entranceDoor,
	);
	const [forestForwardExitPos, setForestForwardExitPos] = useState<Point>(
		() => initialForestStateRef.current.exitDoor,
	);
	const [forestExitSide, setForestExitSide] = useState<ForestSide>(
		() => initialForestStateRef.current.exitSide,
	);
	const [forestLastTurn, setForestLastTurn] = useState<-1 | 0 | 1>(
		() => initialForestStateRef.current.turnSign,
	);
	const [forestIsBonusLevel, setForestIsBonusLevel] = useState<boolean>(
		() => initialForestStateRef.current.isBonusLevel,
	);
	const [forestLockedToday, setForestLockedToday] = useState(false);
	const [forestFog, setForestFog] = useState<Record<string, number>>({});
	const [caveFog, setCaveFog] = useState<Record<string, number>>({});
	const [caveLayout, setCaveLayout] = useState<string[]>(
		() => initialCaveStateRef.current.layout,
	);
	const [caveRubble, setCaveRubble] = useState<Record<string, string>>(
		() => buildCaveRubble(initialCaveStateRef.current.layout),
	);
	const [caveEnemies, setCaveEnemies] = useState<ForestEnemy[]>(
		() => initialCaveStateRef.current.enemies,
	);
	const caveBatDirsRef = useRef<Record<number, SnakePatrolState>>(
		makeSnakeDirections(initialCaveStateRef.current.enemies),
	);
	const caveAggroRef = useRef<Record<number, boolean>>({});
	const caveEnemyTickRef = useRef(0);
	const [caveObstacles, setCaveObstacles] = useState<ForestObstacle[]>(
		() => initialCaveStateRef.current.obstacles,
	);
	const [caveLevel, setCaveLevel] = useState<number>(
		() => initialCaveStateRef.current.level,
	);
	const [caveEntranceDoorPos, setCaveEntranceDoorPos] = useState<Point>(
		() => initialCaveStateRef.current.entranceDoor,
	);
	const [caveLevelOneExitPos, setCaveLevelOneExitPos] = useState<Point>(
		() => initialCaveStateRef.current.levelOneExitInside,
	);
	const [caveLadderPos, setCaveLadderPos] = useState<Point | null>(null);
	const [caveStartingRockCount, setCaveStartingRockCount] = useState<number>(
		() => initialCaveStateRef.current.startingRockCount,
	);
	const [caveLockedToday, setCaveLockedToday] = useState(false);
	const [currentWeather, setCurrentWeather] = useState<WeatherId>(() =>
		randomWeather(),
	);
	const [cafeShopkeeperX, setCafeShopkeeperX] = useState(7);
	const [shopDecorByMap] = useState<Record<string, Record<string, string>>>(
		() => {
			const out: Record<string, Record<string, string>> = {};
			shopMaps.forEach((mapId) => {
				const theme = shopDecorForSaleItems[mapId];
				const slots: Record<string, string> = {};
				if (mapId === "cafe_shop") {
					cafeCounterPrepDecor.forEach(({ x, emoji }) => {
						slots[`${x},1`] = emoji;
					});
					out[mapId] = slots;
					return;
				}
				if (mapId === "tool_shop") {
					const backWallXs = [2, 5, 9, 12];
					backWallXs.forEach((x) => {
						const item = theme[randomInt(0, theme.length - 1)]!;
						slots[`${x},1`] = item;
					});
					out[mapId] = slots;
					return;
				}
				const placementCount = Math.min(shopDecorSlots.length, randomInt(2, 4));
				const chosenSlots = [...shopDecorSlots]
					.sort(() => Math.random() - 0.5)
					.slice(0, placementCount);
				chosenSlots.forEach(({ x, y }) => {
					const item = theme[randomInt(0, theme.length - 1)]!;
					slots[`${x},${y}`] = item;
				});
				out[mapId] = slots;
			});
			return out;
		},
	);
	const [money, setMoney] = useState(0);
	const [staminaMax, setStaminaMax] = useState(STAMINA_MAX);
	const [stamina, setStamina] = useState(STAMINA_MAX);
	const [inventory, setInventory] = useState<Inventory>(makeEmptyInventory);
	const [plots, setPlots] = useState<Record<string, Plot>>({});
	const [animals, setAnimals] = useState<Animal[]>([]);
	const [prices, setPrices] = useState<PriceState>(initialPrices);
	const [priceTrends, setPriceTrends] =
		useState<PriceTrendState>(initialPriceTrends);
	const [newspaper, setNewspaper] = useState(
		"Sleep to start a new day and generate today's market newspaper.",
	);
	const [log, setLog] = useState<string[]>(["Welcome to your farm."]);
	const [modal, setModal] = useState<ModalState | null>(null);
	const [modalIndex, setModalIndex] = useState(0);
	const [quantityPrompt, setQuantityPrompt] =
		useState<QuantityPromptState | null>(null);
	const quantityParentMenuRef = useRef<{
		modal: ModalState;
		index: number;
	} | null>(null);
	const quantityPromptRef = useRef<QuantityPromptState | null>(null);
	const [waterRipplePhase, setWaterRipplePhase] = useState(false);
	const [pauseGame, setPauseGame] = useState(false);
	const [dayTransition, setDayTransition] = useState<DayTransitionState | null>(
		null,
	);
	const [dayTransitionPrompt, setDayTransitionPrompt] = useState<string>(
		nextDayPrompts[0],
	);
	const [dayTransitionStage, setDayTransitionStage] = useState<
		"intro" | "day" | "earned" | "final"
	>("intro");
	const [dayTransitionClosePhase, setDayTransitionClosePhase] = useState<
		"idle" | "card" | "backdrop"
	>("idle");
	const [dayTransitionStarsState, setDayTransitionStarsState] = useState<
		DayTransitionStar[]
	>(() => createDayTransitionStars());
	const dayTransitionTimersRef = useRef<number[]>([]);
	const dayTransitionCloseTimersRef = useRef<number[]>([]);
	const [currentDayEarned, setCurrentDayEarned] = useState(0);
	const [previousDayEarned, setPreviousDayEarned] = useState(0);
	const [totalEarned, setTotalEarned] = useState(0);
	const [playerEmoji, setPlayerEmoji] = useState<string>(
		starterWardrobeLooks[0],
	);
	const [showTiredFace, setShowTiredFace] = useState(false);
	const [showForestHit, setShowForestHit] = useState(false);
	const [isBathing, setIsBathing] = useState(false);
	const [ownedWardrobeLooks, setOwnedWardrobeLooks] = useState<string[]>([
		...starterWardrobeLooks,
	]);
	const [tools, setTools] = useState<ToolLevels>(initialToolLevels);
	const [barnTier, setBarnTier] = useState<BarnTier>(1);
	const [pendingBarnUpgrade, setPendingBarnUpgrade] = useState(false);
	const [hasTractor, setHasTractor] = useState(false);
	const [hasHeadlamp, setHasHeadlamp] = useState(false);
	const [pendingTractorDelivery, setPendingTractorDelivery] = useState(false);
	const [tractorParked, setTractorParked] = useState(false);
	const [isDrivingTractor, setIsDrivingTractor] = useState(false);
	const [tractorFacing, setTractorFacing] = useState<1 | -1>(1);
	const [tractorImplement, setTractorImplement] = useState<TractorImplement | null>(
		null,
	);
	const [tractorImplementOn, setTractorImplementOn] = useState(false);
	const [tractorSeedItem, setTractorSeedItem] = useState<ItemId | null>(null);
	const [tractorDriverEmoji, setTractorDriverEmoji] = useState<string | null>(null);
	const [waterLevel, setWaterLevel] = useState(0);
	const [waterRefillTile, setWaterRefillTile] = useState<{
		map: MapId;
		x: number;
		y: number;
	} | null>(null);
	const [starterChestOpened, setStarterChestOpened] = useState(false);
	const [beachBottlePos, setBeachBottlePos] = useState<{
		x: number;
		y: number;
	} | null>(() => rollBeachBottleSpawn(townBeachBottleTiles, randomInt));
	const [beachShellDrops, setBeachShellDrops] = useState<Record<string, boolean>>(
		() => rollBeachShellDrops(townBeachBottleTiles, keyForPos, randomInt),
	);
	const [sketchyMerchantActive, setSketchyMerchantActive] = useState(
		() => Math.random() < 0.25,
	);
	const [sketchyMerchantStock, setSketchyMerchantStock] = useState<
		SketchyStockEntry[]
	>(() => generateSketchyMerchantStock(initialPrices));
	const [traderActive, setTraderActive] = useState(() => Math.random() < 0.5);
	const [traderTrades, setTraderTrades] = useState<TraderTradeEntry[]>(
		() => generateTraderTrades(),
	);
	const [doctorVendorActive, setDoctorVendorActive] = useState(
		() => Math.random() < 1 / 3,
	);
	const [doctorUsedToday, setDoctorUsedToday] = useState(false);
	const [petVendorActive, setPetVendorActive] = useState(() => Math.random() < 0.5);
	const [ownedPet, setOwnedPet] = useState<PetEmoji | null>(null);
	const [pendingPet, setPendingPet] = useState<PetEmoji | null>(null);
	const [petTile, setPetTile] = useState<Point | null>(null);
	const [petFacing, setPetFacing] = useState<1 | -1>(1);
	const [petHeartTile, setPetHeartTile] = useState<Point | null>(null);
	const petHeartTimeoutRef = useRef<number | null>(null);
	const [townNpcTiles, setTownNpcTiles] = useState(townNpcAnchors);
	const [boatTiles, setBoatTiles] = useState(initialBoatTiles);
	const [npcDailyAssignments, setNpcDailyAssignments] = useState<
		Record<string, NpcDailyAssignment>
	>(() => generateDailyAssignmentsForNpcs(Object.keys(townNpcNames)));
	const [npcTalkedToday, setNpcTalkedToday] = useState<Record<string, boolean>>(
		{},
	);
	const [fishing, setFishing] = useState<FishingState | null>(null);
	const [isOrdering, setIsOrdering] = useState(false);
	const [cafeObservation, setCafeObservation] = useState("");
	const [isDoctorCompounding, setIsDoctorCompounding] = useState(false);
	const [doctorObservation, setDoctorObservation] = useState("");
	const [clouds, setClouds] = useState<CloudSprite[]>([]);
	const [grassWindBands, setGrassWindBands] = useState<
		Array<{
			id: number;
			map: MapId;
			frontX: number;
			baseY: number;
			frame: number;
		}>
	>([]);
	const playerRef = useRef(player);
	const ttsReadyRef = useRef(false);
	const [animalTiles, setAnimalTiles] = useState<
		Record<number, { x: number; y: number }>
	>(() => ({}));
	const [animalAnchors, setAnimalAnchors] = useState<
		Record<number, { x: number; y: number }>
	>(() => ({}));
	const [farmForestBlockers, setFarmForestBlockers] = useState<
		Record<string, boolean>
	>(() => ({
		...Object.fromEntries(
			FARM_FOREST_BLOCKER_POSITIONS.map((pos) => [keyForPos(pos.x, pos.y), true]),
		),
		...initialFarmExpansionBlockers.wood,
	}));
	const [farmCaveBlockers, setFarmCaveBlockers] = useState<Record<string, number>>(
		() => ({
			...Object.fromEntries(
				FARM_CAVE_BLOCKER_POSITIONS.map((pos) => [keyForPos(pos.x, pos.y), 24]),
			),
			...initialFarmExpansionBlockers.stone,
		}),
	);
	const [petGraveObstacles, setPetGraveObstacles] = useState<Record<string, number>>(
		{},
	);
	const [pendingPetGravePos, setPendingPetGravePos] = useState<Point | null>(null);
	const [farmWeedObstacles, setFarmWeedObstacles] = useState<Record<string, boolean>>(
		() => generateInitialFarmWeedField(farmForestBlockers, farmCaveBlockers, new Set<string>()),
	);
	const [farmEggDrops, setFarmEggDrops] = useState<Record<string, boolean>>({});
	const activeMapLayouts = useMemo(
		() => ({
			...mapLayouts,
			farm: buildFarmLayout(barnTier),
			barn: buildBarnLayout(barnTier),
			forest: forestLayout,
			cave: caveLayout,
		}),
		[barnTier, forestLayout, caveLayout],
	);

	const activeMapRows = activeMapLayouts[player.map];
	const width = activeMapRows[0]?.length ?? 0;
	const height = activeMapRows.length;
	const animalsMap: MapId = isBarnExternal(barnTier) ? "barn" : "farm";
	const barnInteriorBounds = useMemo(() => {
		if (animalsMap === "farm") return getFarmBarnInteriorBounds(barnTier);
		const rows = activeMapLayouts.barn;
		const bw = rows[0]?.length ?? 0;
		const bh = rows.length;
		const rect = getBarnStructureRect(barnTier, bw, bh);
		return {
			minX: rect.x + 1,
			maxX: rect.x + rect.w - 2,
			minY: rect.y + 1,
			maxY: rect.y + rect.h - 2,
		};
	}, [animalsMap, barnTier, activeMapLayouts.barn]);
	const barnAnimalCap = useMemo(() => getBarnAnimalCap(barnTier), [barnTier]);
	const barnSpawnPoint = useMemo(() => {
		const rows = activeMapLayouts.barn;
		const bw = rows[0]?.length ?? 0;
		const bh = rows.length;
		const rect = getBarnStructureRect(barnTier, bw, bh);
		if (isBarnExternal(barnTier)) {
			if (barnTier === 5) {
				return { x: Math.floor(bw / 2), y: Math.max(1, bh - 1) };
			}
			return { x: Math.floor(bw / 2), y: Math.max(1, bh - 2) };
		}
		return {
			x: rect.x + Math.floor(rect.w / 2),
			y: Math.max(rect.y + 1, rect.y + rect.h - 2),
		};
	}, [barnTier, activeMapLayouts.barn]);
	const mapDoors = useMemo(() => {
		const base = { ...doors };
		base.farm = [...doors.farm];
		base.barn = [];
		if (isBarnExternal(barnTier)) {
			base.farm = [
				...base.farm,
				...BARN_EXTERIOR_ENTRY_XS.map((x) => ({
					x,
					y: BARN_EXTERIOR_ENTRY_Y,
					target: { map: "barn" as MapId, x: barnSpawnPoint.x, y: barnSpawnPoint.y },
					label: "Barn Entrance",
				})),
			];
			const bw = activeMapLayouts.barn[0]?.length ?? 0;
			const bh = activeMapLayouts.barn.length;
			const exitY = bh - 1;
			const exitCenterX = Math.floor(bw / 2);
			base.barn = [
				{
					x: exitCenterX - 1,
					y: exitY,
					target: {
						map: "farm",
						x: BARN_EXTERIOR_ENTRY_XS[0],
						y: BARN_EXTERIOR_ENTRY_Y + 1,
					},
					label: "Farm Exit",
				},
				{
					x: exitCenterX,
					y: exitY,
					target: {
						map: "farm",
						x: BARN_EXTERIOR_ENTRY_XS[1],
						y: BARN_EXTERIOR_ENTRY_Y + 1,
					},
					label: "Farm Exit",
				},
			];
		}
		return base;
	}, [barnTier, barnSpawnPoint, activeMapLayouts.barn]);

	const isPassableChar = (c: string) => {
		if (
			c === "#" ||
			c === "T" ||
			c === "G" ||
			c === "O" ||
			c === "]" ||
			c === "<" ||
			c === ">" ||
			c === "*"
		)
			return false;
		if (c === "d" || c === "w" || c === "l" || c === "x" || c === "h") return false;
		if (c === "U" || c === "j" || c === "b") return false;
		if (c === "R" || c === "W" || c === "g" || c === "Q" || c === "H" || c === "B")
			return false;
		if ("sfa$tck".includes(c)) return false;
		if (c === "~" || c === "[") return false;
		return true;
	};

	useEffect(() => {
		shellRef.current?.focus();
		notificationRef.current = new Audio(notificationSoundSrc);
		notificationRef.current.preload = "auto";
		farmMusicRef.current = new Audio(bgFarmSrc);
		farmMusicRef.current.preload = "auto";
		farmMusicRef.current.loop = true;
		townMusicRef.current = new Audio(townBGSrc);
		townMusicRef.current.preload = "auto";
		townMusicRef.current.loop = true;
		beachAmbienceRef.current = new Audio(beachAmbienceSrc);
		beachAmbienceRef.current.preload = "auto";
		beachAmbienceRef.current.loop = true;
		beachAmbienceRef.current.volume = 0;
		houseMusicRef.current = new Audio(bgMusicSrc);
		houseMusicRef.current.preload = "auto";
		houseMusicRef.current.loop = true;
		forestMusicRef.current = new Audio(forestMusicSrc);
		forestMusicRef.current.preload = "auto";
		forestMusicRef.current.loop = true;
		caveMusicRef.current = new Audio(caveMusicSrc);
		caveMusicRef.current.preload = "auto";
		caveMusicRef.current.loop = true;
		chaChingRef.current = new Audio(chaChingSrc);
		chaChingRef.current.preload = "auto";
		endOfDayRef.current = new Audio(endOfDaySrc);
		endOfDayRef.current.preload = "auto";
		endOfDayRef.current.loop = true;
		hoeSoundRef.current = new Audio(hoeSoundSrc);
		hoeSoundRef.current.preload = "auto";
		munchSoundRef.current = new Audio(munchSoundSrc);
		munchSoundRef.current.preload = "auto";
		badSoundRef.current = new Audio(badSoundSrc);
		badSoundRef.current.preload = "auto";
		waterSoundRef.current = new Audio(waterSoundSrc);
		waterSoundRef.current.preload = "auto";
		yayaSoundRef.current = new Audio(yayaSoundSrc);
		yayaSoundRef.current.preload = "auto";
		tooTiredRef.current = new Audio(tooTiredSoundSrc);
		tooTiredRef.current.preload = "auto";
		gotRewardRef.current = new Audio(gotRewardSoundSrc);
		gotRewardRef.current.preload = "auto";
		snakeSoundRef.current = new Audio(snakeSoundSrc);
		snakeSoundRef.current.preload = "auto";
		bearSoundRef.current = new Audio(bearSoundSrc);
		bearSoundRef.current.preload = "auto";
		pooSoundRef.current = new Audio(pooSoundSrc);
		pooSoundRef.current.preload = "auto";
		bathSoundRef.current = new Audio(bathSoundSrc);
		bathSoundRef.current.preload = "auto";
		pluckSoundRef.current = new Audio(pluckSoundSrc);
		pluckSoundRef.current.preload = "auto";
		ploopSoundRef.current = new Audio(ploopSoundSrc);
		ploopSoundRef.current.preload = "auto";
		seagullsSoundRef.current = new Audio(seagullsSoundSrc);
		seagullsSoundRef.current.preload = "auto";
		meowSoundRef.current = new Audio(meowSoundSrc);
		meowSoundRef.current.preload = "auto";
		woofSoundRef.current = new Audio(woofSoundSrc);
		woofSoundRef.current.preload = "auto";
		tractorSoundRef.current = new Audio(tractorSoundSrc);
		tractorSoundRef.current.preload = "auto";
		tractorSoundRef.current.loop = true;
		cafeOrderMusicRef.current = new Audio(cafeOrderMusicSrc);
		cafeOrderMusicRef.current.preload = "auto";
		cafeOrderMusicRef.current.loop = true;
		ttsReadyRef.current =
			typeof window !== "undefined" && "speechSynthesis" in window;
	}, []);

	const playNotification = () => {
		const sound = notificationRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playChaChing = () => {
		const sound = chaChingRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playHoe = () => {
		const sound = hoeSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playMunch = () => {
		const sound = munchSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playBad = () => {
		const sound = badSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playTooTired = () => {
		const sound = tooTiredRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
		setShowTiredFace(true);
		if (tiredFaceTimeoutRef.current !== null) {
			window.clearTimeout(tiredFaceTimeoutRef.current);
		}
		tiredFaceTimeoutRef.current = window.setTimeout(() => {
			setShowTiredFace(false);
			tiredFaceTimeoutRef.current = null;
		}, 1000);

		const track = currentAreaMusicRef.current;
		if (track) {
			track.volume = 0.2;
			if (tiredDuckTimeoutRef.current !== null) {
				window.clearTimeout(tiredDuckTimeoutRef.current);
			}
			tiredDuckTimeoutRef.current = window.setTimeout(() => {
				if (currentAreaMusicRef.current) {
					currentAreaMusicRef.current.volume = 1;
				}
				tiredDuckTimeoutRef.current = null;
			}, 1000);
		}
	};

	const playWater = () => {
		const sound = waterSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playYaya = () => {
		const sound = yayaSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playGotReward = () => {
		const sound = gotRewardRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playSnakeSound = () => {
		const sound = snakeSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playBearSound = () => {
		const sound = bearSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playPooSound = () => {
		const sound = pooSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playBath = () => {
		const sound = bathSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playPluck = () => {
		const sound = pluckSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playPloop = () => {
		const sound = ploopSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const playSeagulls = () => {
		const sound = seagullsSoundRef.current;
		if (!sound) return;
		if (seagullsFadeIntervalRef.current !== null) {
			window.clearInterval(seagullsFadeIntervalRef.current);
			seagullsFadeIntervalRef.current = null;
		}
		sound.volume = 1;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const fadeOutSeagulls = (durationMs = 650) => {
		const sound = seagullsSoundRef.current;
		if (!sound) return;
		if (seagullsFadeIntervalRef.current !== null) {
			window.clearInterval(seagullsFadeIntervalRef.current);
			seagullsFadeIntervalRef.current = null;
		}
		if (sound.paused || sound.volume <= 0) {
			sound.volume = 1;
			return;
		}
		const tickMs = 50;
		const startVolume = sound.volume;
		let elapsed = 0;
		seagullsFadeIntervalRef.current = window.setInterval(() => {
			elapsed += tickMs;
			const t = Math.min(elapsed / durationMs, 1);
			sound.volume = Math.max(0, startVolume * (1 - t));
			if (t >= 1) {
				if (seagullsFadeIntervalRef.current !== null) {
					window.clearInterval(seagullsFadeIntervalRef.current);
					seagullsFadeIntervalRef.current = null;
				}
				sound.pause();
				sound.currentTime = 0;
				sound.volume = 1;
			}
		}, tickMs);
	};

	const playPetSound = (pet: PetEmoji) => {
		const isCat = pet === "🐈" || pet === "🐈‍⬛"; // cat variants meow
		const sound = isCat ? meowSoundRef.current : woofSoundRef.current;
		if (!sound) return;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const startTractorLoop = () => {
		const sound = tractorSoundRef.current;
		if (!sound) return;
		sound.volume = 0.7;
		sound.currentTime = 0;
		void sound.play().catch(() => undefined);
	};

	const stopTractorLoop = () => {
		const sound = tractorSoundRef.current;
		if (!sound) return;
		sound.pause();
		sound.currentTime = 0;
	};

	const speakNpcLine = (line: string) => {
		if (!ttsReadyRef.current) return;
		const synth = window.speechSynthesis;
		try {
			synth.cancel();
			const utterance = new SpeechSynthesisUtterance(line);
			const voice = synth
				.getVoices()
				.find((v) => v.lang?.toLowerCase().startsWith("en"));
			if (voice) utterance.voice = voice;
			utterance.rate = 1;
			utterance.pitch = 1;
			utterance.volume = 1;
			synth.speak(utterance);
		} catch {
			// Ignore TTS issues so gameplay isn't interrupted.
		}
	};

	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;
		const initialTrack = farmMusicRef.current;
		if (initialTrack) {
			initialTrack.volume = 1;
			void initialTrack.play().catch(() => undefined);
			currentAreaMusicRef.current = initialTrack;
		}
	}, []);

	useEffect(
		() => () => {
			if (musicFadeIntervalRef.current !== null) {
				window.clearInterval(musicFadeIntervalRef.current);
			}
			if (fishingWaitTimeoutRef.current !== null) {
				window.clearTimeout(fishingWaitTimeoutRef.current);
			}
			if (fishingCatchTimeoutRef.current !== null) {
				window.clearTimeout(fishingCatchTimeoutRef.current);
			}
			if (fishingResolveTimeoutRef.current !== null) {
				window.clearTimeout(fishingResolveTimeoutRef.current);
			}
			if (fishingWaterIntervalRef.current !== null) {
				window.clearInterval(fishingWaterIntervalRef.current);
				fishingWaterIntervalRef.current = null;
			}
			if (waterRefillTileTimeoutRef.current !== null) {
				window.clearTimeout(waterRefillTileTimeoutRef.current);
				waterRefillTileTimeoutRef.current = null;
			}
			if (tiredDuckTimeoutRef.current !== null) {
				window.clearTimeout(tiredDuckTimeoutRef.current);
				tiredDuckTimeoutRef.current = null;
			}
			if (tiredFaceTimeoutRef.current !== null) {
				window.clearTimeout(tiredFaceTimeoutRef.current);
				tiredFaceTimeoutRef.current = null;
			}
			if (petRunoverBadTimeoutRef.current !== null) {
				window.clearTimeout(petRunoverBadTimeoutRef.current);
				petRunoverBadTimeoutRef.current = null;
			}
			if (forestHitTimeoutRef.current !== null) {
				window.clearTimeout(forestHitTimeoutRef.current);
				forestHitTimeoutRef.current = null;
			}
			if (orderMidTimeoutRef.current !== null) {
				window.clearTimeout(orderMidTimeoutRef.current);
				orderMidTimeoutRef.current = null;
			}
			if (orderCompleteTimeoutRef.current !== null) {
				window.clearTimeout(orderCompleteTimeoutRef.current);
				orderCompleteTimeoutRef.current = null;
			}
			if (orderRewardTimeoutRef.current !== null) {
				window.clearTimeout(orderRewardTimeoutRef.current);
				orderRewardTimeoutRef.current = null;
			}
			if (cafeObservationIntervalRef.current !== null) {
				window.clearInterval(cafeObservationIntervalRef.current);
				cafeObservationIntervalRef.current = null;
			}
			if (doctorProcessTimeoutRef.current !== null) {
				window.clearTimeout(doctorProcessTimeoutRef.current);
				doctorProcessTimeoutRef.current = null;
			}
			if (doctorRewardTimeoutRef.current !== null) {
				window.clearTimeout(doctorRewardTimeoutRef.current);
				doctorRewardTimeoutRef.current = null;
			}
			if (doctorObservationIntervalRef.current !== null) {
				window.clearInterval(doctorObservationIntervalRef.current);
				doctorObservationIntervalRef.current = null;
			}
			if (petHeartTimeoutRef.current !== null) {
				window.clearTimeout(petHeartTimeoutRef.current);
				petHeartTimeoutRef.current = null;
			}
			if (cafeShopkeeperMoveIntervalRef.current !== null) {
				window.clearInterval(cafeShopkeeperMoveIntervalRef.current);
				cafeShopkeeperMoveIntervalRef.current = null;
			}
			if (cloudIntervalRef.current !== null) {
				window.clearInterval(cloudIntervalRef.current);
				cloudIntervalRef.current = null;
			}
			if (beachPauseTimeoutRef.current !== null) {
				window.clearTimeout(beachPauseTimeoutRef.current);
				beachPauseTimeoutRef.current = null;
			}
			if (seagullsFadeIntervalRef.current !== null) {
				window.clearInterval(seagullsFadeIntervalRef.current);
				seagullsFadeIntervalRef.current = null;
			}
			if (grassWindStartTimeoutRef.current !== null) {
				window.clearTimeout(grassWindStartTimeoutRef.current);
				grassWindStartTimeoutRef.current = null;
			}
			if (grassWindSweepIntervalRef.current !== null) {
				window.clearInterval(grassWindSweepIntervalRef.current);
				grassWindSweepIntervalRef.current = null;
			}
			grassWindBandStartTimeoutsRef.current.forEach((id) =>
				window.clearTimeout(id),
			);
			grassWindBandStartTimeoutsRef.current = [];
			if (cafeOrderMusicRef.current) {
				cafeOrderMusicRef.current.pause();
				cafeOrderMusicRef.current.currentTime = 0;
			}
			if (caveMusicRef.current) {
				caveMusicRef.current.pause();
				caveMusicRef.current.currentTime = 0;
			}
			if (tractorSoundRef.current) {
				tractorSoundRef.current.pause();
				tractorSoundRef.current.currentTime = 0;
			}
			if (beachAmbienceRef.current) {
				beachAmbienceRef.current.pause();
				beachAmbienceRef.current.currentTime = 0;
			}
			if (seagullsSoundRef.current) {
				seagullsSoundRef.current.pause();
				seagullsSoundRef.current.currentTime = 0;
				seagullsSoundRef.current.volume = 1;
			}
			stopTownBeachFade();
			dayTransitionCloseTimersRef.current.forEach((id) =>
				window.clearTimeout(id),
			);
			dayTransitionCloseTimersRef.current = [];
			if (ttsReadyRef.current) {
				window.speechSynthesis.cancel();
			}
		},
		[],
	);

	const getAreaMusicForMap = (mapId: MapId) => {
		if (mapId === "farm") return farmMusicRef.current;
		if (mapId === "town" || isShopMap(mapId)) return townMusicRef.current;
		if (mapId === "forest") return forestMusicRef.current;
		if (mapId === "cave") return caveMusicRef.current;
		return houseMusicRef.current;
	};

	const stopAreaFade = () => {
		if (musicFadeIntervalRef.current !== null) {
			window.clearInterval(musicFadeIntervalRef.current);
			musicFadeIntervalRef.current = null;
		}
		musicFadeFromRef.current = null;
		musicFadeToRef.current = null;
	};

	const stopTownBeachFade = () => {
		if (townBeachFadeIntervalRef.current !== null) {
			window.clearInterval(townBeachFadeIntervalRef.current);
			townBeachFadeIntervalRef.current = null;
		}
	};

	const markBgMusicTransition = (durationMs: number) => {
		bgMusicTransitionUntilRef.current = Date.now() + durationMs + 250;
	};

	const stopStaleBackgroundTracks = () => {
		const now = Date.now();
		const allowed = new Set<HTMLAudioElement>();
		const areaTracks = [
			farmMusicRef.current,
			townMusicRef.current,
			houseMusicRef.current,
			forestMusicRef.current,
			caveMusicRef.current,
			endOfDayRef.current,
			cafeOrderMusicRef.current,
			beachAmbienceRef.current,
		].filter((t): t is HTMLAudioElement => t !== null);

		if (musicFadeFromRef.current) allowed.add(musicFadeFromRef.current);
		if (musicFadeToRef.current) allowed.add(musicFadeToRef.current);

		if (dayTransition) {
			if (endOfDayRef.current) allowed.add(endOfDayRef.current);
		} else if (isOrdering || isDoctorCompounding) {
			if (cafeOrderMusicRef.current) allowed.add(cafeOrderMusicRef.current);
		} else if (!fishing) {
			const intended = getAreaMusicForMap(playerRef.current.map);
			if (intended) allowed.add(intended);
			if (
				playerRef.current.map === "town" ||
				townBeachFadeIntervalRef.current !== null
			) {
				if (townMusicRef.current) allowed.add(townMusicRef.current);
				if (beachAmbienceRef.current) allowed.add(beachAmbienceRef.current);
			}
		}

		const withinTransitionWindow = now < bgMusicTransitionUntilRef.current;
		areaTracks.forEach((track) => {
			if (allowed.has(track)) return;
			if (withinTransitionWindow) return;
			if (!track.paused) {
				track.pause();
			}
			track.currentTime = 0;
			track.volume = 1;
		});
	};

	const fadeTownAndBeach = (
		targetTownVolume: number,
		targetBeachVolume: number,
		durationMs = 650,
	) => {
		const townTrack = townMusicRef.current;
		const beachTrack = beachAmbienceRef.current;
		if (!townTrack || !beachTrack) return;
		stopTownBeachFade();
		const startTown = townTrack.volume;
		const startBeach = beachTrack.volume;
		const deltaTown = targetTownVolume - startTown;
		const deltaBeach = targetBeachVolume - startBeach;
		if (Math.abs(deltaTown) < 0.001 && Math.abs(deltaBeach) < 0.001) return;
		markBgMusicTransition(durationMs);
		const tickMs = 50;
		let elapsed = 0;
		townBeachFadeIntervalRef.current = window.setInterval(() => {
			elapsed += tickMs;
			const t = Math.min(elapsed / durationMs, 1);
			townTrack.volume = startTown + deltaTown * t;
			beachTrack.volume = startBeach + deltaBeach * t;
			if (t >= 1) {
				stopTownBeachFade();
			}
		}, tickMs);
	};

	const stopEndOfDaySong = () => {
		const track = endOfDayRef.current;
		if (!track) return;
		track.volume = 1;
		track.loop = false;
		track.pause();
		track.currentTime = 0;
		track.load();
		track.loop = true;
	};

	const fadeOutCurrentAreaMusic = (durationMs = 450) => {
		const track = currentAreaMusicRef.current;
		if (!track) return;
		stopAreaFade();
		musicFadeFromRef.current = track;
		musicFadeToRef.current = null;
		markBgMusicTransition(durationMs);
		const tickMs = 50;
		const startVolume = track.volume;
		let elapsed = 0;
		musicFadeIntervalRef.current = window.setInterval(() => {
			elapsed += tickMs;
			const t = Math.min(elapsed / durationMs, 1);
			track.volume = Math.max(0, startVolume * (1 - t));
			if (t >= 1) {
				stopAreaFade();
				track.pause();
				track.currentTime = 0;
				track.volume = 1;
				stopStaleBackgroundTracks();
			}
		}, tickMs);
	};

	const switchAreaMusic = (
		target: HTMLAudioElement | null,
		instant = false,
	) => {
		if (!target) return;
		stopAreaFade();
		stopEndOfDaySong();

		const current = currentAreaMusicRef.current;
		if (!current) {
			target.volume = 1;
			void target.play().catch(() => undefined);
			currentAreaMusicRef.current = target;
			stopStaleBackgroundTracks();
			return;
		}

		if (current === target) {
			if (current.paused) {
				current.volume = 1;
				void current.play().catch(() => undefined);
			}
			stopStaleBackgroundTracks();
			return;
		}

		if (instant) {
			current.pause();
			current.currentTime = 0;
			target.volume = 1;
			void target.play().catch(() => undefined);
			currentAreaMusicRef.current = target;
			stopStaleBackgroundTracks();
			return;
		}

		target.volume = 0;
		void target.play().catch(() => undefined);
		const durationMs = 2000;
		musicFadeFromRef.current = current;
		musicFadeToRef.current = target;
		markBgMusicTransition(durationMs);
		const tickMs = 50;
		let elapsed = 0;
		musicFadeIntervalRef.current = window.setInterval(() => {
			elapsed += tickMs;
			const t = Math.min(elapsed / durationMs, 1);
			current.volume = 1 - t;
			target.volume = t;
			if (t >= 1) {
				stopAreaFade();
				current.pause();
				current.currentTime = 0;
				current.volume = 1;
				target.volume = 1;
				stopStaleBackgroundTracks();
			}
		}, tickMs);
		currentAreaMusicRef.current = target;
	};

	const clearFishingTimers = () => {
		if (fishingWaitTimeoutRef.current !== null) {
			window.clearTimeout(fishingWaitTimeoutRef.current);
			fishingWaitTimeoutRef.current = null;
		}
		if (fishingCatchTimeoutRef.current !== null) {
			window.clearTimeout(fishingCatchTimeoutRef.current);
			fishingCatchTimeoutRef.current = null;
		}
		if (fishingResolveTimeoutRef.current !== null) {
			window.clearTimeout(fishingResolveTimeoutRef.current);
			fishingResolveTimeoutRef.current = null;
		}
		if (fishingWaterIntervalRef.current !== null) {
			window.clearInterval(fishingWaterIntervalRef.current);
			fishingWaterIntervalRef.current = null;
		}
	};

	const endFishing = () => {
		clearFishingTimers();
		setFishing(null);
		if (!dayTransition && !modal) {
			switchAreaMusic(getAreaMusicForMap(playerRef.current.map), true);
		}
	};

	const startFishing = (map: MapId, x: number, y: number) => {
		if (fishing || modal || dayTransition) return;
		clearFishingTimers();
		playWater();
		fishingWaterIntervalRef.current = window.setInterval(() => {
			playWater();
		}, 3000);
		fadeOutCurrentAreaMusic();
		setFishing({
			map,
			x,
			y,
			phase: "waiting",
			requiredKey: "",
		});
		addLog("You cast your line...");
		const maxWaitSeconds = getFishingRodMaxWaitSeconds(tools);
		const waitMs = randomInt(2, maxWaitSeconds) * 1000;
		fishingWaitTimeoutRef.current = window.setTimeout(() => {
			const keys = "abcdefghijklmnopqrstuvwxyz";
			const requiredKey = keys[randomInt(0, keys.length - 1)]!;
			if (fishingWaterIntervalRef.current !== null) {
				window.clearInterval(fishingWaterIntervalRef.current);
				fishingWaterIntervalRef.current = null;
			}
			setFishing((prev) =>
				prev
					? {
							...prev,
							phase: "bite",
							requiredKey,
						}
					: prev,
			);
			fishingCatchTimeoutRef.current = window.setTimeout(() => {
				playBad();
				addLog("The fish got away.");
				endFishing();
			}, 2000);
		}, waitMs);
	};

	useEffect(() => {
		if (dayTransition) return;
		switchAreaMusic(getAreaMusicForMap(player.map), false);
	}, [player.map, dayTransition]);

	useEffect(() => {
		stopStaleBackgroundTracks();
	}, [player.map, dayTransition, isOrdering, isDoctorCompounding, fishing]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			stopStaleBackgroundTracks();
		}, 900);
		return () => window.clearInterval(interval);
	}, [dayTransition, isOrdering, isDoctorCompounding, fishing]);

	useEffect(() => {
		const beachTrack = beachAmbienceRef.current;
		if (!beachTrack) return;
		if (beachPauseTimeoutRef.current !== null) {
			window.clearTimeout(beachPauseTimeoutRef.current);
			beachPauseTimeoutRef.current = null;
		}

		if (player.map !== "town") {
			fadeTownAndBeach(townMusicRef.current?.volume ?? 1, 0);
			beachPauseTimeoutRef.current = window.setTimeout(() => {
				if (playerRef.current.map !== "town" && beachAmbienceRef.current) {
					beachAmbienceRef.current.pause();
					beachAmbienceRef.current.currentTime = 0;
				}
				beachPauseTimeoutRef.current = null;
			}, 700);
			return;
		}
		if (beachTrack.paused) {
			void beachTrack.play().catch(() => undefined);
		}
		const lowestGrassY = TOWN_SAND_Y - 1;
		if (player.y >= lowestGrassY) {
			fadeTownAndBeach(0, 0.8);
			return;
		}
		if (player.y === lowestGrassY - 1) {
			fadeTownAndBeach(0.5, 0.4);
			return;
		}
		fadeTownAndBeach(1, 0);
	}, [player.map, player.y]);

	useEffect(() => {
		playerRef.current = player;
	}, [player]);

	useEffect(() => {
		if (!isDrivingTractor) {
			stopTractorLoop();
			return;
		}
		if (tractorImplementOn) {
			startTractorLoop();
		} else {
			stopTractorLoop();
		}
	}, [isDrivingTractor, tractorImplementOn]);

	useEffect(() => {
		if (player.map !== "farm") return;
		if (!ownedPet) {
			setPetTile(null);
			return;
		}
		setPetTile(randomFarmPetSpawn());
	}, [player.map, ownedPet]);

	useEffect(() => {
		if (player.map !== "forest") return;
		if (forestIsBonusLevel) return;
		const rows = activeMapLayouts.forest;
		setForestFog((prev) => {
			let changed = false;
			const next = { ...prev };
			for (let y = 0; y < rows.length; y += 1) {
				const row = rows[y];
				if (!row) continue;
				for (let x = 0; x < row.length; x += 1) {
					const key = keyForPos(x, y);
					const current = prev[key] ?? 1;
					const target = getForestFogTargetOpacity(x, y, player.x, player.y);
					const updated = Math.min(current, target);
					if (updated !== current) {
						next[key] = updated;
						changed = true;
					}
				}
			}
			return changed ? next : prev;
		});
	}, [
		player.map,
		player.x,
		player.y,
		playerEmoji,
		hasHeadlamp,
		activeMapLayouts,
		forestIsBonusLevel,
	]);

	useEffect(() => {
		if (player.map !== "cave") return;
		const rows = activeMapLayouts.cave;
		setCaveFog((prev) => {
			let changed = false;
			const next = { ...prev };
			for (let y = 0; y < rows.length; y += 1) {
				const row = rows[y];
				if (!row) continue;
				for (let x = 0; x < row.length; x += 1) {
					const key = keyForPos(x, y);
					const current = prev[key] ?? 1;
					const target = getForestFogTargetOpacity(x, y, player.x, player.y);
					const updated = Math.min(current, target);
					if (updated !== current) {
						next[key] = updated;
						changed = true;
					}
				}
			}
			return changed ? next : prev;
		});
	}, [player.map, player.x, player.y, playerEmoji, hasHeadlamp, activeMapLayouts]);

	useEffect(() => {
		const shouldAnimate = isOrdering && player.map === "cafe_shop";
		if (!shouldAnimate) {
			if (cafeShopkeeperMoveIntervalRef.current !== null) {
				window.clearInterval(cafeShopkeeperMoveIntervalRef.current);
				cafeShopkeeperMoveIntervalRef.current = null;
			}
			cafeShopkeeperDirRef.current = 1;
			setCafeShopkeeperX(7);
			return;
		}

		if (cafeShopkeeperMoveIntervalRef.current !== null) {
			window.clearInterval(cafeShopkeeperMoveIntervalRef.current);
		}
		cafeShopkeeperMoveIntervalRef.current = window.setInterval(() => {
			setCafeShopkeeperX((prev) => {
				let next = prev + cafeShopkeeperDirRef.current;
				if (next >= 10) {
					next = 10;
					cafeShopkeeperDirRef.current = -1;
				} else if (next <= 4) {
					next = 4;
					cafeShopkeeperDirRef.current = 1;
				}
				return next;
			});
		}, 260);

		return () => {
			if (cafeShopkeeperMoveIntervalRef.current !== null) {
				window.clearInterval(cafeShopkeeperMoveIntervalRef.current);
				cafeShopkeeperMoveIntervalRef.current = null;
			}
		};
	}, [isOrdering, player.map]);

	useEffect(() => {
		const showClouds = player.map === "farm" || player.map === "town";
		if (!showClouds) {
			setClouds([]);
			if (cloudIntervalRef.current !== null) {
				window.clearInterval(cloudIntervalRef.current);
				cloudIntervalRef.current = null;
			}
			return;
		}

		const rainy = currentWeather === "rainy";
		const fullDistance = 108 + 14;
		const makeCloud = (spawnFromRight: boolean): CloudSprite => {
			const startX = spawnFromRight
				? 108 + Math.random() * 12
				: Math.random() * 108;
			const baseDuration = rainy
				? 44 + Math.random() * 18
				: 52 + Math.random() * 24;
			const durationSec = Math.max(
				10,
				baseDuration * ((startX + 14) / fullDistance),
			);
			return {
				id: nextCloudIdRef.current++,
				startX,
				y: 4 + Math.random() * 60,
				size: rainy ? 1 + Math.random() * 0.45 : 0.95 + Math.random() * 0.35,
				durationSec,
				glyph: rainy ? "🌧️" : "☁️", // rainy cloud / cloud
			};
		};

		setClouds(() => {
			const initialCount = rainy ? randomInt(7, 10) : randomInt(2, 3);
			const initial = Array.from({ length: initialCount }, () =>
				makeCloud(false),
			);
			return initial;
		});

		if (cloudIntervalRef.current !== null) {
			window.clearInterval(cloudIntervalRef.current);
		}
		cloudIntervalRef.current = window.setInterval(() => {
			setClouds((prev) => {
				const next = [...prev];
				const minClouds = rainy ? 7 : 2;
				const maxClouds = rainy ? 10 : 3;
				if (next.length < minClouds) {
					next.push(makeCloud(true));
				} else if (next.length < maxClouds) {
					const spawnChance = rainy ? 0.42 : 0.28;
					if (Math.random() < spawnChance) next.push(makeCloud(true));
				}
				return next;
			});
		}, 1100);

		return () => {
			if (cloudIntervalRef.current !== null) {
				window.clearInterval(cloudIntervalRef.current);
				cloudIntervalRef.current = null;
			}
		};
	}, [player.map, currentWeather]);

	useEffect(() => {
		const clearWindTimers = () => {
			if (grassWindStartTimeoutRef.current !== null) {
				window.clearTimeout(grassWindStartTimeoutRef.current);
				grassWindStartTimeoutRef.current = null;
			}
			if (grassWindSweepIntervalRef.current !== null) {
				window.clearInterval(grassWindSweepIntervalRef.current);
				grassWindSweepIntervalRef.current = null;
			}
			grassWindBandStartTimeoutsRef.current.forEach((id) =>
				window.clearTimeout(id),
			);
			grassWindBandStartTimeoutsRef.current = [];
		};

		const hasAnyGrass = activeMapLayouts[player.map].some((row) =>
			row.includes(","),
		);
		if (!hasAnyGrass || currentWeather !== "windy") {
			clearWindTimers();
			setGrassWindBands([]);
			return;
		}

		const rows = activeMapLayouts[player.map];
		const mapWidth = rows[0]?.length ?? 0;
		const mapHeight = rows.length;
		const bandWidth = Math.max(6, Math.floor(mapWidth * 0.14));
		const endX = -bandWidth;
		const risePerStep = 0.08;

		const spawnBand = (delayMs = 0) => {
			const id = window.setTimeout(() => {
				grassWindBandStartTimeoutsRef.current =
					grassWindBandStartTimeoutsRef.current.filter((t) => t !== id);
				const startY = randomInt(
					Math.max(1, Math.floor(mapHeight * 0.45)),
					Math.max(2, mapHeight - 3),
				);
				setGrassWindBands((prev) => [
					...prev,
					{
						id: nextWindBandIdRef.current++,
						map: player.map,
						frontX: mapWidth + bandWidth,
						baseY: startY,
						frame: 0,
					},
				]);
			}, delayMs);
			grassWindBandStartTimeoutsRef.current.push(id);
		};

		clearWindTimers();
		// Continuous movement update for all active bands.
		grassWindSweepIntervalRef.current = window.setInterval(() => {
			setGrassWindBands((prev) =>
				prev
					.map((band) => ({
						...band,
						frontX: band.frontX - 1,
						baseY: band.baseY - risePerStep,
						frame: band.frame + 1,
					}))
					.filter((band) => band.frontX >= endX),
			);
		}, 120);

		// Spawn new sweeps at random intervals regardless of current active sweeps.
		const scheduleNextSpawn = () => {
			const delay = randomInt(1000, 10000);
			grassWindStartTimeoutRef.current = window.setTimeout(() => {
				const bandCount = randomInt(2, 3);
				for (let i = 0; i < bandCount; i += 1) {
					spawnBand(i * 1000);
				}
				scheduleNextSpawn();
			}, delay);
		};

		// Kick off an immediate subtle first wave, then randomized spawning.
		const initialBands = randomInt(2, 3);
		for (let i = 0; i < initialBands; i += 1) {
			spawnBand(i * 1000);
		}
		scheduleNextSpawn();

		return () => {
			clearWindTimers();
			setGrassWindBands([]);
		};
	}, [player.map, plots, currentWeather]);

	useEffect(() => {
		setOwnedWardrobeLooks((prev) => {
			const unique = Array.from(new Set(prev));
			const valid = unique.filter((look) =>
				allWardrobeLooks.includes(look as (typeof allWardrobeLooks)[number]),
			);
			const merged = Array.from(new Set([...starterWardrobeLooks, ...valid]));
			if (
				merged.length === prev.length &&
				merged.every((v, i) => v === prev[i])
			) {
				return prev;
			}
			return merged;
		});
	}, []);

	useEffect(() => {
		if (!ownedWardrobeLooks.includes(playerEmoji)) {
			setPlayerEmoji(ownedWardrobeLooks[0] ?? starterWardrobeLooks[0]);
		}
	}, [ownedWardrobeLooks, playerEmoji]);

	useEffect(() => {
		quantityPromptRef.current = quantityPrompt;
	}, [quantityPrompt]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			setWaterRipplePhase((v) => !v);
		}, 2000);
		return () => window.clearInterval(interval);
	}, []);

	const isRippleWaterTile = (mapId: MapId, x: number, y: number) => {
		const row = activeMapLayouts[mapId]?.[y];
		if (!row || row[x] !== "~") return false;
		// Deterministic sparse ripple mask: about 5% of water cells.
		const mapSalt = mapId.charCodeAt(0) + mapId.length * 13;
		const hash = (x * 73 + y * 97 + mapSalt) % 20;
		return hash === 0;
	};

	const isAnimatedGrassTile = (mapId: MapId, x: number, y: number) => {
		const row = activeMapLayouts[mapId]?.[y];
		if (!row || row[x] !== ",") return false;
		// Deterministic sparse foliage mask: about 5% of grass cells.
		const mapSalt = mapId.charCodeAt(0) + mapId.length * 29;
		const hash = (x * 41 + y * 113 + mapSalt) % 20;
		return hash === 0;
	};

	const grassFoliageVariant = (mapId: MapId, x: number, y: number) => {
		const mapSalt = mapId.charCodeAt(0) + mapId.length * 11;
		return (x * 17 + y * 31 + mapSalt) % 3;
	};

	const isWindSlashOn = (x: number, y: number) => {
		const baseRow = activeMapLayouts[player.map]?.[y];
		if (!baseRow || baseRow[x] !== ",") return false;
		if (player.map === "farm" && !!plots[keyForPos(x, y)]) return false;
		const bandWidth = Math.max(6, Math.floor(width * 0.14));
		const thickness = 1.35;
		return grassWindBands.some((wind) => {
			if (wind.map !== player.map) return false;
			const dx = wind.frontX - x;
			if (dx < 0 || dx > bandWidth) return false;
			const projectedY = wind.baseY - dx * 0.14;
			if (Math.abs(y - projectedY) > thickness) return false;
			// Lighter density for subtler effect.
			return (x * 5 + y * 7 + wind.frame) % 2 === 0;
		});
	};

	const crossFadeEndOfDayTo = (target: HTMLAudioElement | null, durationMs = 1000) => {
		const endTrack = endOfDayRef.current;
		if (!target) {
			stopEndOfDaySong();
			return;
		}
		if (!endTrack) {
			target.volume = 1;
			void target.play().catch(() => undefined);
			currentAreaMusicRef.current = target;
			return;
		}
		stopAreaFade();
		target.volume = 0;
		void target.play().catch(() => undefined);
		if (endTrack) {
			musicFadeFromRef.current = endTrack;
		}
		musicFadeToRef.current = target;
		markBgMusicTransition(durationMs);
		const tickMs = 50;
		let elapsed = 0;
		musicFadeIntervalRef.current = window.setInterval(() => {
			elapsed += tickMs;
			const t = Math.min(elapsed / durationMs, 1);
			endTrack.volume = 1 - t;
			target.volume = t;
			if (t >= 1) {
				stopAreaFade();
				endTrack.pause();
				endTrack.currentTime = 0;
				endTrack.volume = 1;
				target.volume = 1;
				currentAreaMusicRef.current = target;
				stopStaleBackgroundTracks();
			}
		}, tickMs);
	};

	const getForestFogTargetOpacity = (
		x: number,
		y: number,
		playerX: number,
		playerY: number,
	) => {
		let visionBoost = 1;
		if (playerEmoji === "💡") visionBoost *= 2; // lightbulb outfit secret vision boost
		if (hasHeadlamp) visionBoost *= 2;
		const dist =
			Math.max(Math.abs(x - playerX), Math.abs(y - playerY)) / visionBoost;
		if (dist <= 3) return 0;
		if (dist <= 4) return 0.5;
		if (dist <= 6) return 0.9;
		return 1;
	};

	const getForestFogOpacity = (x: number, y: number) => {
		if (player.map !== "forest") return 0;
		if (forestIsBonusLevel) return 0;
		return forestFog[keyForPos(x, y)] ?? 1;
	};

	const getCaveFogOpacity = (x: number, y: number) => {
		if (player.map !== "cave") return 0;
		return caveFog[keyForPos(x, y)] ?? 1;
	};

	const getDoorGroundClass = (mapId: MapId, x: number, y: number) => {
		const dirs = [
			{ dx: 0, dy: 1 },
			{ dx: 0, dy: -1 },
			{ dx: -1, dy: 0 },
			{ dx: 1, dy: 0 },
		];
		for (const { dx, dy } of dirs) {
			const ny = y + dy;
			const nx = x + dx;
			const tile = activeMapLayouts[mapId]?.[ny]?.[nx];
			if (!tile || tile === "+") continue;
			const cls = groundClassForTile(tile, mapId);
			if (cls) return cls;
		}
		return undefined;
	};

	const isFarmHouseDoorTile = (mapId: MapId, x: number, y: number) =>
		mapId === "farm" &&
		mapDoors.farm.some((d) => d.x === x && d.y === y && d.target.map === "house");

	const forestObstacleAt = (x: number, y: number) =>
		forestObstacles.find((o) => o.x === x && o.y === y) ?? null;
	const caveObstacleAt = (x: number, y: number) =>
		caveObstacles.find((o) => o.x === x && o.y === y) ?? null;

	const isForestOccupied = (x: number, y: number, ignoreEnemyId?: number) =>
		forestObstacles.some((o) => o.x === x && o.y === y) ||
		forestEnemies.some((e) => e.id !== ignoreEnemyId && e.x === x && e.y === y);
	const isCaveOccupied = (x: number, y: number, ignoreEnemyId?: number) =>
		caveObstacles.some((o) => o.x === x && o.y === y) ||
		caveEnemies.some((e) => e.id !== ignoreEnemyId && e.x === x && e.y === y);

	const isPassableAt = (map: MapId, x: number, y: number) => {
		if (x < 0 || y < 0) return false;
		const rows = activeMapLayouts[map];
		if (!rows || y >= rows.length || x >= (rows[0]?.length ?? 0)) return false;
		if (map === "forest") {
			const tile = rows[y]?.[x] ?? "T";
			if (!isForestWalkableTile(tile) || isForestBlockedTile(tile))
				return false;
			if (!forestChest.opened && forestChest.x === x && forestChest.y === y)
				return false;
			if (
				forestBonusChests.some(
					(chest) => !chest.opened && chest.x === x && chest.y === y,
				)
			)
				return false;
			if (isForestOccupied(x, y)) return false;
			return true;
		}
		if (map === "cave") {
			const tile = rows[y]?.[x] ?? "<";
			if (!isCaveWalkableTile(tile) || isCaveBlockedTile(tile)) return false;
			if (caveLadderPos && x === caveLadderPos.x && y === caveLadderPos.y) {
				return true;
			}
			if (isCaveOccupied(x, y)) return false;
			return true;
		}
		if (
			map === "farm" &&
			day === 1 &&
			!starterChestOpened &&
			x === STARTER_CHEST_POS.x &&
			y === STARTER_CHEST_POS.y
		)
			return false;
		if (map === "farm" && farmForestBlockers[keyForPos(x, y)]) return false;
		if (map === "farm" && farmCaveBlockers[keyForPos(x, y)]) return false;
		if (map === "farm" && petGraveObstacles[keyForPos(x, y)]) return false;
		if (map === "farm" && farmWeedObstacles[keyForPos(x, y)]) return false;
		if (map === "farm" && farmEggDrops[keyForPos(x, y)]) return false;
		if (
			map === "town" &&
			beachBottlePos &&
			beachBottlePos.x === x &&
			beachBottlePos.y === y
		)
			return false;
		if (map === "town" && beachShellDrops[keyForPos(x, y)]) return false;
		if (map === animalsMap && farmEggDrops[keyForPos(x, y)]) return false;
		const tile = rows[y]?.[x] ?? "#";
		return isPassableChar(tile);
	};

	const canEnterForest = () => stamina > 0;
	const canEnterCave = () => stamina > 0;

	const applyForestDamage = (amount: number, source: string) => {
		if (playerRef.current.map !== "forest" || amount <= 0) return;
		playBad();
		setShowForestHit(true);
		if (forestHitTimeoutRef.current !== null) {
			window.clearTimeout(forestHitTimeoutRef.current);
		}
		forestHitTimeoutRef.current = window.setTimeout(() => {
			setShowForestHit(false);
			forestHitTimeoutRef.current = null;
		}, 180);
		setStamina((prev) => {
			const next = Math.max(0, prev - amount);
			if (next <= 0) {
				setForestLockedToday(true);
				setPlayer({ map: "farm", x: FARM_WIDTH - 2, y: FOREST_GATE_Y });
				addLog("You collapsed in the forest and woke up back on the farm.");
			} else {
				addLog(`${source} hit you for ${amount} stamina.`);
			}
			return next;
		});
	};

	const maybeMoveForestEnemy = (
		enemy: ForestEnemy,
		isHalfTick: boolean,
	): ForestEnemy => {
		if (pauseGame) return enemy;
		const playerNow = playerRef.current;
		const playerInForest = playerNow.map === "forest";

		if (enemy.type === "snake") {
			const state = forestSnakeDirsRef.current[enemy.id] ?? {
				hDir: 1 as -1 | 1,
				vDir: 1 as -1 | 1,
				verticalMode: false,
			};
			const wasWithinOneTile =
				playerInForest &&
				Math.max(
					Math.abs(enemy.x - playerNow.x),
					Math.abs(enemy.y - playerNow.y),
				) <= 1;
			const tryDamage = (nx: number, ny: number) => {
				if (playerInForest && nx === playerNow.x && ny === playerNow.y) {
					playSnakeSound();
					applyForestDamage(20, "A snake");
					return true;
				}
				return false;
			};
			const canStep = (nx: number, ny: number) =>
				isPassableAt("forest", nx, ny) && !isForestOccupied(nx, ny, enemy.id);
			const tryHorizontal = (dir: -1 | 1): ForestEnemy | null => {
				const nx = enemy.x + dir;
				const ny = enemy.y;
				if (tryDamage(nx, ny)) return enemy;
				if (!canStep(nx, ny)) return null;
				state.hDir = dir;
				state.verticalMode = false;
				forestSnakeDirsRef.current[enemy.id] = state;
				if (wasWithinOneTile) {
					playSnakeSound();
					applyForestDamage(20, "A snake");
				}
				return { ...enemy, x: nx, y: ny };
			};

			if (!state.verticalMode) {
				const firstTry = tryHorizontal(state.hDir);
				if (firstTry) return firstTry;
				const opposite = (state.hDir * -1) as -1 | 1;
				const secondTry = tryHorizontal(opposite);
				if (secondTry) return secondTry;
				state.hDir = opposite;
				state.verticalMode = true;
				forestSnakeDirsRef.current[enemy.id] = state;
				return enemy;
			}
			// While in vertical mode, keep checking if horizontal became available.
			const horizontalNow = tryHorizontal(state.hDir);
			if (horizontalNow) return horizontalNow;
			const horizontalOpposite = tryHorizontal((state.hDir * -1) as -1 | 1);
			if (horizontalOpposite) return horizontalOpposite;

			let nx = enemy.x;
			let ny = enemy.y + state.vDir;
			if (tryDamage(nx, ny)) return enemy;
			if (canStep(nx, ny)) {
				forestSnakeDirsRef.current[enemy.id] = state;
				if (wasWithinOneTile) {
					playSnakeSound();
					applyForestDamage(20, "A snake");
				}
				return { ...enemy, x: nx, y: ny };
			}
			state.vDir = (state.vDir * -1) as -1 | 1;
			nx = enemy.x;
			ny = enemy.y + state.vDir;
			if (tryDamage(nx, ny)) return enemy;
			if (canStep(nx, ny)) {
				forestSnakeDirsRef.current[enemy.id] = state;
				if (wasWithinOneTile) {
					playSnakeSound();
					applyForestDamage(20, "A snake");
				}
				return { ...enemy, x: nx, y: ny };
			}
			forestSnakeDirsRef.current[enemy.id] = state;
			return enemy;
		}

		if (enemy.type === "poop") {
			const playerInPoopArea =
				playerInForest &&
				Math.max(
					Math.abs(playerNow.x - enemy.x),
					Math.abs(playerNow.y - enemy.y),
				) <= 6;
			const wasAggro = forestAggroRef.current[enemy.id] ?? false;
			if (playerInPoopArea && !wasAggro) playPooSound();
			forestAggroRef.current[enemy.id] = playerInPoopArea;
			if (!playerInPoopArea && isHalfTick) return enemy;
			if (playerInPoopArea) {
				const stepX = playerNow.x === enemy.x ? 0 : playerNow.x > enemy.x ? 1 : -1;
				const stepY = playerNow.y === enemy.y ? 0 : playerNow.y > enemy.y ? 1 : -1;
				const chaseDirs = [
					{ dx: stepX, dy: stepY },
					{ dx: stepX, dy: 0 },
					{ dx: 0, dy: stepY },
				];
				for (const delta of chaseDirs) {
					const nx = enemy.x + delta.dx;
					const ny = enemy.y + delta.dy;
					if (playerInForest && nx === playerNow.x && ny === playerNow.y) {
						playPooSound();
						applyForestDamage(10, "A hostile poop");
						return enemy;
					}
					if (!isPassableAt("forest", nx, ny)) continue;
					if (isForestOccupied(nx, ny, enemy.id)) continue;
					return { ...enemy, x: nx, y: ny };
				}
				return enemy;
			}
			if (Math.random() > 0.25) return enemy;
			const shuffled = Object.values(npcMoveDirections).sort(
				() => Math.random() - 0.5,
			);
			for (const delta of shuffled) {
				const nx = enemy.x + delta.dx;
				const ny = enemy.y + delta.dy;
				if (
					Math.max(Math.abs(nx - enemy.anchorX), Math.abs(ny - enemy.anchorY)) >
					3
				) {
					continue;
				}
				if (!isPassableAt("forest", nx, ny)) continue;
				if (isForestOccupied(nx, ny, enemy.id)) continue;
				return { ...enemy, x: nx, y: ny };
			}
			return enemy;
		}

		// Bears aggro within a 7x7 around anchor, otherwise return to anchor.
		const playerInBearArea =
			playerInForest &&
			Math.max(
				Math.abs(playerNow.x - enemy.anchorX),
				Math.abs(playerNow.y - enemy.anchorY),
			) <= 3;
		const wasAggro = forestAggroRef.current[enemy.id] ?? false;
		if (playerInBearArea && !wasAggro) playBearSound();
		forestAggroRef.current[enemy.id] = playerInBearArea;
		const targetX = playerInBearArea ? playerNow.x : enemy.anchorX;
		const targetY = playerInBearArea ? playerNow.y : enemy.anchorY;
		if (enemy.x === targetX && enemy.y === targetY) return enemy;
		const stepX = targetX === enemy.x ? 0 : targetX > enemy.x ? 1 : -1;
		const stepY = targetY === enemy.y ? 0 : targetY > enemy.y ? 1 : -1;
		const candidates = [
			{ dx: stepX, dy: stepY },
			{ dx: stepX, dy: 0 },
			{ dx: 0, dy: stepY },
		].filter(
			(d, idx, arr) => !(idx > 0 && d.dx === arr[0]!.dx && d.dy === arr[0]!.dy),
		);

		for (const delta of candidates) {
			const nx = enemy.x + delta.dx;
			const ny = enemy.y + delta.dy;
			if (playerInForest && nx === playerNow.x && ny === playerNow.y) {
				playBearSound();
				applyForestDamage(30, "A bear");
				return enemy;
			}
			if (!isPassableAt("forest", nx, ny)) continue;
			if (isForestOccupied(nx, ny, enemy.id)) continue;
			return { ...enemy, x: nx, y: ny };
		}
		return enemy;
	};

	const maybeMoveCaveEnemy = (
		enemy: ForestEnemy,
		isHalfTick: boolean,
	): ForestEnemy => {
		if (pauseGame) return enemy;
		const playerNow = playerRef.current;
		const playerInCave = playerNow.map === "cave";

		if (enemy.type === "snake" || enemy.type === "bat") {
			const wasWithinOneTile =
				playerInCave &&
				Math.max(
					Math.abs(playerNow.x - enemy.x),
					Math.abs(playerNow.y - enemy.y),
				) <= 1;
			const state = caveBatDirsRef.current[enemy.id] ?? {
				hDir: 1 as -1 | 1,
				vDir: 1 as -1 | 1,
				verticalMode: false,
			};
			const tryDamage = (nx: number, ny: number) => {
				if (playerInCave && nx === playerNow.x && ny === playerNow.y) {
					applyCaveDamage(20, "A bat");
					return true;
				}
				return false;
			};
			const canStep = (nx: number, ny: number) =>
				isPassableAt("cave", nx, ny) && !isCaveOccupied(nx, ny, enemy.id);
			const tryHorizontal = (dir: -1 | 1): ForestEnemy | null => {
				const nx = enemy.x + dir;
				const ny = enemy.y;
				if (tryDamage(nx, ny)) return enemy;
				if (!canStep(nx, ny)) return null;
				state.hDir = dir;
				state.verticalMode = false;
				caveBatDirsRef.current[enemy.id] = state;
				if (wasWithinOneTile) {
					applyCaveDamage(20, "A bat");
				}
				return { ...enemy, x: nx, y: ny };
			};
			if (!state.verticalMode) {
				const firstTry = tryHorizontal(state.hDir);
				if (firstTry) return firstTry;
				const opposite = (state.hDir * -1) as -1 | 1;
				const secondTry = tryHorizontal(opposite);
				if (secondTry) return secondTry;
				state.hDir = opposite;
				state.verticalMode = true;
				caveBatDirsRef.current[enemy.id] = state;
				return enemy;
			}
			const horizontalNow = tryHorizontal(state.hDir);
			if (horizontalNow) return horizontalNow;
			const horizontalOpposite = tryHorizontal((state.hDir * -1) as -1 | 1);
			if (horizontalOpposite) return horizontalOpposite;
			let nx = enemy.x;
			let ny = enemy.y + state.vDir;
			if (tryDamage(nx, ny)) return enemy;
			if (canStep(nx, ny)) {
				caveBatDirsRef.current[enemy.id] = state;
				if (wasWithinOneTile) {
					applyCaveDamage(20, "A bat");
				}
				return { ...enemy, x: nx, y: ny };
			}
			state.vDir = (state.vDir * -1) as -1 | 1;
			nx = enemy.x;
			ny = enemy.y + state.vDir;
			if (tryDamage(nx, ny)) return enemy;
			if (canStep(nx, ny)) {
				caveBatDirsRef.current[enemy.id] = state;
				if (wasWithinOneTile) {
					applyCaveDamage(20, "A bat");
				}
				return { ...enemy, x: nx, y: ny };
			}
			caveBatDirsRef.current[enemy.id] = state;
			return enemy;
		}

		if (enemy.type === "poop") {
			const playerInPoopArea =
				playerInCave &&
				Math.max(
					Math.abs(playerNow.x - enemy.x),
					Math.abs(playerNow.y - enemy.y),
				) <= 6;
			const wasAggro = caveAggroRef.current[enemy.id] ?? false;
			if (playerInPoopArea && !wasAggro) playPooSound();
			caveAggroRef.current[enemy.id] = playerInPoopArea;
			if (!playerInPoopArea && isHalfTick) return enemy;
			if (playerInPoopArea) {
				const stepX = playerNow.x === enemy.x ? 0 : playerNow.x > enemy.x ? 1 : -1;
				const stepY = playerNow.y === enemy.y ? 0 : playerNow.y > enemy.y ? 1 : -1;
				const chaseDirs = [
					{ dx: stepX, dy: stepY },
					{ dx: stepX, dy: 0 },
					{ dx: 0, dy: stepY },
				];
				for (const delta of chaseDirs) {
					const nx = enemy.x + delta.dx;
					const ny = enemy.y + delta.dy;
					if (playerInCave && nx === playerNow.x && ny === playerNow.y) {
						playPooSound();
						applyCaveDamage(10, "A hostile poop");
						return enemy;
					}
					if (!isPassableAt("cave", nx, ny)) continue;
					if (isCaveOccupied(nx, ny, enemy.id)) continue;
					return { ...enemy, x: nx, y: ny };
				}
				return enemy;
			}
			if (Math.random() > 0.25) return enemy;
			const shuffled = Object.values(npcMoveDirections).sort(
				() => Math.random() - 0.5,
			);
			for (const delta of shuffled) {
				const nx = enemy.x + delta.dx;
				const ny = enemy.y + delta.dy;
				if (
					Math.max(Math.abs(nx - enemy.anchorX), Math.abs(ny - enemy.anchorY)) >
					3
				)
					continue;
				if (!isPassableAt("cave", nx, ny)) continue;
				if (isCaveOccupied(nx, ny, enemy.id)) continue;
				return { ...enemy, x: nx, y: ny };
			}
			return enemy;
		}

		const playerInBearArea =
			playerInCave &&
			Math.max(
				Math.abs(playerNow.x - enemy.anchorX),
				Math.abs(playerNow.y - enemy.anchorY),
			) <= 3;
		const wasAggro = caveAggroRef.current[enemy.id] ?? false;
		if (playerInBearArea && !wasAggro) playBearSound();
		caveAggroRef.current[enemy.id] = playerInBearArea;
		const targetX = playerInBearArea ? playerNow.x : enemy.anchorX;
		const targetY = playerInBearArea ? playerNow.y : enemy.anchorY;
		if (enemy.x === targetX && enemy.y === targetY) return enemy;
		const stepX = targetX === enemy.x ? 0 : targetX > enemy.x ? 1 : -1;
		const stepY = targetY === enemy.y ? 0 : targetY > enemy.y ? 1 : -1;
		const candidates = [
			{ dx: stepX, dy: stepY },
			{ dx: stepX, dy: 0 },
			{ dx: 0, dy: stepY },
		].filter(
			(d, idx, arr) => !(idx > 0 && d.dx === arr[0]!.dx && d.dy === arr[0]!.dy),
		);
		for (const delta of candidates) {
			const nx = enemy.x + delta.dx;
			const ny = enemy.y + delta.dy;
			if (playerInCave && nx === playerNow.x && ny === playerNow.y) {
				playBearSound();
				applyCaveDamage(30, "A bear");
				return enemy;
			}
			if (!isPassableAt("cave", nx, ny)) continue;
			if (isCaveOccupied(nx, ny, enemy.id)) continue;
			return { ...enemy, x: nx, y: ny };
		}
		return enemy;
	};

	const maybeMoveNPC = (
		npcKey: string,
		nextNpcTiles: Record<string, { x: number; y: number }>,
	) => {
		if (pauseGame) return;
		if (Math.random() > 0.25) return;

		const current = nextNpcTiles[npcKey];
		const anchor = townNpcAnchors[npcKey];
		if (!current || !anchor) return;

		let attempts = 0;
		while (attempts < 128) {
			attempts += 1;
			const dir = randomInt(1, 8);
			const delta = npcMoveDirections[dir];
			if (!delta) continue;

			const nx = current.x + delta.dx;
			const ny = current.y + delta.dy;

			if (Math.max(Math.abs(nx - anchor.x), Math.abs(ny - anchor.y)) > 2)
				continue;
			if (
				ny < 0 ||
				ny >= activeMapLayouts.town.length ||
				nx < 0 ||
				nx >= activeMapLayouts.town[0].length
			)
				continue;
			if (!isPassableChar(activeMapLayouts.town[ny]?.[nx] ?? "#")) continue;

			const occupiedByNpc = Object.entries(nextNpcTiles).some(
				([otherKey, pos]) =>
					otherKey !== npcKey && pos.x === nx && pos.y === ny,
			);
			if (occupiedByNpc) continue;
			if (
				petVendorActive &&
				!ownedPet &&
				nx === PET_VENDOR_POS.x &&
				ny === PET_VENDOR_POS.y
			)
				continue;
			if (doctorVendorActive && nx === DOCTOR_POS.x && ny === DOCTOR_POS.y)
				continue;

			const p = playerRef.current;
			if (p.map === "town" && p.x === nx && p.y === ny) continue;

			nextNpcTiles[npcKey] = { x: nx, y: ny };
			return;
		}
	};

	const maybeMoveAnimal = (
		animalId: number,
		nextAnimalTiles: Record<number, { x: number; y: number }>,
	) => {
		if (pauseGame) return;
		if (Math.random() > 0.25) return;

		const current = nextAnimalTiles[animalId];
		const anchor = animalAnchors[animalId];
		if (!current || !anchor) return;

		let attempts = 0;
		while (attempts < 128) {
			attempts += 1;
			const dir = randomInt(1, 8);
			const delta = npcMoveDirections[dir];
			if (!delta) continue;

			const nx = current.x + delta.dx;
			const ny = current.y + delta.dy;
			const allowOutsideBarn =
				animalsMap === "barn" && isBarnExternal(barnTier);

			if (
				!allowOutsideBarn &&
				Math.max(Math.abs(nx - anchor.x), Math.abs(ny - anchor.y)) > 2
			)
				continue;
			if (!allowOutsideBarn) {
				if (
					nx < barnInteriorBounds.minX ||
					nx > barnInteriorBounds.maxX ||
					ny < barnInteriorBounds.minY ||
					ny > barnInteriorBounds.maxY
				)
					continue;
			}
			if (!isPassableChar(activeMapLayouts[animalsMap][ny]?.[nx] ?? "#")) continue;
			if (farmEggDrops[keyForPos(nx, ny)]) continue;

			const occupiedByAnimal = Object.entries(nextAnimalTiles).some(
				([otherId, pos]) =>
					Number(otherId) !== animalId && pos.x === nx && pos.y === ny,
			);
			if (occupiedByAnimal) continue;

			const p = playerRef.current;
			if (p.map === "farm" && p.x === nx && p.y === ny) continue;

			nextAnimalTiles[animalId] = { x: nx, y: ny };
			return;
		}
	};

	const maybeMoveBoat = (
		boatKey: keyof typeof boatNpcEmojis,
		nextBoatTiles: Record<keyof typeof boatNpcEmojis, { x: number; y: number }>,
	) => {
		if (pauseGame) return;
		if (Math.random() > 0.25) return;

		const current = nextBoatTiles[boatKey];
		if (!current) return;

		let attempts = 0;
		while (attempts < 128) {
			attempts += 1;
			const dir = randomInt(1, 8);
			const delta = npcMoveDirections[dir];
			if (!delta) continue;

			const nx = current.x + delta.dx;
			const ny = current.y + delta.dy;
			if (
				ny < 0 ||
				ny >= activeMapLayouts.town.length ||
				nx < 0 ||
				nx >= activeMapLayouts.town[0].length
			)
				continue;
			if (activeMapLayouts.town[ny]?.[nx] !== "~") continue;

			const occupiedByBoat = Object.entries(nextBoatTiles).some(
				([otherKey, pos]) =>
					otherKey !== boatKey && pos.x === nx && pos.y === ny,
			);
			if (occupiedByBoat) continue;

			const p = playerRef.current;
			if (p.map === "town" && p.x === nx && p.y === ny) continue;

			nextBoatTiles[boatKey] = { x: nx, y: ny };
			return;
		}
	};

	useEffect(() => {
		const interval = window.setInterval(() => {
			setTownNpcTiles((prev) => {
				const next = { ...prev };
				Object.keys(townNpcNames).forEach((npcKey) => {
					maybeMoveNPC(npcKey, next);
				});
				return next;
			});
			setBoatTiles((prev) => {
				const next = { ...prev };
				(
					Object.keys(boatNpcEmojis) as Array<keyof typeof boatNpcEmojis>
				).forEach((boatKey) => {
					maybeMoveBoat(boatKey, next);
				});
				return next;
			});
			setAnimalTiles((prev) => {
				const next = { ...prev };
				animals.forEach((a) => {
					maybeMoveAnimal(a.id, next);
				});
				return next;
			});
			setPetTile((prev) => {
				if (!prev || playerRef.current.map !== "farm") return prev;
				const next = maybeMovePet(prev);
				if (next.x < prev.x) setPetFacing(1);
				else if (next.x > prev.x) setPetFacing(-1);
				return next;
			});
		}, 1000);

		return () => window.clearInterval(interval);
	}, [
		animals,
		animalAnchors,
		farmEggDrops,
		farmForestBlockers,
		farmCaveBlockers,
		petGraveObstacles,
		farmWeedObstacles,
		plots,
		day,
		starterChestOpened,
		petVendorActive,
		ownedPet,
		pauseGame,
	]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			forestEnemyTickRef.current += 1;
			const isHalfTick = forestEnemyTickRef.current % 2 === 1;
			setForestEnemies((prev) =>
				prev.map((enemy) => maybeMoveForestEnemy(enemy, isHalfTick)),
			);
		}, 500);
		return () => window.clearInterval(interval);
	}, [pauseGame, activeMapLayouts, forestObstacles, forestChest, forestBonusChests]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			caveEnemyTickRef.current += 1;
			const isHalfTick = caveEnemyTickRef.current % 2 === 1;
			setCaveEnemies((prev) =>
				prev.map((enemy) => maybeMoveCaveEnemy(enemy, isHalfTick)),
			);
		}, 500);
		return () => window.clearInterval(interval);
	}, [pauseGame, activeMapLayouts, caveObstacles, caveLadderPos]);

	const addLog = (line: string) => {
		setLog([line]);
	};
	const applyCaveDamage = (amount: number, source: string) => {
		if (playerRef.current.map !== "cave" || amount <= 0) return;
		playBad();
		setShowForestHit(true);
		if (forestHitTimeoutRef.current !== null) {
			window.clearTimeout(forestHitTimeoutRef.current);
		}
		forestHitTimeoutRef.current = window.setTimeout(() => {
			setShowForestHit(false);
			forestHitTimeoutRef.current = null;
		}, 180);
		setStamina((prev) => {
			const next = Math.max(0, prev - amount);
			if (next <= 0) {
				setCaveLockedToday(true);
				setPlayer({ map: "farm", x: 1, y: CAVE_GATE_Y });
				addLog("You collapsed in the cave and woke up back on the farm.");
			} else {
				addLog(`${source} hit you for ${amount} stamina.`);
			}
			return next;
		});
	};
	const applyForestRoom = (nextForest: ForestGenerationResult) => {
		setForestLayout(nextForest.layout);
		setForestEnemies(nextForest.enemies);
		forestSnakeDirsRef.current = makeSnakeDirections(nextForest.enemies);
		forestAggroRef.current = {};
		forestEnemyTickRef.current = 0;
		setForestObstacles(nextForest.obstacles);
		setForestChest(nextForest.chest);
		setForestBonusChests(nextForest.bonusChests);
		setForestLevel(nextForest.level);
		setForestEntranceDoorPos(nextForest.entranceDoor);
		setForestForwardExitPos(nextForest.exitDoor);
		setForestExitSide(nextForest.exitSide);
		setForestLastTurn(nextForest.turnSign);
		setForestIsBonusLevel(nextForest.isBonusLevel);
		if (nextForest.isBonusLevel) {
			const clearFog: Record<string, number> = {};
			nextForest.layout.forEach((row, y) => {
				for (let x = 0; x < row.length; x += 1) {
					clearFog[keyForPos(x, y)] = 0;
				}
			});
			setForestFog(clearFog);
		} else {
			setForestFog({});
		}
	};
	const applyCaveRoom = (nextCave: CaveGenerationResult) => {
		setCaveLayout(nextCave.layout);
		setCaveRubble(buildCaveRubble(nextCave.layout));
		setCaveEnemies(nextCave.enemies);
		caveBatDirsRef.current = makeSnakeDirections(nextCave.enemies);
		caveAggroRef.current = {};
		caveEnemyTickRef.current = 0;
		setCaveObstacles(nextCave.obstacles);
		setCaveLevel(nextCave.level);
		setCaveEntranceDoorPos(nextCave.entranceDoor);
		setCaveLevelOneExitPos(nextCave.levelOneExitInside);
		setCaveLadderPos(null);
		setCaveStartingRockCount(nextCave.startingRockCount);
		setCaveFog({});
	};

	const isPetWalkableFarmTile = (x: number, y: number) => {
		if (
			x < 0 ||
			y < 0 ||
			y >= activeMapLayouts.farm.length ||
			x >= activeMapLayouts.farm[0].length
		)
			return false;
		const key = keyForPos(x, y);
		if (farmForestBlockers[key]) return false;
		if (farmCaveBlockers[key]) return false;
		if (petGraveObstacles[key]) return false;
		if (farmWeedObstacles[key]) return false;
		if (farmEggDrops[key]) return false;
		if (
			day === 1 &&
			!starterChestOpened &&
			x === STARTER_CHEST_POS.x &&
			y === STARTER_CHEST_POS.y
		)
			return false;
		const hasPlot = plots[key];
		const baseTile = activeMapLayouts.farm[y]?.[x];
		if (!baseTile) return false;
		if (hasPlot && hasPlot.crop) return false;
		if (hasPlot && !hasPlot.crop) return true;
		return baseTile === "," || baseTile === "=";
	};

	const randomFarmPetSpawn = () => {
		const candidates: Point[] = [];
		for (let y = 1; y < FARM_HEIGHT - 1; y += 1) {
			for (let x = 1; x < FARM_WIDTH - 1; x += 1) {
				if (!isPetWalkableFarmTile(x, y)) continue;
				if (playerRef.current.map === "farm" && playerRef.current.x === x && playerRef.current.y === y)
					continue;
				if (Object.values(animalTiles).some((p) => p.x === x && p.y === y)) continue;
				candidates.push({ x, y });
			}
		}
		if (candidates.length === 0) return null;
		return candidates[randomInt(0, candidates.length - 1)] ?? null;
	};

	const maybeMovePet = (current: Point) => {
		if (pauseGame) return current;
		if (Math.random() > 0.25) return current;
		let attempts = 0;
		while (attempts < 128) {
			attempts += 1;
			const dir = randomInt(1, 8);
			const delta = npcMoveDirections[dir];
			if (!delta) continue;
			const nx = current.x + delta.dx;
			const ny = current.y + delta.dy;
			if (!isPetWalkableFarmTile(nx, ny)) continue;
			if (Object.values(animalTiles).some((p) => p.x === nx && p.y === ny)) continue;
			const p = playerRef.current;
			if (p.map === "farm" && p.x === nx && p.y === ny) continue;
			return { x: nx, y: ny };
		}
		return current;
	};
	const continueForestDungeon = (fromMenu = false) => {
		const nextLevel = forestLevel + 1;
		const nextForest = generateForestState({
			level: nextLevel,
			entranceSide: oppositeForestSide(forestExitSide),
			lastTurn: forestLastTurn,
		});
		applyForestRoom(nextForest);
		setPlayer({
			map: "forest",
			x: nextForest.entranceInside.x,
			y: nextForest.entranceInside.y,
		});
		if (nextForest.isBonusLevel) {
			fadeOutCurrentAreaMusic(1200);
			addLog(`You found a quiet bonus grove (Depth ${nextLevel}).`);
		} else {
			switchAreaMusic(getAreaMusicForMap("forest"), true);
			addLog(`You push deeper into the forest (Depth ${nextLevel}).`);
		}
		if (fromMenu) closeMenu();
	};
	const continueCaveDungeon = (fromMenu = false) => {
		const nextLevel = caveLevel + 1;
		const sides: ForestSide[] = ["left", "right", "top", "bottom"];
		const entranceSide = sides[randomInt(0, sides.length - 1)]!;
		const nextCave = generateCaveState({
			level: nextLevel,
			entranceSide,
		});
		applyCaveRoom(nextCave);
		setPlayer({
			map: "cave",
			x: nextCave.entranceInside.x,
			y: nextCave.entranceInside.y,
		});
		switchAreaMusic(getAreaMusicForMap("cave"), true);
		addLog(`You descend deeper into the cave (Depth ${nextLevel}).`);
		if (fromMenu) closeMenu();
	};
	const openForestExitMenu = () => {
		openMenu("Forest Exit", ["Go back to farm?"], [
			{ label: "Keep exploring", onSelect: () => continueForestDungeon(true) },
			{
				label: "Go back to farm",
				onSelect: () => {
					setForestLockedToday(true);
					setPlayer({ map: "farm", x: FARM_WIDTH - 2, y: FOREST_GATE_Y });
					addLog("Returned to farm.");
					closeMenu();
				},
			},
		]);
	};
	const openCaveExitMenu = () => {
		openMenu("Cave Exit", ["Leave cave and return to farm?"], [
			{
				label: "Stay",
				onSelect: closeMenu,
			},
			{
				label: "Leave cave",
				onSelect: () => {
					setCaveLockedToday(true);
					setPlayer({ map: "farm", x: 1, y: CAVE_GATE_Y });
					addLog("Returned to farm.");
					closeMenu();
				},
			},
		]);
	};

	const isOccupied = (map: MapId, x: number, y: number) => {
		if (map === "town") {
			return (
				Object.values(townNpcTiles).some((pos) => pos.x === x && pos.y === y) ||
				Object.values(boatTiles).some((pos) => pos.x === x && pos.y === y) ||
				(petVendorActive &&
					!ownedPet &&
					x === PET_VENDOR_POS.x &&
					y === PET_VENDOR_POS.y) ||
				(sketchyMerchantActive &&
					x === SKETCHY_MERCHANT_POS.x &&
					y === SKETCHY_MERCHANT_POS.y) ||
				(traderActive && x === TRADER_POS.x && y === TRADER_POS.y) ||
				(doctorVendorActive && x === DOCTOR_POS.x && y === DOCTOR_POS.y)
			);
		}
		if (map === "farm") {
			return (
				(animalsMap === "farm" &&
					Object.values(animalTiles).some(
					(pos) => pos.x === x && pos.y === y,
				)) || (!!petTile && petTile.x === x && petTile.y === y)
					|| (hasTractor &&
						tractorParked &&
						x === TRACTOR_PARK_POS.x &&
						y === TRACTOR_PARK_POS.y)
			);
		}
		if (map === "barn") {
			return (
				animalsMap === "barn" &&
				Object.values(animalTiles).some((pos) => pos.x === x && pos.y === y)
			);
		}
		if (map === "forest") {
			return (
				forestEnemies.some((e) => e.x === x && e.y === y) ||
				forestObstacles.some((o) => o.x === x && o.y === y)
			);
		}
		if (map === "cave") {
			return (
				caveEnemies.some((e) => e.x === x && e.y === y) ||
				caveObstacles.some((o) => o.x === x && o.y === y)
			);
		}
		return false;
	};

	const applyTractorImplementAt = (x: number, y: number, force = false) => {
		if (
			!isDrivingTractor ||
			(!force && !tractorImplementOn) ||
			playerRef.current.map !== "farm"
		)
			return;
		const showOutOfSeeds = () => {
			setTractorImplementOn(false);
			playBad();
			addLog("Out of seeds");
		};
		const key = keyForPos(x, y);
		if (tractorImplement === "plow") {
			if (farmWeedObstacles[key]) {
				setFarmWeedObstacles((prev) => ({ ...prev, [key]: false }));
				if (Math.random() < 0.5) {
					updateInventory("feed", 1);
				}
				if (Math.random() < 0.02) {
					applyMoneyDelta(randomInt(1, 5));
				}
			}
			const baseTile = activeMapLayouts.farm[y]?.[x];
			setPlots((prev) => {
				if (baseTile !== "," || prev[key]) return prev;
				return { ...prev, [key]: { crop: null, growthDays: 0, watered: false } };
			});
			return;
		}
		if (tractorImplement === "sow") {
			if (!tractorSeedItem || inventory[tractorSeedItem] <= 0) {
				showOutOfSeeds();
				return;
			}
			const cropId = allPlantableCropIds.find(
				(crop) => cropDefs[crop].seedItem === tractorSeedItem,
			);
			if (!cropId) {
				showOutOfSeeds();
				return;
			}
			const plot = plots[key];
			if (!plot || plot.crop) return;
			setPlots((prev) => ({
				...prev,
				[key]: { crop: cropId, growthDays: 0, watered: currentWeather === "rainy" },
			}));
			updateInventory(tractorSeedItem, -1);
			if (inventory[tractorSeedItem] <= 1) {
				showOutOfSeeds();
			}
			return;
		}
		if (tractorImplement === "water") {
			setPlots((prev) => {
				const plot = prev[key];
				if (!plot || plot.watered) return prev;
				return { ...prev, [key]: { ...plot, watered: true } };
			});
			return;
		}
		if (tractorImplement === "harvest") {
			if (farmWeedObstacles[key]) {
				setFarmWeedObstacles((prev) => ({ ...prev, [key]: false }));
				const gotFeed = Math.random() < 0.5;
				const gotMoney = Math.random() < 0.02;
				const lines: string[] = [];
				if (gotFeed) {
					updateInventory("feed", 1);
					lines.push("Found Feed +1.");
				}
				if (gotMoney) {
					const amount = randomInt(1, 5);
					applyMoneyDelta(amount);
					lines.push(`Found $${amount}.`);
				}
				addLog(lines.length > 0 ? lines.join(" ") : "You cleared some weeds.");
				return;
			}
			const plot = plots[key];
			if (!plot?.crop) return;
			const crop = cropDefs[plot.crop];
			if (plot.growthDays < crop.growDays) return;
			setPlots((prev) => ({
				...prev,
				[key]: { crop: null, growthDays: 0, watered: false },
			}));
			updateInventory(crop.harvestItem, 1);
		}
	};

	const exitTractor = () => {
		const pendingKey = pendingPetGravePos
			? keyForPos(pendingPetGravePos.x, pendingPetGravePos.y)
			: null;
		const parkedKey = keyForPos(TRACTOR_PARK_POS.x, TRACTOR_PARK_POS.y);
		if (pendingKey && pendingKey === parkedKey) {
			setPetGraveObstacles((prev) => ({ ...prev, [pendingKey]: 24 }));
			setPendingPetGravePos(null);
		}
		setIsDrivingTractor(false);
		setTractorImplementOn(false);
		setTractorImplement(null);
		setTractorSeedItem(null);
		setTractorParked(true);
		if (tractorDriverEmoji) setPlayerEmoji(tractorDriverEmoji);
		setTractorDriverEmoji(null);
		stopTractorLoop();
		setPlayer({
			map: "farm",
			x: TRACTOR_PARK_POS.x,
			y: Math.min(FARM_HEIGHT - 2, TRACTOR_PARK_POS.y + 1),
		});
	};

	const enterTractor = (implement: TractorImplement, seedItem: ItemId | null = null) => {
		setTractorDriverEmoji(playerEmoji);
		setPlayerEmoji("🚜"); // tractor driving avatar
		setIsDrivingTractor(true);
		setTractorImplement(implement);
		setTractorImplementOn(false);
		setTractorSeedItem(seedItem);
		setTractorParked(false);
		setPlayer({ map: "farm", x: TRACTOR_PARK_POS.x, y: TRACTOR_PARK_POS.y });
		addLog(`Driving tractor with ${implement} implement.`);
	};

	const movePlayer = (dir: Dir) => {
		if (modal || isOrdering || isDoctorCompounding) return;
		const { dx, dy } = dirDelta[dir];
		const nx = player.x + dx;
		const ny = player.y + dy;
		if (nx < 0 || ny < 0 || ny >= height || nx >= width) return;
		if (
			isDrivingTractor &&
			mapDoors[player.map].some((d) => d.x === nx && d.y === ny)
		) {
			addLog("The tractor can't go through doors.");
			return;
		}
		const targetFarmWeed = !!farmWeedObstacles[keyForPos(nx, ny)];
		if (isDrivingTractor && player.map === "farm" && targetFarmWeed) {
			if (tractorImplement !== "harvest") {
				addLog("You must have a harvester to harvest weeds.");
			} else if (!tractorImplementOn) {
				addLog("You must turn your implement on before you can harvest.");
			}
		}
		const canTractorHarvestWeedStep =
			isDrivingTractor &&
			player.map === "farm" &&
			tractorImplement === "harvest" &&
			tractorImplementOn &&
			targetFarmWeed;
		if (!isPassableAt(player.map, nx, ny) && !canTractorHarvestWeedStep) return;
		const tractorCrushesPet =
			isDrivingTractor &&
			player.map === "farm" &&
			!!ownedPet &&
			!!petTile &&
			petTile.x === nx &&
			petTile.y === ny;
		if (isOccupied(player.map, nx, ny) && !tractorCrushesPet) return;
		if (tractorCrushesPet) {
			playHoe();
			if (petRunoverBadTimeoutRef.current !== null) {
				window.clearTimeout(petRunoverBadTimeoutRef.current);
				petRunoverBadTimeoutRef.current = null;
			}
			petRunoverBadTimeoutRef.current = window.setTimeout(() => {
				playBad();
				petRunoverBadTimeoutRef.current = null;
			}, 500);
			setOwnedPet(null);
			setPendingPet(null);
			setPetTile(null);
			setPetHeartTile(null);
			setPendingPetGravePos({ x: nx, y: ny });
			setPetVendorActive(true);
			addLog("Your pet was run over by the tractor.");
		}
		if (isDrivingTractor) {
			if (dx < 0) setTractorFacing(1);
			else if (dx > 0) setTractorFacing(-1);
		}
		if (
			isDrivingTractor &&
			player.map === "farm" &&
			pendingPetGravePos &&
			pendingPetGravePos.x === player.x &&
			pendingPetGravePos.y === player.y &&
			(nx !== player.x || ny !== player.y)
		) {
			const key = keyForPos(player.x, player.y);
			setPetGraveObstacles((prev) => ({ ...prev, [key]: 24 }));
			setPendingPetGravePos(null);
		}
		setPlayer((prev) => ({ ...prev, x: nx, y: ny }));
		if (isDrivingTractor && player.map === "farm") {
			applyTractorImplementAt(nx, ny);
			if (nx === TRACTOR_PARK_POS.x && ny === TRACTOR_PARK_POS.y) {
				exitTractor();
			}
			return;
		}
		if (
			player.map === "forest" &&
			nx === forestEntranceDoorPos.x &&
			ny === forestEntranceDoorPos.y
		) {
			openForestExitMenu();
			return;
		}
		if (
			player.map === "forest" &&
			nx === forestForwardExitPos.x &&
			ny === forestForwardExitPos.y
		) {
			continueForestDungeon();
			return;
		}
		if (
			player.map === "cave" &&
			nx === caveEntranceDoorPos.x &&
			ny === caveEntranceDoorPos.y
		) {
			openCaveExitMenu();
			return;
		}
		if (player.map === "cave" && caveLadderPos && nx === caveLadderPos.x && ny === caveLadderPos.y) {
			continueCaveDungeon();
			return;
		}

		const door = mapDoors[player.map].find((d) => d.x === nx && d.y === ny);
		if (door) {
			if (door.target.map === "forest" && forestLockedToday) {
				playBad();
				addLog("You are too scared to go back in the forest today.");
				return;
			}
			if (door.target.map === "forest" && !canEnterForest()) {
				playBad();
				addLog("You are too exhausted to enter the forest.");
				return;
			}
			if (door.target.map === "cave" && caveLockedToday) {
				playBad();
				addLog("You are too scared to go back in the cave today.");
				return;
			}
			if (door.target.map === "cave" && !canEnterCave()) {
				playBad();
				addLog("You are too exhausted to enter the cave.");
				return;
			}
			playNotification();
			setPlayer({ map: door.target.map, x: door.target.x, y: door.target.y });
			addLog(`Entered ${door.target.map}.`);
		}
	};

	const updateInventory = (item: ItemId, amount: number) => {
		setInventory((inv) => ({
			...inv,
			[item]: clampMin(inv[item] + amount, 0),
		}));
	};

	const applyMoneyDelta = (delta: number) => {
		setMoney((m) => m + delta);
		if (delta > 0) {
			setCurrentDayEarned((v) => v + delta);
			setTotalEarned((v) => v + delta);
		}
	};

	const canAfford = (value: number) => money >= value;

	const trySpendStamina = (cost: number) => {
		if (cost <= 0) return true;
		if (stamina < cost) {
			playTooTired();
			addLog("Too tired.");
			return false;
		}
		setStamina((s) => Math.max(0, s - cost));
		return true;
	};

	const tryUseToolAction = (toolLevel: number) => {
		return trySpendStamina(getToolActionCost(toolLevel));
	};

	const speakVendorGreeting = () => {
		const line = vendorGreetings[randomInt(0, vendorGreetings.length - 1)]!;
		speakNpcLine(line);
	};

	const interactVendor = (key: VendorKey) => {
		if (key === "seed_vendor") {
			const cropList = standardCropIds.map((cropId) => [cropId, cropDefs[cropId]]) as [
				CropId,
				CropDef,
			][];
			speakVendorGreeting();
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
					{
						label: "Back",
						info: ["Close this shop menu."],
						onSelect: closeMenu,
					},
				],
			);
			return true;
		}

		if (key === "feed_vendor") {
			speakVendorGreeting();
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
					{
						label: "Back",
						info: ["Close this shop menu."],
						onSelect: closeMenu,
					},
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
			speakVendorGreeting();
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
							const openSlots = (() => {
								const capacityRemaining = Math.max(
									0,
									barnAnimalCap - animals.length,
								);
								return Math.min(capacityRemaining, countOpenBarnTiles(animalTiles));
							})();
							openQuantityPrompt({
								mode: "buy",
								itemLabel: def.name,
								max: Math.min(Math.floor(money / def.buyPrice), openSlots),
								unitPrice: def.buyPrice,
								onConfirm: (quantity) => {
									applyMoneyDelta(-def.buyPrice * quantity);
									const newAnimals: Animal[] = [];
									const newTileEntries: [number, { x: number; y: number }][] =
										[];
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
					{
						label: "Back",
						info: ["Close this shop menu."],
						onSelect: closeMenu,
					},
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
			speakVendorGreeting();
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
					{
						label: "Back",
						info: ["Close this shop menu."],
						onSelect: closeMenu,
					},
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
			const headlampAvailable = !hasHeadlamp;
			if (upgradableTools.length === 0 && !tractorAvailable && !headlampAvailable) {
				const line =
					gotAllToolsDialog[randomInt(0, gotAllToolsDialog.length - 1)]!;
				speakNpcLine(line);
				addLog(line);
				return true;
			}
			speakVendorGreeting();
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
						const inlineIronLabel = ironCost > 0 ? ` + 🪨x${ironCost}` : ""; // rock=iron
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
									addLog(`Not enough ${itemNames[gemCost.item]} for that upgrade.`);
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
									label: `Buy Tractor 🚜 ($${TRACTOR_PRICE} + 🪨x${TRACTOR_IRON_COST})`, // tractor + iron
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
									label: `Buy Headlamp 💡 ($${HEADLAMP_PRICE})`, // headlamp tool
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
					{
						label: "Back",
						info: ["Close this shop menu."],
						onSelect: closeMenu,
					},
				],
			);
			return true;
		}

		if (key === "cafe_vendor") {
			speakVendorGreeting();
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
					{
						label: "Back",
						info: ["Close this shop menu."],
						onSelect: closeMenu,
					},
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
					const isSeed = id.endsWith("_seed");
					const unitPrice =
						id === "coral_fruit"
							? CORAL_FRUIT_SELL_PRICE
							: id === "diamond" || id === "emerald" || id === "ruby"
								? GEM_SELL_PRICES[id]
							: isSeed
								? getSeedSellbackPrice(prices[id])
								: prices[id];
					const baseUnitPrice =
						id === "coral_fruit"
							? CORAL_FRUIT_SELL_PRICE
							: id === "diamond" || id === "emerald" || id === "ruby"
								? GEM_SELL_PRICES[id]
								: initialPrices[id];
					return {
					label: `Sell ${itemNames[id]} x1 ($${unitPrice})`,
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
			speakVendorGreeting();
			openMenu(
				"Supermarket",
				["I buy local goods."],
				[
					...options,
					{
						label: "Back",
						info: ["Close this shop menu."],
						onSelect: closeMenu,
					},
				],
			);
			return true;
		}

		return false;
	};

	const interactBuilderVendor = () => {
		if (barnTier >= BARN_MAX_TIER) {
			const line = "I hope you enjoy your legendary barn";
			speakNpcLine(line);
			addLog(line);
			return;
		}
		if (pendingBarnUpgrade) {
			const line = "I will build your barn tonight. Check on it tomorrow morning.";
			speakNpcLine(line);
			addLog(line);
			return;
		}
		const nextTier = (barnTier + 1) as BarnTier;
		const upgradeCost = getBarnUpgradeCost(nextTier);
		const costParts = [`$${upgradeCost.money}`];
		if (upgradeCost.iron > 0) costParts.push(`🪨x${upgradeCost.iron}`); // iron
		if ((upgradeCost.gems.ruby ?? 0) > 0) costParts.push(`🔴x${upgradeCost.gems.ruby}`); // ruby
		if ((upgradeCost.gems.emerald ?? 0) > 0)
			costParts.push(`🟢x${upgradeCost.gems.emerald}`); // emerald
		if ((upgradeCost.gems.diamond ?? 0) > 0)
			costParts.push(`💎x${upgradeCost.gems.diamond}`); // diamond
		const nextSize = getBarnInteriorSizeByTier(nextTier);
		const nextCapacity = getBarnAnimalCap(nextTier);
		const currentRect = getFarmBarnOuterRect(barnTier);
		const nextRect = getFarmBarnOuterRect(nextTier);
		const expansionRightTiles =
			!isBarnExternal(barnTier) && !isBarnExternal(nextTier)
				? Math.max(
						0,
						nextRect.x + nextRect.w - (currentRect.x + currentRect.w),
					)
				: 0;
		openMenu(
			"Constrution",
			[
				`Upgrade barn from ${getToolTierName(barnTier)} to ${getToolTierName(nextTier)} for ${costParts.join(" + ")}?`,
			],
			[
				{
					label: "Yes",
					info: [
						`Interior Space: ${nextSize.width}x${nextSize.height}`,
						`Animal capacity: ${nextCapacity}`,
					],
					onSelect: () => {
						if (!canAfford(upgradeCost.money)) {
							playBad();
							addLog("Not enough money for that barn upgrade.");
							closeMenu();
							return;
						}
						if (inventory.iron < upgradeCost.iron) {
							playBad();
							addLog("Not enough iron for that barn upgrade.");
							closeMenu();
							return;
						}
						if ((upgradeCost.gems.ruby ?? 0) > 0 && inventory.ruby < (upgradeCost.gems.ruby ?? 0)) {
							playBad();
							addLog("Not enough Ruby for that barn upgrade.");
							closeMenu();
							return;
						}
						if (
							(upgradeCost.gems.emerald ?? 0) > 0 &&
							inventory.emerald < (upgradeCost.gems.emerald ?? 0)
						) {
							playBad();
							addLog("Not enough Emerald for that barn upgrade.");
							closeMenu();
							return;
						}
						if (
							(upgradeCost.gems.diamond ?? 0) > 0 &&
							inventory.diamond < (upgradeCost.gems.diamond ?? 0)
						) {
							playBad();
							addLog("Not enough Diamond for that barn upgrade.");
							closeMenu();
							return;
						}
						const finalizeBarnUpgradePurchase = () => {
							applyMoneyDelta(-upgradeCost.money);
							if (upgradeCost.iron > 0) updateInventory("iron", -upgradeCost.iron);
							if ((upgradeCost.gems.ruby ?? 0) > 0)
								updateInventory("ruby", -(upgradeCost.gems.ruby ?? 0));
							if ((upgradeCost.gems.emerald ?? 0) > 0)
								updateInventory("emerald", -(upgradeCost.gems.emerald ?? 0));
							if ((upgradeCost.gems.diamond ?? 0) > 0)
								updateInventory("diamond", -(upgradeCost.gems.diamond ?? 0));
							setPendingBarnUpgrade(true);
							playChaChing();
							closeMenu();
							const line =
								"I will build your barn tonight. Check on it tomorrow morning.";
							speakNpcLine(line);
							addLog(line);
						};
						if (isBarnExternal(nextTier)) {
							finalizeBarnUpgradePurchase();
							return;
						}
						openMenu(
							"Constrution",
							[
								`Just so you know we will be expanding the barn to the right ${expansionRightTiles} tiles. Any crops planted there will be destroyed overnight. You want to continue`,
							],
							[
								{
									label: "Yes",
									onSelect: finalizeBarnUpgradePurchase,
								},
								{ label: "No", onSelect: closeMenu },
							],
						);
					},
				},
				{ label: "No", onSelect: closeMenu },
			],
		);
	};

	const orderLine = (template: string, orderedItem: string) =>
		template.replace(/ORDERED_ITEM/g, orderedItem);
	const nextCafeObservation = (orderedItem: string) =>
		orderLine(
			cafeWaitingObservations[
				randomInt(0, cafeWaitingObservations.length - 1)
			]!,
			orderedItem,
		);
	const nextDoctorSpeechLine = () =>
		doctorGrindingMedicineSpeech[
			randomInt(0, doctorGrindingMedicineSpeech.length - 1)
		]!;
	const nextDoctorObservation = () =>
		doctorWaitingObservations[
			randomInt(0, doctorWaitingObservations.length - 1)
		]!;
	const clearDoctorMedicineTimers = () => {
		if (doctorProcessTimeoutRef.current !== null) {
			window.clearTimeout(doctorProcessTimeoutRef.current);
			doctorProcessTimeoutRef.current = null;
		}
		if (doctorRewardTimeoutRef.current !== null) {
			window.clearTimeout(doctorRewardTimeoutRef.current);
			doctorRewardTimeoutRef.current = null;
		}
		if (doctorObservationIntervalRef.current !== null) {
			window.clearInterval(doctorObservationIntervalRef.current);
			doctorObservationIntervalRef.current = null;
		}
	};
	const startDoctorMedicine = () => {
		stopAreaFade();
		if (currentAreaMusicRef.current) {
			currentAreaMusicRef.current.pause();
		}
		if (cafeOrderMusicRef.current) {
			cafeOrderMusicRef.current.currentTime = 0;
			void cafeOrderMusicRef.current.play().catch(() => undefined);
		}
		closeMenu();
		clearDoctorMedicineTimers();
		setDoctorUsedToday(true);
		setIsDoctorCompounding(true);
		setPauseGame(true);
		const tick = () => {
			const spoken = nextDoctorSpeechLine();
			const observed = nextDoctorObservation();
			speakNpcLine(spoken);
			setDoctorObservation(observed);
		};
		tick();
		doctorObservationIntervalRef.current = window.setInterval(tick, 5000);
		doctorProcessTimeoutRef.current = window.setTimeout(() => {
			clearDoctorMedicineTimers();
			setIsDoctorCompounding(false);
			setDoctorObservation("");
			const doneLine = "OK. Drink up.";
			speakNpcLine(doneLine);
			addLog(doneLine);
			playMunch();
			doctorRewardTimeoutRef.current = window.setTimeout(() => {
				playGotReward();
				setStaminaMax((prevMax) => {
					const nextMax = prevMax + 20;
					setStamina((s) => Math.min(nextMax, s + 20));
					return nextMax;
				});
				addLog("Your maximum stamina increased by 20.");
				if (cafeOrderMusicRef.current) {
					cafeOrderMusicRef.current.pause();
					cafeOrderMusicRef.current.currentTime = 0;
				}
				switchAreaMusic(getAreaMusicForMap(playerRef.current.map), true);
				setPauseGame(false);
				doctorRewardTimeoutRef.current = null;
			}, 1000);
			doctorProcessTimeoutRef.current = null;
		}, 20000);
	};

	const startCafeOrder = (item: CafeOrderItem) => {
		stopAreaFade();
		if (currentAreaMusicRef.current) {
			currentAreaMusicRef.current.pause();
		}
		if (cafeOrderMusicRef.current) {
			cafeOrderMusicRef.current.currentTime = 0;
			void cafeOrderMusicRef.current.play().catch(() => undefined);
		}
		closeMenu();
		setIsOrdering(true);
		setCafeObservation(nextCafeObservation(item.name));
		const started = orderLine(
			orderStartedDialog[randomInt(0, orderStartedDialog.length - 1)]!,
			item.name,
		);
		speakNpcLine(started);
		addLog(started);

		if (orderMidTimeoutRef.current !== null) {
			window.clearTimeout(orderMidTimeoutRef.current);
		}
		if (orderCompleteTimeoutRef.current !== null) {
			window.clearTimeout(orderCompleteTimeoutRef.current);
		}
		if (orderRewardTimeoutRef.current !== null) {
			window.clearTimeout(orderRewardTimeoutRef.current);
		}
		if (cafeObservationIntervalRef.current !== null) {
			window.clearInterval(cafeObservationIntervalRef.current);
		}
		cafeObservationIntervalRef.current = window.setInterval(() => {
			setCafeObservation(nextCafeObservation(item.name));
		}, 5000);

		const extraMiddleSteps =
			item.name === "Pizza"
				? 2
				: item.name === "Hamburger" || item.name === "Salad"
					? 1
					: 0;
		const middleStepCount = 1 + extraMiddleSteps;
		let remainingMiddleSteps = middleStepCount;

		const finishOrder = () => {
			playMunch();
			setStamina((s) => Math.min(staminaMax, s + item.stamina));
			setIsOrdering(false);
			setCafeObservation("");
			if (cafeObservationIntervalRef.current !== null) {
				window.clearInterval(cafeObservationIntervalRef.current);
				cafeObservationIntervalRef.current = null;
			}
			if (cafeOrderMusicRef.current) {
				cafeOrderMusicRef.current.pause();
				cafeOrderMusicRef.current.currentTime = 0;
			}
			switchAreaMusic(getAreaMusicForMap(playerRef.current.map), true);
			orderMidTimeoutRef.current = null;
			orderCompleteTimeoutRef.current = null;
			orderRewardTimeoutRef.current = null;
		};

		const runMiddleStep = () => {
			const mid = orderMiddleDialog[randomInt(0, orderMiddleDialog.length - 1)]!;
			speakNpcLine(mid);
			addLog(mid);
			remainingMiddleSteps -= 1;
			if (remainingMiddleSteps > 0) {
				orderMidTimeoutRef.current = window.setTimeout(
					runMiddleStep,
					randomInt(5, 12) * 1000,
				);
				return;
			}
			orderCompleteTimeoutRef.current = window.setTimeout(() => {
				const done = orderLine(
					orderCompleteDialog[randomInt(0, orderCompleteDialog.length - 1)]!,
					item.name,
				);
				speakNpcLine(done);
				addLog(done);
				orderRewardTimeoutRef.current = window.setTimeout(finishOrder, 1500);
			}, randomInt(5, 12) * 1000);
		};

		orderMidTimeoutRef.current = window.setTimeout(
			runMiddleStep,
			randomInt(5, 12) * 1000,
		);
	};

	const openMenu = (title: string, body: string[], options: ModalOption[]) => {
		playNotification();
		setPauseGame(true);
		setModal({ title, body, options });
		setModalIndex(0);
	};

	const closeMenu = () => {
		const wasBottleDialog = modal?.title === "Message In A Bottle";
		playNotification();
		setPauseGame(false);
		setQuantityPrompt(null);
		quantityParentMenuRef.current = null;
		setModal(null);
		setModalIndex(0);
		if (wasBottleDialog) {
			fadeOutSeagulls();
		}
	};

	const cancelQuantityPrompt = () => {
		const parent = quantityParentMenuRef.current;
		if (parent) {
			playNotification();
			setQuantityPrompt(null);
			setModal(parent.modal);
			setModalIndex(parent.index);
			quantityParentMenuRef.current = null;
			return;
		}
		closeMenu();
	};

	const openQuantityPrompt = (cfg: {
		mode: "buy" | "sell";
		itemLabel: string;
		max: number;
		unitPrice: number;
		onConfirm: (quantity: number) => void;
	}) => {
		const max = Math.max(0, cfg.max);
		if (max < 1) {
			addLog(
				cfg.mode === "buy"
					? "Cannot afford any quantity."
					: "You do not have any to sell.",
			);
			return;
		}
		setQuantityPrompt({
			min: 0,
			max,
			value: 1,
			unitPrice: cfg.unitPrice,
			mode: cfg.mode,
			itemLabel: cfg.itemLabel,
			onConfirm: cfg.onConfirm,
		});
		if (modal) {
			quantityParentMenuRef.current = { modal, index: modalIndex };
		}
		openMenu(
			`${cfg.mode === "buy" ? "Buy" : "Sell"} Quantity`,
			[`${cfg.itemLabel}`],
			[],
		);
		setModalIndex(0);
	};

	const countOpenBarnTiles = (occupied: Record<number, { x: number; y: number }>) => {
		let count = 0;
		const rows = activeMapLayouts[animalsMap];
		for (let y = barnInteriorBounds.minY; y <= barnInteriorBounds.maxY; y += 1) {
			for (let x = barnInteriorBounds.minX; x <= barnInteriorBounds.maxX; x += 1) {
				if (!isPassableChar(rows[y]?.[x] ?? "#")) continue;
				const used = Object.values(occupied).some((p) => p.x === x && p.y === y);
				if (!used) count += 1;
			}
		}
		return count;
	};

	const nextOpenBarnTile = (occupied: Record<number, { x: number; y: number }>) => {
		const rows = activeMapLayouts[animalsMap];
		for (let y = barnInteriorBounds.minY; y <= barnInteriorBounds.maxY; y += 1) {
			for (let x = barnInteriorBounds.minX; x <= barnInteriorBounds.maxX; x += 1) {
				if (!isPassableChar(rows[y]?.[x] ?? "#")) continue;
				const used = Object.values(occupied).some((p) => p.x === x && p.y === y);
				if (!used) return { x, y };
			}
		}
		return null;
	};

	const getEggDropNearChicken = (
		chickenPos: { x: number; y: number },
		occupiedAnimals: Record<number, { x: number; y: number }>,
		existingEggs: Record<string, boolean>,
	) => {
		const candidates = [...chickenEggOffsets].sort(() => Math.random() - 0.5);
		const rows = activeMapLayouts[animalsMap];
		const allowOutsideBarn = animalsMap === "barn" && isBarnExternal(barnTier);
		const bounds = allowOutsideBarn
			? {
					minX: 1,
					maxX: Math.max(1, (rows[0]?.length ?? 0) - 2),
					minY: 1,
					maxY: Math.max(1, rows.length - 2),
				}
			: barnInteriorBounds;
		for (const { dx, dy } of candidates) {
			const x = chickenPos.x + dx;
			const y = chickenPos.y + dy;
			if (
				x < bounds.minX ||
				x > bounds.maxX ||
				y < bounds.minY ||
				y > bounds.maxY
			)
				continue;
			if (!isPassableChar(rows[y]?.[x] ?? "#")) continue;
			if (Object.values(occupiedAnimals).some((p) => p.x === x && p.y === y))
				continue;
			const key = keyForPos(x, y);
			if (existingEggs[key]) continue;
			return { x, y };
		}
		return null;
	};

	const nextDay = () => {
		endFishing();
		const nextWeather = randomWeather();
		const upcomingDay = day + 1;
		const earnedYesterday = currentDayEarned;
		setPreviousDayEarned(earnedYesterday);
		setCurrentDayEarned(0);
		stopAreaFade();
		if (currentAreaMusicRef.current) {
			currentAreaMusicRef.current.pause();
			currentAreaMusicRef.current.currentTime = 0;
		}
		if (endOfDayRef.current) {
			endOfDayRef.current.currentTime = 0;
			void endOfDayRef.current.play().catch(() => undefined);
		}
		setPauseGame(true);
		setDayTransitionPrompt(
			nextDayPrompts[randomInt(0, nextDayPrompts.length - 1)]!,
		);
		setDayTransition({
			day: upcomingDay,
			totalEarned,
			previousDayEarned: earnedYesterday,
		});
		setStamina(staminaMax);

		setDay((d) => d + 1);
		setCurrentWeather(nextWeather);
		setForestLockedToday(false);
		setCaveLockedToday(false);
		const nextBottlePos = rollBeachBottleSpawn(townBeachBottleTiles, randomInt);
		setBeachBottlePos(nextBottlePos);
		setBeachShellDrops(
			rollBeachShellDrops(
				townBeachBottleTiles,
				keyForPos,
				randomInt,
				nextBottlePos
					? new Set([keyForPos(nextBottlePos.x, nextBottlePos.y)])
					: undefined,
			),
		);
		setNpcDailyAssignments(
			generateDailyAssignmentsForNpcs(Object.keys(townNpcNames)),
		);
		setNpcTalkedToday({});
		const nextForest = generateForestState({
			level: 1,
			entranceSide: "left",
			entranceCoord: FOREST_GATE_Y,
			lastTurn: 0,
		});
		applyForestRoom(nextForest);
		const nextCave = generateCaveState({
			level: 1,
			entranceSide: "right",
			entranceCoord: CAVE_GATE_Y,
			lastTurn: 0,
		});
		applyCaveRoom(nextCave);
		setFarmWeedObstacles((prev) =>
			evolveFarmWeeds(
				prev,
				farmForestBlockers,
				farmCaveBlockers,
				new Set(Object.keys(plots)),
				false,
			),
		);

		setPlots((prev) => {
			const out: Record<string, Plot> = {};
			Object.entries(prev).forEach(([k, plot]) => {
				if (!plot.crop) {
					out[k] = { ...plot, watered: false };
					return;
				}
				out[k] = {
					...plot,
					growthDays: plot.growthDays + (plot.watered ? 1 : 0),
					watered: nextWeather === "rainy" && !!plot.crop,
				};
			});
			return out;
		});

		const chickensReadyToLay = animals.filter(
			(a) => a.type === "chicken" && a.fedToday,
		);
		if (chickensReadyToLay.length > 0) {
			let eggsLaid = 0;
			setFarmEggDrops((prev) => {
				const next = { ...prev };
				chickensReadyToLay.forEach((chicken) => {
					const pos = animalTiles[chicken.id];
					if (!pos) return;
					const drop = getEggDropNearChicken(pos, animalTiles, next);
					if (!drop) return;
					next[keyForPos(drop.x, drop.y)] = true;
					eggsLaid += 1;
				});
				return next;
			});
			if (eggsLaid > 0) {
				addLog(`Chickens laid ${eggsLaid} egg${eggsLaid === 1 ? "" : "s"}.`);
			}
		}
		setAnimals((prev) =>
			prev.map((a) => ({
				...a,
				hasProductReady: a.type === "chicken" ? false : a.fedToday,
				canProduceToday: a.fedToday,
				fedToday: false,
			})),
		);
		if (pendingBarnUpgrade) {
			const nextBarnTier = Math.min(
				BARN_MAX_TIER,
				(barnTier + 1) as BarnTier,
			) as BarnTier;
			setBarnTier(nextBarnTier);
			setPendingBarnUpgrade(false);
			addLog(
				`Your barn was upgraded overnight to ${BARN_TIER_NAMES[nextBarnTier]}.`,
			);
			if (isBarnExternal(nextBarnTier)) {
				const nextLayout = buildBarnLayout(nextBarnTier);
				const rows = nextLayout.map((r) => r.split(""));
				const bounds = {
					minX: 1,
					maxX: (rows[0]?.length ?? 0) - 2,
					minY: 1,
					maxY: rows.length - 2,
				};
				const nextCap = getBarnAnimalCap(nextBarnTier);
				const keptAnimals = animals.slice(0, nextCap);
				const occupied: Record<number, { x: number; y: number }> = {};
				keptAnimals.forEach((animal) => {
					let placed = false;
					for (let y = bounds.minY; y <= bounds.maxY && !placed; y += 1) {
						for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
							const used = Object.values(occupied).some(
								(p) => p.x === x && p.y === y,
							);
							if (used) continue;
							occupied[animal.id] = { x, y };
							placed = true;
							break;
						}
					}
				});
				setAnimals(keptAnimals);
				setAnimalTiles(occupied);
				setAnimalAnchors(occupied);
				setFarmEggDrops({});
			}
		}
		if (pendingTractorDelivery) {
			setHasTractor(true);
			setTractorParked(true);
			setPendingTractorDelivery(false);
			addLog("Your tractor has been delivered to the farm driveway.");
		}
		const deliveredPet = pendingPet;
		if (deliveredPet) {
			setOwnedPet(deliveredPet);
			setPendingPet(null);
			addLog(`Your new pet arrived at the farm: ${deliveredPet}`);
		}

		const oldPrices = prices;
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
		setPrices(newPrices);
		setPriceTrends(newTrends);
		const showSketchy = Math.random() < 0.25;
		setSketchyMerchantActive(showSketchy);
		setSketchyMerchantStock(
			showSketchy ? generateSketchyMerchantStock(newPrices) : [],
		);
		const showTrader = Math.random() < 0.5;
		setTraderActive(showTrader);
		setTraderTrades(showTrader ? generateTraderTrades() : []);
		setDoctorVendorActive(Math.random() < 1 / 3);
		setDoctorUsedToday(false);
		setPetVendorActive(!ownedPet && !deliveredPet && Math.random() < 0.5);

		const dailyNewspaper = generateDailyNewspaper(
			oldPrices,
			newPrices,
			changedItems,
			nextWeather,
			itemNames,
			randomInt,
		);
		setNewspaper(dailyNewspaper);
		addLog(`Day ${day + 1} began.`);
	};

	const finalizeAfterSleep = () => {
		setDayTransition(null);
		setDayTransitionClosePhase("idle");
		setPauseGame(false);
	};

	const continueAfterSleep = () => {
		if (!dayTransition || dayTransitionClosePhase !== "idle") return;
		crossFadeEndOfDayTo(houseMusicRef.current, 1000);
		setDayTransitionClosePhase("card");
		const toBackdrop = window.setTimeout(() => {
			setDayTransitionClosePhase("backdrop");
		}, 550);
		const finalize = window.setTimeout(() => {
			finalizeAfterSleep();
		}, 1550);
		dayTransitionCloseTimersRef.current = [toBackdrop, finalize];
	};

	useEffect(() => {
		dayTransitionCloseTimersRef.current.forEach((t) => window.clearTimeout(t));
		dayTransitionCloseTimersRef.current = [];
		dayTransitionTimersRef.current.forEach((t) => window.clearTimeout(t));
		dayTransitionTimersRef.current = [];
		if (!dayTransition) return;
		setDayTransitionStage("intro");
		setDayTransitionClosePhase("idle");
		setDayTransitionStarsState(createDayTransitionStars());
		const dayTimer = window.setTimeout(() => {
			setDayTransitionStage("day");
		}, 6000);
		const earnedTimer = window.setTimeout(() => {
			setDayTransitionStage("earned");
		}, 7000);
		const finalTimer = window.setTimeout(() => {
			setDayTransitionStage("final");
		}, 8000);
		dayTransitionTimersRef.current = [dayTimer, earnedTimer, finalTimer];
		return () => {
			dayTransitionTimersRef.current.forEach((t) => window.clearTimeout(t));
			dayTransitionTimersRef.current = [];
		};
	}, [dayTransition]);

	useEffect(() => {
		if (!dayTransition) return;
		if (dayTransitionStage !== "earned") return;
		if (dayTransition.previousDayEarned > 0) playChaChing();
		else playBad();
	}, [dayTransition, dayTransitionStage]);

	const stopBathing = (line?: string) => {
		if (!isBathing) return;
		setIsBathing(false);
		if (line) addLog(line);
	};

	useEffect(() => {
		if (!isBathing) return;
		const interval = window.setInterval(() => {
			setStamina((s) => Math.min(staminaMax, s + 1));
		}, 1000);
		return () => window.clearInterval(interval);
	}, [isBathing, staminaMax]);

	useEffect(() => {
		if (isBathing && stamina >= staminaMax) {
			stopBathing("You feel refreshed and step out of the bath.");
		}
	}, [isBathing, stamina, staminaMax]);

	const openRewardPopup = (line: string) => {
		playGotReward();
		addLog(line);
		openMenu(
			"Treasure Chest",
			[line],
			[{ label: "Nice!", onSelect: closeMenu }],
		);
	};

	const grantBonusChestRewardSet = (
		types: Array<"food" | "money" | "seeds" | "iron">,
	): string => {
		const lines: string[] = [];
		if (types.includes("food")) {
			const food = cafeMenuItems[randomInt(0, cafeMenuItems.length - 1)]!;
			setStamina((s) => Math.min(staminaMax, s + food.stamina));
			lines.push(`Found ${food.name} (+${food.stamina} stamina).`);
		}
		if (types.includes("money")) {
			const amount = randomInt(10, 50);
			applyMoneyDelta(amount);
			lines.push(`Found $${amount}.`);
		}
		if (types.includes("seeds")) {
			const pick = getRandomCropId(standardCropIds, randomInt);
			const amount = randomInt(1, 5);
			updateInventory(cropDefs[pick].seedItem, amount);
			lines.push(`Found ${cropDefs[pick].name} Seed x${amount}.`);
		}
		if (types.includes("iron")) {
			updateInventory("iron", 1);
			lines.push("Found Iron +1.");
		}
		return lines.join(" ");
	};

	const openHighValueForestChestReward = () => {
		const roll = Math.random() * 100;
		const canGrantAnimalReward =
			animals.length < barnAnimalCap && nextOpenBarnTile(animalTiles) !== null;
		let rewardLine = "";
		if (roll < 50) {
			const foundMoney = randomInt(50, 200);
			applyMoneyDelta(foundMoney);
			rewardLine = `You found $${foundMoney} in the chest.`;
			if (Math.random() < 0.2) {
				updateInventory("iron", 1);
				rewardLine += " Also found Iron +1.";
			}
		} else if (roll < 75) {
			const pick = getRandomCropId(standardCropIds, randomInt);
			const amount = randomInt(5, 15);
			updateInventory(cropDefs[pick].seedItem, amount);
			rewardLine = `You found ${cropDefs[pick].name} Seed x${amount}.`;
			if (Math.random() < 0.2) {
				updateInventory("iron", 1);
				rewardLine += " Also found Iron +1.";
			}
		} else if (roll < 90) {
			const foundMoney = randomInt(200, 500);
			const pick = getRandomCropId(standardCropIds, randomInt);
			const amount = randomInt(5, 15);
			applyMoneyDelta(foundMoney);
			updateInventory(cropDefs[pick].seedItem, amount);
			rewardLine = `Lucky chest! $${foundMoney} and ${cropDefs[pick].name} Seed x${amount}.`;
			if (Math.random() < 0.35) {
				updateInventory("iron", 1);
				rewardLine += " Also found Iron +1.";
			}
		} else if (roll < 95) {
			const lockedLooks = allWardrobeLooks.filter(
				(look) => !ownedWardrobeLooks.includes(look),
			);
			if (lockedLooks.length > 0) {
				const look = lockedLooks[randomInt(0, lockedLooks.length - 1)]!;
				setOwnedWardrobeLooks((prev) => [...prev, look]);
				rewardLine = `You unlocked a new outfit: ${look}.`;
			} else {
				const fallbackMoney = randomInt(500, 1500);
				applyMoneyDelta(fallbackMoney);
				rewardLine = `You already own all the outfits! So instead, you found $${fallbackMoney} instead.`;
			}
		} else if (roll < 99 && canGrantAnimalReward) {
			const types: AnimalType[] = highValueChestAnimalTypes;
			const type = types[randomInt(0, types.length - 1)]!;
			const nextId = Math.max(0, ...animals.map((a) => a.id)) + 1;
			const spawn = nextOpenBarnTile(animalTiles);
			if (spawn) {
				setAnimals((prev) => [
					...prev,
					{
						id: nextId,
						type,
						fedToday: false,
						canProduceToday: false,
						hasProductReady: false,
					},
				]);
				setAnimalTiles((prev) => ({ ...prev, [nextId]: spawn }));
				setAnimalAnchors((prev) => ({ ...prev, [nextId]: spawn }));
				rewardLine = `The chest granted you a ${animalDefs[type].name}!`;
			} else {
				applyMoneyDelta(500);
				rewardLine = "The chest shifted and gave you $500 instead.";
			}
		} else {
			const upgradable = (Object.keys(tools) as ToolId[]).filter(
				(toolId) => tools[toolId] < TOOL_MAX_LEVEL,
			);
			if (upgradable.length > 0) {
				const toolId = upgradable[randomInt(0, upgradable.length - 1)]!;
				setTools((prev) => ({
					...prev,
					[toolId]: Math.min(TOOL_MAX_LEVEL, prev[toolId] + 1),
				}));
				rewardLine = `Treasure upgrade! ${toolNames[toolId]} improved.`;
			} else {
				applyMoneyDelta(500);
				rewardLine = "All tools maxed. The chest gave you $500.";
			}
		}
		openRewardPopup(rewardLine);
	};

	const interact = (dir: Dir) => {
		if (modal || fishing || isOrdering || isDoctorCompounding || isDrivingTractor)
			return;
		const { dx, dy } = dirDelta[dir];
		const tx = player.x + dx;
		const ty = player.y + dy;
		const targetBaseTile = activeMapLayouts[player.map]?.[ty]?.[tx];
		if (
			player.map === "forest" &&
			tx === forestEntranceDoorPos.x &&
			ty === forestEntranceDoorPos.y
		) {
			openForestExitMenu();
			return;
		}
		if (
			player.map === "forest" &&
			tx === forestForwardExitPos.x &&
			ty === forestForwardExitPos.y
		) {
			continueForestDungeon();
			return;
		}
		if (
			player.map === "cave" &&
			tx === caveEntranceDoorPos.x &&
			ty === caveEntranceDoorPos.y
		) {
			openCaveExitMenu();
			return;
		}
		if (player.map === "cave" && caveLadderPos && tx === caveLadderPos.x && ty === caveLadderPos.y) {
			continueCaveDungeon();
			return;
		}
		const targetDoor =
			player.map === "forest"
				? undefined
				: mapDoors[player.map].find((d) => d.x === tx && d.y === ty);
		if (targetDoor) {
			if (targetDoor.target.map === "forest" && forestLockedToday) {
				playBad();
				addLog("You are too scared to go back in the forest today.");
				return;
			}
			if (targetDoor.target.map === "forest" && !canEnterForest()) {
				playBad();
				addLog("You are too exhausted to enter the forest.");
				return;
			}
			if (targetDoor.target.map === "cave" && caveLockedToday) {
				playBad();
				addLog("You are too scared to go back in the cave today.");
				return;
			}
			if (targetDoor.target.map === "cave" && !canEnterCave()) {
				playBad();
				addLog("You are too exhausted to enter the cave.");
				return;
			}
			playNotification();
			setPlayer({
				map: targetDoor.target.map,
				x: targetDoor.target.x,
				y: targetDoor.target.y,
			});
			addLog(`Entered ${targetDoor.target.map}.`);
			return;
		}
		if (player.map === "farm" && ownedPet && petTile && petTile.x === tx && petTile.y === ty) {
			playPetSound(ownedPet);
			setPetHeartTile({ x: petTile.x, y: Math.max(0, petTile.y - 1) });
			if (petHeartTimeoutRef.current !== null) {
				window.clearTimeout(petHeartTimeoutRef.current);
			}
			petHeartTimeoutRef.current = window.setTimeout(() => {
				setPetHeartTile(null);
				petHeartTimeoutRef.current = null;
			}, 600);
			addLog(`You play with your pet ${ownedPet}.`);
			return;
		}
		if (
			player.map === "farm" &&
			hasTractor &&
			tractorParked &&
			tx === TRACTOR_PARK_POS.x &&
			ty === TRACTOR_PARK_POS.y
		) {
			openMenu("Choose Implament", ["Choose tractor implement."], [
				{
					label: "Plow",
					info: [
						"Turns grass into dirt as you drive.",
						"When driving tractor, press space to turn on and off your implement",
					],
					onSelect: () => {
						closeMenu();
						enterTractor("plow");
					},
				},
				{
					label: "Sow",
					info: [
						"Plants loaded seeds into empty dirt while driving.",
						"When driving tractor, press space to turn on and off your implement",
					],
					onSelect: () => {
						const seedChoices = allPlantableCropIds
							.map((cropId) => cropDefs[cropId].seedItem)
							.filter((itemId, idx, arr) => arr.indexOf(itemId) === idx)
							.filter((itemId) => inventory[itemId] > 0);
						if (seedChoices.length < 1) {
							playBad();
							openMenu("Tractor", ["Out of seeds"], [
								{ label: "OK", onSelect: closeMenu },
							]);
							return;
						}
						openMenu(
							"Load Seeds",
							["Choose seeds to load into the tractor."],
							[
								...seedChoices.map((seedItem) => ({
									label: `${itemNames[seedItem]} (${inventory[seedItem]})`,
									info: [
										"When driving tractor, press space to turn on and off your implement",
									],
									onSelect: () => {
										closeMenu();
										enterTractor("sow", seedItem);
									},
								})),
								{ label: "Back", onSelect: closeMenu },
							],
						);
					},
				},
				{
					label: "Water",
					info: [
						"Waters dry dirt and dry plants as you drive.",
						"When driving tractor, press space to turn on and off your implement",
					],
					onSelect: () => {
						closeMenu();
						enterTractor("water");
					},
				},
				{
					label: "Harvest",
					info: [
						"Harvests ready crops as you drive.",
						"When driving tractor, press space to turn on and off your implement",
					],
					onSelect: () => {
						closeMenu();
						enterTractor("harvest");
					},
				},
				{ label: "Back", onSelect: closeMenu },
			]);
			return;
		}
		if (
			player.map === "town" &&
			beachBottlePos &&
			beachBottlePos.x === tx &&
			beachBottlePos.y === ty
		) {
			setBeachBottlePos(null);
			playGotReward();
			const canRewardFood = stamina < staminaMax;
			const canGrantAnimalReward =
				animals.length < barnAnimalCap && nextOpenBarnTile(animalTiles) !== null;
			const maxRoll = canRewardFood
				? canGrantAnimalReward
					? 100
					: 90
				: canGrantAnimalReward
					? 75
					: 65;
			const roll = Math.random() * maxRoll;
			const gemRoll = Math.random() * 100;
			let rewardName = "";
			if (gemRoll < 1) {
				updateInventory("diamond", 1);
				rewardName = "Diamond";
			} else if (gemRoll < 4) {
				updateInventory("ruby", 1);
				rewardName = "Ruby";
			} else if (gemRoll < 6) {
				updateInventory("emerald", 1);
				rewardName = "Emerald";
			} else if (roll < 25) {
				const amount = randomInt(100, 1000);
				applyMoneyDelta(amount);
				rewardName = `$${amount}`;
			} else if (roll < 50) {
				const iron = randomInt(1, 3);
				updateInventory("iron", iron);
				rewardName = `Iron x${iron}`;
			} else if (canRewardFood && roll < 75) {
				const foods = cafeMenuItems.filter((item) => item.name !== "Coffee");
				const food = foods[randomInt(0, foods.length - 1)]!;
				setStamina((s) => Math.min(staminaMax, s + food.stamina));
				rewardName = food.name;
			} else if (roll < (canRewardFood ? 90 : 65)) {
				const lockedLooks = allWardrobeLooks.filter(
					(look) => !ownedWardrobeLooks.includes(look),
				);
				if (lockedLooks.length > 0) {
					const look = lockedLooks[randomInt(0, lockedLooks.length - 1)]!;
					setOwnedWardrobeLooks((prev) => [...prev, look]);
					rewardName = `Outfit ${look}`;
				} else {
					applyMoneyDelta(2000);
					rewardName = "$2000";
				}
			} else {
				const types: AnimalType[] = ["cow", "sheep", "chicken"];
				const type = types[randomInt(0, types.length - 1)]!;
				const spawn = nextOpenBarnTile(animalTiles);
				if (spawn) {
					const nextId = Math.max(0, ...animals.map((a) => a.id)) + 1;
					setAnimals((prev) => [
						...prev,
						{
							id: nextId,
							type,
							fedToday: false,
							canProduceToday: false,
							hasProductReady: false,
						},
					]);
					setAnimalTiles((prev) => ({ ...prev, [nextId]: spawn }));
					setAnimalAnchors((prev) => ({ ...prev, [nextId]: spawn }));
					rewardName = animalDefs[type].name;
				} else {
					applyMoneyDelta(2000);
					rewardName = "$2000";
				}
			}
			const garyMessage = makeGaryBottleMessage(rewardName, randomInt);
			addLog(garyMessage);
			playSeagulls();
			openMenu("Message In A Bottle", [garyMessage], [
				{ label: "Take Reward", onSelect: closeMenu },
			]);
			return;
		}
		if (player.map === "town" && beachShellDrops[keyForPos(tx, ty)]) {
			const shellKey = keyForPos(tx, ty);
			setBeachShellDrops((prev) => {
				const next = { ...prev };
				delete next[shellKey];
				return next;
			});
			playPluck();
			updateInventory("shell", 1);
			addLog("Picked up a shell.");
			return;
		}
		if (
			player.map === "farm" &&
			day === 1 &&
			!starterChestOpened &&
			tx === STARTER_CHEST_POS.x &&
			ty === STARTER_CHEST_POS.y
		) {
			setStarterChestOpened(true);
			applyMoneyDelta(1200);
			updateInventory("turnip_seed", 5);
			openRewardPopup("Starter chest reward: $1200 and Turnip Seeds x5.");
			return;
		}
		const farmTargetKey = keyForPos(tx, ty);
		if (player.map === "farm" && farmWeedObstacles[farmTargetKey]) {
			if (!trySpendStamina(1)) return;
			setFarmWeedObstacles((prev) => ({ ...prev, [farmTargetKey]: false }));
			playHoe();
			const gotFeed = Math.random() < 0.5;
			const gotMoney = Math.random() < 0.02;
			const lines: string[] = [];
			if (gotFeed) {
				updateInventory("feed", 1);
				lines.push("Found Feed +1.");
			}
			if (gotMoney) {
				const amount = randomInt(1, 5);
				applyMoneyDelta(amount);
				lines.push(`Found $${amount}.`);
			}
			addLog(lines.length > 0 ? lines.join(" ") : "You cleared some weeds.");
			return;
		}
		if (targetBaseTile === "~" || targetBaseTile === "[") {
			const waterCapacity = getWaterCapacity(tools);
			if (waterLevel < waterCapacity) {
				if (!tryUseToolAction(tools.wateringCan)) return;
				setWaterLevel(waterCapacity);
				playWater();
				setWaterRefillTile({ map: player.map, x: tx, y: ty });
				if (waterRefillTileTimeoutRef.current !== null) {
					window.clearTimeout(waterRefillTileTimeoutRef.current);
				}
				waterRefillTileTimeoutRef.current = window.setTimeout(() => {
					setWaterRefillTile(null);
					waterRefillTileTimeoutRef.current = null;
				}, 1000);
				addLog("Refilled water.");
				return;
			}
			if (tools.fishingRod <= 0) {
				playBad();
				addLog("You need a Fishing Rod to fish.");
				return;
			}
			if (!tryUseToolAction(tools.fishingRod)) return;
			startFishing(player.map, tx, ty);
			return;
		}

		if (player.map === "forest") {
			if (forestChest.x === tx && forestChest.y === ty && !forestChest.opened) {
				setForestChest((prev) => ({ ...prev, opened: true }));
				openHighValueForestChestReward();
				return;
			}

			const bonusChest = forestBonusChests.find(
				(chest) => chest.x === tx && chest.y === ty && !chest.opened,
			);
			if (bonusChest) {
				setForestBonusChests((prev) =>
					prev.map((chest) =>
						chest.id === bonusChest.id ? { ...chest, opened: true } : chest,
					),
				);
				if (forestIsBonusLevel) {
					openHighValueForestChestReward();
					return;
				}
				const roll = Math.random();
				let line = "";
				if (roll < 0.2) {
					const options: Array<"food" | "money" | "seeds" | "iron"> = [
						"food",
						"money",
						"seeds",
						"iron",
					];
					line = grantBonusChestRewardSet([
						options[randomInt(0, options.length - 1)]!,
					]);
				} else if (roll < 0.4) {
					line = grantBonusChestRewardSet(["money"]);
				} else if (roll < 0.6) {
					line = grantBonusChestRewardSet(["seeds"]);
				} else if (roll < 0.8) {
					const options = ["food", "money", "seeds", "iron"] as const;
					const shuffled = [...options].sort(() => Math.random() - 0.5);
					line = grantBonusChestRewardSet([shuffled[0]!, shuffled[1]!]);
				} else {
					const options = ["food", "money", "seeds", "iron"] as const;
					const withIron = Math.random() < 0.5;
					line = grantBonusChestRewardSet(
						withIron ? [...options] : ["food", "money", "seeds"],
					);
				}
				openRewardPopup(line);
				return;
			}

			const obstacle = forestObstacleAt(tx, ty);
			if (obstacle?.type === "weed") {
				if (!trySpendStamina(1)) return;
				setForestObstacles((prev) => prev.filter((o) => o.id !== obstacle.id));
				playHoe();
				const gotFeed = Math.random() < 0.5;
				const gotMoney = Math.random() < 0.02;
				const lines: string[] = [];
				if (gotFeed) {
					updateInventory("feed", 1);
					lines.push("Found Feed +1.");
				}
				if (gotMoney) {
					const amount = randomInt(1, 5);
					applyMoneyDelta(amount);
					lines.push(`Found $${amount}.`);
				}
				addLog(lines.length > 0 ? lines.join(" ") : "You cleared some weeds.");
				return;
			}
			if (obstacle?.type === "wood") {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 0) {
					playBad();
					addLog("A Smash Axe is needed to break wood.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				setForestObstacles((prev) => prev.filter((o) => o.id !== obstacle.id));
				playHoe();
				const seedChance = getSmashAxeWoodSeedChance(smashAxeLevel);
				if (Math.random() < seedChance) {
					const cropId = getRandomCropId(standardCropIds, randomInt);
					const seedItem = cropDefs[cropId].seedItem;
					updateInventory(seedItem, 1);
					addLog(`You chopped wood and found ${itemNames[seedItem]} +1.`);
				} else {
					addLog("You broke the wood obstacle.");
				}
				return;
			}
			if (obstacle?.type === "rock") {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 1) {
					playBad();
					addLog("Your Smash Axe tier is too low to break rocks.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				const damage = getSmashAxeRockDamage(smashAxeLevel);
				const nextHitsRemaining = Math.max(0, obstacle.hitsRemaining - damage);
				setForestObstacles((prev) =>
					prev
						.map((o) =>
							o.id === obstacle.id
								? { ...o, hitsRemaining: Math.max(0, o.hitsRemaining - damage) }
								: o,
						)
						.filter((o) => o.hitsRemaining > 0),
				);
				playHoe();
				if (nextHitsRemaining > 0) {
					const swingsLeft = Math.ceil(nextHitsRemaining / damage);
					addLog(`You chip the rock. ${swingsLeft} swing${swingsLeft === 1 ? "" : "s"} left.`);
				} else {
					if (Math.random() < getSmashAxeIronChance(smashAxeLevel)) {
						updateInventory("iron", 1);
						playYaya();
						addLog("You broke the rock and found Iron +1.");
					} else {
						addLog("You broke the rock.");
					}
				}
				return;
			}
		}
		if (player.map === "cave") {
			const obstacle = caveObstacleAt(tx, ty);
			if (obstacle?.type === "rock") {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 1) {
					playBad();
					addLog("Your Smash Axe tier is too low to break cave rocks.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				const damage = getSmashAxeRockDamage(smashAxeLevel);
				const nextHitsRemaining = Math.max(0, obstacle.hitsRemaining - damage);
				setCaveObstacles((prev) =>
					prev
						.map((o) =>
							o.id === obstacle.id
								? { ...o, hitsRemaining: Math.max(0, o.hitsRemaining - damage) }
								: o,
						)
						.filter((o) => o.hitsRemaining > 0),
				);
				playHoe();
				if (nextHitsRemaining > 0) {
					const swingsLeft = Math.ceil(nextHitsRemaining / damage);
					addLog(`You chip the cave rock. ${swingsLeft} swing${swingsLeft === 1 ? "" : "s"} left.`);
				} else {
					let foundGem = false;
					if (caveLevel >= 10 && Math.random() < 1 / 40) {
						updateInventory("diamond", 1);
						playYaya();
						addLog("You found a Diamond! (+1)");
						foundGem = true;
					} else if (caveLevel >= 5 && Math.random() < 1 / 30) {
						updateInventory("emerald", 1);
						playYaya();
						addLog("You found an Emerald! (+1)");
						foundGem = true;
					} else if (Math.random() < 1 / 10) {
						updateInventory("ruby", 1);
						playYaya();
						addLog("You found a Ruby! (+1)");
						foundGem = true;
					}
					if (!foundGem && Math.random() < getSmashAxeIronChance(smashAxeLevel)) {
						updateInventory("iron", 1);
						playYaya();
						addLog("You broke the cave rock and found Iron +1.");
					} else if (!foundGem) {
						addLog("You broke the cave rock.");
					}
					if (!caveLadderPos) {
						const remainingRocks = caveObstacles.filter((o) => o.id !== obstacle.id).length;
						const revealChance = 1 / 12;
						if (remainingRocks <= 0 || Math.random() < revealChance) {
							setCaveLadderPos({ x: obstacle.x, y: obstacle.y });
							addLog("A ladder appears leading deeper into the cave.");
						}
					}
				}
				return;
			}
		}

		if (player.map === animalsMap) {
			const blockerKey = keyForPos(tx, ty);
			if (farmForestBlockers[blockerKey]) {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 0) {
					playBad();
					addLog("A Smash Axe is needed to clear this path.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				setFarmForestBlockers((prev) => ({ ...prev, [blockerKey]: false }));
				playHoe();
				const seedChance = getSmashAxeWoodSeedChance(smashAxeLevel);
				if (Math.random() < seedChance) {
					const cropId = getRandomCropId(standardCropIds, randomInt);
					const seedItem = cropDefs[cropId].seedItem;
					updateInventory(seedItem, 1);
					addLog(`You cleared the path and found ${itemNames[seedItem]} +1.`);
				} else {
					addLog("You chopped away the forest blockage.");
				}
				return;
			}
			if (farmCaveBlockers[blockerKey]) {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 1) {
					playBad();
					addLog("Your Smash Axe tier is too low to break these cave rocks.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				const damage = getSmashAxeRockDamage(smashAxeLevel);
				const hitsRemaining = farmCaveBlockers[blockerKey] ?? 0;
				const nextHitsRemaining = Math.max(0, hitsRemaining - damage);
				setFarmCaveBlockers((prev) => {
					const current = prev[blockerKey] ?? 0;
					const remaining = Math.max(0, current - damage);
					if (remaining <= 0) {
						const next = { ...prev };
						delete next[blockerKey];
						return next;
					}
					return { ...prev, [blockerKey]: remaining };
				});
				playHoe();
				if (nextHitsRemaining > 0) {
					const swingsLeft = Math.ceil(nextHitsRemaining / damage);
					addLog(
						`You chip the cave blockage. ${swingsLeft} swing${swingsLeft === 1 ? "" : "s"} left.`,
					);
				} else {
					if (Math.random() < getSmashAxeIronChance(smashAxeLevel)) {
						updateInventory("iron", 1);
						playYaya();
						addLog("You smashed the cave blockage and found Iron +1.");
					} else {
						addLog("You smashed the cave blockage.");
					}
				}
				return;
			}
			if (petGraveObstacles[blockerKey]) {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 1) {
					playBad();
					addLog("Your Smash Axe tier is too low to break this gravestone.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				const damage = getSmashAxeRockDamage(smashAxeLevel);
				const hitsRemaining = petGraveObstacles[blockerKey] ?? 0;
				const nextHitsRemaining = Math.max(0, hitsRemaining - damage);
				setPetGraveObstacles((prev) => {
					const current = prev[blockerKey] ?? 0;
					const remaining = Math.max(0, current - damage);
					if (remaining <= 0) {
						const next = { ...prev };
						delete next[blockerKey];
						return next;
					}
					return { ...prev, [blockerKey]: remaining };
				});
				playHoe();
				if (nextHitsRemaining > 0) {
					const swingsLeft = Math.ceil(nextHitsRemaining / damage);
					addLog(
						`You chip the gravestone. ${swingsLeft} swing${swingsLeft === 1 ? "" : "s"} left.`,
					);
				} else if (Math.random() < getSmashAxeIronChance(smashAxeLevel)) {
					updateInventory("iron", 1);
					playYaya();
					addLog("You smashed the gravestone and found Iron +1.");
				} else {
					addLog("You smashed the gravestone.");
				}
				return;
			}
			const baseTile = activeMapLayouts.farm[ty]?.[tx];
			const plotKey = keyForPos(tx, ty);
			if (baseTile === "," && !plots[plotKey]) {
				const targets = getHoeTargets(player.x, player.y, dir, tools.hoe);
				const nextPlots: Record<string, Plot> = { ...plots };
				let hoedCount = 0;
				targets.forEach(({ x, y }) => {
					const row = activeMapLayouts.farm[y];
					if (!row || row[x] !== ",") return;
					const key = keyForPos(x, y);
					if (nextPlots[key]) return;
					nextPlots[key] = { crop: null, growthDays: 0, watered: false };
					hoedCount += 1;
				});
				if (hoedCount > 0) {
					if (!tryUseToolAction(tools.hoe)) return;
					setPlots(nextPlots);
					playHoe();
					addLog(`Hoed ${hoedCount} tile${hoedCount === 1 ? "" : "s"}.`);
				} else {
					addLog("No grass to hoe there.");
				}
				return;
			}
			if (plots[plotKey]) {
				const plot = plots[plotKey];
				if (!plot.crop) {
					const seedOptions = allPlantableCropIds
						.filter((cropId) => inventory[cropDefs[cropId].seedItem] > 0)
						.map((cropId) => ({
							cropId,
							def: cropDefs[cropId],
						}));
					openMenu(
						"Plant Seed",
						[
							seedOptions.length > 0
								? "Choose seed to plant in this plot."
								: "No seeds available. You can reset this tile to grass.",
						],
						[
							...seedOptions.map(({ cropId, def }) => ({
								label: `${cropId === "coral_fruit" ? "Sea Shell" : def.name} (${inventory[def.seedItem]})`,
								info: [
									`Grow Time: ${def.growDays} day${def.growDays === 1 ? "" : "s"}`,
									`Current Sell Value: $${def.harvestItem === "coral_fruit" ? CORAL_FRUIT_SELL_PRICE : prices[def.harvestItem]}`,
									`Seed In Bag: ${inventory[def.seedItem]}`,
								],
								onSelect: () => {
									updateInventory(def.seedItem, -1);
									setPlots((prev) => ({
										...prev,
										[plotKey]: {
											crop: cropId,
											growthDays: 0,
											watered: currentWeather === "rainy",
										},
									}));
									playPloop();
									addLog(`Planted ${def.name}.`);
									closeMenu();
								},
							})),
							{
								label: "Reset to Grass",
								info: ["Turn this soil tile back into grass."],
								onSelect: () => {
									setPlots((prev) => {
										const next = { ...prev };
										delete next[plotKey];
										return next;
									});
									playHoe();
									addLog("Reset soil to grass.");
									closeMenu();
								},
							},
							{
								label: "Back",
								info: ["Close this menu."],
								onSelect: closeMenu,
							},
						],
					);
					return;
				}

				const crop = cropDefs[plot.crop];
				const grown = plot.growthDays >= crop.growDays;
				if (grown) {
					setPlots((prev) => ({
						...prev,
						[plotKey]: { crop: null, growthDays: 0, watered: false },
					}));
					updateInventory(crop.harvestItem, 1);
					playPluck();
					addLog(`Harvested ${crop.name}.`);
				} else if (!plot.watered) {
					const targets = getHoeTargets(
						player.x,
						player.y,
						dir,
						tools.wateringCan,
					);
					const waterableKeys = targets
						.map(({ x, y }) => keyForPos(x, y))
						.filter((k) => {
							const p = plots[k];
							if (!p?.crop || p.watered) return false;
							const def = cropDefs[p.crop];
							return p.growthDays < def.growDays;
						});
					if (waterLevel <= 0) {
						playBad();
						addLog("Out of water. Refill at a water tile.");
						return;
					}
					const wateredCount = Math.min(waterLevel, waterableKeys.length);
					if (wateredCount <= 0) {
						addLog("No thirsty plants in range.");
						return;
					}
					if (!tryUseToolAction(tools.wateringCan)) return;
					const keysToWater = waterableKeys.slice(0, wateredCount);
					setWaterLevel((w) => Math.max(0, w - wateredCount));
					setPlots((prev) => ({
						...prev,
						...Object.fromEntries(
							keysToWater.map((k) => [k, { ...prev[k]!, watered: true }]),
						),
					}));
					playWater();
					addLog(
						`Watered ${wateredCount} plant${wateredCount === 1 ? "" : "s"}.`,
					);
				} else {
					addLog(
						`${crop.name} is growing (${plot.growthDays}/${crop.growDays} days). This plant is watered and will grow tonight.`,
					);
				}
				return;
			}
		}

		if (player.map === "house" && targetBaseTile === "d") {
			openMenu(
				"Call it a day?",
				["Sleep until tomorrow?"],
				[
					{
						label: "Yes",
						onSelect: () => {
							playNotification();
							closeMenu();
							nextDay();
						},
					},
					{ label: "No", onSelect: closeMenu },
				],
			);
			return;
		}
		if (player.map === "house" && targetBaseTile === "U") {
			if (stamina >= staminaMax) {
				addLog("You are not tired enough to take a bath right now.");
				return;
			}
			setIsBathing(true);
			playBath();
			addLog("You settle into a warm bath.");
			return;
		}
		if (player.map === "house" && targetBaseTile === "w") {
			const remainingOutfits = clothingShopItems.filter(
				(item) => !ownedWardrobeLooks.includes(item.look),
			).length;
			const hasMoreToPurchase = remainingOutfits > 0;
			openMenu(
				"Wardrobe",
				["Choose your look."],
				[
					...ownedWardrobeLooks.map((look) => ({
						label: look,
						info: [
							starterWardrobeLooks.includes(
								look as (typeof starterWardrobeLooks)[number],
							)
								? "A starter outfit that came with your house"
								: purchasableFunnyLooks.includes(
											look as (typeof purchasableFunnyLooks)[number],
									  )
									? "A very fancy costume you bought for a pretty penny"
									: "An outfit you bought from town",
							...(hasMoreToPurchase
								? ["", "", "More outfits can be purchased in town."]
								: []),
						],
						onSelect: () => {
							setPlayerEmoji(look);
							addLog(`Changed outfit to ${look}.`);
							closeMenu();
						},
					})),
					{ label: "Back", onSelect: closeMenu },
				],
			);
			return;
		}

		if (player.map === "farm") {
			if (farmEggDrops[farmTargetKey]) {
				setFarmEggDrops((prev) => {
					const next = { ...prev };
					delete next[farmTargetKey];
					return next;
				});
				playPluck();
				updateInventory("egg", 1);
				addLog("Picked up an egg.");
				return;
			}
			const nearAnimals = animals
				.map((a) => {
					const pos = animalTiles[a.id];
					if (!pos) return null;
					return { a, x: pos.x, y: pos.y };
				})
				.filter((n): n is { a: Animal; x: number; y: number } => n !== null);
			const found = nearAnimals.find((n) => n.x === tx && n.y === ty);
			if (found) {
				const animal = found.a;
				if (animal.type !== "chicken" && animal.hasProductReady) {
					const product = animalDefs[animal.type].productItem;
					const toolLevel =
						isCowLikeAnimal(animal.type) ? tools.milkingGloves : tools.shears;
					const produced = rollLivestockYield(toolLevel);
					updateInventory(product, produced);
					setAnimals((prev) =>
						prev.map((a) =>
							a.id === animal.id ? { ...a, hasProductReady: false } : a,
						),
					);
					playPluck();
					if (Math.random() < 0.25) {
						const lines = isCowLikeAnimal(animal.type)
							? cowHarvestTtsLines
							: sheepHarvestTtsLines;
						const line = lines[randomInt(0, lines.length - 1)]!;
						speakNpcLine(line);
					}
					addLog(
						`${isCowLikeAnimal(animal.type) ? "Milked" : "Sheared"} ${animalDefs[animal.type].name}: ${itemNames[product]} x${produced}.`,
					);
					return;
				}
				if (animal.fedToday) {
					const line = generateOverfedAnimalLine(animalDefs[animal.type].name);
					speakNpcLine(line);
					addLog(line);
					return;
				}
				if (inventory.feed <= 0) {
					playBad();
					addLog(`No feed left for ${animalDefs[animal.type].name}.`);
					return;
				}
				setAnimals((prev) =>
					prev.map((a) => (a.id === animal.id ? { ...a, fedToday: true } : a)),
				);
				updateInventory("feed", -1);
				playMunch();
				addLog(`${animalDefs[animal.type].name} was fed.`);
				return;
			}
		}

		if (
			player.map === "tool_shop" &&
			((targetBaseTile === "x" && tx >= 8) || targetBaseTile === "b")
		) {
			interactBuilderVendor();
			return;
		}
		if (player.map === "tool_shop") {
			if ((targetBaseTile === "x" && tx <= 6) || targetBaseTile === "j") {
				interactVendor("tool_vendor");
				return;
			}
			if (targetBaseTile === "x" && tx === 7) {
				return;
			}
		}
		if (isShopMap(player.map)) {
			const vendorKey = vendorByShopMap[player.map];
			if (vendorKey && (targetBaseTile === "x" || targetBaseTile === "j")) {
				interactVendor(vendorKey);
				return;
			}
		}

		if (player.map === "town") {
			if (
				petVendorActive &&
				!ownedPet &&
				tx === PET_VENDOR_POS.x &&
				ty === PET_VENDOR_POS.y
			) {
				if (pendingPet) {
					speakNpcLine(petVendorSoldLine);
					addLog(petVendorSoldLine);
					return;
				}
				const intro = "Looking to adopt an animal? Pick one!";
				speakNpcLine(intro);
				openMenu(
					"Pet Adoption",
					[intro],
					[
						...petOptions.map((pet) => ({
							label: `${pet} $500`,
							info: ["A loyal buddy for your farm."],
							onSelect: () => {
								if (!canAfford(500)) {
									playBad();
									addLog("Not enough money to adopt that pet.");
									closeMenu();
									return;
								}
								applyMoneyDelta(-500);
								playChaChing();
								setPendingPet(pet);
								closeMenu();
								speakNpcLine(petVendorSoldLine);
								addLog(petVendorSoldLine);
							},
						})),
						{ label: "Back", onSelect: closeMenu },
					],
				);
				return;
			}
		if (doctorVendorActive && tx === DOCTOR_POS.x && ty === DOCTOR_POS.y) {
			if (doctorUsedToday) {
				speakNpcLine(doctorFinishedTodayLine);
				addLog(doctorFinishedTodayLine);
				return;
			}
			const intro =
				doctorIntroLines[randomInt(0, doctorIntroLines.length - 1)]!;
			speakNpcLine(intro);
			openMenu(
				"Doctor",
					[
						intro,
						"Cost: 1 Diamond, 1 Emerald, 1 Ruby, and $1000.",
					],
					[
						{
							label: "Yes",
							info: ["A custom treatment that increases max stamina by 20."],
							onSelect: () => {
								if (!canAfford(1000)) {
									playBad();
									addLog("Not enough money for treatment.");
									closeMenu();
									return;
								}
								if (
									inventory.diamond < 1 ||
									inventory.emerald < 1 ||
									inventory.ruby < 1
								) {
									playBad();
									addLog("You need 1 Diamond, 1 Emerald, and 1 Ruby.");
									closeMenu();
									return;
								}
								applyMoneyDelta(-1000);
								updateInventory("diamond", -1);
								updateInventory("emerald", -1);
								updateInventory("ruby", -1);
								playChaChing();
								startDoctorMedicine();
							},
						},
						{ label: "No", onSelect: closeMenu },
					],
				);
				return;
			}
			if (traderActive && tx === TRADER_BOX_POS.x && ty === TRADER_BOX_POS.y) {
				const line = traderBoxLines[randomInt(0, traderBoxLines.length - 1)]!;
				speakNpcLine(line);
				addLog(line);
				return;
			}
			if (traderActive && tx === TRADER_HELI_POS.x && ty === TRADER_HELI_POS.y) {
				const line = traderHeliLines[randomInt(0, traderHeliLines.length - 1)]!;
				speakNpcLine(line);
				addLog(line);
				return;
			}
			if (traderActive && tx === TRADER_POS.x && ty === TRADER_POS.y) {
				if (traderTrades.length <= 0) {
					const line =
						traderSoldOutLines[randomInt(0, traderSoldOutLines.length - 1)]!;
					speakNpcLine(line);
					addLog(line);
					return;
				}
				const intro =
					traderIntroLines[randomInt(0, traderIntroLines.length - 1)]!;
				speakNpcLine(intro);
				openMenu(
					"Trader",
					[intro],
					[
						...traderTrades.map((trade) => {
							const maxCanTrade = Math.min(
								trade.remaining,
								inventory[trade.wantItem],
							);
							return {
								label: `Trade ${itemNames[trade.wantItem]} -> ${itemNames[trade.giveItem]}`,
								info: [
									`Needs: ${itemNames[trade.wantItem]}`,
									`Gives: ${itemNames[trade.giveItem]}`,
									`You have: ${inventory[trade.wantItem]}`,
									`Trader stock: ${trade.remaining}`,
									"Rate: 1 for 1",
								],
								onSelect: () => {
									openQuantityPrompt({
										mode: "buy",
										itemLabel: `${itemNames[trade.wantItem]} -> ${itemNames[trade.giveItem]}`,
										max: maxCanTrade,
										unitPrice: 0,
										onConfirm: (quantity) => {
											updateInventory(trade.wantItem, -quantity);
											updateInventory(trade.giveItem, quantity);
											setTraderTrades((prev) =>
												prev
													.map((t) =>
														t.id === trade.id
															? {
																	...t,
																	remaining: Math.max(0, t.remaining - quantity),
																}
															: t,
													)
													.filter((t) => t.remaining > 0),
											);
											playChaChing();
											const line =
												traderAfterSaleLines[
													randomInt(0, traderAfterSaleLines.length - 1)
												]!;
											speakNpcLine(line);
											addLog(line);
										},
									});
								},
							};
						}),
						{
							label: "Back",
							info: ["Close this shop menu."],
							onSelect: closeMenu,
						},
					],
				);
				return;
			}
			if (
				sketchyMerchantActive &&
				sketchyMerchantStock.length > 0 &&
				tx === SKETCHY_CRATE_POS.x &&
				ty === SKETCHY_CRATE_POS.y
			) {
				const line =
					dontTouchSketchy[randomInt(0, dontTouchSketchy.length - 1)]!;
				speakNpcLine(line);
				return;
			}
			if (
				sketchyMerchantActive &&
				tx === SKETCHY_MERCHANT_POS.x &&
				ty === SKETCHY_MERCHANT_POS.y
			) {
				if (sketchyMerchantStock.length <= 0) {
					const soldOutLine = "I aint got nothin more today";
					speakNpcLine(soldOutLine);
					addLog(soldOutLine);
					return;
				}
				const intro =
					sketchyMerchantIntro[
						randomInt(0, sketchyMerchantIntro.length - 1)
					]!;
				speakNpcLine(intro);
				openMenu(
					"Sketchy Merchant",
					[intro],
					[
						...sketchyMerchantStock.map((entry) => {
							const maxCanBuy = Math.min(
								entry.qty,
								Math.floor(money / Math.max(1, entry.price)),
							);
							return {
								label: `${itemNames[entry.item]} $${entry.price}`,
								info: [
									`Stock: ${entry.qty}`,
									`You can buy now: ${maxCanBuy}`,
									`Price: $${entry.price} each`,
									`Item: ${itemNames[entry.item]}`,
								],
								dealMeta: {
									itemId: entry.item,
									mode: "buy" as const,
									unitPrice: entry.price,
									baseUnitPrice: entry.basePrice,
								},
								onSelect: () => {
									openQuantityPrompt({
										mode: "buy",
										itemLabel: itemNames[entry.item],
										max: maxCanBuy,
										unitPrice: entry.price,
										onConfirm: (quantity) => {
											applyMoneyDelta(-entry.price * quantity);
											updateInventory(entry.item, quantity);
											setSketchyMerchantStock((prev) =>
												prev
													.map((stockEntry) =>
														stockEntry.item === entry.item
															? {
																	...stockEntry,
																	qty: Math.max(0, stockEntry.qty - quantity),
																}
															: stockEntry,
													)
													.filter((stockEntry) => stockEntry.qty > 0),
											);
											playChaChing();
											const salesLine =
												sketchyVendorSales[
													randomInt(0, sketchyVendorSales.length - 1)
												]!;
											speakNpcLine(salesLine);
											addLog(salesLine);
										},
									});
								},
							};
						}),
						{
							label: "Back",
							info: ["Close this shop menu."],
							onSelect: closeMenu,
						},
					],
				);
				return;
			}

			const boat = Object.entries(boatTiles).find(
				([, pos]) => pos.x === tx && pos.y === ty,
			);
			if (boat) {
				const line = boatDialogArray[randomInt(0, boatDialogArray.length - 1)]!;
				speakNpcLine(line);
				addLog(line);
				return;
			}

			const on = Object.entries(townNpcTiles).find(
				([, pos]) => pos.x === tx && pos.y === ty,
			);
			if (!on) {
				addLog("Nothing to interact with.");
				return;
			}

			const key = on[0];
			if (townNpcNames[key]) {
				const assignment =
					npcDailyAssignments[key] ??
					generateDailyAssignmentsForNpcs([key])[key];
				const firstTalkToday = !npcTalkedToday[key];
				const tipText = townTips[randomInt(0, townTips.length - 1)]!;
				const isTip = !firstTalkToday && Math.random() < 0.5;
				const line = firstTalkToday
					? generateNpcGreetingLine(assignment)
					: isTip
						? `TIP: ${tipText}`
						: generateNpcDialogLine(assignment);
				setNpcTalkedToday((prev) => ({ ...prev, [key]: true }));
				speakNpcLine(isTip ? `Heres a tip: ${tipText}` : line);
				openMenu(
					townNpcNames[key]!,
					[line],
					[{ label: "Bye", onSelect: closeMenu }],
				);
				return;
			}
		}

		addLog("Nothing to interact with.");
	};

	const moveModal = (dir: Dir) => {
		if (!modal) return;
		if (dir === "up") {
			setModalIndex(
				(idx) => (idx - 1 + modal.options.length) % modal.options.length,
			);
		} else if (dir === "down") {
			setModalIndex((idx) => (idx + 1) % modal.options.length);
		}
	};

	const moveQuantity = (delta: number) => {
		setQuantityPrompt((prev) => {
			if (!prev) return prev;
			const nextValue = Math.max(
				prev.min,
				Math.min(prev.max, prev.value + delta),
			);
			return { ...prev, value: nextValue };
		});
	};

	const selectModal = () => {
		if (!modal) return;
		playNotification();
		if (quantityPrompt) {
			const q = quantityPromptRef.current?.value ?? 0;
			if (q > 0) {
				quantityPromptRef.current?.onConfirm(q);
				quantityParentMenuRef.current = null;
				closeMenu();
				return;
			}
			cancelQuantityPrompt();
			return;
		}
		modal.options[modalIndex]?.onSelect();
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const key = e.key.toLowerCase();

		if (key === "p") {
			e.preventDefault();
			applyMoneyDelta(10000);
			updateInventory("ruby", 10);
			updateInventory("diamond", 10);
			updateInventory("emerald", 10);
			addLog("Debug boost: +$10,000, +10 Ruby, +10 Diamond, +10 Emerald.");
			return;
		}

		if (isDrivingTractor && key === " ") {
			e.preventDefault();
			const nextOn = !tractorImplementOn;
			if (nextOn && tractorImplement === "sow") {
				if (!tractorSeedItem || inventory[tractorSeedItem] <= 0) {
					setTractorImplementOn(false);
					playBad();
					addLog("Out of seeds");
					return;
				}
			}
			setTractorImplementOn(nextOn);
			if (nextOn) {
				applyTractorImplementAt(player.x, player.y, true);
			}
			return;
		}

		if (isBathing) {
			e.preventDefault();
			stopBathing("You step out of the bath.");
			return;
		}

		if (
			dayTransition &&
			dayTransitionStage === "final" &&
			dayTransitionClosePhase === "idle" &&
			key === " "
		) {
			e.preventDefault();
			continueAfterSleep();
			return;
		}

		if (isOrdering || isDoctorCompounding) {
			e.preventDefault();
			return;
		}

		if (fishing) {
			e.preventDefault();
			if (fishing.phase === "waiting") {
				playBad();
				addLog("The fish got away.");
				endFishing();
				return;
			}
			if (fishing.phase !== "bite") return;
			if (key.length !== 1) return;
			if (key === fishing.requiredKey) {
				clearFishingTimers();
				setFishing((prev) => (prev ? { ...prev, phase: "success" } : prev));
				playYaya();
				updateInventory("fish", 1);
				addLog("Nice catch! +1 Fish");
				fishingResolveTimeoutRef.current = window.setTimeout(() => {
					endFishing();
				}, 2000);
				return;
			}
			playBad();
			addLog("You missed the bite.");
			endFishing();
			return;
		}

		if (!dayTransition && !modal) {
			const activeAreaTrack = getAreaMusicForMap(player.map);
			if (activeAreaTrack && activeAreaTrack.paused) {
				switchAreaMusic(activeAreaTrack, true);
			}
		}

		if (key === "w") {
			e.preventDefault();
			if (modal && quantityPrompt) moveQuantity(1);
			else if (modal) moveModal("up");
			else movePlayer("up");
			return;
		}
		if (key === "s") {
			e.preventDefault();
			if (modal && quantityPrompt) moveQuantity(-1);
			else if (modal) moveModal("down");
			else movePlayer("down");
			return;
		}
		if (key === "a") {
			e.preventDefault();
			if (modal && quantityPrompt) moveQuantity(-1);
			else if (!modal) movePlayer("left");
			return;
		}

		if (key === "escape" && modal && quantityPrompt) {
			e.preventDefault();
			cancelQuantityPrompt();
			return;
		}
		if (
			key === "escape" &&
			modal &&
			!quantityPrompt &&
			vendorMenuTitles.has(modal.title)
		) {
			e.preventDefault();
			closeMenu();
			return;
		}
		if (key === "d") {
			e.preventDefault();
			if (modal && quantityPrompt) moveQuantity(1);
			else if (!modal) movePlayer("right");
			return;
		}

		if (key === "arrowup") {
			e.preventDefault();
			if (modal && quantityPrompt) moveQuantity(1);
			else if (modal) moveModal("up");
			else if (!modal) interact("up");
			return;
		}
		if (key === "arrowdown") {
			e.preventDefault();
			if (modal && quantityPrompt) moveQuantity(-1);
			else if (modal) moveModal("down");
			else if (!modal) interact("down");
			return;
		}
		if (key === "arrowleft") {
			e.preventDefault();
			if (modal && quantityPrompt) moveQuantity(-1);
			else if (!modal) interact("left");
			return;
		}
		if (key === "arrowright") {
			e.preventDefault();
			if (modal && quantityPrompt) moveQuantity(1);
			else if (!modal) interact("right");
			return;
		}

		if (key === " " || key === "enter") {
			e.preventDefault();
			if (modal) selectModal();
		}
	};

	const renderedMap = useMemo(() => {
		const base = activeMapLayouts[player.map].map((r) => r.split(""));

		if (player.map === "farm") {
			if (day === 1 && !starterChestOpened) {
				base[STARTER_CHEST_POS.y]![STARTER_CHEST_POS.x] = "X";
			}
			Object.entries(plots).forEach(([key, p]) => {
				const [xs, ys] = key.split(",");
				const x = Number(xs);
				const y = Number(ys);
				if (!Number.isFinite(x) || !Number.isFinite(y)) return;
				if (!p.crop) {
					base[y][x] = ";";
				} else {
					const def = cropDefs[p.crop];
					const age = p.growthDays;
					if (age >= def.growDays)
						base[y][x] = p.crop === "coral_fruit" ? "K" : "Y";
					else if (age >= Math.ceil(def.growDays / 2)) base[y][x] = "i";
					else base[y][x] = "'";
				}
			});
			Object.entries(farmForestBlockers).forEach(([key, present]) => {
				if (!present) return;
				const [xs, ys] = key.split(",");
				const x = Number(xs);
				const y = Number(ys);
				if (!Number.isFinite(x) || !Number.isFinite(y)) return;
				base[y]![x] = "L";
			});
			Object.entries(farmCaveBlockers).forEach(([key, hits]) => {
				if ((hits ?? 0) <= 0) return;
				const [xs, ys] = key.split(",");
				const x = Number(xs);
				const y = Number(ys);
				if (!Number.isFinite(x) || !Number.isFinite(y)) return;
				base[y]![x] = "O";
			});
			Object.entries(petGraveObstacles).forEach(([key, hits]) => {
				if (!hits || hits <= 0) return;
				const [xs, ys] = key.split(",");
				const x = Number(xs);
				const y = Number(ys);
				if (!Number.isFinite(x) || !Number.isFinite(y)) return;
				base[y]![x] = "}";
			});
			Object.entries(farmWeedObstacles).forEach(([key, present]) => {
				if (!present) return;
				const [xs, ys] = key.split(",");
				const x = Number(xs);
				const y = Number(ys);
				if (!Number.isFinite(x) || !Number.isFinite(y)) return;
				base[y]![x] = "J";
			});
		}

			if (player.map === "town") {
				if (beachBottlePos) {
					base[beachBottlePos.y]![beachBottlePos.x] = "M";
				}
				if (doctorVendorActive) {
					base[DOCTOR_POS.y]![DOCTOR_POS.x] = "Z";
				}
				if (petVendorActive && !ownedPet) {
					base[PET_VENDOR_POS.y]![PET_VENDOR_POS.x] = "8";
				}
			if (sketchyMerchantActive) {
				base[SKETCHY_MERCHANT_POS.y]![SKETCHY_MERCHANT_POS.x] = "0";
				if (
					sketchyMerchantStock.length > 0 &&
					base[SKETCHY_CRATE_POS.y]?.[SKETCHY_CRATE_POS.x]
				) {
					base[SKETCHY_CRATE_POS.y]![SKETCHY_CRATE_POS.x] = "6";
				}
			}
			if (traderActive) {
				if (base[TRADER_POS.y]?.[TRADER_POS.x]) {
					base[TRADER_POS.y]![TRADER_POS.x] = "4";
				}
				if (base[TRADER_BOX_POS.y]?.[TRADER_BOX_POS.x]) {
					base[TRADER_BOX_POS.y]![TRADER_BOX_POS.x] = "5";
				}
				if (base[TRADER_HELI_POS.y]?.[TRADER_HELI_POS.x]) {
					base[TRADER_HELI_POS.y]![TRADER_HELI_POS.x] = "7";
				}
			}
			Object.entries(beachShellDrops).forEach(([key, present]) => {
				if (!present) return;
				const [xs, ys] = key.split(",");
				const x = Number(xs);
				const y = Number(ys);
				if (!Number.isFinite(x) || !Number.isFinite(y)) return;
				base[y]![x] = "S";
			});
			const labels: Record<string, string> = {
				neighbor_1: "n",
				neighbor_2: "m",
				neighbor_3: "o",
				neighbor_4: "p",
			};
			Object.entries(townNpcTiles).forEach(([k, pos]) => {
				const label = labels[k];
				if (label) base[pos.y][pos.x] = label;
			});
			const boatLabels: Record<keyof typeof boatNpcEmojis, string> = {
				boat_1: "q",
				boat_2: "r",
				boat_3: "u",
				boat_4: "v",
				boat_5: "z",
			};
			(
				Object.entries(boatTiles) as Array<
					[keyof typeof boatNpcEmojis, { x: number; y: number }]
				>
			).forEach(([k, pos]) => {
				base[pos.y][pos.x] = boatLabels[k];
			});
		}

		if (player.map === animalsMap) {
			const markerByAnimal: Record<AnimalType, string> = {
				cow: "1",
				sheep: "2",
				chicken: "3",
				hippo: "A",
				unicorn: "D",
				mammoth: "F",
				slug: "I",
				gorilla: "N",
			};
			animals.forEach((a) => {
				const pos = animalTiles[a.id];
				if (!pos) return;
				base[pos.y][pos.x] = markerByAnimal[a.type];
			});
			Object.entries(farmEggDrops).forEach(([key, present]) => {
				if (!present) return;
				const [xs, ys] = key.split(",");
				const x = Number(xs);
				const y = Number(ys);
				if (!Number.isFinite(x) || !Number.isFinite(y)) return;
				base[y]![x] = "E";
			});
		}
		if (player.map === "farm") {
			if (ownedPet && petTile) {
				const petMarker: Record<PetEmoji, string> = {
					"🐈": "@", // pet cat marker
					"🐈‍⬛": "%", // pet black cat marker
					"🐕": "&", // pet dog marker
					"🐩": "?", // pet poodle marker
				};
				base[petTile.y]![petTile.x] = petMarker[ownedPet];
			}
			if (petHeartTile) {
				base[petHeartTile.y]![petHeartTile.x] = "9";
			}
			if (hasTractor && tractorParked) {
				base[TRACTOR_PARK_POS.y]![TRACTOR_PARK_POS.x] = "{";
			}
		}

		if (player.map === "forest") {
			forestObstacles.forEach((o) => {
				base[o.y]![o.x] =
					o.type === "rock" ? "O" : o.type === "weed" ? "J" : "L";
			});
			if (!forestChest.opened) {
				base[forestChest.y]![forestChest.x] = "X";
			}
			forestBonusChests.forEach((chest) => {
				if (!chest.opened) {
					base[chest.y]![chest.x] = "X";
				}
			});
			forestEnemies.forEach((enemy) => {
				base[enemy.y]![enemy.x] =
					enemy.type === "bear" ? "e" : enemy.type === "snake" ? "y" : "!";
			});
		}
		if (player.map === "cave") {
			caveObstacles.forEach((o) => {
				base[o.y]![o.x] = "O";
			});
			if (caveLadderPos) {
				base[caveLadderPos.y]![caveLadderPos.x] = "/";
			}
			caveEnemies.forEach((enemy) => {
				base[enemy.y]![enemy.x] =
					enemy.type === "bear" ? "e" : enemy.type === "poop" ? "!" : "`";
			});
		}

		if (isShopMap(player.map)) {
			const decor = shopDecorByMap[player.map];
			if (decor) {
				Object.entries(decor).forEach(([pos, emoji]) => {
					const [xStr, yStr] = pos.split(",");
					const x = Number(xStr);
					const y = Number(yStr);
					if (!Number.isFinite(x) || !Number.isFinite(y)) return;
					const tile = activeMapLayouts[player.map]?.[y]?.[x];
					if (!tile || tile === "+" || tile === "j") return;
					base[y][x] = emoji;
				});
			}
		}

		if (player.map === "cafe_shop" && isOrdering) {
			for (let y = 0; y < base.length; y += 1) {
				for (let x = 0; x < base[y]!.length; x += 1) {
					if (base[y]![x] === "j") base[y]![x] = ".";
				}
			}
			base[2]![cafeShopkeeperX] = "j";
		}

		if (player.map === "house" && isBathing) {
			base[1]![1] = "V";
		} else {
			base[player.y][player.x] = "P";
		}

		if (fishing && fishing.map === player.map) {
			if (fishing.phase === "waiting") base[fishing.y][fishing.x] = "b";
			else if (fishing.phase === "bite") base[fishing.y][fishing.x] = "F";
		}

		return base;
	}, [
		animals,
		animalTiles,
		day,
		fishing,
		day,
		starterChestOpened,
		forestChest,
		forestBonusChests,
		forestEnemies,
		forestObstacles,
		caveEnemies,
		caveObstacles,
		caveLadderPos,
		player,
		plots,
		farmForestBlockers,
		farmCaveBlockers,
		petGraveObstacles,
		farmWeedObstacles,
		farmEggDrops,
		boatTiles,
		beachBottlePos,
		beachShellDrops,
		sketchyMerchantActive,
		sketchyMerchantStock,
		traderActive,
		doctorVendorActive,
		petVendorActive,
		ownedPet,
		petTile,
		petHeartTile,
		hasTractor,
		tractorParked,
		townNpcTiles,
		waterRefillTile,
		shopDecorByMap,
		cafeShopkeeperX,
		isOrdering,
		isBathing,
		isDrivingTractor,
		activeMapLayouts,
		animalsMap,
	]);

	const inventoryRows = (Object.keys(inventory) as ItemId[])
		.filter((id) => inventory[id] > 0)
		.map((id) => ({
			id,
			icon: itemIcons[id],
			name: itemNames[id],
			amount: inventory[id],
		}));
	const marketRows = priceItems.map((id) => ({
		id,
		name: itemNames[id],
		price: prices[id],
		trend: priceTrends[id],
	}));
	const toolRows: Array<{ id: ToolId; name: string; level: number }> = [
		{ id: "hoe", name: "Hoe", level: tools.hoe },
		{ id: "wateringCan", name: "Watering Can", level: tools.wateringCan },
		{ id: "milkingGloves", name: "Milking Gloves", level: tools.milkingGloves },
		{ id: "shears", name: "Shears", level: tools.shears },
		...(tools.fishingRod > 0
			? ([{ id: "fishingRod", name: "Fishing Rod", level: tools.fishingRod }] as const)
			: []),
		...(tools.smashAxe > 0
			? ([{ id: "smashAxe", name: "Smash Axe", level: tools.smashAxe }] as const)
			: []),
	];

	return (
		<div
			className='game-shell'
			tabIndex={0}
			onKeyDown={onKeyDown}
			ref={shellRef}
		>
			<div className='hud'>
				<div>Day: {day}</div>
				<div>Location: {player.map}</div>
				<div>Current Weather: {weatherEmojiById[currentWeather]}</div>
				<div>Money: ${money}</div>
				<div className='stamina-wrap'>
					<span title={`${stamina}/${staminaMax}`}>Stamina</span>
					<div className='stamina-bar'>
						<div
							className={`stamina-fill ${stamina > 50 ? "high" : stamina > 30 ? "mid" : "low"}`}
							style={{
								width: `${(Math.max(0, Math.min(staminaMax, stamina)) / staminaMax) * 100}%`,
							}}
						/>
					</div>
				</div>
			</div>

			<div className='inventory inventory-strip'>
				<div className='panel-title'>Inventory</div>
				<ul className='inventory-row'>
					<li
						key='water-row'
						className='inventory-item'
					>
						<span className='inventory-item-icon'>🫗</span> {/* water can */}
						<span>Water:</span>
						<span>{waterLevel}</span>
					</li>
					{inventoryRows.map((r) => (
						<li
							key={r.id}
							className='inventory-item'
						>
							<span className='inventory-item-icon'>{r.icon}</span>
							<span>{r.name}:</span>
							<span>{r.amount}</span>
						</li>
					))}
				</ul>
			</div>

			<div className='legend log-strip'>
				<div className='log-list'>
					<div className='small'>{log[0] ?? ""}</div>
				</div>
			</div>

			<div className='map-wrap'>
				<div
					className={`map ${player.map === "forest" ? "map-forest" : ""} ${player.map === "cave" ? "map-cave" : ""}`}
				>
					<div className='grass-wind-overlay'>
						{activeMapLayouts[player.map].map((row, y) => (
							<div
								key={`wind-row-${y}`}
								className='map-row'
							>
								{row.split("").map((tile, x) => {
									const isOn = tile === "," && isWindSlashOn(x, y);
									return (
										<span
											key={`wind-${x}-${y}`}
											className='tile grass-wind-tile'
										>
											{isOn ? "/" : ""}
										</span>
									);
								})}
							</div>
						))}
					</div>
					{renderedMap.map((row, y) => (
						<div
							key={`row-${y}`}
							className='map-row'
						>
							{row.map((cell, x) => {
								const plot =
									player.map === "farm" ? plots[keyForPos(x, y)] : null;
								const rainyFarmSoil =
									player.map === "farm" && currentWeather === "rainy";
								const groundTile = plot
									? ";"
									: (activeMapLayouts[player.map]?.[y]?.[x] ?? ".");
								const groundClassBase =
									plot && player.map === "farm"
										? plot.watered || rainyFarmSoil
											? "tile-soil-wet"
											: "tile-soil-dry"
										: groundClassForTile(groundTile, player.map);
								const isShopDecorTile =
									isShopMap(player.map) &&
									!!shopDecorByMap[player.map]?.[keyForPos(x, y)];
								const doorGroundClass =
									cell === "+"
										? isFarmHouseDoorTile(player.map, x, y)
											? "tile-floor"
											: (getDoorGroundClass(player.map, x, y) ??
												(player.map === "forest" ? "tile-grass" : undefined) ??
												(player.map === "house" ? "tile-floor" : undefined))
										: undefined;
								const groundClass =
									doorGroundClass ??
									(!groundClassBase &&
									player.map === "house" &&
									(cell === "d" || cell === "w")
										? "tile-floor"
										: groundClassBase);
								const visual = isShopDecorTile
									? {
											glyph: cell,
											className: groundClassBase ?? "tile-floor",
										}
									: cell === "P"
										? {
												glyph:
													isDrivingTractor
														? "🚜" // driving tractor
														: fishing && fishing.phase !== "success"
														? "🎣" // fishing pole mode
														: showTiredFace
															? "🥱" // tired face
															: playerEmoji,
											}
										: waterRefillTile &&
											  waterRefillTile.map === player.map &&
											  waterRefillTile.x === x &&
											  waterRefillTile.y === y
											? { glyph: "🫗", className: "tile-water" } // refill splash icon
											: cell === "b" &&
												  fishing?.phase === "waiting" &&
												  fishing.map === player.map &&
												  fishing.x === x &&
												  fishing.y === y
												? {
														glyph: ".",
														className: "tile-water tile-fishing-bobber",
													}
												: cell === "F" && fishing?.phase === "bite"
													? {
															glyph: "🐟", // fish bite icon
															className: "tile-water tile-fishing-catch",
															overlayGlyph: fishing.requiredKey.toUpperCase(),
														}
													: cell === "~" && isRippleWaterTile(player.map, x, y)
														? {
																glyph: waterRipplePhase ? "-" : "—",
																className: "tile-water tile-ripple",
															}
															: cell === "," &&
																  isAnimatedGrassTile(player.map, x, y)
																? {
																		glyph: "|",
																		className: `tile-grass tile-foliage tile-foliage-${grassFoliageVariant(player.map, x, y)}`,
																	}
															: cell === "/" &&
																  player.map === "cave" &&
																  caveLadderPos &&
																  caveLadderPos.x === x &&
																  caveLadderPos.y === y
																? { glyph: "🪜", className: "tile-cave-next-ladder" } // next-level ladder
																: player.map === "cave" && cell === ")"
																	? caveRubble[keyForPos(x, y)]
																		? {
																				glyph: caveRubble[keyForPos(x, y)]!,
																				className: "tile-cave-path tile-cave-rubble",
																			}
																		: toVisual(cell)
																: toVisual(cell);
								const withGround =
									groundClass &&
									!visual.className &&
									spriteTilesNeedingGround.has(cell)
										? { ...visual, className: groundClass }
										: plot && cell === ";"
											? {
													...visual,
													className: groundClass ?? visual.className,
												}
											: visual;
								const isPetGlyphCell =
									cell === "@" || cell === "%" || cell === "&" || cell === "?";
								const isDrivenTractorCell = cell === "P" && isDrivingTractor;
								const shouldFlipGlyph =
									(isPetGlyphCell && petFacing < 0) ||
									(isDrivenTractorCell && tractorFacing < 0);
								return (
									<span
										key={`${x}-${y}`}
										className={[
											"tile",
											withGround.className ?? "",
											cell === "P" &&
											(player.map === "forest" || player.map === "cave") &&
											showForestHit
												? "tile-player-hit"
												: "",
										]
											.filter(Boolean)
											.join(" ")}
										title={`${x},${y}`}
										data-overlay={withGround.overlayGlyph ?? ""}
									>
										<span
										className={[
											"emoji-glyph",
											player.map === "forest" ? "forest-emoji-glyph" : "",
											player.map === "cave" ? "cave-emoji-glyph" : "",
											player.map === "forest" && (cell === "T" || cell === "G")
												? "forest-tree-emoji-glyph"
												: "",
										]
												.filter(Boolean)
												.join(" ")}
										style={{
											transform: shouldFlipGlyph ? "scaleX(-1)" : undefined,
											transformOrigin: shouldFlipGlyph ? "center center" : undefined,
										}}
										>
											{withGround.glyph}
										</span>
									</span>
								);
							})}
						</div>
					))}
					{(player.map === "forest" || player.map === "cave") && (
						<div className='fog-overlay'>
							{activeMapLayouts[player.map].map((row, y) => (
								<div
									key={`fog-row-${y}`}
									className='map-row'
								>
									{row.split("").map((_, x) => (
										<span
											key={`fog-${x}-${y}`}
											className='tile fog-tile'
											style={{
												opacity:
													player.map === "cave"
														? getCaveFogOpacity(x, y)
														: getForestFogOpacity(x, y),
											}}
										/>
									))}
								</div>
							))}
						</div>
					)}
				</div>
				{(player.map === "farm" || player.map === "town") && (
					<div className='cloud-overlay'>
						{clouds.map((cloud) => (
							<motion.div
								key={cloud.id}
								className='cloud-item'
								initial={{ left: `${cloud.startX}%` }}
								animate={{ left: "-14%" }}
								transition={{
									duration: cloud.durationSec,
									ease: "linear",
								}}
								onAnimationComplete={() => {
									setClouds((prev) =>
										prev.filter((candidate) => candidate.id !== cloud.id),
									);
								}}
								style={{
									top: `${cloud.y}%`,
									fontSize: `${cloud.size}em`,
								}}
							>
								<span className='cloud-glyph'>{cloud.glyph}</span>
								<span className='cloud-shadow' />
							</motion.div>
						))}
					</div>
				)}
			</div>

			<div className='info-grid'>
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<div className='controls-market-row'>
						<div className='controls'>
							<div className='panel-title'>Controls</div>
							<div>`WASD` move</div>
							<div>`Arrow Keys` interact one tile</div>
							<div>`W/S` navigate menus</div>
							<div>`Space` confirm menu option</div>
						</div>
						<div className='legend market-panel'>
							<div className='panel-title'>Current Market</div>
							<ul className='market-list'>
								{marketRows.map((row) => (
									<li key={`market-${row.id}`}>
										<span>{row.name}:</span>{" "}
										<span>
											${row.price}{" "}
											{row.trend > 0 ? "📈" : row.trend < 0 ? "📉" : ""} {/* market trend */}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className='tips-tools-row'>
						<div className='legend'>
							<div className='panel-title'>Farm Tips</div>
							<ul>
								<li>Plant seeds on brown dirt plots.</li>
								<li>Water crops daily so they grow overnight.</li>
								<li>Feed animals daily in the farm barn.</li>
								<li>Sleep in house bed to start next day.</li>
								<li>Visit town vendors to buy/sell.</li>
							</ul>
						</div>
						<div className='legend'>
							<div className='panel-title'>Tools</div>
							<ul>
								{toolRows.map((tool) => (
									<li key={tool.id}>
										{getToolTierName(tool.level)} {tool.name}
									</li>
								))}
								{pendingTractorDelivery && (
									<li key='tractor-pending'>Tractor (arrives tomorrow)</li>
								)}
								{hasTractor && <li key='tractor-owned'>Tractor</li>}
								{hasHeadlamp && <li key='headlamp-owned'>Headlamp</li>}
							</ul>
						</div>
					</div>
				</div>
				<div className='newspaper'>
					<div className='panel-title'>Daily Newspaper</div>
					<div className='newspaper-body'>{newspaper}</div>
				</div>
			</div>

			{(isOrdering || isDoctorCompounding) && (
				<div className='order-wait-overlay'>
					<div className='order-wait-banner'>
						<div className='order-wait-content'>
							<motion.div
								className='order-wait-text'
								initial={{ scale: 1 }}
								animate={{ scale: [1, 1.06, 1] }}
								transition={{
									duration: 1.1,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							>
								Please wait...
							</motion.div>
							<div className='order-wait-subtext'>
								{isDoctorCompounding ? doctorObservation : cafeObservation}
							</div>
						</div>
					</div>
				</div>
			)}

			{modal && (
				<div className='modal-backdrop'>
					<div className='modal'>
						{(() => {
							const selectedOption = modal.options[modalIndex];
							const dealMeta = selectedOption?.dealMeta;
							const dealBadge = dealMeta
								? getDealBadge(
										dealMeta.mode,
										dealMeta.unitPrice ?? prices[dealMeta.itemId],
										dealMeta.baseUnitPrice ?? initialPrices[dealMeta.itemId],
									)
								: undefined;
							return (
								<>
						<div className='panel-title'>{modal.title}</div>
						{modal.body.map((b, i) => (
							<div
								key={`${b}-${i}`}
								className='small'
							>
								{b.startsWith("TIP: ") ? (
									<>
										<strong>TIP:</strong> {b.slice(5)}
									</>
								) : (
									b
								)}
							</div>
						))}
						<div className={`modal-layout${quantityPrompt ? " quantity-mode" : ""}`}>
							<div className='modal-left-pane'>
								{quantityPrompt ? (
									<div className='quantity-pane'>
										<div className='quantity-focus'>
											<div>Amount:</div>
											<div>{`◂ ${quantityPrompt.value} ▸`}</div>
										</div>
										<div className='small quantity-footer'>
											Space to confirm. Esc to cancel
										</div>
									</div>
								) : (
									modal.options.map((opt, idx) => (
										<div
											key={opt.label + idx}
											className={`option ${idx === modalIndex ? "active" : ""}`}
										>
											{idx === modalIndex ? ">" : " "}{" "}
											<span
												className={
													modal.title === "Wardrobe"
														? "wardrobe-option-label"
														: undefined
												}
											>
												{opt.label}
											</span>
										</div>
									))
								)}
							</div>
							<div className='modal-info'>
								<div className='panel-title'>More Info</div>
								{(quantityPrompt
									? [
											`Max amount: ${quantityPrompt.max}`,
											`Transaction total: $${
												quantityPrompt.value * quantityPrompt.unitPrice
											}`,
										]
									: (modal.options[modalIndex]?.info ?? [
											"Use W/S to highlight an option.",
										])
								).map((line, i) => (
									<div
										key={`${line}-${i}`}
										className='small'
									>
										{line}
									</div>
								))}
								{!quantityPrompt && dealBadge && (
									<motion.div
										className='deal-badge'
										style={{
											color: dealBadge.color,
											transformOrigin: "center center",
										}}
										animate={{ scale: [1, dealBadge.scaleUp, 1] }}
										transition={{
											duration: 1.1,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									>
										{dealBadge.label}
									</motion.div>
								)}
							</div>
						</div>
						{!quantityPrompt && (
							<div
								className='small'
								style={{ marginTop: 6 }}
							>
								Use W/S to move, Space to select.
							</div>
						)}
								</>
							);
						})()}
					</div>
				</div>
			)}

			{dayTransition && (
				<motion.div
					className='day-transition-backdrop'
					animate={{ opacity: dayTransitionClosePhase === "backdrop" ? 0 : 1 }}
					transition={{
						duration: dayTransitionClosePhase === "backdrop" ? 1 : 0.2,
						ease: "linear",
					}}
				>
					<div className='day-stars-layer'>
						{dayTransitionStarsState.map((star) => (
							<motion.div
								key={`day-star-${star.id}`}
								className='day-star'
								style={{
									left: `${star.left}%`,
									top: `${star.top}%`,
									fontSize: `${star.size}px`,
								}}
								initial={{ opacity: 0, scale: 1 }}
								animate={{ opacity: [0, 0.35, 0], scale: [1, 1.03, 1] }}
								transition={{
									duration: star.duration,
									delay: 0,
									repeat: Infinity,
									ease: "linear",
								}}
							>
								{star.glyph}
							</motion.div>
						))}
					</div>
					<motion.div
						className='day-transition-card'
						layout
						initial={{ opacity: 0, y: -200 }}
						animate={
							dayTransitionClosePhase === "idle"
								? { opacity: 1, y: 0 }
								: { opacity: 0, y: -200 }
						}
						transition={{
							duration: dayTransitionClosePhase === "idle" ? 4 : 0.55,
							delay: dayTransitionClosePhase === "idle" ? 2 : 0,
							ease: "linear",
							layout: { duration: 0.55, ease: "easeInOut" },
						}}
					>
						<div className='day-moon'>
							{moonPhases[
								(dayTransitionStage === "intro"
									? dayTransition.day - 1
									: dayTransition.day) % moonPhases.length
							]}
						</div>
						<div className='panel-title day-transition-day'>
							Day {dayTransitionStage === "intro" ? dayTransition.day - 1 : dayTransition.day}
						</div>
						{(dayTransitionStage === "earned" || dayTransitionStage === "final") && (
							<motion.div
								className='small day-transition-stat day-earned-row'
								layout
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.8, ease: "easeOut" }}
							>
								Earned yesterday (Day {dayTransition.day - 1}): $
								{dayTransition.previousDayEarned}
							</motion.div>
						)}
						{dayTransitionStage === "final" && (
							<>
								<motion.div
									className='small day-transition-stat'
									layout
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.8, ease: "easeOut" }}
								>
									Total earnings: ${dayTransition.totalEarned}
								</motion.div>
								<motion.div
									className='day-ok-wrap'
									layout
									initial={{ opacity: 0 }}
									animate={{ opacity: [0, 0, 1] }}
									transition={{ duration: 0.8, ease: "easeOut" }}
								>
									<button
										className='option active day-ok-button'
										onClick={continueAfterSleep}
										type='button'
										disabled={dayTransitionClosePhase !== "idle"}
									>
										{dayTransitionPrompt}
									</button>
								</motion.div>
							</>
						)}
					</motion.div>
				</motion.div>
			)}
		</div>
	);
}

export default App;

