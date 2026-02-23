import { randomRoll } from "../shared/random";
import type { CropId, ToolId, ToolLevels } from "../shared/types";

export const TOOL_MAX_LEVEL = 5;

export const toolNames: Record<ToolId, string> = {
	hoe: "Hoe",
	wateringCan: "Watering Can",
	milkingGloves: "Milking Gloves",
	shears: "Shears",
	fishingRod: "Fishing Rod",
	smashAxe: "Smash Axe",
};

export const toolTierNames: Record<number, string> = {
	1: "Cheap",
	2: "Standard",
	3: "Quality",
	4: "Amazing",
	5: "Legendary",
};

export const getToolTierName = (level: number) =>
	level <= 0 ? "Unowned" : (toolTierNames[level] ?? `Tier ${level}`);

const toolUpgradePriceByLevel: Record<number, number> = {
	2: 500,
	3: 1000,
	4: 2000,
	5: 3000,
};

export const getToolUpgradePrice = (toolId: ToolId, nextLevel: number) => {
	if ((toolId === "smashAxe" || toolId === "fishingRod") && nextLevel === 1) {
		return 100;
	}
	return toolUpgradePriceByLevel[nextLevel] ?? 0;
};

const toolUpgradeIronByLevel: Record<number, number> = {
	3: 5,
	4: 20,
	5: 50,
};

export const getToolUpgradeIronCost = (toolId: ToolId, nextLevel: number) => {
	if (toolId === "milkingGloves") return 0;
	return toolUpgradeIronByLevel[nextLevel] ?? 0;
};

export const getToolUpgradeGemCost = (
	toolId: ToolId,
	nextLevel: number,
): { item: "ruby" | "emerald"; qty: number } | null => {
	if (nextLevel !== 5) return null;
	if (toolId === "hoe" || toolId === "wateringCan") {
		return { item: "ruby", qty: 1 };
	}
	return { item: "emerald", qty: 1 };
};

export const initialToolLevels: ToolLevels = {
	hoe: 1,
	wateringCan: 1,
	milkingGloves: 1,
	shears: 1,
	fishingRod: 0,
	smashAxe: 0,
};

export const getWaterCapacity = (tools: ToolLevels) => tools.wateringCan * 10;

export const getFishingRodMaxWaitSeconds = (tools: ToolLevels) =>
	Math.max(2, 12 - (tools.fishingRod - 1));

export const getHoeShape = (level: number): { width: 1 | 3; depth: number } => {
	if (level <= 1) return { width: 1, depth: 1 };
	if (level === 2) return { width: 1, depth: 3 };
	if (level === 3) return { width: 3, depth: 3 };
	if (level === 4) return { width: 3, depth: 6 };
	return { width: 3, depth: 9 };
};

export const getFishingRodUiText = (level: number) => {
	if (level <= 1) return "This rod catches fish slowly.";
	if (level === 2) return "This rod is a little faster catching fish.";
	if (level === 3) return "This rod is fast.";
	return "This rod is VERY fast.";
};

export const STAMINA_MAX = 100;

export const getToolActionCost = (level: number) => {
	if (level <= 1) return 7;
	if (level === 2) return 5;
	if (level === 3) return 3;
	if (level === 4) return 1;
	return 0;
};

export const getSmashAxeActionCost = (level: number) => {
	if (level <= 0) return 0;
	if (level >= 5) return 0;
	return 1;
};

export const getSmashAxeRockHits = (level: number) => {
	if (level <= 2) return 8;
	if (level === 3) return 6;
	if (level === 4) return 3;
	return 1;
};

export const getSmashAxeWoodSeedChance = (level: number) => {
	if (level <= 1) return 0;
	if (level === 2) return 0.15;
	if (level === 3) return 0.25;
	if (level === 4) return 0.5;
	return 1;
};

export const getSmashAxeIronChance = (level: number) => {
	if (level <= 1) return 0;
	if (level === 2) return 0.2;
	if (level === 3) return 0.35;
	if (level === 4) return 0.7;
	return 1;
};

export const getSmashAxeRockDamage = (level: number) => {
	if (level <= 2) return 3;
	if (level === 3) return 4;
	if (level === 4) return 8;
	return 24;
};

export const rollLivestockYield = (toolLevel: number) => {
	const roll = randomRoll() * 100;
	if (toolLevel >= 5) {
		if (roll < 10) return 5;
		if (roll < 25) return 4;
		if (roll < 50) return 3;
		return 2;
	}
	if (toolLevel === 4) {
		if (roll < 25) return 3;
		if (roll < 75) return 2;
		return 1;
	}
	if (toolLevel === 3) {
		if (roll < 10) return 3;
		if (roll < 50) return 2;
		return 1;
	}
	if (toolLevel === 2) return roll < 30 ? 2 : 1;
	return roll < 10 ? 2 : 1;
};

export const getRandomCropId = (
	standardCropIds: readonly CropId[],
	randomInt: (min: number, max: number) => number,
): CropId => {
	return standardCropIds[randomInt(0, standardCropIds.length - 1)]!;
};

export const getToolLevelDescription = (toolId: ToolId, level: number) => {
	if (toolId === "hoe") {
		const shape = getHoeShape(level);
		return `A level ${level} hoe can till a ${shape.width}x${shape.depth} area.`;
	}
	if (toolId === "wateringCan") {
		const shape = getHoeShape(level);
		return `A level ${level} watering can holds ${level * 10} water and waters a ${shape.width}x${shape.depth} area.`;
	}
	if (toolId === "milkingGloves") {
		if (level <= 1) return "Cheap Milking Gloves: 10% chance for 2 milk.";
		if (level === 2) return "Standard Milking Gloves: 30% chance for 2 milk.";
		if (level === 3) {
			return "Quality Milking Gloves: 40% chance for 2 milk, 10% chance for 3.";
		}
		if (level === 4) {
			return "Amazing Milking Gloves: 50% chance for 2 milk, 25% chance for 3.";
		}
		return "Legendary Milking Gloves: 50% for 2, 25% for 3, 15% for 4, 10% for 5.";
	}
	if (toolId === "shears") {
		if (level <= 1) return "Cheap Shears: 10% chance for 2 wool.";
		if (level === 2) return "Standard Shears: 30% chance for 2 wool.";
		if (level === 3) {
			return "Quality Shears: 40% chance for 2 wool, 10% chance for 3.";
		}
		if (level === 4) {
			return "Amazing Shears: 50% chance for 2 wool, 25% chance for 3.";
		}
		return "Legendary Shears: 50% for 2, 25% for 3, 15% for 4, 10% for 5.";
	}
	if (toolId === "smashAxe") {
		if (level <= 1) {
			return "Level 1 Smash Axe breaks wood, costs 1 stamina, cannot break rocks.";
		}
		if (level === 2) {
			return "Level 2 Smash Axe costs 1 stamina, can break rocks, and has 15% wood seed bonus.";
		}
		if (level === 3) {
			return "Level 3 Smash Axe costs 1 stamina, 25% wood seed bonus, +15% iron chance, 6-hit rocks.";
		}
		if (level === 4) {
			return "Level 4 Smash Axe costs 1 stamina, 50% wood seed bonus, +50% iron chance, 3-hit rocks.";
		}
		return "Level 5 Smash Axe is free to use, 1-hit rocks, and always gives break rewards.";
	}
	return `Level ${level} fishing rod: ${getFishingRodUiText(level)}`;
};
