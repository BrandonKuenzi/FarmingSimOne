import type { UnlockFlags } from "../shared/types";

type UnlockProgressInput = {
	forestLevel: number;
	caveLevel: number;
};

const HEADLAMP_UNLOCK_LEVEL = 5;

export const createInitialUnlockFlags = (): UnlockFlags => ({
	headlampVendorStock: false,
});

export const resolveUnlockFlags = (
	progress: UnlockProgressInput,
	current: UnlockFlags,
): UnlockFlags => {
	const shouldUnlockHeadlamp =
		progress.forestLevel >= HEADLAMP_UNLOCK_LEVEL ||
		progress.caveLevel >= HEADLAMP_UNLOCK_LEVEL;
	if (!shouldUnlockHeadlamp || current.headlampVendorStock) return current;
	return {
		...current,
		headlampVendorStock: true,
	};
};

export const buildUnlockFlagsFromProgress = (
	progress: UnlockProgressInput,
): UnlockFlags => {
	return resolveUnlockFlags(progress, createInitialUnlockFlags());
};
