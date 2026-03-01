import {
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
	type KeyboardEvent,
	type SetStateAction,
} from "react";
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
import spaceBgSrc from "../../assets/SpaceBG.mp3";
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
import sighSoundSrc from "../../assets/sigh.m4a";
import whooshSoundSrc from "../../assets/whoosh.m4a";
import {
	generateDailyAssignmentsForNpcs,
	generateNpcDialogLine,
	generateNpcGreetingLine,
	generateOverfedAnimalLine,
	type NpcDailyAssignment,
} from "../../npcDialogue";
import {
	boatDialogArray,
	cowHarvestTtsLines,
	doctorFinishedTodayLine,
	doctorGrindingMedicineSpeech,
	doctorIntroLines,
	dontTouchSketchy,
	gotAllClothesDialog,
	gotAllToolsDialog,
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
	BUREAUCRACY_ENTRY_POS,
	BUREAUCRACY_EXIT_POS,
	BUREAUCRACY_SAVARIO_POS,
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
import {
	doors,
	isShopMap,
	vendorByShopMap,
	vendorShopMapByKey,
} from "../world/navigation";
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
	TOWN_NPC_GRASS_ROW_Y,
	townNpcAnchors,
	townNpcNames,
	TRADER_BOX_POS,
	TRADER_HELI_POS,
	TRADER_POS,
} from "../world/npcs";
import { isPassableChar } from "../world/passability";
import {
	nextAnimalTile,
	nextBoatTile,
	nextTownNpcTile,
} from "../systems/movement";
import { interactVendorMenu } from "../systems/vendors";
import { interactBuilderVendorMenu } from "../systems/builder";
import {
	clearFishingTimers as clearFishingTimersSystem,
	startFishingSequence,
} from "../systems/fishing";
import { rollBeachBottleReward } from "../systems/rewards";
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
import { generateNewspaperEmojiPicture } from "../systems/newspaperImageGenerator";
import {
	CORAL_FRUIT_SELL_PRICE,
	generateSketchyMerchantStock,
	generateTraderTrades,
	getDealBadge,
	getMarketBasePrice,
	getMarketSellPrice,
} from "../systems/commerce";
import {
	evolveFarmWeeds,
	generateInitialFarmWeedField,
} from "../systems/weeds";
import { randomWeather, weatherEmojiById } from "../systems/weather";
import {
	buildUnlockFlagsFromProgress,
	createInitialUnlockFlags,
	resolveUnlockFlags,
} from "../systems/unlocks";
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
	moveModalCursor,
	moveQuantitySelection,
	selectModalOption,
	type GameKeyDownContext,
} from "../systems/input";
import { runInteract } from "../systems/playerInteract";
import type { PlayerInteractContext } from "../systems/playerInteract";
import { runMovePlayer } from "../systems/playerMovement";
import { buildRenderedMapGrid } from "../systems/renderedMap";
import { createServiceOrderActions } from "../systems/serviceOrders";
import { renderGameRuntimeView } from "../ui/GameRuntimeView";
import type { GameRuntimeViewModel } from "../ui/viewModel";
import { createTileFxBus } from "../ui/tileFxBus";
import { createAreaMusicController } from "./areaMusic";
import type {
	BoatTileMap,
	GameStateActions,
	GameStateSnapshot,
} from "./contracts";
import {
	createAudioActions,
	initializeAudioEngine,
} from "./engine/audioEngine";
import {
	continueAfterSleep as continueAfterSleepEngine,
	playDayTransitionEarnedSfx,
	runNextDay as runNextDayEngine,
	startDayTransitionSequence,
} from "./engine/dayCycleEngine";
import { useBathingRecovery } from "./engine/bathingEngine";
import {
	grantBonusChestRewardSet as grantBonusChestRewardSetEngine,
	openCaveBonusChestReward as openCaveBonusChestRewardEngine,
	openHighValueForestChestReward as openHighValueForestChestRewardEngine,
	openRewardPopup as openRewardPopupEngine,
} from "./engine/rewardEngine";
import { buildGameRuntimeViewModel } from "./engine/viewModelBuilder";
import { useInputRouter } from "./useInputRouter";
import { PC_KEYBOARD_PRESET } from "../systems/inputCommands";
import { useWorldSimulation } from "./worldSimulation";
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
	UpgradeSceneEvent,
	UpgradeSceneBgTrack,
	UpgradeSceneEventKind,
	VendorKey,
	Warp,
	WeatherId,
} from "../shared/types";
import { keyForPos } from "../shared/coords";
import { randomInt, randomRoll } from "../shared/random";
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
import { POSITION_ANIMATION_MS } from "../config/visualMotion";
import {
	groundClassForTile,
	spriteTilesNeedingGround,
	toVisual,
} from "../config/visuals";
import { GLYPH } from "../config/glyphs";
import { applyMoneyDeltaState, updateInventoryState } from "../state/actions";
import {
	gameStateReducer,
	type GameState,
	type GameStateAction,
} from "../state/gameState";
import {
	fromSaveGameData,
	parseSaveGame,
	serializeSaveGame,
	toSaveGameData,
} from "../state/saveGame";

const BUREAUCRACY_SPAWN = {
	map: "bureaucracy_office" as const,
	x: BUREAUCRACY_ENTRY_POS.x,
	y: BUREAUCRACY_ENTRY_POS.y,
};
const DEFAULT_MAP_ZOOM = 1.5;
const MANUAL_ZOOM_MIN = 1;
const MANUAL_ZOOM_MAX = 2.25;
const MANUAL_ZOOM_MID = DEFAULT_MAP_ZOOM;
const MANUAL_ZOOM_LEVELS = [
	MANUAL_ZOOM_MIN,
	MANUAL_ZOOM_MID,
	MANUAL_ZOOM_MAX,
] as const;
const DIRECTOR_DEFAULT_FOCUS_ZOOM = MANUAL_ZOOM_MAX + 0.25;
const DIRECTOR_NAV_DURATION_MS = 1000;
const DIRECTOR_RETURN_DURATION_MS = 1000;
const DIRECTOR_RETURN_SETTLE_MS = 180;
const HEADLAMP_LETTER_POS = { x: 7, y: 8 } as const;
const FARM_NEWSPAPER_POS = { x: 6, y: 8 } as const;
const DAY_ONE_NEWSPAPER_TEXT =
	"Welcome to the farm! Press WASD to move. Press the Up Down Left Right arrows to interact with the world around you! Check your newspaper daily to learn whats happening in the world around you!";
const savarioLines = [
	"Oh. Good. You're back.",
	"We restored your progress. Please misplace it less impressively.",
	"The Committee noted your absence. Welcome back, probably.",
	"Yes. Everything appears... adequately restored.",
	"Your save file is waiting for you, hop on down.",
	"I pulled up your save file, it's down below.",
	"Your save file is just outside the office.",
] as const;
const saveFileNameA = [
	"DontHackThisFile",
	"EditMeAtYourOwnRisk",
	"SuperEncryptedSaveFile",
	"TotallyUntamperableData",
	"CommitteeApprovedProgress",
	"DefinitelyNotJustJson",
	"BureaucraticallySealedSave",
	"LegallyDistinctBackupPlan",
	"FinePrintIncludedSave",
	"NotSuspiciousAtAll",
	"PleaseDontOpenInNotepad",
	"DefinitelyNoCheatsInside",
	"ProductivitySimulationArchive",
	"ExtremelyOfficialDocument",
	"TaxCompliantTurnipLedger",
	"FarmerNumberSevenReport",
	"HighlyClassifiedPotatoes",
	"UnreasonablyNormalDataFile",
	"ArchiveOfQuestionableChoices",
	"ProgressBarEvidence",
	"CommitteeEyesOnly",
	"DoNotFeedAfterMidnight",
	"TotallyBalancedGameState",
	"OopsAllJsonAgain",
	"VerySecureTrustMe",
	"AuditFriendlyAdventureLog",
	"LegitSaveNoReally",
	"PermitPendingSave",
	"RiskAssessedRuralData",
	"EmergencyTurnipProtocol",
] as const;

const formatSaveTimestamp = (date: Date): string => {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

const randomSaveFilePrefix = () =>
	saveFileNameA[Math.floor(Math.random() * saveFileNameA.length)]!;

type GameRuntimeBootOptions = {
	bootSaveJson?: string | null;
};

export function useGameRuntime(options?: GameRuntimeBootOptions) {
	const bootSaveJson = options?.bootSaveJson ?? null;
	const shellRef = useRef<HTMLDivElement | null>(null);
	const notificationRef = useRef<HTMLAudioElement | null>(null);
	const farmMusicRef = useRef<HTMLAudioElement | null>(null);
	const townMusicRef = useRef<HTMLAudioElement | null>(null);
	const beachAmbienceRef = useRef<HTMLAudioElement | null>(null);
	const houseMusicRef = useRef<HTMLAudioElement | null>(null);
	const forestMusicRef = useRef<HTMLAudioElement | null>(null);
	const caveMusicRef = useRef<HTMLAudioElement | null>(null);
	const bureaucracyMusicRef = useRef<HTMLAudioElement | null>(null);
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
	const sighSoundRef = useRef<HTMLAudioElement | null>(null);
	const whooshSoundRef = useRef<HTMLAudioElement | null>(null);
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
	const savarioResponseTimeoutRef = useRef<number | null>(null);
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
	const forestSnakeDirsRef = useRef<Record<number, SnakePatrolState>>(
		makeSnakeDirections(initialForestStateRef.current.enemies),
	);
	const forestAggroRef = useRef<Record<number, boolean>>({});
	const forestEnemyTickRef = useRef(0);
	const caveBatDirsRef = useRef<Record<number, SnakePatrolState>>(
		makeSnakeDirections(initialCaveStateRef.current.enemies),
	);
	const caveAggroRef = useRef<Record<number, boolean>>({});
	const caveEnemyTickRef = useRef(0);
	const [gameState, dispatch] = useReducer(
		gameStateReducer,
		undefined,
		(): GameState => {
			const farmForestBlockers = {
				...Object.fromEntries(
					FARM_FOREST_BLOCKER_POSITIONS.map((pos) => [
						keyForPos(pos.x, pos.y),
						true,
					]),
				),
				...initialFarmExpansionBlockers.wood,
			};
			const farmCaveBlockers = {
				...Object.fromEntries(
					FARM_CAVE_BLOCKER_POSITIONS.map((pos) => [
						keyForPos(pos.x, pos.y),
						24,
					]),
				),
				...initialFarmExpansionBlockers.stone,
			};
			return {
				player: bootSaveJson
					? { ...BUREAUCRACY_SPAWN }
					: { map: "farm", x: 6, y: 10 },
				day: 1,
				forestLayout: initialForestStateRef.current.layout,
				forestEnemies: initialForestStateRef.current.enemies,
				forestObstacles: initialForestStateRef.current.obstacles,
				forestChest: initialForestStateRef.current.chest,
				forestBonusChests: initialForestStateRef.current.bonusChests,
				forestLevel: initialForestStateRef.current.level,
				forestEntranceDoorPos: initialForestStateRef.current.entranceDoor,
				forestForwardExitPos: initialForestStateRef.current.exitDoor,
				forestExitSide: initialForestStateRef.current.exitSide,
				forestLastTurn: initialForestStateRef.current.turnSign,
				forestIsBonusLevel: initialForestStateRef.current.isBonusLevel,
				forestLockedToday: false,
				forestFog: {},
				caveFog: {},
				caveLayout: initialCaveStateRef.current.layout,
				caveRubble: buildCaveRubble(initialCaveStateRef.current.layout),
				caveEnemies: initialCaveStateRef.current.enemies,
				caveObstacles: initialCaveStateRef.current.obstacles,
				caveBonusChest: initialCaveStateRef.current.bonusChest,
				caveIsBonusLevel: initialCaveStateRef.current.isBonusLevel,
				caveLevel: initialCaveStateRef.current.level,
				caveEntranceDoorPos: initialCaveStateRef.current.entranceDoor,
				caveLevelOneExitPos: initialCaveStateRef.current.levelOneExitInside,
				caveLadderPos: initialCaveStateRef.current.ladderPos,
				caveStartingRockCount: initialCaveStateRef.current.startingRockCount,
				caveLockedToday: false,
				currentWeather: randomWeather(),
				cafeShopkeeperX: 7,
				shopDecorByMap: (() => {
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
						const placementCount = Math.min(
							shopDecorSlots.length,
							randomInt(2, 4),
						);
						const chosenSlots = [...shopDecorSlots]
							.sort(() => randomRoll() - 0.5)
							.slice(0, placementCount);
						chosenSlots.forEach(({ x, y }) => {
							const item = theme[randomInt(0, theme.length - 1)]!;
							slots[`${x},${y}`] = item;
						});
						out[mapId] = slots;
					});
					return out;
				})(),
				money: 0,
				staminaMax: STAMINA_MAX,
				stamina: STAMINA_MAX,
				inventory: makeEmptyInventory(),
				plots: {},
				animals: [],
				prices: initialPrices,
				priceTrends: initialPriceTrends,
				newspaper: DAY_ONE_NEWSPAPER_TEXT,
				newspaperImage: generateNewspaperEmojiPicture(DAY_ONE_NEWSPAPER_TEXT),
				newspaperRead: false,
				log: ["Welcome to your farm."],
				modal: null,
				modalIndex: 0,
				quantityPrompt: null,
				waterRipplePhase: false,
				pauseGame: false,
				dayTransition: null,
				dayTransitionPrompt: nextDayPrompts[0],
				dayTransitionStage: "intro",
				dayTransitionClosePhase: "idle",
				dayTransitionStarsState: createDayTransitionStars(),
				currentDayEarned: 0,
				previousDayEarned: 0,
				totalEarned: 0,
				playerEmoji: starterWardrobeLooks[0],
				showTiredFace: false,
				showForestHit: false,
				isBathing: false,
				ownedWardrobeLooks: [...starterWardrobeLooks],
				tools: initialToolLevels,
				barnTier: 1,
				pendingBarnUpgrade: false,
				hasAutoCollector: false,
				pendingAutoCollectorInstall: false,
				hasTractor: false,
				hasHeadlamp: false,
				headlampLetterRead: false,
				unlockFlags: buildUnlockFlagsFromProgress({
					forestLevel: initialForestStateRef.current.level,
					caveLevel: initialCaveStateRef.current.level,
				}),
				pendingTractorDelivery: false,
				tractorParked: false,
				isDrivingTractor: false,
				tractorFacing: 1,
				tractorImplement: null,
				tractorImplementOn: false,
				tractorSeedItem: null,
				tractorDriverEmoji: null,
				waterLevel: 0,
				waterRefillTile: null,
				starterChestOpened: false,
				beachBottlePos: rollBeachBottleSpawn(townBeachBottleTiles, randomInt),
				beachShellDrops: rollBeachShellDrops(
					townBeachBottleTiles,
					keyForPos,
					randomInt,
				),
				sketchyMerchantActive: randomRoll() < 0.25,
				sketchyMerchantStock: generateSketchyMerchantStock(initialPrices),
				traderActive: randomRoll() < 0.5,
				traderTrades: generateTraderTrades(),
				doctorVendorActive: randomRoll() < 1 / 3,
				doctorUsedToday: false,
				petVendorActive: randomRoll() < 0.5,
				ownedPet: null,
				pendingPet: null,
				petTile: null,
				petFacing: 1,
				petHeartTile: null,
				townNpcTiles: townNpcAnchors,
				boatTiles: initialBoatTiles,
				npcDailyAssignments: generateDailyAssignmentsForNpcs(
					Object.keys(townNpcNames),
				),
				npcTalkedToday: {},
				fishing: null,
				isOrdering: false,
				cafeObservation: "",
				isDoctorCompounding: false,
				doctorObservation: "",
				clouds: [],
				grassWindBands: [],
				animalTiles: {},
				animalAnchors: {},
				farmForestBlockers,
				farmCaveBlockers,
				petGraveObstacles: {},
				pendingPetGravePos: null,
				farmWeedObstacles: generateInitialFarmWeedField(
					mapLayouts.farm,
					farmForestBlockers,
					farmCaveBlockers,
					new Set<string>(),
					STARTER_CHEST_POS,
				),
				farmEggDrops: {},
				pendingUpgradeScenes: [],
			};
		},
	);
	const [isSaveLoadMenuOpen, setIsSaveLoadMenuOpen] = useState(false);
	const [saveLoadStatus, setSaveLoadStatus] = useState<string | null>(null);
	const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
	const [cameraTarget, setCameraTarget] = useState<{
		map: MapId;
		x: number;
		y: number;
		smooth: boolean;
		durationMs?: number;
	} | null>(null);
	const [directorPopup, setDirectorPopup] = useState<{
		message: string;
	} | null>(null);
	const [directorInputLocked, setDirectorInputLocked] = useState(false);
	const [cloudOverlayVisible, setCloudOverlayVisible] = useState(true);
	const [isNewspaperPopupOpen, setIsNewspaperPopupOpen] = useState(false);
	const {
		player,
		day,
		forestLayout,
		forestEnemies,
		forestObstacles,
		forestChest,
		forestBonusChests,
		forestLevel,
		forestEntranceDoorPos,
		forestForwardExitPos,
		forestExitSide,
		forestLastTurn,
		forestIsBonusLevel,
		forestLockedToday,
		forestFog,
		caveFog,
		caveLayout,
		caveRubble,
		caveEnemies,
		caveObstacles,
		caveBonusChest,
		caveIsBonusLevel,
		caveLevel,
		caveEntranceDoorPos,
		caveLevelOneExitPos,
		caveLadderPos,
		caveStartingRockCount,
		caveLockedToday,
		currentWeather,
		cafeShopkeeperX,
		shopDecorByMap,
		money,
		staminaMax,
		stamina,
		inventory,
		plots,
		animals,
		prices,
		priceTrends,
		newspaper,
		newspaperImage,
		newspaperRead,
		log,
		modal,
		modalIndex,
		quantityPrompt,
		waterRipplePhase,
		pauseGame,
		dayTransition,
		dayTransitionPrompt,
		dayTransitionStage,
		dayTransitionClosePhase,
		dayTransitionStarsState,
		currentDayEarned,
		previousDayEarned,
		totalEarned,
		playerEmoji,
		showTiredFace,
		showForestHit,
		isBathing,
		ownedWardrobeLooks,
		tools,
		barnTier,
		pendingBarnUpgrade,
		hasAutoCollector,
		pendingAutoCollectorInstall,
		hasTractor,
		hasHeadlamp,
		headlampLetterRead,
		unlockFlags,
		pendingTractorDelivery,
		tractorParked,
		isDrivingTractor,
		tractorFacing,
		tractorImplement,
		tractorImplementOn,
		tractorSeedItem,
		tractorDriverEmoji,
		waterLevel,
		waterRefillTile,
		starterChestOpened,
		beachBottlePos,
		beachShellDrops,
		sketchyMerchantActive,
		sketchyMerchantStock,
		traderActive,
		traderTrades,
		doctorVendorActive,
		doctorUsedToday,
		petVendorActive,
		ownedPet,
		pendingPet,
		petTile,
		petFacing,
		petHeartTile,
		townNpcTiles,
		boatTiles,
		npcDailyAssignments,
		npcTalkedToday,
		fishing,
		isOrdering,
		cafeObservation,
		isDoctorCompounding,
		doctorObservation,
		clouds,
		grassWindBands,
		animalTiles,
		animalAnchors,
		farmForestBlockers,
		farmCaveBlockers,
		petGraveObstacles,
		pendingPetGravePos,
		farmWeedObstacles,
		farmEggDrops,
		pendingUpgradeScenes,
	} = gameState;
	const quantityParentMenuRef = useRef<{
		modal: ModalState;
		index: number;
	} | null>(null);
	const quantityPromptRef = useRef<QuantityPromptState | null>(null);
	const dayTransitionTimersRef = useRef<number[]>([]);
	const dayTransitionCloseTimersRef = useRef<number[]>([]);
	const petHeartTimeoutRef = useRef<number | null>(null);
	const savarioLineIndexRef = useRef(0);
	const bootSaveHandledRef = useRef(false);
	const directorRunningRef = useRef(false);
	const directorConfirmRef = useRef<(() => void) | null>(null);
	const directorTimersRef = useRef<number[]>([]);
	const playerRef = useRef(player);
	const playerMoveUnlockAtRef = useRef(0);
	const prevZoomWhooshRef = useRef(mapZoom);
	const heldMoveDirRef = useRef<Dir | null>(null);
	const heldMoveKeyRef = useRef<string | null>(null);
	const heldMoveTimerRef = useRef<number | null>(null);
	const dispatchHeldMoveCommandRef = useRef<(dir: Dir) => void>(() => {});
	const tileFxBusRef = useRef(createTileFxBus());
	const prevPlayerBobbleRef = useRef(player);
	const prevTownNpcBobbleRef = useRef(townNpcTiles);
	const prevForestEnemyBobbleRef = useRef(forestEnemies);
	const prevCaveEnemyBobbleRef = useRef(caveEnemies);
	const prevAnimalBobbleRef = useRef(animalTiles);
	const animalsRef = useRef(animals);
	const animalTilesRef = useRef(animalTiles);
	const animalAnchorsRef = useRef(animalAnchors);
	const ttsReadyRef = useRef(false);
	const setterCacheRef = useRef(new Map<keyof GameState, unknown>());
	const setForKey = <K extends keyof GameState>(key: K) => {
		const cached = setterCacheRef.current.get(key) as
			| ((value: SetStateAction<GameState[K]>) => void)
			| undefined;
		if (cached) return cached;
		const next = (value: SetStateAction<GameState[K]>) => {
			dispatch({ type: "set", key, value } as GameStateAction);
		};
		setterCacheRef.current.set(key, next);
		return next;
	};
	const dispatchBatch: NonNullable<GameStateActions["dispatchBatch"]> = (
		updates,
	) => {
		dispatch({ type: "batch", updates });
	};
	const setPlayer = setForKey("player");
	const setDay = setForKey("day");
	const setForestLayout = setForKey("forestLayout");
	const setForestEnemies = setForKey("forestEnemies");
	const setForestObstacles = setForKey("forestObstacles");
	const setForestChest = setForKey("forestChest");
	const setForestBonusChests = setForKey("forestBonusChests");
	const setForestLevel = setForKey("forestLevel");
	const setForestEntranceDoorPos = setForKey("forestEntranceDoorPos");
	const setForestForwardExitPos = setForKey("forestForwardExitPos");
	const setForestExitSide = setForKey("forestExitSide");
	const setForestLastTurn = setForKey("forestLastTurn");
	const setForestIsBonusLevel = setForKey("forestIsBonusLevel");
	const setForestLockedToday = setForKey("forestLockedToday");
	const setForestFog = setForKey("forestFog");
	const setCaveFog = setForKey("caveFog");
	const setCaveLayout = setForKey("caveLayout");
	const setCaveRubble = setForKey("caveRubble");
	const setCaveEnemies = setForKey("caveEnemies");
	const setCaveObstacles = setForKey("caveObstacles");
	const setCaveBonusChest = setForKey("caveBonusChest");
	const setCaveIsBonusLevel = setForKey("caveIsBonusLevel");
	const setCaveLevel = setForKey("caveLevel");
	const setCaveEntranceDoorPos = setForKey("caveEntranceDoorPos");
	const setCaveLevelOneExitPos = setForKey("caveLevelOneExitPos");
	const setCaveLadderPos = setForKey("caveLadderPos");
	const setCaveStartingRockCount = setForKey("caveStartingRockCount");
	const setCaveLockedToday = setForKey("caveLockedToday");
	const setCurrentWeather = setForKey("currentWeather");
	const setCafeShopkeeperX = setForKey("cafeShopkeeperX");
	const setMoney = setForKey("money");
	const setStaminaMax = setForKey("staminaMax");
	const setStamina = setForKey("stamina");
	const setInventory = setForKey("inventory");
	const setPlots = setForKey("plots");
	const setAnimals = setForKey("animals");
	const setPrices = setForKey("prices");
	const setPriceTrends = setForKey("priceTrends");
	const setNewspaper = setForKey("newspaper");
	const setNewspaperImage = setForKey("newspaperImage");
	const setNewspaperRead = setForKey("newspaperRead");
	const setLog = setForKey("log");
	const setModal = setForKey("modal");
	const setModalIndex = setForKey("modalIndex");
	const setQuantityPrompt = setForKey("quantityPrompt");
	const setWaterRipplePhase = setForKey("waterRipplePhase");
	const setPauseGame = setForKey("pauseGame");
	const setDayTransition = setForKey("dayTransition");
	const setDayTransitionPrompt = setForKey("dayTransitionPrompt");
	const setDayTransitionStage = setForKey("dayTransitionStage");
	const setDayTransitionClosePhase = setForKey("dayTransitionClosePhase");
	const setDayTransitionStarsState = setForKey("dayTransitionStarsState");
	const setCurrentDayEarned = setForKey("currentDayEarned");
	const setPreviousDayEarned = setForKey("previousDayEarned");
	const setTotalEarned = setForKey("totalEarned");
	const setPlayerEmoji = setForKey("playerEmoji");
	const setShowTiredFace = setForKey("showTiredFace");
	const setShowForestHit = setForKey("showForestHit");
	const setIsBathing = setForKey("isBathing");
	const setOwnedWardrobeLooks = setForKey("ownedWardrobeLooks");
	const setTools = setForKey("tools");
	const setBarnTier = setForKey("barnTier");
	const setPendingBarnUpgrade = setForKey("pendingBarnUpgrade");
	const setHasAutoCollector = setForKey("hasAutoCollector");
	const setPendingAutoCollectorInstall = setForKey("pendingAutoCollectorInstall");
	const setHasTractor = setForKey("hasTractor");
	const setHasHeadlamp = setForKey("hasHeadlamp");
	const setHeadlampLetterRead = setForKey("headlampLetterRead");
	const setUnlockFlags = setForKey("unlockFlags");
	const setPendingTractorDelivery = setForKey("pendingTractorDelivery");
	const setTractorParked = setForKey("tractorParked");
	const setIsDrivingTractor = setForKey("isDrivingTractor");
	const setTractorFacing = setForKey("tractorFacing");
	const setTractorImplement = setForKey("tractorImplement");
	const setTractorImplementOn = setForKey("tractorImplementOn");
	const setTractorSeedItem = setForKey("tractorSeedItem");
	const setTractorDriverEmoji = setForKey("tractorDriverEmoji");
	const setWaterLevel = setForKey("waterLevel");
	const setWaterRefillTile = setForKey("waterRefillTile");
	const setStarterChestOpened = setForKey("starterChestOpened");
	const setBeachBottlePos = setForKey("beachBottlePos");
	const setBeachShellDrops = setForKey("beachShellDrops");
	const setSketchyMerchantActive = setForKey("sketchyMerchantActive");
	const setSketchyMerchantStock = setForKey("sketchyMerchantStock");
	const setTraderActive = setForKey("traderActive");
	const setTraderTrades = setForKey("traderTrades");
	const setDoctorVendorActive = setForKey("doctorVendorActive");
	const setDoctorUsedToday = setForKey("doctorUsedToday");
	const setPetVendorActive = setForKey("petVendorActive");
	const setOwnedPet = setForKey("ownedPet");
	const setPendingPet = setForKey("pendingPet");
	const setPetTile = setForKey("petTile");
	const setPetFacing = setForKey("petFacing");
	const setPetHeartTile = setForKey("petHeartTile");
	const setTownNpcTiles = setForKey("townNpcTiles");
	const setBoatTiles = setForKey("boatTiles");
	const setNpcDailyAssignments = setForKey("npcDailyAssignments");
	const setNpcTalkedToday = setForKey("npcTalkedToday");
	const setFishing = setForKey("fishing");
	const setIsOrdering = setForKey("isOrdering");
	const setCafeObservation = setForKey("cafeObservation");
	const setIsDoctorCompounding = setForKey("isDoctorCompounding");
	const setDoctorObservation = setForKey("doctorObservation");
	const setClouds = setForKey("clouds");
	const setGrassWindBands = setForKey("grassWindBands");
	const setAnimalTiles = setForKey("animalTiles");
	const setAnimalAnchors = setForKey("animalAnchors");
	const setFarmForestBlockers = setForKey("farmForestBlockers");
	const setFarmCaveBlockers = setForKey("farmCaveBlockers");
	const setPetGraveObstacles = setForKey("petGraveObstacles");
	const setPendingPetGravePos = setForKey("pendingPetGravePos");
	const setFarmWeedObstacles = setForKey("farmWeedObstacles");
	const setFarmEggDrops = setForKey("farmEggDrops");
	const setPendingUpgradeScenes = setForKey("pendingUpgradeScenes");
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
	const canSaveGame = player.map === "farm" || player.map === "town";
	const headlampLetterVisible =
		unlockFlags.headlampVendorStock && !headlampLetterRead;
	const farmNewspaperPos = FARM_NEWSPAPER_POS;
	const saveDisabledMessage = canSaveGame
		? null
		: player.map === "bureaucracy_office"
			? "No saving in intake. Form 27-B says one reality shift per visit."
			: "No saving in the forest/cave. Bureaucracy says the moss eats paperwork.";
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
	const barnAutoCollectorPos = useMemo(() => {
		const rows = activeMapLayouts.barn;
		const isWalkableTile = (x: number, y: number) => {
			if (x < 0 || y < 0) return false;
			if (y >= rows.length || x >= (rows[0]?.length ?? 0)) return false;
			const tile = rows[y]?.[x] ?? "#";
			return isPassableChar(tile);
		};
		const isInBounds = (x: number, y: number) =>
			x >= 0 &&
			y >= 0 &&
			y < rows.length &&
			x < (rows[0]?.length ?? 0);
		const hasWalkableNeighbor = (x: number, y: number) =>
			isWalkableTile(x + 1, y) ||
			isWalkableTile(x - 1, y) ||
			isWalkableTile(x, y + 1) ||
			isWalkableTile(x, y - 1);
		for (let y = rows.length - 1; y >= 0; y -= 1) {
			const row = rows[y];
			if (!row) continue;
			for (let x = row.length - 1; x >= 0; x -= 1) {
				const tile = row[x] ?? "#";
				if ((tile === "#" || tile === "B") && hasWalkableNeighbor(x, y)) {
					const shifted = { x: x - 1, y: y - 1 };
					if (isInBounds(shifted.x, shifted.y)) return shifted;
					return { x, y };
				}
			}
		}
		for (let y = rows.length - 1; y >= 0; y -= 1) {
			const row = rows[y];
			if (!row) continue;
			for (let x = row.length - 1; x >= 0; x -= 1) {
				const tile = row[x] ?? "#";
				if (tile === "+" || !hasWalkableNeighbor(x, y)) continue;
				if (isPassableChar(tile)) return { x, y };
			}
		}
		return null;
	}, [activeMapLayouts.barn]);
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
					target: {
						map: "barn" as MapId,
						x: barnSpawnPoint.x,
						y: barnSpawnPoint.y,
					},
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
		initializeAudioEngine({
			shellRef,
			refs: {
				notificationRef,
				farmMusicRef,
				townMusicRef,
				beachAmbienceRef,
				houseMusicRef,
				forestMusicRef,
				caveMusicRef,
				bureaucracyMusicRef,
				chaChingRef,
				endOfDayRef,
				hoeSoundRef,
				munchSoundRef,
				badSoundRef,
				waterSoundRef,
				yayaSoundRef,
				tooTiredRef,
				gotRewardRef,
				snakeSoundRef,
				bearSoundRef,
				pooSoundRef,
				bathSoundRef,
				pluckSoundRef,
				ploopSoundRef,
				seagullsSoundRef,
				meowSoundRef,
				woofSoundRef,
				tractorSoundRef,
				sighSoundRef,
				whooshSoundRef,
				cafeOrderMusicRef,
				currentAreaMusicRef,
				ttsReadyRef,
			},
			sources: {
				bgMusicSrc,
				bgFarmSrc,
				townBGSrc,
				beachAmbienceSrc,
				chaChingSrc,
				endOfDaySrc,
				hoeSoundSrc,
				munchSoundSrc,
				badSoundSrc,
				waterSoundSrc,
				yayaSoundSrc,
				tooTiredSoundSrc,
				cafeOrderMusicSrc,
				notificationSoundSrc,
				forestMusicSrc,
				caveMusicSrc,
				spaceBgSrc,
				gotRewardSoundSrc,
				snakeSoundSrc,
				bearSoundSrc,
				pooSoundSrc,
				bathSoundSrc,
				pluckSoundSrc,
				ploopSoundSrc,
				seagullsSoundSrc,
				meowSoundSrc,
				woofSoundSrc,
				tractorSoundSrc,
				sighSoundSrc,
				whooshSoundSrc,
			},
		});
	}, []);

	const {
		playNotification,
		playChaChing,
		playHoe,
		playMunch,
		playBad,
		playTooTired,
		playWater,
		playYaya,
		playGotReward,
		playSnakeSound,
		playBearSound,
		playPooSound,
		playBath,
		playPluck,
		playPloop,
		playSeagulls,
		fadeOutSeagulls,
		playPetSound,
		startTractorLoop,
		stopTractorLoop,
		playSigh,
		playWhoosh,
		speakNpcLine,
	} = createAudioActions({
		refs: {
			notificationRef,
			farmMusicRef,
			townMusicRef,
			beachAmbienceRef,
			houseMusicRef,
			forestMusicRef,
			caveMusicRef,
			bureaucracyMusicRef,
			chaChingRef,
			endOfDayRef,
			hoeSoundRef,
			munchSoundRef,
			badSoundRef,
			waterSoundRef,
			yayaSoundRef,
			tooTiredRef,
			gotRewardRef,
			snakeSoundRef,
			bearSoundRef,
			pooSoundRef,
			bathSoundRef,
			pluckSoundRef,
			ploopSoundRef,
			seagullsSoundRef,
			meowSoundRef,
			woofSoundRef,
			tractorSoundRef,
			sighSoundRef,
			whooshSoundRef,
			cafeOrderMusicRef,
			currentAreaMusicRef,
			ttsReadyRef,
		},
		seagullsFadeIntervalRef,
		tiredDuckTimeoutRef,
		tiredFaceTimeoutRef,
		setShowTiredFace,
	});

	useEffect(() => {
		const zoomChanged = Math.abs(prevZoomWhooshRef.current - mapZoom) > 0.001;
		prevZoomWhooshRef.current = mapZoom;
		if (zoomChanged) playWhoosh();
	}, [mapZoom]);

	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;
		if (bootSaveJson) return;
		const initialTrack = farmMusicRef.current;
		if (initialTrack) {
			initialTrack.volume = 1;
			void initialTrack.play().catch(() => undefined);
			currentAreaMusicRef.current = initialTrack;
		}
	}, [bootSaveJson]);

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
			if (savarioResponseTimeoutRef.current !== null) {
				window.clearTimeout(savarioResponseTimeoutRef.current);
				savarioResponseTimeoutRef.current = null;
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
			directorTimersRef.current.forEach((id) => window.clearTimeout(id));
			directorTimersRef.current = [];
			if (cafeOrderMusicRef.current) {
				cafeOrderMusicRef.current.pause();
				cafeOrderMusicRef.current.currentTime = 0;
			}
			if (caveMusicRef.current) {
				caveMusicRef.current.pause();
				caveMusicRef.current.currentTime = 0;
			}
			if (bureaucracyMusicRef.current) {
				bureaucracyMusicRef.current.pause();
				bureaucracyMusicRef.current.currentTime = 0;
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

	const {
		getAreaMusicForMap,
		stopAreaFade,
		stopTownBeachFade,
		stopStaleBackgroundTracks,
		fadeTownAndBeach,
		fadeOutCurrentAreaMusic,
		switchAreaMusic,
		crossFadeEndOfDayTo,
	} = createAreaMusicController({
		isShopMap,
		playerRef,
		forestIsBonusLevel,
		caveIsBonusLevel,
		hasDayTransition: !!dayTransition,
		isOrdering,
		isDoctorCompounding,
		isFishing: !!fishing,
		farmMusicRef,
		townMusicRef,
		beachAmbienceRef,
		houseMusicRef,
		forestMusicRef,
		caveMusicRef,
		bureaucracyMusicRef,
		endOfDayRef,
		cafeOrderMusicRef,
		currentAreaMusicRef,
		musicFadeFromRef,
		musicFadeToRef,
		musicFadeIntervalRef,
		bgMusicTransitionUntilRef,
		townBeachFadeIntervalRef,
	});

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
				endFishing();
			},
		});
	};

	useEffect(() => {
		if (dayTransition) return;
		if (bootSaveJson && !bootSaveHandledRef.current) return;
		if (directorRunningRef.current) return;
		switchAreaMusic(getAreaMusicForMap(player.map), false);
	}, [
		player.map,
		forestIsBonusLevel,
		caveIsBonusLevel,
		dayTransition,
		bootSaveJson,
	]);

	useEffect(() => {
		if (directorRunningRef.current) return;
		stopStaleBackgroundTracks();
	}, [
		player.map,
		forestIsBonusLevel,
		caveIsBonusLevel,
		dayTransition,
		isOrdering,
		isDoctorCompounding,
		fishing,
	]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			if (directorRunningRef.current) return;
			stopStaleBackgroundTracks();
		}, 900);
		return () => window.clearInterval(interval);
	}, [
		forestIsBonusLevel,
		caveIsBonusLevel,
		dayTransition,
		isOrdering,
		isDoctorCompounding,
		fishing,
	]);

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
		const prev = prevPlayerBobbleRef.current;
		if (prev.map === player.map) {
			const dx = Math.abs(player.x - prev.x);
			const dy = Math.abs(player.y - prev.y);
			if (dx + dy === 1) {
				tileFxBusRef.current.api.actor("player").bobble(POSITION_ANIMATION_MS);
			}
		}
		prevPlayerBobbleRef.current = player;
	}, [player]);

	useEffect(() => {
		const applyNewspaperFx = () => {
			tileFxBusRef.current.api
				.at({ map: "farm", x: farmNewspaperPos.x, y: farmNewspaperPos.y })
				.bounceSquash(!newspaperRead, 1000);
		};
		applyNewspaperFx();
		const frameId = window.requestAnimationFrame(applyNewspaperFx);
		const timeoutId = window.setTimeout(applyNewspaperFx, 80);
		return () => {
			window.cancelAnimationFrame(frameId);
			window.clearTimeout(timeoutId);
		};
	}, [day, newspaperRead, player.map, farmNewspaperPos.x, farmNewspaperPos.y]);

	useEffect(() => {
		const prev = prevTownNpcBobbleRef.current;
		Object.entries(townNpcTiles).forEach(([npcKey, nextPos]) => {
			const prevPos = prev[npcKey];
			if (!prevPos) return;
			const dx = Math.abs(nextPos.x - prevPos.x);
			const dy = Math.abs(nextPos.y - prevPos.y);
			const movedOneTile = Math.max(dx, dy) === 1 && dx + dy > 0;
			if (movedOneTile) {
				tileFxBusRef.current.api
					.actor(`town-npc-${npcKey}`)
					.bobble(POSITION_ANIMATION_MS);
			}
		});
		prevTownNpcBobbleRef.current = townNpcTiles;
	}, [townNpcTiles]);

	useEffect(() => {
		const prevById = new Map(
			prevForestEnemyBobbleRef.current.map((enemy) => [enemy.id, enemy] as const),
		);
		forestEnemies.forEach((enemy) => {
			if (!(enemy.type === "bear" || enemy.type === "poop")) return;
			const prev = prevById.get(enemy.id);
			if (!prev) return;
			const dx = Math.abs(enemy.x - prev.x);
			const dy = Math.abs(enemy.y - prev.y);
			const movedOneTile = Math.max(dx, dy) === 1 && dx + dy > 0;
			if (movedOneTile) {
				tileFxBusRef.current.api
					.actor(`forest-enemy-${enemy.id}`)
					.bobble(POSITION_ANIMATION_MS);
			}
		});
		prevForestEnemyBobbleRef.current = forestEnemies;
	}, [forestEnemies]);

	useEffect(() => {
		const prevById = new Map(
			prevCaveEnemyBobbleRef.current.map((enemy) => [enemy.id, enemy] as const),
		);
		caveEnemies.forEach((enemy) => {
			if (!(enemy.type === "bear" || enemy.type === "poop")) return;
			const prev = prevById.get(enemy.id);
			if (!prev) return;
			const dx = Math.abs(enemy.x - prev.x);
			const dy = Math.abs(enemy.y - prev.y);
			const movedOneTile = Math.max(dx, dy) === 1 && dx + dy > 0;
			if (movedOneTile) {
				tileFxBusRef.current.api
					.actor(`cave-enemy-${enemy.id}`)
					.bobble(POSITION_ANIMATION_MS);
			}
		});
		prevCaveEnemyBobbleRef.current = caveEnemies;
	}, [caveEnemies]);

	useEffect(() => {
		const prev = prevAnimalBobbleRef.current;
		Object.entries(animalTiles).forEach(([animalIdKey, nextPos]) => {
			const prevPos = prev[Number(animalIdKey)];
			if (!prevPos) return;
			const dx = Math.abs(nextPos.x - prevPos.x);
			const dy = Math.abs(nextPos.y - prevPos.y);
			const movedOneTile = Math.max(dx, dy) === 1 && dx + dy > 0;
			if (movedOneTile) {
				tileFxBusRef.current.api
					.actor(`animal-${animalIdKey}`)
					.bobble(POSITION_ANIMATION_MS);
			}
		});
		prevAnimalBobbleRef.current = animalTiles;
	}, [animalTiles]);

	useEffect(() => {
		animalsRef.current = animals;
	}, [animals]);

	useEffect(() => {
		animalTilesRef.current = animalTiles;
	}, [animalTiles]);

	useEffect(() => {
		animalAnchorsRef.current = animalAnchors;
	}, [animalAnchors]);

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
		const torchSources = caveObstacles.filter(
			(obstacle) => obstacle.type === "torch",
		);
		setCaveFog((prev) => {
			let changed = false;
			const next = { ...prev };
			for (let y = 0; y < rows.length; y += 1) {
				const row = rows[y];
				if (!row) continue;
				for (let x = 0; x < row.length; x += 1) {
					const key = keyForPos(x, y);
					const current = prev[key] ?? 1;
					const playerTarget = getForestFogTargetOpacity(
						x,
						y,
						player.x,
						player.y,
					);
					let torchTarget = 1;
					for (const torch of torchSources) {
						const sourceTarget = getBaseFogTargetOpacityFromSource(
							x,
							y,
							torch.x,
							torch.y,
						);
						if (sourceTarget < torchTarget) torchTarget = sourceTarget;
					}
					const target = Math.min(playerTarget, torchTarget);
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
		caveObstacles,
	]);

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
				? 108 + randomRoll() * 12
				: randomRoll() * 108;
			const baseDuration = rainy
				? 44 + randomRoll() * 18
				: 52 + randomRoll() * 24;
			const durationSec = Math.max(
				10,
				baseDuration * ((startX + 14) / fullDistance),
			);
			return {
				id: nextCloudIdRef.current++,
				startX,
				y: 4 + randomRoll() * 60,
				size: rainy ? 1 + randomRoll() * 0.45 : 0.95 + randomRoll() * 0.35,
				durationSec,
				glyph: rainy ? GLYPH.rainCloud : GLYPH.cloud, // rainy cloud / cloud
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
				const minClouds = rainy ? 7 : 2;
				const maxClouds = rainy ? 10 : 3;
				if (prev.length < minClouds) {
					return [...prev, makeCloud(true)];
				}
				if (prev.length < maxClouds) {
					const spawnChance = rainy ? 0.42 : 0.28;
					if (randomRoll() < spawnChance) return [...prev, makeCloud(true)];
				}
				return prev;
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
		setUnlockFlags((prev) =>
			resolveUnlockFlags(
				{
					forestLevel,
					caveLevel,
				},
				prev,
			),
		);
	}, [forestLevel, caveLevel]);

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

	const getForestFogTargetOpacity = (
		x: number,
		y: number,
		playerX: number,
		playerY: number,
	) =>
		getFogTargetOpacity(
			{ x: playerX, y: playerY },
			x,
			y,
			playerEmoji,
			hasHeadlamp,
		);

	const getBaseFogTargetOpacityFromSource = (
		x: number,
		y: number,
		sourceX: number,
		sourceY: number,
	) => {
		const dist = Math.max(Math.abs(x - sourceX), Math.abs(y - sourceY));
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
		mapDoors.farm.some(
			(d) => d.x === x && d.y === y && d.target.map === "house",
		);

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

	const isPassableAt = (
		map: MapId,
		x: number,
		y: number,
		options?: { ignoreEnemyId?: number },
	) => {
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
			if (isForestOccupied(x, y, options?.ignoreEnemyId)) return false;
			return true;
		}
		if (map === "cave") {
			const tile = rows[y]?.[x] ?? "<";
			if (!isCaveWalkableTile(tile) || isCaveBlockedTile(tile)) return false;
			if (caveLadderPos && x === caveLadderPos.x && y === caveLadderPos.y) {
				return true;
			}
			if (isCaveOccupied(x, y, options?.ignoreEnemyId)) return false;
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
		if (
			map === "farm" &&
			x === farmNewspaperPos.x &&
			y === farmNewspaperPos.y
		)
			return false;
		if (map === "farm" && farmForestBlockers[keyForPos(x, y)]) return false;
		if (map === "farm" && farmCaveBlockers[keyForPos(x, y)]) return false;
		if (map === "farm" && petGraveObstacles[keyForPos(x, y)]) return false;
		if (map === "farm" && farmWeedObstacles[keyForPos(x, y)]) return false;
		if (map === "farm" && farmEggDrops[keyForPos(x, y)]) return false;
		if (
			map === "farm" &&
			headlampLetterVisible &&
			x === HEADLAMP_LETTER_POS.x &&
			y === HEADLAMP_LETTER_POS.y
		)
			return false;
		if (
			map === "town" &&
			beachBottlePos &&
			beachBottlePos.x === x &&
			beachBottlePos.y === y
		)
			return false;
		if (map === "town" && beachShellDrops[keyForPos(x, y)]) return false;
		if (map === animalsMap && farmEggDrops[keyForPos(x, y)]) return false;
		if (
			map === "bureaucracy_office" &&
			x === BUREAUCRACY_EXIT_POS.x &&
			y === BUREAUCRACY_EXIT_POS.y
		) {
			return true;
		}
		const tile = rows[y]?.[x] ?? "#";
		return isPassableChar(tile);
	};

	const canEnterForest = () => stamina > 0;
	const canEnterCave = () => stamina > 0;

	const applyForestDamage = (amount: number, _source: string) => {
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
				tileFxBusRef.current.api
					.actor("player")
					.toast("You got tired and woke up on your farm", 6000);
			}
			return next;
		});
	};
	const getPrioritizedChaseDirs = (
		fromX: number,
		fromY: number,
		targetX: number,
		targetY: number,
	) =>
		Object.values(npcMoveDirections)
			.map((delta) => {
				const nx = fromX + delta.dx;
				const ny = fromY + delta.dy;
				const distance = Math.max(
					Math.abs(targetX - nx),
					Math.abs(targetY - ny),
				);
				return { ...delta, distance };
			})
			.sort((a, b) => a.distance - b.distance);

	const maybeMoveForestEnemy = (
		enemy: ForestEnemy,
		isHalfTick: boolean,
	): ForestEnemy => {
		if (simulationPaused) return enemy;
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
				isPassableAt("forest", nx, ny, { ignoreEnemyId: enemy.id });
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
				const chaseDirs = getPrioritizedChaseDirs(
					enemy.x,
					enemy.y,
					playerNow.x,
					playerNow.y,
				);
				for (const delta of chaseDirs) {
					const nx = enemy.x + delta.dx;
					const ny = enemy.y + delta.dy;
					if (playerInForest && nx === playerNow.x && ny === playerNow.y) {
						playPooSound();
						applyForestDamage(10, "A hostile poop");
						return enemy;
					}
					if (!isPassableAt("forest", nx, ny, { ignoreEnemyId: enemy.id }))
						continue;
					return { ...enemy, x: nx, y: ny };
				}
				return enemy;
			}
			if (randomRoll() > 0.25) return enemy;
			const shuffled = Object.values(npcMoveDirections).sort(
				() => randomRoll() - 0.5,
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
				if (!isPassableAt("forest", nx, ny, { ignoreEnemyId: enemy.id }))
					continue;
				return { ...enemy, x: nx, y: ny };
			}
			return enemy;
		}

		// Bears aggro within a 7x7 around anchor, otherwise return to anchor.
		const playerInBearArea =
			playerInForest &&
			Math.max(
				Math.abs(playerNow.x - enemy.x),
				Math.abs(playerNow.y - enemy.y),
			) <= 6;
		const wasAggro = forestAggroRef.current[enemy.id] ?? false;
		if (playerInBearArea && !wasAggro) playBearSound();
		forestAggroRef.current[enemy.id] = playerInBearArea;
		const targetX = playerInBearArea ? playerNow.x : enemy.anchorX;
		const targetY = playerInBearArea ? playerNow.y : enemy.anchorY;
		if (enemy.x === targetX && enemy.y === targetY) return enemy;
		const candidates = getPrioritizedChaseDirs(
			enemy.x,
			enemy.y,
			targetX,
			targetY,
		);

		for (const delta of candidates) {
			const nx = enemy.x + delta.dx;
			const ny = enemy.y + delta.dy;
			if (playerInForest && nx === playerNow.x && ny === playerNow.y) {
				playBearSound();
				applyForestDamage(30, "A bear");
				return enemy;
			}
			if (!isPassableAt("forest", nx, ny, { ignoreEnemyId: enemy.id })) continue;
			return { ...enemy, x: nx, y: ny };
		}
		return enemy;
	};

	const maybeMoveCaveEnemy = (
		enemy: ForestEnemy,
		isHalfTick: boolean,
	): ForestEnemy => {
		if (simulationPaused) return enemy;
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
				isPassableAt("cave", nx, ny, { ignoreEnemyId: enemy.id });
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
			const tryVertical = (dir: -1 | 1): ForestEnemy | null => {
				const nx = enemy.x;
				const ny = enemy.y + dir;
				if (tryDamage(nx, ny)) return enemy;
				if (!canStep(nx, ny)) return null;
				state.vDir = dir;
				state.verticalMode = true;
				caveBatDirsRef.current[enemy.id] = state;
				if (wasWithinOneTile) {
					applyCaveDamage(20, "A bat");
				}
				return { ...enemy, x: nx, y: ny };
			};
			if (!state.verticalMode) {
				const firstTry = tryHorizontal(state.hDir);
				if (firstTry) return firstTry;
				const firstVertical = tryVertical(state.vDir);
				if (firstVertical) return firstVertical;
				const oppositeVertical = tryVertical((state.vDir * -1) as -1 | 1);
				if (oppositeVertical) return oppositeVertical;
				const opposite = (state.hDir * -1) as -1 | 1;
				const secondTry = tryHorizontal(opposite);
				if (secondTry) return secondTry;
				state.hDir = opposite;
				state.verticalMode = true;
				caveBatDirsRef.current[enemy.id] = state;
				return enemy;
			}
			const verticalNow = tryVertical(state.vDir);
			if (verticalNow) return verticalNow;
			const horizontalNow = tryHorizontal(state.hDir);
			if (horizontalNow) return horizontalNow;
			const horizontalOpposite = tryHorizontal((state.hDir * -1) as -1 | 1);
			if (horizontalOpposite) return horizontalOpposite;
			const verticalOpposite = tryVertical((state.vDir * -1) as -1 | 1);
			if (verticalOpposite) return verticalOpposite;
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
				const chaseDirs = getPrioritizedChaseDirs(
					enemy.x,
					enemy.y,
					playerNow.x,
					playerNow.y,
				);
				for (const delta of chaseDirs) {
					const nx = enemy.x + delta.dx;
					const ny = enemy.y + delta.dy;
					if (playerInCave && nx === playerNow.x && ny === playerNow.y) {
						playPooSound();
						applyCaveDamage(10, "A hostile poop");
						return enemy;
					}
					if (!isPassableAt("cave", nx, ny, { ignoreEnemyId: enemy.id }))
						continue;
					return { ...enemy, x: nx, y: ny };
				}
				return enemy;
			}
			if (randomRoll() > 0.25) return enemy;
			const shuffled = Object.values(npcMoveDirections).sort(
				() => randomRoll() - 0.5,
			);
			for (const delta of shuffled) {
				const nx = enemy.x + delta.dx;
				const ny = enemy.y + delta.dy;
				if (
					Math.max(Math.abs(nx - enemy.anchorX), Math.abs(ny - enemy.anchorY)) >
					3
				)
					continue;
				if (!isPassableAt("cave", nx, ny, { ignoreEnemyId: enemy.id })) continue;
				return { ...enemy, x: nx, y: ny };
			}
			return enemy;
		}

		const playerInBearArea =
			playerInCave &&
			Math.max(
				Math.abs(playerNow.x - enemy.x),
				Math.abs(playerNow.y - enemy.y),
			) <= 6;
		const wasAggro = caveAggroRef.current[enemy.id] ?? false;
		if (playerInBearArea && !wasAggro) playBearSound();
		caveAggroRef.current[enemy.id] = playerInBearArea;
		const targetX = playerInBearArea ? playerNow.x : enemy.anchorX;
		const targetY = playerInBearArea ? playerNow.y : enemy.anchorY;
		if (enemy.x === targetX && enemy.y === targetY) return enemy;
		const candidates = getPrioritizedChaseDirs(
			enemy.x,
			enemy.y,
			targetX,
			targetY,
		);
		for (const delta of candidates) {
			const nx = enemy.x + delta.dx;
			const ny = enemy.y + delta.dy;
			if (playerInCave && nx === playerNow.x && ny === playerNow.y) {
				playBearSound();
				applyCaveDamage(30, "A bear");
				return enemy;
			}
			if (!isPassableAt("cave", nx, ny, { ignoreEnemyId: enemy.id })) continue;
			return { ...enemy, x: nx, y: ny };
		}
		return enemy;
	};

	const maybeMoveNPC = (
		npcKey: string,
		nextNpcTiles: Record<string, { x: number; y: number }>,
	) => {
		if (simulationPaused) return;
		if (randomRoll() > 0.25) return;

		const current = nextNpcTiles[npcKey];
		const anchor = townNpcAnchors[npcKey];
		if (!anchor) return;
		const townRows = activeMapLayouts.town;
		const currentTile = current
			? (townRows[current.y]?.[current.x] ?? "#")
			: "#";
		const currentTileWalkable =
			currentTile !== "~" && currentTile !== "+" && isPassableChar(currentTile);
		if (!current || !currentTileWalkable) {
			nextNpcTiles[npcKey] = { ...anchor };
			return;
		}
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

	useEffect(() => {
		const townRows = activeMapLayouts.town;
		if (!townRows || townRows.length <= TOWN_NPC_GRASS_ROW_Y) return;
		const occupied = new Set<string>();
		const hasInvalidTownNpcTile = Object.keys(townNpcAnchors).some((npcKey) => {
			const pos = townNpcTiles[npcKey];
			if (!pos) return true;
			const tile = townRows[pos.y]?.[pos.x] ?? "#";
			if (tile === "~" || tile === "+") return true;
			if (!isPassableChar(tile)) return true;
			const key = keyForPos(pos.x, pos.y);
			if (occupied.has(key)) return true;
			occupied.add(key);
			return false;
		});
		if (!hasInvalidTownNpcTile) return;
		setTownNpcTiles({ ...townNpcAnchors });
	}, [activeMapLayouts, townNpcTiles, setTownNpcTiles]);

	const maybeMoveAnimal = (
		animalId: number,
		nextAnimalTiles: Record<number, { x: number; y: number }>,
	) => {
		if (simulationPaused) return;
		const moveRoll = randomRoll();
		if (moveRoll > 0.25) return;

		const current = nextAnimalTiles[animalId];
		const anchor = animalAnchors[animalId] ?? current;
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
		if (next) {
			nextAnimalTiles[animalId] = next;
		}
	};

	const maybeMoveBoat = (
		boatKey: keyof typeof boatNpcEmojis,
		nextBoatTiles: BoatTileMap,
	) => {
		if (simulationPaused) return;
		if (randomRoll() > 0.25) return;

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

	const toToastPhrase = (line: string): string => {
		const trimmed = line.trim();
		if (!trimmed) return "Update";
		const normalized = trimmed
			.replace(/^Cave Level \d+:\s*/i, "")
			.replace(/^Forest Level \d+:\s*/i, "")
			.replace(/\s+/g, " ")
			.replace(/[.!?]+$/g, "")
			.trim();
		const lower = normalized.toLowerCase();
		if (lower === "nothing to interact with") return "Nothing here";
		if (lower === "too tired") return "Too tired";
		if (lower.startsWith("not enough money")) return "Need money";
		if (lower.startsWith("not enough ")) {
			const parts = normalized.split(" ");
			return parts.length >= 3 ? `Need ${parts[2]}` : "Not enough";
		}
		if (lower.startsWith("entered ")) {
			const dest = normalized.slice("Entered ".length);
			return `Entered ${dest}`;
		}
		const words = normalized.split(" ").filter(Boolean);
		if (words.length <= 3) return normalized;
		return words.slice(0, 3).join(" ");
	};
	const toastAreaEntered = (target: { map: MapId; x: number; y: number }) => {
		const rows = activeMapLayouts[target.map] ?? [];
		const mapHeight = rows.length;
		const mapWidth = rows[0]?.length ?? 0;
		if (mapWidth <= 0 || mapHeight <= 0) return;
		const sideDistances = [
			{ side: "top" as const, dist: target.y },
			{ side: "bottom" as const, dist: mapHeight - 1 - target.y },
			{ side: "left" as const, dist: target.x },
			{ side: "right" as const, dist: mapWidth - 1 - target.x },
		];
		sideDistances.sort((a, b) => a.dist - b.dist);
		const nearestSide = sideDistances[0]?.side ?? "top";
		let anchorX = target.x;
		let anchorY = target.y;
		if (nearestSide === "top") anchorY += 1;
		else if (nearestSide === "bottom") anchorY -= 1;
		else if (nearestSide === "left") anchorX += 1;
		else anchorX -= 1;
		anchorX = Math.max(0, Math.min(mapWidth - 1, anchorX));
		anchorY = Math.max(0, Math.min(mapHeight - 1, anchorY));
		tileFxBusRef.current.api
			.at({ map: target.map, x: anchorX, y: anchorY })
			.toast(`Entered ${target.map}`);
	};
	const stopTts = () => {
		if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
		window.speechSynthesis.cancel();
	};
	const openNewspaperPopup = () => {
		setIsNewspaperPopupOpen(true);
		setNewspaperRead(true);
		speakNpcLine(newspaper);
	};
	const closeNewspaperPopup = () => {
		setIsNewspaperPopupOpen(false);
		stopTts();
	};
	useEffect(() => {
		if (!isNewspaperPopupOpen) return;
		if (player.map !== "farm" || !!dayTransition) {
			closeNewspaperPopup();
		}
	}, [isNewspaperPopupOpen, player.map, dayTransition]);
	const addLog = (line: string) => {
		const raw = line.trim();
		if (!raw) return;
		const forceFull = raw.startsWith("[full]");
		const content = forceFull ? raw.replace(/^\[full\]\s*/i, "") : raw;
		if (content.trim().toLowerCase() === "nothing to interact with") return;
		const phrase = forceFull ? content : toToastPhrase(content);
		if (phrase === "Nothing here") return;
		tileFxBusRef.current.api.actor("player").toast(phrase);
	};
	const dispatchWholeGameState = (nextState: GameState) => {
		const updates = nextState as Partial<{
			[K in keyof GameState]: SetStateAction<GameState[K]>;
		}>;
		dispatch({ type: "batch", updates });
	};
	const clearLoadTransientState = () => {
		clearFishingTimers();
		directorTimersRef.current.forEach((timer) => window.clearTimeout(timer));
		directorTimersRef.current = [];
		directorConfirmRef.current = null;
		directorRunningRef.current = false;
		setDirectorPopup(null);
		setDirectorInputLocked(false);
		setCloudOverlayVisible(true);
		setCameraTarget(null);
		setMapZoom(DEFAULT_MAP_ZOOM);
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
		if (savarioResponseTimeoutRef.current !== null) {
			window.clearTimeout(savarioResponseTimeoutRef.current);
			savarioResponseTimeoutRef.current = null;
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
		dayTransitionTimersRef.current.forEach((id) => window.clearTimeout(id));
		dayTransitionTimersRef.current = [];
		dayTransitionCloseTimersRef.current.forEach((id) =>
			window.clearTimeout(id),
		);
		dayTransitionCloseTimersRef.current = [];
		quantityParentMenuRef.current = null;
		quantityPromptRef.current = null;
		stopTractorLoop();
	};
	const saveGameToFile = () => {
		if (!canSaveGame) {
			setSaveLoadStatus(saveDisabledMessage);
			return;
		}
		try {
			const saveData = toSaveGameData(gameState);
			const json = serializeSaveGame(saveData);
			const blob = new Blob([json], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${randomSaveFilePrefix()}-${formatSaveTimestamp(new Date())}.json`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
			setSaveLoadStatus("Saved. File stamped and approved by Town Hall.");
		} catch {
			setSaveLoadStatus(
				"Save failed. The clipboard goblin dropped your paperwork.",
			);
		}
	};
	const applyLoadedGameState = (rawState: GameState) => {
		const regeneratedForest = generateForestState({
			level: Math.max(1, rawState.forestLevel),
			entranceSide: "left",
			entranceCoord: FOREST_GATE_Y,
			lastTurn: rawState.forestLastTurn,
		});
		const regeneratedCave = generateCaveState({
			level: Math.max(1, rawState.caveLevel),
			entranceSide: "right",
			entranceCoord: CAVE_GATE_Y,
		});
		const nextState: GameState = {
			...rawState,
			headlampLetterRead:
				(rawState as Partial<GameState>).headlampLetterRead ?? false,
			hasAutoCollector:
				(rawState as Partial<GameState>).hasAutoCollector ?? false,
			pendingAutoCollectorInstall:
				(rawState as Partial<GameState>).pendingAutoCollectorInstall ?? false,
			newspaperImage:
				(rawState as Partial<GameState>).newspaperImage ??
				generateNewspaperEmojiPicture(rawState.newspaper ?? ""),
			newspaperRead:
				(rawState as Partial<GameState>).newspaperRead ?? false,
			unlockFlags: resolveUnlockFlags(
				{
					forestLevel: rawState.forestLevel,
					caveLevel: rawState.caveLevel,
				},
				{
					...createInitialUnlockFlags(),
					...(rawState as Partial<GameState>).unlockFlags,
				},
			),
			player: { ...BUREAUCRACY_SPAWN },
			forestLayout: regeneratedForest.layout,
			forestEnemies: regeneratedForest.enemies,
			forestObstacles: regeneratedForest.obstacles,
			forestChest: regeneratedForest.chest,
			forestBonusChests: regeneratedForest.bonusChests,
			forestLevel: regeneratedForest.level,
			forestEntranceDoorPos: regeneratedForest.entranceDoor,
			forestForwardExitPos: regeneratedForest.exitDoor,
			forestExitSide: regeneratedForest.exitSide,
			forestLastTurn: regeneratedForest.turnSign,
			forestIsBonusLevel: regeneratedForest.isBonusLevel,
			forestFog: {},
			caveLayout: regeneratedCave.layout,
			caveRubble: buildCaveRubble(regeneratedCave.layout),
			caveEnemies: regeneratedCave.enemies,
			caveObstacles: regeneratedCave.obstacles,
			caveBonusChest: regeneratedCave.bonusChest,
			caveIsBonusLevel: regeneratedCave.isBonusLevel,
			caveLevel: regeneratedCave.level,
			caveEntranceDoorPos: regeneratedCave.entranceDoor,
			caveLevelOneExitPos: regeneratedCave.levelOneExitInside,
			caveLadderPos: regeneratedCave.ladderPos,
			caveStartingRockCount: regeneratedCave.startingRockCount,
			caveFog: {},
			modal: null,
			modalIndex: 0,
			quantityPrompt: null,
			fishing: null,
			isOrdering: false,
			isDoctorCompounding: false,
			pauseGame: false,
			dayTransition: null,
			dayTransitionStage: "intro",
			dayTransitionClosePhase: "idle",
			showForestHit: false,
		};
		clearLoadTransientState();
		playerRef.current = nextState.player;
		forestSnakeDirsRef.current = makeSnakeDirections(nextState.forestEnemies);
		forestAggroRef.current = {};
		forestEnemyTickRef.current = 0;
		caveBatDirsRef.current = makeSnakeDirections(nextState.caveEnemies);
		caveAggroRef.current = {};
		caveEnemyTickRef.current = 0;
		savarioLineIndexRef.current = 0;
		dispatchWholeGameState(nextState);
		switchAreaMusic(getAreaMusicForMap(nextState.player.map), true);
		addLog("Loaded save");
		setSaveLoadStatus("Loaded. Report to Savario before returning to farm.");
		setIsSaveLoadMenuOpen(false);
	};
	const loadGameFromFilePicker = () => {
		const picker = document.createElement("input");
		picker.type = "file";
		picker.accept = ".json,application/json";
		picker.onchange = () => {
			const file = picker.files?.[0];
			if (!file) return;
			void file
				.text()
				.then((text) => {
					const parsedSave = parseSaveGame(text);
					if (!parsedSave) {
						setSaveLoadStatus(
							"Could not load that file. Wrong version or scrambled JSON.",
						);
						return;
					}
					const loadedState = fromSaveGameData(parsedSave);
					applyLoadedGameState(loadedState);
				})
				.catch(() => {
					setSaveLoadStatus(
						"Load failed. That file reads like cursed confetti.",
					);
				});
		};
		picker.click();
	};
	const toggleSaveLoadMenu = () => {
		setIsSaveLoadMenuOpen((prev) => {
			const next = !prev;
			if (next) setSaveLoadStatus(null);
			return next;
		});
	};
	const closeSaveLoadMenu = () => {
		setIsSaveLoadMenuOpen(false);
	};
	useEffect(() => {
		if (!bootSaveJson) return;
		if (bootSaveHandledRef.current) return;
		bootSaveHandledRef.current = true;
		const parsedSave = parseSaveGame(bootSaveJson);
		if (!parsedSave) {
			setSaveLoadStatus(
				"Could not load that file. Wrong version or scrambled JSON.",
			);
			return;
		}
		const loadedState = fromSaveGameData(parsedSave);
		applyLoadedGameState(loadedState);
	}, [bootSaveJson]);
	const applyCaveDamage = (amount: number, _source: string) => {
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
				tileFxBusRef.current.api
					.actor("player")
					.toast("You got tired and woke up on your farm", 6000);
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
		setCaveBonusChest(nextCave.bonusChest);
		setCaveIsBonusLevel(nextCave.isBonusLevel);
		setCaveLevel(nextCave.level);
		setCaveEntranceDoorPos(nextCave.entranceDoor);
		setCaveLevelOneExitPos(nextCave.levelOneExitInside);
		setCaveLadderPos(nextCave.ladderPos);
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
				if (
					playerRef.current.map === "farm" &&
					playerRef.current.x === x &&
					playerRef.current.y === y
				)
					continue;
				if (Object.values(animalTiles).some((p) => p.x === x && p.y === y))
					continue;
				candidates.push({ x, y });
			}
		}
		if (candidates.length === 0) return null;
		return candidates[randomInt(0, candidates.length - 1)] ?? null;
	};

	const maybeMovePet = (current: Point) => {
		if (simulationPaused) return current;
		if (randomRoll() > 0.25) return current;
		let attempts = 0;
		while (attempts < 128) {
			attempts += 1;
			const dir = randomInt(1, 8);
			const delta = npcMoveDirections[dir];
			if (!delta) continue;
			const nx = current.x + delta.dx;
			const ny = current.y + delta.dy;
			if (!isPetWalkableFarmTile(nx, ny)) continue;
			if (Object.values(animalTiles).some((p) => p.x === nx && p.y === ny))
				continue;
			const p = playerRef.current;
			if (p.map === "farm" && p.x === nx && p.y === ny) continue;
			return { x: nx, y: ny };
		}
		return current;
	};
	const worldSimSnapshot: GameStateSnapshot = {
		player,
		day,
		map: player.map,
	};
	const simulationPaused =
		pauseGame || isSaveLoadMenuOpen || !!modal || directorInputLocked;
	const gameActions: GameStateActions = {
		setTownNpcTiles,
		setBoatTiles,
		setAnimalTiles,
		setPetTile,
		setPetFacing,
		setForestEnemies,
		setCaveEnemies,
		dispatchBatch,
	};
	useWorldSimulation({
		...worldSimSnapshot,
		...gameActions,
		animals,
		pauseGame: simulationPaused,
		playerRef,
		townNpcTiles,
		boatTiles,
		animalTiles,
		petTile,
		petFacing,
		forestChest,
		forestObstacles,
		forestBonusChests,
		caveObstacles,
		caveLadderPos,
		activeMapLayouts,
		maybeMoveNPC,
		maybeMoveBoat: (boatKey, nextTiles) =>
			maybeMoveBoat(boatKey as keyof typeof boatNpcEmojis, nextTiles),
		maybeMoveAnimal,
		maybeMovePet,
		maybeMoveForestEnemy,
		maybeMoveCaveEnemy,
		forestEnemyTickRef,
		caveEnemyTickRef,
		townNpcNames,
		boatNpcKeys: Object.keys(boatNpcEmojis) as Array<
			keyof typeof boatNpcEmojis
		>,
		farmEggDrops,
		farmForestBlockers,
		farmCaveBlockers,
		petGraveObstacles,
		farmWeedObstacles,
		plots,
		starterChestOpened,
		petVendorActive,
		ownedPet,
	});
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
		if (nextCave.isBonusLevel) {
			switchAreaMusic(bureaucracyMusicRef.current, true);
			addLog(`You found a quiet bonus cavern (Depth ${nextLevel}).`);
		} else {
			switchAreaMusic(caveMusicRef.current, true);
			addLog(`You descend deeper into the cave (Depth ${nextLevel}).`);
		}
		if (fromMenu) closeMenu();
	};
	const openForestExitMenu = () => {
		openMenu(
			"Forest Exit",
			["Go back to farm?"],
			[
				{
					label: "Keep exploring",
					onSelect: () => continueForestDungeon(true),
				},
				{
					label: "Go back to farm",
					onSelect: () => {
						setForestLockedToday(true);
						setPlayer({ map: "farm", x: FARM_WIDTH - 2, y: FOREST_GATE_Y });
						addLog("Returned to farm.");
						closeMenu();
					},
				},
			],
		);
	};
	const openCaveExitMenu = () => {
		openMenu(
			"Cave Exit",
			["Leave cave and return to farm?"],
			[
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
			],
		);
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
					)) ||
				(!!petTile && petTile.x === x && petTile.y === y) ||
				(hasTractor &&
					tractorParked &&
					x === TRACTOR_PARK_POS.x &&
					y === TRACTOR_PARK_POS.y)
			);
		}
		if (map === "barn") {
			return (
				animalsMap === "barn" &&
				(Object.values(animalTiles).some((pos) => pos.x === x && pos.y === y) ||
					(hasAutoCollector &&
						!!barnAutoCollectorPos &&
						barnAutoCollectorPos.x === x &&
						barnAutoCollectorPos.y === y))
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
				if (randomRoll() < 0.5) {
					updateInventory("feed", 1);
				}
				if (randomRoll() < 0.02) {
					applyMoneyDelta(randomInt(1, 5));
				}
			}
			const baseTile = activeMapLayouts.farm[y]?.[x];
			setPlots((prev) => {
				if (baseTile !== "," || prev[key]) return prev;
				return {
					...prev,
					[key]: { crop: null, growthDays: 0, watered: false },
				};
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
				[key]: {
					crop: cropId,
					growthDays: 0,
					watered: currentWeather === "rainy",
				},
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
				const gotFeed = randomRoll() < 0.5;
				const gotMoney = randomRoll() < 0.02;
				const lines: string[] = [];
				if (gotFeed) {
					updateInventory("feed", 1);
				}
				if (gotMoney) {
					const amount = randomInt(1, 5);
					applyMoneyDelta(amount);
					lines.push(`Found $${amount}.`);
				}
				if (lines.length > 0) addLog(lines.join(" "));
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

	const enterTractor = (
		implement: TractorImplement,
		seedItem: ItemId | null = null,
	) => {
		setTractorDriverEmoji(playerEmoji);
		setPlayerEmoji(GLYPH.tractor); // tractor driving avatar
		setIsDrivingTractor(true);
		setTractorImplement(implement);
		setTractorImplementOn(false);
		setTractorSeedItem(seedItem);
		setTractorParked(false);
		setPlayer({ map: "farm", x: TRACTOR_PARK_POS.x, y: TRACTOR_PARK_POS.y });
		addLog(`Driving tractor with ${implement} implement.`);
	};

	const movePlayer = (dir: Dir) => {
		const now = performance.now();
		if (now < playerMoveUnlockAtRef.current) return;
		let didMove = false;
		const setPlayerTracked: typeof setPlayer = (value) => {
			setPlayer((prev) => {
				const next =
					typeof value === "function"
						? (value as (prevState: typeof prev) => typeof prev)(prev)
						: value;
				if (next.map !== prev.map || next.x !== prev.x || next.y !== prev.y) {
					didMove = true;
				}
				return next;
			});
		};
		runMovePlayer(
			{
				modal,
				isOrdering,
				isDoctorCompounding,
				dirDelta,
				player,
				height,
				width,
				isDrivingTractor,
				mapDoors,
				addLog,
				farmWeedObstacles,
				keyForPos,
				tractorImplement,
				tractorImplementOn,
				isPassableAt,
				canLeapfrogBarnAnimalAt: (map, x, y) => {
					if (map !== animalsMap) return false;
					const tileEntry = Object.entries(animalTiles).find(
						([, pos]) => pos.x === x && pos.y === y,
					);
					if (!tileEntry) return false;
					const animalId = Number(tileEntry[0]);
					const animal = animals.find((a) => a.id === animalId);
					if (!animal) return false;
					return (
						animal.type === "cow" ||
						animal.type === "chicken" ||
						animal.type === "sheep"
					);
				},
				onLeapfrog: () => {
					playNotification();
					tileFxBusRef.current.api.actor("player").jump(POSITION_ANIMATION_MS);
				},
				handleBlockedStep: (map, x, y) => {
					if (map !== "cave") return false;
					const obstacle = caveObstacleAt(x, y);
					if (!obstacle || obstacle.type !== "torch") return false;
					applyCaveDamage(10, "A torch");
					return true;
				},
				ownedPet,
				petTile,
				isOccupied,
				playHoe,
				petRunoverBadTimeoutRef,
				playBad,
				setOwnedPet,
				setPendingPet,
				setPetTile,
				setPetHeartTile,
				setPendingPetGravePos,
				setPetVendorActive,
				setTractorFacing,
				pendingPetGravePos,
				setPetGraveObstacles,
				setPlayer: setPlayerTracked,
				applyTractorImplementAt,
				TRACTOR_PARK_POS,
				exitTractor,
				forestEntranceDoorPos,
				openForestExitMenu,
				forestForwardExitPos,
				continueForestDungeon,
				caveEntranceDoorPos,
				openCaveExitMenu,
				caveLadderPos,
				continueCaveDungeon,
				forestLockedToday,
				canEnterForest,
				caveLockedToday,
				canEnterCave,
				playNotification,
				toastAreaEntered,
			},
			dir,
		);
		if (didMove) {
			playerMoveUnlockAtRef.current = now + POSITION_ANIMATION_MS;
		}
	};
	const clearHeldMove = () => {
		heldMoveDirRef.current = null;
		heldMoveKeyRef.current = null;
		if (heldMoveTimerRef.current !== null) {
			window.clearTimeout(heldMoveTimerRef.current);
			heldMoveTimerRef.current = null;
		}
	};

	const scheduleHeldMoveStep = () => {
		if (heldMoveTimerRef.current !== null) return;
		const tick = () => {
			heldMoveTimerRef.current = null;
			const dir = heldMoveDirRef.current;
			if (!dir) return;
			dispatchHeldMoveCommandRef.current(dir);
			heldMoveTimerRef.current = window.setTimeout(tick, POSITION_ANIMATION_MS);
		};
		heldMoveTimerRef.current = window.setTimeout(tick, POSITION_ANIMATION_MS);
	};

	const updateInventory = (item: ItemId, amount: number) => {
		updateInventoryState(setInventory, item, amount);
		if (amount > 0) {
			const icon = itemIcons[item] ?? "";
			tileFxBusRef.current.api.actor("player").toast(`+${amount} ${icon}`.trim());
		}
	};

	const applyMoneyDelta = (delta: number) => {
		applyMoneyDeltaState(setMoney, setCurrentDayEarned, setTotalEarned, delta);
		if (delta > 0) {
			tileFxBusRef.current.api.actor("player").toast(`+$${delta}`);
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
		});
	};

	const interactBuilderVendor = () => {
		interactBuilderVendorMenu({
			barnTier,
			pendingBarnUpgrade,
			hasAutoCollector,
			pendingAutoCollectorInstall,
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
			setPendingAutoCollectorInstall,
		});
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

	const { startDoctorMedicine, startCafeOrder } = createServiceOrderActions({
		stopAreaFade,
		currentAreaMusicRef,
		cafeOrderMusicRef,
		closeMenu,
		playerRef,
		getAreaMusicForMap,
		switchAreaMusic,
		randomInt,
		speakNpcLine,
		addLog,
		playMunch,
		playGotReward,
		setDoctorUsedToday,
		setIsDoctorCompounding,
		setPauseGame,
		setDoctorObservation,
		setStaminaMax,
		setStamina,
		setIsOrdering,
		setCafeObservation,
		staminaMax,
		orderMidTimeoutRef,
		orderCompleteTimeoutRef,
		orderRewardTimeoutRef,
		cafeObservationIntervalRef,
		doctorProcessTimeoutRef,
		doctorRewardTimeoutRef,
		doctorObservationIntervalRef,
	});

	const countOpenBarnTiles = (
		occupied: Record<number, { x: number; y: number }>,
	) => {
		const rows = activeMapLayouts[animalsMap];
		return countOpenBarnTilesInBounds({
			occupied,
			rows,
			bounds: barnInteriorBounds,
			isPassableChar,
		});
	};

	const nextOpenBarnTile = (
		occupied: Record<number, { x: number; y: number }>,
	) => {
		const rows = activeMapLayouts[animalsMap];
		const scanFromBottom = isBarnExternal(barnTier);
		return nextOpenBarnTileInBounds({
			occupied,
			rows,
			bounds: barnInteriorBounds,
			isPassableChar,
			scanFromBottom,
		});
	};

	useEffect(() => {
		if (animals.length <= 0) return;
		const rows = activeMapLayouts[animalsMap];
		const hasDuplicateIds =
			new Set(animals.map((a) => a.id)).size !== animals.length;
		const occupiedKeys = new Set<string>();
		let hasOverlappingTiles = false;
		let hasMissingTile = false;
		let hasMissingAnchor = false;
		animals.forEach((animal) => {
			const pos = animalTiles[animal.id];
			if (!pos) {
				hasMissingTile = true;
				return;
			}
			const key = keyForPos(pos.x, pos.y);
			if (occupiedKeys.has(key)) {
				hasOverlappingTiles = true;
				return;
			}
			occupiedKeys.add(key);
			if (!animalAnchors[animal.id]) hasMissingAnchor = true;
		});
		if (
			!hasDuplicateIds &&
			!hasOverlappingTiles &&
			!hasMissingTile &&
			!hasMissingAnchor
		)
			return;

		const usedIds = new Set<number>();
		let nextId = Math.max(0, ...animals.map((a) => a.id)) + 1;
		const nextAnimals: Animal[] = [];
		const nextTiles: Record<number, Point> = {};
		const nextAnchors: Record<number, Point> = {};
		animals.forEach((animal) => {
			let normalizedId = animal.id;
			if (usedIds.has(normalizedId)) {
				normalizedId = nextId;
				nextId += 1;
			}
			usedIds.add(normalizedId);
			const normalizedAnimal =
				normalizedId === animal.id ? animal : { ...animal, id: normalizedId };
			nextAnimals.push(normalizedAnimal);

			const preferred =
				animalTiles[animal.id] ?? animalAnchors[animal.id] ?? null;
			let chosen: Point | null = null;
			if (preferred) {
				const withinBounds =
					preferred.x >= barnInteriorBounds.minX &&
					preferred.x <= barnInteriorBounds.maxX &&
					preferred.y >= barnInteriorBounds.minY &&
					preferred.y <= barnInteriorBounds.maxY;
				const passable = isPassableChar(
					rows[preferred.y]?.[preferred.x] ?? "#",
				);
				const used = Object.values(nextTiles).some(
					(pos) => pos.x === preferred.x && pos.y === preferred.y,
				);
				if (withinBounds && passable && !used) {
					chosen = preferred;
				}
			}
			if (!chosen) {
				const scanFromBottom = isBarnExternal(barnTier);
				chosen = nextOpenBarnTileInBounds({
					occupied: nextTiles,
					rows,
					bounds: barnInteriorBounds,
					isPassableChar,
					scanFromBottom,
				});
			}
			if (!chosen && preferred) chosen = preferred;
			if (!chosen)
				chosen = { x: barnInteriorBounds.minX, y: barnInteriorBounds.minY };
			nextTiles[normalizedId] = chosen;
			nextAnchors[normalizedId] = chosen;
		});

		setAnimals(nextAnimals);
		setAnimalTiles(nextTiles);
		setAnimalAnchors(nextAnchors);
	}, [
		animals,
		animalTiles,
		animalAnchors,
		animalsMap,
		barnInteriorBounds,
		activeMapLayouts,
	]);

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
		const currentAnimals = animalsRef.current;
		const currentTiles = animalTilesRef.current;
		const currentAnchors = animalAnchorsRef.current;
		const spawn = nextOpenBarnTile(currentTiles);
		if (!spawn) return false;
		const nextId = Math.max(0, ...currentAnimals.map((a) => a.id)) + 1;
		const nextAnimals = [
			...currentAnimals,
			{
				id: nextId,
				type,
				fedToday: false,
				canProduceToday: false,
				hasProductReady: false,
			},
		];
		const nextTiles = { ...currentTiles, [nextId]: spawn };
		const nextAnchors = { ...currentAnchors, [nextId]: spawn };
		animalsRef.current = nextAnimals;
		animalTilesRef.current = nextTiles;
		animalAnchorsRef.current = nextAnchors;
		setAnimals(nextAnimals);
		setAnimalTiles(nextTiles);
		setAnimalAnchors(nextAnchors);
		return true;
	};

	const resolveUpgradeSceneMessage = (kind: UpgradeSceneEventKind): string => {
		if (kind === "pet_arrived") return "You got a new pet!";
		if (kind === "barn_upgraded") return "Your barn was upgraded!";
		if (kind === "auto_collector_installed")
			return "The auto milker/shearer/egg collector has been installed in your barn!";
		return "Your tractor was delivered!";
	};

	const resolveUpgradeSceneFocus = (
		kind: UpgradeSceneEventKind,
	): { x: number; y: number } => {
		if (kind === "barn_upgraded") {
			const barnRect = getFarmBarnOuterRect(barnTier);
			return {
				x: Math.floor(barnRect.x + barnRect.w / 2),
				y: Math.floor(barnRect.y + barnRect.h / 2),
			};
		}
		if (kind === "auto_collector_installed") {
			const barnRect = getFarmBarnOuterRect(barnTier);
			return {
				x: Math.floor(barnRect.x + barnRect.w / 2),
				y: Math.floor(barnRect.y + barnRect.h / 2),
			};
		}
		if (kind === "tractor_delivered") return { ...TRACTOR_PARK_POS };
		if (petTile) return petTile;
		const spawn = randomFarmPetSpawn();
		if (spawn) {
			setPetTile(spawn);
			return spawn;
		}
		return { x: 6, y: 10 };
	};

	const resolveDirectorTrack = (
		bgTrack: UpgradeSceneBgTrack | undefined,
	): HTMLAudioElement | null => {
		const track = bgTrack ?? "space_store";
		if (track === "space_store") return cafeOrderMusicRef.current;
		if (track === "space_bg") return bureaucracyMusicRef.current;
		return getAreaMusicForMap(playerRef.current.map);
	};

	const clampDirectorZoom = (zoom: number | undefined): number => {
		const chosen = zoom ?? DIRECTOR_DEFAULT_FOCUS_ZOOM;
		return Math.max(1, Math.min(2.5, Math.round(chosen * 100) / 100));
	};

	const buildUpgradeSceneChain = (events: UpgradeSceneEvent[]) =>
		events.map((event) => ({
			id: event.id,
			message: resolveUpgradeSceneMessage(event.kind),
			focus: resolveUpgradeSceneFocus(event.kind),
			zoom: clampDirectorZoom(event.cameraZoom),
			track: resolveDirectorTrack(event.bgTrack),
		}));

	const waitDirector = (durationMs: number) =>
		new Promise<void>((resolve) => {
			const timer = window.setTimeout(() => {
				directorTimersRef.current = directorTimersRef.current.filter(
					(t) => t !== timer,
				);
				resolve();
			}, durationMs);
			directorTimersRef.current.push(timer);
		});

	const awaitDirectorPopupConfirm = (message: string) =>
		new Promise<void>((resolve) => {
			directorConfirmRef.current = () => {
				directorConfirmRef.current = null;
				setDirectorPopup(null);
				resolve();
			};
			setDirectorPopup({ message });
		});

	const confirmDirectorPopup = () => {
		directorConfirmRef.current?.();
	};

	const nextDay = () => {
		runNextDayEngine({
			endFishing,
			day,
			currentDayEarned,
			totalEarned,
			staminaMax,
			stopAreaFade,
			currentAreaMusicRef,
			endOfDayRef,
			setPauseGame,
			setDayTransitionPrompt,
			setDayTransition,
			setPreviousDayEarned,
			setCurrentDayEarned,
			setStamina,
			setDay,
			setCurrentWeather,
			setForestLockedToday,
			setCaveLockedToday,
			townBeachBottleTiles,
			randomInt,
			keyForPos,
			setBeachBottlePos,
			setBeachShellDrops,
			townNpcNames,
			setNpcDailyAssignments,
			setNpcTalkedToday,
			FOREST_GATE_Y,
			CAVE_GATE_Y,
			applyForestRoom,
			applyCaveRoom,
			setFarmWeedObstacles,
			setFarmForestBlockers,
			setFarmCaveBlockers,
			setPetGraveObstacles,
			farmForestBlockers,
			farmCaveBlockers,
			plots,
			STARTER_CHEST_POS,
			setPlots,
			animals,
			animalTiles,
			getEggDropNearChicken,
			setFarmEggDrops,
			addLog,
			setAnimals,
			pendingBarnUpgrade,
			barnTier,
			BARN_MAX_TIER,
			BARN_TIER_NAMES,
			setBarnTier,
			setPendingBarnUpgrade,
			hasAutoCollector,
			pendingAutoCollectorInstall,
			setHasAutoCollector,
			setPendingAutoCollectorInstall,
			isBarnExternal,
			buildBarnLayout,
			getBarnAnimalCap,
			placeAnimalsInBounds,
			setAnimalTiles,
			setAnimalAnchors,
			pendingTractorDelivery,
			setHasTractor,
			setTractorParked,
			setPendingTractorDelivery,
			pendingPet,
			ownedPet,
			setOwnedPet,
			setPendingPet,
			prices,
			initialPrices,
			initialPriceTrends,
			priceItems,
			setPrices,
			setPriceTrends,
			generateSketchyMerchantStock,
			generateTraderTrades,
			setSketchyMerchantActive,
			setSketchyMerchantStock,
			setTraderActive,
			setTraderTrades,
			setDoctorVendorActive,
			setDoctorUsedToday,
			setPetVendorActive,
			itemNames,
			setNewspaper,
			setNewspaperImage,
			setNewspaperRead,
			queueUpgradeScene: (event) => {
				setPendingUpgradeScenes((prev) => [...prev, event]);
			},
		});
	};

	const finalizeAfterSleep = () => {
		setDayTransition(null);
		setDayTransitionClosePhase("idle");
		setPauseGame(false);
	};

	const continueAfterSleep = () => {
		continueAfterSleepEngine({
			dayTransition,
			dayTransitionClosePhase,
			crossFadeEndOfDayTo,
			houseMusicRef,
			setDayTransitionClosePhase,
			finalizeAfterSleep,
			dayTransitionCloseTimersRef,
		});
	};

	useEffect(() => {
		return startDayTransitionSequence({
			dayTransition,
			dayTransitionCloseTimersRef,
			dayTransitionTimersRef,
			setDayTransitionStage,
			setDayTransitionClosePhase,
			setDayTransitionStarsState,
		});
	}, [dayTransition]);

	useEffect(() => {
		playDayTransitionEarnedSfx({
			dayTransition,
			dayTransitionStage,
			playChaChing,
			playBad,
		});
	}, [dayTransition, dayTransitionStage]);

	useEffect(() => {
		if (player.map !== "farm") return;
		if (pendingUpgradeScenes.length === 0) return;
		if (dayTransition || modal || isSaveLoadMenuOpen) return;
		if (directorRunningRef.current) return;

		directorRunningRef.current = true;
		let cancelled = false;
		void (async () => {
			setPauseGame(true);
			setDirectorInputLocked(true);
			setCloudOverlayVisible(false);
			const sceneChain = buildUpgradeSceneChain(pendingUpgradeScenes);
			let lastDirectorTrack: HTMLAudioElement | null = null;
			const stopAllAreaTracksExcept = (keep: HTMLAudioElement | null) => {
				const tracks = [
					farmMusicRef.current,
					townMusicRef.current,
					houseMusicRef.current,
					forestMusicRef.current,
					caveMusicRef.current,
					bureaucracyMusicRef.current,
					cafeOrderMusicRef.current,
					endOfDayRef.current,
					beachAmbienceRef.current,
				];
				tracks.forEach((track) => {
					if (!track || track === keep) return;
					track.pause();
					track.currentTime = 0;
				});
			};
			for (const scene of sceneChain) {
				if (cancelled) return;
				if (scene.track !== lastDirectorTrack) {
					stopAllAreaTracksExcept(scene.track);
					switchAreaMusic(scene.track, true);
					lastDirectorTrack = scene.track;
				}
				setMapZoom(scene.zoom);
				setCameraTarget({
					map: "farm",
					x: scene.focus.x,
					y: scene.focus.y,
					smooth: true,
					durationMs: DIRECTOR_NAV_DURATION_MS,
				});
				await waitDirector(DIRECTOR_NAV_DURATION_MS);
				if (cancelled) return;
				await awaitDirectorPopupConfirm(scene.message);
				if (cancelled) return;
			}
			const playerNow = playerRef.current;
			setMapZoom(DEFAULT_MAP_ZOOM);
			setCameraTarget({
				map: playerNow.map,
				x: playerNow.x,
				y: playerNow.y,
				smooth: true,
				durationMs: DIRECTOR_RETURN_DURATION_MS,
			});
			await waitDirector(DIRECTOR_RETURN_DURATION_MS);
			if (cancelled) return;
			await waitDirector(DIRECTOR_RETURN_SETTLE_MS);
			if (cancelled) return;
			setCameraTarget(null);
			switchAreaMusic(getAreaMusicForMap(playerRef.current.map), true);
			setPendingUpgradeScenes([]);
			setDirectorPopup(null);
			setDirectorInputLocked(false);
			setCloudOverlayVisible(true);
			setPauseGame(false);
			directorRunningRef.current = false;
		})().catch(() => {
			setDirectorPopup(null);
			setDirectorInputLocked(false);
			setCloudOverlayVisible(true);
			setCameraTarget(null);
			setMapZoom(DEFAULT_MAP_ZOOM);
			setPauseGame(false);
			directorRunningRef.current = false;
		});

		return () => {
			cancelled = true;
			setCloudOverlayVisible(true);
		};
	}, [
		player.map,
		pendingUpgradeScenes,
		dayTransition,
		modal,
		isSaveLoadMenuOpen,
		barnTier,
	]);

	const stopBathing = (line?: string) => {
		if (!isBathing) return;
		setIsBathing(false);
		if (line) addLog(line);
	};

	useBathingRecovery({
		isBathing,
		stamina,
		staminaMax,
		setStamina,
		stopBathing,
	});

	const openRewardPopup = (line: string) => {
		openRewardPopupEngine({
			line,
			playGotReward,
			addLog,
			openMenu,
			closeMenu,
		});
	};

	const grantBonusChestRewardSet = (
		types: Array<"food" | "money" | "seeds" | "iron">,
		foodMode: "all" | "coffeeOnly" = "all",
	): string => {
		return grantBonusChestRewardSetEngine(
			{
				randomInt,
				applyMoneyDelta,
				updateInventory,
				setStamina,
				staminaMax,
			},
			types,
			foodMode,
		);
	};

	const openHighValueForestChestReward = () => {
		openHighValueForestChestRewardEngine({
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

	const openCaveBonusChestReward = () => {
		openCaveBonusChestRewardEngine({
			updateInventory,
			openRewardPopup,
		});
	};

	const interact = (dir: Dir) => {
		const delta = dirDelta[dir];
		const tx = player.x + delta.dx;
		const ty = player.y + delta.dy;
		if (
			player.map === "farm" &&
			headlampLetterVisible &&
			tx === HEADLAMP_LETTER_POS.x &&
			ty === HEADLAMP_LETTER_POS.y
		) {
			setHeadlampLetterRead(true);
			openMenu(
				"Letter",
				[
					"Hey I heard youve been heading deep into some dark places recently. So I decided to start stocking headlamps in the tool shop! Come on by and check it out!",
				],
				[
					{
						label: "Close",
						info: ["Put the letter away."],
						onSelect: closeMenu,
					},
				],
			);
			return;
		}
		if (player.map === "bureaucracy_office") {
			const targetCell = activeMapLayouts.bureaucracy_office?.[ty]?.[tx] ?? "";
			if (
				(tx === BUREAUCRACY_SAVARIO_POS.x &&
					ty === BUREAUCRACY_SAVARIO_POS.y) ||
				targetCell === "x"
			) {
				const line =
					savarioLines[savarioLineIndexRef.current % savarioLines.length]!;
				savarioLineIndexRef.current += 1;
				playSigh();
				if (savarioResponseTimeoutRef.current !== null) {
					window.clearTimeout(savarioResponseTimeoutRef.current);
				}
				savarioResponseTimeoutRef.current = window.setTimeout(() => {
					savarioResponseTimeoutRef.current = null;
					speakNpcLine(line);
					tileFxBusRef.current.api
						.at({
							map: "bureaucracy_office",
							x: BUREAUCRACY_SAVARIO_POS.x,
							y: BUREAUCRACY_SAVARIO_POS.y,
						})
						.toast(line, 6000);
				}, 3000);
				return;
			}
		}
		const interactCtx: PlayerInteractContext = {
			modal,
			fishing,
			isOrdering,
			isDoctorCompounding,
			isDrivingTractor,
			dirDelta,
			player,
			activeMapLayouts,
			farmNewspaperPos,
			openNewspaperPopup,
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
			toastAreaEntered,
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
			playSnakeSound,
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
			caveBonusChest,
			setCaveBonusChest,
			caveIsBonusLevel,
			openCaveBonusChestReward,
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
			handleLateInteractionBlocks,
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
			hasAutoCollector,
			barnAutoCollectorPos,
			isCowLikeAnimal,
			rollLivestockYield,
			setAnimals,
			generateOverfedAnimalLine,
			interactBuilderVendor,
			interactVendor,
			vendorByShopMap,
			isShopMap,
			shopDecorByMap,
			isFarmHouseDoorTile,
			getDoorGroundClass,
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
			tileFx: tileFxBusRef.current.api,
		};
		runInteract(interactCtx, dir);
	};

	const moveModal = (dir: Dir) => {
		moveModalCursor(modal, dir, setModalIndex);
	};

	const zoomIn = () => {
		setMapZoom((prev) => {
			const currentIndex = MANUAL_ZOOM_LEVELS.findIndex(
				(level) => Math.abs(level - prev) < 0.001,
			);
			if (currentIndex === -1) {
				if (prev < MANUAL_ZOOM_MID) return MANUAL_ZOOM_MID;
				return MANUAL_ZOOM_MAX;
			}
			const next =
				MANUAL_ZOOM_LEVELS[
					Math.min(MANUAL_ZOOM_LEVELS.length - 1, currentIndex + 1)
				]!;
			return next;
		});
	};

	const zoomOut = () => {
		setMapZoom((prev) => {
			const currentIndex = MANUAL_ZOOM_LEVELS.findIndex(
				(level) => Math.abs(level - prev) < 0.001,
			);
			if (currentIndex === -1) {
				if (prev > MANUAL_ZOOM_MID) return MANUAL_ZOOM_MID;
				return MANUAL_ZOOM_MIN;
			}
			const next = MANUAL_ZOOM_LEVELS[Math.max(0, currentIndex - 1)]!;
			return next;
		});
	};

	const moveQuantity = (delta: number) => {
		moveQuantitySelection(setQuantityPrompt, delta);
	};
	const setQuantityToMax = () => {
		setQuantityPrompt((prev) => (prev ? { ...prev, value: prev.max } : prev));
	};
	const setQuantityToMin = () => {
		setQuantityPrompt((prev) => (prev ? { ...prev, value: prev.min } : prev));
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

	const inputContext: GameKeyDownContext = {
		applyMoneyDelta,
		updateInventory,
		spawnAnimalInBarn,
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
		setQuantityToMax,
		setQuantityToMin,
		moveModal,
		movePlayer,
		interact,
		zoomIn,
		zoomOut,
		cancelQuantityPrompt,
		vendorMenuTitles,
		closeMenu,
		selectModal,
		inputLocked: directorInputLocked,
		directorDialogOpen: !!directorPopup,
		confirmDirectorDialog: confirmDirectorPopup,
		isNewspaperOpen: isNewspaperPopupOpen,
		closeNewspaperPopup,
	};
	const inputRouter = useInputRouter(inputContext, PC_KEYBOARD_PRESET);
	const onKeyDown = inputRouter.onKeyDown;
	dispatchHeldMoveCommandRef.current = (dir: Dir) => {
		if (dir === "up") {
			inputRouter.dispatchCommand("MOVE_UP", { sourceKey: "__held_move__" });
			return;
		}
		if (dir === "down") {
			inputRouter.dispatchCommand("MOVE_DOWN", { sourceKey: "__held_move__" });
			return;
		}
		if (dir === "left") {
			inputRouter.dispatchCommand("MOVE_LEFT", { sourceKey: "__held_move__" });
			return;
		}
		inputRouter.dispatchCommand("MOVE_RIGHT", { sourceKey: "__held_move__" });
	};
	const onKeyDownWithHold = (e: KeyboardEvent<HTMLDivElement>) => {
		onKeyDown(e);
		const key = e.key.toLowerCase();
		if (e.repeat) return;
		const dir = inputRouter.resolveHeldMoveDirectionForKey(key);
		if (!dir) return;
		if (
			modal ||
			directorInputLocked ||
			!!directorPopup ||
			isNewspaperPopupOpen ||
			isBathing ||
			isOrdering ||
			isDoctorCompounding ||
			!!fishing ||
			!!dayTransition
		) {
			clearHeldMove();
			return;
		}
		heldMoveDirRef.current = dir;
		heldMoveKeyRef.current = key;
		scheduleHeldMoveStep();
	};
	const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
		const key = e.key.toLowerCase();
		if (heldMoveKeyRef.current !== key) return;
		clearHeldMove();
	};
	const onInputBlur = () => {
		clearHeldMove();
	};

	useEffect(() => {
		if (
			modal ||
			directorInputLocked ||
			!!directorPopup ||
			isBathing ||
			isOrdering ||
			isDoctorCompounding ||
			!!fishing ||
			!!dayTransition
		) {
			clearHeldMove();
		}
	}, [
		modal,
		directorInputLocked,
		directorPopup,
		isBathing,
		isOrdering,
		isDoctorCompounding,
		fishing,
		dayTransition,
	]);

	useEffect(() => {
		return () => {
			clearHeldMove();
			tileFxBusRef.current.clear();
		};
	}, []);

	const renderedMap = useMemo(() => {
		return buildRenderedMapGrid({
			activeMapLayouts,
			playerMap: player.map,
			day,
			starterChestOpened,
			STARTER_CHEST_POS,
			headlampLetterVisible,
			HEADLAMP_LETTER_POS,
			farmNewspaperPos,
			plots,
			cropDefs,
			farmForestBlockers,
			farmCaveBlockers,
			petGraveObstacles,
			farmWeedObstacles,
			beachBottlePos,
			doctorVendorActive,
			DOCTOR_POS,
			petVendorActive,
			ownedPet,
			PET_VENDOR_POS,
			sketchyMerchantActive,
			SKETCHY_MERCHANT_POS,
			sketchyMerchantStock,
			SKETCHY_CRATE_POS,
			traderActive,
			TRADER_POS,
			TRADER_BOX_POS,
			TRADER_HELI_POS,
			beachShellDrops,
			boatTiles,
			animalsMap,
			farmEggDrops,
			petOptions,
			petTile,
			petHeartTile,
			hasTractor,
			tractorParked,
			TRACTOR_PARK_POS,
			hasAutoCollector,
			barnAutoCollectorPos,
			forestObstacles,
			forestChest,
			forestBonusChests,
			caveObstacles,
			caveBonusChest,
			caveLadderPos,
			isShopMap,
			shopDecorByMap,
			keyForPos,
			isOrdering,
			cafeShopkeeperX,
			isBathing,
			fishing,
		});
	}, [
		day,
		fishing,
		starterChestOpened,
		headlampLetterVisible,
		farmNewspaperPos,
		forestChest,
		forestBonusChests,
		forestObstacles,
		caveObstacles,
		caveBonusChest,
		caveLadderPos,
		player.map,
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
		hasAutoCollector,
		barnAutoCollectorPos,
		shopDecorByMap,
		cafeShopkeeperX,
		isOrdering,
		isBathing,
		activeMapLayouts,
		animalsMap,
	]);

	const unfedAnimalTileKeys = useMemo(() => {
		const keys: Record<string, boolean> = {};
		animals.forEach((animal) => {
			if (animal.fedToday) return;
			const pos = animalTiles[animal.id];
			if (!pos) return;
			keys[keyForPos(pos.x, pos.y)] = true;
		});
		return keys;
	}, [animalsMap, animals, animalTiles]);

	const viewCtx: GameRuntimeViewModel = buildGameRuntimeViewModel({
		onKeyDown: onKeyDownWithHold,
		onKeyUp,
		onBlur: onInputBlur,
		shellRef,
		day,
		player,
		townNpcTiles,
		forestEnemies,
		caveEnemies,
		animalsMap,
		animals,
		animalTiles,
		currentWeather,
		weatherEmojiById,
		money,
		stamina,
		staminaMax,
		waterLevel,
		inventory,
		itemIcons,
		itemNames,
		priceItems,
		priceTrends,
		tools,
		activeMapLayouts,
		isWindSlashOn,
		renderedMap,
		mapZoom,
		cameraTarget,
		plots,
		keyForPos,
		groundClassForTile,
		isShopMap,
		shopDecorByMap,
		isFarmHouseDoorTile,
		getDoorGroundClass,
		fishing,
		isDrivingTractor,
		isBathing,
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
		cloudOverlayVisible,
		unfedAnimalMap: animalsMap,
		unfedAnimalTileKeys,
		getToolTierName,
		pendingTractorDelivery,
		hasTractor,
		hasHeadlamp,
		newspaper,
		newspaperImage,
		isNewspaperPopupOpen,
		closeNewspaperPopup,
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
		isSaveLoadMenuOpen,
		canSaveGame,
		saveDisabledMessage,
		saveLoadStatus,
		toggleSaveLoadMenu,
		closeSaveLoadMenu,
		saveGameToFile,
		loadGameFromFilePicker,
		directorPopup,
		confirmDirectorPopup,
		tileFx: tileFxBusRef.current.api,
		tileFxBus: tileFxBusRef.current,
	});

	return renderGameRuntimeView(viewCtx);
}
