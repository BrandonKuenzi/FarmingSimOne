import {
	cafeWaitingObservations,
	doctorGrindingMedicineSpeech,
	doctorWaitingObservations,
} from "../content/dialog";

export const orderLine = (template: string, orderedItem: string) =>
	template.replace(/ORDERED_ITEM/g, orderedItem);

export const nextCafeObservation = (
	randomInt: (min: number, max: number) => number,
	orderedItem: string,
) => orderLine(cafeWaitingObservations[randomInt(0, cafeWaitingObservations.length - 1)]!, orderedItem);

export const nextDoctorSpeechLine = (randomInt: (min: number, max: number) => number) =>
	doctorGrindingMedicineSpeech[randomInt(0, doctorGrindingMedicineSpeech.length - 1)]!;

export const nextDoctorObservation = (randomInt: (min: number, max: number) => number) =>
	doctorWaitingObservations[randomInt(0, doctorWaitingObservations.length - 1)]!;
