export type MapId =
	| "farm"
	| "house"
	| "barn"
	| "town"
	| "forest"
	| "cave"
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
	| "fish"
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
export type ForestObstacleType = "wood" | "rock" | "weed";

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

export type FishingState = {
	map: MapId;
	x: number;
	y: number;
	phase: "waiting" | "bite" | "success";
	requiredKey: string;
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

export type ToolId =
	| "hoe"
	| "wateringCan"
	| "milkingGloves"
	| "shears"
	| "fishingRod"
	| "smashAxe";
export type ToolLevels = Record<ToolId, number>;

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
	qty: number;
	price: number;
	basePrice: number;
};

export type TraderTradeEntry = {
	id: number;
	giveItem: ItemId;
	wantItem: ItemId;
	remaining: number;
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
	entranceSide: ForestSide;
	entranceDoor: { x: number; y: number };
	entranceInside: { x: number; y: number };
	levelOneExitInside: { x: number; y: number };
	startingRockCount: number;
	level: number;
};

export type Point = { x: number; y: number };
export type PetEmoji = "🐈" | "🐈‍⬛" | "🐕" | "🐩";
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

export type SaveGameData = {
	version: number;
	player: PlayerState;
	world: WorldState;
	dungeons: DungeonState;
	progression: ProgressionState;
};
