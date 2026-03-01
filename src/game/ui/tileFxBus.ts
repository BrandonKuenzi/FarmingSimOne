import type { MapId, TileFxApi, TileFxHandle } from "../shared/types";
import { actorFxKey, mapTileFxKey } from "./tileFxSelectors";

type TileFxMethod = keyof TileFxHandle;

export type TileFxBus = {
	api: TileFxApi;
	registerMapTile: (map: MapId, x: number, y: number, handle: TileFxHandle) => void;
	unregisterMapTile: (map: MapId, x: number, y: number) => void;
	registerActor: (actorId: string, handle: TileFxHandle) => void;
	unregisterActor: (actorId: string) => void;
	clear: () => void;
};

const createNoopHandle = (invoke: (method: TileFxMethod, args: unknown[]) => void): TileFxHandle => ({
	squeeze: (scaleX = 0.5, durationMs = 1000) => invoke("squeeze", [scaleX, durationMs]),
	stretch: (scaleY = 1.5, durationMs = 1000) => invoke("stretch", [scaleY, durationMs]),
	streatch: (scaleY = 1.5, durationMs = 1000) => invoke("streatch", [scaleY, durationMs]),
	bobble: (durationMs = 320) => invoke("bobble", [durationMs]),
	jump: (durationMs = 320) => invoke("jump", [durationMs]),
	emote: (kind, durationMs = 1000) => invoke("emote", [kind, durationMs]),
	toast: (text, durationMs = 2000) => invoke("toast", [text, durationMs]),
});

export const createTileFxBus = (): TileFxBus => {
	const handles = new Map<string, TileFxHandle>();

	const invoke = (key: string, method: TileFxMethod, args: unknown[]) => {
		const handle = handles.get(key);
		if (!handle) return;
		const fn = handle[method] as (...callArgs: unknown[]) => void;
		fn(...args);
	};

	const api: TileFxApi = {
		at: ({ map, x, y }) => {
			const key = mapTileFxKey(map, x, y);
			return createNoopHandle((method, args) => invoke(key, method, args));
		},
		actor: (actorId) => {
			const key = actorFxKey(actorId);
			return createNoopHandle((method, args) => invoke(key, method, args));
		},
	};

	return {
		api,
		registerMapTile: (map, x, y, handle) => {
			handles.set(mapTileFxKey(map, x, y), handle);
		},
		unregisterMapTile: (map, x, y) => {
			handles.delete(mapTileFxKey(map, x, y));
		},
		registerActor: (actorId, handle) => {
			handles.set(actorFxKey(actorId), handle);
		},
		unregisterActor: (actorId) => {
			handles.delete(actorFxKey(actorId));
		},
		clear: () => {
			handles.clear();
		},
	};
};

