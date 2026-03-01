import type { Dir } from "../shared/types";
import type {
	GameInputCommand,
	GameInputMeta,
	InputCommandResult,
	KeyboardInputPreset,
} from "./inputContracts";
import { handleGameInputCommand, type GameKeyDownContext } from "./input";

export class KeyboardInputAdapter {
	private preset: KeyboardInputPreset;

	constructor(preset: KeyboardInputPreset) {
		this.preset = preset;
	}

	setPreset(preset: KeyboardInputPreset) {
		this.preset = preset;
	}

	resolveCommand(key: string): GameInputCommand {
		const normalizedKey = key.toLowerCase();
		return this.preset.keyToCommand[normalizedKey] ?? "KEY_PRESS";
	}

	resolveHeldMoveDirection(key: string): Dir | null {
		const normalizedKey = key.toLowerCase();
		return this.preset.keyToHeldMoveDirection[normalizedKey] ?? null;
	}
}

export const PC_KEYBOARD_PRESET: KeyboardInputPreset = {
	id: "pc",
	keyToCommand: {
		w: "MOVE_UP",
		s: "MOVE_DOWN",
		a: "MOVE_LEFT",
		d: "MOVE_RIGHT",
		arrowup: "INTERACT_UP",
		arrowdown: "INTERACT_DOWN",
		arrowleft: "INTERACT_LEFT",
		arrowright: "INTERACT_RIGHT",
		" ": "OK",
		enter: "OK",
		escape: "CANCEL",
		q: "ZOOM_OUT",
		e: "ZOOM_IN",
		p: "DEBUG_GRANT_RESOURCES",
		o: "DEBUG_SPAWN_BARN_ANIMALS",
	},
	keyToHeldMoveDirection: {
		w: "up",
		s: "down",
		a: "left",
		d: "right",
	},
};

export const MOBILE_KEYBOARD_PRESET: KeyboardInputPreset = {
	id: "mobile",
	keyToCommand: {
		arrowup: "MOVE_UP",
		arrowdown: "MOVE_DOWN",
		arrowleft: "MOVE_LEFT",
		arrowright: "MOVE_RIGHT",
		" ": "OK",
		enter: "OK",
		escape: "CANCEL",
	},
	keyToHeldMoveDirection: {
		arrowup: "up",
		arrowdown: "down",
		arrowleft: "left",
		arrowright: "right",
	},
};

export type InputCommandHandler = (
	ctx: GameKeyDownContext,
	command: GameInputCommand,
	meta: GameInputMeta,
) => InputCommandResult;

const gameCommandHandler: InputCommandHandler = (ctx, command, meta) => {
	return handleGameInputCommand(ctx, command, meta);
};

export const createInputCommandHandlers = (): InputCommandHandler[] => {
	return [gameCommandHandler];
};

export const runInputCommandHandlers = (
	ctx: GameKeyDownContext,
	command: GameInputCommand,
	meta: GameInputMeta,
): InputCommandResult => {
	const handlers = createInputCommandHandlers();
	for (const handler of handlers) {
		const result = handler(ctx, command, meta);
		if (result.handled) return result;
	}
	return { handled: false, preventDefault: false };
};
