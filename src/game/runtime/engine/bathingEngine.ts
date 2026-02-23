import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

export const useBathingRecovery = (args: {
	isBathing: boolean;
	stamina: number;
	staminaMax: number;
	setStamina: Dispatch<SetStateAction<number>>;
	stopBathing: (line?: string) => void;
}): void => {
	const { isBathing, stamina, staminaMax, setStamina, stopBathing } = args;

	useEffect(() => {
		if (!isBathing) return;
		const interval = window.setInterval(() => {
			setStamina((s) => Math.min(staminaMax, s + 1));
		}, 1000);
		return () => window.clearInterval(interval);
	}, [isBathing, staminaMax, setStamina]);

	useEffect(() => {
		if (isBathing && stamina >= staminaMax) {
			stopBathing("You feel refreshed and step out of the bath.");
		}
	}, [isBathing, stamina, staminaMax, stopBathing]);
};
