import type { Point } from "../shared/types";
import { GLYPH } from "../config/glyphs";

export const getFogTargetOpacity = (
	playerPos: Point,
	x: number,
	y: number,
	playerEmoji: string,
	hasHeadlamp: boolean,
): number => {
	let visionBoost = 1;
	if (playerEmoji === GLYPH.bulb) visionBoost *= 2;
	if (hasHeadlamp) visionBoost *= 2;
	const dist = Math.max(Math.abs(x - playerPos.x), Math.abs(y - playerPos.y)) / visionBoost;
	if (dist <= 3) return 0;
	if (dist <= 4) return 0.5;
	if (dist <= 6) return 0.9;
	return 1;
};

export const resolveFogOpacity = (
	fogState: Record<string, number>,
	key: string,
	target: number,
): number => {
	const current = fogState[key] ?? 0;
	const next = current + (target - current) * 0.35;
	return Math.max(0, Math.min(0.95, next));
};
