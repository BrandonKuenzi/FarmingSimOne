import type { MapId } from "../shared/types";

export const mapTileFxKey = (map: MapId, x: number, y: number): string =>
	`m:${map}:${x},${y}`;

export const actorFxKey = (actorId: string): string => `a:${actorId}`;

