import {
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
	type KeyboardEvent,
	type SetStateAction,
	type TouchEvent,
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
import themeSongSrc from "../../assets/themeSong.mp3";
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
import battleMusicSrc from "../../assets/battleMusic.mp3";
import badWater1SoundSrc from "../../assets/badWater1.mp3";
import badWater2SoundSrc from "../../assets/badWater2.mp3";
import badWater3SoundSrc from "../../assets/badWater3.mp3";
import badWater4SoundSrc from "../../assets/badWater4.mp3";
import badWater5SoundSrc from "../../assets/badWater5.mp3";
import badWater6SoundSrc from "../../assets/badWater6.mp3";
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
import { fishItemCatalog, getFishItemMetaById } from "../content/fishCatalog";
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
	createInitialFishingMoveUnlocks,
	FISHING_FISH_MOVE_IMPACT_SOUNDS,
	FISHING_LEVEL_UP_COMPLIMENTS,
	FISHING_PLAYER_MOVES,
	FISHING_PLAYER_MOVE_IMPACT_SOUNDS,
	FISHING_PLAYER_MOVE_ORDER,
	applyFishingExpGain,
	getFishMovePoolWithFallback,
	getFishingAttackForLevel,
	getFishingCategoryForMap,
	getFishingDefenseForLevel,
	getFishingExpToNextLevel,
	pickFishForEncounter,
	resolveFishTurn,
	resolvePlayerFishingMove,
	rollFishingLevelUpAttackBuffAmount,
	rollFishingLevelUpDefenseBuffAmount,
	rollFishMove,
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
import {
	MOBILE_KEYBOARD_PRESET,
	PC_KEYBOARD_PRESET,
} from "../systems/inputCommands";
import { useWorldSimulation } from "./worldSimulation";
import {
	STAMINA_MAX,
	TOOL_MAX_LEVEL,
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
import {
	applyProgressEventToState,
	makeEmptyProgressLoadoutRows,
} from "../progression/progressMonitor";
import {
	makeEmptyProgressAlgorithmCounts,
	progressAlgorithmStones,
} from "../progression/progressStonesAlgorithmic";
import {
	makeEmptyProgressTargetCounts,
	progressTargetStones,
} from "../progression/progressStonesTarget";
import type {
	Animal,
	AnimalDef,
	AnimalType,
	AquariumDonationInventory,
	BarnTier,
	CafeOrderItem,
	CaveGenerationResult,
	CloudSprite,
	CropDef,
	CropId,
	DayTransitionState,
	Dir,
	FishingCombatToast,
	FishPerTurnStatModifier,
	FishingState,
	FishingFishMoveId,
	FishingImpactSoundId,
	FishingPlayerMoveId,
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
	PlayerPerTurnStatModifier,
	PriceState,
	PriceTrendState,
	ProgressAlgorithmId,
	ProgressEventPayload,
	ProgressLoadoutRow,
	ProgressRarity,
	ProgressTargetId,
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
	makeEmptyAquariumInventory,
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
import { stopAllBufferedAudio } from "../systems/sound";

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
const MOBILE_JOYSTICK_DEADZONE_PX = 14;
const MOBILE_JOYSTICK_MAX_RADIUS_PX = 42;

const detectDefaultControlMode = (): "pc" | "mobile" => {
	if (typeof window === "undefined" || typeof navigator === "undefined") {
		return "pc";
	}
	const hasCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
	const hasTouchPoints = navigator.maxTouchPoints > 0;
	return hasCoarsePointer || hasTouchPoints ? "mobile" : "pc";
};
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

type PendingFishingReward = {
	itemId: ItemId;
	fishName: string;
	fishGlyph: string;
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
	const computerLabMusicRef = useRef<HTMLAudioElement | null>(null);
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
	const battleMusicRef = useRef<HTMLAudioElement | null>(null);
	const badWater1SoundRef = useRef<HTMLAudioElement | null>(null);
	const badWater2SoundRef = useRef<HTMLAudioElement | null>(null);
	const badWater3SoundRef = useRef<HTMLAudioElement | null>(null);
	const badWater4SoundRef = useRef<HTMLAudioElement | null>(null);
	const badWater5SoundRef = useRef<HTMLAudioElement | null>(null);
	const badWater6SoundRef = useRef<HTMLAudioElement | null>(null);
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
	const fishingToastIdRef = useRef(0);
	const fishingWaterIntervalRef = useRef<number | null>(null);
	const waterRefillTileTimeoutRef = useRef<number | null>(null);
	const tiredDuckTimeoutRef = useRef<number | null>(null);
	const tiredFaceTimeoutRef = useRef<number | null>(null);
	const petRunoverBadTimeoutRef = useRef<number | null>(null);
	const forestHitTimeoutRef = useRef<number | null>(null);
	const lastStoneHintPlayerPosRef = useRef<{ map: MapId; x: number; y: number } | null>(
		null,
	);
	const orderMidTimeoutRef = useRef<number | null>(null);
	const orderCompleteTimeoutRef = useRef<number | null>(null);
	const orderRewardTimeoutRef = useRef<number | null>(null);
	const savarioResponseTimeoutRef = useRef<number | null>(null);
	const pendingFishingRewardRef = useRef<PendingFishingReward | null>(null);
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
				aquariumDonations: makeEmptyAquariumInventory(),
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
				hasBath: false,
				pendingBathInstall: false,
				hasWardrobe: false,
				pendingWardrobeInstall: false,
				clothingShopOpeningAnnounced: false,
				hasAutoCollector: false,
				pendingAutoCollectorInstall: false,
				hasAutoFeeder: false,
				pendingAutoFeederInstall: false,
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
				fishingProgress: { level: 1, exp: 0, attackBonus: 0, defenseBonus: 0 },
				fishingMoveUnlocks: createInitialFishingMoveUnlocks(),
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
				progressPercent: 0,
				progressWon: false,
				progressWinPopupShown: false,
				progressStoneTargetCounts: makeEmptyProgressTargetCounts(),
				progressStoneAlgorithmCounts: makeEmptyProgressAlgorithmCounts(),
				progressLoadoutRows: makeEmptyProgressLoadoutRows(),
				highestForestLevelReached: 1,
				highestCaveLevelReached: 1,
			};
		},
	);
	const [isSaveLoadMenuOpen, setIsSaveLoadMenuOpen] = useState(false);
	const [controlMode, setControlMode] = useState<"pc" | "mobile">(() =>
		detectDefaultControlMode(),
	);
	const [saveLoadStatus, setSaveLoadStatus] = useState<string | null>(null);
	const [mobileMoveJoystickAnchor, setMobileMoveJoystickAnchor] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [mobileMoveJoystickThumb, setMobileMoveJoystickThumb] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [mobileInteractJoystickAnchor, setMobileInteractJoystickAnchor] =
		useState<{
			x: number;
			y: number;
		} | null>(null);
	const [mobileInteractJoystickThumb, setMobileInteractJoystickThumb] = useState<{
		x: number;
		y: number;
	} | null>(null);
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
	const [aquariumBubbles, setAquariumBubbles] = useState<
		Array<{ x: number; y: number; tank: "fresh" | "salt" | "cave" }>
	>([]);
	const [aquariumSeaweedXs, setAquariumSeaweedXs] = useState<number[]>([]);
	const [aquariumOceanSeaweedXs, setAquariumOceanSeaweedXs] = useState<number[]>(
		[],
	);
	const [aquariumCuratorTile, setAquariumCuratorTile] = useState<Point | null>(null);
	const [aquariumFishTiles, setAquariumFishTiles] = useState<
		Array<{ fishId: string; glyph: string; x: number; y: number; facing: 1 | -1 }>
	>([]);
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
		aquariumDonations,
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
		hasBath,
		pendingBathInstall,
		hasWardrobe,
		pendingWardrobeInstall,
		clothingShopOpeningAnnounced,
		hasAutoCollector,
		pendingAutoCollectorInstall,
		hasAutoFeeder,
		pendingAutoFeederInstall,
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
		fishingProgress,
		fishingMoveUnlocks,
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
		progressPercent,
		progressWon,
		progressWinPopupShown,
		progressStoneTargetCounts,
		progressStoneAlgorithmCounts,
		progressLoadoutRows,
		highestForestLevelReached,
		highestCaveLevelReached,
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
	const gameStateRef = useRef(gameState);
	const playerRef = useRef(player);
	const playerMoveUnlockAtRef = useRef(0);
	const prevZoomWhooshRef = useRef(mapZoom);
	const heldMoveDirRef = useRef<Dir | null>(null);
	const heldMoveKeyRef = useRef<string | null>(null);
	const heldMoveTimerRef = useRef<number | null>(null);
	const dispatchHeldMoveCommandRef = useRef<(dir: Dir) => void>(() => {});
	const dispatchMobileMoveCommandRef = useRef<(dir: Dir) => void>(() => {});
	const dispatchMobileInteractCommandRef = useRef<(dir: Dir) => void>(() => {});
	const mobileMoveJoystickTouchIdRef = useRef<number | null>(null);
	const mobileMoveCadenceDirRef = useRef<Dir | null>(null);
	const mobileMoveCadenceTimerRef = useRef<number | null>(null);
	const mobileInteractJoystickTouchIdRef = useRef<number | null>(null);
	const mobileInteractSwipeUsedRef = useRef(false);
	const mobileInteractCommandSentRef = useRef(false);
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
	const setAquariumDonations = setForKey("aquariumDonations");
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
	const setHasBath = setForKey("hasBath");
	const setPendingBathInstall = setForKey("pendingBathInstall");
	const setHasWardrobe = setForKey("hasWardrobe");
	const setPendingWardrobeInstall = setForKey("pendingWardrobeInstall");
	const setClothingShopOpeningAnnounced = setForKey("clothingShopOpeningAnnounced");
	const setHasAutoCollector = setForKey("hasAutoCollector");
	const setPendingAutoCollectorInstall = setForKey("pendingAutoCollectorInstall");
	const setHasAutoFeeder = setForKey("hasAutoFeeder");
	const setPendingAutoFeederInstall = setForKey("pendingAutoFeederInstall");
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
	const setFishingProgress = setForKey("fishingProgress");
	const setFishingMoveUnlocks = setForKey("fishingMoveUnlocks");
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
	const setProgressPercent = setForKey("progressPercent");
	const setProgressWon = setForKey("progressWon");
	const setProgressWinPopupShown = setForKey("progressWinPopupShown");
	const setProgressStoneTargetCounts = setForKey("progressStoneTargetCounts");
	const setProgressStoneAlgorithmCounts = setForKey("progressStoneAlgorithmCounts");
	const setProgressLoadoutRows = setForKey("progressLoadoutRows");
	const setHighestForestLevelReached = setForKey("highestForestLevelReached");
	const setHighestCaveLevelReached = setForKey("highestCaveLevelReached");
	const activeMapLayouts = useMemo(
		() => ({
			...mapLayouts,
			farm: buildFarmLayout(barnTier),
			town: !hasWardrobe
				? mapLayouts.town.map((row) => row.split("c").join("H"))
				: mapLayouts.town,
			house: mapLayouts.house.map((row) => {
				let nextRow = row;
				if (!hasBath) nextRow = nextRow.split("U").join(".");
				if (!hasWardrobe) nextRow = nextRow.split("w").join(".");
				return nextRow;
			}),
			barn: buildBarnLayout(barnTier),
			forest: forestLayout,
			cave: caveLayout,
		}),
		[barnTier, hasBath, hasWardrobe, forestLayout, caveLayout],
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
		if (barnTier <= 3) {
			const rect = getFarmBarnOuterRect(barnTier);
			return { x: rect.x + rect.w - 2, y: rect.y + rect.h - 2 };
		}
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
	}, [activeMapLayouts.barn, barnTier]);
	const barnAutoCollectorMap: MapId = barnTier <= 3 ? "farm" : "barn";
	const barnAutoFeederPos = useMemo(() => {
		const rows = activeMapLayouts.barn;
		const isInBounds = (x: number, y: number) =>
			x >= 0 &&
			y >= 0 &&
			y < rows.length &&
			x < (rows[0]?.length ?? 0);
		if (barnTier <= 3) {
			return { x: 16, y: 7 };
		}
		if (!barnAutoCollectorPos) return null;
		const x = barnAutoCollectorPos.x - 1;
		const y = barnAutoCollectorPos.y;
		if (!isInBounds(x, y)) return null;
		return { x, y };
	}, [activeMapLayouts.barn, barnAutoCollectorPos, barnTier]);
	const barnAutoFeederMap: MapId = barnTier <= 3 ? "farm" : "barn";
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
				computerLabMusicRef,
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
				battleMusicRef,
				badWater1SoundRef,
				badWater2SoundRef,
				badWater3SoundRef,
				badWater4SoundRef,
				badWater5SoundRef,
				badWater6SoundRef,
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
				themeSongSrc,
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
				battleMusicSrc,
				badWater1SoundSrc,
				badWater2SoundSrc,
				badWater3SoundSrc,
				badWater4SoundSrc,
				badWater5SoundSrc,
				badWater6SoundSrc,
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
		playBadWaterSound,
		startBattleMusicLoop,
		stopBattleMusicLoop,
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
			computerLabMusicRef,
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
			battleMusicRef,
			badWater1SoundRef,
			badWater2SoundRef,
			badWater3SoundRef,
			badWater4SoundRef,
			badWater5SoundRef,
			badWater6SoundRef,
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

	useEffect(() => {
		const stopAllAudioPlayback = () => {
			if (musicFadeIntervalRef.current !== null) {
				window.clearInterval(musicFadeIntervalRef.current);
				musicFadeIntervalRef.current = null;
			}
			if (townBeachFadeIntervalRef.current !== null) {
				window.clearInterval(townBeachFadeIntervalRef.current);
				townBeachFadeIntervalRef.current = null;
			}
			if (seagullsFadeIntervalRef.current !== null) {
				window.clearInterval(seagullsFadeIntervalRef.current);
				seagullsFadeIntervalRef.current = null;
			}

			const audioRefs = [
				notificationRef,
				farmMusicRef,
				townMusicRef,
				beachAmbienceRef,
				houseMusicRef,
				forestMusicRef,
				caveMusicRef,
				computerLabMusicRef,
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
				battleMusicRef,
				cafeOrderMusicRef,
				currentAreaMusicRef,
				musicFadeFromRef,
				musicFadeToRef,
			] as const;

			audioRefs.forEach((ref) => {
				const track = ref.current;
				if (!track) return;
				track.pause();
				track.currentTime = 0;
			});
			stopAllBufferedAudio();
			if (seagullsSoundRef.current) {
				seagullsSoundRef.current.volume = 1;
			}
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				stopAllAudioPlayback();
			}
		};

		window.addEventListener("pagehide", stopAllAudioPlayback);
		window.addEventListener("beforeunload", stopAllAudioPlayback);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			window.removeEventListener("pagehide", stopAllAudioPlayback);
			window.removeEventListener("beforeunload", stopAllAudioPlayback);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
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
			if (computerLabMusicRef.current) {
				computerLabMusicRef.current.pause();
				computerLabMusicRef.current.currentTime = 0;
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
		computerLabMusicRef,
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
		stopBattleMusicLoop();
		if (cafeOrderMusicRef.current) {
			cafeOrderMusicRef.current.pause();
			cafeOrderMusicRef.current.currentTime = 0;
		}
		setPauseGame(false);
		setFishing(null);
		const pendingFishingReward = pendingFishingRewardRef.current;
		pendingFishingRewardRef.current = null;
		if (pendingFishingReward) {
			window.setTimeout(() => {
				updateInventory(pendingFishingReward.itemId, 1, {
					toastText: `+1 ${pendingFishingReward.fishGlyph} ${pendingFishingReward.fishName}`,
				});
			}, 80);
		}
		if (!dayTransition && !modal) {
			switchAreaMusic(getAreaMusicForMap(playerRef.current.map), true);
		}
	};

	const moveFishingSelection = (delta: number) => {
		setFishing((prev) => {
			if (!prev || prev.phase !== "player_turn") return prev;
			const unlockedMoves = FISHING_PLAYER_MOVE_ORDER.filter(
				(moveId) => fishingMoveUnlocks[moveId],
			);
			if (unlockedMoves.length === 0) return prev;
			const currentMoveId = FISHING_PLAYER_MOVE_ORDER[prev.selectedMoveIndex];
			const currentUnlockedIndex = currentMoveId
				? unlockedMoves.indexOf(currentMoveId)
				: -1;
			const baseIndex = currentUnlockedIndex >= 0 ? currentUnlockedIndex : 0;
			const nextUnlockedIndex =
				(baseIndex + delta + unlockedMoves.length) % unlockedMoves.length;
			const nextMoveId = unlockedMoves[nextUnlockedIndex]!;
			const nextIndex = FISHING_PLAYER_MOVE_ORDER.indexOf(nextMoveId);
			return nextIndex >= 0 ? { ...prev, selectedMoveIndex: nextIndex } : prev;
		});
	};

	const finishFishingEncounter = (outcome: "caught" | "escaped" | "cut_line") => {
		if (fishingResolveTimeoutRef.current !== null) {
			window.clearTimeout(fishingResolveTimeoutRef.current);
		}
		setFishing((prev) => {
			if (!prev) return prev;
			if (outcome !== "caught") {
				pendingFishingRewardRef.current = null;
			}
			const message =
				outcome === "caught"
					? `You caught ${prev.fishName}!`
					: outcome === "cut_line"
						? "You cut the line and ended the encounter."
						: `${prev.fishName} escaped.`;
			return {
				...prev,
				phase: outcome,
				message,
				showMenu: false,
				openingStage: prev.openingStage,
				playerAnim: null,
				fishAnim: outcome === "caught" ? "defeat" : null,
			};
		});
		fishingResolveTimeoutRef.current = window.setTimeout(() => {
			endFishing();
		}, outcome === "caught" ? 2000 : 900);
	};

	const queueFishingReward = (encounter: FishingState) => {
		const fishMeta = getFishItemMetaById(encounter.fishId);
		if (!fishMeta) {
			pendingFishingRewardRef.current = null;
			addLog(`Caught ${encounter.fishName}, but inventory item mapping is missing.`);
			return;
		}
		pendingFishingRewardRef.current = {
			itemId: fishMeta.itemId,
			fishName: fishMeta.name,
			fishGlyph: fishMeta.glyph,
		};
	};

	const buildPlayerActionIntroText = (moveId: FishingPlayerMoveId) => {
		const label = FISHING_PLAYER_MOVES[moveId].label;
		return `You used ${label}.`;
	};

	const buildFishActionIntroText = (fishName: string, moveId: FishingFishMoveId) => {
		const label = moveId.replace(/_/g, " ");
		return `The ${fishName} used ${label}!`;
	};

	type FishingToastDraft = {
		kind: "hp" | "stat";
		text: string;
		tone: "buff" | "debuff";
	};
	type FishingTurnToastDrafts = {
		player: FishingToastDraft[];
		fish: FishingToastDraft[];
	};
	const fishingStatIconByKey: Record<"attack" | "defense", string> = {
		attack: GLYPH.crossedSwords,
		defense: GLYPH.shield,
	};
	const stampFishingToasts = (
		toasts: FishingToastDraft[],
		durationMs?: number,
	): FishingCombatToast[] =>
		toasts.map((toast) => ({
			id: ++fishingToastIdRef.current,
			text: toast.text,
			tone: toast.tone,
			durationMs,
		}));
	const buildFishingTurnToastDrafts = (
		before: FishingState,
		after: FishingState,
		playerStaminaDamage: number,
		attemptedPlayerDebuffStat?: "attack" | "defense",
	): FishingTurnToastDrafts => {
		const player: FishingToastDraft[] = [];
		const fish: FishingToastDraft[] = [];
		if (playerStaminaDamage > 0) {
			player.push({
				kind: "hp",
				text: `-${playerStaminaDamage} HP`,
				tone: "debuff",
			});
		}
		const fishHpDelta = after.fishHp - before.fishHp;
		if (fishHpDelta < 0) {
			fish.push({
				kind: "hp",
				text: `-${Math.abs(fishHpDelta)} HP`,
				tone: "debuff",
			});
		}
		(
			[
				["playerAttack", "attack", "player"],
				["playerDefense", "defense", "player"],
				["fishAttack", "attack", "fish"],
				["fishDefense", "defense", "fish"],
			] as const
		).forEach(([field, stat, side]) => {
			const delta = after[field] - before[field];
			if (!delta) return;
			const tone: "buff" | "debuff" = delta > 0 ? "buff" : "debuff";
			const line: FishingToastDraft = {
				kind: "stat",
				text: `${delta > 0 ? "+" : "-"}${Math.abs(delta)} ${fishingStatIconByKey[stat]}`,
				tone,
			};
			if (side === "player") {
				player.push(line);
				return;
			}
			fish.push(line);
		});
		if (attemptedPlayerDebuffStat) {
			const field =
				attemptedPlayerDebuffStat === "attack" ? "playerAttack" : "playerDefense";
			const delta = after[field] - before[field];
			const hasDebuffToastForStat = player.some(
				(toast) =>
					toast.kind === "stat" &&
					toast.tone === "debuff" &&
					toast.text.includes(fishingStatIconByKey[attemptedPlayerDebuffStat]),
			);
			if (delta === 0 && !hasDebuffToastForStat) {
				player.push({
					kind: "stat",
					text: `-0 ${fishingStatIconByKey[attemptedPlayerDebuffStat]}`,
					tone: "debuff",
				});
			}
		}
		return { player, fish };
	};
	const upsertPlayerPerTurnModifier = (
		modifiers: PlayerPerTurnStatModifier[],
		next: PlayerPerTurnStatModifier | undefined,
	): PlayerPerTurnStatModifier[] => {
		if (!next) return modifiers;
		const existingIndex = modifiers.findIndex(
			(modifier) => modifier.moveName === next.moveName,
		);
		if (existingIndex < 0) return [...modifiers, next];
		return modifiers.map((modifier, index) =>
			index !== existingIndex
				? modifier
				: {
						...modifier,
						stamina: modifier.stamina + next.stamina,
						attack: modifier.attack + next.attack,
						defense: modifier.defense + next.defense,
						messages:
							modifier.messages.length > 0 ? modifier.messages : next.messages,
					},
		);
	};
	const upsertFishPerTurnModifier = (
		modifiers: FishPerTurnStatModifier[],
		next: FishPerTurnStatModifier | undefined,
	): FishPerTurnStatModifier[] => {
		if (!next) return modifiers;
		const existingIndex = modifiers.findIndex(
			(modifier) => modifier.moveName === next.moveName,
		);
		if (existingIndex < 0) return [...modifiers, next];
		return modifiers.map((modifier, index) =>
			index !== existingIndex
				? modifier
				: {
						...modifier,
						hp: modifier.hp + next.hp,
						attack: modifier.attack + next.attack,
						defense: modifier.defense + next.defense,
						messages:
							modifier.messages.length > 0 ? modifier.messages : next.messages,
					},
		);
	};
	const pickStackingMessage = (modifier: { moveName: string; messages: string[] }) => {
		if (modifier.messages.length === 0) return modifier.moveName;
		return modifier.messages[randomInt(0, modifier.messages.length - 1)]!;
	};
	const wholeCombatValue = (value: number): number =>
		value >= 0 ? Math.floor(value) : Math.ceil(value);
	const runStackingEffects = (
		baseFishing: FishingState,
		baseStamina: number,
		onComplete: (
			nextFishing: FishingState,
			nextStamina: number,
			interrupted: "none" | "caught" | "escaped",
		) => void,
	) => {
		type PendingEffect =
			| { target: "player"; modifier: PlayerPerTurnStatModifier }
			| { target: "fish"; modifier: FishPerTurnStatModifier };
		const queue: PendingEffect[] = [
			...baseFishing.playerPerTurnModifiers.map((modifier) => ({
				target: "player" as const,
				modifier,
			})),
			...baseFishing.fishPerTurnModifiers.map((modifier) => ({
				target: "fish" as const,
				modifier,
			})),
		];
		if (queue.length === 0) {
			onComplete(baseFishing, baseStamina, "none");
			return;
		}
		let index = 0;
		const step = (currentFishing: FishingState, currentStamina: number) => {
			const effect = queue[index];
			if (!effect) {
				onComplete(currentFishing, currentStamina, "none");
				return;
			}
			index += 1;
			let nextFishing = currentFishing;
			let nextStamina = currentStamina;
			const playerToasts: FishingCombatToast[] = [];
			const fishToasts: FishingCombatToast[] = [];
			if (effect.target === "player") {
				const modifier = effect.modifier;
				const staminaDelta = wholeCombatValue(modifier.stamina);
				const attackDelta = wholeCombatValue(modifier.attack);
				const defenseDelta = wholeCombatValue(modifier.defense);
				const appliedStamina =
					Math.max(0, Math.min(staminaMax, nextStamina + staminaDelta)) -
					nextStamina;
				const appliedAttack =
					Math.max(0, nextFishing.playerAttack + attackDelta) -
					nextFishing.playerAttack;
				const appliedDefense =
					Math.max(0, nextFishing.playerDefense + defenseDelta) -
					nextFishing.playerDefense;
				nextStamina += appliedStamina;
				nextFishing = {
					...nextFishing,
					playerAttack: nextFishing.playerAttack + appliedAttack,
					playerDefense: nextFishing.playerDefense + appliedDefense,
				};
				const toastDrafts: FishingToastDraft[] = [];
				if (appliedStamina !== 0) {
					toastDrafts.push({
						kind: "hp",
						text: `${appliedStamina > 0 ? "+" : "-"}${Math.abs(appliedStamina)} STA`,
						tone: appliedStamina > 0 ? "buff" : "debuff",
					});
				}
				if (appliedAttack !== 0) {
					toastDrafts.push({
						kind: "stat",
						text: `${appliedAttack > 0 ? "+" : "-"}${Math.abs(appliedAttack)} ${fishingStatIconByKey.attack}`,
						tone: appliedAttack > 0 ? "buff" : "debuff",
					});
				}
				if (appliedDefense !== 0) {
					toastDrafts.push({
						kind: "stat",
						text: `${appliedDefense > 0 ? "+" : "-"}${Math.abs(appliedDefense)} ${fishingStatIconByKey.defense}`,
						tone: appliedDefense > 0 ? "buff" : "debuff",
					});
				}
				playerToasts.push(...stampFishingToasts(toastDrafts, 3000));
			} else {
				const modifier = effect.modifier;
				const hpDelta = wholeCombatValue(modifier.hp);
				const attackDelta = wholeCombatValue(modifier.attack);
				const defenseDelta = wholeCombatValue(modifier.defense);
				const appliedHp =
					Math.max(0, Math.min(nextFishing.fishMaxHp, nextFishing.fishHp + hpDelta)) -
					nextFishing.fishHp;
				const appliedAttack =
					Math.max(0, nextFishing.fishAttack + attackDelta) -
					nextFishing.fishAttack;
				const appliedDefense =
					Math.max(0, nextFishing.fishDefense + defenseDelta) -
					nextFishing.fishDefense;
				nextFishing = {
					...nextFishing,
					fishHp: nextFishing.fishHp + appliedHp,
					fishAttack: nextFishing.fishAttack + appliedAttack,
					fishDefense: nextFishing.fishDefense + appliedDefense,
				};
				const toastDrafts: FishingToastDraft[] = [];
				if (appliedHp !== 0) {
					toastDrafts.push({
						kind: "hp",
						text: `${appliedHp > 0 ? "+" : "-"}${Math.abs(appliedHp)} HP`,
						tone: appliedHp > 0 ? "buff" : "debuff",
					});
				}
				if (appliedAttack !== 0) {
					toastDrafts.push({
						kind: "stat",
						text: `${appliedAttack > 0 ? "+" : "-"}${Math.abs(appliedAttack)} ${fishingStatIconByKey.attack}`,
						tone: appliedAttack > 0 ? "buff" : "debuff",
					});
				}
				if (appliedDefense !== 0) {
					toastDrafts.push({
						kind: "stat",
						text: `${appliedDefense > 0 ? "+" : "-"}${Math.abs(appliedDefense)} ${fishingStatIconByKey.defense}`,
						tone: appliedDefense > 0 ? "buff" : "debuff",
					});
				}
				fishToasts.push(...stampFishingToasts(toastDrafts, 3000));
			}
			const allToasts = [...playerToasts, ...fishToasts];
			const hasDebuffToast = allToasts.some((toast) => toast.tone === "debuff");
			const hasBuffToast = allToasts.some((toast) => toast.tone === "buff");
			setStamina(nextStamina);
			setFishing({
				...nextFishing,
				phase: "player_action",
				showMenu: false,
				openingStage: "ready",
				message: pickStackingMessage(effect.modifier),
				playerAnim: hasDebuffToast
					? effect.target === "player"
						? "squash"
						: null
					: hasBuffToast
						? effect.target === "player"
							? "stretch"
							: null
						: null,
				fishAnim: hasDebuffToast
					? effect.target === "fish"
						? "squash"
						: null
					: hasBuffToast
						? effect.target === "fish"
							? "stretch"
							: null
						: null,
				playerToasts,
				fishToasts,
				expBarLevelUpBurst: false,
			});
			const effectImpactSound = effect.modifier.impactSound;
			if (effectImpactSound) {
				playFishingImpactSound(effectImpactSound);
			}
			if (nextStamina <= 0) playBad();
			fishingResolveTimeoutRef.current = window.setTimeout(() => {
				if (nextStamina <= 0) {
					finishFishingEncounter("escaped");
					onComplete(nextFishing, nextStamina, "escaped");
					return;
				}
				if (nextFishing.fishHp <= 0) {
					resolveCaughtEncounter(nextFishing);
					onComplete(nextFishing, nextStamina, "caught");
					return;
				}
				step(nextFishing, nextStamina);
			}, 3000);
		};
		step(baseFishing, baseStamina);
	};

	const playFishingImpactSound = (sound: FishingImpactSoundId) => {
		if (sound === "water") {
			playWater();
			return;
		}
		if (sound === "munch") {
			playMunch();
			return;
		}
		if (sound === "badWater1") {
			playBadWaterSound("badWater1");
			return;
		}
		if (sound === "badWater2") {
			playBadWaterSound("badWater2");
			return;
		}
		if (sound === "badWater3") {
			playBadWaterSound("badWater3");
			return;
		}
		if (sound === "badWater4") {
			playBadWaterSound("badWater4");
			return;
		}
		if (sound === "badWater5") {
			playBadWaterSound("badWater5");
			return;
		}
		if (sound === "badWater6") {
			playBadWaterSound("badWater6");
			return;
		}
		playHoe();
	};

	const resolveCaughtEncounter = (caughtFishing: FishingState) => {
		stopBattleMusicLoop();
		switchAreaMusic(cafeOrderMusicRef.current, true);
		playYaya();
		queueFishingReward(caughtFishing);
		emitProgressEvent({ type: "fish_caught", quantity: 1 });
		setFishing({
			...caughtFishing,
			phase: "caught",
			message: `You caught ${caughtFishing.fishName}!`,
			showMenu: false,
			openingStage: "ready",
			playerAnim: null,
			fishAnim: "defeat",
			playerToasts: [],
			fishToasts: [],
			expBarLevelUpBurst: false,
			canChooseLevelUpBuff: false,
		});

		fishingResolveTimeoutRef.current = window.setTimeout(() => {
			const expGain = caughtFishing.fishExpGranted;
			const expResult = applyFishingExpGain(fishingProgress, expGain);
			setFishingProgress(expResult.progress);
			if (expResult.progress.level >= 2) {
				setFishingMoveUnlocks((prev) =>
					prev.pull_rod ? prev : { ...prev, pull_rod: true },
				);
			}
			playNotification();
			setFishing((prev) =>
				prev
					? {
							...prev,
							phase: "caught",
							message: `You gained ${expGain} Fishing EXP!`,
							showMenu: false,
							openingStage: "ready",
							playerAnim: null,
							fishAnim: "defeat",
							playerToasts: [],
							fishToasts: [],
							expBarLevelUpBurst: expResult.levelsGained > 0,
							playerLevel: expResult.progress.level,
							playerExp: expResult.progress.exp,
						}
					: prev,
			);
			addLog(`Caught ${caughtFishing.fishName} (+${expGain} fishing EXP).`);

			if (expResult.levelsGained > 0) {
				addLog(`Fishing Level Up! Level ${expResult.progress.level}.`);
				fishingResolveTimeoutRef.current = window.setTimeout(() => {
					playYaya();
					const attackBuffAmount = rollFishingLevelUpAttackBuffAmount(randomInt);
					const defenseBuffAmount = rollFishingLevelUpDefenseBuffAmount(randomInt);
					setFishing((prev) =>
						prev
							? {
									...prev,
									phase: "caught",
									message: `You reached level ${expResult.progress.level}!`,
									showMenu: false,
									openingStage: "ready",
									playerAnim: null,
									fishAnim: "defeat",
									playerToasts: [],
									fishToasts: [],
									expBarLevelUpBurst: false,
									playerLevel: expResult.progress.level,
									playerExp: expResult.progress.exp,
									awaitingLevelUpBuffChoice: false,
									canChooseLevelUpBuff: false,
									levelUpBuffAttackAmount: attackBuffAmount,
									levelUpBuffDefenseAmount: defenseBuffAmount,
								}
							: prev,
					);
					fishingResolveTimeoutRef.current = window.setTimeout(() => {
						setFishing((prev) =>
							prev
								? {
										...prev,
										phase: "caught",
										message: "Choose a buff",
										showMenu: true,
										openingStage: "ready",
										playerAnim: null,
										fishAnim: "defeat",
										playerToasts: [],
										fishToasts: [],
										expBarLevelUpBurst: false,
										playerLevel: expResult.progress.level,
										playerExp: expResult.progress.exp,
										awaitingLevelUpBuffChoice: true,
										canChooseLevelUpBuff: false,
										selectedMoveIndex: 0,
									}
								: prev,
						);
						fishingResolveTimeoutRef.current = window.setTimeout(() => {
							setFishing((prev) =>
								prev && prev.awaitingLevelUpBuffChoice
									? { ...prev, canChooseLevelUpBuff: true }
									: prev,
							);
						}, 1000);
					}, 2000);
				}, 2000);
				return;
			}

			fishingResolveTimeoutRef.current = window.setTimeout(() => {
				endFishing();
			}, 2000);
		}, 2000);
	};

	const runFishTurn = (baseFishing: FishingState, currentStamina: number) => {
		const fishMoveId = rollFishMove(baseFishing.fishMovePool, randomRoll);
		const fishTurn = resolveFishTurn({
			fishing: baseFishing,
			moveId: fishMoveId,
			playerStamina: currentStamina,
			playerStaminaMax: staminaMax,
		});
		const fishTurnToasts = buildFishingTurnToastDrafts(
			baseFishing,
			fishTurn.fishing,
			fishTurn.staminaDamage,
			fishTurn.attemptedPlayerDebuffStat,
		);
		const fishIntroToasts = stampFishingToasts(
			fishTurnToasts.fish.filter((toast) => toast.kind === "stat"),
		);
		const fishImpactToasts = stampFishingToasts(
			fishTurnToasts.fish.filter((toast) => toast.kind === "hp"),
		);
		const playerImpactToasts = stampFishingToasts(fishTurnToasts.player);
		playNotification();
		setFishing({
			...baseFishing,
			phase: "fish_turn",
			message: buildFishActionIntroText(baseFishing.fishName, fishMoveId),
			showMenu: false,
			openingStage: "ready",
			playerAnim: null,
			fishAnim: "stretch",
			playerToasts: [],
			fishToasts: fishIntroToasts,
		});
		fishingResolveTimeoutRef.current = window.setTimeout(() => {
			const nextStamina = Math.max(0, currentStamina - fishTurn.staminaDamage);
			const postFishState: FishingState = {
				...fishTurn.fishing,
				playerPerTurnModifiers: upsertPlayerPerTurnModifier(
					fishTurn.fishing.playerPerTurnModifiers,
					fishTurn.addPlayerPerTurnModifier,
				),
				fishPerTurnModifiers: upsertFishPerTurnModifier(
					fishTurn.fishing.fishPerTurnModifiers,
					fishTurn.addFishPerTurnModifier,
				),
			};
			setStamina(nextStamina);
			setFishing({
				...postFishState,
				phase: "fish_turn",
				message: fishTurn.message,
				showMenu: false,
				openingStage: "ready",
				playerAnim: playerImpactToasts.length > 0 ? "squash" : null,
				fishAnim: fishImpactToasts.length > 0 ? "squash" : null,
				playerToasts: playerImpactToasts,
				fishToasts: fishImpactToasts,
			});
			if (fishTurn.staminaDamage > 0) {
				playFishingImpactSound(FISHING_FISH_MOVE_IMPACT_SOUNDS[fishMoveId]);
			}
			addLog(fishTurn.message);
			if (nextStamina <= 0) {
				playBad();
			}
			fishingResolveTimeoutRef.current = window.setTimeout(() => {
				if (nextStamina <= 0) {
					finishFishingEncounter("escaped");
					return;
				}
				if (postFishState.fishHp <= 0) {
					resolveCaughtEncounter(postFishState);
					return;
				}
				runStackingEffects(postFishState, nextStamina, (stackedFishing, _stackedStamina, interrupted) => {
					if (interrupted !== "none") return;
					setFishing((prev) =>
						prev
							? {
									...stackedFishing,
									phase: "player_turn",
									showMenu: true,
									openingStage: "ready",
									playerAnim: null,
									fishAnim: null,
									playerToasts: [],
									fishToasts: [],
									message: "What would you like to do?",
									awaitingLevelUpBuffChoice: false,
									canChooseLevelUpBuff: false,
								}
							: prev,
					);
				});
			}, 2000);
		}, 1000);
	};

	const selectFishingMoveById = (moveId: FishingPlayerMoveId) => {
		if (!fishing || fishing.phase !== "player_turn") return;
		if (!fishingMoveUnlocks[moveId]) return;
		if (moveId === "cut_line") {
			setFishing({
				...fishing,
				phase: "cut_line",
				message: "You cut the line.",
				showMenu: false,
				openingStage: "ready",
				playerAnim: null,
				fishAnim: null,
				playerToasts: [],
				fishToasts: [],
				awaitingLevelUpBuffChoice: false,
				canChooseLevelUpBuff: false,
			});
			finishFishingEncounter("cut_line");
			return;
		}
		const turnStart = fishing;
		const playerTurn = resolvePlayerFishingMove({
			moveId,
			fishing: turnStart,
			randomRoll,
			fishingRodTierLevel: tools.fishingRod,
		});
		const postPlayerState: FishingState = {
			...playerTurn.fishing,
			playerPerTurnModifiers: upsertPlayerPerTurnModifier(
				playerTurn.fishing.playerPerTurnModifiers,
				playerTurn.addPlayerPerTurnModifier,
			),
			fishPerTurnModifiers: upsertFishPerTurnModifier(
				playerTurn.fishing.fishPerTurnModifiers,
				playerTurn.addFishPerTurnModifier,
			),
		};
		const playerTurnToasts = buildFishingTurnToastDrafts(
			turnStart,
			postPlayerState,
			0,
		);
		const playerIntroToasts = stampFishingToasts(playerTurnToasts.player);
		const playerImpactToasts: FishingCombatToast[] = [];
		const fishImpactToasts = stampFishingToasts(playerTurnToasts.fish);
		playNotification();
		setFishing({
			...turnStart,
			phase: "player_action",
			message: buildPlayerActionIntroText(moveId),
			showMenu: false,
			openingStage: "ready",
			playerAnim: "stretch",
			fishAnim: null,
			playerToasts: playerIntroToasts,
			fishToasts: [],
			awaitingLevelUpBuffChoice: false,
			canChooseLevelUpBuff: false,
			expBarLevelUpBurst: false,
		});
		fishingResolveTimeoutRef.current = window.setTimeout(() => {
			const fishDamage = Math.max(0, turnStart.fishHp - postPlayerState.fishHp);
			setFishing({
				...postPlayerState,
				phase: "player_action",
				message: playerTurn.message,
				showMenu: false,
				openingStage: "ready",
				playerAnim: playerImpactToasts.length > 0 ? "squash" : null,
				fishAnim: fishImpactToasts.length > 0 ? "squash" : null,
				playerToasts: playerImpactToasts,
				fishToasts: fishImpactToasts,
				expBarLevelUpBurst: false,
			});
			if (fishDamage > 0) {
				playFishingImpactSound(FISHING_PLAYER_MOVE_IMPACT_SOUNDS[moveId]);
			}
			addLog(playerTurn.message);
			fishingResolveTimeoutRef.current = window.setTimeout(() => {
				if (playerTurn.caught) {
					resolveCaughtEncounter(postPlayerState);
					return;
				}
				runFishTurn(postPlayerState, stamina);
			}, 2000);
		}, 1000);
	};

	const selectFishingMove = () => {
		if (!fishing || fishing.phase !== "player_turn") return;
		const unlockedMoves = FISHING_PLAYER_MOVE_ORDER.filter(
			(move) => fishingMoveUnlocks[move],
		);
		if (unlockedMoves.length === 0) return;
		const currentMoveId = FISHING_PLAYER_MOVE_ORDER[fishing.selectedMoveIndex];
		const moveId =
			currentMoveId && fishingMoveUnlocks[currentMoveId]
				? currentMoveId
				: unlockedMoves[0]!;
		selectFishingMoveById(moveId);
	};

	const moveFishingBuffSelection = (delta: number) => {
		setFishing((prev) => {
			if (!prev || !prev.awaitingLevelUpBuffChoice) return prev;
			const nextIndex = prev.selectedMoveIndex + delta;
			return {
				...prev,
				selectedMoveIndex: Math.max(0, Math.min(1, nextIndex)),
			};
		});
	};

	const selectFishingLevelUpBuffChoice = (choiceIndex?: number) => {
		if (
			!fishing ||
			!fishing.awaitingLevelUpBuffChoice ||
			!fishing.canChooseLevelUpBuff
		)
			return;
		const pickedIndex =
			choiceIndex === undefined ? fishing.selectedMoveIndex : Math.max(0, Math.min(1, choiceIndex));
		const choseAttack = pickedIndex <= 0;
		const chosenAttribute = choseAttack ? "Attack" : "Defense";
		const chosenStatKey: "attack" | "defense" = choseAttack ? "attack" : "defense";
		const amount = choseAttack
			? fishing.levelUpBuffAttackAmount
			: fishing.levelUpBuffDefenseAmount;
		const levelUpBuffToasts = stampFishingToasts([
			{
				kind: "stat",
				text: `+${amount} ${fishingStatIconByKey[chosenStatKey]}`,
				tone: "buff",
			},
		]);
		setFishingProgress((prev) => ({
			...prev,
			attackBonus: prev.attackBonus + (choseAttack ? amount : 0),
			defenseBonus: prev.defenseBonus + (choseAttack ? 0 : amount),
		}));
		playNotification();
		setFishing((prev) =>
			prev
				? {
						...prev,
						phase: "caught",
						message: `Your ${chosenAttribute} rose by ${amount}!`,
						showMenu: false,
						openingStage: "ready",
						playerAnim: "stretch",
						fishAnim: "defeat",
						playerToasts: levelUpBuffToasts,
						fishToasts: [],
						awaitingLevelUpBuffChoice: false,
						canChooseLevelUpBuff: false,
						playerAttack: prev.playerAttack + (choseAttack ? amount : 0),
						playerDefense: prev.playerDefense + (choseAttack ? 0 : amount),
						expBarLevelUpBurst: false,
					}
				: prev,
		);
		fishingResolveTimeoutRef.current = window.setTimeout(() => {
			const compliment =
				FISHING_LEVEL_UP_COMPLIMENTS[
					randomInt(0, FISHING_LEVEL_UP_COMPLIMENTS.length - 1)
				]!;
			setFishing((prev) =>
				prev
					? {
							...prev,
							phase: "caught",
							message: compliment,
							showMenu: false,
							openingStage: "ready",
							playerAnim: null,
							fishAnim: "defeat",
							playerToasts: [],
							fishToasts: [],
							expBarLevelUpBurst: false,
						}
					: prev,
			);
			fishingResolveTimeoutRef.current = window.setTimeout(() => {
				endFishing();
			}, 2000);
		}, 2000);
	};

	const cutFishingLine = () => {
		selectFishingMoveById("cut_line");
	};

	const startFishing = (map: MapId, x: number, y: number) => {
		clearFishingTimers();
		pendingFishingRewardRef.current = null;
		startFishingSequence({
			map,
			x,
			y,
			castX: playerRef.current.x,
			castY: playerRef.current.y,
			fishing,
			hasBlockingModal: !!modal || !!dayTransition,
			playWater,
			setFishing,
			addLog,
			randomInt,
			waitTimeoutRef: fishingWaitTimeoutRef,
			onEncounterReady: () => {
				const category = getFishingCategoryForMap(map);
				const fishDef = pickFishForEncounter(category, randomRoll);
				const fishMovePool = getFishMovePoolWithFallback(fishDef.movePool);
				const playerLevel = fishingProgress.level;
				const playerAttack =
					getFishingAttackForLevel(playerLevel) + fishingProgress.attackBonus;
				const playerDefense =
					getFishingDefenseForLevel(playerLevel) + fishingProgress.defenseBonus;
				fadeOutCurrentAreaMusic(500);
				startBattleMusicLoop();
				setPauseGame(true);
				setFishing((prev) => {
					if (!prev || prev.phase !== "waiting") return prev;
					return {
						...prev,
						phase: "intro",
						message: `You hooked a ${fishDef.name}!`,
						selectedMoveIndex: 0,
						fishId: fishDef.id,
						fishName: fishDef.name,
						fishGlyph: fishDef.glyph,
						fishExpGranted: fishDef.expGranted,
						fishMaxHp: fishDef.stats.maxHp,
						fishHp: fishDef.stats.maxHp,
						fishAttack: fishDef.stats.attack,
						fishDefense: fishDef.stats.defense,
						fishMovePool,
						playerLevel: fishingProgress.level,
						playerExp: fishingProgress.exp,
						playerAttack,
						playerDefense,
						awaitingLevelUpBuffChoice: false,
						canChooseLevelUpBuff: false,
						levelUpBuffAttackAmount: 0,
						levelUpBuffDefenseAmount: 0,
						showMenu: false,
						openingStage: "fade_bg",
						playerAnim: null,
						fishAnim: null,
					};
				});
				fishingResolveTimeoutRef.current = window.setTimeout(() => {
					setFishing((prev) =>
						prev && prev.phase === "intro"
							? { ...prev, openingStage: "fish_enter" }
							: prev,
					);
					fishingResolveTimeoutRef.current = window.setTimeout(() => {
						setFishing((prev) =>
							prev && prev.phase === "intro"
								? { ...prev, openingStage: "fish_hook_text", fishAnim: "bobble" }
								: prev,
						);
						fishingResolveTimeoutRef.current = window.setTimeout(() => {
							setFishing((prev) =>
								prev && prev.phase === "intro"
									? {
											...prev,
											openingStage: "player_stats_enter",
											fishAnim: null,
										}
									: prev,
							);
							fishingResolveTimeoutRef.current = window.setTimeout(() => {
								setFishing((prev) =>
									prev && prev.phase === "intro"
										? {
												...prev,
												phase: "player_turn",
												showMenu: true,
												openingStage: "ready",
												message: "What would you like to do?",
												playerAnim: null,
												fishAnim: null,
											}
										: prev,
								);
							}, 1000);
						}, 2000);
					}, 1000);
				}, 2000);
			},
		});
	};

	useEffect(() => {
		if (!fishing || fishing.phase !== "waiting") return;
		const movedAway =
			player.map !== fishing.map || player.x !== fishing.castX || player.y !== fishing.castY;
		if (!movedAway) return;
		clearFishingTimers();
		setFishing(null);
		setLog((prev) => {
			const next = [...prev, "You moved away and reeled in early."];
			while (next.length > 12) next.shift();
			return next;
		});
	}, [
		fishing,
		player.map,
		player.x,
		player.y,
		clearFishingTimers,
		setFishing,
		setLog,
	]);

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
		gameStateRef.current = gameState;
	}, [gameState]);

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

	const AQUARIUM_TANK_TILE_BY_CATEGORY = {
		freshwater: "\u0192",
		saltwater: "\u00A2",
		cavewater: "\u00A4",
	} as const;
	const AQUARIUM_CURATOR_ANCHOR: Point = { x: 20, y: 11 };

	const isAquariumPathTile = (x: number, y: number) =>
		activeMapLayouts.aquarium?.[y]?.[x] === "=";

	const isAquariumFishTileForCategory = (
		x: number,
		y: number,
		category: "freshwater" | "saltwater" | "cavewater",
	) => activeMapLayouts.aquarium?.[y]?.[x] === AQUARIUM_TANK_TILE_BY_CATEGORY[category];

	const isAquariumFishYAllowedForBehavior = (
		y: number,
		behavior: "simple_wander" | "fixed_bottom" | "wander_top" | "wander_bottom",
	) => {
		if (behavior === "fixed_bottom") return y === 7;
		if (behavior === "wander_top") return y === 1 || y === 2;
		if (behavior === "wander_bottom") return y === 6 || y === 7;
		return true;
	};

	const pickRandomAquariumFishTile = (
		category: "freshwater" | "saltwater" | "cavewater",
		behavior: "simple_wander" | "fixed_bottom" | "wander_top" | "wander_bottom",
		occupiedKeys: Set<string>,
	) => {
		const candidates: Point[] = [];
		const rows = activeMapLayouts.aquarium;
		for (let y = 0; y < rows.length; y += 1) {
			for (let x = 0; x < (rows[0]?.length ?? 0); x += 1) {
				if (!isAquariumFishTileForCategory(x, y, category)) continue;
				if (!isAquariumFishYAllowedForBehavior(y, behavior)) continue;
				const key = keyForPos(x, y);
				if (occupiedKeys.has(key)) continue;
				candidates.push({ x, y });
			}
		}
		if (candidates.length <= 0) return null;
		return candidates[randomInt(0, candidates.length - 1)]!;
	};

	useEffect(() => {
		const donatedFishIds = fishItemCatalog
			.filter((fish) => aquariumDonations[fish.itemId])
			.map((fish) => fish.itemId);
		setAquariumFishTiles((prev) => {
			const occupied = new Set<string>();
			const next: Array<{
				fishId: string;
				glyph: string;
				x: number;
				y: number;
				facing: 1 | -1;
			}> = [];
			donatedFishIds.forEach((fishId) => {
				const fishMeta = fishItemCatalog.find((fish) => fish.itemId === fishId);
				if (!fishMeta) return;
				const previous = prev.find((entry) => entry.fishId === fishId);
				if (
					previous &&
					isAquariumFishTileForCategory(previous.x, previous.y, fishMeta.category) &&
					isAquariumFishYAllowedForBehavior(
						previous.y,
						fishMeta.aquariumNpcBehavior,
					) &&
					!occupied.has(keyForPos(previous.x, previous.y))
				) {
					next.push(previous);
					occupied.add(keyForPos(previous.x, previous.y));
					return;
				}
				const randomTile = pickRandomAquariumFishTile(
					fishMeta.category,
					fishMeta.aquariumNpcBehavior,
					occupied,
				);
				if (!randomTile) return;
				next.push({ fishId, glyph: fishMeta.glyph, ...randomTile, facing: 1 });
				occupied.add(keyForPos(randomTile.x, randomTile.y));
			});
			return next;
		});
	}, [aquariumDonations, activeMapLayouts.aquarium]);

	useEffect(() => {
		if (!aquariumCuratorTile || isAquariumPathTile(aquariumCuratorTile.x, aquariumCuratorTile.y))
			return;
		if (isAquariumPathTile(AQUARIUM_CURATOR_ANCHOR.x, AQUARIUM_CURATOR_ANCHOR.y)) {
			setAquariumCuratorTile({ ...AQUARIUM_CURATOR_ANCHOR });
			return;
		}
		const rows = activeMapLayouts.aquarium;
		for (let y = 0; y < rows.length; y += 1) {
			for (let x = 0; x < (rows[0]?.length ?? 0); x += 1) {
				if (!isAquariumPathTile(x, y)) continue;
				setAquariumCuratorTile({ x, y });
				return;
			}
		}
		setAquariumCuratorTile(null);
	}, [aquariumCuratorTile, activeMapLayouts.aquarium]);

	useEffect(() => {
		if (player.map !== "aquarium") return;
		if (!aquariumCuratorTile) {
			setAquariumCuratorTile({ ...AQUARIUM_CURATOR_ANCHOR });
		}
	}, [player.map, aquariumCuratorTile]);

	useEffect(() => {
		if (player.map !== "aquarium") return;
		const interval = window.setInterval(() => {
			setAquariumFishTiles((prev) => {
				if (prev.length <= 0) return prev;
				const occupied = new Set(prev.map((fish) => keyForPos(fish.x, fish.y)));
				let changed = false;
				const next = prev.map((fish) => {
					const fishMeta = fishItemCatalog.find((item) => item.itemId === fish.fishId);
					if (!fishMeta) return fish;
					if (fishMeta.aquariumNpcBehavior === "fixed_bottom") return fish;
					if (randomRoll() < 0.55) return fish;
					const deltas = Object.values(npcMoveDirections).sort(
						() => randomRoll() - 0.5,
					);
					for (const delta of deltas) {
						const nx = fish.x + delta.dx;
						const ny = fish.y + delta.dy;
						if (!isAquariumFishTileForCategory(nx, ny, fishMeta.category)) continue;
						if (
							!isAquariumFishYAllowedForBehavior(
								ny,
								fishMeta.aquariumNpcBehavior,
							)
						)
							continue;
						const nextKey = keyForPos(nx, ny);
						if (
							player.map === "aquarium" &&
							player.x === nx &&
							player.y === ny
						)
							continue;
						if (occupied.has(nextKey)) continue;
						occupied.delete(keyForPos(fish.x, fish.y));
						occupied.add(nextKey);
						changed = true;
						return {
							...fish,
							x: nx,
							y: ny,
							facing: nx > fish.x ? -1 : nx < fish.x ? 1 : fish.facing,
						};
					}
					return fish;
				});
				return changed ? next : prev;
			});
			setAquariumCuratorTile((prev) => {
				if (!prev) return prev;
				const deltas = Object.values(npcMoveDirections).sort(
					() => randomRoll() - 0.5,
				);
				for (const delta of deltas) {
					const nx = prev.x + delta.dx;
					const ny = prev.y + delta.dy;
					if (!isAquariumPathTile(nx, ny)) continue;
					if (
						Math.max(
							Math.abs(nx - AQUARIUM_CURATOR_ANCHOR.x),
							Math.abs(ny - AQUARIUM_CURATOR_ANCHOR.y),
						) > 5
					)
						continue;
					if (
						player.map === "aquarium" &&
						player.x === nx &&
						player.y === ny
					)
						continue;
					return { x: nx, y: ny };
				}
				return prev;
			});
		}, 1000);
		return () => window.clearInterval(interval);
	}, [player.map, player.x, player.y]);

	useEffect(() => {
		if (player.map !== "aquarium") {
			setAquariumBubbles([]);
			return;
		}
		const tankDefs = [
			{ id: "fresh" as const, minX: 2, maxX: 11 },
			{ id: "salt" as const, minX: 15, maxX: 24 },
			{ id: "cave" as const, minX: 28, maxX: 38 },
		];
		const isValidWaterPos = (
			x: number,
			y: number,
			tank: "fresh" | "salt" | "cave",
		) => {
			if (y < 1 || y > 7) return false;
			const def = tankDefs.find((t) => t.id === tank);
			if (!def) return false;
			return x >= def.minX && x <= def.maxX;
		};
		const pickXForTank = (
			tank: (typeof tankDefs)[number],
			current: Array<{ x: number; y: number; tank: "fresh" | "salt" | "cave" }>,
		) => {
			const candidates: number[] = [];
			for (let x = tank.minX; x <= tank.maxX; x += 1) {
				if (tank.id === "salt" && x === 23) continue;
				if (tank.id === "cave" && (x === 28 || x === 37 || x === 38)) continue;
				if (!current.some((b) => b.x === x && b.y === 7 && b.tank === tank.id))
					candidates.push(x);
			}
			const fallback: number[] = [];
			for (let x = tank.minX; x <= tank.maxX; x += 1) {
				if (tank.id === "salt" && x === 23) continue;
				if (tank.id === "cave" && (x === 28 || x === 37 || x === 38)) continue;
				fallback.push(x);
			}
			const pool = candidates.length > 0 ? candidates : fallback;
			if (pool.length === 0) return null;
			return pool[randomInt(0, pool.length - 1)]!;
		};
		const interval = window.setInterval(() => {
			setAquariumBubbles((prev) => {
				let next = prev
					.map((bubble) => ({ ...bubble, y: bubble.y - 1 }))
					.filter((bubble) => isValidWaterPos(bubble.x, bubble.y, bubble.tank));
				tankDefs.forEach((tank) => {
					const inTank = (b: {
						x: number;
						y: number;
						tank: "fresh" | "salt" | "cave";
					}) => b.tank === tank.id;
					const tankBubbles = next.filter(inTank);
					if (tankBubbles.length > 3) {
						const overflow = tankBubbles.length - 3;
						let removed = 0;
						next = next.filter((b) => {
							if (!inTank(b)) return true;
							if (removed < overflow) {
								removed += 1;
								return false;
							}
							return true;
						});
					}
					let count = next.filter(inTank).length;
					while (count < 2) {
						const x = pickXForTank(tank, next);
						if (x === null) break;
						next.push({ x, y: 7, tank: tank.id });
						count += 1;
					}
					if (count < 3 && randomRoll() < 0.4) {
						const x = pickXForTank(tank, next);
						if (x !== null) next.push({ x, y: 7, tank: tank.id });
					}
				});
				return next;
			});
		}, 1200);
		return () => window.clearInterval(interval);
	}, [player.map]);

	useEffect(() => {
		if (player.map !== "aquarium") {
			setAquariumSeaweedXs([]);
			setAquariumOceanSeaweedXs([]);
			return;
		}
		const nextFresh: number[] = [];
		for (let x = 2; x <= 11; x += 1) {
			if (x === 3) continue;
			if (randomRoll() < 0.5) nextFresh.push(x);
		}
		const oceanCandidates: number[] = [];
		for (let x = 15; x <= 24; x += 1) {
			if (x !== 23) oceanCandidates.push(x);
		}
		for (let i = oceanCandidates.length - 1; i > 0; i -= 1) {
			const j = randomInt(0, i);
			const tmp = oceanCandidates[i]!;
			oceanCandidates[i] = oceanCandidates[j]!;
			oceanCandidates[j] = tmp;
		}
		const nextOcean = oceanCandidates.slice(0, 3);
		setAquariumSeaweedXs(nextFresh);
		setAquariumOceanSeaweedXs(nextOcean);
	}, [player.map]);

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
		if (playerEmoji !== GLYPH.fish) return;
		const waterCapacity = getWaterCapacity(tools);
		if (waterLevel === waterCapacity) return;
		setWaterLevel(waterCapacity);
	}, [playerEmoji, tools, waterLevel]);

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

	useEffect(() => {
		if (playerEmoji !== GLYPH.toilet) return;
		if (player.map === "forest") {
			const poo = forestEnemies.find(
				(enemy) =>
					enemy.type === "poop" &&
					enemy.x === player.x &&
					enemy.y === player.y,
			);
			if (!poo) return;
			playWater();
			setForestEnemies((prev) => prev.filter((enemy) => enemy.id !== poo.id));
			awardToiletPrize();
			return;
		}
		if (player.map === "cave") {
			const poo = caveEnemies.find(
				(enemy) =>
					enemy.type === "poop" &&
					enemy.x === player.x &&
					enemy.y === player.y,
			);
			if (!poo) return;
			playWater();
			setCaveEnemies((prev) => prev.filter((enemy) => enemy.id !== poo.id));
			awardToiletPrize();
		}
	}, [playerEmoji, player.map, player.x, player.y, forestEnemies, caveEnemies]);

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
		options?: {
			ignoreEnemyId?: number;
			allowWaterWalk?: boolean;
			allowStepOnPoo?: boolean;
		},
	) => {
		if (x < 0 || y < 0) return false;
		const rows = activeMapLayouts[map];
		if (!rows || y >= rows.length || x >= (rows[0]?.length ?? 0)) return false;
		if (map === "forest") {
			const tile = rows[y]?.[x] ?? "T";
			if (
				options?.allowWaterWalk &&
				(tile === "~" || tile === "[")
			) {
				if (isForestOccupied(x, y, options?.ignoreEnemyId)) return false;
				return true;
			}
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
			const occupiedByBlockedEnemy = forestEnemies.some(
				(e) =>
					e.id !== options?.ignoreEnemyId &&
					e.x === x &&
					e.y === y &&
					!(options?.allowStepOnPoo && e.type === "poop"),
			);
			if (
				forestObstacles.some((o) => o.x === x && o.y === y) ||
				occupiedByBlockedEnemy
			) {
				return false;
			}
			return true;
		}
		if (map === "cave") {
			const tile = rows[y]?.[x] ?? "<";
			if (
				options?.allowWaterWalk &&
				(tile === "~" || tile === "[")
			) {
				if (isCaveOccupied(x, y, options?.ignoreEnemyId)) return false;
				return true;
			}
			if (!isCaveWalkableTile(tile) || isCaveBlockedTile(tile)) return false;
			if (caveLadderPos && x === caveLadderPos.x && y === caveLadderPos.y) {
				return true;
			}
			const occupiedByBlockedEnemy = caveEnemies.some(
				(e) =>
					e.id !== options?.ignoreEnemyId &&
					e.x === x &&
					e.y === y &&
					!(options?.allowStepOnPoo && e.type === "poop"),
			);
			if (
				caveObstacles.some((o) => o.x === x && o.y === y) ||
				occupiedByBlockedEnemy
			) {
				return false;
			}
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
		if (options?.allowWaterWalk && (tile === "~" || tile === "[")) {
			return true;
		}
		return isPassableChar(tile);
	};

	const canEnterForest = () => stamina > 0;
	const canEnterCave = () => stamina > 0;
	const awardToiletPrize = () => {
		const roll = randomRoll();
		if (roll < 0.5) {
			const amount = randomInt(100, 500);
			applyMoneyDelta(amount);
			addLog(`Found $${amount} in the mess.`);
			return;
		}
		if (roll < 0.9) {
			const amount = randomInt(10, 20);
			updateInventory("feed", amount);
			addLog(`Found animal feed x${amount}.`);
			return;
		}
		const amount = randomInt(1, 5);
		updateInventory("iron", amount);
		addLog(`Found iron x${amount}.`);
	};

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
	const getPrioritizedFleeDirs = (
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
			.sort((a, b) => b.distance - a.distance);
	const maybeMoveEnemyAwayFromPlayer = (
		enemy: ForestEnemy,
		map: "forest" | "cave",
		playerNow: typeof playerRef.current,
		playerInMap: boolean,
	): ForestEnemy | null => {
		const shouldFlee =
			playerEmoji === GLYPH.tRex ||
			(playerEmoji === GLYPH.toilet && enemy.type === "poop");
		if (!shouldFlee || !playerInMap) return null;
		const currentDistance = Math.max(
			Math.abs(playerNow.x - enemy.x),
			Math.abs(playerNow.y - enemy.y),
		);
		if (currentDistance > 4) return null;
		const fleeDirs = getPrioritizedFleeDirs(
			enemy.x,
			enemy.y,
			playerNow.x,
			playerNow.y,
		);
		for (const delta of fleeDirs) {
			const nx = enemy.x + delta.dx;
			const ny = enemy.y + delta.dy;
			if (delta.distance <= currentDistance) continue;
			if (!isPassableAt(map, nx, ny, { ignoreEnemyId: enemy.id })) continue;
			return { ...enemy, x: nx, y: ny };
		}
		return enemy;
	};

	const maybeMoveForestEnemy = (
		enemy: ForestEnemy,
		isHalfTick: boolean,
	): ForestEnemy => {
		if (simulationPaused) return enemy;
		const playerNow = playerRef.current;
		const playerInForest = playerNow.map === "forest";
		const fleeMove = maybeMoveEnemyAwayFromPlayer(
			enemy,
			"forest",
			playerNow,
			playerInForest,
		);
		if (fleeMove) return fleeMove;

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
		const bearsIgnorePlayer = playerEmoji === GLYPH.teddy;
		const playerInBearArea =
			!bearsIgnorePlayer &&
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
			if (
				!bearsIgnorePlayer &&
				playerInForest &&
				nx === playerNow.x &&
				ny === playerNow.y
			) {
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
		const fleeMove = maybeMoveEnemyAwayFromPlayer(
			enemy,
			"cave",
			playerNow,
			playerInCave,
		);
		if (fleeMove) return fleeMove;

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

		const bearsIgnorePlayer = playerEmoji === GLYPH.teddy;
		const playerInBearArea =
			!bearsIgnorePlayer &&
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
			if (
				!bearsIgnorePlayer &&
				playerInCave &&
				nx === playerNow.x &&
				ny === playerNow.y
			) {
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
		stopBattleMusicLoop();
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
			hasBath:
				(rawState as Partial<GameState>).hasBath ?? false,
			pendingBathInstall:
				(rawState as Partial<GameState>).pendingBathInstall ?? false,
			hasWardrobe:
				(rawState as Partial<GameState>).hasWardrobe ?? false,
			pendingWardrobeInstall:
				(rawState as Partial<GameState>).pendingWardrobeInstall ?? false,
			clothingShopOpeningAnnounced:
				(rawState as Partial<GameState>).clothingShopOpeningAnnounced ?? false,
			hasAutoCollector:
				(rawState as Partial<GameState>).hasAutoCollector ?? false,
			pendingAutoCollectorInstall:
				(rawState as Partial<GameState>).pendingAutoCollectorInstall ?? false,
			hasAutoFeeder:
				(rawState as Partial<GameState>).hasAutoFeeder ?? false,
			pendingAutoFeederInstall:
				(rawState as Partial<GameState>).pendingAutoFeederInstall ?? false,
			newspaperImage:
				(rawState as Partial<GameState>).newspaperImage ??
				generateNewspaperEmojiPicture(rawState.newspaper ?? ""),
			newspaperRead:
				(rawState as Partial<GameState>).newspaperRead ?? false,
			fishingProgress: (() => {
				const rawProgress = (rawState as Partial<GameState>).fishingProgress;
				const level = Math.max(1, Math.min(100, rawProgress?.level ?? 1));
				const maxExp = level >= 100 ? 0 : getFishingExpToNextLevel(level) - 1;
				const exp = Math.max(0, Math.min(maxExp, rawProgress?.exp ?? 0));
				const attackBonus = Math.max(0, rawProgress?.attackBonus ?? 0);
				const defenseBonus = Math.max(0, rawProgress?.defenseBonus ?? 0);
				return { level, exp, attackBonus, defenseBonus };
			})(),
			fishingMoveUnlocks: (() => {
				const defaults = createInitialFishingMoveUnlocks();
				const rawUnlocks = (rawState as Partial<GameState>).fishingMoveUnlocks;
				const merged = { ...defaults, ...(rawUnlocks ?? {}) };
				const level = Math.max(1, (rawState as Partial<GameState>).fishingProgress?.level ?? 1);
				if (level >= 2) merged.pull_rod = true;
				return merged;
			})(),
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
			progressPercent: Math.max(
				0,
				Math.min(1000, (rawState as Partial<GameState>).progressPercent ?? 0),
			),
			progressWon: (rawState as Partial<GameState>).progressWon ?? false,
			progressWinPopupShown:
				(rawState as Partial<GameState>).progressWinPopupShown ?? false,
			progressStoneTargetCounts: {
				...makeEmptyProgressTargetCounts(),
				...((rawState as Partial<GameState>).progressStoneTargetCounts ?? {}),
			},
			progressStoneAlgorithmCounts: {
				...makeEmptyProgressAlgorithmCounts(),
				...((rawState as Partial<GameState>).progressStoneAlgorithmCounts ?? {}),
			},
			progressLoadoutRows:
				(rawState as Partial<GameState>).progressLoadoutRows ??
				makeEmptyProgressLoadoutRows(),
			highestForestLevelReached: Math.max(
				rawState.forestLevel,
				(rawState as Partial<GameState>).highestForestLevelReached ??
					rawState.forestLevel,
			),
			highestCaveLevelReached: Math.max(
				rawState.caveLevel,
				(rawState as Partial<GameState>).highestCaveLevelReached ??
					rawState.caveLevel,
			),
			inventory: (() => {
				const defaultInventory = makeEmptyInventory();
				const rawInventory = (rawState as Partial<GameState>).inventory as
					| Record<string, number>
					| undefined;
				const migratedFishCount = Math.max(0, rawInventory?.fish ?? 0);
				const migratedInventory: Inventory = {
					...defaultInventory,
					...(rawInventory as Partial<Inventory>),
				};
				if (migratedFishCount > 0) {
					migratedInventory.river_perch_01 += migratedFishCount;
				}
				return migratedInventory;
			})(),
			aquariumDonations: (() => {
				const defaults = makeEmptyAquariumInventory();
				const rawDonations = (rawState as Partial<GameState>).aquariumDonations as
					| AquariumDonationInventory
					| undefined;
				if (!rawDonations) return defaults;
				return { ...defaults, ...rawDonations };
			})(),
			prices: {
				...initialPrices,
				...((rawState as Partial<GameState>).prices ?? {}),
			},
			priceTrends: {
				...initialPriceTrends,
				...((rawState as Partial<GameState>).priceTrends ?? {}),
			},
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
	const toggleControlMode = () => {
		setControlMode((prev) => (prev === "pc" ? "mobile" : "pc"));
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
		setHighestForestLevelReached((prev) => Math.max(prev, nextLevel));
		emitProgressEvent({ type: "forest_depth_advanced", forestLevel: nextLevel });
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
		setHighestCaveLevelReached((prev) => Math.max(prev, nextLevel));
		emitProgressEvent({ type: "cave_depth_advanced", caveLevel: nextLevel });
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
		if (map === "aquarium") {
			return !!aquariumCuratorTile && aquariumCuratorTile.x === x && aquariumCuratorTile.y === y;
		}
		if (map === "farm") {
			return (
				(animalsMap === "farm" &&
					Object.values(animalTiles).some(
						(pos) => pos.x === x && pos.y === y,
					)) ||
				(hasAutoCollector &&
					barnAutoCollectorMap === "farm" &&
					!!barnAutoCollectorPos &&
					barnAutoCollectorPos.x === x &&
					barnAutoCollectorPos.y === y) ||
				(hasAutoFeeder &&
					barnAutoFeederMap === "farm" &&
					!!barnAutoFeederPos &&
					barnAutoFeederPos.x === x &&
					barnAutoFeederPos.y === y) ||
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
						barnAutoCollectorMap === "barn" &&
						!!barnAutoCollectorPos &&
						barnAutoCollectorPos.x === x &&
						barnAutoCollectorPos.y === y) ||
					(hasAutoFeeder &&
						barnAutoFeederMap === "barn" &&
						!!barnAutoFeederPos &&
						barnAutoFeederPos.x === x &&
						barnAutoFeederPos.y === y))
			);
		}
		if (map === "forest") {
			const blockOnPoo = playerEmoji !== GLYPH.toilet;
			return (
				forestEnemies.some(
					(e) => e.x === x && e.y === y && (blockOnPoo || e.type !== "poop"),
				) ||
				forestObstacles.some((o) => o.x === x && o.y === y)
			);
		}
		if (map === "cave") {
			const blockOnPoo = playerEmoji !== GLYPH.toilet;
			return (
				caveEnemies.some(
					(e) => e.x === x && e.y === y && (blockOnPoo || e.type !== "poop"),
				) ||
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
		const moveCadenceMs =
			playerEmoji === GLYPH.tRex
				? POSITION_ANIMATION_MS * 4
				: playerEmoji === GLYPH.run
					? POSITION_ANIMATION_MS / 2
				: POSITION_ANIMATION_MS;
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
				isPassableAt: (map, x, y) =>
					isPassableAt(map, x, y, {
						allowWaterWalk: playerEmoji === GLYPH.frog,
						allowStepOnPoo: playerEmoji === GLYPH.toilet,
					}),
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
				handleDoorEntry: (door) => {
					if (door.target.map !== "clothing_shop" || hasWardrobe) return false;
					const line = "They arnt open yet...";
					tileFxBusRef.current.api
						.at({ map: player.map, x: door.x, y: door.y })
						.toast(line);
					speakNpcLine(line);
					return true;
				},
			},
			dir,
		);
		if (didMove) {
			playerMoveUnlockAtRef.current = now + moveCadenceMs;
		}
	};

	useEffect(() => {
		const nextPos = { map: player.map, x: player.x, y: player.y };
		const prevPos = lastStoneHintPlayerPosRef.current;
		if (
			prevPos &&
			prevPos.map === nextPos.map &&
			prevPos.x === nextPos.x &&
			prevPos.y === nextPos.y
		) {
			return;
		}
		lastStoneHintPlayerPosRef.current = nextPos;
		maybeToastComputerLabStoneHints(nextPos);
	}, [player.map, player.x, player.y, progressLoadoutRows]);
	const clearHeldMove = () => {
		heldMoveDirRef.current = null;
		heldMoveKeyRef.current = null;
		if (heldMoveTimerRef.current !== null) {
			window.clearTimeout(heldMoveTimerRef.current);
			heldMoveTimerRef.current = null;
		}
	};

	const scheduleHeldMoveStep = () => {
		const moveCadenceMs =
			playerEmoji === GLYPH.tRex
				? POSITION_ANIMATION_MS * 4
				: playerEmoji === GLYPH.run
					? POSITION_ANIMATION_MS / 2
				: POSITION_ANIMATION_MS;
		if (heldMoveTimerRef.current !== null) return;
		const tick = () => {
			heldMoveTimerRef.current = null;
			const dir = heldMoveDirRef.current;
			if (!dir) return;
			dispatchHeldMoveCommandRef.current(dir);
			heldMoveTimerRef.current = window.setTimeout(tick, moveCadenceMs);
		};
		heldMoveTimerRef.current = window.setTimeout(tick, moveCadenceMs);
	};

	const clearMobileMoveCadence = () => {
		mobileMoveCadenceDirRef.current = null;
		if (mobileMoveCadenceTimerRef.current !== null) {
			window.clearTimeout(mobileMoveCadenceTimerRef.current);
			mobileMoveCadenceTimerRef.current = null;
		}
	};

	const clearMobileMoveJoystick = () => {
		mobileMoveJoystickTouchIdRef.current = null;
		setMobileMoveJoystickAnchor(null);
		setMobileMoveJoystickThumb(null);
		clearMobileMoveCadence();
	};

	const clearMobileInteractJoystick = () => {
		mobileInteractJoystickTouchIdRef.current = null;
		setMobileInteractJoystickAnchor(null);
		setMobileInteractJoystickThumb(null);
		mobileInteractSwipeUsedRef.current = false;
		mobileInteractCommandSentRef.current = false;
	};

	const emitProgressEvent = (event: ProgressEventPayload) => {
		const state = gameStateRef.current;
		const result = applyProgressEventToState(
			{
				progressPercent: state.progressPercent,
				progressWon: state.progressWon,
				progressLoadoutRows: state.progressLoadoutRows,
				inventory: state.inventory,
				aquariumDonations: state.aquariumDonations,
				animals: state.animals,
				plots: state.plots,
				tools: state.tools,
				barnTier: state.barnTier,
				highestForestLevelReached: state.highestForestLevelReached,
				highestCaveLevelReached: state.highestCaveLevelReached,
			},
			event,
		);
		if (result.increment <= 0) return;
		setProgressPercent(result.progressPercent);
		setProgressWon(result.progressWon);
		if (result.progressWinPopupShown && !state.progressWinPopupShown) {
			setProgressWinPopupShown(true);
			window.setTimeout(() => {
				openMenu("Victory", ["You win!"], [{ label: "Nice!", onSelect: closeMenu }]);
			}, 0);
		}
		gameStateRef.current = {
			...state,
			progressPercent: result.progressPercent,
			progressWon: result.progressWon,
			progressWinPopupShown:
				state.progressWinPopupShown || result.progressWinPopupShown,
		};
	};

	const updateInventory = (
		item: ItemId,
		amount: number,
		options?: { toastText?: string; suppressToast?: boolean },
	) => {
		updateInventoryState(setInventory, item, amount);
		if (amount > 0 && !options?.suppressToast) {
			const icon = itemIcons[item] ?? "";
			const toastText = options?.toastText ?? `+${amount} ${icon}`.trim();
			tileFxBusRef.current.api.actor("player").toast(toastText);
		}
	};

	const applyMoneyDelta = (delta: number) => {
		applyMoneyDeltaState(setMoney, setCurrentDayEarned, setTotalEarned, delta);
		if (delta > 0) {
			tileFxBusRef.current.api.actor("player").toast(`+$${delta}`);
			emitProgressEvent({ type: "money_gained", moneyDelta: delta });
		}
	};

	const grantProgressStone = (
		kind: "target" | "algorithm",
		stoneId: ProgressTargetId | ProgressAlgorithmId,
		label: string,
	) => {
		if (kind === "target") {
			setProgressStoneTargetCounts((prev) => ({
				...prev,
				[stoneId as ProgressTargetId]: (prev[stoneId as ProgressTargetId] ?? 0) + 1,
			}));
			gameStateRef.current = {
				...gameStateRef.current,
				progressStoneTargetCounts: {
					...gameStateRef.current.progressStoneTargetCounts,
					[stoneId as ProgressTargetId]:
						(gameStateRef.current.progressStoneTargetCounts[
							stoneId as ProgressTargetId
						] ?? 0) + 1,
				},
			};
		} else {
			setProgressStoneAlgorithmCounts((prev) => ({
				...prev,
				[stoneId as ProgressAlgorithmId]:
					(prev[stoneId as ProgressAlgorithmId] ?? 0) + 1,
			}));
			gameStateRef.current = {
				...gameStateRef.current,
				progressStoneAlgorithmCounts: {
					...gameStateRef.current.progressStoneAlgorithmCounts,
					[stoneId as ProgressAlgorithmId]:
						(gameStateRef.current.progressStoneAlgorithmCounts[
							stoneId as ProgressAlgorithmId
						] ?? 0) + 1,
				},
			};
		}
		addLog(`Found progress stone: ${label}.`);
		tileFxBusRef.current.api.actor("player").toast(`+1 ${label}`, 5000);
	};
	const debugGrantAllProgressStones = () => {
		setProgressStoneTargetCounts((prev) => {
			const next = { ...prev };
			for (const stone of progressTargetStones) {
				next[stone.id] = (next[stone.id] ?? 0) + 1;
			}
			return next;
		});
		setProgressStoneAlgorithmCounts((prev) => {
			const next = { ...prev };
			for (const stone of progressAlgorithmStones) {
				next[stone.id] = (next[stone.id] ?? 0) + 1;
			}
			return next;
		});
		const nextTargetCounts = { ...gameStateRef.current.progressStoneTargetCounts };
		for (const stone of progressTargetStones) {
			nextTargetCounts[stone.id] = (nextTargetCounts[stone.id] ?? 0) + 1;
		}
		const nextAlgorithmCounts = { ...gameStateRef.current.progressStoneAlgorithmCounts };
		for (const stone of progressAlgorithmStones) {
			nextAlgorithmCounts[stone.id] = (nextAlgorithmCounts[stone.id] ?? 0) + 1;
		}
		gameStateRef.current = {
			...gameStateRef.current,
			progressStoneTargetCounts: nextTargetCounts,
			progressStoneAlgorithmCounts: nextAlgorithmCounts,
		};
		addLog("Debug grant: +1 of every progress stone.");
		tileFxBusRef.current.api.actor("player").toast("+1 all progress stones", 4500);
	};

	const maybeGrantChestProgressStone = (kind: "forest" | "cave", depth: number) => {
		const milestone = depth % 5 === 0;
		const chance = milestone ? 0.35 : 0.18;
		if (randomRoll() >= chance) return;
		const targetRarities: ProgressRarity[] = milestone
			? ["rare", "legendary"]
			: ["common", "uncommon"];
		const algoRarities: ProgressRarity[] = milestone
			? ["rare", "legendary"]
			: ["common", "uncommon"];
		const targetPool = progressTargetStones.filter((stone) =>
			targetRarities.includes(stone.rarity),
		);
		const algoPool = progressAlgorithmStones.filter((stone) =>
			algoRarities.includes(stone.rarity),
		);
		if (targetPool.length <= 0 && algoPool.length <= 0) return;
		const pickTarget = targetPool.length > 0 && (algoPool.length === 0 || randomRoll() < 0.5);
		if (pickTarget) {
			const stone = targetPool[randomInt(0, targetPool.length - 1)]!;
			grantProgressStone("target", stone.id, stone.name);
			return;
		}
		const stone = algoPool[randomInt(0, algoPool.length - 1)]!;
		grantProgressStone("algorithm", stone.id, stone.name);
		if (kind === "cave" && milestone) {
			addLog("A deep-level chest boosted your chance at rare progress stones.");
		}
	};

	const countUsedTargetStone = (stoneId: ProgressTargetId): number =>
		progressLoadoutRows.filter((row) => row.targetStoneId === stoneId).length;
	const countUsedAlgorithmStone = (stoneId: ProgressAlgorithmId): number =>
		progressLoadoutRows.reduce(
			(total, row) =>
				total + row.algorithmStoneIds.filter((id) => id === stoneId).length,
			0,
		);
	const previewIncrementForLoadoutRow = (row: ProgressLoadoutRow): number => {
		if (!row.targetStoneId) return 0;
		const emptyRows = makeEmptyProgressLoadoutRows();
		const event: ProgressEventPayload =
			row.targetStoneId === "money_gained"
				? { type: "money_gained", moneyDelta: 100 }
				: row.targetStoneId === "aquarium_donated"
					? { type: "aquarium_donated" }
					: row.targetStoneId === "forest_depth_advanced"
						? { type: "forest_depth_advanced", forestLevel: highestForestLevelReached }
						: row.targetStoneId === "cave_depth_advanced"
							? { type: "cave_depth_advanced", caveLevel: highestCaveLevelReached }
							: { type: row.targetStoneId, quantity: 1 };
		const previewState = gameStateRef.current;
		const result = applyProgressEventToState(
			{
				progressPercent: previewState.progressPercent,
				progressWon: previewState.progressWon,
				progressLoadoutRows: [row, emptyRows[1], emptyRows[2]],
				inventory: previewState.inventory,
				aquariumDonations: previewState.aquariumDonations,
				animals: previewState.animals,
				plots: previewState.plots,
				tools: previewState.tools,
				barnTier: previewState.barnTier,
				highestForestLevelReached: previewState.highestForestLevelReached,
				highestCaveLevelReached: previewState.highestCaveLevelReached,
			},
			event,
		);
		return Math.max(0, Math.floor(result.increment));
	};
	const describeLoadoutRowChain = (row: ProgressLoadoutRow): string => {
		const parts = row.algorithmStoneIds
			.map((id) => progressAlgorithmStones.find((stone) => stone.id === id)?.name ?? null)
			.filter((name): name is string => !!name);
		if (parts.length <= 0) return "(none)";
		return parts.join(" -> ");
	};
	const targetStoneToastText = (targetId: ProgressTargetId): string => {
		if (targetId === "money_gained") return "Any time you earn $100";
		if (targetId === "fish_caught") return "When you catch a fish";
		if (targetId === "forest_depth_advanced") return "When you advance deeper in the forest";
		if (targetId === "cave_depth_advanced") return "When you advance deeper in the cave";
		if (targetId === "crop_harvested") return "When you harvest crops";
		if (targetId === "animal_fed") return "When you feed farm animals";
		if (targetId === "milk_collected") return "When you milk a cow";
		if (targetId === "wool_collected") return "When you collect wool";
		if (targetId === "egg_collected") return "When you collect eggs";
		if (targetId === "crop_sold") return "When you sell crops";
		if (targetId === "animal_product_sold") return "When you sell animal products";
		if (targetId === "fish_sold") return "When you sell fish";
		return "When you donate to the aquarium";
	};
	const algorithmStoneToastText = (algorithmId: ProgressAlgorithmId): string => {
		if (algorithmId === "add_1") return "Adds 1";
		if (algorithmId === "add_2") return "Adds 2";
		if (algorithmId === "add_3") return "Adds 3";
		if (algorithmId === "add_5") return "Adds 5";
		if (algorithmId === "add_diamond_count") return "Adds however many diamonds you own";
		if (algorithmId === "add_barn_tier") return "Adds your barn tier";
		if (algorithmId === "add_tier5_tools") return "Adds however many tier 5 tools you unlocked";
		if (algorithmId === "mul_1_25") return "Multiplys by 1.25";
		if (algorithmId === "mul_1_5") return "Multiplys by 1.5";
		if (algorithmId === "mul_2") return "Multiplys by 2";
		if (algorithmId === "mul_donated_fish_count")
			return "Multiplys by however many fish you donated";
		if (algorithmId === "add_cow_count") return "Adds however many cows you own";
		if (algorithmId === "add_sheep_count") return "Adds however many sheep you own";
		if (algorithmId === "add_chicken_count")
			return "Adds however many chickens you own";
		if (algorithmId === "add_crop_count")
			return "Adds however many crops are currently on your farm";
		if (algorithmId === "add_highest_forest_level")
			return "Adds your highest forest level reached";
		return "Adds your highest cave level reached";
	};
	const maybeToastComputerLabStoneHints = (nextPos: {
		map: MapId;
		x: number;
		y: number;
	}) => {
		if (nextPos.map !== "computer_lab") return;
		const rowIndex: 0 | 1 | 2 | -1 =
			nextPos.y === 3 ? 0 : nextPos.y === 5 ? 1 : nextPos.y === 7 ? 2 : -1;
		if (rowIndex < 0) return;
		if (nextPos.x < 3 || nextPos.x > 6) return;
		const row = gameStateRef.current.progressLoadoutRows[rowIndex as 0 | 1 | 2];
		const counterY = nextPos.y - 1;
		if (nextPos.x === 3) {
			if (!row.targetStoneId) return;
			tileFxBusRef.current.api
				.at({ map: "computer_lab", x: 3, y: counterY })
				.toast(targetStoneToastText(row.targetStoneId), 5000);
			return;
		}
		const algoIndex = (nextPos.x - 4) as 0 | 1 | 2;
		const algorithmStoneId = row.algorithmStoneIds[algoIndex];
		if (!algorithmStoneId) return;
		tileFxBusRef.current.api
			.at({ map: "computer_lab", x: nextPos.x, y: counterY })
			.toast(algorithmStoneToastText(algorithmStoneId), 5000);
	};
	const setRowTargetStoneId = (
		prev: [ProgressLoadoutRow, ProgressLoadoutRow, ProgressLoadoutRow],
		rowIndex: 0 | 1 | 2,
		targetStoneId: ProgressTargetId | null,
	): [ProgressLoadoutRow, ProgressLoadoutRow, ProgressLoadoutRow] => {
		if (rowIndex === 0) return [{ ...prev[0], targetStoneId }, prev[1], prev[2]];
		if (rowIndex === 1) return [prev[0], { ...prev[1], targetStoneId }, prev[2]];
		return [prev[0], prev[1], { ...prev[2], targetStoneId }];
	};
	const setAlgorithmSlot = (
		prev: [ProgressLoadoutRow, ProgressLoadoutRow, ProgressLoadoutRow],
		rowIndex: 0 | 1 | 2,
		algoIndex: 0 | 1 | 2,
		stoneId: ProgressAlgorithmId | null,
	): [ProgressLoadoutRow, ProgressLoadoutRow, ProgressLoadoutRow] => {
		const row = prev[rowIndex];
		const algorithmStoneIds: [ProgressAlgorithmId | null, ProgressAlgorithmId | null, ProgressAlgorithmId | null] =
			algoIndex === 0
				? [stoneId, row.algorithmStoneIds[1], row.algorithmStoneIds[2]]
				: algoIndex === 1
					? [row.algorithmStoneIds[0], stoneId, row.algorithmStoneIds[2]]
					: [row.algorithmStoneIds[0], row.algorithmStoneIds[1], stoneId];
		if (rowIndex === 0) return [{ ...row, algorithmStoneIds }, prev[1], prev[2]];
		if (rowIndex === 1) return [prev[0], { ...row, algorithmStoneIds }, prev[2]];
		return [prev[0], prev[1], { ...row, algorithmStoneIds }];
	};

	const canAfford = (value: number) => money >= value;

	const openAquariumCategoryCompletePopup = (
		category: "freshwater" | "saltwater" | "cavewater",
		onDone?: () => void,
	) => {
		const categoryLabel =
			category === "freshwater"
				? "Freshwater"
				: category === "saltwater"
					? "Ocean"
					: "Cave";
		openMenu(
			"Aquarium Curator",
			[
				`OH my! You got all ${categoryLabel} fish!`,
				"Here is a special awward!",
			],
			[
				{
					label: "Thanks",
					onSelect: () => {
						closeMenu();
						onDone?.();
					},
				},
			],
		);
	};

	const interactAquariumCurator = () => {
		const undonatedFish = fishItemCatalog
			.filter((fish) => inventory[fish.itemId] > 0 && !aquariumDonations[fish.itemId])
			.map((fish) => ({ ...fish, quantity: inventory[fish.itemId] }));
		if (undonatedFish.length <= 0) {
			openMenu(
				"Aquarium Curator",
				[
					"Greeeetings. If you catch a fish we dont have, I hope you will consider coming back and donating it!",
				],
				[{ label: "OK", onSelect: closeMenu }],
			);
			return;
		}
		openMenu(
			"Aquarium Curator",
			["Would you like to donate a fish?"],
			[
				...undonatedFish.map((fish) => ({
					label: `${fish.name} (${fish.quantity})`,
					info: ["Donate this fish to the aquarium collection."],
					onSelect: () => {
						if (aquariumDonations[fish.itemId] || inventory[fish.itemId] <= 0) {
							closeMenu();
							return;
						}
						const nextDonations = { ...aquariumDonations, [fish.itemId]: true };
						const previousDonationCount = Object.values(aquariumDonations).filter(Boolean).length;
						const donationNumber = previousDonationCount + 1;
						const categories: Array<"freshwater" | "saltwater" | "cavewater"> = [
							"freshwater",
							"saltwater",
							"cavewater",
						];
						const completedCategories = categories.filter((category) => {
							const categoryFish = fishItemCatalog.filter(
								(item) => item.category === category,
							);
							if (categoryFish.length <= 0) return false;
							const wasComplete = categoryFish.every(
								(item) => aquariumDonations[item.itemId],
							);
							const isNowComplete = categoryFish.every(
								(item) => nextDonations[item.itemId],
							);
							return !wasComplete && isNowComplete;
						});

						updateInventory(fish.itemId, -1, { suppressToast: true });
						setAquariumDonations(nextDonations);
						emitProgressEvent({
							type: "aquarium_donated",
							quantity: 1,
							itemId: fish.itemId,
						});
						addLog(`Donated ${fish.name} to the aquarium.`);
						closeMenu();

						const grantCollectionRewardsAndMaybeShowPopup = (
							onDone?: () => void,
						) => {
							if (completedCategories.length <= 0) {
								onDone?.();
								return;
							}
							updateInventory("diamond", 1);
							updateInventory("emerald", 1);
							updateInventory("ruby", 1);
							let index = 0;
							const showNext = () => {
								if (index >= completedCategories.length) {
									onDone?.();
									return;
								}
								const category = completedCategories[index++]!;
								openAquariumCategoryCompletePopup(category, showNext);
							};
							showNext();
						};

						window.setTimeout(() => {
							if (donationNumber % 5 !== 0) {
								grantCollectionRewardsAndMaybeShowPopup();
								return;
							}
							const unlockableMoves = FISHING_PLAYER_MOVE_ORDER.filter(
								(moveId) => moveId !== "cut_line" && !fishingMoveUnlocks[moveId],
							);
							if (unlockableMoves.length <= 0) {
								updateInventory("emerald", 1);
								openMenu(
									"Aquarium Curator",
									[
										"Thank you for donating so many fish! Just for that, let me teach you a new fishing tequnique",
										"You already know every technique, so please accept this emerald instead.",
									],
									[
										{
											label: "Thanks",
											onSelect: () => {
												closeMenu();
												grantCollectionRewardsAndMaybeShowPopup();
											},
										},
									],
								);
								return;
							}
							openMenu(
								"Aquarium Curator",
								[
									"Thank you for donating so many fish! Just for that, let me teach you a new fishing tequnique",
								],
								[
									...unlockableMoves.map((moveId) => ({
										label: FISHING_PLAYER_MOVES[moveId].label,
										info: [FISHING_PLAYER_MOVES[moveId].description],
										onSelect: () => {
											setFishingMoveUnlocks((prev) => ({ ...prev, [moveId]: true }));
											closeMenu();
											playYaya();
											tileFxBusRef.current.api
												.actor("player")
												.toast(`You learned ${FISHING_PLAYER_MOVES[moveId].label}!`, 6000);
											grantCollectionRewardsAndMaybeShowPopup();
										},
									})),
								],
							);
						}, 0);
					},
				})),
				{ label: "Back", onSelect: closeMenu },
			],
		);
	};

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
			onProgressEvent: emitProgressEvent,
		});
	};

	const interactBuilderVendor = (target: Point) => {
		interactBuilderVendorMenu({
			barnTier,
			pendingBarnUpgrade,
			hasBath,
			pendingBathInstall,
			hasWardrobe,
			pendingWardrobeInstall,
			hasAutoCollector,
			pendingAutoCollectorInstall,
			hasAutoFeeder,
			pendingAutoFeederInstall,
			inventory,
			canAfford,
			playBad,
			addLog,
			speakNpcLine,
			toastBuilderLine: (line, durationMs = 8000) => {
				tileFxBusRef.current.api
					.at({ map: "tool_shop", x: target.x, y: target.y })
					.toast(line, durationMs);
			},
			closeMenu,
			openMenu,
			applyMoneyDelta,
			updateInventory,
			setPendingBarnUpgrade,
			setPendingBathInstall,
			setPendingWardrobeInstall,
			setPendingAutoCollectorInstall,
			setPendingAutoFeederInstall,
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
		const doorBufferDistance = isBarnExternal(barnTier) ? 5 : 0;
		return countOpenBarnTilesInBounds({
			occupied,
			rows,
			bounds: barnInteriorBounds,
			isPassableChar,
			doorBufferDistance,
		});
	};

	const nextOpenBarnTile = (
		occupied: Record<number, { x: number; y: number }>,
	) => {
		const rows = activeMapLayouts[animalsMap];
		const scanFromBottom = isBarnExternal(barnTier);
		const doorBufferDistance = isBarnExternal(barnTier) ? 5 : 0;
		return nextOpenBarnTileInBounds({
			occupied,
			rows,
			bounds: barnInteriorBounds,
			isPassableChar,
			scanFromBottom,
			doorBufferDistance,
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
				const doorBufferDistance = isBarnExternal(barnTier) ? 5 : 0;
				chosen = nextOpenBarnTileInBounds({
					occupied: nextTiles,
					rows,
					bounds: barnInteriorBounds,
					isPassableChar,
					scanFromBottom,
					doorBufferDistance,
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
		if (kind === "auto_feeder_installed")
			return "The auto feeder has been installed in your barn!";
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
		if (kind === "auto_feeder_installed") {
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
			hasBath,
			pendingBathInstall,
			setHasBath,
			setPendingBathInstall,
			hasWardrobe,
			pendingWardrobeInstall,
			setHasWardrobe,
			setPendingWardrobeInstall,
			hasAutoCollector,
			pendingAutoCollectorInstall,
			setHasAutoCollector,
			setPendingAutoCollectorInstall,
			hasAutoFeeder,
			pendingAutoFeederInstall,
			setHasAutoFeeder,
			setPendingAutoFeederInstall,
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
					computerLabMusicRef.current,
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

	useEffect(() => {
		if (!hasWardrobe) return;
		if (clothingShopOpeningAnnounced) return;
		if (player.map !== "town") return;
		if (dayTransition || modal || isSaveLoadMenuOpen) return;
		if (directorRunningRef.current) return;
		const clothingDoor = mapDoors.town.find(
			(door) => door.target.map === "clothing_shop",
		);
		if (!clothingDoor) return;

		directorRunningRef.current = true;
		let cancelled = false;
		void (async () => {
			setPauseGame(true);
			setDirectorInputLocked(true);
			setCloudOverlayVisible(false);
			setMapZoom(clampDirectorZoom(DIRECTOR_DEFAULT_FOCUS_ZOOM));
			setCameraTarget({
				map: "town",
				x: clothingDoor.x,
				y: clothingDoor.y,
				smooth: true,
				durationMs: DIRECTOR_NAV_DURATION_MS,
			});
			await waitDirector(DIRECTOR_NAV_DURATION_MS);
			if (cancelled) return;
			await awaitDirectorPopupConfirm("A new store is open now!");
			if (cancelled) return;
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
			setDirectorPopup(null);
			setDirectorInputLocked(false);
			setCloudOverlayVisible(true);
			setPauseGame(false);
			setClothingShopOpeningAnnounced(true);
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
		hasWardrobe,
		clothingShopOpeningAnnounced,
		player.map,
		dayTransition,
		modal,
		isSaveLoadMenuOpen,
		mapDoors,
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
		if (player.map === "computer_lab") {
			const targetCell = activeMapLayouts.computer_lab?.[ty]?.[tx] ?? "";
			const rowIndex: 0 | 1 | 2 | -1 = ty === 2 ? 0 : ty === 4 ? 1 : ty === 6 ? 2 : -1;
			const algoIndex: 0 | 1 | 2 | -1 = tx === 4 ? 0 : tx === 5 ? 1 : tx === 6 ? 2 : -1;
			const isTargetSlot = tx === 3;
			if (targetCell === "x" && tx === 2 && rowIndex >= 0) {
				const rowSlotIndex = rowIndex as 0 | 1 | 2;
				const row = progressLoadoutRows[rowSlotIndex];
				const targetStone = row.targetStoneId
					? progressTargetStones.find((stone) => stone.id === row.targetStoneId)
					: null;
				if (!targetStone) {
					openMenu(
						`Row ${rowIndex + 1} Terminal`,
						[
							"No target stone is installed in this row.",
							"Install a target stone and algorithms to activate this chain.",
						],
						[{ label: "Back", onSelect: closeMenu }],
					);
					return;
				}
				const previewIncrement = previewIncrementForLoadoutRow(row);
				const baseHint =
					targetStone.id === "money_gained"
						? "Preview base uses $100 gained."
						: "Preview base uses quantity 1 trigger.";
				openMenu(
					`Row ${rowIndex + 1} Terminal`,
					[
						`Target mechanic: ${targetStone.name}`,
						targetStone.description,
						`Algorithm chain: ${describeLoadoutRowChain(row)}`,
						`Current reward preview: +${previewIncrement} progress per trigger.`,
						baseHint,
					],
					[{ label: "Back", onSelect: closeMenu }],
				);
				return;
			}
			if (targetCell === "x" && rowIndex >= 0 && (isTargetSlot || algoIndex >= 0)) {
				const rowSlotIndex = rowIndex as 0 | 1 | 2;
				const row = progressLoadoutRows[rowSlotIndex];
				if (isTargetSlot) {
					const currentTargetStoneId = row.targetStoneId;
					if (currentTargetStoneId) {
						const installedTargetStone = progressTargetStones.find(
							(stone) => stone.id === currentTargetStoneId,
						);
						openMenu(
							`Row ${rowIndex + 1} Target`,
							["Remove the currently installed target stone."],
							[
								{
									label: "Remove",
									info: [
										`Installed: ${installedTargetStone?.name ?? currentTargetStoneId}`,
										`Effect: ${installedTargetStone?.description ?? "No description available."}`,
									],
									onSelect: () => {
										setProgressLoadoutRows((prev) => {
											return setRowTargetStoneId(prev, rowSlotIndex, null);
										});
										closeMenu();
									},
								},
								{
									label: "Cancel",
									info: [
										`Installed: ${installedTargetStone?.name ?? currentTargetStoneId}`,
										`Effect: ${installedTargetStone?.description ?? "No description available."}`,
									],
									onSelect: closeMenu,
								},
							],
						);
						return;
					}
					const targetOptions = progressTargetStones.reduce<ModalOption[]>(
						(options, stone) => {
							const used = countUsedTargetStone(stone.id);
							const owned = progressStoneTargetCounts[stone.id] ?? 0;
							const available =
								owned - used + (currentTargetStoneId === stone.id ? 1 : 0);
							if (available <= 0) return options;
							options.push({
								label: `${stone.name} (${owned})`,
								info: [stone.description, `Rarity: ${stone.rarity}`],
								onSelect: () => {
									if (available <= 0 && currentTargetStoneId !== stone.id) {
										playBad();
										addLog("You do not own an available copy of that stone.");
										closeMenu();
										return;
									}
									setProgressLoadoutRows((prev) => {
										return setRowTargetStoneId(prev, rowSlotIndex, stone.id);
										});
										closeMenu();
									},
							});
							return options;
						},
						[],
					);
					openMenu(
						`Row ${rowIndex + 1} Target`,
						targetOptions.length > 0
							? ["Install or remove a target progress stone."]
							: ["You do not own any target stones yet."],
						[
							...targetOptions,
							{ label: "Back", onSelect: closeMenu },
						],
					);
					return;
				}
				const algoSlotIndex: 0 | 1 | 2 = algoIndex === -1 ? 0 : algoIndex;
				const currentAlgorithmStoneId = row.algorithmStoneIds[algoSlotIndex];
				if (currentAlgorithmStoneId) {
					const installedAlgorithmStone = progressAlgorithmStones.find(
						(stone) => stone.id === currentAlgorithmStoneId,
					);
					openMenu(
						`Row ${rowIndex + 1} Algorithm ${algoIndex + 1}`,
						["Remove the currently installed algorithmic progress stone."],
						[
							{
								label: "Remove",
								info: [
									`Installed: ${installedAlgorithmStone?.name ?? currentAlgorithmStoneId}`,
									`Effect: ${installedAlgorithmStone?.description ?? "No description available."}`,
								],
								onSelect: () => {
									setProgressLoadoutRows((prev) => {
										return setAlgorithmSlot(prev, rowSlotIndex, algoSlotIndex, null);
									});
									closeMenu();
								},
							},
							{
								label: "Cancel",
								info: [
									`Installed: ${installedAlgorithmStone?.name ?? currentAlgorithmStoneId}`,
									`Effect: ${installedAlgorithmStone?.description ?? "No description available."}`,
								],
								onSelect: closeMenu,
							},
						],
					);
					return;
				}
				const visibleAlgorithmOptions = progressAlgorithmStones.reduce<ModalOption[]>(
					(options, stone) => {
						const used = countUsedAlgorithmStone(stone.id);
						const owned = progressStoneAlgorithmCounts[stone.id] ?? 0;
						const available = owned - used + (currentAlgorithmStoneId === stone.id ? 1 : 0);
						if (available <= 0) return options;
						options.push({
							label: `${stone.name} (${owned})`,
							info: [stone.description, `Rarity: ${stone.rarity}`],
							onSelect: () => {
								if (available <= 0 && currentAlgorithmStoneId !== stone.id) {
									playBad();
									addLog("You do not own an available copy of that stone.");
									closeMenu();
									return;
								}
								setProgressLoadoutRows((prev) => {
									return setAlgorithmSlot(prev, rowSlotIndex, algoSlotIndex, stone.id);
								});
								closeMenu();
							},
						});
						return options;
					},
					[],
				);
				openMenu(
					`Row ${rowIndex + 1} Algorithm ${algoIndex + 1}`,
					visibleAlgorithmOptions.length > 0
						? ["Install or remove an algorithmic progress stone."]
						: ["You do not own any algorithm stones yet."],
					[
						...visibleAlgorithmOptions,
						{ label: "Back", onSelect: closeMenu },
					],
				);
				return;
			}
		}
		if (player.map === "aquarium") {
			const aquariumTile = activeMapLayouts.aquarium?.[ty]?.[tx] ?? "";
			const aquariumCategoryForInteractTile = (() => {
				if (
					aquariumTile === "\u0192" ||
					aquariumTile === "\u00B1" ||
					aquariumTile === "\u00C6"
				)
					return "freshwater" as const;
				if (
					aquariumTile === "\u00A2" ||
					aquariumTile === "\u00B5" ||
					aquariumTile === "\u00C4"
				)
					return "saltwater" as const;
				if (
					aquariumTile === "\u00A4" ||
					aquariumTile === "\u00C5" ||
					aquariumTile === "<" ||
					aquariumTile === ">" ||
					aquariumTile === "*"
				)
					return "cavewater" as const;
				return null;
			})();
			if (aquariumCategoryForInteractTile) {
				const totalForCategory = fishItemCatalog.filter(
					(fish) => fish.category === aquariumCategoryForInteractTile,
				).length;
				const donatedForCategory = fishItemCatalog.filter(
					(fish) =>
						fish.category === aquariumCategoryForInteractTile &&
						!!aquariumDonations[fish.itemId],
				).length;
				const categoryLabel =
					aquariumCategoryForInteractTile === "freshwater"
						? "Freshwater"
						: aquariumCategoryForInteractTile === "saltwater"
							? "Ocean"
							: "Cave";
				openMenu(
					"Aquarium Tank",
					[
						`You have donated ${donatedForCategory}/${totalForCategory} ${categoryLabel} fish.`,
					],
					[{ label: "OK", onSelect: closeMenu }],
				);
				return;
			}
		}
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
			forestLevel,
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
			hasWardrobe,
			ownedWardrobeLooks,
			starterWardrobeLooks,
			purchasableFunnyLooks,
			setPlayerEmoji,
			farmEggDrops,
			setFarmEggDrops,
			hasAutoCollector,
			barnAutoCollectorPos,
			barnAutoCollectorMap,
			hasAutoFeeder,
			barnAutoFeederPos,
			barnAutoFeederMap,
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
			playerEmoji,
			sketchyMerchantStock,
			SKETCHY_CRATE_POS,
			dontTouchSketchy,
			SKETCHY_MERCHANT_POS,
			sketchyMerchantIntro,
			setSketchyMerchantStock,
			setSketchyMerchantActive,
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
			aquariumCuratorTile,
			interactAquariumCurator,
			onProgressEvent: emitProgressEvent,
			maybeGrantChestProgressStone,
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
		debugGrantAllProgressStones,
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
		moveFishingSelection,
		moveFishingBuffSelection,
		selectFishingMove,
		selectFishingLevelUpBuffChoice,
		cutFishingLine,
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
	const inputPreset =
		controlMode === "mobile" ? MOBILE_KEYBOARD_PRESET : PC_KEYBOARD_PRESET;
	const inputRouter = useInputRouter(inputContext, inputPreset);
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
		const fishingBlocksMovement = !!fishing && fishing.phase !== "waiting";
		if (!dir) return;
		if (
			modal ||
			directorInputLocked ||
			!!directorPopup ||
			isNewspaperPopupOpen ||
			isBathing ||
			isOrdering ||
			isDoctorCompounding ||
			fishingBlocksMovement ||
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

	const dispatchMobileMoveCommand = (dir: Dir) => {
		if (dir === "up") {
			inputRouter.dispatchCommand("MOVE_UP", { sourceKey: "__mobile_move__" });
			return;
		}
		if (dir === "down") {
			inputRouter.dispatchCommand("MOVE_DOWN", { sourceKey: "__mobile_move__" });
			return;
		}
		if (dir === "left") {
			inputRouter.dispatchCommand("MOVE_LEFT", { sourceKey: "__mobile_move__" });
			return;
		}
		inputRouter.dispatchCommand("MOVE_RIGHT", { sourceKey: "__mobile_move__" });
	};
	dispatchMobileMoveCommandRef.current = dispatchMobileMoveCommand;

	const dispatchMobileInteractCommand = (dir: Dir) => {
		if (dir === "up") {
			inputRouter.dispatchCommand("INTERACT_UP", {
				sourceKey: "__mobile_interact__",
			});
			return;
		}
		if (dir === "down") {
			inputRouter.dispatchCommand("INTERACT_DOWN", {
				sourceKey: "__mobile_interact__",
			});
			return;
		}
		if (dir === "left") {
			inputRouter.dispatchCommand("INTERACT_LEFT", {
				sourceKey: "__mobile_interact__",
			});
			return;
		}
		inputRouter.dispatchCommand("INTERACT_RIGHT", {
			sourceKey: "__mobile_interact__",
		});
	};
	dispatchMobileInteractCommandRef.current = dispatchMobileInteractCommand;
	const setMobileMoveCadenceDirection = (nextDir: Dir | null) => {
		if (nextDir === null) {
			clearMobileMoveCadence();
			return;
		}
		if (
			mobileMoveCadenceDirRef.current === nextDir &&
			mobileMoveCadenceTimerRef.current !== null
		) {
			return;
		}
		clearMobileMoveCadence();
		mobileMoveCadenceDirRef.current = nextDir;
		dispatchMobileMoveCommandRef.current(nextDir);
		const tick = () => {
			mobileMoveCadenceTimerRef.current = null;
			const activeDir = mobileMoveCadenceDirRef.current;
			if (!activeDir) return;
			dispatchMobileMoveCommandRef.current(activeDir);
			mobileMoveCadenceTimerRef.current = window.setTimeout(
				tick,
				playerEmoji === GLYPH.tRex
					? POSITION_ANIMATION_MS * 4
					: playerEmoji === GLYPH.run
						? POSITION_ANIMATION_MS / 2
					: POSITION_ANIMATION_MS,
			);
		};
		mobileMoveCadenceTimerRef.current = window.setTimeout(
			tick,
			playerEmoji === GLYPH.tRex
				? POSITION_ANIMATION_MS * 4
				: playerEmoji === GLYPH.run
					? POSITION_ANIMATION_MS / 2
				: POSITION_ANIMATION_MS,
		);
	};

	const resolveTouchDirection = (
		dx: number,
		dy: number,
		fallbackDir: Dir | null,
	): Dir | null => {
		const absX = Math.abs(dx);
		const absY = Math.abs(dy);
		const strongest = Math.max(absX, absY);
		if (strongest < MOBILE_JOYSTICK_DEADZONE_PX) {
			// Keep cadence active while the finger is still down to mimic key hold.
			return fallbackDir;
		}
		if (absX > absY) return dx > 0 ? "right" : "left";
		return dy > 0 ? "down" : "up";
	};

	const updateMobileMoveJoystickFromTouch = (x: number, y: number) => {
		const anchor = mobileMoveJoystickAnchor;
		if (!anchor) return;
		const dx = x - anchor.x;
		const dy = y - anchor.y;
		const magnitude = Math.hypot(dx, dy);
		const clampedMagnitude = Math.min(magnitude, MOBILE_JOYSTICK_MAX_RADIUS_PX);
		const scale = magnitude > 0 ? clampedMagnitude / magnitude : 0;
		const thumbX = anchor.x + dx * scale;
		const thumbY = anchor.y + dy * scale;
		setMobileMoveJoystickThumb({ x: thumbX, y: thumbY });
		setMobileMoveCadenceDirection(
			resolveTouchDirection(dx, dy, mobileMoveCadenceDirRef.current),
		);
	};

	const updateMobileInteractJoystickFromTouch = (x: number, y: number) => {
		const anchor = mobileInteractJoystickAnchor;
		if (!anchor) return;
		const dx = x - anchor.x;
		const dy = y - anchor.y;
		const magnitude = Math.hypot(dx, dy);
		const clampedMagnitude = Math.min(magnitude, MOBILE_JOYSTICK_MAX_RADIUS_PX);
		const scale = magnitude > 0 ? clampedMagnitude / magnitude : 0;
		const thumbX = anchor.x + dx * scale;
		const thumbY = anchor.y + dy * scale;
		setMobileInteractJoystickThumb({ x: thumbX, y: thumbY });
		const dir = resolveTouchDirection(dx, dy, null);
		if (!dir || mobileInteractCommandSentRef.current) return;
		mobileInteractSwipeUsedRef.current = true;
		mobileInteractCommandSentRef.current = true;
		dispatchMobileInteractCommandRef.current(dir);
	};

	const onMobileMoveJoystickTouchStart = (e: TouchEvent<HTMLDivElement>) => {
		if (controlMode !== "mobile") return;
		if (mobileMoveJoystickTouchIdRef.current !== null) return;
		const touch = e.changedTouches[0];
		if (!touch) return;
		e.preventDefault();
		const anchor = { x: touch.clientX, y: touch.clientY };
		mobileMoveJoystickTouchIdRef.current = touch.identifier;
		setMobileMoveJoystickAnchor(anchor);
		setMobileMoveJoystickThumb(anchor);
		setMobileMoveCadenceDirection(null);
	};

	const onMobileMoveJoystickTouchMove = (e: TouchEvent<HTMLDivElement>) => {
		const touchId = mobileMoveJoystickTouchIdRef.current;
		if (touchId === null) return;
		const touch = Array.from(e.touches).find((candidate) => candidate.identifier === touchId);
		if (!touch) return;
		e.preventDefault();
		updateMobileMoveJoystickFromTouch(touch.clientX, touch.clientY);
	};

	const onMobileMoveJoystickTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
		const touchId = mobileMoveJoystickTouchIdRef.current;
		if (touchId === null) return;
		const released = Array.from(e.changedTouches).some(
			(candidate) => candidate.identifier === touchId,
		);
		if (!released) return;
		e.preventDefault();
		clearMobileMoveJoystick();
	};

	const onMobileInteractJoystickTouchStart = (e: TouchEvent<HTMLDivElement>) => {
		if (controlMode !== "mobile") return;
		if (mobileInteractJoystickTouchIdRef.current !== null) return;
		const touch = e.changedTouches[0];
		if (!touch) return;
		e.preventDefault();
		const anchor = { x: touch.clientX, y: touch.clientY };
		mobileInteractJoystickTouchIdRef.current = touch.identifier;
		mobileInteractSwipeUsedRef.current = false;
		mobileInteractCommandSentRef.current = false;
		setMobileInteractJoystickAnchor(anchor);
		setMobileInteractJoystickThumb(anchor);
	};

	const onMobileInteractJoystickTouchMove = (e: TouchEvent<HTMLDivElement>) => {
		const touchId = mobileInteractJoystickTouchIdRef.current;
		if (touchId === null) return;
		const touch = Array.from(e.touches).find((candidate) => candidate.identifier === touchId);
		if (!touch) return;
		e.preventDefault();
		updateMobileInteractJoystickFromTouch(touch.clientX, touch.clientY);
	};

	const onMobileInteractJoystickTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
		const touchId = mobileInteractJoystickTouchIdRef.current;
		if (touchId === null) return;
		const released = Array.from(e.changedTouches).some(
			(candidate) => candidate.identifier === touchId,
		);
		if (!released) return;
		e.preventDefault();
		const usedSwipe = mobileInteractSwipeUsedRef.current;
		clearMobileInteractJoystick();
		if (!usedSwipe) {
			inputRouter.dispatchCommand("OK", { sourceKey: "__mobile_interact_tap__" });
		}
	};

	useEffect(() => {
		const fishingBlocksMovement = !!fishing && fishing.phase !== "waiting";
		if (
			modal ||
			directorInputLocked ||
			!!directorPopup ||
			isBathing ||
			isOrdering ||
			isDoctorCompounding ||
			fishingBlocksMovement ||
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
		if (controlMode === "mobile") return;
		clearMobileMoveJoystick();
		clearMobileInteractJoystick();
	}, [controlMode]);

	useEffect(() => {
		return () => {
			clearHeldMove();
			clearMobileMoveJoystick();
			clearMobileInteractJoystick();
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
			barnAutoCollectorMap,
			hasAutoFeeder,
			barnAutoFeederPos,
			barnAutoFeederMap,
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
		barnAutoCollectorMap,
		hasAutoFeeder,
		barnAutoFeederPos,
		barnAutoFeederMap,
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
		progressPercent,
		progressWon,
		progressLoadoutRows,
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
		fishingProgress,
		moveFishingSelection,
		moveFishingBuffSelection,
		selectFishingMove,
		selectFishingLevelUpBuffChoice,
		selectFishingMoveById,
		cutFishingLine,
		fishingMoveOrder: FISHING_PLAYER_MOVE_ORDER,
		fishingMoveInfo: FISHING_PLAYER_MOVES,
		fishingMoveUnlocks,
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
		aquariumBubbles,
		aquariumSeaweedXs,
		aquariumOceanSeaweedXs,
		aquariumCuratorTile,
		aquariumFishTiles,
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
		setQuantityToMax,
		setQuantityToMin,
		moveModal,
		moonPhases,
		dayTransition,
		dayTransitionStarsState,
		dayTransitionStage,
		dayTransitionClosePhase,
		continueAfterSleep,
		dayTransitionPrompt,
		isSaveLoadMenuOpen,
		controlMode,
		canSaveGame,
		saveDisabledMessage,
		saveLoadStatus,
		toggleSaveLoadMenu,
		toggleControlMode,
		closeSaveLoadMenu,
		saveGameToFile,
		loadGameFromFilePicker,
		mobileMoveJoystickAnchor,
		mobileMoveJoystickThumb,
		mobileInteractJoystickAnchor,
		mobileInteractJoystickThumb,
		onMobileMoveJoystickTouchStart,
		onMobileMoveJoystickTouchMove,
		onMobileMoveJoystickTouchEnd,
		onMobileInteractJoystickTouchStart,
		onMobileInteractJoystickTouchMove,
		onMobileInteractJoystickTouchEnd,
		canZoomOut: mapZoom > MANUAL_ZOOM_MIN + 0.001,
		canZoomIn: mapZoom < MANUAL_ZOOM_MAX - 0.001,
		zoomOut,
		zoomIn,
		directorPopup,
		confirmDirectorPopup,
		tileFx: tileFxBusRef.current.api,
		tileFxBus: tileFxBusRef.current,
	});

	return renderGameRuntimeView(viewCtx);
}
