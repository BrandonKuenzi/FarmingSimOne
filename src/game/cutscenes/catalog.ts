import type {
	SideViewActorDef,
	SideViewBgmId,
	SideViewCutscene,
	SideViewMap,
} from "./types";

const GLYPH_HOST = "\u{1F9D1}\u{200D}\u{1F33E}";
const GLYPH_PLAYER = "\u{1F642}";
const GLYPH_SPARK = "\u{2728}";
const GLYPH_MOON = "\u{1F319}";
const GLYPH_GIFT = "\u{1F381}";
const GLYPH_COW = "\u{1F404}";
const GLYPH_SHEEP = "\u{1F411}";
const GLYPH_NERD = "\u{1F913}";
const GLYPH_BEAR = "\u{1F43B}";
const GLYPH_COWBOY = "\u{1F920}";
const GLYPH_SHARK = "\u{1F988}";
const GLYPH_DECIDUOUS_TREE = "\u{1F333}";
const GLYPH_PINE_TREE = "\u{1F332}";
const GLYPH_TRACTOR = "\u{1F69C}";
const GLYPH_HOUSE = "\u{1F3E0}";
const GLYPH_PALM_TREE = "\u{1F334}";

const defaultLegend = {
	".": { glyph: " ", bg: "#63b3ff" },
	c: { glyph: "~", bg: "#63b3ff", fg: "#f8fbff" },
	S: { glyph: "o", bg: "#63b3ff", fg: "#ffd166" },
	M: { glyph: "o", bg: "#1b2a41", fg: "#f1f4ff" },
	T: { glyph: "^", bg: "#63b3ff", fg: "#2d6a4f" },
	f: { glyph: "*", bg: "#63b3ff", fg: "#ff5d8f" },
	g: { glyph: " ", bg: "#3fa34d" },
	r: { glyph: " ", bg: "#c49a6c" },
	d: { glyph: " ", bg: "#7f5539" },
	w: { glyph: "~", bg: "#1d4e89", fg: "#d9edff" },
	b: { glyph: ".", bg: "#e8d8a8", fg: "#f8f3dc" },
	p: { glyph: "#", bg: "#6f4e37", fg: "#d6b98a" },
	l: { glyph: "|", bg: "#7f8c8d", fg: "#f1c40f" },
	a: { glyph: ".", bg: "#2d3748", fg: "#9ca3af" },
	G: { glyph: "|", bg: "#1f3b4d", fg: "#7dd3fc" },
	B: { glyph: "o", bg: "#1f3b4d", fg: "#dbeafe" },
	x: { glyph: "v", bg: "#111827", fg: "#6b7280" },
	k: { glyph: " ", bg: "#1f2937", fg: "#9ca3af" },
	v: { glyph: ".", bg: "#2f2a24", fg: "#7c6f64" },
	n: { glyph: " ", bg: "#000000" },
};

export type SideViewBackgroundId =
	| "farm"
	| "town"
	| "forest"
	| "aquarium"
	| "beach"
	| "cave";

const cloneMap = (map: SideViewMap): SideViewMap => ({
	rows: [...map.rows],
	legend: { ...map.legend },
});

const SIDEVIEW_BACKGROUNDS: Record<SideViewBackgroundId, SideViewMap> = {
	farm: {
		rows: [
			"..c....S....",
			".....c......",
			"...f....T...",
			"............",
			"gggggggggggg",
			"dddddddddddd",
		],
		legend: defaultLegend,
	},
	town: {
		rows: [
			"..c....S....",
			"......c.....",
			"............",
			"............",
			"gggggggggggg",
			"wwwwwwwwwwww",
		],
		legend: defaultLegend,
	},
	forest: {
		rows: [
			"..c....c....",
			".T...T...T..",
			"..f....f....",
			"............",
			"gggggggggggg",
			"dddddddddddd",
		],
		legend: defaultLegend,
	},
	aquarium: {
		rows: [
			".GGGGGGGGGG.",
			".G........G.",
			".G...B..B.G.",
			".GGGGGGGGGG.",
			"aaaaaaaaaaaa",
			"dddddddddddd",
		],
		legend: defaultLegend,
	},
	beach: {
		rows: [
			"..c....S....",
			".....c......",
			"............",
			"............",
			"bbbbbbbbbbbb",
			"wwwwwwwwwwww",
		],
		legend: defaultLegend,
	},
	cave: {
		rows: [
			"xxxxxxxxxxxx",
			"xnnnnnnnnnnx",
			"xnnnnnnnnnnx",
			"xnnnnnnnnnnx",
			"vvvvvvvvvvvv",
			"dddddddddddd",
		],
		legend: defaultLegend,
	},
};

export const getSideViewBackground = (
	backgroundId: SideViewBackgroundId,
): SideViewMap => {
	const map = SIDEVIEW_BACKGROUNDS[backgroundId];
	return cloneMap(map);
};

const randomBoolean = () => Math.random() >= 0.5;

export const getSideViewBackgroundActors = (
	backgroundId: SideViewBackgroundId,
): SideViewActorDef[] => {
	if (backgroundId === "farm") {
		return [
			{
				id: "bg-farm-tree",
				glyph: GLYPH_DECIDUOUS_TREE,
				x: 2,
				y: 3,
				zIndex: 1,
			},
			{ id: "bg-farm-tractor", glyph: GLYPH_TRACTOR, x: 9, y: 3, zIndex: 1 },
		];
	}
	if (backgroundId === "town") {
		return [
			{ id: "bg-town-house-1", glyph: GLYPH_HOUSE, x: 1, y: 3, zIndex: 1 },
			{ id: "bg-town-house-2", glyph: GLYPH_HOUSE, x: 4, y: 3, zIndex: 1 },
			{ id: "bg-town-house-3", glyph: GLYPH_HOUSE, x: 7, y: 3, zIndex: 1 },
			{ id: "bg-town-house-4", glyph: GLYPH_HOUSE, x: 10, y: 3, zIndex: 1 },
		];
	}
	if (backgroundId === "forest") {
		return Array.from({ length: 12 }, (_, x) => ({
			id: `bg-forest-tree-${x}`,
			glyph: randomBoolean() ? GLYPH_DECIDUOUS_TREE : GLYPH_PINE_TREE,
			x,
			y: 3,
			zIndex: 1,
		}));
	}
	if (backgroundId === "beach") {
		return [
			{ id: "bg-beach-palm", glyph: GLYPH_PALM_TREE, x: 9, y: 3, zIndex: 1 },
		];
	}
	return [];
};

export const buildBackgroundExampleCutscene = (args: {
	backgroundId: SideViewBackgroundId;
	label: string;
	description: string;
	bgm: SideViewBgmId;
}): SideViewCutscene => ({
	id: `debug_background_${args.backgroundId}`,
	variables: {
		label: args.label,
		description: args.description,
	},
	subScenes: [
		{
			id: `${args.backgroundId}_background`,
			map: getSideViewBackground(args.backgroundId),
			actors: [
				...getSideViewBackgroundActors(args.backgroundId),
				{ id: "player", glyph: GLYPH_PLAYER, x: 4, y: 4 },
				{ id: "guide", glyph: GLYPH_HOST, x: 7, y: 4 },
			],
			bgm: args.bgm,
			frames: [
				{
					durationMs: 1000,
					actions: [
						{
							type: "animation",
							targetActorId: "guide",
							animation: "bobbleLooping",
						},
						{
							type: "toast",
							targetActorId: "guide",
							message: "{{label}} background demo",
						},
					],
				},
				{
					durationMs: 1000,
					actions: [
						{
							type: "toast",
							targetActorId: "player",
							message: "{{description}}",
						},
					],
				},
			],
		},
	],
});

export const buildNewGameRulesCutscene = (args: {
	startItemLabel: string;
	startItemGlyph: string;
	ruleLineA: string;
	ruleLineB: string;
}): SideViewCutscene => ({
	id: "new_game_rules_intro",
	variables: {
		startItemLabel: args.startItemLabel,
		startItemGlyph: args.startItemGlyph,
		ruleLineA: args.ruleLineA,
		ruleLineB: args.ruleLineB,
		PLAYER_NAME: "Player",
		TARGET_STONE_NAME: "Profit Stone",
		TARGET_STONE_ID: "money_gained",
		ALGO_STONE_NAME: "+1 Stone",
		ALGO_STONE_ID: "add_1",
		ALGO_STONE_RARITY_LABEL: "common",
		COSTUME_NAME: GLYPH_PLAYER,
		COSTUME_LOOK: GLYPH_PLAYER,
	},
	subScenes: [
		{
			id: "arrival",
			map: {
				...getSideViewBackground("farm"),
			},
			actors: [
				{ id: "player", glyph: GLYPH_PLAYER, x: 5, y: 0 },
				{ id: "cow", glyph: GLYPH_COW, x: 20, y: 4 },
				{ id: "sheep", glyph: GLYPH_SHEEP, x: 21, y: 4 },
				{ id: "nerd", glyph: GLYPH_NERD, x: 22, y: 4 },
				{ id: "bear", glyph: GLYPH_BEAR, x: 23, y: 4 },
				{ id: "cowboy", glyph: GLYPH_COWBOY, x: 24, y: 4 },
				{ id: "shark", glyph: GLYPH_SHARK, x: 25, y: 4 },
			],
			bgm: "theme_song",
			frames: [
				{
					id: "f01",
					durationMs: 2500,
					autoProgress: true,
					storyText: "Welcome to the farm, Player!",
					actions: [
						{
							type: "animation",
							targetActorId: "player",
							animation: "moveDown",
							tiles: 4,
							seconds: 0.25,
						},
						{
							type: "toast",
							targetActorId: "player",
							message: "Hi!",
							durationMs: 1000,
							delayMs: 1500,
						},
					],
				},
				{
					id: "f02",
					durationMs: 3500,
					autoProgress: true,
					storyText: "What kind of run will this be? Lets find out!",
					actions: [
						{
							type: "toast",
							targetActorId: "player",
							message: "Im so excited!",
							durationMs: 1250,
							delayMs: 1000,
						},
						{
							type: "animation",
							targetActorId: "player",
							animation: "bobbleLooping",
						},
					],
				},
				{
					id: "f03",
					durationMs: 3500,
					autoProgress: true,
					storyText: "",
					actions: [
						{
							type: "toast",
							targetActorId: "player",
							message: "Excuse me, but... Who am I?",
							durationMs: 2250,
						},
					],
				},
				{
					id: "f04",
					durationMs: 4500,
					autoProgress: true,
					storyText: "Great question. Let's pick a name!",
					actions: [
						{
							type: "toast",
							targetActorId: "player",
							message: "Yay!",
							durationMs: 1250,
							delayMs: 2000,
						},
					],
				},
				{
					id: "f05",
					durationMs: 4500,
					autoProgress: true,
					storyText: "Randomizing....",
					actions: [
						{ type: "setPlayerName", playerName: "{{PLAYER_NAME}}" },
						{ type: "sfx", sfxId: "badWater6" },
					],
				},
				{
					id: "f06",
					durationMs: 4500,
					autoProgress: true,
					storyText: "Picked you a name! You will be playing as...",
					actions: [
						{ type: "sfx", sfxId: "reward" },
						{
							type: "toast",
							targetActorId: "player",
							message: "Tell me! Tell me!",
							durationMs: 2250,
							delayMs: 2000,
						},
						{
							type: "animation",
							targetActorId: "player",
							animation: "stretch",
						},
					],
				},
				{
					id: "f07",
					durationMs: 4500,
					autoProgress: true,
					storyText: "{{PLAYER_NAME}}! What a great name!",
					actions: [
						{
							type: "toast",
							targetActorId: "player",
							message: "Great name!",
							durationMs: 2250,
							delayMs: 2000,
						},
						{
							type: "animation",
							targetActorId: "player",
							animation: "bobbleLooping",
						},
					],
				},
				{
					id: "f08",
					durationMs: 4500,
					autoProgress: true,
					storyText:
						"Well {{PLAYER_NAME}}, the NPCs are going to pick a starting occupation for you! They will gift you 2 stones!",
					actions: [
						{
							type: "animation",
							targetActorId: "cow",
							animation: "moveLeft",
							tiles: 13,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "sheep",
							animation: "moveLeft",
							tiles: 13,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "nerd",
							animation: "moveLeft",
							tiles: 13,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "bear",
							animation: "moveLeft",
							tiles: 13,
							seconds: 4.5,
						},
					],
				},
				{
					id: "f09",
					durationMs: 4500,
					autoProgress: true,
					storyText: "Randomizing...",
					actions: [
						{
							type: "toast",
							targetActorId: "nerd",
							message: "Which ones...",
							durationMs: 1000,
						},
						{
							type: "toast",
							targetActorId: "sheep",
							message: "Thinking...",
							durationMs: 1000,
							delayMs: 1000,
						},
						{
							type: "toast",
							targetActorId: "bear",
							message: "Hmmm...",
							durationMs: 1000,
							delayMs: 2000,
						},
						{
							type: "toast",
							targetActorId: "cow",
							message: "I know!",
							durationMs: 1250,
							delayMs: 3000,
						},
						{
							type: "animation",
							targetActorId: "cow",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "sheep",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "nerd",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "bear",
							animation: "bobbleLooping",
						},
						{ type: "sfx", sfxId: "badWater6" },
					],
				},
				{
					id: "f10",
					durationMs: 5000,
					autoProgress: true,
					storyText:
						"They gave you: \n \n{{TARGET_STONE_NAME}}\n \n{{ALGO_STONE_NAME}} ({{ALGO_STONE_RARITY_LABEL}})",
					actions: [
						{
							type: "grantProgressStone",
							kind: "target",
							stoneId: "{{TARGET_STONE_ID}}",
							label: "{{TARGET_STONE_NAME}}",
						},
						{
							type: "grantProgressStone",
							kind: "algorithm",
							stoneId: "{{ALGO_STONE_ID}}",
							label: "{{ALGO_STONE_NAME}}",
						},
						{
							type: "toast",
							targetActorId: "nerd",
							message: "Those are good stones!",
							durationMs: 2250,
							delayMs: 2000,
						},
						{
							type: "animation",
							targetActorId: "cow",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "sheep",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "nerd",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "bear",
							animation: "bobbleLooping",
						},
					],
				},
				{
					id: "f11",
					durationMs: 4000,
					autoProgress: true,
					storyText: "Um... The NPCs have one request though.",
					actions: [
						{
							type: "toast",
							targetActorId: "player",
							message: "?",
							durationMs: 2250,
							delayMs: 2000,
						},
					],
				},
				{
					id: "f12",
					durationMs: 4500,
					autoProgress: true,
					storyText:
						"The NPCs dont like your outfit. The want to give you something new to wear.",
					actions: [
						{
							type: "toast",
							targetActorId: "sheep",
							message: "You look baaad!",
							durationMs: 1000,
							delayMs: 2000,
						},
						{
							type: "toast",
							targetActorId: "bear",
							message: "I cant bear it!",
							durationMs: 1000,
							delayMs: 3000,
						},
						{ type: "sfx", sfxId: "bad" },
						{ type: "animation", targetActorId: "player", animation: "squish" },
					],
				},
				{
					id: "f13",
					durationMs: 4500,
					autoProgress: true,
					storyText: "Picking a starting outfit...",
					actions: [
						{
							type: "toast",
							targetActorId: "player",
							message: "OK...",
							durationMs: 2250,
							delayMs: 2000,
						},
						{ type: "sfx", sfxId: "badWater6" },
					],
				},
				{
					id: "f14",
					durationMs: 2500,
					autoProgress: true,
					storyText: "The NPCs dressed you up in the {{COSTUME_NAME}} outfit!",
					actions: [
						{
							type: "setPlayerOutfit",
							look: "{{COSTUME_LOOK}}",
							addToWardrobe: true,
							targetActorId: "player",
						},
						{
							type: "animation",
							targetActorId: "cow",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "sheep",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "nerd",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "bear",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "player",
							animation: "bobbleLooping",
						},
						{
							type: "toast",
							targetActorId: "nerd",
							message: "Looking sharp!",
							durationMs: 2500,
							delayMs: 1000,
						},
					],
				},
				{
					id: "f15",
					durationMs: 4500,
					autoProgress: true,
					storyText: "One last part: Pick the ending.",
					actions: [
						{
							type: "animation",
							targetActorId: "cow",
							animation: "moveLeft",
							tiles: 1,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "sheep",
							animation: "moveLeft",
							tiles: 1,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "nerd",
							animation: "moveLeft",
							tiles: 1,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "bear",
							animation: "moveLeft",
							tiles: 1,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "cowboy",
							animation: "moveLeft",
							tiles: 14,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "shark",
							animation: "moveLeft",
							tiles: 14,
							seconds: 4.5,
						},
						{
							type: "toast",
							targetActorId: "bear",
							message: "This is the good part",
							durationMs: 2250,
							delayMs: 2000,
						},
					],
				},
				{
					id: "f16",
					durationMs: 4500,
					autoProgress: true,
					storyText: "Randomizing...",
					actions: [
						{ type: "sfx", sfxId: "badWater6" },
						{
							type: "animation",
							targetActorId: "cow",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "sheep",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "nerd",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "bear",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "cowboy",
							animation: "bobbleLooping",
						},
						{
							type: "animation",
							targetActorId: "shark",
							animation: "bobbleLooping",
						},
						{
							type: "toast",
							targetActorId: "sheep",
							message: "I hope we get a good one!",
							durationMs: 2250,
							delayMs: 2000,
						},
						{ type: "mapFade", opacity: 0.5, durationMs: 1500 },
					],
				},
				{
					id: "f17",
					durationMs: 4500,
					autoProgress: true,
					storyText: "YOUR FATE HAS BEEN SEALED!",
					actions: [
						{ type: "sfx", sfxId: "reward" },
						{ type: "animation", targetActorId: "sheep", animation: "squish" },
						{
							type: "animation",
							targetActorId: "cowboy",
							animation: "bobbleLooping",
						},
						{ type: "animation", targetActorId: "shark", animation: "stretch" },
						{
							type: "animation",
							targetActorId: "cow",
							animation: "bobbleLooping",
						},
						{
							type: "toast",
							targetActorId: "sheep",
							message: "WOW!",
							durationMs: 2250,
							delayMs: 500,
						},
						{
							type: "toast",
							targetActorId: "shark",
							message: "Thats a good one!",
							durationMs: 2250,
							delayMs: 1000,
						},
						{
							type: "toast",
							targetActorId: "nerd",
							message: "Wow!",
							durationMs: 1000,
							delayMs: 1500,
						},
						{
							type: "toast",
							targetActorId: "player",
							message: "?",
							durationMs: 3000,
						},
						{ type: "mapFade", opacity: 1, durationMs: 1000 },
					],
				},

				{
					id: "f18",
					durationMs: 4500,
					autoProgress: true,
					storyText: "That's it! Ready to play, {{PLAYER_NAME}}?",
					actions: [
						{
							type: "animation",
							targetActorId: "cow",
							animation: "moveRight",
							tiles: 20,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "sheep",
							animation: "moveRight",
							tiles: 20,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "nerd",
							animation: "moveRight",
							tiles: 20,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "bear",
							animation: "moveRight",
							tiles: 20,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "cowboy",
							animation: "moveRight",
							tiles: 20,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "shark",
							animation: "moveRight",
							tiles: 20,
							seconds: 4.5,
						},
						{
							type: "animation",
							targetActorId: "player",
							animation: "bobbleLooping",
						},
					],
				},
				{
					id: "f19",
					durationMs: 3500,
					autoProgress: true,
					storyText: "To find out what happens when the progress bar fills..",
					actions: [
						{
							type: "animation",
							targetActorId: "player",
							animation: "moveRight",
							tiles: 10,
							seconds: 1.5,
						},
						{ type: "mapFade", opacity: 0, durationMs: 1500 },
					],
				},
				{
					id: "f20",
					durationMs: 2500,
					autoProgress: true,
					storyText: "Fill the progress bar!",
					actions: [],
				},
			],
		},
	],
});

export const buildMidGameBonusCutscene = (args: {
	title: string;
	rewardLabel?: string;
	rewardGlyph?: string;
}): SideViewCutscene => ({
	id: "mid_game_bonus",
	variables: {
		title: args.title,
		rewardLabel: args.rewardLabel ?? "",
		rewardGlyph: args.rewardGlyph ?? GLYPH_GIFT,
	},
	subScenes: [
		{
			id: "bonus_moment",
			map: {
				...getSideViewBackground("beach"),
			},
			actors: [
				{ id: "player", glyph: GLYPH_PLAYER, x: 4, y: 3 },
				{ id: "event", glyph: "{{rewardGlyph}}", x: 8, y: 3 },
			],
			bgm: "town",
			frames: [
				{
					durationMs: 1200,
					actions: [
						{ type: "toast", targetActorId: "event", message: "{{title}}" },
						{ type: "animation", targetActorId: "event", animation: "stretch" },
					],
				},
				{
					durationMs: 900,
					actions: args.rewardLabel
						? [
								{
									type: "toast",
									message: "Bonus: {{rewardLabel}}",
									targetActorId: "event",
								},
								{ type: "sfx", sfxId: "reward" },
							]
						: [{ type: "sfx", sfxId: "notification" }],
				},
			],
		},
	],
});

export const buildEndGameSummaryCutscene = (args: {
	days: number;
	totalEarned: number;
	bestDepth: number;
	favoriteLine: string;
}): SideViewCutscene => ({
	id: "end_game_summary",
	variables: {
		days: args.days,
		totalEarned: args.totalEarned,
		bestDepth: args.bestDepth,
		favoriteLine: args.favoriteLine,
	},
	subScenes: [
		{
			id: "ending_overview",
			map: {
				...getSideViewBackground("town"),
			},
			actors: [
				{ id: "player", glyph: GLYPH_PLAYER, x: 5, y: 4 },
				{ id: "moon", glyph: GLYPH_MOON, x: 9, y: 1 },
			],
			bgm: "space_bg",
			frames: [
				{
					durationMs: 1100,
					actions: [
						{
							type: "toast",
							targetActorId: "moon",
							message: "Day {{days}} complete.",
						},
					],
				},
				{
					durationMs: 1100,
					actions: [
						{
							type: "toast",
							targetActorId: "player",
							message: "Total earned: ${{totalEarned}}",
						},
						{
							type: "toast",
							targetActorId: "player",
							message: "Best depth: {{bestDepth}}",
						},
					],
				},
			],
		},
		{
			id: "ending_quote",
			usePreviousMap: true,
			actors: [
				{ id: "player", glyph: GLYPH_PLAYER, x: 5, y: 4 },
				{ id: "spark", glyph: GLYPH_SPARK, x: 7, y: 3 },
			],
			bgm: "space_bg",
			frames: [
				{
					durationMs: 1200,
					actions: [
						{
							type: "animation",
							targetActorId: "spark",
							animation: "bobbleLooping",
						},
						{
							type: "toast",
							targetActorId: "spark",
							message: "{{favoriteLine}}",
						},
					],
				},
				{
					durationMs: 1000,
					actions: [{ type: "sfx", sfxId: "sigh" }],
				},
			],
		},
	],
});
