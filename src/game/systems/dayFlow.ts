import type { CafeOrderItem } from "../shared/types";

const removedMessage =
	"dayFlow.ts was retired; use serviceOrders.ts and runtime orchestration instead.";

const throwRemoved = (): never => {
	throw new Error(removedMessage);
};

export const runStartDoctorMedicine = (): never => throwRemoved();

export const runStartCafeOrder = (_item: CafeOrderItem): never => throwRemoved();

export const runNextDay = (): never => throwRemoved();

export const runContinueAfterSleep = (): never => throwRemoved();
