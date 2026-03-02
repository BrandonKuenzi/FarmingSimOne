import type {
	Dispatch,
	KeyboardEvent,
	MutableRefObject,
	SetStateAction,
	TouchEvent,
} from "react";
import type { DayTransitionStar } from "../content/dayTransition";
import type {
	CloudSprite,
	DayTransitionState,
	Dir,
	FishingState,
	Animal,
	ForestEnemy,
	MapId,
	ModalState,
	Plot,
	Position,
	PriceState,
	QuantityPromptState,
	FishingPlayerMoveId,
	FishingMoveUnlocks,
	FishingProgressState,
	WeatherId,
	TileFxApi,
} from "../shared/types";
import type { TileFxBus } from "./tileFxBus";

type DealBadge = {
	label: string;
	color: string;
	scaleUp: number;
};

export type GameRuntimeViewModel = {
	onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
	onKeyUp: (e: KeyboardEvent<HTMLDivElement>) => void;
	onBlur: () => void;
	shellRef: MutableRefObject<HTMLDivElement | null>;
	day: number;
	player: Position;
	townNpcTiles: Record<string, { x: number; y: number }>;
	forestEnemies: ForestEnemy[];
	caveEnemies: ForestEnemy[];
	animalsMap: MapId;
	animals: Animal[];
	animalTiles: Record<number, { x: number; y: number }>;
	currentWeather: WeatherId;
	weatherEmojiById: Record<string, string>;
	money: number;
	stamina: number;
	staminaMax: number;
	waterLevel: number;
	inventoryRows: Array<{ id: string; icon: string; name: string; amount: number }>;
	activeMapLayouts: Record<string, string[]>;
	isWindSlashOn: (x: number, y: number) => boolean;
	renderedMap: string[][];
	mapZoom: number;
	cameraTarget: {
		map: MapId;
		x: number;
		y: number;
		smooth: boolean;
		durationMs?: number;
	} | null;
	plots: Record<string, Plot>;
	keyForPos: (x: number, y: number) => string;
	groundClassForTile: (tile: string, map: MapId) => string | undefined;
	isShopMap: (map: MapId) => boolean;
	shopDecorByMap: Record<string, Record<string, string>>;
	isFarmHouseDoorTile: (mapId: MapId, x: number, y: number) => boolean;
	getDoorGroundClass: (mapId: MapId, x: number, y: number) => string | undefined;
	fishing: FishingState | null;
	fishingProgress: FishingProgressState;
	moveFishingSelection: (delta: number) => void;
	moveFishingBuffSelection: (delta: number) => void;
	selectFishingMove: () => void;
	selectFishingLevelUpBuffChoice: (choiceIndex?: number) => void;
	selectFishingMoveById: (moveId: FishingPlayerMoveId) => void;
	cutFishingLine: () => void;
	fishingMoveOrder: FishingPlayerMoveId[];
	fishingMoveInfo: Record<FishingPlayerMoveId, { label: string; description: string }>;
	fishingMoveUnlocks: FishingMoveUnlocks;
	isDrivingTractor: boolean;
	isBathing: boolean;
	showTiredFace: boolean;
	playerEmoji: string;
	waterRefillTile: { map: MapId; x: number; y: number } | null;
	isRippleWaterTile: (map: MapId, x: number, y: number) => boolean;
	waterRipplePhase: boolean;
	isAnimatedGrassTile: (map: MapId, x: number, y: number) => boolean;
	grassFoliageVariant: (
		map: MapId,
		x: number,
		y: number,
		animatedGrassFrame?: number,
	) => number;
	caveLadderPos: { x: number; y: number } | null;
	caveRubble: Record<string, string>;
	toVisual: (
		cell: string,
		map?: MapId,
	) => { glyph: string; className?: string; overlayGlyph?: string };
	spriteTilesNeedingGround: Set<string>;
	petFacing: 1 | -1;
	tractorFacing: 1 | -1;
	showForestHit: boolean;
	getForestFogOpacity: (x: number, y: number) => number;
	getCaveFogOpacity: (x: number, y: number) => number;
	clouds: CloudSprite[];
	setClouds: Dispatch<SetStateAction<CloudSprite[]>>;
	cloudOverlayVisible: boolean;
	aquariumBubbles: Array<{ x: number; y: number; tank: "fresh" | "salt" | "cave" }>;
	aquariumSeaweedXs: number[];
	aquariumOceanSeaweedXs: number[];
	aquariumCuratorTile: { x: number; y: number } | null;
	aquariumFishTiles: Array<{
		fishId: string;
		glyph: string;
		x: number;
		y: number;
		facing: 1 | -1;
	}>;
	unfedAnimalMap: MapId | null;
	unfedAnimalTileKeys: Record<string, boolean>;
	marketRows: Array<{ id: string; name: string; price: number; trend: number }>;
	toolRows: Array<{ id: string; name: string; level: number }>;
	getToolTierName: (level: number) => string;
	pendingTractorDelivery: boolean;
	hasTractor: boolean;
	hasHeadlamp: boolean;
	newspaper: string;
	newspaperImage: string[];
	isNewspaperPopupOpen: boolean;
	closeNewspaperPopup: () => void;
	isOrdering: boolean;
	isDoctorCompounding: boolean;
	doctorObservation: string;
	cafeObservation: string;
	modal: ModalState | null;
	modalIndex: number;
	quantityPrompt: QuantityPromptState | null;
	selectModal: () => void;
	getDealBadge: (
		mode: "buy" | "sell",
		unitPrice: number,
		baseUnitPrice: number,
	) => DealBadge | undefined;
	prices: PriceState;
	initialPrices: PriceState;
	cancelQuantityPrompt: () => void;
	moveQuantity: (delta: number) => void;
	setQuantityToMax: () => void;
	setQuantityToMin: () => void;
	moveModal: (dir: Dir) => void;
	moonPhases: readonly string[];
	dayTransition: DayTransitionState | null;
	dayTransitionStarsState: DayTransitionStar[];
	dayTransitionStage: "intro" | "day" | "earned" | "final";
	dayTransitionClosePhase: "idle" | "card" | "backdrop";
	continueAfterSleep: () => void;
	dayTransitionPrompt: string;
	isSaveLoadMenuOpen: boolean;
	controlMode: "pc" | "mobile";
	canSaveGame: boolean;
	saveDisabledMessage: string | null;
	saveLoadStatus: string | null;
	toggleSaveLoadMenu: () => void;
	toggleControlMode: () => void;
	closeSaveLoadMenu: () => void;
	saveGameToFile: () => void;
	loadGameFromFilePicker: () => void;
	mobileMoveJoystickAnchor: { x: number; y: number } | null;
	mobileMoveJoystickThumb: { x: number; y: number } | null;
	mobileInteractJoystickAnchor: { x: number; y: number } | null;
	mobileInteractJoystickThumb: { x: number; y: number } | null;
	onMobileMoveJoystickTouchStart: (e: TouchEvent<HTMLDivElement>) => void;
	onMobileMoveJoystickTouchMove: (e: TouchEvent<HTMLDivElement>) => void;
	onMobileMoveJoystickTouchEnd: (e: TouchEvent<HTMLDivElement>) => void;
	onMobileInteractJoystickTouchStart: (e: TouchEvent<HTMLDivElement>) => void;
	onMobileInteractJoystickTouchMove: (e: TouchEvent<HTMLDivElement>) => void;
	onMobileInteractJoystickTouchEnd: (e: TouchEvent<HTMLDivElement>) => void;
	canZoomOut: boolean;
	canZoomIn: boolean;
	zoomOut: () => void;
	zoomIn: () => void;
	directorPopup: { message: string } | null;
	confirmDirectorPopup: () => void;
	tileFx: TileFxApi;
	tileFxBus: TileFxBus;
};
