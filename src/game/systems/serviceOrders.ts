import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import {
	orderCompleteDialog,
	orderMiddleDialog,
	orderStartedDialog,
} from "../content/dialog";
import {
	nextCafeObservation as nextCafeObservationRule,
	nextDoctorObservation as nextDoctorObservationRule,
	nextDoctorSpeechLine as nextDoctorSpeechLineRule,
	orderLine as orderLineRule,
} from "./dialogue";
import type { CafeOrderItem, MapId } from "../shared/types";

type AudioRef = MutableRefObject<HTMLAudioElement | null>;
type TimerRef = MutableRefObject<number | null>;

type CreateServiceOrderActionsInput = {
	stopAreaFade: () => void;
	currentAreaMusicRef: AudioRef;
	cafeOrderMusicRef: AudioRef;
	closeMenu: () => void;
	playerRef: MutableRefObject<{ map: MapId; [key: string]: unknown }>;
	getAreaMusicForMap: (mapId: MapId) => HTMLAudioElement | null;
	switchAreaMusic: (target: HTMLAudioElement | null, instant?: boolean) => void;
	randomInt: (min: number, max: number) => number;
	speakNpcLine: (line: string) => void;
	addLog: (line: string) => void;
	playMunch: () => void;
	playGotReward: () => void;
	setDoctorUsedToday: Dispatch<SetStateAction<boolean>>;
	setIsDoctorCompounding: Dispatch<SetStateAction<boolean>>;
	setPauseGame: Dispatch<SetStateAction<boolean>>;
	setDoctorObservation: Dispatch<SetStateAction<string>>;
	setStaminaMax: Dispatch<SetStateAction<number>>;
	setStamina: Dispatch<SetStateAction<number>>;
	setIsOrdering: Dispatch<SetStateAction<boolean>>;
	setCafeObservation: Dispatch<SetStateAction<string>>;
	staminaMax: number;
	orderMidTimeoutRef: TimerRef;
	orderCompleteTimeoutRef: TimerRef;
	orderRewardTimeoutRef: TimerRef;
	cafeObservationIntervalRef: TimerRef;
	doctorProcessTimeoutRef: TimerRef;
	doctorRewardTimeoutRef: TimerRef;
	doctorObservationIntervalRef: TimerRef;
};

export const createServiceOrderActions = (input: CreateServiceOrderActionsInput) => {
	const {
		stopAreaFade,
		currentAreaMusicRef,
		cafeOrderMusicRef,
		closeMenu,
		playerRef,
		getAreaMusicForMap,
		switchAreaMusic,
		randomInt,
		speakNpcLine,
		addLog,
		playMunch,
		playGotReward,
		setDoctorUsedToday,
		setIsDoctorCompounding,
		setPauseGame,
		setDoctorObservation,
		setStaminaMax,
		setStamina,
		setIsOrdering,
		setCafeObservation,
		staminaMax,
		orderMidTimeoutRef,
		orderCompleteTimeoutRef,
		orderRewardTimeoutRef,
		cafeObservationIntervalRef,
		doctorProcessTimeoutRef,
		doctorRewardTimeoutRef,
		doctorObservationIntervalRef,
	} = input;

	const orderLine = (template: string, orderedItem: string) =>
		orderLineRule(template, orderedItem);
	const nextCafeObservation = (orderedItem: string) =>
		nextCafeObservationRule(randomInt, orderedItem);
	const nextDoctorSpeechLine = () => nextDoctorSpeechLineRule(randomInt);
	const nextDoctorObservation = () => nextDoctorObservationRule(randomInt);

	const clearDoctorMedicineTimers = () => {
		if (doctorProcessTimeoutRef.current !== null) {
			window.clearTimeout(doctorProcessTimeoutRef.current);
			doctorProcessTimeoutRef.current = null;
		}
		if (doctorRewardTimeoutRef.current !== null) {
			window.clearTimeout(doctorRewardTimeoutRef.current);
			doctorRewardTimeoutRef.current = null;
		}
		if (doctorObservationIntervalRef.current !== null) {
			window.clearInterval(doctorObservationIntervalRef.current);
			doctorObservationIntervalRef.current = null;
		}
	};

	const startDoctorMedicine = () => {
		stopAreaFade();
		if (currentAreaMusicRef.current) {
			currentAreaMusicRef.current.pause();
		}
		if (cafeOrderMusicRef.current) {
			cafeOrderMusicRef.current.currentTime = 0;
			void cafeOrderMusicRef.current.play().catch(() => undefined);
		}
		closeMenu();
		clearDoctorMedicineTimers();
		setDoctorUsedToday(true);
		setIsDoctorCompounding(true);
		setPauseGame(true);
		const tick = () => {
			const spoken = nextDoctorSpeechLine();
			const observed = nextDoctorObservation();
			speakNpcLine(spoken);
			setDoctorObservation(observed);
		};
		tick();
		doctorObservationIntervalRef.current = window.setInterval(tick, 5000);
		doctorProcessTimeoutRef.current = window.setTimeout(() => {
			clearDoctorMedicineTimers();
			setIsDoctorCompounding(false);
			setDoctorObservation("");
			const doneLine = "OK. Drink up.";
			speakNpcLine(doneLine);
			addLog(doneLine);
			playMunch();
			doctorRewardTimeoutRef.current = window.setTimeout(() => {
				playGotReward();
				setStaminaMax((prevMax) => {
					const nextMax = prevMax + 20;
					setStamina((s) => Math.min(nextMax, s + 20));
					return nextMax;
				});
				addLog("Your maximum stamina increased by 20.");
				if (cafeOrderMusicRef.current) {
					cafeOrderMusicRef.current.pause();
					cafeOrderMusicRef.current.currentTime = 0;
				}
				switchAreaMusic(getAreaMusicForMap(playerRef.current.map), true);
				setPauseGame(false);
				doctorRewardTimeoutRef.current = null;
			}, 1000);
			doctorProcessTimeoutRef.current = null;
		}, 20000);
	};

	const startCafeOrder = (item: CafeOrderItem) => {
		stopAreaFade();
		if (currentAreaMusicRef.current) {
			currentAreaMusicRef.current.pause();
		}
		if (cafeOrderMusicRef.current) {
			cafeOrderMusicRef.current.currentTime = 0;
			void cafeOrderMusicRef.current.play().catch(() => undefined);
		}
		closeMenu();
		setIsOrdering(true);
		setCafeObservation(nextCafeObservation(item.name));
		const started = orderLine(
			orderStartedDialog[randomInt(0, orderStartedDialog.length - 1)]!,
			item.name,
		);
		speakNpcLine(started);
		addLog(started);

		if (orderMidTimeoutRef.current !== null) {
			window.clearTimeout(orderMidTimeoutRef.current);
		}
		if (orderCompleteTimeoutRef.current !== null) {
			window.clearTimeout(orderCompleteTimeoutRef.current);
		}
		if (orderRewardTimeoutRef.current !== null) {
			window.clearTimeout(orderRewardTimeoutRef.current);
		}
		if (cafeObservationIntervalRef.current !== null) {
			window.clearInterval(cafeObservationIntervalRef.current);
		}
		cafeObservationIntervalRef.current = window.setInterval(() => {
			setCafeObservation(nextCafeObservation(item.name));
		}, 5000);

		const extraMiddleSteps =
			item.name === "Pizza"
				? 2
				: item.name === "Hamburger" || item.name === "Salad"
					? 1
					: 0;
		const middleStepCount = 1 + extraMiddleSteps;
		let remainingMiddleSteps = middleStepCount;

		const finishOrder = () => {
			playMunch();
			setStamina((s) => Math.min(staminaMax, s + item.stamina));
			setIsOrdering(false);
			setCafeObservation("");
			if (cafeObservationIntervalRef.current !== null) {
				window.clearInterval(cafeObservationIntervalRef.current);
				cafeObservationIntervalRef.current = null;
			}
			if (cafeOrderMusicRef.current) {
				cafeOrderMusicRef.current.pause();
				cafeOrderMusicRef.current.currentTime = 0;
			}
			switchAreaMusic(getAreaMusicForMap(playerRef.current.map), true);
			orderMidTimeoutRef.current = null;
			orderCompleteTimeoutRef.current = null;
			orderRewardTimeoutRef.current = null;
		};

		const runMiddleStep = () => {
			const mid = orderMiddleDialog[randomInt(0, orderMiddleDialog.length - 1)]!;
			speakNpcLine(mid);
			addLog(mid);
			remainingMiddleSteps -= 1;
			if (remainingMiddleSteps > 0) {
				orderMidTimeoutRef.current = window.setTimeout(
					runMiddleStep,
					randomInt(5, 12) * 1000,
				);
				return;
			}
			orderCompleteTimeoutRef.current = window.setTimeout(() => {
				const done = orderLine(
					orderCompleteDialog[randomInt(0, orderCompleteDialog.length - 1)]!,
					item.name,
				);
				speakNpcLine(done);
				addLog(done);
				orderRewardTimeoutRef.current = window.setTimeout(finishOrder, 1500);
			}, randomInt(5, 12) * 1000);
		};

		orderMidTimeoutRef.current = window.setTimeout(
			runMiddleStep,
			randomInt(5, 12) * 1000,
		);
	};

	return {
		startDoctorMedicine,
		startCafeOrder,
	};
};
