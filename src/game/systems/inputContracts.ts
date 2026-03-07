import type { Dir } from "../shared/types";

export type GameInputCommand =
	| "MOVE_UP"
	| "MOVE_DOWN"
	| "MOVE_LEFT"
	| "MOVE_RIGHT"
	| "INTERACT_UP"
	| "INTERACT_DOWN"
	| "INTERACT_LEFT"
	| "INTERACT_RIGHT"
	| "OK"
	| "CANCEL"
	| "ZOOM_IN"
	| "ZOOM_OUT"
	| "DEBUG_OPEN_TOOLS_PANEL"
	| "TOGGLE_STATS_DEBUG_OVERLAY"
	| "DEBUG_GRANT_RESOURCES"
	| "DEBUG_SPAWN_BARN_ANIMALS"
	| "DEBUG_OPEN_CUTSCENE_MENU"
	| "KEY_PRESS";

export type GameInputMeta = {
	repeat: boolean;
	sourceKey: string;
};

export type InputCommandResult = {
	handled: boolean;
	preventDefault: boolean;
};

export type KeyboardInputPreset = {
	id: string;
	keyToCommand: Readonly<Record<string, GameInputCommand>>;
	keyToHeldMoveDirection: Readonly<Partial<Record<string, Dir>>>;
};

export const getMoveDirectionFromCommand = (
	command: GameInputCommand,
): Dir | null => {
	if (command === "MOVE_UP") return "up";
	if (command === "MOVE_DOWN") return "down";
	if (command === "MOVE_LEFT") return "left";
	if (command === "MOVE_RIGHT") return "right";
	return null;
};
