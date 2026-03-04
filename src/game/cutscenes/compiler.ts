import type {
	ResolvedSideViewCutscene,
	ResolvedSideViewSubScene,
	SideViewCutscene,
	SideViewFrame,
	SideViewMap,
	SideViewVariables,
} from "./types";

const INPUT_LOCK_MS = 2000;
const DEFAULT_FRAME_DURATION_MS = 3000;

const templatePattern = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

const resolveTemplateString = (
	input: string,
	variables: SideViewVariables,
): string =>
	input.replace(templatePattern, (_whole, key: string) => {
		const value = variables[key];
		if (value === undefined || value === null) return "";
		return String(value);
	});

const resolveTemplateData = <T,>(value: T, variables: SideViewVariables): T => {
	if (typeof value === "string") {
		return resolveTemplateString(value, variables) as T;
	}
	if (Array.isArray(value)) {
		return value.map((entry) => resolveTemplateData(entry, variables)) as T;
	}
	if (value && typeof value === "object") {
		const next: Record<string, unknown> = {};
		for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
			next[key] = resolveTemplateData(entry, variables);
		}
		return next as T;
	}
	return value;
};

const totalFrameDurationMs = (frames: SideViewFrame[]): number =>
	frames.reduce((sum, frame) => sum + Math.max(0, frame.durationMs), 0);

const normalizeFrameDurations = (frames: SideViewFrame[]): SideViewFrame[] => {
	if (frames.length === 0) {
		return [{ durationMs: DEFAULT_FRAME_DURATION_MS, actions: [] }];
	}
	return frames.map((frame) => ({
		...frame,
		durationMs: Math.max(DEFAULT_FRAME_DURATION_MS, frame.durationMs),
	}));
};

const ensureMinimumSubSceneDuration = (frames: SideViewFrame[]): SideViewFrame[] => {
	const total = totalFrameDurationMs(frames);
	if (total >= INPUT_LOCK_MS) return frames;
	if (frames.length === 0) {
		return [{ durationMs: INPUT_LOCK_MS, actions: [] }];
	}
	const next = [...frames];
	const last = next[next.length - 1];
	if (!last) {
		return [{ durationMs: INPUT_LOCK_MS, actions: [] }];
	}
	next[next.length - 1] = {
		...last,
		durationMs: Math.max(last.durationMs, INPUT_LOCK_MS - (total - last.durationMs)),
	};
	return next;
};

export const compileSideViewCutscene = (
	scene: SideViewCutscene,
	runtimeVariables?: SideViewVariables,
): ResolvedSideViewCutscene => {
	const mergedVariables: SideViewVariables = {
		...(scene.variables ?? {}),
		...(runtimeVariables ?? {}),
	};
	const resolved = resolveTemplateData(scene, mergedVariables);

	let previousMap: SideViewMap | null = null;
	const subScenes: ResolvedSideViewSubScene[] = resolved.subScenes.map((subScene) => {
		const map =
			subScene.usePreviousMap || !subScene.map
				? previousMap
				: subScene.map;
		if (!map) {
			throw new Error(
				`Cutscene ${resolved.id} subScene ${subScene.id} is missing a map and no previous map is available.`,
			);
		}
		previousMap = map;
		const normalizedFrames = ensureMinimumSubSceneDuration(
			normalizeFrameDurations(subScene.frames ?? []),
		);
		const totalDurationMs = totalFrameDurationMs(normalizedFrames);
		return {
			id: subScene.id,
			map,
			actors: subScene.actors,
			frames: normalizedFrames,
			bgm: subScene.bgm,
			inputLockMs: Math.max(INPUT_LOCK_MS, subScene.inputLockMs ?? INPUT_LOCK_MS),
			totalDurationMs,
		};
	});

	return {
		...resolved,
		subScenes,
	};
};
