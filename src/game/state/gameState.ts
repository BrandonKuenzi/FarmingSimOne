import type { SetStateAction } from "react";
import type { NpcDailyAssignment } from "../../npcDialogue";
import type { DayTransitionStar } from "../content/dayTransition";
import type {
	Animal,
	BarnTier,
	CloudSprite,
	DayTransitionState,
	FishingState,
	ForestChest,
	ForestEnemy,
	ForestObstacle,
	ForestSide,
	Inventory,
	ItemId,
	MapId,
	ModalState,
	PetEmoji,
	Plot,
	Point,
	Position,
	PriceState,
	PriceTrendState,
	QuantityPromptState,
	SketchyStockEntry,
	ToolLevels,
	TractorImplement,
	TraderTradeEntry,
	UpgradeSceneEvent,
	UnlockFlags,
	WeatherId,
} from "../shared/types";
import type { BoatTileMap, TownNpcTileMap } from "../runtime/contracts";

export type GameState = {
	player: Position;
	day: number;
	forestLayout: string[];
	forestEnemies: ForestEnemy[];
	forestObstacles: ForestObstacle[];
	forestChest: ForestChest;
	forestBonusChests: ForestChest[];
	forestLevel: number;
	forestEntranceDoorPos: Point;
	forestForwardExitPos: Point;
	forestExitSide: ForestSide;
	forestLastTurn: -1 | 0 | 1;
	forestIsBonusLevel: boolean;
	forestLockedToday: boolean;
	forestFog: Record<string, number>;
	caveFog: Record<string, number>;
	caveLayout: string[];
	caveRubble: Record<string, string>;
	caveEnemies: ForestEnemy[];
	caveObstacles: ForestObstacle[];
	caveBonusChest: ForestChest | null;
	caveIsBonusLevel: boolean;
	caveLevel: number;
	caveEntranceDoorPos: Point;
	caveLevelOneExitPos: Point;
	caveLadderPos: Point | null;
	caveStartingRockCount: number;
	caveLockedToday: boolean;
	currentWeather: WeatherId;
	cafeShopkeeperX: number;
	shopDecorByMap: Record<string, Record<string, string>>;
	money: number;
	staminaMax: number;
	stamina: number;
	inventory: Inventory;
	plots: Record<string, Plot>;
	animals: Animal[];
	prices: PriceState;
	priceTrends: PriceTrendState;
	newspaper: string;
	newspaperImage: string[];
	newspaperRead: boolean;
	log: string[];
	modal: ModalState | null;
	modalIndex: number;
	quantityPrompt: QuantityPromptState | null;
	waterRipplePhase: boolean;
	pauseGame: boolean;
	dayTransition: DayTransitionState | null;
	dayTransitionPrompt: string;
	dayTransitionStage: "intro" | "day" | "earned" | "final";
	dayTransitionClosePhase: "idle" | "card" | "backdrop";
	dayTransitionStarsState: DayTransitionStar[];
	currentDayEarned: number;
	previousDayEarned: number;
	totalEarned: number;
	playerEmoji: string;
	showTiredFace: boolean;
	showForestHit: boolean;
	isBathing: boolean;
	ownedWardrobeLooks: string[];
	tools: ToolLevels;
	barnTier: BarnTier;
	pendingBarnUpgrade: boolean;
	hasAutoCollector: boolean;
	pendingAutoCollectorInstall: boolean;
	hasTractor: boolean;
	hasHeadlamp: boolean;
	headlampLetterRead: boolean;
	unlockFlags: UnlockFlags;
	pendingTractorDelivery: boolean;
	tractorParked: boolean;
	isDrivingTractor: boolean;
	tractorFacing: 1 | -1;
	tractorImplement: TractorImplement | null;
	tractorImplementOn: boolean;
	tractorSeedItem: ItemId | null;
	tractorDriverEmoji: string | null;
	waterLevel: number;
	waterRefillTile: { map: MapId; x: number; y: number } | null;
	starterChestOpened: boolean;
	beachBottlePos: { x: number; y: number } | null;
	beachShellDrops: Record<string, boolean>;
	sketchyMerchantActive: boolean;
	sketchyMerchantStock: SketchyStockEntry[];
	traderActive: boolean;
	traderTrades: TraderTradeEntry[];
	doctorVendorActive: boolean;
	doctorUsedToday: boolean;
	petVendorActive: boolean;
	ownedPet: PetEmoji | null;
	pendingPet: PetEmoji | null;
	petTile: Point | null;
	petFacing: 1 | -1;
	petHeartTile: Point | null;
	townNpcTiles: TownNpcTileMap;
	boatTiles: BoatTileMap;
	npcDailyAssignments: Record<string, NpcDailyAssignment>;
	npcTalkedToday: Record<string, boolean>;
	fishing: FishingState | null;
	isOrdering: boolean;
	cafeObservation: string;
	isDoctorCompounding: boolean;
	doctorObservation: string;
	clouds: CloudSprite[];
	grassWindBands: Array<{
		id: number;
		map: MapId;
		frontX: number;
		baseY: number;
		frame: number;
	}>;
	animalTiles: Record<number, { x: number; y: number }>;
	animalAnchors: Record<number, { x: number; y: number }>;
	farmForestBlockers: Record<string, boolean>;
	farmCaveBlockers: Record<string, number>;
	petGraveObstacles: Record<string, number>;
	pendingPetGravePos: Point | null;
	farmWeedObstacles: Record<string, boolean>;
	farmEggDrops: Record<string, boolean>;
	pendingUpgradeScenes: UpgradeSceneEvent[];
};

export type GameStateAction = {
	[K in keyof GameState]: {
		type: "set";
		key: K;
		value: SetStateAction<GameState[K]>;
	};
}[keyof GameState] | {
	type: "batch";
	updates: Partial<{ [K in keyof GameState]: SetStateAction<GameState[K]> }>;
};

const resolveSetStateAction = <T,>(prev: T, next: SetStateAction<T>): T => {
	return typeof next === "function" ? (next as (current: T) => T)(prev) : next;
};

export const gameStateReducer = (
	state: GameState,
	action: GameStateAction,
): GameState => {
	if (action.type === "set") {
		const key = action.key as keyof GameState;
		const current = state[key];
		const next = resolveSetStateAction(current, action.value as SetStateAction<typeof current>);
		if (Object.is(current, next)) return state;
		return { ...state, [key]: next };
	}

	if (action.type === "batch") {
		let nextState: GameState | null = null;
		for (const key of Object.keys(action.updates) as Array<keyof GameState>) {
			const update = action.updates[key];
			if (update === undefined) continue;
			const base = nextState ?? state;
			const current = base[key];
			const next = resolveSetStateAction(current, update as SetStateAction<typeof current>);
			if (Object.is(current, next)) continue;
			if (!nextState) nextState = { ...state };
			(nextState as Record<keyof GameState, unknown>)[key] = next;
		}
		return nextState ?? state;
	}

	return state;
};
