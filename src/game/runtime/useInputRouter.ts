import type { KeyboardEvent } from "react";
import { runInputCommandHandlers } from "../systems/inputCommands";
import type { GameKeyDownContext } from "../systems/input";

export const useInputRouter = (ctx: GameKeyDownContext) => {
	return (e: KeyboardEvent<HTMLDivElement>) => {
		runInputCommandHandlers(ctx, e);
	};
};
