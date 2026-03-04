import { allWardrobeLooks, cafeMenuItems } from "../config/gameplay";
import {
	animalDefs,
	cropDefs,
	highValueChestAnimalTypes,
	standardCropIds,
} from "../content/catalog";
import { progressAlgorithmStones } from "../progression/progressStonesAlgorithmic";
import { progressTargetStones } from "../progression/progressStonesTarget";
import { getRandomCropId, toolNames, TOOL_MAX_LEVEL } from "./tools";
import { randomRoll } from "../shared/random";
import type {
	AnimalType,
	ItemId,
	ProgressAlgorithmId,
	ProgressTargetId,
	ToolId,
	ToolLevels,
} from "../shared/types";

type RewardContext = {
	randomInt: (min: number, max: number) => number;
	applyMoneyDelta: (delta: number) => void;
	updateInventory: (item: ItemId, amount: number) => void;
	setStamina: (updater: (value: number) => number) => void;
	staminaMax: number;
};

export const grantBonusChestRewardSet = (
	ctx: RewardContext,
	types: Array<"food" | "money" | "seeds" | "iron">,
	foodMode: "all" | "coffeeOnly" = "all",
): string => {
	const lines: string[] = [];
	if (types.includes("food")) {
		const coffee = cafeMenuItems.find((item) => item.name === "Coffee");
		const food =
			foodMode === "coffeeOnly" && coffee
				? coffee
				: cafeMenuItems[ctx.randomInt(0, cafeMenuItems.length - 1)]!;
		ctx.setStamina((s) => Math.min(ctx.staminaMax, s + food.stamina));
		lines.push(`Found ${food.name} (+${food.stamina} stamina).`);
	}
	if (types.includes("money")) {
		const amount = ctx.randomInt(10, 50);
		ctx.applyMoneyDelta(amount);
		lines.push(`Found $${amount}.`);
	}
	if (types.includes("seeds")) {
		const pick = getRandomCropId(standardCropIds, ctx.randomInt);
		const amount = ctx.randomInt(1, 5);
		ctx.updateInventory(cropDefs[pick].seedItem, amount);
		lines.push(`Found ${cropDefs[pick].name} Seed x${amount}.`);
	}
	if (types.includes("iron")) {
		ctx.updateInventory("iron", 1);
		lines.push("Found Iron +1.");
	}
	return lines.join(" ");
};

export const openHighValueForestChestReward = (ctx: {
	randomInt: (min: number, max: number) => number;
	applyMoneyDelta: (delta: number) => void;
	updateInventory: (item: ItemId, amount: number) => void;
	setStamina: (updater: (value: number) => number) => void;
	staminaMax: number;
	animalsCount: number;
	barnAnimalCap: number;
	canSpawnAnimal: boolean;
	ownedWardrobeLooks: string[];
	setOwnedWardrobeLooks: (updater: (prev: string[]) => string[]) => void;
	tools: ToolLevels;
	setTools: (updater: (prev: ToolLevels) => ToolLevels) => void;
	spawnAnimalInBarn: (type: AnimalType) => boolean;
	openRewardPopup: (line: string) => void;
}): void => {
	const roll = randomRoll() * 100;
	const canGrantAnimalReward =
		ctx.animalsCount < ctx.barnAnimalCap && ctx.canSpawnAnimal;
	let rewardLine = "";
	if (roll < 40) {
		const foundMoney = ctx.randomInt(50, 200);
		ctx.applyMoneyDelta(foundMoney);
		rewardLine = `You found $${foundMoney} in the chest.`;
		if (randomRoll() < 0.2) {
			ctx.updateInventory("iron", 1);
			rewardLine += " Also found Iron +1.";
		}
	} else if (roll < 60) {
		const pick = getRandomCropId(standardCropIds, ctx.randomInt);
		const amount = ctx.randomInt(5, 15);
		ctx.updateInventory(cropDefs[pick].seedItem, amount);
		rewardLine = `You found ${cropDefs[pick].name} Seed x${amount}.`;
		if (randomRoll() < 0.2) {
			ctx.updateInventory("iron", 1);
			rewardLine += " Also found Iron +1.";
		}
	} else if (roll < 70) {
		const foundMoney = ctx.randomInt(200, 500);
		const pick = getRandomCropId(standardCropIds, ctx.randomInt);
		const amount = ctx.randomInt(5, 15);
		ctx.applyMoneyDelta(foundMoney);
		ctx.updateInventory(cropDefs[pick].seedItem, amount);
		rewardLine = `Lucky chest! $${foundMoney} and ${cropDefs[pick].name} Seed x${amount}.`;
		if (randomRoll() < 0.35) {
			ctx.updateInventory("iron", 1);
			rewardLine += " Also found Iron +1.";
		}
	} else if (roll < 90) {
		const lockedLooks = allWardrobeLooks.filter(
			(look) => !ctx.ownedWardrobeLooks.includes(look),
		);
		if (lockedLooks.length > 0) {
			const look = lockedLooks[ctx.randomInt(0, lockedLooks.length - 1)]!;
			ctx.setOwnedWardrobeLooks((prev) => [...prev, look]);
			rewardLine = `You unlocked a new outfit: ${look}.`;
		} else {
			const fallbackMoney = ctx.randomInt(500, 1500);
			ctx.applyMoneyDelta(fallbackMoney);
			rewardLine = `You already own all the outfits! So instead, you found $${fallbackMoney} instead.`;
		}
	} else if (roll < 97 && canGrantAnimalReward) {
		const types: AnimalType[] = highValueChestAnimalTypes;
		const type = types[ctx.randomInt(0, types.length - 1)]!;
		if (ctx.spawnAnimalInBarn(type)) {
			rewardLine = `The chest granted you a ${animalDefs[type].name}!`;
		} else {
			ctx.applyMoneyDelta(500);
			rewardLine = "The chest shifted and gave you $500 instead.";
		}
	} else {
		const upgradable = (Object.keys(ctx.tools) as ToolId[]).filter(
			(toolId) => ctx.tools[toolId] < TOOL_MAX_LEVEL,
		);
		if (upgradable.length > 0) {
			const toolId = upgradable[ctx.randomInt(0, upgradable.length - 1)]!;
			ctx.setTools((prev) => ({
				...prev,
				[toolId]: Math.min(TOOL_MAX_LEVEL, prev[toolId] + 1),
			}));
			rewardLine = `Treasure upgrade! ${toolNames[toolId]} improved.`;
		} else {
			ctx.applyMoneyDelta(500);
			rewardLine = "All tools maxed. The chest gave you $500.";
		}
	}
	ctx.openRewardPopup(rewardLine);
};

export const openCaveBonusChestReward = (ctx: {
	updateInventory: (item: ItemId, amount: number) => void;
	openRewardPopup: (line: string) => void;
}): void => {
	const roll = randomRoll() * 100;
	let line = "";
	if (roll < 15) {
		ctx.updateInventory("diamond", 1);
		line = "You found Diamond +1.";
	} else if (roll < 35) {
		ctx.updateInventory("emerald", 1);
		line = "You found Emerald +1.";
	} else if (roll < 60) {
		ctx.updateInventory("ruby", 1);
		line = "You found Ruby +1.";
	} else if (roll < 75) {
		ctx.updateInventory("emerald", 1);
		ctx.updateInventory("ruby", 1);
		line = "You found Emerald +1 and Ruby +1.";
	} else if (roll < 90) {
		ctx.updateInventory("emerald", 1);
		ctx.updateInventory("diamond", 1);
		line = "You found Emerald +1 and Diamond +1.";
	} else if (roll < 97) {
		ctx.updateInventory("diamond", 1);
		ctx.updateInventory("emerald", 1);
		ctx.updateInventory("ruby", 1);
		line = "Jackpot! Diamond +1, Emerald +1, and Ruby +1.";
	} else {
		ctx.updateInventory("diamond", 2);
		ctx.updateInventory("emerald", 2);
		ctx.updateInventory("ruby", 2);
		line = "Mega jackpot! Diamond x2, Emerald x2, and Ruby x2.";
	}
	ctx.openRewardPopup(line);
};

export const rollBeachBottleReward = (ctx: {
	randomInt: (min: number, max: number) => number;
	stamina: number;
	staminaMax: number;
	animalsCount: number;
	barnAnimalCap: number;
	canSpawnAnimal: boolean;
	ownedWardrobeLooks: string[];
	applyMoneyDelta: (delta: number) => void;
	updateInventory: (item: ItemId, amount: number) => void;
	setStamina: (updater: (value: number) => number) => void;
	setOwnedWardrobeLooks: (updater: (prev: string[]) => string[]) => void;
	spawnAnimalInBarn: (type: AnimalType) => boolean;
	grantProgressStone?: (
		kind: "target" | "algorithm",
		stoneId: ProgressTargetId | ProgressAlgorithmId,
		label: string,
	) => void;
}): string => {
	const canRewardFood = ctx.stamina < ctx.staminaMax;
	const canGrantAnimalReward =
		ctx.animalsCount < ctx.barnAnimalCap && ctx.canSpawnAnimal;
	const maxRoll = canRewardFood
		? canGrantAnimalReward
			? 100
			: 90
		: canGrantAnimalReward
			? 75
			: 65;
	const roll = randomRoll() * maxRoll;
	const gemRoll = randomRoll() * 100;
	if (gemRoll < 1) {
		ctx.updateInventory("diamond", 1);
		return "Diamond";
	}
	if (gemRoll < 4) {
		ctx.updateInventory("ruby", 1);
		return "Ruby";
	}
	if (gemRoll < 6) {
		ctx.updateInventory("emerald", 1);
		return "Emerald";
	}
	const stoneRoll = randomRoll() * 100;
	if (stoneRoll < 8) {
		const stone =
			progressTargetStones[ctx.randomInt(0, progressTargetStones.length - 1)]!;
		ctx.grantProgressStone?.("target", stone.id, stone.name);
		return `${stone.name} (Target Stone)`;
	}
	if (stoneRoll < 14) {
		const stone =
			progressAlgorithmStones[
				ctx.randomInt(0, progressAlgorithmStones.length - 1)
			]!;
		ctx.grantProgressStone?.("algorithm", stone.id, stone.name);
		return `${stone.name} (Algorithm Stone)`;
	}
	if (roll < 25) {
		const amount = ctx.randomInt(100, 1000);
		ctx.applyMoneyDelta(amount);
		return `$${amount}`;
	}
	if (roll < 50) {
		const iron = ctx.randomInt(1, 3);
		ctx.updateInventory("iron", iron);
		return `Iron x${iron}`;
	}
	if (canRewardFood && roll < 75) {
		const foods = cafeMenuItems.filter((item) => item.name !== "Coffee");
		const food = foods[ctx.randomInt(0, foods.length - 1)]!;
		ctx.setStamina((s) => Math.min(ctx.staminaMax, s + food.stamina));
		return food.name;
	}
	if (roll < (canRewardFood ? 90 : 65)) {
		const lockedLooks = allWardrobeLooks.filter(
			(look) => !ctx.ownedWardrobeLooks.includes(look),
		);
		if (lockedLooks.length > 0) {
			const look = lockedLooks[ctx.randomInt(0, lockedLooks.length - 1)]!;
			ctx.setOwnedWardrobeLooks((prev) => [...prev, look]);
			return `Outfit ${look}`;
		}
		ctx.applyMoneyDelta(2000);
		return "$2000";
	}

	const types: AnimalType[] = ["cow", "sheep", "chicken"];
	const type = types[ctx.randomInt(0, types.length - 1)]!;
	if (ctx.spawnAnimalInBarn(type)) {
		return animalDefs[type].name;
	}
	ctx.applyMoneyDelta(2000);
	return "$2000";
};
