import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { randomRoll } from "../shared/random";
import type { NpcDailyAssignment } from "../../npcDialogue";
import type { InteractionsContext } from "./interactions";
import type {
	Animal,
	AnimalType,
	CropDef,
	CropId,
	Dir,
	Door,
	ForestChest,
	ForestObstacle,
	FishingState,
	Inventory,
	ItemId,
	MapId,
	ModalOption,
	PetEmoji,
	Plot,
	Point,
	Position,
	PriceState,
	SketchyStockEntry,
	ToolLevels,
	TractorImplement,
	TraderTradeEntry,
	VendorKey,
	WeatherId,
} from "../shared/types";

type QuantityPromptConfig = {
	mode: "buy" | "sell";
	itemLabel: string;
	max: number;
	unitPrice: number;
	onConfirm: (quantity: number) => void;
};

export type PlayerInteractContext = {
	modal: unknown;
	beachBottlePos: Point | null;
	playHoe: () => void;
	playYaya: () => void;
	prices: PriceState;
	CORAL_FRUIT_SELL_PRICE: number;
	nextDay: () => void;
	handleLateInteractionBlocks: (ctx: InteractionsContext) => boolean;
	money: number;
	playMunch: () => void;
	speakNpcLine: (line: string) => void;
	fishing: FishingState | null;
	isOrdering: boolean;
	isDoctorCompounding: boolean;
	isDrivingTractor: boolean;
	dirDelta: Record<Dir, { dx: number; dy: number }>;
	player: Position;
	activeMapLayouts: Record<MapId, string[]>;
	forestEntranceDoorPos: Point;
	openForestExitMenu: () => void;
	forestForwardExitPos: Point;
	continueForestDungeon: () => void;
	caveEntranceDoorPos: Point;
	openCaveExitMenu: () => void;
	caveLadderPos: Point | null;
	continueCaveDungeon: () => void;
	mapDoors: Record<MapId, Door[]>;
	forestLockedToday: boolean;
	canEnterForest: () => boolean;
	caveLockedToday: boolean;
	canEnterCave: () => boolean;
	playBad: () => void;
	addLog: (line: string) => void;
	playNotification: () => void;
	setPlayer: Dispatch<SetStateAction<Position>>;
	ownedPet: PetEmoji | null;
	petTile: Point | null;
	playPetSound: (pet: PetEmoji) => void;
	setPetHeartTile: Dispatch<SetStateAction<Point | null>>;
	petHeartTimeoutRef: MutableRefObject<number | null>;
	hasTractor: boolean;
	tractorParked: boolean;
	TRACTOR_PARK_POS: Point;
	openMenu: (title: string, body: string[], options: ModalOption[]) => void;
	closeMenu: () => void;
	enterTractor: (implement: TractorImplement, seedItem?: ItemId | null) => void;
	allPlantableCropIds: CropId[];
	cropDefs: Record<CropId, CropDef>;
	inventory: Inventory;
	itemNames: Record<ItemId, string>;
	setBeachBottlePos: Dispatch<SetStateAction<Point | null>>;
	playGotReward: () => void;
	rollBeachBottleReward: (ctx: {
		randomInt: (min: number, max: number) => number;
		stamina: number;
		staminaMax: number;
		animalsCount: number;
		barnAnimalCap: number;
		canSpawnAnimal: boolean;
		ownedWardrobeLooks: string[];
		applyMoneyDelta: (delta: number) => void;
		updateInventory: (item: ItemId, amount: number) => void;
		setStamina: Dispatch<SetStateAction<number>>;
		setOwnedWardrobeLooks: Dispatch<SetStateAction<string[]>>;
		spawnAnimalInBarn: (type: AnimalType) => boolean;
	}) => string;
	randomInt: (min: number, max: number) => number;
	stamina: number;
	staminaMax: number;
	animals: Animal[];
	barnAnimalCap: number;
	nextOpenBarnTile: (occupied: Record<number, Point>) => Point | null;
	animalTiles: Record<number, Point>;
	setStamina: Dispatch<SetStateAction<number>>;
	setOwnedWardrobeLooks: Dispatch<SetStateAction<string[]>>;
	spawnAnimalInBarn: (type: AnimalType) => boolean;
	makeGaryBottleMessage: (
		rewardName: string,
		randomIntFn: (min: number, max: number) => number,
	) => string;
	playSeagulls: () => void;
	beachShellDrops: Record<string, boolean>;
	keyForPos: (x: number, y: number) => string;
	setBeachShellDrops: Dispatch<SetStateAction<Record<string, boolean>>>;
	playPluck: () => void;
	day: number;
	starterChestOpened: boolean;
	STARTER_CHEST_POS: Point;
	setStarterChestOpened: Dispatch<SetStateAction<boolean>>;
	applyMoneyDelta: (delta: number) => void;
	updateInventory: (item: ItemId, amount: number) => void;
	openRewardPopup: (line: string) => void;
	farmWeedObstacles: Record<string, boolean>;
	trySpendStamina: (cost: number) => boolean;
	setFarmWeedObstacles: Dispatch<SetStateAction<Record<string, boolean>>>;
	getWaterCapacity: (tools: ToolLevels) => number;
	tools: ToolLevels;
	tryUseToolAction: (toolLevel: number) => boolean;
	setWaterLevel: Dispatch<SetStateAction<number>>;
	playWater: () => void;
	setWaterRefillTile: Dispatch<SetStateAction<{ map: MapId; x: number; y: number } | null>>;
	waterRefillTileTimeoutRef: MutableRefObject<number | null>;
	startFishing: (map: MapId, x: number, y: number) => void;
	forestChest: ForestChest;
	setForestChest: Dispatch<SetStateAction<ForestChest>>;
	openHighValueForestChestReward: () => void;
	forestBonusChests: ForestChest[];
	setForestBonusChests: Dispatch<SetStateAction<ForestChest[]>>;
	forestIsBonusLevel: boolean;
	grantBonusChestRewardSet: (types: Array<"food" | "money" | "seeds" | "iron">) => string;
	forestObstacleAt: (x: number, y: number) => ForestObstacle | null;
	setForestObstacles: Dispatch<SetStateAction<ForestObstacle[]>>;
	getSmashAxeActionCost: (level: number) => number;
	getSmashAxeWoodSeedChance: (level: number) => number;
	getRandomCropId: (
		candidates: readonly CropId[],
		randomIntFn: (min: number, max: number) => number,
	) => CropId;
	standardCropIds: CropId[];
	getSmashAxeRockDamage: (level: number) => number;
	getSmashAxeIronChance: (level: number) => number;
	caveObstacleAt: (x: number, y: number) => ForestObstacle | null;
	setCaveObstacles: Dispatch<SetStateAction<ForestObstacle[]>>;
	caveLevel: number;
	setCaveLadderPos: Dispatch<SetStateAction<Point | null>>;
	caveObstacles: ForestObstacle[];
	animalsMap: MapId;
	farmForestBlockers: Record<string, boolean>;
	setFarmForestBlockers: Dispatch<SetStateAction<Record<string, boolean>>>;
	farmCaveBlockers: Record<string, number>;
	setFarmCaveBlockers: Dispatch<SetStateAction<Record<string, number>>>;
	petGraveObstacles: Record<string, number>;
	setPetGraveObstacles: Dispatch<SetStateAction<Record<string, number>>>;
	plots: Record<string, Plot>;
	getHoeTargets: (x: number, y: number, dir: Dir, level: number) => Array<{ x: number; y: number }>;
	setPlots: Dispatch<SetStateAction<Record<string, Plot>>>;
	currentWeather: WeatherId;
	playPloop: () => void;
	waterLevel: number;
	isBathing: boolean;
	playBath: () => void;
	setIsBathing: Dispatch<SetStateAction<boolean>>;
	clothingShopItems: readonly { look: string; price: number }[];
	ownedWardrobeLooks: string[];
	starterWardrobeLooks: readonly string[];
	purchasableFunnyLooks: readonly string[];
	setPlayerEmoji: Dispatch<SetStateAction<string>>;
	farmEggDrops: Record<string, boolean>;
	setFarmEggDrops: Dispatch<SetStateAction<Record<string, boolean>>>;
	isCowLikeAnimal: (type: AnimalType) => boolean;
	rollLivestockYield: (toolLevel: number) => number;
	setAnimals: Dispatch<SetStateAction<Animal[]>>;
	generateOverfedAnimalLine: (animalName: string) => string;
	interactBuilderVendor: () => void;
	interactVendor: (key: VendorKey) => void;
	vendorByShopMap: Partial<Record<MapId, VendorKey>>;
	isShopMap: (map: MapId) => boolean;
	shopDecorByMap: Record<string, Record<string, string>>;
	isFarmHouseDoorTile: (mapId: MapId, x: number, y: number) => boolean;
	getDoorGroundClass: (mapId: MapId, x: number, y: number) => string | undefined;
	petVendorActive: boolean;
	pendingPet: PetEmoji | null;
	canAfford: (value: number) => boolean;
	playChaChing: () => void;
	setPendingPet: Dispatch<SetStateAction<PetEmoji | null>>;
	petOptions: PetEmoji[];
	petVendorSoldLine: string;
	doctorVendorActive: boolean;
	doctorUsedToday: boolean;
	doctorFinishedTodayLine: string;
	doctorIntroLines: readonly string[];
	startDoctorMedicine: () => void;
	traderActive: boolean;
	TRADER_BOX_POS: Point;
	traderBoxLines: readonly string[];
	TRADER_HELI_POS: Point;
	traderHeliLines: readonly string[];
	TRADER_POS: Point;
	traderTrades: TraderTradeEntry[];
	traderSoldOutLines: readonly string[];
	traderIntroLines: readonly string[];
	openQuantityPrompt: (cfg: QuantityPromptConfig) => void;
	setTraderTrades: Dispatch<SetStateAction<TraderTradeEntry[]>>;
	traderAfterSaleLines: readonly string[];
	sketchyMerchantActive: boolean;
	sketchyMerchantStock: SketchyStockEntry[];
	SKETCHY_CRATE_POS: Point;
	dontTouchSketchy: readonly string[];
	SKETCHY_MERCHANT_POS: Point;
	sketchyMerchantIntro: readonly string[];
	setSketchyMerchantStock: Dispatch<SetStateAction<SketchyStockEntry[]>>;
	sketchyVendorSales: readonly string[];
	boatTiles: Record<string, Point>;
	boatDialogArray: readonly string[];
	townNpcTiles: Record<string, Point>;
	townNpcNames: Record<string, string>;
	npcDailyAssignments: Record<string, NpcDailyAssignment>;
	generateDailyAssignmentsForNpcs: (names: string[]) => Record<string, NpcDailyAssignment>;
	npcTalkedToday: Record<string, boolean>;
	townTips: readonly string[];
	generateNpcGreetingLine: (assignment: NpcDailyAssignment) => string;
	generateNpcDialogLine: (
		assignment: NpcDailyAssignment,
		type?: "Problem" | "RandomFact" | "Complement",
	) => string;
	setNpcTalkedToday: Dispatch<SetStateAction<Record<string, boolean>>>;
	DOCTOR_POS: Point;
	PET_VENDOR_POS: Point;
};

export const runInteract = (ctx: PlayerInteractContext, dir: Dir): void => {
const {
modal,beachBottlePos,playHoe,playYaya,prices,CORAL_FRUIT_SELL_PRICE,nextDay,handleLateInteractionBlocks,money,playMunch,speakNpcLine,fishing,isOrdering,isDoctorCompounding,isDrivingTractor,dirDelta,player,activeMapLayouts,forestEntranceDoorPos,openForestExitMenu,forestForwardExitPos,continueForestDungeon,caveEntranceDoorPos,openCaveExitMenu,caveLadderPos,continueCaveDungeon,mapDoors,forestLockedToday,canEnterForest,caveLockedToday,canEnterCave,playBad,addLog,playNotification,setPlayer,ownedPet,petTile,playPetSound,setPetHeartTile,petHeartTimeoutRef,hasTractor,tractorParked,TRACTOR_PARK_POS,openMenu,closeMenu,enterTractor,allPlantableCropIds,cropDefs,inventory,itemNames,setBeachBottlePos,playGotReward,rollBeachBottleReward,randomInt,stamina,staminaMax,animals,barnAnimalCap,nextOpenBarnTile,animalTiles,setStamina,setOwnedWardrobeLooks,spawnAnimalInBarn,makeGaryBottleMessage,playSeagulls,beachShellDrops,keyForPos,setBeachShellDrops,playPluck,day,starterChestOpened,STARTER_CHEST_POS,setStarterChestOpened,applyMoneyDelta,updateInventory,openRewardPopup,farmWeedObstacles,trySpendStamina,setFarmWeedObstacles,getWaterCapacity,tools,tryUseToolAction,setWaterLevel,playWater,setWaterRefillTile,waterRefillTileTimeoutRef,startFishing,forestChest,setForestChest,openHighValueForestChestReward,forestBonusChests,setForestBonusChests,forestIsBonusLevel,grantBonusChestRewardSet,forestObstacleAt,setForestObstacles,getSmashAxeActionCost,getSmashAxeWoodSeedChance,getRandomCropId,standardCropIds,getSmashAxeRockDamage,getSmashAxeIronChance,caveObstacleAt,setCaveObstacles,caveLevel,setCaveLadderPos,caveObstacles,animalsMap,farmForestBlockers,setFarmForestBlockers,farmCaveBlockers,setFarmCaveBlockers,petGraveObstacles,setPetGraveObstacles,plots,getHoeTargets,setPlots,currentWeather,playPloop,waterLevel,isShopMap,shopDecorByMap,isFarmHouseDoorTile,getDoorGroundClass,isBathing,playBath,setIsBathing,clothingShopItems,ownedWardrobeLooks,starterWardrobeLooks,purchasableFunnyLooks,setPlayerEmoji,farmEggDrops,setFarmEggDrops,isCowLikeAnimal,rollLivestockYield,setAnimals,generateOverfedAnimalLine,interactBuilderVendor,interactVendor,vendorByShopMap,petVendorActive,pendingPet,canAfford,playChaChing,setPendingPet,petOptions,petVendorSoldLine,doctorVendorActive,doctorUsedToday,doctorFinishedTodayLine,doctorIntroLines,startDoctorMedicine,traderActive,TRADER_BOX_POS,traderBoxLines,TRADER_HELI_POS,traderHeliLines,TRADER_POS,traderTrades,traderSoldOutLines,traderIntroLines,openQuantityPrompt,setTraderTrades,traderAfterSaleLines,sketchyMerchantActive,sketchyMerchantStock,SKETCHY_CRATE_POS,dontTouchSketchy,SKETCHY_MERCHANT_POS,sketchyMerchantIntro,setSketchyMerchantStock,sketchyVendorSales,boatTiles,boatDialogArray,townNpcTiles,townNpcNames,npcDailyAssignments,generateDailyAssignmentsForNpcs,npcTalkedToday,townTips,generateNpcGreetingLine,generateNpcDialogLine,setNpcTalkedToday,DOCTOR_POS,PET_VENDOR_POS
} = ctx;
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
				: mapDoors[player.map].find((d: { x: number; y: number }) => d.x === tx && d.y === ty);
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
							.map((cropId: CropId) => cropDefs[cropId].seedItem)
							.filter(
								(itemId: ItemId, idx: number, arr: ItemId[]) =>
									arr.indexOf(itemId) === idx,
							)
							.filter((itemId: ItemId) => inventory[itemId] > 0);
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
								...seedChoices.map((seedItem: ItemId) => ({
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
			const rewardName = rollBeachBottleReward({
				randomInt,
				stamina,
				staminaMax,
				animalsCount: animals.length,
				barnAnimalCap,
				canSpawnAnimal: nextOpenBarnTile(animalTiles) !== null,
				ownedWardrobeLooks,
				applyMoneyDelta,
				updateInventory,
				setStamina,
				setOwnedWardrobeLooks,
				spawnAnimalInBarn,
			});
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
			setBeachShellDrops((prev: Record<string, boolean>) => {
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
			setFarmWeedObstacles((prev: Record<string, boolean>) => ({ ...prev, [farmTargetKey]: false }));
			playHoe();
			const gotFeed = randomRoll() < 0.5;
			const gotMoney = randomRoll() < 0.02;
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
				setForestChest((prev: ForestChest) => ({ ...prev, opened: true }));
				openHighValueForestChestReward();
				return;
			}

			const bonusChest = forestBonusChests.find(
				(chest: ForestChest) => chest.x === tx && chest.y === ty && !chest.opened,
			);
			if (bonusChest) {
				setForestBonusChests((prev: ForestChest[]) =>
					prev.map((chest: ForestChest) =>
						chest.id === bonusChest.id ? { ...chest, opened: true } : chest,
					),
				);
				if (forestIsBonusLevel) {
					openHighValueForestChestReward();
					return;
				}
				const roll = randomRoll();
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
					const shuffled = [...options].sort(() => randomRoll() - 0.5);
					line = grantBonusChestRewardSet([shuffled[0]!, shuffled[1]!]);
				} else {
					const options = ["food", "money", "seeds", "iron"] as const;
					const withIron = randomRoll() < 0.5;
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
				setForestObstacles((prev: ForestObstacle[]) => prev.filter((o: ForestObstacle) => o.id !== obstacle.id));
				playHoe();
				const gotFeed = randomRoll() < 0.5;
				const gotMoney = randomRoll() < 0.02;
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
				setForestObstacles((prev: ForestObstacle[]) => prev.filter((o: ForestObstacle) => o.id !== obstacle.id));
				playHoe();
				const seedChance = getSmashAxeWoodSeedChance(smashAxeLevel);
				if (randomRoll() < seedChance) {
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
				setForestObstacles((prev: ForestObstacle[]) => prev .map((o: ForestObstacle) =>
							o.id === obstacle.id
								? { ...o, hitsRemaining: Math.max(0, o.hitsRemaining - damage) }
								: o,
						)
						 .filter((o: ForestObstacle) => o.hitsRemaining > 0),
				);
				playHoe();
				if (nextHitsRemaining > 0) {
					const swingsLeft = Math.ceil(nextHitsRemaining / damage);
					addLog(`You chip the rock. ${swingsLeft} swing${swingsLeft === 1 ? "" : "s"} left.`);
				} else {
					if (randomRoll() < getSmashAxeIronChance(smashAxeLevel)) {
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
				setCaveObstacles((prev: ForestObstacle[]) => prev .map((o: ForestObstacle) =>
							o.id === obstacle.id
								? { ...o, hitsRemaining: Math.max(0, o.hitsRemaining - damage) }
								: o,
						)
						 .filter((o: ForestObstacle) => o.hitsRemaining > 0),
				);
				playHoe();
				if (nextHitsRemaining > 0) {
					const swingsLeft = Math.ceil(nextHitsRemaining / damage);
					addLog(`You chip the cave rock. ${swingsLeft} swing${swingsLeft === 1 ? "" : "s"} left.`);
				} else {
					let foundGem = false;
					if (caveLevel >= 10 && randomRoll() < 1 / 40) {
						updateInventory("diamond", 1);
						playYaya();
						addLog("You found a Diamond! (+1)");
						foundGem = true;
					} else if (caveLevel >= 5 && randomRoll() < 1 / 30) {
						updateInventory("emerald", 1);
						playYaya();
						addLog("You found an Emerald! (+1)");
						foundGem = true;
					} else if (randomRoll() < 1 / 10) {
						updateInventory("ruby", 1);
						playYaya();
						addLog("You found a Ruby! (+1)");
						foundGem = true;
					}
					if (!foundGem && randomRoll() < getSmashAxeIronChance(smashAxeLevel)) {
						updateInventory("iron", 1);
						playYaya();
						addLog("You broke the cave rock and found Iron +1.");
					} else if (!foundGem) {
						addLog("You broke the cave rock.");
					}
					if (!caveLadderPos) {
						const remainingRocks = caveObstacles.filter((o: ForestObstacle) => o.id !== obstacle.id).length;
						const revealChance = 1 / 12;
						if (remainingRocks <= 0 || randomRoll() < revealChance) {
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
				setFarmForestBlockers((prev: Record<string, boolean>) => ({ ...prev, [blockerKey]: false }));
				playHoe();
				const seedChance = getSmashAxeWoodSeedChance(smashAxeLevel);
				if (randomRoll() < seedChance) {
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
				setFarmCaveBlockers((prev: Record<string, number>) => {
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
					if (randomRoll() < getSmashAxeIronChance(smashAxeLevel)) {
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
				setPetGraveObstacles((prev: Record<string, number>) => {
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
				} else if (randomRoll() < getSmashAxeIronChance(smashAxeLevel)) {
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
				targets.forEach(({ x, y }: { x: number; y: number }) => {
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
						.filter((cropId: CropId) => inventory[cropDefs[cropId].seedItem] > 0)
						.map((cropId: CropId) => ({
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
							...seedOptions.map(
								({ cropId, def }: { cropId: CropId; def: CropDef }) => ({
								label: `${cropId === "coral_fruit" ? "Sea Shell" : def.name} (${inventory[def.seedItem]})`,
								info: [
									`Grow Time: ${def.growDays} day${def.growDays === 1 ? "" : "s"}`,
									`Current Sell Value: $${def.harvestItem === "coral_fruit" ? CORAL_FRUIT_SELL_PRICE : prices[def.harvestItem]}`,
									`Seed In Bag: ${inventory[def.seedItem]}`,
								],
								onSelect: () => {
									updateInventory(def.seedItem, -1);
									setPlots((prev: Record<string, Plot>) => ({
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
									setPlots((prev: Record<string, Plot>) => {
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
					setPlots((prev: Record<string, Plot>) => ({
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
						 .map(({ x, y }: { x: number; y: number }) => keyForPos(x, y))
						 .filter((k: string) => {
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
					setWaterLevel((w: number) => Math.max(0, w - wateredCount));
					setPlots((prev: Record<string, Plot>) => ({
						...prev,
						...Object.fromEntries(
							keysToWater.map((k: string) => [k, { ...prev[k]!, watered: true }]),
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
				(item: { look: string }) => !ownedWardrobeLooks.includes(item.look),
			).length;
			const hasMoreToPurchase = remainingOutfits > 0;
			openMenu(
				"Wardrobe",
				["Choose your look."],
				[
					...ownedWardrobeLooks.map((look: string) => ({
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

		if (
			handleLateInteractionBlocks({
				playerMap: player.map,
				tx,
				ty,
				targetBaseTile,
				farmTargetKey,
				farmEggDrops,
				setFarmEggDrops,
				animals,
				animalTiles,
				tools,
				inventory,
				money,
				traderTrades,
				sketchyMerchantStock,
				boatTiles,
				townNpcTiles,
				npcDailyAssignments,
				npcTalkedToday,
				petVendorActive,
				ownedPet,
				pendingPet,
				doctorVendorActive,
				doctorUsedToday,
				traderActive,
				sketchyMerchantActive,
				playPluck,
				playBad,
				playMunch,
				playChaChing,
				speakNpcLine,
				addLog,
				updateInventory,
				canAfford,
				applyMoneyDelta,
				setAnimals,
				setPendingPet,
				setTraderTrades,
				setSketchyMerchantStock,
				setNpcTalkedToday,
				interactVendor,
				interactBuilderVendor,
				startDoctorMedicine,
				closeMenu,
				openMenu,
				openQuantityPrompt,
				randomInt,
			})
		)
			return;

		addLog("Nothing to interact with.");
}




