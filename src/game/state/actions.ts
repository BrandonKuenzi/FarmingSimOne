import type { Dispatch, SetStateAction } from "react";
import { clampMin } from "../shared/random";
import type { Inventory, ItemId } from "../shared/types";

type StateSetter<T> = Dispatch<SetStateAction<T>>;

export const updateInventoryState = (
	setInventory: StateSetter<Inventory>,
	item: ItemId,
	amount: number,
) => {
	setInventory((inv) => ({
		...inv,
		[item]: clampMin(inv[item] + amount, 0),
	}));
};

export const applyMoneyDeltaState = (
	setMoney: StateSetter<number>,
	setCurrentDayEarned: StateSetter<number>,
	setTotalEarned: StateSetter<number>,
	delta: number,
) => {
	setMoney((m) => m + delta);
	if (delta > 0) {
		setCurrentDayEarned((v) => v + delta);
		setTotalEarned((v) => v + delta);
	}
};
