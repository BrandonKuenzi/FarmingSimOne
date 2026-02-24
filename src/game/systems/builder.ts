import { BARN_MAX_TIER, getBarnAnimalCap, getBarnInteriorSizeByTier, getBarnUpgradeCost, getFarmBarnOuterRect, isBarnExternal } from "../world/layout";
import { getToolTierName } from "./tools";
import type { BarnTier, Inventory, ItemId } from "../shared/types";
import { GLYPH } from "../config/glyphs";

export const interactBuilderVendorMenu = (ctx: {
	barnTier: BarnTier;
	pendingBarnUpgrade: boolean;
	inventory: Inventory;
	canAfford: (value: number) => boolean;
	playBad: () => void;
	addLog: (line: string) => void;
	speakNpcLine: (line: string) => void;
	closeMenu: () => void;
	openMenu: (title: string, body: string[], options: Array<{ label: string; onSelect: () => void; info?: string[] }>) => void;
	applyMoneyDelta: (delta: number) => void;
	updateInventory: (item: ItemId, amount: number) => void;
	setPendingBarnUpgrade: (value: boolean) => void;
}): void => {
	const {
		barnTier,
		pendingBarnUpgrade,
		inventory,
		canAfford,
		playBad,
		addLog,
		speakNpcLine,
		closeMenu,
		openMenu,
		applyMoneyDelta,
		updateInventory,
		setPendingBarnUpgrade,
	} = ctx;

	if (barnTier >= BARN_MAX_TIER) {
		const line = "I hope you enjoy your legendary barn";
		speakNpcLine(line);
		addLog(line);
		return;
	}
	if (pendingBarnUpgrade) {
		const line = "I will build your barn tonight. Check on it tomorrow morning.";
		speakNpcLine(line);
		addLog(line);
		return;
	}
	const nextTier = (barnTier + 1) as BarnTier;
	const upgradeCost = getBarnUpgradeCost(nextTier);
	const costParts = [`$${upgradeCost.money}`];
	if (upgradeCost.iron > 0) costParts.push(`${GLYPH.rock}x${upgradeCost.iron}`);
	if ((upgradeCost.gems.ruby ?? 0) > 0) costParts.push(`${GLYPH.redCircle}x${upgradeCost.gems.ruby}`);
	if ((upgradeCost.gems.emerald ?? 0) > 0) costParts.push(`${GLYPH.greenCircle}x${upgradeCost.gems.emerald}`);
	if ((upgradeCost.gems.diamond ?? 0) > 0) costParts.push(`${GLYPH.diamond}x${upgradeCost.gems.diamond}`);
	const nextSize = getBarnInteriorSizeByTier(nextTier);
	const nextCapacity = getBarnAnimalCap(nextTier);
	const currentRect = getFarmBarnOuterRect(barnTier);
	const nextRect = getFarmBarnOuterRect(nextTier);
	const expansionRightTiles =
		!isBarnExternal(barnTier) && !isBarnExternal(nextTier)
			? Math.max(0, nextRect.x + nextRect.w - (currentRect.x + currentRect.w))
			: 0;
	openMenu(
		"Constrution",
		[
			`Upgrade barn from ${getToolTierName(barnTier)} to ${getToolTierName(nextTier)} for ${costParts.join(" + ")}?`,
		],
		[
			{
				label: "Yes",
				info: [
					`Interior Space: ${nextSize.width}x${nextSize.height}`,
					`Animal capacity: ${nextCapacity}`,
				],
				onSelect: () => {
					if (!canAfford(upgradeCost.money)) {
						playBad();
						addLog("Not enough money for that barn upgrade.");
						closeMenu();
						return;
					}
					if (inventory.iron < upgradeCost.iron) {
						playBad();
						addLog("Not enough iron for that barn upgrade.");
						closeMenu();
						return;
					}
					if ((upgradeCost.gems.ruby ?? 0) > 0 && inventory.ruby < (upgradeCost.gems.ruby ?? 0)) {
						playBad();
						addLog("Not enough Ruby for that barn upgrade.");
						closeMenu();
						return;
					}
					if (
						(upgradeCost.gems.emerald ?? 0) > 0 &&
						inventory.emerald < (upgradeCost.gems.emerald ?? 0)
					) {
						playBad();
						addLog("Not enough Emerald for that barn upgrade.");
						closeMenu();
						return;
					}
					if (
						(upgradeCost.gems.diamond ?? 0) > 0 &&
						inventory.diamond < (upgradeCost.gems.diamond ?? 0)
					) {
						playBad();
						addLog("Not enough Diamond for that barn upgrade.");
						closeMenu();
						return;
					}
					const finalizeBarnUpgradePurchase = () => {
						applyMoneyDelta(-upgradeCost.money);
						if (upgradeCost.iron > 0) updateInventory("iron", -upgradeCost.iron);
						if ((upgradeCost.gems.ruby ?? 0) > 0)
							updateInventory("ruby", -(upgradeCost.gems.ruby ?? 0));
						if ((upgradeCost.gems.emerald ?? 0) > 0)
							updateInventory("emerald", -(upgradeCost.gems.emerald ?? 0));
						if ((upgradeCost.gems.diamond ?? 0) > 0)
							updateInventory("diamond", -(upgradeCost.gems.diamond ?? 0));
						setPendingBarnUpgrade(true);
						closeMenu();
						const line =
							"I will build your barn tonight. Check on it tomorrow morning.";
						speakNpcLine(line);
						addLog(line);
					};
					if (isBarnExternal(nextTier)) {
						finalizeBarnUpgradePurchase();
						return;
					}
					openMenu(
						"Constrution",
						[
							`Just so you know we will be expanding the barn to the right ${expansionRightTiles} tiles. Any crops planted there will be destroyed overnight. You want to continue`,
						],
						[
							{
								label: "Yes",
								onSelect: finalizeBarnUpgradePurchase,
							},
							{ label: "No", onSelect: closeMenu },
						],
					);
				},
			},
			{ label: "No", onSelect: closeMenu },
		],
	);
};
