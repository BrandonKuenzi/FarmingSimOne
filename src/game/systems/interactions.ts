import {
	boatDialogArray,
	cowHarvestTtsLines,
	doctorFinishedTodayLine,
	doctorIntroLines,
	dontTouchSketchy,
	petVendorSoldLine,
	sheepHarvestTtsLines,
	sketchyMerchantIntro,
	sketchyVendorSales,
	traderAfterSaleLines,
	traderBoxLines,
	traderHeliLines,
	traderIntroLines,
	traderSoldOutLines,
} from "../content/dialog";
import {
	countFriendshipHeartsForUniqueTalks,
	getDialogPoolForLevel,
	NPCInterestTitles,
	generatedNPCDialog,
	possibleNPCInterests,
	type FriendshipLevel,
	type NPCInterest,
} from "../content/npcDialog";
import { animalDefs, isCowLikeAnimal, itemNames } from "../content/catalog";
import { progressAlgorithmStones } from "../progression/progressStonesAlgorithmic";
import { GLYPH } from "../config/glyphs";
import {
	PLAYER_STAT_KEYS,
	TRADER_ALGORITHM_STONE_DEFAULT_VALUE_BY_RARITY,
	makeTownNpcUniqueTalkKey,
} from "../statistics/statistics";
import {
	DOCTOR_POS,
	PET_VENDOR_POS,
	petOptions,
	SKETCHY_CRATE_POS,
	SKETCHY_MERCHANT_POS,
	TRADER_BOX_POS,
	TRADER_HELI_POS,
	TRADER_POS,
} from "../world/npcs";
import { isShopMap, vendorByShopMap } from "../world/navigation";
import { rollLivestockYield } from "./tools";
import { randomRoll } from "../shared/random";
import type {
	Animal,
	Inventory,
	ItemId,
	MapId,
	ModalOption,
	PetEmoji,
	Point,
	SketchyStockEntry,
	TileFxApi,
	ToolLevels,
	TraderTradeEntry,
	VendorKey,
	ProgressEventPayload,
	ProgressAlgorithmId,
	ProgressTargetId,
} from "../shared/types";

export type InteractionsContext = {
	playerEmoji: string;
	playerMap: MapId;
	tx: number;
	ty: number;
	targetBaseTile?: string;
	farmTargetKey: string;
	farmEggDrops: Record<string, boolean>;
	hasAutoCollector: boolean;
	barnAutoCollectorPos: Point | null;
	barnAutoCollectorMap: MapId;
	hasAutoFeeder: boolean;
	barnAutoFeederPos: Point | null;
	barnAutoFeederMap: MapId;
	setFarmEggDrops: (
		updater: (prev: Record<string, boolean>) => Record<string, boolean>,
	) => void;
	animals: Animal[];
	animalTiles: Record<number, Point>;
	tools: ToolLevels;
	inventory: Inventory;
	money: number;
	traderTrades: TraderTradeEntry[];
	sketchyMerchantStock: SketchyStockEntry[];
	boatTiles: Record<string, Point>;
	townNpcTiles: Record<string, Point>;
	townNpcNames: Record<string, string>;
	townNpcInterests: Record<string, NPCInterest>;
	townNpcGlyphs: Record<string, string>;
	npcTalkedToday: Record<string, boolean>;
	petVendorActive: boolean;
	ownedPet: string | null;
	pendingPet: string | null;
	doctorVendorActive: boolean;
	doctorUsedToday: boolean;
	traderActive: boolean;
	sketchyMerchantActive: boolean;
	playPluck: () => void;
	playBad: () => void;
	playMunch: () => void;
	playChaChing: () => void;
	playFriendship?: () => void;
	lockInputForMs?: (ms: number) => void;
	speakNpcLine: (line: string) => void;
	addLog: (line: string) => void;
	updateInventory: (item: ItemId, amount: number) => void;
	canAfford: (value: number) => boolean;
	applyMoneyDelta: (delta: number) => void;
	setAnimals: (updater: (prev: Animal[]) => Animal[]) => void;
	setPendingPet: (pet: PetEmoji | null) => void;
	setTraderTrades: (
		updater: (prev: TraderTradeEntry[]) => TraderTradeEntry[],
	) => void;
	setSketchyMerchantStock: (
		updater: (prev: SketchyStockEntry[]) => SketchyStockEntry[],
	) => void;
	setSketchyMerchantActive: (updater: (prev: boolean) => boolean) => void;
	setNpcTalkedToday: (
		updater: (prev: Record<string, boolean>) => Record<string, boolean>,
	) => void;
	interactVendor: (key: VendorKey) => void;
	interactBuilderVendor: (target: Point) => void;
	startDoctorMedicine: () => void;
	closeMenu: () => void;
	openMenu: (title: string, body: string[], options: ModalOption[]) => void;
	openQuantityPrompt: (cfg: {
		mode: "buy" | "sell";
		itemLabel: string;
		max: number;
		unitPrice: number;
		onConfirm: (quantity: number) => void;
	}) => void;
	randomInt: (min: number, max: number) => number;
	tileFx: TileFxApi;
	onProgressEvent?: (event: ProgressEventPayload) => void;
	incrementStatistics?: (key: string, amount?: number) => void;
	getStatisticValue?: (key: string) => number;
	resolveItemDefaultMarketValue?: (itemId: ItemId) => number;
	onManualCowMilked?: () => void;
	onManualSheepSheared?: () => void;
	grantProgressStone?: (
		kind: "target" | "algorithm",
		stoneId: ProgressTargetId | ProgressAlgorithmId,
		label: string,
		options?: { suppressLog?: boolean; suppressToast?: boolean },
	) => void;
};

export const handleLateInteractionBlocks = (
	ctx: InteractionsContext,
): boolean => {
	const {
		playerEmoji,
		playerMap,
		tx,
		ty,
		targetBaseTile,
		farmTargetKey,
		farmEggDrops,
		hasAutoCollector,
		barnAutoCollectorPos,
		barnAutoCollectorMap,
		hasAutoFeeder,
		barnAutoFeederPos,
		barnAutoFeederMap,
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
		townNpcNames,
		townNpcInterests,
		townNpcGlyphs,
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
		playFriendship,
		lockInputForMs,
		speakNpcLine,
		addLog,
		updateInventory,
		canAfford,
		applyMoneyDelta,
		setAnimals,
		setPendingPet,
		setTraderTrades,
		setSketchyMerchantStock,
		setSketchyMerchantActive,
		setNpcTalkedToday,
		interactVendor,
		interactBuilderVendor,
		startDoctorMedicine,
		closeMenu,
		openMenu,
		openQuantityPrompt,
		randomInt,
		tileFx,
		onProgressEvent,
		incrementStatistics,
		getStatisticValue,
		resolveItemDefaultMarketValue,
		onManualCowMilked,
		onManualSheepSheared,
		grantProgressStone,
	} = ctx;
	const algorithmStoneNameById = Object.fromEntries(
		progressAlgorithmStones.map((stone) => [stone.id, stone.name]),
	) as Record<string, string>;
	const algorithmStoneRarityById = Object.fromEntries(
		progressAlgorithmStones.map((stone) => [stone.id, stone.rarity]),
	) as Record<string, "common" | "uncommon" | "rare" | "legendary">;

	const copSketchyLines = [
		"Hi officer. I was just leaving.",
		"I'm just a peaceful citizen. Gotta go.",
		"I'm innocent, I promise! Um... I've got an appointment.",
	] as const;

	const emoteTownTarget = (x: number, y: number, positive: boolean) => {
		const kind = randomRoll() < (positive ? 0.75 : 0.25) ? "happy" : "sad";
		tileFx.at({ map: "town", x, y }).emote(kind);
	};
	const toastTownSpeech = (x: number, y: number, line: string) => {
		tileFx.at({ map: "town", x, y }).toast(line, 6000);
	};

	if (playerMap === "farm" || playerMap === "barn") {
		if (
			playerMap === barnAutoCollectorMap &&
			hasAutoCollector &&
			barnAutoCollectorPos &&
			tx === barnAutoCollectorPos.x &&
			ty === barnAutoCollectorPos.y
		) {
			const milkCount = animals.filter(
				(animal) => animal.type === "cow" && animal.hasProductReady,
			).length;
			const woolCount = animals.filter(
				(animal) => animal.type === "sheep" && animal.hasProductReady,
			).length;
			const eggCount = Object.values(farmEggDrops).filter(Boolean).length;
			if (milkCount > 0) updateInventory("milk", milkCount);
			if (woolCount > 0) updateInventory("wool", woolCount);
			if (eggCount > 0) updateInventory("egg", eggCount);
			if (milkCount > 0) {
				onProgressEvent?.({ type: "milk_collected", quantity: milkCount });
				incrementStatistics?.(
					PLAYER_STAT_KEYS.cowMilkingInteractions,
					milkCount,
				);
			}
			if (woolCount > 0) {
				onProgressEvent?.({ type: "wool_collected", quantity: woolCount });
				incrementStatistics?.(
					PLAYER_STAT_KEYS.sheepShearingInteractions,
					woolCount,
				);
			}
			if (eggCount > 0) {
				onProgressEvent?.({ type: "egg_collected", quantity: eggCount });
				incrementStatistics?.(PLAYER_STAT_KEYS.eggsPickedTotal, eggCount);
			}
			setFarmEggDrops(() => ({}));
			setAnimals((prev) =>
				prev.map((animal) =>
					animal.hasProductReady ? { ...animal, hasProductReady: false } : animal,
				),
			);
			if (milkCount + woolCount + eggCount <= 0) {
				addLog("No animal products are ready.");
				return true;
			}
			playPluck();
			tileFx.at({ map: playerMap, x: tx, y: ty }).streatch(1.35, 260);
			const collectedParts: string[] = [];
			if (milkCount > 0) collectedParts.push(`milk x${milkCount}`);
			if (woolCount > 0) collectedParts.push(`wool x${woolCount}`);
			if (eggCount > 0) collectedParts.push(`egg x${eggCount}`);
			addLog(`Auto collector gathered ${collectedParts.join(", ")}.`);
			return true;
		}
		if (
			playerMap === barnAutoFeederMap &&
			hasAutoFeeder &&
			barnAutoFeederPos &&
			tx === barnAutoFeederPos.x &&
			ty === barnAutoFeederPos.y
		) {
			const hungryAnimals = animals.filter((animal) => !animal.fedToday);
			const showBarnToast = (text: string, delayMs = 0) => {
				if (delayMs <= 0) {
					tileFx.at({ map: playerMap, x: tx, y: ty }).toast(text);
					return;
				}
				window.setTimeout(() => {
					tileFx.at({ map: playerMap, x: tx, y: ty }).toast(text);
				}, delayMs);
			};
			if (hungryAnimals.length <= 0) {
				const line = "No hungry animals";
				showBarnToast(line);
				return true;
			}
			if (inventory.feed <= 0) {
				const line = "No food";
				showBarnToast(line);
				playBad();
				return true;
			}
			const feedCount = Math.min(hungryAnimals.length, inventory.feed);
			if (feedCount <= 0) {
				const line = "No food";
				showBarnToast(line);
				playBad();
				return true;
			}
			const fedIds = new Set(hungryAnimals.slice(0, feedCount).map((animal) => animal.id));
			setAnimals((prev) =>
				prev.map((animal) =>
					fedIds.has(animal.id) ? { ...animal, fedToday: true } : animal,
				),
			);
			onProgressEvent?.({ type: "animal_fed", quantity: feedCount });
			updateInventory("feed", -feedCount);
			playMunch();
			tileFx.at({ map: playerMap, x: tx, y: ty }).streatch(1.35, 260);
			const fedLine = `Feed ${feedCount} animals`;
			showBarnToast(fedLine);
			if (feedCount < hungryAnimals.length) {
				const shortLine = "Not enough food";
				showBarnToast(shortLine, 300);
			}
			return true;
		}
		if (farmEggDrops[farmTargetKey]) {
			setFarmEggDrops((prev) => {
				const next = { ...prev };
				delete next[farmTargetKey];
				return next;
			});
			playPluck();
			updateInventory("egg", 1);
			onProgressEvent?.({ type: "egg_collected", quantity: 1 });
			incrementStatistics?.(PLAYER_STAT_KEYS.eggsPickedTotal, 1);
			return true;
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
				const toolLevel = isCowLikeAnimal(animal.type)
					? tools.milkingGloves
					: tools.shears;
				const produced = rollLivestockYield(toolLevel);
				updateInventory(product, produced);
				if (product === "milk") {
					onProgressEvent?.({ type: "milk_collected", quantity: produced });
					incrementStatistics?.(PLAYER_STAT_KEYS.cowMilkingInteractions, 1);
					onManualCowMilked?.();
				} else if (product === "wool") {
					onProgressEvent?.({ type: "wool_collected", quantity: produced });
					incrementStatistics?.(PLAYER_STAT_KEYS.sheepShearingInteractions, 1);
					onManualSheepSheared?.();
				}
				tileFx.actor(`animal-${animal.id}`).streatch(1.35, 220);
				setAnimals((prev) =>
					prev.map((a) =>
						a.id === animal.id ? { ...a, hasProductReady: false } : a,
					),
				);
				playPluck();
				if (randomRoll() < 0.25) {
					const lines = isCowLikeAnimal(animal.type)
						? cowHarvestTtsLines
						: sheepHarvestTtsLines;
					const line = lines[randomInt(0, lines.length - 1)]!;
					speakNpcLine(line);
				}
				return true;
			}
			if (animal.fedToday) {
				addLog("Not hungry");
				return true;
			}
			if (inventory.feed <= 0) {
				playBad();
				addLog(`No feed left for ${animalDefs[animal.type].name}.`);
				return true;
			}
			setAnimals((prev) =>
				prev.map((a) => (a.id === animal.id ? { ...a, fedToday: true } : a)),
			);
			onProgressEvent?.({ type: "animal_fed", quantity: 1 });
			tileFx.actor(`animal-${animal.id}`).streatch(1.35, 220);
			updateInventory("feed", -1);
			playMunch();
			return true;
		}
	}

	if (
		playerMap === "tool_shop" &&
		((targetBaseTile === "x" && tx >= 8) || targetBaseTile === "b")
	) {
		interactBuilderVendor({ x: tx, y: ty });
		return true;
	}
	if (playerMap === "tool_shop") {
		if ((targetBaseTile === "x" && tx <= 6) || targetBaseTile === "j") {
			interactVendor("tool_vendor");
			return true;
		}
		if (targetBaseTile === "x" && tx === 7) {
			return true;
		}
	}
	if (isShopMap(playerMap)) {
		const vendorKey = vendorByShopMap[playerMap];
		if (vendorKey && (targetBaseTile === "x" || targetBaseTile === "j")) {
			interactVendor(vendorKey);
			return true;
		}
	}

	if (playerMap === "town") {
		if (
			petVendorActive &&
			!ownedPet &&
			tx === PET_VENDOR_POS.x &&
			ty === PET_VENDOR_POS.y
		) {
			if (pendingPet) {
				emoteTownTarget(tx, ty, true);
				speakNpcLine(petVendorSoldLine);
				toastTownSpeech(tx, ty, petVendorSoldLine);
				return true;
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
								emoteTownTarget(tx, ty, false);
								playBad();
								addLog("Not enough money to adopt that pet.");
								closeMenu();
								return;
							}
							applyMoneyDelta(-500);
							playChaChing();
							setPendingPet(pet);
							closeMenu();
							emoteTownTarget(tx, ty, true);
							speakNpcLine(petVendorSoldLine);
							toastTownSpeech(tx, ty, petVendorSoldLine);
						},
					})),
					{ label: "Back", onSelect: closeMenu },
				],
			);
			return true;
		}
		if (doctorVendorActive && tx === DOCTOR_POS.x && ty === DOCTOR_POS.y) {
			if (doctorUsedToday) {
				emoteTownTarget(tx, ty, false);
				speakNpcLine(doctorFinishedTodayLine);
				toastTownSpeech(tx, ty, doctorFinishedTodayLine);
				return true;
			}
			const intro =
				doctorIntroLines[randomInt(0, doctorIntroLines.length - 1)]!;
			speakNpcLine(intro);
			openMenu(
				"Doctor",
				[intro, "Cost: 1 Diamond, 1 Emerald, 1 Ruby, and $1000."],
				[
					{
						label: "Yes",
						info: ["A custom treatment that increases max stamina by 20."],
						onSelect: () => {
							if (!canAfford(1000)) {
								emoteTownTarget(tx, ty, false);
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
								emoteTownTarget(tx, ty, false);
								playBad();
								addLog("You need 1 Diamond, 1 Emerald, and 1 Ruby.");
								closeMenu();
								return;
							}
							emoteTownTarget(tx, ty, true);
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
			return true;
		}
		if (traderActive && tx === TRADER_BOX_POS.x && ty === TRADER_BOX_POS.y) {
			emoteTownTarget(tx, ty, true);
			const line = traderBoxLines[randomInt(0, traderBoxLines.length - 1)]!;
			speakNpcLine(line);
			toastTownSpeech(tx, ty, line);
			return true;
		}
		if (traderActive && tx === TRADER_HELI_POS.x && ty === TRADER_HELI_POS.y) {
			emoteTownTarget(tx, ty, true);
			const line = traderHeliLines[randomInt(0, traderHeliLines.length - 1)]!;
			speakNpcLine(line);
			toastTownSpeech(tx, ty, line);
			return true;
		}
		if (traderActive && tx === TRADER_POS.x && ty === TRADER_POS.y) {
			if (traderTrades.length <= 0) {
				emoteTownTarget(tx, ty, false);
				const line =
					traderSoldOutLines[randomInt(0, traderSoldOutLines.length - 1)]!;
				speakNpcLine(line);
				toastTownSpeech(tx, ty, line);
				return true;
			}
			const intro =
				traderIntroLines[randomInt(0, traderIntroLines.length - 1)]!;
			speakNpcLine(intro);
			openMenu(
				"Trader",
				[intro],
				[
					...traderTrades.map((trade) => {
						const givesAlgorithmStone = !!trade.giveAlgorithmStoneId;
						const giveLabel = givesAlgorithmStone
							? (algorithmStoneNameById[trade.giveAlgorithmStoneId!] ??
								trade.giveAlgorithmStoneId!)
							: itemNames[trade.giveItem];
						const maxCanTrade = Math.min(
							trade.remaining,
							inventory[trade.wantItem],
						);
						return {
							label: `Trade ${itemNames[trade.wantItem]} -> ${giveLabel}`,
							info: [
								`Needs: ${itemNames[trade.wantItem]}`,
								`Gives: ${giveLabel}`,
								`You have: ${inventory[trade.wantItem]}`,
								`Trader stock: ${trade.remaining}`,
								"Rate: 1 for 1",
							],
							onSelect: () => {
								openQuantityPrompt({
									mode: "buy",
									itemLabel: `${itemNames[trade.wantItem]} -> ${giveLabel}`,
									max: maxCanTrade,
									unitPrice: 0,
									onConfirm: (quantity) => {
										updateInventory(trade.wantItem, -quantity);
										const wantDefaultValue =
											resolveItemDefaultMarketValue?.(trade.wantItem) ?? 0;
										const giveDefaultValue = trade.giveAlgorithmStoneId
											? TRADER_ALGORITHM_STONE_DEFAULT_VALUE_BY_RARITY[
													algorithmStoneRarityById[trade.giveAlgorithmStoneId] ??
														"common"
												]
											: resolveItemDefaultMarketValue?.(trade.giveItem) ?? 0;
										const perUnitAverage =
											(wantDefaultValue + giveDefaultValue) / 2;
										incrementStatistics?.(
											PLAYER_STAT_KEYS.traderExchangeValueTotal,
											Math.round(perUnitAverage * quantity),
										);
										if (trade.giveAlgorithmStoneId) {
											const stoneLabel =
												algorithmStoneNameById[trade.giveAlgorithmStoneId] ??
												trade.giveAlgorithmStoneId;
											for (let i = 0; i < quantity; i += 1) {
												grantProgressStone?.(
													"algorithm",
													trade.giveAlgorithmStoneId,
													stoneLabel,
												);
											}
										} else {
											updateInventory(trade.giveItem, quantity);
										}
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
										emoteTownTarget(tx, ty, true);
										const line =
											traderAfterSaleLines[
												randomInt(0, traderAfterSaleLines.length - 1)
											]!;
										speakNpcLine(line);
										toastTownSpeech(tx, ty, line);
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
			return true;
		}
		if (
			sketchyMerchantActive &&
			sketchyMerchantStock.length > 0 &&
			tx === SKETCHY_CRATE_POS.x &&
			ty === SKETCHY_CRATE_POS.y
		) {
			emoteTownTarget(tx, ty, false);
			const line = dontTouchSketchy[randomInt(0, dontTouchSketchy.length - 1)]!;
			speakNpcLine(line);
			return true;
		}
		if (
			sketchyMerchantActive &&
			tx === SKETCHY_MERCHANT_POS.x &&
			ty === SKETCHY_MERCHANT_POS.y
		) {
			if (playerEmoji === GLYPH.cop) {
				const availableDrops = sketchyMerchantStock.filter((entry) => entry.qty > 0);
				const dropped =
					availableDrops[randomInt(0, Math.max(0, availableDrops.length - 1))];
				const line = copSketchyLines[randomInt(0, copSketchyLines.length - 1)]!;
				emoteTownTarget(tx, ty, false);
				tileFx.at({ map: "town", x: tx, y: ty }).toast(line, 8000);
				speakNpcLine(line);
				if (dropped) {
					window.setTimeout(() => {
						setSketchyMerchantActive(() => false);
						const droppedLabel = dropped.giveAlgorithmStoneId
							? (algorithmStoneNameById[dropped.giveAlgorithmStoneId] ??
								dropped.giveAlgorithmStoneId)
							: itemNames[dropped.item];
						const dropLine = `The shady vendor dropped a ${droppedLabel}.`;
						tileFx.actor("player").toast(dropLine, 4000);
						window.setTimeout(() => {
							if (dropped.giveAlgorithmStoneId) {
								grantProgressStone?.(
									"algorithm",
									dropped.giveAlgorithmStoneId,
									droppedLabel,
								);
							} else {
								updateInventory(dropped.item, 1);
							}
						}, 4000);
					}, 8000);
				} else {
					window.setTimeout(() => {
						setSketchyMerchantActive(() => false);
					}, 8000);
				}
				return true;
			}
			if (sketchyMerchantStock.length <= 0) {
				emoteTownTarget(tx, ty, false);
				const soldOutLine = "I aint got nothin more today";
				speakNpcLine(soldOutLine);
				toastTownSpeech(tx, ty, soldOutLine);
				return true;
			}
			const intro =
				sketchyMerchantIntro[randomInt(0, sketchyMerchantIntro.length - 1)]!;
			speakNpcLine(intro);
			openMenu(
				"Sketchy Merchant",
				[intro],
				[
					...sketchyMerchantStock.map((entry) => {
						const givesAlgorithmStone = !!entry.giveAlgorithmStoneId;
						const itemLabel = givesAlgorithmStone
							? (algorithmStoneNameById[entry.giveAlgorithmStoneId!] ??
								entry.giveAlgorithmStoneId!)
							: itemNames[entry.item];
						const maxCanBuy = Math.min(
							entry.qty,
							Math.floor(money / Math.max(1, entry.price)),
						);
						return {
							label: `${itemLabel} $${entry.price}`,
							info: [
								`Stock: ${entry.qty}`,
								`You can buy now: ${maxCanBuy}`,
								`Price: $${entry.price} each`,
								`Item: ${itemLabel}`,
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
									itemLabel,
									max: maxCanBuy,
									unitPrice: entry.price,
									onConfirm: (quantity) => {
										applyMoneyDelta(-entry.price * quantity);
										incrementStatistics?.(
											PLAYER_STAT_KEYS.shadyMerchantDollarsSpent,
											entry.price * quantity,
										);
										if (entry.giveAlgorithmStoneId) {
											for (let i = 0; i < quantity; i += 1) {
												grantProgressStone?.(
													"algorithm",
													entry.giveAlgorithmStoneId,
													itemLabel,
												);
											}
										} else {
											updateInventory(entry.item, quantity);
										}
										setSketchyMerchantStock((prev) =>
											prev
												.map((stockEntry) =>
													stockEntry.item === entry.item &&
													stockEntry.giveAlgorithmStoneId ===
														entry.giveAlgorithmStoneId
														? {
																...stockEntry,
																qty: Math.max(0, stockEntry.qty - quantity),
															}
														: stockEntry,
												)
												.filter((stockEntry) => stockEntry.qty > 0),
										);
										playChaChing();
										emoteTownTarget(tx, ty, true);
										const salesLine =
											sketchyVendorSales[
												randomInt(0, sketchyVendorSales.length - 1)
											]!;
										speakNpcLine(salesLine);
										toastTownSpeech(tx, ty, salesLine);
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
			return true;
		}

		const boat = Object.entries(boatTiles).find(
			([, pos]) => pos.x === tx && pos.y === ty,
		);
		if (boat) {
			emoteTownTarget(tx, ty, true);
			const line = boatDialogArray[randomInt(0, boatDialogArray.length - 1)]!;
			speakNpcLine(line);
			toastTownSpeech(tx, ty, line);
			return true;
		}

		const on = Object.entries(townNpcTiles).find(
			([, pos]) => pos.x === tx && pos.y === ty,
		);
		if (!on) {
			addLog("Nothing to interact with.");
			return true;
		}

		const key = on[0];
		if (townNpcNames[key]) {
			const firstTalkToday = !npcTalkedToday[key];
			if (firstTalkToday) {
				incrementStatistics?.(PLAYER_STAT_KEYS.townNpcUniqueTalksTotal, 1);
				incrementStatistics?.(makeTownNpcUniqueTalkKey(key), 1);
			}
			const npcTalkStatKey = makeTownNpcUniqueTalkKey(key);
			const existingUniqueTalkCount = getStatisticValue?.(npcTalkStatKey) ?? 0;
			const uniqueTalkCount = existingUniqueTalkCount + (firstTalkToday ? 1 : 0);
			const previousHearts =
				countFriendshipHeartsForUniqueTalks(existingUniqueTalkCount);
			const fullHearts = countFriendshipHeartsForUniqueTalks(uniqueTalkCount);
			const friendshipLevel = Math.max(
				0,
				Math.min(5, fullHearts),
			) as FriendshipLevel;
			const assignedInterest =
				townNpcInterests[key] ?? possibleNPCInterests[0] ?? "finger_painting";
			const dialogPool = getDialogPoolForLevel(assignedInterest, friendshipLevel);
			const line =
				dialogPool[randomInt(0, dialogPool.length - 1)] ??
				generatedNPCDialog.allLevelZero[0] ??
				"Hi.";
			const leveledUpFriendship = fullHearts > previousHearts;
			const npcInterestTitle =
				friendshipLevel <= 0
					? "?????"
					: (NPCInterestTitles[assignedInterest]?.[friendshipLevel] ?? "?????");
			const openNpcDialog = () => {
				emoteTownTarget(tx, ty, true);
				speakNpcLine(line);
				toastTownSpeech(tx, ty, line);
				const npcPortraitGlyph = townNpcGlyphs[key] ?? GLYPH.person;
				openMenu(
					`[npcPortrait:${npcPortraitGlyph}]\n${townNpcNames[key]} ${heartsText}\n${npcInterestTitle}`,
					[line],
					[{ label: "Bye", onSelect: closeMenu }],
				);
			};
			const emptyHearts = 5 - fullHearts;
			const heartsText = `${"\u2665".repeat(fullHearts)}${"\u2661".repeat(emptyHearts)}`;
			setNpcTalkedToday((prev) => ({ ...prev, [key]: true }));
			if (leveledUpFriendship) {
				lockInputForMs?.(2000);
				playFriendship?.();
				tileFx.actor(`town-npc-${key}`).toast("Friendship Increased!", 2000);
				window.setTimeout(() => {
					openNpcDialog();
				}, 2000);
				return true;
			}
			openNpcDialog();
			return true;
		}
	}

	return false;
};
