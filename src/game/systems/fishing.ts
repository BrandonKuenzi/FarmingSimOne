import type { FishingState, MapId } from "../shared/types";

type TimerRef = { current: number | null };

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
	fishing: FishingState | null;
	hasBlockingModal: boolean;
	playWater: () => void;
	fadeOutCurrentAreaMusic: () => void;
	setFishing: (updater: FishingState | null | ((prev: FishingState | null) => FishingState | null)) => void;
	addLog: (line: string) => void;
	maxWaitSeconds: number;
	randomInt: (min: number, max: number) => number;
	waitTimeoutRef: TimerRef;
	catchTimeoutRef: TimerRef;
	waterIntervalRef: TimerRef;
	onFishEscaped: () => void;
}): boolean => {
	if (ctx.fishing || ctx.hasBlockingModal) return false;
	ctx.playWater();
	ctx.waterIntervalRef.current = window.setInterval(() => {
		ctx.playWater();
	}, 3000);
	ctx.fadeOutCurrentAreaMusic();
	ctx.setFishing({
		map: ctx.map,
		x: ctx.x,
		y: ctx.y,
		phase: "waiting",
		requiredKey: "",
	});
	ctx.addLog("[full] You cast your line...");
	const waitMs = ctx.randomInt(2, ctx.maxWaitSeconds) * 1000;
	ctx.waitTimeoutRef.current = window.setTimeout(() => {
		const keys = "abcdefghijklmnopqrstuvwxyz";
		const requiredKey = keys[ctx.randomInt(0, keys.length - 1)]!;
		if (ctx.waterIntervalRef.current !== null) {
			window.clearInterval(ctx.waterIntervalRef.current);
			ctx.waterIntervalRef.current = null;
		}
		ctx.setFishing((prev) =>
			prev
				? {
						...prev,
						phase: "bite",
						requiredKey,
					}
				: prev,
		);
		ctx.catchTimeoutRef.current = window.setTimeout(() => {
			ctx.onFishEscaped();
		}, 2000);
	}, waitMs);
	return true;
};
