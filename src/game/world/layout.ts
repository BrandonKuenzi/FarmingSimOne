import { randomInt, randomRoll } from "../shared/random";
import type { BarnTier, MapId, Tile } from "../shared/types";

export const wall: Tile = { icon: "#", passable: false, label: "Wall" };
export const floor: Tile = { icon: ".", passable: true, label: "Floor" };
export const grass: Tile = { icon: ",", passable: true, label: "Grass" };
export const path: Tile = { icon: "=", passable: true, label: "Path" };
export const sand: Tile = { icon: ":", passable: true, label: "Sand" };
export const soil: Tile = { icon: ";", passable: true, label: "Soil" };
export const water: Tile = { icon: "~", passable: false, label: "Water" };

export const FARM_WIDTH = 56;
export const FARM_HEIGHT = 28;
export const TOWN_WIDTH = 56;
export const TOWN_HEIGHT = FARM_HEIGHT;
export const SOUTH_GATE_X1 = 27;
export const SOUTH_GATE_X2 = 28;
export const FOREST_GATE_Y = Math.floor(FARM_HEIGHT / 2);
export const CAVE_GATE_Y = Math.max(2, FOREST_GATE_Y - 3);

export const TOWN_COAST_WALL_Y = 12;
export const TOWN_SAND_Y = TOWN_COAST_WALL_Y + 1;
export const TOWN_OCEAN_START_Y = TOWN_SAND_Y + 1;
export const BUREAUCRACY_ENTRY_POS = { x: 12, y: 9 };
export const BUREAUCRACY_EXIT_POS = { x: 12, y: 11 };
export const BUREAUCRACY_SAVARIO_POS = { x: 12, y: 5 };
export const COMPUTER_LAB_TOWN_DOOR_POS = { x: 2, y: 3 };
export const COMPUTER_LAB_ROOF_PURPLE_TILE = "\u00D7";
export const COMPUTER_LAB_ROOF_DARK_TILE = "\u00D8";

export const BARN_MAX_TIER: BarnTier = 5;
export const BARN_TIER_NAMES: Record<BarnTier, string> = {
	1: "Tier 1",
	2: "Tier 2",
	3: "Tier 3",
	4: "Tier 4",
	5: "Legendary",
};

export const getBarnUpgradeCost = (nextTier: BarnTier) => {
	if (nextTier === 2) {
		return {
			money: 1000,
			iron: 0,
			gems: {} as Partial<Record<"ruby" | "emerald" | "diamond", number>>,
		};
	}
	if (nextTier === 3) {
		return {
			money: 2000,
			iron: 1,
			gems: {} as Partial<Record<"ruby" | "emerald" | "diamond", number>>,
		};
	}
	if (nextTier === 4) {
		return {
			money: 5000,
			iron: 10,
			gems: {} as Partial<Record<"ruby" | "emerald" | "diamond", number>>,
		};
	}
	return { money: 10000, iron: 0, gems: { ruby: 1, emerald: 1, diamond: 1 } };
};

export const BARN_EXTERIOR_ENTRY_XS = [20, 21] as const;
export const BARN_EXTERIOR_ENTRY_Y = 0;

export const getFarmBarnOuterRect = (tier: BarnTier) => {
	if (tier === 1) return { x: 15, y: 2, w: 7, h: 7 };
	if (tier === 2) return { x: 15, y: 2, w: 12, h: 7 };
	return { x: 15, y: 2, w: 17, h: 7 };
};

export const getBarnInteriorSizeByTier = (tier: BarnTier) => {
	if (tier === 1) return { width: 5, height: 5 };
	if (tier === 2) return { width: 10, height: 5 };
	if (tier === 3) return { width: 15, height: 5 };
	if (tier === 4) return { width: 20, height: 20 };
	return { width: FARM_WIDTH - 17, height: FARM_HEIGHT - 4 };
};

export const getBarnAnimalCap = (tier: BarnTier) => {
	if (tier === 1) return 5;
	if (tier === 2) return 10;
	if (tier === 3) return 20;
	if (tier === 4) return 50;
	const { width, height } = getBarnInteriorSizeByTier(5);
	return Math.max(1, Math.floor((width * height) / 4));
};

export const isBarnExternal = (tier: BarnTier) => tier >= 4;

const paintRect = (
	grid: string[][],
	x: number,
	y: number,
	w: number,
	h: number,
	tile: string,
) => {
	for (let yy = y; yy < y + h; yy += 1) {
		for (let xx = x; xx < x + w; xx += 1) {
			if (yy >= 0 && yy < grid.length && xx >= 0 && xx < grid[yy].length) {
				grid[yy][xx] = tile;
			}
		}
	}
};

export const buildFarmLayout = (barnTier: BarnTier): string[] => {
	const grid = Array.from({ length: FARM_HEIGHT }, () =>
		Array.from({ length: FARM_WIDTH }, () => ","),
	);

	for (let x = 0; x < FARM_WIDTH; x += 1) {
		grid[0][x] = "T";
		grid[FARM_HEIGHT - 1][x] = "#";
	}
	const farmCaveWallTiles = ["<", ">", "*"] as const;
	for (let y = 0; y < FARM_HEIGHT; y += 1) {
		grid[y][0] =
			farmCaveWallTiles[Math.floor(randomRoll() * farmCaveWallTiles.length)]!;
		grid[y][FARM_WIDTH - 1] = "#";
	}
	const farmCaveTrimYs = [8, 9, 10, 13, 14, 15, 16];
	farmCaveTrimYs.forEach((y) => {
		if (y >= 0 && y < FARM_HEIGHT) {
			grid[y][1] =
				farmCaveWallTiles[Math.floor(randomRoll() * farmCaveWallTiles.length)]!;
		}
	});
	grid[CAVE_GATE_Y][0] = "=";
	grid[CAVE_GATE_Y + 1][0] = "=";
	for (let y = 0; y < FARM_HEIGHT; y += 1) {
		grid[y][FARM_WIDTH - 1] = "T";
	}
	grid[FOREST_GATE_Y][FARM_WIDTH - 1] = ",";
	grid[FOREST_GATE_Y + 1][FARM_WIDTH - 1] = ",";

	grid[FARM_HEIGHT - 1][SOUTH_GATE_X1] = "+";
	grid[FARM_HEIGHT - 1][SOUTH_GATE_X2] = "+";

	paintRect(grid, 4, 3, 8, 3, "g");
	paintRect(grid, 4, 6, 8, 1, "H");
	paintRect(grid, 4, 7, 8, 1, "H");
	grid[6][5] = "l";
	grid[6][10] = "l";
	grid[7][7] = "+";

	if (!isBarnExternal(barnTier)) {
		const { x, y, w, h } = getFarmBarnOuterRect(barnTier);
		paintRect(grid, x, y, w, h, "B");
		paintRect(grid, x + 1, y + 1, w - 2, h - 2, ".");
		const doorCenterX = x + Math.floor(w / 2);
		grid[y + h - 1][doorCenterX - 1] = ".";
		grid[y + h - 1][doorCenterX] = ".";
		grid[y + h - 1][doorCenterX + 1] = ".";
		if (barnTier >= 3) {
			grid[y + Math.floor(h / 2)][x + w - 1] = ".";
		}
	} else {
		BARN_EXTERIOR_ENTRY_XS.forEach((x) => {
			grid[BARN_EXTERIOR_ENTRY_Y][x] = "+";
		});
	}
	grid[8][14] = "_";

	for (let y = 9; y <= FARM_HEIGHT - 2; y += 1) {
		grid[y][SOUTH_GATE_X1] = "=";
		grid[y][SOUTH_GATE_X2] = "=";
	}
	for (let x = 7; x <= SOUTH_GATE_X2; x += 1) {
		grid[9][x] = "=";
	}
	for (let x = 21; x <= SOUTH_GATE_X2; x += 1) {
		grid[9][x] = "=";
	}

	paintRect(grid, 34, 3, 8, 4, "~");
	paintRect(grid, 45, 4, 7, 3, "~");
	paintRect(grid, 1, FARM_HEIGHT - 4, 6, 3, "~");

	return grid.map((row) => row.join(""));
};

export const buildTownLayout = (): string[] => {
	const grid = Array.from({ length: TOWN_HEIGHT }, () =>
		Array.from({ length: TOWN_WIDTH }, () => ","),
	);

	for (let x = 0; x < TOWN_WIDTH; x += 1) {
		grid[0][x] = "#";
		grid[TOWN_HEIGHT - 1][x] = "#";
	}
	for (let y = 0; y < TOWN_HEIGHT; y += 1) {
		grid[y][0] = "#";
		grid[y][TOWN_WIDTH - 1] = "#";
	}

	grid[0][SOUTH_GATE_X1] = "+";
	grid[0][SOUTH_GATE_X2] = "+";
	const shopY = 4;
	const shopDoorY = shopY + 3;
	const branchPathY = shopDoorY + 1;
	const mainPathXs = [SOUTH_GATE_X1, SOUTH_GATE_X2];
	const shops: Array<{ x: number; sign: string }> = [
		{ x: 6, sign: "s" },
		{ x: 13, sign: "f" },
		{ x: 20, sign: "a" },
		{ x: 31, sign: "t" },
		{ x: 37, sign: "c" },
		{ x: 43, sign: "k" },
		{ x: 49, sign: "$" },
	];

	shops.forEach(({ x, sign }) => {
		paintRect(grid, x, shopY, 5, 4, "H");
		paintRect(grid, x + 1, shopY + 1, 3, 2, "H");
		for (let xx = x; xx < x + 5; xx += 1) {
			const roofStripe =
				sign === "$"
					? (xx - x) % 2 === 0
						? "Q"
						: "W"
					: (xx - x) % 2 === 0
						? "R"
						: "W";
			grid[shopY][xx] = roofStripe;
			grid[shopY + 1][xx] = roofStripe;
		}
		const doorX = x + 2;
		grid[shopDoorY][doorX] = "+";
		grid[shopY + 2][doorX] = sign;
	});

	for (let yy = 0; yy <= 1; yy += 1) {
		for (let xx = 1; xx <= 4; xx += 1) {
			grid[yy][xx] =
				(xx - 1) % 2 === 0
					? COMPUTER_LAB_ROOF_PURPLE_TILE
					: COMPUTER_LAB_ROOF_DARK_TILE;
		}
	}
	for (let yy = 2; yy <= 3; yy += 1) {
		for (let xx = 1; xx <= 4; xx += 1) {
			grid[yy][xx] = "W";
		}
	}
	grid[2][3] = '"';

	for (let y = 1; y <= TOWN_COAST_WALL_Y; y += 1) {
		mainPathXs.forEach((px) => {
			grid[y][px] = "=";
		});
	}
	for (let x = 2; x <= 53; x += 1) {
		grid[branchPathY][x] = "=";
	}

	for (let x = 1; x < TOWN_WIDTH - 1; x += 1) {
		grid[TOWN_SAND_Y][x] = ":";
	}

	for (let y = TOWN_OCEAN_START_Y; y < TOWN_HEIGHT - 1; y += 1) {
		for (let x = 1; x < TOWN_WIDTH - 1; x += 1) {
			grid[y][x] = "~";
		}
	}

	for (let y = TOWN_OCEAN_START_Y; y < TOWN_HEIGHT; y += 1) {
		grid[y][0] = "~";
		grid[y][TOWN_WIDTH - 1] = "~";
	}
	for (let x = 0; x < TOWN_WIDTH; x += 1) {
		grid[TOWN_HEIGHT - 1][x] = "~";
	}

	for (let y = TOWN_COAST_WALL_Y; y <= TOWN_SAND_Y; y += 1) {
		mainPathXs.forEach((px) => {
			grid[y][px] = "=";
		});
	}
	for (
		let y = TOWN_OCEAN_START_Y;
		y <= Math.min(TOWN_OCEAN_START_Y + 4, TOWN_HEIGHT - 1);
		y += 1
	) {
		mainPathXs.forEach((px) => {
			grid[y][px] = "=";
		});
	}

	// Placeholder aquarium exterior footprint.
	// Upper-left: (48,10), bottom-right: (55,15) inclusive.
	// Top 3 rows are striped roof (blue/aquarium-gray by column), lower 3 rows are roof-white walls.
	for (let xx = 48; xx <= 55; xx += 1) {
		const roofStripe = (xx - 48) % 2 === 0 ? "R" : "\u00A7";
		for (let yy = 10; yy <= 12; yy += 1) {
			grid[yy][xx] = roofStripe;
		}
	}
	paintRect(grid, 48, 13, 8, 3, "W");

	// Dock path for aquarium access.
	// Vertical leg: (45,9) -> (45,16), horizontal leg: (45,16) -> (53,16).
	for (let y = 9; y <= 16; y += 1) {
		grid[y][45] = "=";
	}
	for (let x = 45; x <= 53; x += 1) {
		grid[16][x] = "=";
	}
	grid[COMPUTER_LAB_TOWN_DOOR_POS.y]![COMPUTER_LAB_TOWN_DOOR_POS.x] = "+";
	for (let y = COMPUTER_LAB_TOWN_DOOR_POS.y + 1; y <= 7; y += 1) {
		grid[y]![COMPUTER_LAB_TOWN_DOOR_POS.x] = "=";
	}
	grid[4][1] = "\u00D9";
	grid[4][3] = "_";
	grid[14][50] = "(";
	grid[14][52] = "-";
	grid[14][54] = '"';
	grid[15][51] = "+";
	grid[16][51] = "=";

	return grid.map((row) => row.join(""));
};

export const buildShopLayout = (): string[] => [
	"###############",
	"#.............#",
	"#......j......#",
	"#xxxxxxxxxxxxx#",
	"#.............#",
	"#.............#",
	"#.............#",
	"#......+......#",
	"###############",
];

export const buildCafeShopLayout = (): string[] => [
	"###############",
	"#.............#",
	"#......j......#",
	"#xxxxxxxxxxxxx#",
	"#.h.h.....h.hh#",
	"#.............#",
	"#.............#",
	"#......+......#",
	"###############",
];

export const buildAquariumLayout = (): string[] => {
	const width = 41;
	const height = 15;
	const grid = Array.from({ length: height }, () =>
		Array.from({ length: width }, () => "="),
	);

	for (let x = 0; x < width; x += 1) {
		grid[0]![x] = "W";
		grid[height - 1]![x] = "W";
	}
	for (let y = 0; y < height; y += 1) {
		grid[y]![0] = "W";
		grid[y]![width - 1] = "W";
	}

	// Three 10x8 tank footprints with 3-tile gaps across the upper wall.
	paintRect(grid, 2, 1, 10, 8, "\u0192");
	paintRect(grid, 15, 1, 10, 8, "\u00A2");
	paintRect(grid, 28, 1, 11, 8, "\u00A4");
	grid[7]![3] = "\u00C6";
	grid[7]![23] = "\u00C4";
	grid[7]![28] = "\u00C5";
	grid[7]![37] = "\u00C5";
	grid[7]![38] = "\u00C5";
	paintRect(grid, 2, 8, 10, 1, "\u00B1");
	paintRect(grid, 15, 8, 10, 1, "\u00B5");
	const caveFloorTiles = ["<", ">", "*"] as const;
	for (let x = 28; x <= 38; x += 1) {
		grid[8]![x] = caveFloorTiles[Math.floor(randomRoll() * caveFloorTiles.length)]!;
	}

	grid[height - 1]![Math.floor(width / 2)] = "+";

	return grid.map((row) => row.join(""));
};

const createSeededRng = (seed: number) => {
	let state = seed >>> 0;
	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 4294967296;
	};
};

export const getBarnStructureRect = (
	barnTier: BarnTier,
	layoutWidth: number,
	layoutHeight: number,
) => {
	if (!isBarnExternal(barnTier)) {
		return { x: 0, y: 0, w: layoutWidth, h: layoutHeight };
	}
	const interior = getBarnInteriorSizeByTier(barnTier);
	const w = interior.width + 2;
	const h = interior.height + 2;
	if (barnTier === 5) {
		return { x: 0, y: 0, w, h };
	}
	const x = Math.floor((layoutWidth - w) / 2);
	const y = Math.floor((layoutHeight - h) / 2);
	return { x, y, w, h };
};

export const buildBarnLayout = (barnTier: BarnTier): string[] => {
	const interior = getBarnInteriorSizeByTier(barnTier);
	const width = isBarnExternal(barnTier) ? FARM_WIDTH : interior.width + 2;
	const height = isBarnExternal(barnTier) ? FARM_HEIGHT : interior.height + 2;
	const bgTile = isBarnExternal(barnTier) ? "T" : "#";
	const grid: string[][] = Array.from({ length: height }, () =>
		Array.from({ length: width }, () => bgTile),
	);
	const rect = getBarnStructureRect(barnTier, width, height);
	const centerX = rect.x + Math.floor(rect.w / 2);
	const doorY = rect.y + rect.h - 1;

	if (isBarnExternal(barnTier)) {
		const rng = createSeededRng(9000 + barnTier * 1337);
		for (let y = 0; y < height; y += 1) {
			for (let x = 0; x < width; x += 1) {
				grid[y]![x] = rng() < 0.22 ? "G" : "T";
			}
		}
		const treeBlobCount = barnTier === 4 ? 10 : 14;
		for (let i = 0; i < treeBlobCount; i += 1) {
			const cx = Math.floor(rng() * width);
			const cy = Math.floor(rng() * height);
			const rx = 2 + Math.floor(rng() * 4);
			const ry = 2 + Math.floor(rng() * 3);
			const treeTile = rng() < 0.3 ? "G" : "T";
			for (let y = cy - ry - 1; y <= cy + ry + 1; y += 1) {
				for (let x = cx - rx - 1; x <= cx + rx + 1; x += 1) {
					if (x < 0 || y < 0 || y >= height || x >= width) continue;
					const inBarnOuter =
						x >= rect.x &&
						x < rect.x + rect.w &&
						y >= rect.y &&
						y < rect.y + rect.h;
					if (inBarnOuter) continue;
					const nx = (x - cx) / Math.max(1, rx);
					const ny = (y - cy) / Math.max(1, ry);
					const ellipse = nx * nx + ny * ny;
					if (ellipse <= 1 + rng() * 0.22) {
						grid[y]![x] = treeTile;
					}
				}
			}
		}

		const leftBlobCx = Math.max(3, rect.x - 8 + randomInt(-1, 1));
		const rightBlobCx = Math.min(
			width - 4,
			rect.x + rect.w + 8 + randomInt(-1, 1),
		);
		const blobCy = rect.y + Math.floor(rect.h / 2) + randomInt(-1, 1);
		const carveGrassBlob = (cx: number, cy: number, rx: number, ry: number) => {
			for (let y = cy - ry - 2; y <= cy + ry + 2; y += 1) {
				for (let x = cx - rx - 2; x <= cx + rx + 2; x += 1) {
					if (x < 1 || y < 1 || y >= height - 1 || x >= width - 1) continue;
					const inBarnOuter =
						x >= rect.x &&
						x < rect.x + rect.w &&
						y >= rect.y &&
						y < rect.y + rect.h;
					if (inBarnOuter) continue;
					const nx = (x - cx) / Math.max(1, rx);
					const ny = (y - cy) / Math.max(1, ry);
					if (nx * nx + ny * ny <= 1.2 + rng() * 0.18) {
						grid[y]![x] = ",";
					}
				}
			}
		};
		const carveBlobGroup = (
			baseCx: number,
			baseCy: number,
			count: number,
			dir: -1 | 1,
		) => {
			for (let i = 0; i < count; i += 1) {
				const cx = baseCx + randomInt(-4, 4) + dir * i;
				const cy = baseCy + randomInt(-4, 4);
				const rx = randomInt(3, 8);
				const ry = randomInt(2, 7);
				carveGrassBlob(cx, cy, rx, ry);
			}
		};
		carveBlobGroup(leftBlobCx, blobCy, 4, -1);
		carveBlobGroup(rightBlobCx, blobCy, 5, 1);

		const pondCx = Math.max(2, leftBlobCx - 6);
		const pondCy = blobCy + 1;
		for (let y = pondCy - 2; y <= pondCy + 2; y += 1) {
			for (let x = pondCx - 2; x <= pondCx + 2; x += 1) {
				if (x < 1 || y < 1 || y >= height - 1 || x >= width - 1) continue;
				const dx = x - pondCx;
				const dy = y - pondCy;
				if (dx * dx + dy * dy <= 4 && grid[y]![x] === ",") {
					grid[y]![x] = "~";
				}
			}
		}

		const hallMinX = centerX - 1;
		const hallMaxX = centerX + 1;
		const hallStartY = height - 2;
		for (let y = doorY + 1; y <= hallStartY; y += 1) {
			for (let x = hallMinX; x <= hallMaxX; x += 1) {
				grid[y]![x] = ",";
			}
			if (hallMinX - 1 >= 0) grid[y]![hallMinX - 1] = "T";
			if (hallMaxX + 1 < width) grid[y]![hallMaxX + 1] = "T";
		}
		grid[height - 1]![centerX - 1] = ",";
		grid[height - 1]![centerX] = ",";
		grid[height - 1]![centerX + 1] = ",";

		if (barnTier === 5) {
			const pastureStartX = rect.x + rect.w;
			const pastureLeft = Math.max(pastureStartX, 1);
			const pastureRight = width - 1;
			const pastureTop = 0;
			const pastureBottom = height - 1;

			for (let y = 1; y < height - 2; y += 1) {
				for (let x = pastureLeft; x < width - 2; x += 1) {
					grid[y]![x] = ",";
				}
			}

			for (let y = pastureTop; y <= pastureBottom; y += 1) {
				grid[y]![width - 1] = "T";
				grid[y]![width - 2] = "T";
			}
			for (let x = pastureLeft; x <= pastureRight; x += 1) {
				grid[0]![x] = "T";
				grid[1]![x] = "T";
			}

			const hallXs = new Set([centerX - 1, centerX, centerX + 1]);
			for (let x = 0; x < width; x += 1) {
				if (!hallXs.has(x)) {
					grid[height - 2]![x] = "T";
					grid[height - 1]![x] = "T";
				}
			}
			grid[height - 2]![centerX + 7] = ",";
			grid[height - 2]![centerX + 8] = ",";
			grid[height - 2]![centerX + 9] = ",";
			grid[height - 1]![centerX + 7] = ",";
			grid[height - 1]![centerX + 8] = ",";
			grid[height - 1]![centerX + 9] = ",";

			const pondSize = 16;
			for (let py = 0; py < pondSize; py += 1) {
				for (let px = 0; px < pondSize; px += 1) {
					const x = width - pondSize + px;
					const y = py;
					if (x < pastureLeft || x >= width - 2) continue;
					if (y < 2 || y >= height - 2) continue;
					const distFromCorner = pondSize - 1 - px + py;
					if (distFromCorner <= pondSize - 1) {
						grid[y]![x] = "~";
					}
				}
			}

			const fountainPos = { x: 47, y: 16 };
			if (
				fountainPos.x >= pastureLeft &&
				fountainPos.x < width - 2 &&
				fountainPos.y >= 2 &&
				fountainPos.y < height - 2
			) {
				grid[fountainPos.y]![fountainPos.x] = "[";
			}

			const palmTreePositions = [
				{ x: 50, y: 11 },
				{ x: 51, y: 24 },
				{ x: 48, y: 2 },
			];
			palmTreePositions.forEach(({ x, y }) => {
				if (
					x >= pastureLeft &&
					x < width - 2 &&
					y >= 2 &&
					y < height - 2 &&
					grid[y]![x] !== "~"
				) {
					grid[y]![x] = "]";
				}
			});
		}
	}

	paintRect(grid, rect.x, rect.y, rect.w, rect.h, "#");
	paintRect(grid, rect.x + 1, rect.y + 1, interior.width, interior.height, ".");
	if (barnTier === 4) {
		grid[doorY]![centerX - 1] = ",";
		grid[doorY]![centerX] = ",";
		grid[doorY]![centerX + 1] = ",";
	} else if (barnTier == 5) {
		grid[doorY]![centerX + 7] = ",";
		grid[doorY]![centerX + 8] = ",";
		grid[doorY]![centerX + 9] = ",";
	} else {
		grid[doorY]![centerX - 1] = "+";
		grid[doorY]![centerX] = "+";
		grid[doorY]![centerX + 1] = "+";
	}
	if (isBarnExternal(barnTier)) {
		const sideDoorHeight = barnTier === 5 ? 21 : 10;
		const sideTop = Math.max(
			rect.y + 1,
			rect.y + Math.floor((rect.h - sideDoorHeight) / 2),
		);
		const sideBottom = Math.min(
			rect.y + rect.h - 2,
			sideTop + sideDoorHeight - 1,
		);
		for (let y = sideTop; y <= sideBottom; y += 1) {
			if (barnTier !== 5) {
				grid[y]![rect.x] = ".";
			}
			grid[y]![rect.x + rect.w - 1] = ".";
			for (let dx = 1; dx <= 8; dx += 1) {
				if (barnTier !== 5) {
					const leftOutsideX = rect.x - dx;
					if (leftOutsideX >= 0) grid[y]![leftOutsideX] = ",";
				}
				const rightOutsideX = rect.x + rect.w - 1 + dx;
				if (rightOutsideX < width) grid[y]![rightOutsideX] = ",";
			}
		}
	}
	if (barnTier === 5) {
		const fountainPos = { x: 47, y: 16 };
		if (
			fountainPos.x >= 0 &&
			fountainPos.x < width &&
			fountainPos.y >= 0 &&
			fountainPos.y < height
		) {
			grid[fountainPos.y]![fountainPos.x] = "[";
		}
		const palmTreePositions = [
			{ x: 50, y: 11 },
			{ x: 51, y: 24 },
			{ x: 48, y: 2 },
		];
		palmTreePositions.forEach(({ x, y }) => {
			if (x >= 0 && x < width && y >= 0 && y < height && grid[y]![x] !== "~") {
				grid[y]![x] = "]";
			}
		});
	}
	return grid.map((row) => row.join(""));
};

export const buildForestPlaceholderLayout = (): string[] => {
	const grid = Array.from({ length: FARM_HEIGHT }, () =>
		Array.from({ length: FARM_WIDTH }, () => "T"),
	);
	for (let y = 1; y < FARM_HEIGHT - 1; y += 1) {
		for (let x = 1; x < FARM_WIDTH - 1; x += 1) {
			grid[y]![x] = "G";
		}
	}
	grid[FOREST_GATE_Y]![0] = "+";
	for (let x = 1; x <= 8; x += 1) {
		grid[FOREST_GATE_Y]![x] = ",";
	}
	return grid.map((row) => row.join(""));
};

export const buildCavePlaceholderLayout = (): string[] => {
	const grid = Array.from({ length: FARM_HEIGHT }, () =>
		Array.from({ length: FARM_WIDTH }, () => "<"),
	);
	for (let y = 1; y < FARM_HEIGHT - 1; y += 1) {
		for (let x = 1; x < FARM_WIDTH - 1; x += 1) {
			grid[y]![x] = ")";
		}
	}
	grid[CAVE_GATE_Y]![FARM_WIDTH - 1] = "+";
	grid[CAVE_GATE_Y + 1]![FARM_WIDTH - 1] = "+";
	const placeholderCaveWallTiles = ["<", ">", "*"] as const;
	for (let y = 1; y < FARM_HEIGHT - 1; y += 1) {
		for (let x = 1; x <= 6; x += 1) {
			grid[y]![x] =
				placeholderCaveWallTiles[
					Math.floor(randomRoll() * placeholderCaveWallTiles.length)
				]!;
		}
	}
	return grid.map((row) => row.join(""));
};

export const buildBureaucracyOfficeLayout = (): string[] => {
	const width = 24;
	const height = 14;
	const grid = Array.from({ length: height }, () =>
		Array.from({ length: width }, () => " "),
	);
	const roomLeft = 6;
	const roomTop = 2;
	const roomRight = 17;
	const roomBottom = 11;
	for (let y = roomTop; y <= roomBottom; y += 1) {
		for (let x = roomLeft; x <= roomRight; x += 1) {
			const onWall =
				x === roomLeft || x === roomRight || y === roomTop || y === roomBottom;
			grid[y]![x] = onWall ? "#" : ".";
		}
	}
	for (let x = 9; x <= 15; x += 1) {
		grid[6]![x] = "x";
	}
	grid[BUREAUCRACY_SAVARIO_POS.y]![BUREAUCRACY_SAVARIO_POS.x] = "j";
	grid[BUREAUCRACY_EXIT_POS.y]![BUREAUCRACY_EXIT_POS.x] = " ";
	return grid.map((row) => row.join(""));
};

export const buildComputerLabLayout = (): string[] => [
	"################",
	"#..............#",
	"#.xxxxx..xxxxx.#",
	"#..............#",
	"#.xxxxx..xxxxx.#",
	"#..............#",
	"#.xxxxx..xxxxx.#",
	"#..............#",
	"#..............#",
	"#..............#",
	"#######+########",
];

export const mapLayouts: Record<MapId, string[]> = {
	farm: buildFarmLayout(1),
	house: [
		"###############",
		"#U...........w#",
		"#.............#",
		"#d............#",
		"#.............#",
		"#......+......#",
		"###############",
	],
	barn: buildBarnLayout(1),
	town: buildTownLayout(),
	aquarium: buildAquariumLayout(),
	forest: buildForestPlaceholderLayout(),
	cave: buildCavePlaceholderLayout(),
	computer_lab: buildComputerLabLayout(),
	bureaucracy_office: buildBureaucracyOfficeLayout(),
	seed_shop: buildShopLayout(),
	feed_shop: buildShopLayout(),
	animal_shop: buildShopLayout(),
	market_shop: buildShopLayout(),
	tool_shop: [
		"###############",
		"#.............#",
		"#.....j.b.....#",
		"#xxxxxxxxxxxxx#",
		"#.............#",
		"#.............#",
		"#.............#",
		"#......+......#",
		"###############",
	],
	clothing_shop: buildShopLayout(),
	cafe_shop: buildCafeShopLayout(),
};

export const mapTiles: Record<MapId, Tile[][]> = Object.fromEntries(
	(Object.keys(mapLayouts) as MapId[]).map((mapId) => {
		const rows = mapLayouts[mapId].map((row) =>
			row.split("").map((c) => {
				if (c === " ") return { icon: " ", passable: false, label: "Void" };
				if (c === "#") return wall;
				if (c === ".") return floor;
				if (c === ",") return grass;
				if (c === "=") return path;
				if (c === ")") return { icon: c, passable: true, label: "Cave Floor" };
				if (c === ":") return sand;
				if (c === ";") return soil;
				if (c === "~") return water;
				if (c === "\u0192")
					return { icon: c, passable: false, label: "Aquarium Fresh Water" };
				if (c === "\u00A2")
					return { icon: c, passable: false, label: "Aquarium Salt Water" };
				if (c === "\u00A4")
					return { icon: c, passable: false, label: "Aquarium Cave Water" };
				if (c === "\u00C4")
					return { icon: c, passable: false, label: "Aquarium Anchor" };
				if (c === "\u00C5")
					return { icon: c, passable: false, label: "Aquarium Rock" };
				if (c === "\u00C6")
					return { icon: c, passable: false, label: "Aquarium Wood" };
				if (c === "\u00B1")
					return { icon: c, passable: false, label: "Aquarium Freshwater Floor" };
				if (c === "\u00B5")
					return { icon: c, passable: false, label: "Aquarium Saltwater Floor" };
				if (c === "_") return { icon: "_", passable: true, label: "Gravel" };
				if (c === "^")
					return { icon: "^", passable: true, label: "Forest Gap" };
				if (c === "<" || c === ">" || c === "*") {
					return { icon: c, passable: false, label: "Cave Wall" };
				}
				if (c === "/") return { icon: c, passable: true, label: "Ladder" };
				if (c === "U") return { icon: "U", passable: false, label: "Bath" };
				if (c === "T")
					return { icon: "T", passable: false, label: "Pine Tree" };
				if (c === "G") return { icon: "G", passable: false, label: "Tree" };
				if (c === "O") return { icon: "O", passable: false, label: "Rock" };
				if (c === "+") return { icon: "+", passable: true, label: "Door" };
				if (c === "d") return { icon: "d", passable: false, label: "Bed" };
				if (c === "w") return { icon: "w", passable: false, label: "Wardrobe" };
				if (
					c === "R" ||
					c === "W" ||
					c === "g" ||
					c === "(" ||
					c === "-" ||
					c === '"' ||
					c === "\u00A7" ||
					c === COMPUTER_LAB_ROOF_PURPLE_TILE ||
					c === COMPUTER_LAB_ROOF_DARK_TILE
				) {
					return { icon: c, passable: false, label: "Roof" };
				}
				if (c === "l") return { icon: c, passable: false, label: "Window" };
				if (c === "x") return { icon: "x", passable: false, label: "Counter" };
				if (c === "\u00D9")
					return { icon: c, passable: false, label: "Trophy Display" };
				if (c === "\u00DB")
					return { icon: c, passable: false, label: "Stone Trade Machine" };
				if (c === "h") return { icon: "h", passable: false, label: "Chair" };
				if (c === "j")
					return { icon: "j", passable: false, label: "Shopkeeper" };
				if (c === "b") return { icon: "b", passable: false, label: "Builder" };
				if ("sfa$tck".includes(c))
					return { icon: c, passable: false, label: "Shop Sign" };
				if (/[A-Z]/.test(c))
					return { icon: c, passable: false, label: "Structure" };
				return floor;
			}),
		);
		return [mapId, rows];
	}),
) as Record<MapId, Tile[][]>;
