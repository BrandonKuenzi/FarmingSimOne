import type { KeyboardEvent } from "react";
import { handleGameKeyDown, type GameKeyDownContext } from "./input";

export type InputCommandHandler = (
	ctx: GameKeyDownContext,
	e: KeyboardEvent<HTMLDivElement>,
) => boolean;

const gameCommandHandler: InputCommandHandler = (ctx, e) => {
	handleGameKeyDown(ctx, e);
	return true;
};

export const createInputCommandHandlers = (): InputCommandHandler[] => {
	return [gameCommandHandler];
};

export const runInputCommandHandlers = (
	ctx: GameKeyDownContext,
	e: KeyboardEvent<HTMLDivElement>,
): void => {
	const handlers = createInputCommandHandlers();
	for (const handler of handlers) {
		if (handler(ctx, e)) return;
	}
};
