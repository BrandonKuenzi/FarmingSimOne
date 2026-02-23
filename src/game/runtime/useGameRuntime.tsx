import { useEffect, useMemo, useRef, useState } from "react";
import bgMusicSrc from "../../assets/bgMusic.mp3";
import bgFarmSrc from "../../assets/bgFarm.ogg";
import townBGSrc from "../../assets/GameBananaFeildloop.mp3";
import beachAmbienceSrc from "../../assets/beach.wav";
import chaChingSrc from "../../assets/chaching.ogg";
import endOfDaySrc from "../../assets/summerDreamBoat.mp3";
import hoeSoundSrc from "../../assets/hoe.mp3";
import munchSoundSrc from "../../assets/munch.m4a";
import badSoundSrc from "../../assets/bad.m4a";
import waterSoundSrc from "../../assets/water.m4a";
import yayaSoundSrc from "../../assets/yaya.ogg";
import tooTiredSoundSrc from "../../assets/imTooTired.m4a";
import cafeOrderMusicSrc from "../../assets/SpaceStore.mp3";
import notificationSoundSrc from "../../assets/shuffle.m4a";
import forestMusicSrc from "../../assets/GameDeepForest.mp3";
import caveMusicSrc from "../../assets/CaveTheme.mp3";
import gotRewardSoundSrc from "../../assets/gotReward.mp3";
import snakeSoundSrc from "../../assets/snake.m4a";
import bearSoundSrc from "../../assets/bear.m4a";
import pooSoundSrc from "../../assets/poo.m4a";
import bathSoundSrc from "../../assets/bath.m4a";
import pluckSoundSrc from "../../assets/pluck.m4a";
import ploopSoundSrc from "../../assets/ploop.m4a";
import seagullsSoundSrc from "../../assets/seagulls.mp3";
import meowSoundSrc from "../../assets/meow.m4a";
import woofSoundSrc from "../../assets/woof.m4a";
import tractorSoundSrc from "../../assets/tractor.wav";
import {
	generateDailyAssignmentsForNpcs,
	generateNpcDialogLine,
	generateNpcGreetingLine,
	generateOverfedAnimalLine,
	type NpcDailyAssignment,
} from "../../npcDialogue";
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
} from "../content/dialog";
import {
	createDayTransitionStars,
	moonPhases,
	nextDayPrompts,
	type DayTransitionStar,
} from "../content/dayTransition";
import {
	allPlantableCropIds,
	animalDefs,
	cropDefs,
	highValueChestAnimalTypes,
	isCowLikeAnimal,
	itemIcons,
	itemNames,
	makeSnakeDirections,
	purchasableAnimalTypes,
	rareCowVariantTypes,
	standardCropIds,
} from "../content/catalog";
import { makeGaryBottleMessage } from "../content/garyBottle";
import { rollBeachBottleSpawn, rollBeachShellDrops } from "../world/beach";
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
} from "../world/layout";
import { doors, isShopMap, vendorByShopMap, vendorShopMapByKey } from "../world/navigation";
import {
	buildCaveRubble,
	generateCaveState,
	generateForestState,
	isCaveBlockedTile,
	isCaveWalkableTile,
	isForestBlockedTile,
	isForestWalkableTile,
	oppositeForestSide,
} from "../world/generation";
import {
	boatNpcEmojis,
	DOCTOR_POS,
	initialBoatTiles,
	npcMoveDirections,
	PET_VENDOR_POS,
	petOptions,
	SKETCHY_CRATE_POS,
	SKETCHY_MERCHANT_POS,
	townNpcAnchors,
	townNpcNames,
	TRADER_BOX_POS,
	TRADER_HELI_POS,
	TRADER_POS,
} from "../world/npcs";
import { isPassableChar } from "../world/passability";
import { generateDailyNewspaper, generatePriceChange } from "../systems/news";
import { nextAnimalTile, nextBoatTile, nextTownNpcTile } from "../systems/movement";
import { interactVendorMenu } from "../systems/vendors";
import { interactBuilderVendorMenu } from "../systems/builder";
import {
	clearFishingTimers as clearFishingTimersSystem,
	startFishingSequence,
} from "../systems/fishing";
import {
	fadeOutAndStopSound,
	playOneShot,
	startLoopSound,
	stopAndResetSound,
} from "../systems/sound";
import { speakLine } from "../systems/tts";
import {
	nextCafeObservation as nextCafeObservationRule,
	nextDoctorObservation as nextDoctorObservationRule,
	nextDoctorSpeechLine as nextDoctorSpeechLineRule,
	orderLine as orderLineRule,
} from "../systems/dialogue";
import {
	grantBonusChestRewardSet as grantBonusChestRewardSetRule,
	openHighValueForestChestReward as openHighValueForestChestRewardRule,
	rollBeachBottleReward,
} from "../systems/rewards";
import { getFogTargetOpacity } from "../systems/vision";
import {
	cancelQuantityPrompt as cancelQuantityPromptMenu,
	closeMenu as closeMenuController,
	openMenu as openMenuController,
	openQuantityPrompt as openQuantityPromptMenu,
} from "../ui/menuController";
import {
	advancePlotsForNewDay,
	resetAnimalsForNewDay,
	rollDailyMarketState,
	rollDailyVendorState,
} from "../systems/day";
import {
	CORAL_FRUIT_SELL_PRICE,
	generateSketchyMerchantStock,
	generateTraderTrades,
	getDealBadge,
	getMarketBasePrice,
	getMarketSellPrice,
} from "../systems/commerce";
import { evolveFarmWeeds, generateInitialFarmWeedField } from "../systems/weeds";
import { randomWeather, weatherEmojiById } from "../systems/weather";
import {
	grassFoliageVariant,
	isAnimatedGrassTile,
	isRippleWaterTile,
} from "../systems/ambient";
import {
	countOpenBarnTilesInBounds,
	getEggDropNearChicken as getEggDropNearChickenCandidate,
	nextOpenBarnTileInBounds,
	placeAnimalsInBounds,
} from "../systems/animals";
import { handleLateInteractionBlocks } from "../systems/interactions";
import {
	handleGameKeyDown,
	moveModalCursor,
	moveQuantitySelection,
	selectModalOption,
} from "../systems/input";
import { runInteract } from "../systems/playerInteract";
import { renderGameRuntimeView } from "../ui/GameRuntimeView";
import {
	STAMINA_MAX,
	TOOL_MAX_LEVEL,
	getFishingRodMaxWaitSeconds,
	getFishingRodUiText,
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
} from "../systems/tools";
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
	Warp,
	WeatherId,
} from "../shared/types";
import { keyForPos } from "../shared/coords";
import { randomInt } from "../shared/random";
import {
	HEADLAMP_PRICE,
	FARM_CAVE_BLOCKER_POSITIONS,
	FARM_FOREST_BLOCKER_POSITIONS,
	STARTER_CHEST_POS,
	TRACTOR_IRON_COST,
	TRACTOR_PARK_POS,
	TRACTOR_PRICE,
	allWardrobeLooks,
	cafeCounterPrepDecor,
	cafeMenuItems,
	chickenEggOffsets,
	clothingShopItems,
	dirDelta,
	getFarmBarnInteriorBounds,
	getHoeTargets,
	initialFarmExpansionBlockers,
	initialPriceTrends,
	initialPrices,
	makeEmptyInventory,
	priceItems,
	purchasableFunnyLooks,
	shopDecorForSaleItems,
	shopDecorSlots,
	shopMaps,
	starterWardrobeLooks,
	townBeachBottleTiles,
	vendorMenuTitles,
} from "../config/gameplay";
import { groundClassForTile, spriteTilesNeedingGround, toVisual } from "../config/visuals";
import { applyMoneyDeltaState, updateInventoryState } from "../state/actions";
export function useGameRuntime() {
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
		() =>
			generateInitialFarmWeedField(
				mapLayouts.farm,
				farmForestBlockers,
				farmCaveBlockers,
				new Set<string>(),
				STARTER_CHEST_POS,
			),
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
		playOneShot(notificationRef.current);
	};

	const playChaChing = () => {
		playOneShot(chaChingRef.current);
	};

	const playHoe = () => {
		playOneShot(hoeSoundRef.current);
	};

	const playMunch = () => {
		playOneShot(munchSoundRef.current);
	};

	const playBad = () => {
		playOneShot(badSoundRef.current);
	};

	const playTooTired = () => {
		playOneShot(tooTiredRef.current);
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
		playOneShot(waterSoundRef.current);
	};

	const playYaya = () => {
		playOneShot(yayaSoundRef.current);
	};

	const playGotReward = () => {
		playOneShot(gotRewardRef.current);
	};

	const playSnakeSound = () => {
		playOneShot(snakeSoundRef.current);
	};

	const playBearSound = () => {
		playOneShot(bearSoundRef.current);
	};

	const playPooSound = () => {
		playOneShot(pooSoundRef.current);
	};

	const playBath = () => {
		playOneShot(bathSoundRef.current);
	};

	const playPluck = () => {
		playOneShot(pluckSoundRef.current);
	};

	const playPloop = () => {
		playOneShot(ploopSoundRef.current);
	};

	const playSeagulls = () => {
		const sound = seagullsSoundRef.current;
		if (!sound) return;
		if (seagullsFadeIntervalRef.current !== null) {
			window.clearInterval(seagullsFadeIntervalRef.current);
			seagullsFadeIntervalRef.current = null;
		}
		sound.volume = 1;
		playOneShot(sound);
	};

	const fadeOutSeagulls = (durationMs = 650) => {
		fadeOutAndStopSound({
			sound: seagullsSoundRef.current,
			durationMs,
			intervalRef: seagullsFadeIntervalRef,
		});
	};

	const playPetSound = (pet: PetEmoji) => {
		const isCat = pet === "🐈" || pet === "🐈‍⬛"; // cat variants meow
		const sound = isCat ? meowSoundRef.current : woofSoundRef.current;
		playOneShot(sound);
	};

	const startTractorLoop = () => {
		startLoopSound(tractorSoundRef.current, 0.7);
	};

	const stopTractorLoop = () => {
		stopAndResetSound(tractorSoundRef.current);
	};

	const speakNpcLine = (line: string) => {
		speakLine(line, ttsReadyRef.current);
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
		clearFishingTimersSystem({
			waitTimeoutRef: fishingWaitTimeoutRef,
			catchTimeoutRef: fishingCatchTimeoutRef,
			resolveTimeoutRef: fishingResolveTimeoutRef,
			waterIntervalRef: fishingWaterIntervalRef,
		});
	};

	const endFishing = () => {
		clearFishingTimers();
		setFishing(null);
		if (!dayTransition && !modal) {
			switchAreaMusic(getAreaMusicForMap(playerRef.current.map), true);
		}
	};

	const startFishing = (map: MapId, x: number, y: number) => {
		clearFishingTimers();
		startFishingSequence({
			map,
			x,
			y,
			fishing,
			hasBlockingModal: !!modal || !!dayTransition,
			playWater,
			fadeOutCurrentAreaMusic,
			setFishing,
			addLog,
			maxWaitSeconds: getFishingRodMaxWaitSeconds(tools),
			randomInt,
			waitTimeoutRef: fishingWaitTimeoutRef,
			catchTimeoutRef: fishingCatchTimeoutRef,
			waterIntervalRef: fishingWaterIntervalRef,
			onFishEscaped: () => {
				playBad();
				addLog("The fish got away.");
				endFishing();
			},
		});
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
	) =>
		getFogTargetOpacity({ x: playerX, y: playerY }, x, y, playerEmoji, hasHeadlamp);

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
		const next = nextTownNpcTile({
			current,
			anchor,
			npcKey,
			nextNpcTiles,
			activeTownRows: activeMapLayouts.town,
			isPassableChar,
			petVendorActive,
			ownedPet,
			petVendorPos: PET_VENDOR_POS,
			doctorVendorActive,
			doctorPos: DOCTOR_POS,
			player: playerRef.current,
			randomInt,
			moveDirections: npcMoveDirections,
		});
		if (next) nextNpcTiles[npcKey] = next;
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
		const next = nextAnimalTile({
			current,
			animalId,
			nextAnimalTiles,
			anchor,
			allowOutsideBarn: animalsMap === "barn" && isBarnExternal(barnTier),
			barnInteriorBounds,
			activeMapRows: activeMapLayouts[animalsMap],
			isPassableChar,
			farmEggDrops,
			player: playerRef.current,
			randomInt,
			moveDirections: npcMoveDirections,
			playerMapWhenBlocking: "farm",
		});
		if (next) nextAnimalTiles[animalId] = next;
	};

	const maybeMoveBoat = (
		boatKey: keyof typeof boatNpcEmojis,
		nextBoatTiles: Record<keyof typeof boatNpcEmojis, { x: number; y: number }>,
	) => {
		if (pauseGame) return;
		if (Math.random() > 0.25) return;

		const current = nextBoatTiles[boatKey];
		if (!current) return;
		const next = nextBoatTile({
			current,
			boatKey,
			nextBoatTiles: nextBoatTiles as Record<string, { x: number; y: number }>,
			activeTownRows: activeMapLayouts.town,
			player: playerRef.current,
			randomInt,
			moveDirections: npcMoveDirections,
		});
		if (next) nextBoatTiles[boatKey] = next;
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
		updateInventoryState(setInventory, item, amount);
	};

	const applyMoneyDelta = (delta: number) => {
		applyMoneyDeltaState(setMoney, setCurrentDayEarned, setTotalEarned, delta);
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

	const interactVendor = (key: VendorKey) => {
		return interactVendorMenu({
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
		});
	};

	const interactBuilderVendor = () => {
		interactBuilderVendorMenu({
			barnTier,
			pendingBarnUpgrade,
			inventory,
			canAfford,
			playBad,
			addLog,
			speakNpcLine,
			closeMenu,
			openMenu,
			applyMoneyDelta,
			updateInventory,
			setPendingBarnUpgrade,
		});
	};

	const orderLine = (template: string, orderedItem: string) =>
		orderLineRule(template, orderedItem);
	const nextCafeObservation = (orderedItem: string) =>
		nextCafeObservationRule(randomInt, orderedItem);
	const nextDoctorSpeechLine = () => nextDoctorSpeechLineRule(randomInt);
	const nextDoctorObservation = () => nextDoctorObservationRule(randomInt);
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
		openMenuController({
			title,
			body,
			options,
			playNotification,
			setPauseGame,
			setModal,
			setModalIndex,
		});
	};

	const closeMenu = () => {
		closeMenuController({
			modal,
			playNotification,
			setPauseGame,
			setQuantityPrompt,
			quantityParentMenuRef,
			setModal,
			setModalIndex,
			fadeOutSeagulls,
		});
	};

	const cancelQuantityPrompt = () => {
		cancelQuantityPromptMenu({
			quantityParentMenuRef,
			playNotification,
			setQuantityPrompt,
			setModal,
			setModalIndex,
			closeMenu,
		});
	};

	const openQuantityPrompt = (cfg: {
		mode: "buy" | "sell";
		itemLabel: string;
		max: number;
		unitPrice: number;
		onConfirm: (quantity: number) => void;
	}) => {
		openQuantityPromptMenu({
			cfg,
			addLog,
			setQuantityPrompt,
			modal,
			modalIndex,
			quantityParentMenuRef,
			openMenu,
			setModalIndex,
		});
	};

	const countOpenBarnTiles = (occupied: Record<number, { x: number; y: number }>) => {
		const rows = activeMapLayouts[animalsMap];
		return countOpenBarnTilesInBounds({
			occupied,
			rows,
			bounds: barnInteriorBounds,
			isPassableChar,
		});
	};

	const nextOpenBarnTile = (occupied: Record<number, { x: number; y: number }>) => {
		const rows = activeMapLayouts[animalsMap];
		return nextOpenBarnTileInBounds({
			occupied,
			rows,
			bounds: barnInteriorBounds,
			isPassableChar,
		});
	};

	const getEggDropNearChicken = (
		chickenPos: { x: number; y: number },
		occupiedAnimals: Record<number, { x: number; y: number }>,
		existingEggs: Record<string, boolean>,
	) => {
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
		return getEggDropNearChickenCandidate({
			chickenPos,
			occupiedAnimals,
			existingEggs,
			rows,
			bounds,
			isPassableChar,
			chickenEggOffsets,
		});
	};

	const spawnAnimalInBarn = (type: AnimalType) => {
		const spawn = nextOpenBarnTile(animalTiles);
		if (!spawn) return false;
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
		return true;
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
				mapLayouts.farm,
				farmForestBlockers,
				farmCaveBlockers,
				new Set(Object.keys(plots)),
				false,
				STARTER_CHEST_POS,
			),
		);

		setPlots((prev) => advancePlotsForNewDay(prev, nextWeather));

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
		setAnimals((prev) => resetAnimalsForNewDay(prev));
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
				const relocation = placeAnimalsInBounds({
					animals,
					cap: nextCap,
					bounds,
				});
				setAnimals(relocation.keptAnimals);
				setAnimalTiles(relocation.occupied);
				setAnimalAnchors(relocation.occupied);
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
		const { newPrices, newTrends, changedItems } = rollDailyMarketState({
			oldPrices,
			initialPriceTrends,
			priceItems,
			generatePriceChange,
			randomInt,
		});
		setPrices(newPrices);
		setPriceTrends(newTrends);
		const dailyVendorRolls = rollDailyVendorState({
			newPrices,
			ownedPet,
			deliveredPet,
			generateSketchyMerchantStock,
			generateTraderTrades,
		});
		setSketchyMerchantActive(dailyVendorRolls.showSketchy);
		setSketchyMerchantStock(dailyVendorRolls.sketchyStock);
		setTraderActive(dailyVendorRolls.showTrader);
		setTraderTrades(dailyVendorRolls.traderTrades);
		setDoctorVendorActive(dailyVendorRolls.doctorVendorActive);
		setDoctorUsedToday(false);
		setPetVendorActive(dailyVendorRolls.petVendorActive);

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
		return grantBonusChestRewardSetRule(
			{
				randomInt,
				applyMoneyDelta,
				updateInventory,
				setStamina,
				staminaMax,
			},
			types,
		);
	};

	const openHighValueForestChestReward = () => {
		openHighValueForestChestRewardRule({
			randomInt,
			applyMoneyDelta,
			updateInventory,
			setStamina,
			staminaMax,
			animalsCount: animals.length,
			barnAnimalCap,
			canSpawnAnimal: nextOpenBarnTile(animalTiles) !== null,
			ownedWardrobeLooks,
			setOwnedWardrobeLooks,
			tools,
			setTools,
			spawnAnimalInBarn,
			openRewardPopup,
		});
	};

	const interact = (dir: Dir) => {
		runInteract(
			{
				modal,
				fishing,
				isOrdering,
				isDoctorCompounding,
				isDrivingTractor,
				dirDelta,
				player,
				activeMapLayouts,
				forestEntranceDoorPos,
				openForestExitMenu,
				forestForwardExitPos,
				continueForestDungeon,
				caveEntranceDoorPos,
				openCaveExitMenu,
				caveLadderPos,
				continueCaveDungeon,
				mapDoors,
				forestLockedToday,
				canEnterForest,
				caveLockedToday,
				canEnterCave,
				playBad,
				addLog,
				playNotification,
				setPlayer,
				ownedPet,
				petTile,
				playPetSound,
				setPetHeartTile,
				petHeartTimeoutRef,
				hasTractor,
				tractorParked,
				TRACTOR_PARK_POS,
				openMenu,
				closeMenu,
				enterTractor,
				allPlantableCropIds,
				cropDefs,
				inventory,
				itemNames,
				beachBottlePos,
				setBeachBottlePos,
				playGotReward,
				rollBeachBottleReward,
				randomInt,
				stamina,
				staminaMax,
				animals,
				barnAnimalCap,
				nextOpenBarnTile,
				animalTiles,
				setStamina,
				setOwnedWardrobeLooks,
				spawnAnimalInBarn,
				makeGaryBottleMessage,
				playSeagulls,
				beachShellDrops,
				keyForPos,
				setBeachShellDrops,
				playPluck,
				day,
				starterChestOpened,
				STARTER_CHEST_POS,
				setStarterChestOpened,
				applyMoneyDelta,
				updateInventory,
				openRewardPopup,
				farmWeedObstacles,
				trySpendStamina,
				setFarmWeedObstacles,
				getWaterCapacity,
				tools,
				tryUseToolAction,
				setWaterLevel,
				playWater,
				setWaterRefillTile,
				waterRefillTileTimeoutRef,
				startFishing,
				forestChest,
				setForestChest,
				openHighValueForestChestReward,
				forestBonusChests,
				setForestBonusChests,
				forestIsBonusLevel,
				grantBonusChestRewardSet,
				forestObstacleAt,
				setForestObstacles,
				getSmashAxeActionCost,
				getSmashAxeWoodSeedChance,
				getRandomCropId,
				standardCropIds,
				getSmashAxeRockDamage,
				getSmashAxeIronChance,
				caveObstacleAt,
				setCaveObstacles,
				caveLevel,
				setCaveLadderPos,
				caveObstacles,
				animalsMap,
				farmForestBlockers,
				setFarmForestBlockers,
				farmCaveBlockers,
				setFarmCaveBlockers,
				petGraveObstacles,
				setPetGraveObstacles,
				plots,
				getHoeTargets,
				setPlots,
				currentWeather,
				playPloop,
				waterLevel,
				playHoe,
				playYaya,
				CORAL_FRUIT_SELL_PRICE,
				prices,
				nextDay,
				isBathing,
				playBath,
				setIsBathing,
				clothingShopItems,
				ownedWardrobeLooks,
				starterWardrobeLooks,
				purchasableFunnyLooks,
				setPlayerEmoji,
				farmEggDrops,
				setFarmEggDrops,
				isCowLikeAnimal,
				rollLivestockYield,
				setAnimals,
				generateOverfedAnimalLine,
				interactBuilderVendor,
				interactVendor,
				vendorByShopMap,
				isShopMap,
				petVendorActive,
				pendingPet,
				canAfford,
				money,
				playChaChing,
				setPendingPet,
				petOptions,
				petVendorSoldLine,
				doctorVendorActive,
				doctorUsedToday,
				doctorFinishedTodayLine,
				doctorIntroLines,
				startDoctorMedicine,
				traderActive,
				TRADER_BOX_POS,
				traderBoxLines,
				TRADER_HELI_POS,
				traderHeliLines,
				TRADER_POS,
				traderTrades,
				traderSoldOutLines,
				traderIntroLines,
				openQuantityPrompt,
				setTraderTrades,
				traderAfterSaleLines,
				sketchyMerchantActive,
				sketchyMerchantStock,
				SKETCHY_CRATE_POS,
				dontTouchSketchy,
				SKETCHY_MERCHANT_POS,
				sketchyMerchantIntro,
				setSketchyMerchantStock,
				sketchyVendorSales,
				boatTiles,
				boatDialogArray,
				townNpcTiles,
				townNpcNames,
				npcDailyAssignments,
				generateDailyAssignmentsForNpcs,
				npcTalkedToday,
				townTips,
				generateNpcGreetingLine,
				generateNpcDialogLine,
				setNpcTalkedToday,
				DOCTOR_POS,
				PET_VENDOR_POS,
				playMunch,
				speakNpcLine,
			},
			dir,
		);
	};

	const moveModal = (dir: Dir) => {
		moveModalCursor(modal, dir, setModalIndex);
	};

	const moveQuantity = (delta: number) => {
		moveQuantitySelection(setQuantityPrompt, delta);
	};

	const selectModal = () => {
		selectModalOption({
			modal,
			modalIndex,
			quantityPrompt,
			quantityPromptRef,
			quantityParentMenuRef,
			playNotification,
			closeMenu,
			cancelQuantityPrompt,
		});
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		handleGameKeyDown(
			{
				applyMoneyDelta,
				updateInventory,
				addLog,
				isDrivingTractor,
				tractorImplementOn,
				tractorImplement,
				tractorSeedItem,
				inventory,
				setTractorImplementOn,
				playBad,
				applyTractorImplementAt,
				player,
				isBathing,
				stopBathing,
				dayTransition,
				dayTransitionStage,
				dayTransitionClosePhase,
				continueAfterSleep,
				isOrdering,
				isDoctorCompounding,
				fishing,
				endFishing,
				clearFishingTimers,
				setFishing,
				playYaya,
				fishingResolveTimeoutRef,
				modal,
				quantityPrompt,
				getAreaMusicForMap,
				switchAreaMusic,
				moveQuantity,
				moveModal,
				movePlayer,
				interact,
				cancelQuantityPrompt,
				vendorMenuTitles,
				closeMenu,
				selectModal,
			},
			e,
		);
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

	const viewCtx = {
		onKeyDown,
		shellRef,
		day,
		player,
		currentWeather,
		weatherEmojiById,
		money,
		stamina,
		staminaMax,
		waterLevel,
		inventoryRows,
		log,
		activeMapLayouts,
		isWindSlashOn,
		renderedMap,
		plots,
		keyForPos,
		groundClassForTile,
		isShopMap,
		shopDecorByMap,
		isFarmHouseDoorTile,
		getDoorGroundClass,
		fishing,
		isDrivingTractor,
		showTiredFace,
		playerEmoji,
		waterRefillTile,
		isRippleWaterTile,
		waterRipplePhase,
		isAnimatedGrassTile,
		grassFoliageVariant,
		caveLadderPos,
		caveRubble,
		toVisual,
		spriteTilesNeedingGround,
		petFacing,
		tractorFacing,
		showForestHit,
		getForestFogOpacity,
		getCaveFogOpacity,
		clouds,
		setClouds,
		marketRows,
		toolRows,
		getToolTierName,
		pendingTractorDelivery,
		hasTractor,
		hasHeadlamp,
		newspaper,
		isOrdering,
		isDoctorCompounding,
		doctorObservation,
		cafeObservation,
		modal,
		modalIndex,
		quantityPrompt,
		selectModal,
		getDealBadge,
		prices,
		initialPrices,
		cancelQuantityPrompt,
		moveQuantity,
		moveModal,
		moonPhases,
		dayTransition,
		dayTransitionStarsState,
		dayTransitionStage,
		dayTransitionClosePhase,
		continueAfterSleep,
		dayTransitionPrompt,
	};

	return renderGameRuntimeView(viewCtx);
}




