import { useCallback, useMemo, type KeyboardEvent } from "react";
import {
	KeyboardInputAdapter,
	PC_KEYBOARD_PRESET,
	runInputCommandHandlers,
} from "../systems/inputCommands";
import type {
	GameInputCommand,
	GameInputMeta,
	KeyboardInputPreset,
} from "../systems/inputContracts";
import type { GameKeyDownContext } from "../systems/input";
import type { Dir } from "../shared/types";

export type InputRouter = {
	onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
	dispatchCommand: (command: GameInputCommand, meta?: Partial<GameInputMeta>) => void;
	resolveHeldMoveDirectionForKey: (key: string) => Dir | null;
};

export const useInputRouter = (
	ctx: GameKeyDownContext,
	preset: KeyboardInputPreset = PC_KEYBOARD_PRESET,
): InputRouter => {
	const adapter = useMemo(() => new KeyboardInputAdapter(preset), [preset]);

	const dispatchCommand = useCallback(
		(command: GameInputCommand, meta?: Partial<GameInputMeta>) => {
			runInputCommandHandlers(ctx, command, {
				repeat: meta?.repeat ?? false,
				sourceKey: meta?.sourceKey ?? "",
			});
		},
		[ctx],
	);

	const onKeyDown = useCallback(
		(e: KeyboardEvent<HTMLDivElement>) => {
			const command = adapter.resolveCommand(e.key);
			const result = runInputCommandHandlers(ctx, command, {
				repeat: e.repeat,
				sourceKey: e.key,
			});
			if (result.preventDefault) {
				e.preventDefault();
			}
		},
		[adapter, ctx],
	);

	const resolveHeldMoveDirectionForKey = useCallback(
		(key: string) => adapter.resolveHeldMoveDirection(key),
		[adapter],
	);

	return {
		onKeyDown,
		dispatchCommand,
		resolveHeldMoveDirectionForKey,
	};
};
