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
import type {
	Animal,
	Inventory,
	ItemId,
	MapId,
	ModalOption,
	PetEmoji,
	Point,
	SketchyStockEntry,
	ToolLevels,
	TraderTradeEntry,
	VendorKey,
} from "../shared/types";

export type InteractionsContext = {
	playerMap: MapId;
	tx: number;
	ty: number;
	targetBaseTile?: string;
	farmTargetKey: string;
	farmEggDrops: Record<string, boolean>;
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
	setNpcTalkedToday: (
		updater: (prev: Record<string, boolean>) => Record<string, boolean>,
	) => void;
	interactVendor: (key: VendorKey) => void;
	interactBuilderVendor: () => void;
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
};

export const handleLateInteractionBlocks = (ctx: InteractionsContext): boolean => {
	const {
		playerMap,
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
	} = ctx;

	if (playerMap === "farm") {
		if (farmEggDrops[farmTargetKey]) {
			setFarmEggDrops((prev) => {
				const next = { ...prev };
				delete next[farmTargetKey];
				return next;
			});
			playPluck();
			updateInventory("egg", 1);
			addLog("Picked up an egg.");
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
				const toolLevel =
					isCowLikeAnimal(animal.type) ? tools.milkingGloves : tools.shears;
				const produced = rollLivestockYield(toolLevel);
				updateInventory(product, produced);
				setAnimals((prev) =>
					prev.map((a) =>
						a.id === animal.id ? { ...a, hasProductReady: false } : a,
					),
				);
				playPluck();
				if (Math.random() < 0.25) {
					const lines = isCowLikeAnimal(animal.type)
						? cowHarvestTtsLines
						: sheepHarvestTtsLines;
					const line = lines[randomInt(0, lines.length - 1)]!;
					speakNpcLine(line);
				}
				addLog(
					`${isCowLikeAnimal(animal.type) ? "Milked" : "Sheared"} ${animalDefs[animal.type].name}: ${itemNames[product]} x${produced}.`,
				);
				return true;
			}
			if (animal.fedToday) {
				const line = generateOverfedAnimalLine(animalDefs[animal.type].name);
				speakNpcLine(line);
				addLog(line);
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
			updateInventory("feed", -1);
			playMunch();
			addLog(`${animalDefs[animal.type].name} was fed.`);
			return true;
		}
	}

	if (
		playerMap === "tool_shop" &&
		((targetBaseTile === "x" && tx >= 8) || targetBaseTile === "b")
	) {
		interactBuilderVendor();
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
				speakNpcLine(petVendorSoldLine);
				addLog(petVendorSoldLine);
				return true;
			}
			const intro = "Looking to adopt an animal? Pick one!";
			speakNpcLine(intro);
			openMenu("Pet Adoption", [intro], [
				...petOptions.map((pet) => ({
					label: `${pet} $500`,
					info: ["A loyal buddy for your farm."],
					onSelect: () => {
						if (!canAfford(500)) {
							playBad();
							addLog("Not enough money to adopt that pet.");
							closeMenu();
							return;
						}
						applyMoneyDelta(-500);
						playChaChing();
						setPendingPet(pet);
						closeMenu();
						speakNpcLine(petVendorSoldLine);
						addLog(petVendorSoldLine);
					},
				})),
				{ label: "Back", onSelect: closeMenu },
			]);
			return true;
		}
		if (doctorVendorActive && tx === DOCTOR_POS.x && ty === DOCTOR_POS.y) {
			if (doctorUsedToday) {
				speakNpcLine(doctorFinishedTodayLine);
				addLog(doctorFinishedTodayLine);
				return true;
			}
			const intro = doctorIntroLines[randomInt(0, doctorIntroLines.length - 1)]!;
			speakNpcLine(intro);
			openMenu("Doctor", [intro, "Cost: 1 Diamond, 1 Emerald, 1 Ruby, and $1000."], [
				{
					label: "Yes",
					info: ["A custom treatment that increases max stamina by 20."],
					onSelect: () => {
						if (!canAfford(1000)) {
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
							playBad();
							addLog("You need 1 Diamond, 1 Emerald, and 1 Ruby.");
							closeMenu();
							return;
						}
						applyMoneyDelta(-1000);
						updateInventory("diamond", -1);
						updateInventory("emerald", -1);
						updateInventory("ruby", -1);
						playChaChing();
						startDoctorMedicine();
					},
				},
				{ label: "No", onSelect: closeMenu },
			]);
			return true;
		}
		if (traderActive && tx === TRADER_BOX_POS.x && ty === TRADER_BOX_POS.y) {
			const line = traderBoxLines[randomInt(0, traderBoxLines.length - 1)]!;
			speakNpcLine(line);
			addLog(line);
			return true;
		}
		if (traderActive && tx === TRADER_HELI_POS.x && ty === TRADER_HELI_POS.y) {
			const line = traderHeliLines[randomInt(0, traderHeliLines.length - 1)]!;
			speakNpcLine(line);
			addLog(line);
			return true;
		}
		if (traderActive && tx === TRADER_POS.x && ty === TRADER_POS.y) {
			if (traderTrades.length <= 0) {
				const line = traderSoldOutLines[randomInt(0, traderSoldOutLines.length - 1)]!;
				speakNpcLine(line);
				addLog(line);
				return true;
			}
			const intro = traderIntroLines[randomInt(0, traderIntroLines.length - 1)]!;
			speakNpcLine(intro);
			openMenu("Trader", [intro], [
				...traderTrades.map((trade) => {
					const maxCanTrade = Math.min(trade.remaining, inventory[trade.wantItem]);
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
									const line =
										traderAfterSaleLines[randomInt(0, traderAfterSaleLines.length - 1)]!;
									speakNpcLine(line);
									addLog(line);
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
			]);
			return true;
		}
		if (
			sketchyMerchantActive &&
			sketchyMerchantStock.length > 0 &&
			tx === SKETCHY_CRATE_POS.x &&
			ty === SKETCHY_CRATE_POS.y
		) {
			const line = dontTouchSketchy[randomInt(0, dontTouchSketchy.length - 1)]!;
			speakNpcLine(line);
			return true;
		}
		if (
			sketchyMerchantActive &&
			tx === SKETCHY_MERCHANT_POS.x &&
			ty === SKETCHY_MERCHANT_POS.y
		) {
			if (sketchyMerchantStock.length <= 0) {
				const soldOutLine = "I aint got nothin more today";
				speakNpcLine(soldOutLine);
				addLog(soldOutLine);
				return true;
			}
			const intro = sketchyMerchantIntro[randomInt(0, sketchyMerchantIntro.length - 1)]!;
			speakNpcLine(intro);
			openMenu("Sketchy Merchant", [intro], [
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
									const salesLine =
										sketchyVendorSales[randomInt(0, sketchyVendorSales.length - 1)]!;
									speakNpcLine(salesLine);
									addLog(salesLine);
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
			]);
			return true;
		}

		const boat = Object.entries(boatTiles).find(
			([, pos]) => pos.x === tx && pos.y === ty,
		);
		if (boat) {
			const line = boatDialogArray[randomInt(0, boatDialogArray.length - 1)]!;
			speakNpcLine(line);
			addLog(line);
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
				npcDailyAssignments[key] ??
				generateDailyAssignmentsForNpcs([key])[key];
			const firstTalkToday = !npcTalkedToday[key];
			const tipText = townTips[randomInt(0, townTips.length - 1)]!;
			const isTip = !firstTalkToday && Math.random() < 0.5;
			const line = firstTalkToday
				? generateNpcGreetingLine(assignment)
				: isTip
					? `TIP: ${tipText}`
					: generateNpcDialogLine(assignment);
			setNpcTalkedToday((prev) => ({ ...prev, [key]: true }));
			speakNpcLine(isTip ? `Heres a tip: ${tipText}` : line);
			openMenu(townNpcNames[key]!, [line], [{ label: "Bye", onSelect: closeMenu }]);
			return true;
		}
	}

	return false;
};
