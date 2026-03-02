import {
	generateDailyAssignmentsForNpcs,
	generateNpcDialogLine,
	generateNpcGreetingLine,
	type NpcDailyAssignment,
} from "../../npcDialogue";
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
	townTips,
	traderAfterSaleLines,
	traderBoxLines,
	traderHeliLines,
	traderIntroLines,
	traderSoldOutLines,
} from "../content/dialog";
import { animalDefs, isCowLikeAnimal, itemNames } from "../content/catalog";
import { GLYPH } from "../config/glyphs";
import {
	DOCTOR_POS,
	PET_VENDOR_POS,
	petOptions,
	SKETCHY_CRATE_POS,
	SKETCHY_MERCHANT_POS,
	townNpcNames,
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
	npcDailyAssignments: Record<string, NpcDailyAssignment>;
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
	} = ctx;

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
						const maxCanTrade = Math.min(
							trade.remaining,
							inventory[trade.wantItem],
						);
						return {
							label: `Trade ${itemNames[trade.wantItem]} -> ${itemNames[trade.giveItem]}`,
							info: [
								`Needs: ${itemNames[trade.wantItem]}`,
								`Gives: ${itemNames[trade.giveItem]}`,
								`You have: ${inventory[trade.wantItem]}`,
								`Trader stock: ${trade.remaining}`,
								"Rate: 1 for 1",
							],
							onSelect: () => {
								openQuantityPrompt({
									mode: "buy",
									itemLabel: `${itemNames[trade.wantItem]} -> ${itemNames[trade.giveItem]}`,
									max: maxCanTrade,
									unitPrice: 0,
									onConfirm: (quantity) => {
										updateInventory(trade.wantItem, -quantity);
										updateInventory(trade.giveItem, quantity);
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
						const dropLine = `The shady vendor dropped a ${itemNames[dropped.item]}.`;
						tileFx.actor("player").toast(dropLine, 4000);
						window.setTimeout(() => {
							updateInventory(dropped.item, 1);
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
						const maxCanBuy = Math.min(
							entry.qty,
							Math.floor(money / Math.max(1, entry.price)),
						);
						return {
							label: `${itemNames[entry.item]} $${entry.price}`,
							info: [
								`Stock: ${entry.qty}`,
								`You can buy now: ${maxCanBuy}`,
								`Price: $${entry.price} each`,
								`Item: ${itemNames[entry.item]}`,
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
									itemLabel: itemNames[entry.item],
									max: maxCanBuy,
									unitPrice: entry.price,
									onConfirm: (quantity) => {
										applyMoneyDelta(-entry.price * quantity);
										updateInventory(entry.item, quantity);
										setSketchyMerchantStock((prev) =>
											prev
												.map((stockEntry) =>
													stockEntry.item === entry.item
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
			const assignment =
				npcDailyAssignments[key] ?? generateDailyAssignmentsForNpcs([key])[key];
			const firstTalkToday = !npcTalkedToday[key];
			const tipText = townTips[randomInt(0, townTips.length - 1)]!;
			const isTip = !firstTalkToday && randomRoll() < 0.5;
			const line = firstTalkToday
				? generateNpcGreetingLine(assignment)
				: isTip
					? `TIP: ${tipText}`
					: generateNpcDialogLine(assignment);
			setNpcTalkedToday((prev) => ({ ...prev, [key]: true }));
			emoteTownTarget(tx, ty, !isTip);
			const spokenLine = isTip ? `Heres a tip: ${tipText}` : line;
			speakNpcLine(spokenLine);
			toastTownSpeech(tx, ty, spokenLine);
			openMenu(
				townNpcNames[key]!,
				[line],
				[{ label: "Bye", onSelect: closeMenu }],
			);
			return true;
		}
	}

	return false;
};
