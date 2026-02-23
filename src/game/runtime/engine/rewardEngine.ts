import type { Dispatch, SetStateAction } from "react";
import type {
	AnimalType,
	ItemId,
	ModalOption,
	ToolLevels,
} from "../../shared/types";
import {
	grantBonusChestRewardSet as grantBonusChestRewardSetRule,
	openHighValueForestChestReward as openHighValueForestChestRewardRule,
} from "../../systems/rewards";

export const openRewardPopup = (args: {
	line: string;
	playGotReward: () => void;
	addLog: (line: string) => void;
	openMenu: (title: string, body: string[], options: ModalOption[]) => void;
	closeMenu: () => void;
}): void => {
	const { line, playGotReward, addLog, openMenu, closeMenu } = args;
	playGotReward();
	addLog(line);
	openMenu("Treasure Chest", [line], [{ label: "Nice!", onSelect: closeMenu }]);
};

export const grantBonusChestRewardSet = (
	args: {
		randomInt: (min: number, max: number) => number;
		applyMoneyDelta: (delta: number) => void;
		updateInventory: (item: ItemId, amount: number) => void;
		setStamina: Dispatch<SetStateAction<number>>;
		staminaMax: number;
	},
	types: Array<"food" | "money" | "seeds" | "iron">,
): string => {
	return grantBonusChestRewardSetRule(args, types);
};

export const openHighValueForestChestReward = (args: {
	randomInt: (min: number, max: number) => number;
	applyMoneyDelta: (delta: number) => void;
	updateInventory: (item: ItemId, amount: number) => void;
	setStamina: Dispatch<SetStateAction<number>>;
	staminaMax: number;
	animalsCount: number;
	barnAnimalCap: number;
	canSpawnAnimal: boolean;
	ownedWardrobeLooks: string[];
	setOwnedWardrobeLooks: Dispatch<SetStateAction<string[]>>;
	tools: ToolLevels;
	setTools: Dispatch<SetStateAction<ToolLevels>>;
	spawnAnimalInBarn: (type: AnimalType) => boolean;
	openRewardPopup: (line: string) => void;
}): void => {
	openHighValueForestChestRewardRule(args);
};
