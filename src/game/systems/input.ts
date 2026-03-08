import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type {
	AnimalType,
	DayTransitionState,
	Dir,
	FishingState,
	Inventory,
	ItemId,
	MapId,
	ModalState,
	QuantityPromptState,
	TractorImplement,
	IncomeSource,
} from "../shared/types";
import type {
	GameInputCommand,
	GameInputMeta,
	InputCommandResult,
} from "./inputContracts";

export const moveModalCursor = (
	modal: ModalState | null,
	dir: Dir,
	setModalIndex: Dispatch<SetStateAction<number>>,
): void => {
	if (!modal) return;
	if (dir === "up") {
		setModalIndex((idx) => (idx - 1 + modal.options.length) % modal.options.length);
	} else if (dir === "down") {
		setModalIndex((idx) => (idx + 1) % modal.options.length);
	}
};

export const moveQuantitySelection = (
	setQuantityPrompt: Dispatch<SetStateAction<QuantityPromptState | null>>,
	delta: number,
): void => {
	setQuantityPrompt((prev) => {
		if (!prev) return prev;
		const nextValue = Math.max(prev.min, Math.min(prev.max, prev.value + delta));
		return { ...prev, value: nextValue };
	});
};

export const selectModalOption = (ctx: {
	modal: ModalState | null;
	modalIndex: number;
	quantityPrompt: QuantityPromptState | null;
	quantityPromptRef: MutableRefObject<QuantityPromptState | null>;
	quantityParentMenuRef: MutableRefObject<{ modal: ModalState; index: number } | null>;
	playNotification: () => void;
	closeMenu: () => void;
	cancelQuantityPrompt: () => void;
}): void => {
	const {
		modal,
		modalIndex,
		quantityPrompt,
		quantityPromptRef,
		quantityParentMenuRef,
		playNotification,
		closeMenu,
		cancelQuantityPrompt,
	} = ctx;
	if (!modal) return;
	playNotification();
	if (quantityPrompt) {
		const q = quantityPromptRef.current?.value ?? 0;
		if (q > 0) {
			quantityPromptRef.current?.onConfirm(q);
			quantityParentMenuRef.current = null;
			closeMenu();
			return;
		}
		cancelQuantityPrompt();
		return;
	}
	modal.options[modalIndex]?.onSelect();
};

export type GameKeyDownContext = {
	applyMoneyDelta: (
		delta: number,
		incomeSource?: IncomeSource,
		transactionCount?: number,
	) => void;
	updateInventory: (item: ItemId, amount: number) => void;
	debugGrantAllProgressStones: () => void;
	spawnAnimalInBarn: (type: AnimalType) => boolean;
	addLog: (line: string) => void;
	isDrivingTractor: boolean;
	tractorImplementOn: boolean;
	tractorImplement: TractorImplement | null;
	tractorSeedItem: ItemId | null;
	inventory: Inventory;
	setTractorImplementOn: Dispatch<SetStateAction<boolean>>;
	playBad: () => void;
	applyTractorImplementAt: (x: number, y: number, forceOn?: boolean) => void;
	player: { map: MapId; x: number; y: number };
	isBathing: boolean;
	stopBathing: (line?: string) => void;
	dayTransition: DayTransitionState | null;
	dayTransitionStage: string;
	dayTransitionClosePhase: string;
	continueAfterSleep: () => void;
	isOrdering: boolean;
	isDoctorCompounding: boolean;
	fishing: FishingState | null;
	endFishing: () => void;
	clearFishingTimers: () => void;
	setFishing: Dispatch<SetStateAction<FishingState | null>>;
	moveFishingSelection: (delta: number) => void;
	moveFishingBuffSelection: (delta: number) => void;
	selectFishingMove: () => void;
	selectFishingLevelUpBuffChoice: (choiceIndex?: number) => void;
	cutFishingLine: () => void;
	playYaya: () => void;
	fishingResolveTimeoutRef: MutableRefObject<number | null>;
	modal: ModalState | null;
	quantityPrompt: QuantityPromptState | null;
	getAreaMusicForMap: (map: MapId) => HTMLAudioElement | null;
	switchAreaMusic: (nextTrack: HTMLAudioElement | null, immediate?: boolean) => void;
	moveQuantity: (delta: number) => void;
	setQuantityToMax: () => void;
	setQuantityToMin: () => void;
	moveModal: (dir: Dir) => void;
	movePlayer: (dir: Dir) => void;
	interact: (dir: Dir) => void;
	cancelQuantityPrompt: () => void;
	vendorMenuTitles: Set<string>;
	closeMenu: () => void;
	selectModal: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
	inputLocked: boolean;
	directorDialogOpen: boolean;
	confirmDirectorDialog: () => void;
	isNewspaperOpen: boolean;
	closeNewspaperPopup: () => void;
	openCutsceneDebugMenu: () => void;
	toggleDebugToolsPanel: () => void;
	closeDebugToolsPanel: () => void;
	isDebugToolsPanelOpen: boolean;
	runDebugGrantResources: () => void;
	runDebugSpawnBarnAnimals: () => void;
	toggleStatsDebugOverlay: () => void;
	sideViewCutsceneActive: boolean;
	sideViewCutsceneInputUnlockAtMs: number;
	sideViewCutsceneContentDone: boolean;
	sideViewCutsceneCurrentFrameAutoProgress: boolean;
	advanceSideViewCutscene: () => void;
	fastForwardSideViewCutscene: () => void;
};

export const handleGameInputCommand = (
	ctx: GameKeyDownContext,
	command: GameInputCommand,
	meta: GameInputMeta,
): InputCommandResult => {
	const key = meta.sourceKey.toLowerCase();
	const consume = (): InputCommandResult => ({
		handled: true,
		preventDefault: true,
	});
	const passthrough = (): InputCommandResult => ({
		handled: false,
		preventDefault: false,
	});
	const isDirectionalKey =
		key === "w" ||
		key === "a" ||
		key === "s" ||
		key === "d" ||
		key === "arrowup" ||
		key === "arrowdown" ||
		key === "arrowleft" ||
		key === "arrowright";
	const isQuantityRepeatKey =
		key === "a" || key === "d" || key === "arrowleft" || key === "arrowright";
	const allowQuantityRepeat = !!ctx.modal && !!ctx.quantityPrompt && isQuantityRepeatKey;
	if (meta.repeat && isDirectionalKey && !allowQuantityRepeat) {
		return consume();
	}
	if (meta.repeat && command === "OK" && !!ctx.modal) {
		return consume();
	}

	if (ctx.fishing?.phase === "waiting") {
		ctx.clearFishingTimers();
		ctx.setFishing(null);
		ctx.addLog("You reeled in early.");
	}

	if (command === "DEBUG_GRANT_RESOURCES") {
		ctx.runDebugGrantResources();
		return consume();
	}

	if (command === "DEBUG_SPAWN_BARN_ANIMALS") {
		ctx.runDebugSpawnBarnAnimals();
		return consume();
	}

	if (command === "DEBUG_OPEN_TOOLS_PANEL") {
		if (!meta.repeat) ctx.toggleDebugToolsPanel();
		return consume();
	}

	if (command === "ZOOM_OUT") {
		ctx.zoomOut();
		return consume();
	}

	if (command === "ZOOM_IN") {
		ctx.zoomIn();
		return consume();
	}

	if (command === "TOGGLE_STATS_DEBUG_OVERLAY") {
		if (!meta.repeat) ctx.toggleStatsDebugOverlay();
		return consume();
	}

	if (ctx.directorDialogOpen && command === "OK") {
		ctx.confirmDirectorDialog();
		return consume();
	}

	if (ctx.isDebugToolsPanelOpen) {
		if (command === "CANCEL" || command === "OK") {
			ctx.closeDebugToolsPanel();
		}
		return consume();
	}

	if (ctx.isNewspaperOpen) {
		if (command === "OK" || command === "CANCEL") {
			ctx.closeNewspaperPopup();
		}
		return consume();
	}

	if (command === "DEBUG_OPEN_CUTSCENE_MENU") {
		ctx.openCutsceneDebugMenu();
		return consume();
	}

	if (ctx.sideViewCutsceneActive) {
		if (command !== "OK") return consume();
		if (ctx.sideViewCutsceneContentDone) {
			ctx.advanceSideViewCutscene();
			return consume();
		}
		if (Date.now() < ctx.sideViewCutsceneInputUnlockAtMs) return consume();
		if (!ctx.sideViewCutsceneContentDone) {
			if (ctx.sideViewCutsceneCurrentFrameAutoProgress) return consume();
			ctx.fastForwardSideViewCutscene();
		}
		ctx.advanceSideViewCutscene();
		return consume();
	}

	if (ctx.inputLocked) {
		return consume();
	}

	if (
		ctx.modal &&
		ctx.modal.title.startsWith("[friendPostcard:") &&
		command === "CANCEL"
	) {
		return consume();
	}

	if (ctx.isDrivingTractor && command === "OK") {
		const nextOn = !ctx.tractorImplementOn;
		if (nextOn && ctx.tractorImplement === "sow") {
			if (!ctx.tractorSeedItem || ctx.inventory[ctx.tractorSeedItem] <= 0) {
				ctx.setTractorImplementOn(false);
				ctx.playBad();
				ctx.addLog("Out of seeds");
				return consume();
			}
		}
		ctx.setTractorImplementOn(nextOn);
		if (nextOn) {
			ctx.applyTractorImplementAt(ctx.player.x, ctx.player.y, true);
		}
		return consume();
	}

	if (ctx.isBathing) {
		ctx.stopBathing("You step out of the bath.");
		return consume();
	}

	if (
		ctx.dayTransition &&
		ctx.dayTransitionStage === "final" &&
		ctx.dayTransitionClosePhase === "idle" &&
		command === "OK" &&
		key === " "
	) {
		ctx.continueAfterSleep();
		return consume();
	}

	if (ctx.isOrdering || ctx.isDoctorCompounding) {
		return consume();
	}

	if (ctx.fishing) {
		if (ctx.fishing.phase === "intro") {
			return consume();
		}
		if (ctx.fishing.awaitingLevelUpBuffChoice) {
			if (
				command === "MOVE_UP" ||
				command === "INTERACT_UP" ||
				command === "MOVE_LEFT" ||
				command === "INTERACT_LEFT"
			) {
				ctx.moveFishingBuffSelection(-1);
				return consume();
			}
			if (
				command === "MOVE_DOWN" ||
				command === "INTERACT_DOWN" ||
				command === "MOVE_RIGHT" ||
				command === "INTERACT_RIGHT"
			) {
				ctx.moveFishingBuffSelection(1);
				return consume();
			}
			if (command === "OK") {
				ctx.selectFishingLevelUpBuffChoice();
				return consume();
			}
			return consume();
		}
		if (ctx.fishing.phase === "player_turn") {
			if (
				command === "MOVE_UP" ||
				command === "INTERACT_UP" ||
				command === "MOVE_LEFT" ||
				command === "INTERACT_LEFT"
			) {
				ctx.moveFishingSelection(-1);
				return consume();
			}
			if (
				command === "MOVE_DOWN" ||
				command === "INTERACT_DOWN" ||
				command === "MOVE_RIGHT" ||
				command === "INTERACT_RIGHT"
			) {
				ctx.moveFishingSelection(1);
				return consume();
			}
			if (command === "OK") {
				ctx.selectFishingMove();
				return consume();
			}
			if (command === "CANCEL") {
				ctx.cutFishingLine();
				return consume();
			}
			return consume();
		}
		return consume();
	}

	if (!ctx.dayTransition && !ctx.modal) {
		const activeAreaTrack = ctx.getAreaMusicForMap(ctx.player.map);
		if (activeAreaTrack && activeAreaTrack.paused) {
			ctx.switchAreaMusic(activeAreaTrack, true);
		}
	}

	if (command === "MOVE_UP") {
		if (ctx.modal && ctx.quantityPrompt) ctx.setQuantityToMax();
		else if (ctx.modal) ctx.moveModal("up");
		else ctx.movePlayer("up");
		return consume();
	}
	if (command === "MOVE_DOWN") {
		if (ctx.modal && ctx.quantityPrompt) ctx.setQuantityToMin();
		else if (ctx.modal) ctx.moveModal("down");
		else ctx.movePlayer("down");
		return consume();
	}
	if (command === "MOVE_LEFT") {
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(-1);
		else if (!ctx.modal) ctx.movePlayer("left");
		return consume();
	}

	if (command === "CANCEL" && ctx.modal && ctx.quantityPrompt) {
		ctx.cancelQuantityPrompt();
		return consume();
	}
	if (
		command === "CANCEL" &&
		ctx.modal &&
		!ctx.quantityPrompt &&
		ctx.vendorMenuTitles.has(ctx.modal.title)
	) {
		ctx.closeMenu();
		return consume();
	}
	if (command === "MOVE_RIGHT") {
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(1);
		else if (!ctx.modal) ctx.movePlayer("right");
		return consume();
	}

	if (command === "INTERACT_UP") {
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(1);
		else if (ctx.modal) ctx.moveModal("up");
		else if (!ctx.modal) ctx.interact("up");
		return consume();
	}
	if (command === "INTERACT_DOWN") {
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(-1);
		else if (ctx.modal) ctx.moveModal("down");
		else if (!ctx.modal) ctx.interact("down");
		return consume();
	}
	if (command === "INTERACT_LEFT") {
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(-1);
		else if (!ctx.modal) ctx.interact("left");
		return consume();
	}
	if (command === "INTERACT_RIGHT") {
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(1);
		else if (!ctx.modal) ctx.interact("right");
		return consume();
	}

	if (command === "OK") {
		if (ctx.modal) ctx.selectModal();
		return consume();
	}

	return passthrough();
};
