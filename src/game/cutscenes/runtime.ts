import type {
	ResolvedSideViewSubScene,
	SideViewFrame,
	SideViewFrameAction,
	SideViewReward,
	SideViewRuntimeActor,
	SideViewRuntimeLoopAnimation,
	SideViewRuntimeOneShotAnimation,
	SideViewRuntimeToast,
	SideViewSfxId,
} from "./types";
import { generateName } from "../systems/generateName";

const LOOP_SET = new Set<SideViewRuntimeLoopAnimation>([
	"bobbleLooping",
	"squishLooping",
	"stretchLooping",
]);
const ONE_SHOT_SET = new Set<SideViewRuntimeOneShotAnimation>([
	"bobble",
	"squish",
	"stretch",
]);

export const createInitialRuntimeActors = (
	subScene: ResolvedSideViewSubScene,
): Record<string, SideViewRuntimeActor> => {
	const actors: Record<string, SideViewRuntimeActor> = {};
	subScene.actors.forEach((actor) => {
		actors[actor.id] = {
			...actor,
			// Keep a non-zero transition from the first paint so frame-1 moves animate
			// instead of snapping when position and duration change in the same commit.
			moveDurationMs: 1,
			loopAnimation: null,
			oneShotAnimation: null,
			oneShotKey: 0,
		};
	});
	return actors;
};

const toMoveDurationMs = (
	action: Extract<SideViewFrameAction, { type: "animation" }>,
	frameDurationMs: number,
): number => {
	if (typeof action.durationMs === "number" && action.durationMs > 0) return action.durationMs;
	if (typeof action.seconds === "number" && action.seconds > 0) {
		return Math.floor(action.seconds * 1000);
	}
	return Math.max(250, Math.floor(frameDurationMs * 0.85));
};

const toMoveTiles = (action: Extract<SideViewFrameAction, { type: "animation" }>): number => {
	if (typeof action.tiles === "number" && Number.isFinite(action.tiles)) {
		return Math.max(0, Math.floor(Math.abs(action.tiles)));
	}
	return 1;
};

export const applyFrameActionsToRuntime = (args: {
	actors: Record<string, SideViewRuntimeActor>;
	frame: SideViewFrame;
	nextToastId: number;
}): {
	actors: Record<string, SideViewRuntimeActor>;
	toasts: SideViewRuntimeToast[];
	sfx: SideViewSfxId[];
	rewards: SideViewReward[];
	playerName: string | null;
	progressStoneGrants: Array<{
		kind: "target" | "algorithm";
		stoneId: string;
		label?: string;
	}>;
	playerOutfit: {
		look: string;
		addToWardrobe: boolean;
		targetActorId: string;
	} | null;
	mapFade: {
		opacity: number;
		durationMs: number;
	} | null;
	nextToastId: number;
} => {
	// Frame-local animation state: loops/one-shots should not leak into later frames
	// unless explicitly re-applied in that frame.
	let nextActors = Object.fromEntries(
		Object.entries(args.actors).map(([id, actor]) => [
			id,
			{
				...actor,
				loopAnimation: null,
				oneShotAnimation: null,
			},
		]),
	) as Record<string, SideViewRuntimeActor>;
	const toasts: SideViewRuntimeToast[] = [];
	const sfx: SideViewSfxId[] = [];
	const rewards: SideViewReward[] = [];
	let playerName: string | null = null;
	const progressStoneGrants: Array<{
		kind: "target" | "algorithm";
		stoneId: string;
		label?: string;
	}> = [];
	let playerOutfit: {
		look: string;
		addToWardrobe: boolean;
		targetActorId: string;
	} | null = null;
	let mapFade: {
		opacity: number;
		durationMs: number;
	} | null = null;
	let nextToastId = args.nextToastId;

	for (const action of args.frame.actions ?? []) {
		if (action.type === "sfx") {
			sfx.push(action.sfxId);
			continue;
		}
		if (action.type === "reward") {
			rewards.push(...action.rewards);
			continue;
		}
		if (action.type === "setPlayerName") {
			if (action.generateRandom) {
				playerName = generateName();
			} else if (action.playerName?.trim()) {
				playerName = action.playerName.trim();
			}
			continue;
		}
		if (action.type === "grantProgressStone") {
			if (!action.stoneId.trim()) continue;
			progressStoneGrants.push({
				kind: action.kind,
				stoneId: action.stoneId.trim(),
				label: action.label?.trim(),
			});
			continue;
		}
		if (action.type === "setPlayerOutfit") {
			const look = action.look.trim();
			if (!look) continue;
			const targetActorId = action.targetActorId?.trim() || "player";
			const actor = nextActors[targetActorId];
			if (actor) {
				nextActors = {
					...nextActors,
					[targetActorId]: {
						...actor,
						glyph: look,
					},
				};
			}
			playerOutfit = {
				look,
				addToWardrobe: action.addToWardrobe !== false,
				targetActorId,
			};
			continue;
		}
		if (action.type === "mapFade") {
			mapFade = {
				opacity: Math.max(0, Math.min(1, action.opacity)),
				durationMs: Math.max(0, Math.floor(action.durationMs)),
			};
			continue;
		}
		if (action.type === "toast") {
			const baseDurationMs = action.durationMs ?? 1800;
			toasts.push({
				id: nextToastId++,
				message: action.message,
				durationMs: baseDurationMs * 2,
				delayMs: Math.max(0, action.delayMs ?? 0),
				targetActorId: action.targetActorId,
				targetTile: action.targetTile,
			});
			continue;
		}

		const actor = nextActors[action.targetActorId];
		if (!actor) continue;
		const patched: SideViewRuntimeActor = { ...actor };
		if (LOOP_SET.has(action.animation as SideViewRuntimeLoopAnimation)) {
			patched.loopAnimation = action.animation as SideViewRuntimeLoopAnimation;
		}
		if (ONE_SHOT_SET.has(action.animation as SideViewRuntimeOneShotAnimation)) {
			patched.oneShotAnimation = action.animation as SideViewRuntimeOneShotAnimation;
			patched.oneShotKey = actor.oneShotKey + 1;
		}

		const tiles = toMoveTiles(action);
		const durationMs = toMoveDurationMs(action, args.frame.durationMs);
		if (action.animation === "moveLeft") {
			patched.x = patched.x - tiles;
			patched.moveDurationMs = durationMs;
		}
		if (action.animation === "moveRight") {
			patched.x = patched.x + tiles;
			patched.moveDurationMs = durationMs;
		}
		if (action.animation === "moveUp") {
			patched.y = patched.y - tiles;
			patched.moveDurationMs = durationMs;
		}
		if (action.animation === "moveDown") {
			patched.y = patched.y + tiles;
			patched.moveDurationMs = durationMs;
		}

		nextActors = {
			...nextActors,
			[action.targetActorId]: patched,
		};
	}

	return {
		actors: nextActors,
		toasts,
		sfx,
		rewards,
		playerName,
		progressStoneGrants,
		playerOutfit,
		mapFade,
		nextToastId,
	};
};

export const collectRemainingFrameRewards = (
	frames: SideViewFrame[],
	fromFrameIndex: number,
): SideViewReward[] => {
	const rewards: SideViewReward[] = [];
	for (let index = Math.max(0, fromFrameIndex); index < frames.length; index += 1) {
		const frame = frames[index];
		if (!frame) continue;
		for (const action of frame.actions ?? []) {
			if (action.type === "reward") {
				rewards.push(...action.rewards);
			}
		}
	}
	return rewards;
};
