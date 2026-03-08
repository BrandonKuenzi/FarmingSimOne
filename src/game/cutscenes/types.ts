import type { ItemId } from "../shared/types";

export type SideViewBgmId =
	| "none"
	| "area_default"
	| "farm"
	| "town"
	| "forest"
	| "cave"
	| "space_bg"
	| "space_store"
	| "battle"
	| "theme_song";

export type SideViewSfxId =
	| "notification"
	| "reward"
	| "water"
	| "whoosh"
	| "bad"
	| "munch"
	| "hoe"
	| "yaya"
	| "snake"
	| "bear"
	| "poo"
	| "bath"
	| "pluck"
	| "ploop"
	| "sigh"
	| "badWater6";

export type SideViewReward =
	| {
			kind: "item";
			itemId: ItemId;
			amount: number;
			label?: string;
	  }
	| {
			kind: "money";
			amount: number;
			label?: string;
	  }
	| {
			kind: "stamina";
			amount: number;
			label?: string;
	  };

export type SideViewAnimationId =
	| "bobble"
	| "bobbleLooping"
	| "squish"
	| "squishLooping"
	| "stretch"
	| "stretchLooping"
	| "moveLeft"
	| "moveRight"
	| "moveUp"
	| "moveDown";

export type SideViewFrameAction =
	| {
			type: "animation";
			targetActorId: string;
			animation: SideViewAnimationId;
			tiles?: number;
			seconds?: number;
			durationMs?: number;
	  }
	| {
			type: "toast";
			message: string;
			durationMs?: number;
			delayMs?: number;
			targetActorId?: string;
			targetTile?: { x: number; y: number };
	  }
	| {
			type: "sfx";
			sfxId: SideViewSfxId;
	  }
	| {
			type: "reward";
			rewards: SideViewReward[];
	  }
	| {
			type: "setPlayerName";
			playerName?: string;
			generateRandom?: boolean;
	  }
	| {
			type: "grantProgressStone";
			kind: "target" | "algorithm" | "money";
			stoneId: string;
			label?: string;
	  }
	| {
			type: "setPlayerOutfit";
			look: string;
			addToWardrobe?: boolean;
			targetActorId?: string;
	  }
	| {
			type: "mapFade";
			opacity: number;
			durationMs: number;
	  };

export type SideViewFrame = {
	id?: string;
	durationMs: number;
	storyText?: string;
	autoProgress?: boolean;
	actions?: SideViewFrameAction[];
};

export type SideViewTileDef = {
	glyph?: string;
	bg: string;
	fg?: string;
};

export type SideViewMap = {
	rows: string[];
	legend: Record<string, SideViewTileDef>;
};

export type SideViewActorDef = {
	id: string;
	glyph: string;
	x: number;
	y: number;
	zIndex?: number;
	fg?: string;
	scale?: number;
};

export type SideViewSubScene = {
	id: string;
	usePreviousMap?: boolean;
	map?: SideViewMap;
	actors: SideViewActorDef[];
	frames: SideViewFrame[];
	bgm?: SideViewBgmId;
	inputLockMs?: number;
};

export type SideViewVariables = Record<string, string | number | boolean>;

export type SideViewCutscene = {
	id: string;
	subScenes: SideViewSubScene[];
	onCompleteRewards?: SideViewReward[];
	variables?: SideViewVariables;
};

export type ResolvedSideViewSubScene = Omit<SideViewSubScene, "map" | "usePreviousMap" | "inputLockMs"> & {
	map: SideViewMap;
	inputLockMs: number;
	totalDurationMs: number;
};

export type ResolvedSideViewCutscene = Omit<SideViewCutscene, "subScenes"> & {
	subScenes: ResolvedSideViewSubScene[];
};

export type SideViewRuntimeLoopAnimation = "bobbleLooping" | "squishLooping" | "stretchLooping";
export type SideViewRuntimeOneShotAnimation = "bobble" | "squish" | "stretch";

export type SideViewRuntimeActor = SideViewActorDef & {
	moveDurationMs: number;
	loopAnimation: SideViewRuntimeLoopAnimation | null;
	oneShotAnimation: SideViewRuntimeOneShotAnimation | null;
	oneShotKey: number;
};

export type SideViewRuntimeToast = {
	id: number;
	message: string;
	durationMs: number;
	delayMs?: number;
	targetActorId?: string;
	targetTile?: { x: number; y: number };
};

export type SideViewSceneRuntime = {
	active: boolean;
	cutsceneId: string;
	subSceneIndex: number;
	subScene: ResolvedSideViewSubScene;
	mapOpacity: number;
	mapFadeDurationMs: number;
	frameStoryText: string;
	currentFrameAutoProgress: boolean;
	actors: Record<string, SideViewRuntimeActor>;
	toasts: SideViewRuntimeToast[];
	contentDone: boolean;
	inputUnlockAtMs: number;
	readyArrowVisible: boolean;
};
