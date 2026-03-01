import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { NpcDailyAssignment } from "../../../npcDialogue";
import type {
	Animal,
	BarnTier,
	ForestGenerationResult,
	CaveGenerationResult,
	DayTransitionState,
	ItemId,
	PetEmoji,
	Point,
	Plot,
	PriceState,
	UpgradeSceneEvent,
} from "../../shared/types";
import { generateDailyAssignmentsForNpcs } from "../../../npcDialogue";
import { createDayTransitionStars, nextDayPrompts } from "../../content/dayTransition";
import { rollBeachBottleSpawn, rollBeachShellDrops } from "../../world/beach";
import { generateForestState, generateCaveState } from "../../world/generation";
import { getFarmBarnOuterRect, mapLayouts } from "../../world/layout";
import { generateDailyNewspaper } from "../../systems/news";
import { advancePlotsForNewDay, resetAnimalsForNewDay, rollDailyMarketState, rollDailyVendorState } from "../../systems/day";
import { evolveFarmWeeds } from "../../systems/weeds";
import { randomWeather } from "../../systems/weather";
import type { WeatherId, PriceTrendState, TraderTradeEntry, SketchyStockEntry } from "../../shared/types";

type RunNextDayArgs = {
	endFishing: () => void;
	day: number;
	currentDayEarned: number;
	totalEarned: number;
	staminaMax: number;
	stopAreaFade: () => void;
	currentAreaMusicRef: MutableRefObject<HTMLAudioElement | null>;
	endOfDayRef: MutableRefObject<HTMLAudioElement | null>;
	setPauseGame: Dispatch<SetStateAction<boolean>>;
	setDayTransitionPrompt: Dispatch<SetStateAction<string>>;
	setDayTransition: Dispatch<SetStateAction<DayTransitionState | null>>;
	setPreviousDayEarned: Dispatch<SetStateAction<number>>;
	setCurrentDayEarned: Dispatch<SetStateAction<number>>;
	setStamina: Dispatch<SetStateAction<number>>;
	setDay: Dispatch<SetStateAction<number>>;
	setCurrentWeather: Dispatch<SetStateAction<WeatherId>>;
	setForestLockedToday: Dispatch<SetStateAction<boolean>>;
	setCaveLockedToday: Dispatch<SetStateAction<boolean>>;
	townBeachBottleTiles: Array<{ x: number; y: number }>;
	randomInt: (min: number, max: number) => number;
	keyForPos: (x: number, y: number) => string;
	setBeachBottlePos: Dispatch<SetStateAction<Point | null>>;
	setBeachShellDrops: Dispatch<SetStateAction<Record<string, boolean>>>;
	townNpcNames: Record<string, string>;
	setNpcDailyAssignments: Dispatch<SetStateAction<Record<string, NpcDailyAssignment>>>;
	setNpcTalkedToday: Dispatch<SetStateAction<Record<string, boolean>>>;
	FOREST_GATE_Y: number;
	CAVE_GATE_Y: number;
	applyForestRoom: (next: ForestGenerationResult) => void;
	applyCaveRoom: (next: CaveGenerationResult) => void;
	setFarmWeedObstacles: Dispatch<SetStateAction<Record<string, boolean>>>;
	setFarmForestBlockers: Dispatch<SetStateAction<Record<string, boolean>>>;
	setFarmCaveBlockers: Dispatch<SetStateAction<Record<string, number>>>;
	setPetGraveObstacles: Dispatch<SetStateAction<Record<string, number>>>;
	farmForestBlockers: Record<string, boolean>;
	farmCaveBlockers: Record<string, number>;
	plots: Record<string, Plot>;
	STARTER_CHEST_POS: Point;
	setPlots: Dispatch<SetStateAction<Record<string, Plot>>>;
	animals: Animal[];
	animalTiles: Record<number, Point>;
	getEggDropNearChicken: (
		chickenPos: { x: number; y: number },
		occupiedAnimals: Record<number, { x: number; y: number }>,
		existingEggs: Record<string, boolean>,
	) => Point | null;
	setFarmEggDrops: Dispatch<SetStateAction<Record<string, boolean>>>;
	addLog: (line: string) => void;
	setAnimals: Dispatch<SetStateAction<Animal[]>>;
	pendingBarnUpgrade: boolean;
	barnTier: BarnTier;
	BARN_MAX_TIER: BarnTier;
	BARN_TIER_NAMES: Record<BarnTier, string>;
	setBarnTier: Dispatch<SetStateAction<BarnTier>>;
	setPendingBarnUpgrade: Dispatch<SetStateAction<boolean>>;
	hasAutoCollector: boolean;
	pendingAutoCollectorInstall: boolean;
	setHasAutoCollector: Dispatch<SetStateAction<boolean>>;
	setPendingAutoCollectorInstall: Dispatch<SetStateAction<boolean>>;
	isBarnExternal: (tier: BarnTier) => boolean;
	buildBarnLayout: (tier: BarnTier) => string[];
	getBarnAnimalCap: (tier: BarnTier) => number;
	placeAnimalsInBounds: (args: {
		animals: Animal[];
		cap: number;
		bounds: { minX: number; maxX: number; minY: number; maxY: number };
		rows?: string[];
		allowedTiles?: string[];
		scanFromBottom?: boolean;
	}) => { keptAnimals: Animal[]; occupied: Record<number, Point> };
	setAnimalTiles: Dispatch<SetStateAction<Record<number, Point>>>;
	setAnimalAnchors: Dispatch<SetStateAction<Record<number, Point>>>;
	pendingTractorDelivery: boolean;
	setHasTractor: Dispatch<SetStateAction<boolean>>;
	setTractorParked: Dispatch<SetStateAction<boolean>>;
	setPendingTractorDelivery: Dispatch<SetStateAction<boolean>>;
	pendingPet: PetEmoji | null;
	ownedPet: PetEmoji | null;
	setOwnedPet: Dispatch<SetStateAction<PetEmoji | null>>;
	setPendingPet: Dispatch<SetStateAction<PetEmoji | null>>;
	prices: PriceState;
	initialPrices: PriceState;
	initialPriceTrends: PriceTrendState;
	priceItems: ItemId[];
	setPrices: Dispatch<SetStateAction<PriceState>>;
	setPriceTrends: Dispatch<SetStateAction<PriceTrendState>>;
	generateSketchyMerchantStock: (prices: PriceState) => SketchyStockEntry[];
	generateTraderTrades: () => TraderTradeEntry[];
	setSketchyMerchantActive: Dispatch<SetStateAction<boolean>>;
	setSketchyMerchantStock: Dispatch<SetStateAction<SketchyStockEntry[]>>;
	setTraderActive: Dispatch<SetStateAction<boolean>>;
	setTraderTrades: Dispatch<SetStateAction<TraderTradeEntry[]>>;
	setDoctorVendorActive: Dispatch<SetStateAction<boolean>>;
	setDoctorUsedToday: Dispatch<SetStateAction<boolean>>;
	setPetVendorActive: Dispatch<SetStateAction<boolean>>;
	itemNames: Record<ItemId, string>;
	setNewspaper: Dispatch<SetStateAction<string>>;
	queueUpgradeScene: (event: UpgradeSceneEvent) => void;
};

export const runNextDay = (args: RunNextDayArgs): void => {
	const {
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
		queueUpgradeScene,
	} = args;

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
	setDayTransitionPrompt(nextDayPrompts[randomInt(0, nextDayPrompts.length - 1)]!);
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
			nextBottlePos ? new Set([keyForPos(nextBottlePos.x, nextBottlePos.y)]) : undefined,
		),
	);
	setNpcDailyAssignments(generateDailyAssignmentsForNpcs(Object.keys(townNpcNames)));
	setNpcTalkedToday({});
	applyForestRoom(
		generateForestState({
			level: 1,
			entranceSide: "left",
			entranceCoord: FOREST_GATE_Y,
			lastTurn: 0,
		}),
	);
	applyCaveRoom(
		generateCaveState({
			level: 1,
			entranceSide: "right",
			entranceCoord: CAVE_GATE_Y,
			lastTurn: 0,
		}),
	);
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

	const chickensReadyToLay = animals.filter((a) => a.type === "chicken" && a.fedToday);
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
		if (eggsLaid > 0) addLog(`Chickens laid ${eggsLaid} egg${eggsLaid === 1 ? "" : "s"}.`);
	}
	const nextDayAnimals = resetAnimalsForNewDay(animals);
	setAnimals(nextDayAnimals);

	if (pendingBarnUpgrade) {
		queueUpgradeScene({
			id: `${upcomingDay}-barn_upgraded-${randomInt(1000, 9999)}`,
			kind: "barn_upgraded",
			day: upcomingDay,
			bgTrack: "space_store",
		});
		const nextBarnTier = Math.min(BARN_MAX_TIER, (barnTier + 1) as BarnTier) as BarnTier;
		const prevBarnRect = getFarmBarnOuterRect(barnTier);
		const nextBarnRect = getFarmBarnOuterRect(nextBarnTier);
		setBarnTier(nextBarnTier);
		setPendingBarnUpgrade(false);
		addLog(`Your barn was upgraded overnight to ${BARN_TIER_NAMES[nextBarnTier]}.`);
		const barnExpandedOnFarm =
			nextBarnRect.w > prevBarnRect.w || nextBarnRect.h > prevBarnRect.h;
		if (barnExpandedOnFarm) {
			const inNextBarnRect = (x: number, y: number) =>
				x >= nextBarnRect.x &&
				x < nextBarnRect.x + nextBarnRect.w &&
				y >= nextBarnRect.y &&
				y < nextBarnRect.y + nextBarnRect.h;
			const dropInRect = <T extends boolean | number>(prev: Record<string, T>) =>
				Object.fromEntries(
					Object.entries(prev).filter(([key]) => {
						const [xStr, yStr] = key.split(",");
						const x = Number(xStr);
						const y = Number(yStr);
						return !inNextBarnRect(x, y);
					}),
				) as Record<string, T>;
			setFarmForestBlockers(dropInRect);
			setFarmCaveBlockers(dropInRect);
			setPetGraveObstacles(dropInRect);
			setFarmWeedObstacles(dropInRect);
			setFarmEggDrops(dropInRect);
		}
		if (isBarnExternal(nextBarnTier)) {
			const nextLayout = buildBarnLayout(nextBarnTier);
			const rows = nextLayout.map((r) => r.split(""));
			const bounds = {
				minX: 1,
				maxX: (rows[0]?.length ?? 0) - 2,
				minY: 1,
				maxY: rows.length - 2,
			};
			const relocation = placeAnimalsInBounds({
				animals: nextDayAnimals,
				cap: getBarnAnimalCap(nextBarnTier),
				bounds,
				rows: nextLayout,
				allowedTiles: ["."],
				scanFromBottom: true,
			});
			setAnimals(relocation.keptAnimals);
			setAnimalTiles(relocation.occupied);
			setAnimalAnchors(relocation.occupied);
			setFarmEggDrops({});
		}
	}

	if (pendingAutoCollectorInstall) {
		if (!hasAutoCollector) {
			setHasAutoCollector(true);
			queueUpgradeScene({
				id: `${upcomingDay}-auto_collector_installed-${randomInt(1000, 9999)}`,
				kind: "auto_collector_installed",
				day: upcomingDay,
				bgTrack: "space_store",
			});
			addLog("Your auto milker/shearer/egg collector was installed overnight.");
		}
		setPendingAutoCollectorInstall(false);
	}

	if (pendingTractorDelivery) {
		queueUpgradeScene({
			id: `${upcomingDay}-tractor_delivered-${randomInt(1000, 9999)}`,
			kind: "tractor_delivered",
			day: upcomingDay,
			bgTrack: "space_store",
		});
		setHasTractor(true);
		setTractorParked(true);
		setPendingTractorDelivery(false);
		addLog("Your tractor has been delivered to the farm driveway.");
	}

	const deliveredPet = pendingPet;
	if (deliveredPet) {
		queueUpgradeScene({
			id: `${upcomingDay}-pet_arrived-${randomInt(1000, 9999)}`,
			kind: "pet_arrived",
			day: upcomingDay,
			bgTrack: "space_store",
		});
		setOwnedPet(deliveredPet);
		setPendingPet(null);
		addLog(`Your new pet arrived at the farm: ${deliveredPet}`);
	}

	const oldPrices = prices;
	const { newPrices, newTrends, changedItems } = rollDailyMarketState({
		oldPrices,
		defaultPrices: initialPrices,
		initialPriceTrends,
		priceItems,
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

	setNewspaper(
		generateDailyNewspaper(
			oldPrices,
			newPrices,
			changedItems,
			nextWeather,
			itemNames,
			randomInt,
		),
	);
	addLog(`Day ${day + 1} began.`);
};

type ContinueAfterSleepArgs = {
	dayTransition: DayTransitionState | null;
	dayTransitionClosePhase: "idle" | "card" | "backdrop";
	crossFadeEndOfDayTo: (target: HTMLAudioElement | null, durationMs?: number) => void;
	houseMusicRef: MutableRefObject<HTMLAudioElement | null>;
	setDayTransitionClosePhase: Dispatch<SetStateAction<"idle" | "card" | "backdrop">>;
	finalizeAfterSleep: () => void;
	dayTransitionCloseTimersRef: MutableRefObject<number[]>;
};

export const continueAfterSleep = (args: ContinueAfterSleepArgs): void => {
	const {
		dayTransition,
		dayTransitionClosePhase,
		crossFadeEndOfDayTo,
		houseMusicRef,
		setDayTransitionClosePhase,
		finalizeAfterSleep,
		dayTransitionCloseTimersRef,
	} = args;
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

type StartDayTransitionSequenceArgs = {
	dayTransition: DayTransitionState | null;
	dayTransitionCloseTimersRef: MutableRefObject<number[]>;
	dayTransitionTimersRef: MutableRefObject<number[]>;
	setDayTransitionStage: Dispatch<SetStateAction<"intro" | "day" | "earned" | "final">>;
	setDayTransitionClosePhase: Dispatch<SetStateAction<"idle" | "card" | "backdrop">>;
	setDayTransitionStarsState: Dispatch<SetStateAction<ReturnType<typeof createDayTransitionStars>>>;
};

export const startDayTransitionSequence = (
	args: StartDayTransitionSequenceArgs,
): (() => void) | void => {
	const {
		dayTransition,
		dayTransitionCloseTimersRef,
		dayTransitionTimersRef,
		setDayTransitionStage,
		setDayTransitionClosePhase,
		setDayTransitionStarsState,
	} = args;
	dayTransitionCloseTimersRef.current.forEach((t) => window.clearTimeout(t));
	dayTransitionCloseTimersRef.current = [];
	dayTransitionTimersRef.current.forEach((t) => window.clearTimeout(t));
	dayTransitionTimersRef.current = [];
	if (!dayTransition) return;
	setDayTransitionStage("intro");
	setDayTransitionClosePhase("idle");
	setDayTransitionStarsState(createDayTransitionStars());
	const dayTimer = window.setTimeout(() => setDayTransitionStage("day"), 6000);
	const earnedTimer = window.setTimeout(() => setDayTransitionStage("earned"), 7000);
	const finalTimer = window.setTimeout(() => setDayTransitionStage("final"), 8000);
	dayTransitionTimersRef.current = [dayTimer, earnedTimer, finalTimer];
	return () => {
		dayTransitionTimersRef.current.forEach((t) => window.clearTimeout(t));
		dayTransitionTimersRef.current = [];
	};
};

export const playDayTransitionEarnedSfx = (args: {
	dayTransition: DayTransitionState | null;
	dayTransitionStage: "intro" | "day" | "earned" | "final";
	playChaChing: () => void;
	playBad: () => void;
}): void => {
	const { dayTransition, dayTransitionStage, playChaChing, playBad } = args;
	if (!dayTransition || dayTransitionStage !== "earned") return;
	if (dayTransition.previousDayEarned > 0) playChaChing();
	else playBad();
};
