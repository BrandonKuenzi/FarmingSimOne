import type { MapId } from "../shared/types";

export const isRippleWaterTile = (mapId: MapId, x: number, y: number) => {
	const mapSalt = mapId.charCodeAt(0) + mapId.length * 13;
	const hash = (x * 73 + y * 97 + mapSalt) % 20;
	return hash === 0;
};

export const isAnimatedGrassTile = (mapId: MapId, x: number, y: number) => {
	const mapSalt = mapId.charCodeAt(0) + mapId.length * 29;
	const hash = (x * 41 + y * 113 + mapSalt) % 20;
	return hash === 0;
};

export const grassFoliageVariant = (
	mapId: MapId,
	x: number,
	y: number,
	animatedGrassFrame?: number,
) => {
	const mapSalt = mapId.charCodeAt(0) + mapId.length * 11;
	const frame = animatedGrassFrame ?? 0;
	return (x * 17 + y * 31 + mapSalt + frame) % 3;
};
