export type MapId =
	| "farm"
	| "house"
	| "barn"
	| "town"
	| "aquarium"
	| "forest"
	| "cave"
	| "computer_lab"
	| "bureaucracy_office"
	| "seed_shop"
	| "feed_shop"
	| "animal_shop"
	| "market_shop"
	| "tool_shop"
	| "clothing_shop"
	| "cafe_shop";

export type CropId = "turnip" | "carrot" | "pumpkin" | "corn" | "coral_fruit";

export type AnimalType =
	| "cow"
	| "sheep"
	| "chicken"
	| "hippo"
	| "unicorn"
	| "mammoth"
	| "slug"
	| "gorilla";

export type WeatherId = "sunny" | "windy" | "rainy";

export type FishItemId =
	| "river_perch_01"
	| "koi_guard_01"
	| "bitey_shark_01"
	| "tide_eel_01"
	| "cave_lurker_01";

export type ItemId =
	| "turnip_seed"
	| "carrot_seed"
	| "pumpkin_seed"
	| "corn_seed"
	| "turnip"
	| "carrot"
	| "pumpkin"
	| "corn"
	| "feed"
	| "milk"
	| "wool"
	| "egg"
	| FishItemId
	| "iron"
	| "shell"
	| "diamond"
	| "emerald"
	| "ruby"
	| "coral_fruit";

export type Dir = "up" | "down" | "left" | "right";

export type VendorKey =
	| "seed_vendor"
	| "feed_vendor"
	| "animal_vendor"
	| "market"
	| "tool_vendor"
	| "clothing_vendor"
	| "cafe_vendor";

export type ForestEnemyType = "bear" | "snake" | "poop" | "bat";
export type ForestObstacleType = "wood" | "rock" | "weed" | "torch";

export type Tile = {
	icon: string;
	passable: boolean;
	label: string;
};

export type VisualCell = {
	glyph: string;
	className?: string;
	overlayGlyph?: string;
};

export type TileFxEmote = "happy" | "sad";
export type TileFxTarget = { map: MapId; x: number; y: number } | { actorId: string };
export type TileFxHandle = {
	squeeze: (scaleX?: number, durationMs?: number) => void;
	stretch: (scaleY?: number, durationMs?: number) => void;
	streatch: (scaleY?: number, durationMs?: number) => void;
	bounceSquash: (enabled?: boolean, durationMs?: number) => void;
	bobble: (durationMs?: number) => void;
	jump: (durationMs?: number) => void;
	emote: (kind: TileFxEmote, durationMs?: number) => void;
	toast: (text: string, durationMs?: number) => void;
};
export type TileFxApi = {
	at: (pos: { map: MapId; x: number; y: number }) => TileFxHandle;
	actor: (actorId: string) => TileFxHandle;
};

export type CropDef = {
	name: string;
	growDays: number;
	seedItem: ItemId;
	harvestItem: ItemId;
	buyPrice: number;
	baseSell: number;
};

export type AnimalDef = {
	name: string;
	buyPrice: number;
	productItem: ItemId;
};

export type Plot = {
	crop: CropId | null;
	growthDays: number;
	watered: boolean;
};

export type Animal = {
	id: number;
	type: AnimalType;
	fedToday: boolean;
	canProduceToday: boolean;
	hasProductReady: boolean;
};

export type ModalOption = {
	label: string;
	onSelect: () => void;
	info?: string[];
	dealMeta?: {
		itemId: ItemId;
		mode: "buy" | "sell";
		unitPrice?: number;
		baseUnitPrice?: number;
	};
};

export type ModalState = {
	title: string;
	body: string[];
	options: ModalOption[];
};

export type QuantityPromptState = {
	min: number;
	max: number;
	value: number;
	unitPrice: number;
	mode: "buy" | "sell";
	itemLabel: string;
	onConfirm: (quantity: number) => void;
};

export type DayTransitionState = {
	day: number;
	totalEarned: number;
	previousDayEarned: number;
};

export type FishingCategory = "freshwater" | "saltwater" | "cavewater";
export type AquariumFishNpcBehavior =
	| "simple_wander"
	| "fixed_bottom"
	| "wander_top"
	| "wander_bottom";

export type FishingFishMoveId =
	| "bite"
	| "thrash"
	| "dive_deep"
	| "wrap_line"
	| "go_along"
	| "undertow_rip"
	| "thalassophobia"
	| "cavernous_hunger"
	| "pressure_of_the_deep"
	| "clear_water_focus"
	| "rising_tide"
	| "salt_armor"
	| "leviathans_wake"
	| "echoing_hunger"
	| "bedrock_fortification"
	| "subterranean_rot"
	| "shenanigans"
	| "spatula_slap"
	| "sponge_laugh";

export type FishingPlayerMoveId =
	| "reel_in"
	| "pull_rod"
	| "release_line"
	| "use_net"
	| "relax_you_are_fishing"
	| "steady_hands"
	| "focus_on_drag"
	| "cut_line";

export type FishingMovePoolEntry = {
	moveId: FishingFishMoveId;
	weight?: number;
};

export type FishDefinition = {
	id: string;
	name: string;
	glyph: string;
	category: FishingCategory;
	aquariumNpcBehavior?: AquariumFishNpcBehavior;
	sellPrice: number;
	spawnWeight?: number;
	stats: {
		maxHp: number;
		attack: number;
		defense: number;
	};
	expGranted: number;
	movePool?: FishingMovePoolEntry[];
};

export type FishingProgressState = {
	level: number;
	exp: number;
	attackBonus: number;
	defenseBonus: number;
};

export type FishingMoveUnlocks = Record<FishingPlayerMoveId, boolean>;

export type FishingEncounterPhase =
	| "waiting"
	| "intro"
	| "player_turn"
	| "player_action"
	| "fish_turn"
	| "caught"
	| "escaped"
	| "cut_line";

export type FishingOpeningStage =
	| "none"
	| "fade_bg"
	| "fish_enter"
	| "fish_hook_text"
	| "player_stats_enter"
	| "ready";

export type FishingCombatToast = {
	id: number;
	text: string;
	tone: "buff" | "debuff";
	durationMs?: number;
};

export type FishingImpactSoundId =
	| "hoe"
	| "water"
	| "munch"
	| "badWater1"
	| "badWater2"
	| "badWater3"
	| "badWater4"
	| "badWater5"
	| "badWater6";

export type PlayerPerTurnStatModifier = {
	stamina: number;
	attack: number;
	defense: number;
	messages: string[];
	moveName: string;
	impactSound?: FishingImpactSoundId;
};

export type FishPerTurnStatModifier = {
	hp: number;
	attack: number;
	defense: number;
	messages: string[];
	moveName: string;
	impactSound?: FishingImpactSoundId;
};

export type FishingState = {
	map: MapId;
	x: number;
	y: number;
	castX: number;
	castY: number;
	phase: FishingEncounterPhase;
	message: string;
	selectedMoveIndex: number;
	fishId: string | null;
	fishName: string;
	fishGlyph: string;
	fishExpGranted: number;
	fishMaxHp: number;
	fishHp: number;
	fishAttack: number;
	fishDefense: number;
	fishMovePool: FishingMovePoolEntry[];
	playerLevel: number;
	playerExp: number;
	playerAttack: number;
	playerDefense: number;
	awaitingLevelUpBuffChoice: boolean;
	canChooseLevelUpBuff: boolean;
	levelUpBuffAttackAmount: number;
	levelUpBuffDefenseAmount: number;
	showMenu: boolean;
	openingStage: FishingOpeningStage;
	playerAnim: "stretch" | "squash" | null;
	fishAnim: "stretch" | "squash" | "defeat" | "bobble" | null;
	playerToasts: FishingCombatToast[];
	fishToasts: FishingCombatToast[];
	expBarLevelUpBurst: boolean;
	playerPerTurnModifiers: PlayerPerTurnStatModifier[];
	fishPerTurnModifiers: FishPerTurnStatModifier[];
	robertSpongeLaughUsed: boolean;
};

export type Warp = {
	map: MapId;
	x: number;
	y: number;
};

export type Door = {
	x: number;
	y: number;
	target: Warp;
	label: string;
};

export type Position = {
	map: MapId;
	x: number;
	y: number;
};

export type PriceState = Record<ItemId, number>;
export type PriceTrendState = Record<ItemId, -1 | 0 | 1>;
export type Inventory = Record<ItemId, number>;
export type AquariumDonationInventory = Record<string, boolean>;

export type ToolId =
	| "hoe"
	| "wateringCan"
	| "milkingGloves"
	| "shears"
	| "fishingRod"
	| "smashAxe";
export type ToolLevels = Record<ToolId, number>;

export type UnlockFlagId = "headlampVendorStock";
export type UnlockFlags = Record<UnlockFlagId, boolean>;

export type UpgradeSceneEventKind =
	| "pet_arrived"
	| "barn_upgraded"
	| "tractor_delivered"
	| "auto_collector_installed"
	| "auto_feeder_installed";
export type UpgradeSceneBgTrack = "space_store" | "space_bg" | "area_default";
export type UpgradeSceneEvent = {
	id: string;
	kind: UpgradeSceneEventKind;
	day: number;
	bgTrack?: UpgradeSceneBgTrack;
	cameraZoom?: number;
};

export type CafeOrderItem = { name: string; price: number; stamina: number };

export type CloudSprite = {
	id: number;
	startX: number;
	y: number;
	size: number;
	durationSec: number;
	glyph: string;
};

export type SketchyStockEntry = {
	item: ItemId;
	giveAlgorithmStoneId?: ProgressAlgorithmId;
	qty: number;
	price: number;
	basePrice: number;
};

export type TraderTradeEntry = {
	id: number;
	giveItem: ItemId;
	wantItem: ItemId;
	giveAlgorithmStoneId?: ProgressAlgorithmId;
	remaining: number;
};

export type NpcGiftLetterReward =
	| { kind: "item"; itemId: ItemId; amount: number }
	| { kind: "algorithm"; stoneId: ProgressAlgorithmId }
	| { kind: "target"; stoneId: ProgressTargetId };

export type NpcGiftLetterState = {
	senderNpcKey: string;
	senderName: string;
	body: string;
	reward: NpcGiftLetterReward;
};

export type ForestEnemy = {
	id: number;
	type: ForestEnemyType;
	x: number;
	y: number;
	anchorX: number;
	anchorY: number;
};

export type ForestObstacle = {
	id: number;
	type: ForestObstacleType;
	x: number;
	y: number;
	hitsRemaining: number;
};

export type ForestChest = {
	id?: number;
	x: number;
	y: number;
	opened: boolean;
};

export type SnakePatrolState = {
	hDir: -1 | 1;
	vDir: -1 | 1;
	verticalMode: boolean;
};

export type ForestSide = "left" | "right" | "top" | "bottom";

export type ForestGenerationResult = {
	layout: string[];
	enemies: ForestEnemy[];
	obstacles: ForestObstacle[];
	chest: ForestChest;
	bonusChests: ForestChest[];
	isBonusLevel: boolean;
	entranceSide: ForestSide;
	exitSide: ForestSide;
	entranceDoor: { x: number; y: number };
	entranceInside: { x: number; y: number };
	exitDoor: { x: number; y: number };
	exitInside: { x: number; y: number };
	turnSign: -1 | 0 | 1;
	level: number;
};

export type CaveGenerationResult = {
	layout: string[];
	enemies: ForestEnemy[];
	obstacles: ForestObstacle[];
	bonusChest: ForestChest | null;
	isBonusLevel: boolean;
	entranceSide: ForestSide;
	entranceDoor: { x: number; y: number };
	entranceInside: { x: number; y: number };
	ladderPos: { x: number; y: number } | null;
	levelOneExitInside: { x: number; y: number };
	startingRockCount: number;
	level: number;
};

export type Point = { x: number; y: number };
export type PetEmoji =
	| "\u{1F408}"
	| "\u{1F408}\u{200D}\u{2B1B}"
	| "\u{1F415}"
	| "\u{1F429}";
export type TractorImplement = "plow" | "sow" | "water" | "harvest";

export type ForestGenConfig = {
	level?: number;
	entranceSide?: ForestSide;
	entranceCoord?: number;
	lastTurn?: -1 | 0 | 1;
};

export type BarnTier = 1 | 2 | 3 | 4 | 5;

export type PlayerState = Position & {
	emoji: string;
	stamina: number;
	staminaMax: number;
	money: number;
};

export type WorldState = {
	day: number;
	weather: WeatherId;
	plots: Record<string, Plot>;
	animals: Animal[];
	inventory: Inventory;
	tools: ToolLevels;
	barnTier: BarnTier;
};

export type DungeonState = {
	forestLevel: number;
	caveLevel: number;
	forestLockedToday: boolean;
	caveLockedToday: boolean;
};

export type ProgressionState = {
	currentDayEarned: number;
	previousDayEarned: number;
	totalEarned: number;
	ownedWardrobeLooks: string[];
	hasTractor: boolean;
	hasHeadlamp: boolean;
	ownedPet: PetEmoji | null;
};

export type ProgressRarity = "common" | "uncommon" | "rare" | "legendary";

export type ProgressTargetId =
	| "money_gained"
	| "fish_caught"
	| "forest_depth_advanced"
	| "cave_depth_advanced"
	| "crop_harvested"
	| "animal_fed"
	| "milk_collected"
	| "wool_collected"
	| "egg_collected"
	| "crop_sold"
	| "animal_product_sold"
	| "fish_sold"
	| "aquarium_donated";

export type ProgressAlgorithmId =
	| "add_1"
	| "add_2"
	| "add_3"
	| "add_5"
	| "add_diamond_count"
	| "add_barn_tier"
	| "add_tier5_tools"
	| "mul_1_25"
	| "mul_1_5"
	| "mul_2"
	| "mul_donated_fish_count"
	| "add_cow_count"
	| "add_sheep_count"
	| "add_chicken_count"
	| "add_crop_count"
	| "add_highest_forest_level"
	| "add_highest_cave_level";

export type ProgressEventType = ProgressTargetId;

export type ProgressEventPayload = {
	type: ProgressEventType;
	moneyDelta?: number;
	quantity?: number;
	itemId?: ItemId;
	animalType?: AnimalType;
	cropId?: CropId;
	saleCategory?: "crop" | "animal_product" | "fish";
	forestLevel?: number;
	caveLevel?: number;
};

export type ProgressTargetStoneDef = {
	id: ProgressTargetId;
	name: string;
	target: ProgressTargetId;
	rarity: ProgressRarity;
	description: string;
};

export type ProgressAlgorithmStoneDef = {
	id: ProgressAlgorithmId;
	name: string;
	rarity: ProgressRarity;
	description: string;
};

export type ProgressLoadoutRow = {
	targetStoneId: ProgressTargetId | null;
	algorithmStoneIds: [
		ProgressAlgorithmId | null,
		ProgressAlgorithmId | null,
		ProgressAlgorithmId | null,
	];
};

export type SaveGameData = {
	version: number;
	player: PlayerState;
	world: WorldState;
	dungeons: DungeonState;
	progression: ProgressionState;
};
