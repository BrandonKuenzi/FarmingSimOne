import type { ModalOption, ModalState, QuantityPromptState } from "../shared/types";

type QuantityParentRef = {
	current: { modal: ModalState; index: number } | null;
};

export const openMenu = (ctx: {
	title: string;
	body: string[];
	options: ModalOption[];
	playNotification: () => void;
	setPauseGame: (value: boolean) => void;
	setModal: (value: ModalState | null) => void;
	setModalIndex: (value: number) => void;
}) => {
	ctx.playNotification();
	ctx.setPauseGame(true);
	ctx.setModal({ title: ctx.title, body: ctx.body, options: ctx.options });
	ctx.setModalIndex(0);
};

export const closeMenu = (ctx: {
	modal: ModalState | null;
	playNotification: () => void;
	setPauseGame: (value: boolean) => void;
	setQuantityPrompt: (value: QuantityPromptState | null) => void;
	quantityParentMenuRef: QuantityParentRef;
	setModal: (value: ModalState | null) => void;
	setModalIndex: (value: number) => void;
	fadeOutSeagulls: () => void;
}) => {
	const wasBottleDialog = ctx.modal?.title === "Message In A Bottle";
	ctx.playNotification();
	ctx.setPauseGame(false);
	ctx.setQuantityPrompt(null);
	ctx.quantityParentMenuRef.current = null;
	ctx.setModal(null);
	ctx.setModalIndex(0);
	if (wasBottleDialog) {
		ctx.fadeOutSeagulls();
	}
};

export const cancelQuantityPrompt = (ctx: {
	quantityParentMenuRef: QuantityParentRef;
	playNotification: () => void;
	setQuantityPrompt: (value: QuantityPromptState | null) => void;
	setModal: (value: ModalState | null) => void;
	setModalIndex: (value: number) => void;
	closeMenu: () => void;
}) => {
	const parent = ctx.quantityParentMenuRef.current;
	if (parent) {
		ctx.playNotification();
		ctx.setQuantityPrompt(null);
		ctx.setModal(parent.modal);
		ctx.setModalIndex(parent.index);
		ctx.quantityParentMenuRef.current = null;
		return;
	}
	ctx.closeMenu();
};

export const openQuantityPrompt = (ctx: {
	cfg: {
		mode: "buy" | "sell";
		itemLabel: string;
		max: number;
		unitPrice: number;
		onConfirm: (quantity: number) => void;
	};
	addLog: (line: string) => void;
	setQuantityPrompt: (value: QuantityPromptState | null) => void;
	modal: ModalState | null;
	modalIndex: number;
	quantityParentMenuRef: QuantityParentRef;
	openMenu: (title: string, body: string[], options: ModalOption[]) => void;
	setModalIndex: (value: number) => void;
}) => {
	const max = Math.max(0, ctx.cfg.max);
	if (max < 1) {
		ctx.addLog(
			ctx.cfg.mode === "buy"
				? "Cannot afford any quantity."
				: "You do not have any to sell.",
		);
		return;
	}
	ctx.setQuantityPrompt({
		min: 0,
		max,
		value: 1,
		unitPrice: ctx.cfg.unitPrice,
		mode: ctx.cfg.mode,
		itemLabel: ctx.cfg.itemLabel,
		onConfirm: ctx.cfg.onConfirm,
	});
	if (ctx.modal) {
		ctx.quantityParentMenuRef.current = { modal: ctx.modal, index: ctx.modalIndex };
	}
	ctx.openMenu(
		`${ctx.cfg.mode === "buy" ? "Buy" : "Sell"} Quantity`,
		[`${ctx.cfg.itemLabel}`],
		[],
	);
	ctx.setModalIndex(0);
};
