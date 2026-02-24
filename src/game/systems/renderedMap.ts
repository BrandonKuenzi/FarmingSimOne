import { GLYPH } from "../config/glyphs";
import type {
	Animal,
	ForestChest,
	ForestEnemy,
	ForestObstacle,
	FishingState,
	MapId,
	PetEmoji,
	Plot,
	Position,
} from "../shared/types";

type RenderedMapContext = {
	activeMapLayouts: Record<string, string[]>;
	player: Position;
	day: number;
	starterChestOpened: boolean;
	STARTER_CHEST_POS: { x: number; y: number };
	headlampLetterVisible: boolean;
	HEADLAMP_LETTER_POS: { x: number; y: number };
	plots: Record<string, Plot>;
	cropDefs: Record<string, { growDays: number }>;
	farmForestBlockers: Record<string, boolean>;
	farmCaveBlockers: Record<string, number>;
	petGraveObstacles: Record<string, number>;
	farmWeedObstacles: Record<string, boolean>;
	beachBottlePos: { x: number; y: number } | null;
	doctorVendorActive: boolean;
	DOCTOR_POS: { x: number; y: number };
	petVendorActive: boolean;
	ownedPet: PetEmoji | null;
	PET_VENDOR_POS: { x: number; y: number };
	sketchyMerchantActive: boolean;
	SKETCHY_MERCHANT_POS: { x: number; y: number };
	sketchyMerchantStock: Array<unknown>;
	SKETCHY_CRATE_POS: { x: number; y: number };
	traderActive: boolean;
	TRADER_POS: { x: number; y: number };
	TRADER_BOX_POS: { x: number; y: number };
	TRADER_HELI_POS: { x: number; y: number };
	beachShellDrops: Record<string, boolean>;
	townNpcTiles: Record<string, { x: number; y: number }>;
	boatNpcEmojis: Record<string, string>;
	boatTiles: Record<string, { x: number; y: number }>;
	animalsMap: MapId;
	animals: Animal[];
	animalTiles: Record<number, { x: number; y: number }>;
	farmEggDrops: Record<string, boolean>;
	petOptions: PetEmoji[];
	petTile: { x: number; y: number } | null;
	petHeartTile: { x: number; y: number } | null;
	hasTractor: boolean;
	tractorParked: boolean;
	TRACTOR_PARK_POS: { x: number; y: number };
	forestObstacles: ForestObstacle[];
	forestChest: ForestChest;
	forestBonusChests: ForestChest[];
	forestEnemies: ForestEnemy[];
	caveObstacles: ForestObstacle[];
	caveBonusChest: ForestChest | null;
	caveLadderPos: { x: number; y: number } | null;
	caveEnemies: ForestEnemy[];
	isShopMap: (map: MapId) => boolean;
	shopDecorByMap: Record<string, Record<string, string>>;
	keyForPos: (x: number, y: number) => string;
	isOrdering: boolean;
	cafeShopkeeperX: number;
	isBathing: boolean;
	fishing: FishingState | null;
};

export const buildRenderedMapGrid = (ctx: RenderedMapContext): string[][] => {
	const {
		activeMapLayouts,
		player,
		day,
		starterChestOpened,
		STARTER_CHEST_POS,
		headlampLetterVisible,
		HEADLAMP_LETTER_POS,
		plots,
		cropDefs,
		farmForestBlockers,
		farmCaveBlockers,
		petGraveObstacles,
		farmWeedObstacles,
		beachBottlePos,
		doctorVendorActive,
		DOCTOR_POS,
		petVendorActive,
		ownedPet,
		PET_VENDOR_POS,
		sketchyMerchantActive,
		SKETCHY_MERCHANT_POS,
		sketchyMerchantStock,
		SKETCHY_CRATE_POS,
		traderActive,
		TRADER_POS,
		TRADER_BOX_POS,
		TRADER_HELI_POS,
		beachShellDrops,
		townNpcTiles,
		boatNpcEmojis,
		boatTiles,
		animalsMap,
		animals,
		animalTiles,
		farmEggDrops,
		petOptions,
		petTile,
		petHeartTile,
		hasTractor,
		tractorParked,
		TRACTOR_PARK_POS,
		forestObstacles,
		forestChest,
		forestBonusChests,
		forestEnemies,
		caveObstacles,
		caveBonusChest,
		caveLadderPos,
		caveEnemies,
		isShopMap,
		shopDecorByMap,
		keyForPos,
		isOrdering,
		cafeShopkeeperX,
		isBathing,
		fishing,
	} = ctx;

	const base = activeMapLayouts[player.map].map((r: string) => r.split(""));

	if (player.map === "farm") {
		if (day === 1 && !starterChestOpened) {
			base[STARTER_CHEST_POS.y]![STARTER_CHEST_POS.x] = "X";
		}
		if (headlampLetterVisible) {
			base[HEADLAMP_LETTER_POS.y]![HEADLAMP_LETTER_POS.x] = "\\";
		}
		Object.entries(plots).forEach(([key, p]) => {
			const [xs, ys] = key.split(",");
			const x = Number(xs);
			const y = Number(ys);
			if (!Number.isFinite(x) || !Number.isFinite(y)) return;
			if (!p.crop) base[y][x] = ";";
			else {
				const def = cropDefs[p.crop];
				const age = p.growthDays;
				if (age >= def.growDays) {
					base[y][x] = GLYPH.sheafOfRice;
				} else {
					const stage2Start = Math.max(1, Math.ceil(def.growDays / 3));
					const stage3Start = Math.max(1, Math.ceil((def.growDays * 2) / 3));
					if (age >= stage3Start) base[y][x] = GLYPH.shamrock;
					else if (age >= stage2Start) base[y][x] = GLYPH.seedling;
					else base[y][x] = "'";
				}
			}
		});
		Object.entries(farmForestBlockers).forEach(([key, present]) => {
			if (!present) return;
			const [xs, ys] = key.split(",");
			const x = Number(xs);
			const y = Number(ys);
			if (!Number.isFinite(x) || !Number.isFinite(y)) return;
			base[y]![x] = "L";
		});
		Object.entries(farmCaveBlockers).forEach(([key, hits]) => {
			if ((hits ?? 0) <= 0) return;
			const [xs, ys] = key.split(",");
			const x = Number(xs);
			const y = Number(ys);
			if (!Number.isFinite(x) || !Number.isFinite(y)) return;
			base[y]![x] = "O";
		});
		Object.entries(petGraveObstacles).forEach(([key, hits]) => {
			if (!hits || hits <= 0) return;
			const [xs, ys] = key.split(",");
			const x = Number(xs);
			const y = Number(ys);
			if (!Number.isFinite(x) || !Number.isFinite(y)) return;
			base[y]![x] = "}";
		});
		Object.entries(farmWeedObstacles).forEach(([key, present]) => {
			if (!present) return;
			const [xs, ys] = key.split(",");
			const x = Number(xs);
			const y = Number(ys);
			if (!Number.isFinite(x) || !Number.isFinite(y)) return;
			base[y]![x] = "J";
		});
	}

	if (player.map === "town") {
		if (beachBottlePos) base[beachBottlePos.y]![beachBottlePos.x] = "M";
		if (doctorVendorActive) base[DOCTOR_POS.y]![DOCTOR_POS.x] = "Z";
		if (petVendorActive && !ownedPet) base[PET_VENDOR_POS.y]![PET_VENDOR_POS.x] = "8";
		if (sketchyMerchantActive) {
			base[SKETCHY_MERCHANT_POS.y]![SKETCHY_MERCHANT_POS.x] = "0";
			if (sketchyMerchantStock.length > 0 && base[SKETCHY_CRATE_POS.y]?.[SKETCHY_CRATE_POS.x]) {
				base[SKETCHY_CRATE_POS.y]![SKETCHY_CRATE_POS.x] = "6";
			}
		}
		if (traderActive) {
			if (base[TRADER_POS.y]?.[TRADER_POS.x]) base[TRADER_POS.y]![TRADER_POS.x] = "4";
			if (base[TRADER_BOX_POS.y]?.[TRADER_BOX_POS.x]) base[TRADER_BOX_POS.y]![TRADER_BOX_POS.x] = "5";
			if (base[TRADER_HELI_POS.y]?.[TRADER_HELI_POS.x]) base[TRADER_HELI_POS.y]![TRADER_HELI_POS.x] = "7";
		}
		Object.entries(beachShellDrops).forEach(([key, present]) => {
			if (!present) return;
			const [xs, ys] = key.split(",");
			const x = Number(xs);
			const y = Number(ys);
			if (!Number.isFinite(x) || !Number.isFinite(y)) return;
			base[y]![x] = "S";
		});
		const labels: Record<string, string> = {
			neighbor_1: "n",
			neighbor_2: "m",
			neighbor_3: "o",
			neighbor_4: "p",
		};
		Object.entries(townNpcTiles).forEach(([k, pos]) => {
			const label = labels[k];
			if (label) base[pos.y][pos.x] = label;
		});
		const boatLabels: Record<string, string> = {
			boat_1: "q",
			boat_2: "r",
			boat_3: "u",
			boat_4: "v",
			boat_5: "z",
		};
		Object.entries(boatTiles).forEach(([k, pos]) => {
			base[pos.y][pos.x] = boatLabels[k] ?? "q";
		});
	}

	if (player.map === animalsMap) {
		const markerByAnimal: Record<string, string> = {
			cow: "1",
			sheep: "2",
			chicken: "3",
			hippo: "A",
			unicorn: "D",
			mammoth: "F",
			slug: "I",
			gorilla: "N",
		};
		animals.forEach((a) => {
			const pos = animalTiles[a.id];
			if (!pos) return;
			base[pos.y][pos.x] = markerByAnimal[a.type];
		});
		Object.entries(farmEggDrops).forEach(([key, present]) => {
			if (!present) return;
			const [xs, ys] = key.split(",");
			const x = Number(xs);
			const y = Number(ys);
			if (!Number.isFinite(x) || !Number.isFinite(y)) return;
			base[y]![x] = "E";
		});
	}

	if (player.map === "farm") {
		if (ownedPet && petTile) {
			const petMarker: Record<string, string> = {
				[petOptions[0]]: "@",
				[petOptions[1]]: "%",
				[petOptions[2]]: "&",
				[petOptions[3]]: "?",
			};
			base[petTile.y]![petTile.x] = petMarker[ownedPet] ?? "?";
		}
		if (petHeartTile) base[petHeartTile.y]![petHeartTile.x] = "9";
		if (hasTractor && tractorParked) base[TRACTOR_PARK_POS.y]![TRACTOR_PARK_POS.x] = "{";
	}

	if (player.map === "forest") {
		forestObstacles.forEach((o) => {
			base[o.y]![o.x] = o.type === "rock" ? "O" : o.type === "weed" ? "J" : "L";
		});
		if (!forestChest.opened) base[forestChest.y]![forestChest.x] = "X";
		forestBonusChests.forEach((chest) => {
			if (!chest.opened) base[chest.y]![chest.x] = "X";
		});
		forestEnemies.forEach((enemy) => {
			base[enemy.y]![enemy.x] = enemy.type === "bear" ? "e" : enemy.type === "snake" ? "y" : "!";
		});
	}
	if (player.map === "cave") {
		caveObstacles.forEach((o) => {
			base[o.y]![o.x] = o.type === "torch" ? "|" : "O";
		});
		if (caveBonusChest && !caveBonusChest.opened) {
			base[caveBonusChest.y]![caveBonusChest.x] = "X";
		}
		if (caveLadderPos) base[caveLadderPos.y]![caveLadderPos.x] = "/";
		caveEnemies.forEach((enemy) => {
			base[enemy.y]![enemy.x] = enemy.type === "bear" ? "e" : enemy.type === "poop" ? "!" : "`";
		});
	}

	if (isShopMap(player.map)) {
		const decor = shopDecorByMap[player.map];
		if (decor) {
			Object.entries(decor).forEach(([pos, emoji]) => {
				const [xStr, yStr] = pos.split(",");
				const x = Number(xStr);
				const y = Number(yStr);
				if (!Number.isFinite(x) || !Number.isFinite(y)) return;
				const tile = activeMapLayouts[player.map]?.[y]?.[x];
				if (!tile || tile === "+" || tile === "j") return;
				base[y][x] = emoji;
			});
		}
	}

	if (player.map === "cafe_shop" && isOrdering) {
		for (let y = 0; y < base.length; y += 1) {
			for (let x = 0; x < base[y]!.length; x += 1) {
				if (base[y]![x] === "j") base[y]![x] = ".";
			}
		}
		base[2]![cafeShopkeeperX] = "j";
	}

	if (player.map === "house" && isBathing) {
		base[1]![1] = "V";
	} else {
		base[player.y][player.x] = "P";
	}

	if (fishing && fishing.map === player.map) {
		if (fishing.phase === "waiting") base[fishing.y][fishing.x] = "b";
		else if (fishing.phase === "bite") base[fishing.y][fishing.x] = "F";
	}

	return base;
};


