import type { Dispatch, KeyboardEvent, MutableRefObject, SetStateAction } from "react";
import type {
	DayTransitionState,
	Dir,
	FishingState,
	Inventory,
	ItemId,
	MapId,
	ModalState,
	QuantityPromptState,
	TractorImplement,
} from "../shared/types";

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

export const handleGameKeyDown = (
	ctx: {
		applyMoneyDelta: (delta: number) => void;
		updateInventory: (item: ItemId, amount: number) => void;
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
		playYaya: () => void;
		fishingResolveTimeoutRef: MutableRefObject<number | null>;
		modal: ModalState | null;
		quantityPrompt: QuantityPromptState | null;
		getAreaMusicForMap: (map: MapId) => HTMLAudioElement | null;
		switchAreaMusic: (nextTrack: HTMLAudioElement | null, immediate?: boolean) => void;
		moveQuantity: (delta: number) => void;
		moveModal: (dir: Dir) => void;
		movePlayer: (dir: Dir) => void;
		interact: (dir: Dir) => void;
		cancelQuantityPrompt: () => void;
		vendorMenuTitles: Set<string>;
		closeMenu: () => void;
		selectModal: () => void;
	},
	e: KeyboardEvent<HTMLDivElement>,
): void => {
	const key = e.key.toLowerCase();

	if (key === "p") {
		e.preventDefault();
		ctx.applyMoneyDelta(10000);
		ctx.updateInventory("ruby", 10);
		ctx.updateInventory("diamond", 10);
		ctx.updateInventory("emerald", 10);
		ctx.addLog("Debug boost: +$10,000, +10 Ruby, +10 Diamond, +10 Emerald.");
		return;
	}

	if (ctx.isDrivingTractor && key === " ") {
		e.preventDefault();
		const nextOn = !ctx.tractorImplementOn;
		if (nextOn && ctx.tractorImplement === "sow") {
			if (!ctx.tractorSeedItem || ctx.inventory[ctx.tractorSeedItem] <= 0) {
				ctx.setTractorImplementOn(false);
				ctx.playBad();
				ctx.addLog("Out of seeds");
				return;
			}
		}
		ctx.setTractorImplementOn(nextOn);
		if (nextOn) {
			ctx.applyTractorImplementAt(ctx.player.x, ctx.player.y, true);
		}
		return;
	}

	if (ctx.isBathing) {
		e.preventDefault();
		ctx.stopBathing("You step out of the bath.");
		return;
	}

	if (
		ctx.dayTransition &&
		ctx.dayTransitionStage === "final" &&
		ctx.dayTransitionClosePhase === "idle" &&
		key === " "
	) {
		e.preventDefault();
		ctx.continueAfterSleep();
		return;
	}

	if (ctx.isOrdering || ctx.isDoctorCompounding) {
		e.preventDefault();
		return;
	}

	if (ctx.fishing) {
		e.preventDefault();
		if (ctx.fishing.phase === "waiting") {
			ctx.playBad();
			ctx.addLog("The fish got away.");
			ctx.endFishing();
			return;
		}
		if (ctx.fishing.phase !== "bite") return;
		if (key.length !== 1) return;
		if (key === ctx.fishing.requiredKey) {
			ctx.clearFishingTimers();
			ctx.setFishing((prev) => (prev ? { ...prev, phase: "success" } : prev));
			ctx.playYaya();
			ctx.updateInventory("fish", 1);
			ctx.addLog("Nice catch! +1 Fish");
			ctx.fishingResolveTimeoutRef.current = window.setTimeout(() => {
				ctx.endFishing();
			}, 2000);
			return;
		}
		ctx.playBad();
		ctx.addLog("You missed the bite.");
		ctx.endFishing();
		return;
	}

	if (!ctx.dayTransition && !ctx.modal) {
		const activeAreaTrack = ctx.getAreaMusicForMap(ctx.player.map);
		if (activeAreaTrack && activeAreaTrack.paused) {
			ctx.switchAreaMusic(activeAreaTrack, true);
		}
	}

	if (key === "w") {
		e.preventDefault();
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(1);
		else if (ctx.modal) ctx.moveModal("up");
		else ctx.movePlayer("up");
		return;
	}
	if (key === "s") {
		e.preventDefault();
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(-1);
		else if (ctx.modal) ctx.moveModal("down");
		else ctx.movePlayer("down");
		return;
	}
	if (key === "a") {
		e.preventDefault();
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(-1);
		else if (!ctx.modal) ctx.movePlayer("left");
		return;
	}

	if (key === "escape" && ctx.modal && ctx.quantityPrompt) {
		e.preventDefault();
		ctx.cancelQuantityPrompt();
		return;
	}
	if (
		key === "escape" &&
		ctx.modal &&
		!ctx.quantityPrompt &&
		ctx.vendorMenuTitles.has(ctx.modal.title)
	) {
		e.preventDefault();
		ctx.closeMenu();
		return;
	}
	if (key === "d") {
		e.preventDefault();
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(1);
		else if (!ctx.modal) ctx.movePlayer("right");
		return;
	}

	if (key === "arrowup") {
		e.preventDefault();
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(1);
		else if (ctx.modal) ctx.moveModal("up");
		else if (!ctx.modal) ctx.interact("up");
		return;
	}
	if (key === "arrowdown") {
		e.preventDefault();
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(-1);
		else if (ctx.modal) ctx.moveModal("down");
		else if (!ctx.modal) ctx.interact("down");
		return;
	}
	if (key === "arrowleft") {
		e.preventDefault();
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(-1);
		else if (!ctx.modal) ctx.interact("left");
		return;
	}
	if (key === "arrowright") {
		e.preventDefault();
		if (ctx.modal && ctx.quantityPrompt) ctx.moveQuantity(1);
		else if (!ctx.modal) ctx.interact("right");
		return;
	}

	if (key === " " || key === "enter") {
		e.preventDefault();
		if (ctx.modal) ctx.selectModal();
	}
};
