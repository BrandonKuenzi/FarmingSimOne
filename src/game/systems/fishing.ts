import fishData from "../../data/fish.json";
import { randomInt } from "../shared/random";
import type {
	FishDefinition,
	FishingCategory,
	FishingFishMoveId,
	FishingMovePoolEntry,
	FishingPlayerMoveId,
	FishingProgressState,
	FishingState,
	MapId,
} from "../shared/types";

type TimerRef = { current: number | null };

const FISHING_FALLBACK_MOVE_POOL: FishingMovePoolEntry[] = [
	{ moveId: "bite", weight: 80 },
	{ moveId: "go_along", weight: 20 },
];

export const FISHING_PLAYER_MOVE_ORDER: FishingPlayerMoveId[] = [
	"reel_in",
	"pull_rod",
	"release_line",
	"use_net",
	"cut_line",
];

export const FISHING_PLAYER_MOVES: Record<
	FishingPlayerMoveId,
	{ label: string; description: string }
> = {
	reel_in: {
		label: "Reel In",
		description: "Standard attack.",
	},
	pull_rod: {
		label: "Pull Rod",
		description: "Small damage and lower fish defense by 1.",
	},
	release_line: {
		label: "Release Line",
		description: "Lower fish attack by 1, but fish heals by 1.",
	},
	use_net: {
		label: "Use Net",
		description: "Try to catch based on level and fish HP.",
	},
	cut_line: {
		label: "Cut Line",
		description: "Leave encounter immediately.",
	},
};

export const FISHING_PLAYER_MOVE_IMPACT_SOUNDS: Record<
	FishingPlayerMoveId,
	"hoe" | "water"
> = {
	reel_in: "hoe",
	pull_rod: "hoe",
	release_line: "hoe",
	use_net: "hoe",
	cut_line: "hoe",
};

export const FISHING_FISH_MOVE_LABELS: Record<FishingFishMoveId, string> = {
	bite: "Bite",
	thrash: "Thrash",
	dive_deep: "Dive Deep",
	wrap_line: "Wrap Line",
	go_along: "Go Along",
	undertow_rip: "Undertow Rip",
	thalassophobia: "Thalassophobia",
	cavernous_hunger: "Cavernous Hunger",
	pressure_of_the_deep: "Pressure of the Deep",
	clear_water_focus: "Clear Water Focus",
};

export const FISHING_FISH_MOVE_IMPACT_SOUNDS: Record<
	FishingFishMoveId,
	"hoe" | "water"
> = {
	bite: "water",
	thrash: "water",
	dive_deep: "water",
	wrap_line: "water",
	go_along: "water",
	undertow_rip: "water",
	thalassophobia: "water",
	cavernous_hunger: "water",
	pressure_of_the_deep: "water",
	clear_water_focus: "water",
};

export const FISHING_LEVEL_UP_COMPLIMENTS: string[] = [
	"You will be able to catch bigger and stronger fish now!",
	"You are really learning your stuff!",
	"Watch out fish, you are on a roll!",
	"Your fishing instincts are getting sharper!",
	"That was a pro-level catch!",
	"You are reading the water like a master!",
	"Your line control is improving fast!",
	"Every cast looks better than the last!",
	"You are becoming a true angler!",
	"Your timing is getting scary good!",
	"The fish do not stand a chance now!",
	"You are building serious fishing skill!",
	"Your confidence on the water is growing!",
	"Nice work, that level is well earned!",
	"You are leveling up like a champion!",
	"The next fish better be ready!",
	"You are getting stronger every encounter!",
	"Your technique keeps getting cleaner!",
	"That is some elite reel-in energy!",
	"The waters are starting to fear you!",
];
const calculateBuffAmount = (
	attackerAttack: number,
	attackerDefense: number,
	defenderAttack: number,
	defenderDefense: number,
): number => {
	const attackerTotal = attackerAttack + attackerDefense;
	const defenderTotal = defenderAttack + defenderDefense;

	let influenceTotal = attackerTotal - defenderTotal;

	if (influenceTotal < 1) return 1;
	else return influenceTotal;
};
const FISHING_LEVEL_UP_ATTACK_BUFF_AMOUNTS = [1, 1, 1, 2, 2, 3] as const;
const FISHING_LEVEL_UP_DEFENSE_BUFF_AMOUNTS = [1, 1, 1, 2, 2, 3] as const;

export const rollFishingLevelUpAttackBuffAmount = (
	randomInt: (min: number, max: number) => number,
): number =>
	FISHING_LEVEL_UP_ATTACK_BUFF_AMOUNTS[
		randomInt(0, FISHING_LEVEL_UP_ATTACK_BUFF_AMOUNTS.length - 1)
	]!;

export const rollFishingLevelUpDefenseBuffAmount = (
	randomInt: (min: number, max: number) => number,
): number =>
	FISHING_LEVEL_UP_DEFENSE_BUFF_AMOUNTS[
		randomInt(0, FISHING_LEVEL_UP_DEFENSE_BUFF_AMOUNTS.length - 1)
	]!;

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

const weightedPick = <T>(
	entries: Array<{ value: T; weight: number }>,
	randomRoll: () => number,
): T => {
	const safeEntries = entries.filter((entry) => entry.weight > 0);
	if (safeEntries.length === 0) {
		return entries[0]!.value;
	}
	const totalWeight = safeEntries.reduce((sum, entry) => sum + entry.weight, 0);
	let target = randomRoll() * totalWeight;
	for (const entry of safeEntries) {
		target -= entry.weight;
		if (target <= 0) return entry.value;
	}
	return safeEntries[safeEntries.length - 1]!.value;
};

const allFish = fishData as FishDefinition[];

export const getFishingCategoryForMap = (map: MapId): FishingCategory => {
	if (map === "town") return "saltwater";
	if (map === "cave") return "cavewater";
	return "freshwater";
};

export const pickFishForEncounter = (
	category: FishingCategory,
	randomRoll: () => number,
): FishDefinition => {
	const pool = allFish.filter((fish) => fish.category === category);
	const fallbackPool = allFish.filter((fish) => fish.category === "freshwater");
	const source = pool.length > 0 ? pool : fallbackPool;
	if (source.length === 0) {
		return {
			id: "fallback_fish",
			name: "Fallback Fish",
			glyph: "\u{1F41F}",
			category: "freshwater",
			sellPrice: 5,
			stats: { maxHp: 6, attack: 2, defense: 1 },
			expGranted: 3,
			movePool: FISHING_FALLBACK_MOVE_POOL,
		};
	}
	return weightedPick(
		source.map((fish) => ({
			value: fish,
			weight: fish.spawnWeight ?? 1,
		})),
		randomRoll,
	);
};

export const getFishMovePoolWithFallback = (
	movePool: FishingMovePoolEntry[] | undefined,
): FishingMovePoolEntry[] => {
	if (!movePool || movePool.length === 0) return FISHING_FALLBACK_MOVE_POOL;
	return movePool;
};

export const rollFishMove = (
	movePool: FishingMovePoolEntry[] | undefined,
	randomRoll: () => number,
): FishingFishMoveId => {
	const source = getFishMovePoolWithFallback(movePool);
	return weightedPick(
		source.map((entry) => ({
			value: entry.moveId,
			weight: entry.weight ?? 1,
		})),
		randomRoll,
	);
};

export const getFishingAttackForLevel = (level: number): number =>
	3 + Math.floor((Math.max(1, level) - 1) / 2);

export const getFishingDefenseForLevel = (level: number): number =>
	1 + Math.floor((Math.max(1, level) - 1) / 3);

export const getFishingExpToNextLevel = (level: number): number =>
	Math.max(10, Math.floor(level * 10));

export const applyFishingExpGain = (
	progress: FishingProgressState,
	expGain: number,
): { progress: FishingProgressState; levelsGained: number } => {
	let level = clamp(progress.level, 1, 100);
	let exp = Math.max(0, progress.exp) + Math.max(0, expGain);
	let levelsGained = 0;
	while (level < 100) {
		const needed = getFishingExpToNextLevel(level);
		if (exp < needed) break;
		exp -= needed;
		level += 1;
		levelsGained += 1;
	}
	if (level >= 100) {
		level = 100;
		exp = 0;
	}
	return {
		progress: {
			level,
			exp,
			attackBonus: Math.max(0, progress.attackBonus ?? 0),
			defenseBonus: Math.max(0, progress.defenseBonus ?? 0),
		},
		levelsGained,
	};
};

export const computeDamage = (attack: number, defense: number): number =>
	Math.max(1, attack - defense);

export const resolvePlayerFishingMove = (args: {
	moveId: FishingPlayerMoveId;
	fishing: FishingState;
	randomRoll: () => number;
	fishingRodTierLevel: number;
}): {
	fishing: FishingState;
	message: string;
	caught: boolean;
	cutLine: boolean;
} => {
	const { moveId, fishing, randomRoll, fishingRodTierLevel } = args;
	const rodTierBonus = Math.max(0, fishingRodTierLevel - 1);
	const currentFishHp = Math.max(0, fishing.fishHp);
	const damage = computeDamage(fishing.playerAttack, fishing.fishDefense);
	const reelInDamage = damage + rodTierBonus;
	let debuffAmount = calculateBuffAmount(
		fishing.playerAttack,
		fishing.playerDefense,
		fishing.fishAttack,
		fishing.fishDefense,
	);
	if (debuffAmount > fishing.playerLevel) debuffAmount = fishing.playerLevel;
	if (moveId === "cut_line") {
		return {
			fishing,
			message: "You cut the line.",
			caught: false,
			cutLine: true,
		};
	}

	if (moveId === "use_net") {
		const catchChance = clamp(
			0.05 +
				fishing.playerLevel * 0.01 +
				(fishing.fishMaxHp - currentFishHp) * 0.03,
			0.05,
			0.95,
		);
		const success = randomRoll() < catchChance;
		return {
			fishing,
			message: success ? `The net worked!` : `The fish broke free!`,
			caught: success,
			cutLine: false,
		};
	}

	if (moveId === "pull_rod") {
		const pullDamage = Math.max(1, damage / 2) + rodTierBonus;
		const fishHp = Math.max(0, currentFishHp - pullDamage);
		const totalDebuf =
			fishing.fishDefense > debuffAmount
				? debuffAmount
				: fishing.fishDefense;
		return {
			fishing: {
				...fishing,
				fishHp,
				fishDefense: Math.max(0, fishing.fishDefense - totalDebuf),
			},
			message: `You pull the rod for ${pullDamage} and lower the it's defense by ${totalDebuf}.`,
			caught: fishHp <= 0,
			cutLine: false,
		};
	}

	if (moveId === "release_line") {
		const totalDebuf =
			fishing.fishAttack > debuffAmount
				? debuffAmount
				: fishing.fishAttack;
		return {
			fishing: {
				...fishing,
				fishAttack: Math.max(0, fishing.fishAttack - totalDebuf),
				fishHp: Math.min(fishing.fishMaxHp, currentFishHp + totalDebuf),
			},
			message: `You loosen line; fish attack drop by ${totalDebuf} but it recovers ${totalDebuf} HP. `,
			caught: false,
			cutLine: false,
		};
	}

	// TODO(fishing): hook additional player moves into this resolver.
	const fishHp = Math.max(0, currentFishHp - reelInDamage);
	return {
		fishing: {
			...fishing,
			fishHp,
		},
		message: `You reel in for ${reelInDamage}.`,
		caught: fishHp <= 0,
		cutLine: false,
	};
};

export const resolveFishTurn = (args: {
	fishing: FishingState;
	moveId: FishingFishMoveId;
	playerStamina: number;
	playerStaminaMax: number;
}): { fishing: FishingState; staminaDamage: number; message: string } => {
	const { fishing, moveId, playerStamina, playerStaminaMax } = args;
	const baseDamage = computeDamage(fishing.fishAttack, fishing.playerDefense);
	let debuffAmount = calculateBuffAmount(
		fishing.fishAttack,
		fishing.fishDefense,
		fishing.playerAttack,
		fishing.playerDefense,
	);
	if (moveId === "go_along") {
		return {
			fishing,
			staminaDamage: 0,
			message: `${fishing.fishName} drifts in place.`,
		};
	}

	if (moveId === "wrap_line") {
		const totalBuff =
			debuffAmount > fishing.fishMaxHp / 2
				? fishing.fishMaxHp / 2
				: debuffAmount;

		return {
			fishing: {
				...fishing,
				fishDefense: fishing.fishDefense + totalBuff,
			},
			staminaDamage: 0,
			message: `${fishing.fishName} wraps your line. Defense rose.`,
		};
	}

	if (moveId === "dive_deep") {
		const diveDamage = computeDamage(
			fishing.fishAttack + 1,
			fishing.playerDefense,
		);
		return {
			fishing,
			staminaDamage: diveDamage,
			message: `${fishing.fishName} dives deep for ${diveDamage}.`,
		};
	}

	if (moveId === "thrash") {
		const thrashDamage =
			randomInt(1, 3) === 2 ? fishing.fishMaxHp / 10 : fishing.fishMaxHp / 15;
		return {
			fishing: {
				...fishing,
				fishHp: Math.max(0, fishing.fishHp - thrashDamage),
			},
			staminaDamage: baseDamage,
			message: `${fishing.fishName} thrashes for ${baseDamage} and hurts itself for ${thrashDamage}.`,
		};
	}
	if (moveId === "undertow_rip") {
		const undertowDamage = Math.max(1, Math.floor(playerStaminaMax * 0.15));
		return {
			fishing,
			staminaDamage: undertowDamage,
			message: `${fishing.fishName} used Undertow Rip. It dragged you down causing ${undertowDamage} damage!`,
		};
	}
	if (moveId === "thalassophobia") {
		const fearDamage = Math.max(1, Math.floor(playerStamina * 0.3));
		return {
			fishing,
			staminaDamage: fearDamage,
			message: `${fishing.fishName} used Thalassophobia! You feel overwhelmed and take ${fearDamage} of damage!`,
		};
	}
	if (moveId === "cavernous_hunger") {
		const statToSteal = randomInt(0, 1) === 0 ? "attack" : "defense";
		const statLabel = statToSteal === "attack" ? "Attack" : "Defense";
		const stealRoll = randomInt(1, 3);
		const available =
			statToSteal === "attack" ? fishing.playerAttack : fishing.playerDefense;
		const stealAmount = Math.min(available, stealRoll);
		return {
			fishing: {
				...fishing,
				playerAttack:
					statToSteal === "attack"
						? Math.max(0, fishing.playerAttack - stealAmount)
						: fishing.playerAttack,
				playerDefense:
					statToSteal === "defense"
						? Math.max(0, fishing.playerDefense - stealAmount)
						: fishing.playerDefense,
				fishAttack:
					statToSteal === "attack"
						? fishing.fishAttack + stealAmount
						: fishing.fishAttack,
				fishDefense:
					statToSteal === "defense"
						? fishing.fishDefense + stealAmount
						: fishing.fishDefense,
			},
			staminaDamage: baseDamage,
			message: `The ${fishing.fishName} used Cavernous Hunger causing ${baseDamage} damage and stole ${stealAmount} ${statLabel} from you!`,
		};
	}
	if (moveId === "pressure_of_the_deep") {
		const statToSteal = randomInt(0, 1) === 0 ? "attack" : "defense";
		const statLabel = statToSteal === "attack" ? "Attack" : "Defense";
		const available =
			statToSteal === "attack" ? fishing.playerAttack : fishing.playerDefense;
		const stealAmount = Math.min(available, Math.floor(available * 0.3));
		const selfDamage = Math.max(
			1,
			Math.floor(Math.max(0, fishing.fishHp) * 0.3),
		);
		return {
			fishing: {
				...fishing,
				playerAttack:
					statToSteal === "attack"
						? Math.max(0, fishing.playerAttack - stealAmount)
						: fishing.playerAttack,
				playerDefense:
					statToSteal === "defense"
						? Math.max(0, fishing.playerDefense - stealAmount)
						: fishing.playerDefense,
				fishAttack:
					statToSteal === "attack"
						? fishing.fishAttack + stealAmount
						: fishing.fishAttack,
				fishDefense:
					statToSteal === "defense"
						? fishing.fishDefense + stealAmount
						: fishing.fishDefense,
				fishHp: Math.max(0, fishing.fishHp - selfDamage),
			},
			staminaDamage: 0,
			message: `${fishing.fishName} used Pressure of the Deep. It stole ${stealAmount} ${statLabel} from you. But it hurt itself by ${selfDamage} HP in the process.`,
		};
	}
	if (moveId === "clear_water_focus") {
		const healPercent = randomInt(10, 40);
		const healAmount = Math.max(
			1,
			Math.floor((Math.max(1, fishing.fishMaxHp) * healPercent) / 100),
		);
		const nextFishHp = Math.min(fishing.fishMaxHp, fishing.fishHp + healAmount);
		const recoveredHp = Math.max(0, nextFishHp - fishing.fishHp);
		const raiseAttack = randomInt(0, 1) === 0;
		const sourcePlayerStat = raiseAttack
			? fishing.playerDefense
			: fishing.playerAttack;
		const gainAmount =
			sourcePlayerStat <= 0
				? 0
				: Math.max(1, Math.floor(sourcePlayerStat * 0.2));
		return {
			fishing: {
				...fishing,
				fishHp: nextFishHp,
				fishAttack: raiseAttack
					? fishing.fishAttack + gainAmount
					: fishing.fishAttack,
				fishDefense: raiseAttack
					? fishing.fishDefense
					: fishing.fishDefense + gainAmount,
			},
			staminaDamage: 0,
			message: `${fishing.fishName} used Clear Water Focus. It restored ${recoveredHp} HP and raised its ${raiseAttack ? "Attack" : "Defense"} by ${gainAmount}.`,
		};
	}

	// TODO(fishing): hook additional fish moves into this resolver.
	return {
		fishing,
		staminaDamage: baseDamage,
		message: `${fishing.fishName} bites for ${baseDamage}.`,
	};
};

export const clearFishingTimers = (refs: {
	waitTimeoutRef: TimerRef;
	catchTimeoutRef: TimerRef;
	resolveTimeoutRef: TimerRef;
	waterIntervalRef: TimerRef;
}) => {
	if (refs.waitTimeoutRef.current !== null) {
		window.clearTimeout(refs.waitTimeoutRef.current);
		refs.waitTimeoutRef.current = null;
	}
	if (refs.catchTimeoutRef.current !== null) {
		window.clearTimeout(refs.catchTimeoutRef.current);
		refs.catchTimeoutRef.current = null;
	}
	if (refs.resolveTimeoutRef.current !== null) {
		window.clearTimeout(refs.resolveTimeoutRef.current);
		refs.resolveTimeoutRef.current = null;
	}
	if (refs.waterIntervalRef.current !== null) {
		window.clearInterval(refs.waterIntervalRef.current);
		refs.waterIntervalRef.current = null;
	}
};

export const startFishingSequence = (ctx: {
	map: MapId;
	x: number;
	y: number;
	castX: number;
	castY: number;
	fishing: FishingState | null;
	hasBlockingModal: boolean;
	playWater: () => void;
	setFishing: (
		updater:
			| FishingState
			| null
			| ((prev: FishingState | null) => FishingState | null),
	) => void;
	addLog: (line: string) => void;
	randomInt: (min: number, max: number) => number;
	waitTimeoutRef: TimerRef;
	onEncounterReady: () => void;
}): boolean => {
	if (ctx.fishing || ctx.hasBlockingModal) return false;
	ctx.playWater();
	ctx.setFishing({
		map: ctx.map,
		x: ctx.x,
		y: ctx.y,
		castX: ctx.castX,
		castY: ctx.castY,
		phase: "waiting",
		message: "You cast your line...",
		selectedMoveIndex: 0,
		fishId: null,
		fishName: "",
		fishGlyph: "",
		fishExpGranted: 0,
		fishMaxHp: 0,
		fishHp: 0,
		fishAttack: 0,
		fishDefense: 0,
		fishMovePool: [],
		playerLevel: 1,
		playerExp: 0,
		playerAttack: 0,
		playerDefense: 0,
		awaitingLevelUpBuffChoice: false,
		canChooseLevelUpBuff: false,
		levelUpBuffAttackAmount: 0,
		levelUpBuffDefenseAmount: 0,
		showMenu: false,
		openingStage: "none",
		playerAnim: null,
		fishAnim: null,
	});
	ctx.addLog("[full] You cast your line...");
	const waitMs = ctx.randomInt(2, 8) * 1000;
	ctx.waitTimeoutRef.current = window.setTimeout(() => {
		ctx.onEncounterReady();
	}, waitMs);
	return true;
};
