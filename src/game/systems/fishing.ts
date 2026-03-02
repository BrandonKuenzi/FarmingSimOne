import fishData from "../../data/fish.json";
import { randomInt } from "../shared/random";
import type {
	FishDefinition,
	FishingCategory,
	FishingFishMoveId,
	FishingImpactSoundId,
	FishingMovePoolEntry,
	FishingPlayerMoveId,
	FishingProgressState,
	FishingState,
	FishPerTurnStatModifier,
	FishingMoveUnlocks,
	MapId,
	PlayerPerTurnStatModifier,
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
	"relax_you_are_fishing",
	"steady_hands",
	"focus_on_drag",
	"cut_line",
];

export const createInitialFishingMoveUnlocks = (): FishingMoveUnlocks => ({
	reel_in: true,
	pull_rod: false,
	release_line: false,
	use_net: false,
	relax_you_are_fishing: false,
	steady_hands: false,
	focus_on_drag: false,
	cut_line: true,
});

export const FISHING_PLAYER_MOVES: Record<
	FishingPlayerMoveId,
	{ label: string; description: string }
> = {
	reel_in: {
		label: "Reel In",
		description: "Standard attack.",
	},
	pull_rod: {
		label: "Jerk Rod Sideways",
		description: "Small damage and lower fish defense by 1.",
	},
	release_line: {
		label: "Release Line",
		description: "Lower fish attack by 1, but fish heals by 1.",
	},
	use_net: {
		label: "Use Net",
		description: "Try to instant win. More success when fish has low HP.",
	},
	relax_you_are_fishing: {
		label: "Relax",
		description: "Gain +1 attack and +1 defense every turn.",
	},
	steady_hands: {
		label: "Steady Hands",
		description: "Gain +3 attack every turn.",
	},
	focus_on_drag: {
		label: "Focus on Drag",
		description: "Gain +3 defense every turn.",
	},
	cut_line: {
		label: "Cut Line",
		description: "Give up, you quitter.",
	},
};

export const FISHING_PLAYER_MOVE_IMPACT_SOUNDS: Record<
	FishingPlayerMoveId,
	FishingImpactSoundId
> = {
	reel_in: "hoe",
	pull_rod: "hoe",
	release_line: "hoe",
	use_net: "hoe",
	relax_you_are_fishing: "water",
	steady_hands: "water",
	focus_on_drag: "water",
	cut_line: "hoe",
};

export const FISHING_FISH_MOVE_LABELS: Record<FishingFishMoveId, string> = {
	bite: "Bite",
	thrash: "Thrash",
	dive_deep: "Dive Deep",
	wrap_line: "Wrap Line",
	go_along: "Do Nothing",
	undertow_rip: "Undertow Rip",
	thalassophobia: "Thalassophobia",
	cavernous_hunger: "Cavernous Hunger",
	pressure_of_the_deep: "Pressure of the Deep",
	clear_water_focus: "Clear Water Focus",
	rising_tide: "Rising Tide",
	salt_armor: "Salt Armor",
	leviathans_wake: "Leviathan's Wake",
	echoing_hunger: "Echoing Hunger",
	bedrock_fortification: "Bedrock Fortification",
	subterranean_rot: "Subterranean Rot",
	shenanigans: "Shenanigans",
	spatula_slap: "Spatula Slap",
	sponge_laugh: "Sponge Laugh",
};

export const FISHING_FISH_MOVE_IMPACT_SOUNDS: Record<
	FishingFishMoveId,
	FishingImpactSoundId
> = {
	bite: "munch",
	thrash: "water",
	dive_deep: "water",
	wrap_line: "water",
	go_along: "water",
	undertow_rip: "badWater1",
	thalassophobia: "badWater5",
	cavernous_hunger: "munch",
	pressure_of_the_deep: "badWater4",
	clear_water_focus: "badWater5",
	rising_tide: "badWater2",
	salt_armor: "badWater1",
	leviathans_wake: "badWater4",
	echoing_hunger: "badWater3",
	bedrock_fortification: "badWater3",
	subterranean_rot: "badWater3",
	shenanigans: "badWater6",
	spatula_slap: "hoe",
	sponge_laugh: "badWater2",
};

export const FISHING_EFFECT_SOUND_OPTIONS: FishingImpactSoundId[] = [
	"hoe",
	"water",
	"munch",
	"badWater1",
	"badWater2",
	"badWater3",
	"badWater4",
	"badWater5",
	"badWater6",
];

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

const WRAP_LINE_UNDERWATER_OBJECTS: string[] = [
	" big log",
	"n old shipwreck",
	" stick",
	" grove of seaweed",
	" coral outcrop",
	" rusted anchor",
	" fishing net",
	" jagged reef edge",
	" tangle of kelp",
	" sunken crate",
	" stone pillar",
	" driftwood branch",
	" mossy boulder",
	"n abandoned buoy chain",
	" shell-covered post",
	"n ancient mooring line",
	" submerged cart wheel",
	" pile of oyster shells",
	"n iron cage",
	" broken dock beam",
	" vending machine humming softly",
	" porcelain toilet throne",
	" rubber duck congregation",
	" ugly shopping cart",
	" disco ball still spinning",
	" pirate's lava lamp",
	" suspicious briefcase full of sand",
	" garden gnome in diving goggles",
	" banquet table set for crabs",
	" karaoke machine playing bubbles",
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
const whole = (value: number): number =>
	value >= 0 ? Math.floor(value) : Math.ceil(value);

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
	Math.max(1, whole(attack) - whole(defense));

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
	addPlayerPerTurnModifier?: PlayerPerTurnStatModifier;
	addFishPerTurnModifier?: FishPerTurnStatModifier;
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

	if (moveId === "relax_you_are_fishing") {
		return {
			fishing,
			message: "You relax...",
			caught: false,
			cutLine: false,
			addPlayerPerTurnModifier: {
				stamina: 0,
				attack: 1,
				defense: 1,
				moveName: "Relax",
				messages: [
					"You remember that you are here to have fun.",
					"You take a moment to enjoy the beauty around you.",
					"You pause for a moment to eat some sunflower seeds.",
					"This moment is bringing back great memories for you.",
					"You take a deep breath. The air here is clean.",
				],
			},
		};
	}
	if (moveId === "steady_hands") {
		return {
			fishing,
			message: "You focus on your grip...",
			caught: false,
			cutLine: false,
			addPlayerPerTurnModifier: {
				stamina: 0,
				attack: 3,
				defense: 0,
				moveName: "Steady Hands",
				messages: [
					"You adjust your grip and find the perfect angle.",
					"Your hands settle into a calm, confident rhythm.",
					"You stop fighting the line-and start controlling it.",
					"Every pull is cleaner. Every motion has purpose.",
					"Your focus sharpens. You're locked in.",
				],
			},
		};
	}
	if (moveId === "focus_on_drag") {
		return {
			fishing,
			message: "You concentrate on the reel's drag.",
			caught: false,
			cutLine: false,
			addPlayerPerTurnModifier: {
				stamina: 0,
				attack: 0,
				defense: 3,
				moveName: "Focus on Drag",
				messages: [
					"You fine-tune the drag for perfect resistance.",
					"The reel clicks softly as you dial it in.",
					"You check the tension on the line...",
					"You adjust the drag so the rod bends just a little.",
					"You adjust the line tension-it sings smoothly under controlled pressure.",
				],
			},
		};
	}

	if (moveId === "pull_rod") {
		const pullDamage = whole(Math.max(1, damage / 2) + rodTierBonus);
		const fishHp = Math.max(0, currentFishHp - pullDamage);
		const totalDebuf =
			fishing.fishDefense > debuffAmount ? debuffAmount : fishing.fishDefense;
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
			fishing.fishAttack > debuffAmount ? debuffAmount : fishing.fishAttack;
		return {
			fishing: {
				...fishing,
				fishAttack: Math.max(0, fishing.fishAttack - whole(totalDebuf)),
				fishHp: Math.min(fishing.fishMaxHp, currentFishHp + whole(totalDebuf)),
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
}): {
	fishing: FishingState;
	staminaDamage: number;
	message: string;
	attemptedPlayerDebuffStat?: "attack" | "defense";
	addPlayerPerTurnModifier?: PlayerPerTurnStatModifier;
	addFishPerTurnModifier?: FishPerTurnStatModifier;
} => {
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
			message: `${fishing.fishName} is resting.`,
		};
	}

	if (moveId === "wrap_line") {
		const totalBuff =
			debuffAmount > fishing.fishMaxHp / 2
				? fishing.fishMaxHp / 2
				: debuffAmount;
		const totalBuffWhole = whole(totalBuff);
		const underwaterObject =
			WRAP_LINE_UNDERWATER_OBJECTS[
				randomInt(0, WRAP_LINE_UNDERWATER_OBJECTS.length - 1)
			]!;

		return {
			fishing: {
				...fishing,
				fishDefense: fishing.fishDefense + totalBuffWhole,
			},
			staminaDamage: 0,
			message: `${fishing.fishName} wraps your line around a${underwaterObject} making it harder to reel in!`,
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
		const thrashDamage = whole(
			randomInt(1, 3) === 2 ? fishing.fishMaxHp / 10 : fishing.fishMaxHp / 15,
		);
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
		const canStealAttack = fishing.playerAttack > 0;
		const canStealDefense = fishing.playerDefense > 0;
		const statToSteal =
			canStealAttack && canStealDefense
				? randomInt(0, 1) === 0
					? "attack"
					: "defense"
				: canStealAttack
					? "attack"
					: "defense";
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
			attemptedPlayerDebuffStat: statToSteal,
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
			attemptedPlayerDebuffStat: statToSteal,
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
	if (moveId === "rising_tide") {
		return {
			fishing,
			staminaDamage: 0,
			message: "The fish summons a Rising Tide...",
			addFishPerTurnModifier: {
				hp: 0,
				attack: 3,
				defense: 0,
				moveName: "Rising Tide",
				messages: [
					"The tide rises higher with every pull.",
					"Cold ocean water surges in rhythmic waves.",
					"The current strengthens-your line hums with tension.",
					"The sea builds momentum, and so does the fish.",
					"Another swell rolls in. It's getting stronger.",
				],
				impactSound: "badWater2",
			},
		};
	}
	if (moveId === "salt_armor") {
		return {
			fishing,
			staminaDamage: 0,
			message: "The fish hardens into Salt Armor...",
			addFishPerTurnModifier: {
				hp: 0,
				attack: 0,
				defense: 3,
				moveName: "Salt Armor",
				messages: [
					"Salt crystals form a gritty shield.",
					"The ocean's minerals cling to its scales like armor.",
					"A briny crust hardens around it.",
					"The fish turns with practiced calm-hard to budge.",
					"Seawater flashes, and its defenses thicken.",
				],
				impactSound: "badWater1",
			},
		};
	}
	if (moveId === "leviathans_wake") {
		return {
			fishing,
			staminaDamage: 0,
			message: "The water churns-Leviathan's Wake!",
			addPlayerPerTurnModifier: {
				stamina: -4,
				attack: 0,
				defense: 0,
				moveName: "Leviathan's Wake",
				messages: [
					"A violent wake batters your stance.",
					"Foam and spray steal your breath.",
					"The sea drags at you like it's alive.",
					"Another surge slams your arms numb.",
					"The ocean won't let you rest-keep pulling!",
				],
				impactSound: "badWater4",
			},
			addFishPerTurnModifier: {
				hp: 0,
				attack: 2,
				defense: 0,
				moveName: "Leviathan's Wake",
				messages: [
					"It rides the wake like a weapon.",
					"The turbulence makes it bolder.",
					"It feeds on the chaos of the surf.",
					"Each wave gives it more leverage.",
					"It surges forward with terrifying confidence.",
				],
				impactSound: "badWater1",
			},
		};
	}
	if (moveId === "echoing_hunger") {
		return {
			fishing,
			staminaDamage: 0,
			message: "A hollow vibration-Echoing Hunger...",
			addPlayerPerTurnModifier: {
				stamina: 0,
				attack: -2,
				defense: 0,
				moveName: "Echoing Hunger",
				messages: [
					"The cave steals your strength one echo at a time.",
					"Your arms feel heavier in the cold dark.",
					"The silence presses down on your will to fight.",
					"Each drip of water sounds like a countdown.",
					"The darkness gnaws at your confidence.",
				],
				impactSound: "badWater3",
			},
			addFishPerTurnModifier: {
				hp: 0,
				attack: 2,
				defense: 0,
				moveName: "Echoing Hunger",
				messages: [
					"It grows bolder as the cave feeds it.",
					"The shadows sharpen its strikes.",
					"Your weakness makes it stronger.",
					"It thrums with hungry cave-energy.",
					"It pulls harder, like it's learned your rhythm.",
				],
				impactSound: "badWater1",
			},
		};
	}
	if (moveId === "bedrock_fortification") {
		return {
			fishing,
			staminaDamage: 0,
			message: "Stone creeps over it-Bedrock Fortification!",
			addFishPerTurnModifier: {
				hp: 0,
				attack: 0,
				defense: 4,
				moveName: "Bedrock Fortification",
				messages: [
					"Sediment thickens into a stubborn shell.",
					"The cave's grit seals every weak point.",
					"Rock-dust swirls and hardens into defense.",
					"It becomes a little more immovable each turn.",
					"The stone remembers. The stone protects.",
				],
				impactSound: "badWater3",
			},
		};
	}
	if (moveId === "subterranean_rot") {
		return {
			fishing,
			staminaDamage: 0,
			message: "The cavern exhales-Subterranean Rot...",
			addPlayerPerTurnModifier: {
				stamina: 0,
				attack: 0,
				defense: -3,
				moveName: "Subterranean Rot",
				messages: [
					"Your footing crumbles beneath you.",
					"Damp air weakens your grip and resolve.",
					"The cave saps your ability to brace.",
					"The walls feel closer. Your guard slips.",
					"Each turn, the cavern takes something from you.",
				],
				impactSound: "badWater3",
			},
		};
	}
	if (moveId === "shenanigans") {
		const randSigned = () => {
			const base = randomInt(5, 20);
			return randomInt(0, 1) === 0 ? -base : base;
		};
		return {
			fishing,
			staminaDamage: 0,
			message: "Robert uses Shenanigans!",
			addPlayerPerTurnModifier: {
				stamina: randSigned(),
				attack: randSigned(),
				defense: randSigned(),
				moveName: "Shenanigans",
				messages: [
					"Robert's shenanigans affect you in unexpected ways.",
					"Robert did something... you don't know how...",
					"You don't know how much more of this you can take.",
					"What is going on?!",
					"You swear the sponge winked at you.",
				],
				impactSound: "badWater6",
			},
			addFishPerTurnModifier: {
				hp: randSigned(),
				attack: randSigned(),
				defense: randSigned(),
				moveName: "Shenanigans",
				messages: [
					"Robert's shenanigans affect the fish in unexpected ways.",
					"The fish looks confused. You feel confused too.",
					"Somehow, this is getting weirder.",
					"Reality bends slightly near the sponge.",
					"You regret asking what Robert was doing.",
				],
				impactSound: "badWater6",
			},
		};
	}
	if (moveId === "spatula_slap") {
		const damage = whole(10 + fishing.fishAttack);
		return {
			fishing,
			staminaDamage: damage,
			message: `Robert used Spatula Slap! It bonked you for ${damage} damage!`,
		};
	}
	if (moveId === "sponge_laugh") {
		const debuff = 20;
		if (fishing.robertSpongeLaughUsed) {
			return {
				fishing,
				staminaDamage: 0,
				message: "Robert used Sponge Laugh! But it has no extra effect.",
			};
		}
		return {
			fishing: {
				...fishing,
				playerDefense: Math.max(0, fishing.playerDefense - debuff),
				robertSpongeLaughUsed: true,
			},
			staminaDamage: 0,
			attemptedPlayerDebuffStat: "defense",
			message: `Robert used Sponge Laugh! Your defense drops by ${debuff}!`,
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
		playerToasts: [],
		fishToasts: [],
		expBarLevelUpBurst: false,
		playerPerTurnModifiers: [],
		fishPerTurnModifiers: [],
		robertSpongeLaughUsed: false,
	});
	ctx.addLog("[full] You cast your line...");
	const waitMs = ctx.randomInt(2, 8) * 1000;
	ctx.waitTimeoutRef.current = window.setTimeout(() => {
		ctx.onEncounterReady();
	}, waitMs);
	return true;
};
