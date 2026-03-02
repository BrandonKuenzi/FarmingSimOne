import type { MutableRefObject } from "react";
import type { MapId } from "../shared/types";

type AudioRef = MutableRefObject<HTMLAudioElement | null>;
type TimerRef = MutableRefObject<number | null>;

export type AreaMusicController = {
	getAreaMusicForMap: (mapId: MapId) => HTMLAudioElement | null;
	stopAreaFade: () => void;
	stopTownBeachFade: () => void;
	stopStaleBackgroundTracks: () => void;
	fadeTownAndBeach: (
		targetTownVolume: number,
		targetBeachVolume: number,
		durationMs?: number,
	) => void;
	fadeOutCurrentAreaMusic: (durationMs?: number) => void;
	switchAreaMusic: (target: HTMLAudioElement | null, instant?: boolean) => void;
	crossFadeEndOfDayTo: (target: HTMLAudioElement | null, durationMs?: number) => void;
	stopEndOfDaySong: () => void;
};

type AreaMusicControllerInput = {
	isShopMap: (mapId: MapId) => boolean;
	playerRef: MutableRefObject<{ map: MapId; [key: string]: unknown }>;
	forestIsBonusLevel: boolean;
	caveIsBonusLevel: boolean;
	hasDayTransition: boolean;
	isOrdering: boolean;
	isDoctorCompounding: boolean;
	isFishing: boolean;
	farmMusicRef: AudioRef;
	townMusicRef: AudioRef;
	beachAmbienceRef: AudioRef;
	houseMusicRef: AudioRef;
	forestMusicRef: AudioRef;
	caveMusicRef: AudioRef;
	bureaucracyMusicRef: AudioRef;
	endOfDayRef: AudioRef;
	cafeOrderMusicRef: AudioRef;
	currentAreaMusicRef: AudioRef;
	musicFadeFromRef: AudioRef;
	musicFadeToRef: AudioRef;
	musicFadeIntervalRef: TimerRef;
	bgMusicTransitionUntilRef: MutableRefObject<number>;
	townBeachFadeIntervalRef: TimerRef;
};

export const createAreaMusicController = (
	input: AreaMusicControllerInput,
): AreaMusicController => {
	const {
		isShopMap,
		playerRef,
		forestIsBonusLevel,
		caveIsBonusLevel,
		hasDayTransition,
		isOrdering,
		isDoctorCompounding,
		isFishing,
		farmMusicRef,
		townMusicRef,
		beachAmbienceRef,
		houseMusicRef,
		forestMusicRef,
		caveMusicRef,
		bureaucracyMusicRef,
		endOfDayRef,
		cafeOrderMusicRef,
		currentAreaMusicRef,
		musicFadeFromRef,
		musicFadeToRef,
		musicFadeIntervalRef,
		bgMusicTransitionUntilRef,
		townBeachFadeIntervalRef,
	} = input;

	const getAreaMusicForMap = (mapId: MapId) => {
		if (mapId === "farm") return farmMusicRef.current;
		if (mapId === "town" || isShopMap(mapId)) return townMusicRef.current;
		if (mapId === "aquarium") return bureaucracyMusicRef.current;
		if (mapId === "forest") {
			if (forestIsBonusLevel) return bureaucracyMusicRef.current;
			return forestMusicRef.current;
		}
		if (mapId === "cave") {
			if (caveIsBonusLevel) return bureaucracyMusicRef.current;
			return caveMusicRef.current;
		}
		if (mapId === "bureaucracy_office") return bureaucracyMusicRef.current;
		return houseMusicRef.current;
	};

	const getDesiredVolumeForTrack = (track: HTMLAudioElement | null): number => {
		if (!track) return 1;
		if (track === caveMusicRef.current) return 0.5;
		return 1;
	};

	const stopAreaFade = () => {
		if (musicFadeIntervalRef.current !== null) {
			window.clearInterval(musicFadeIntervalRef.current);
			musicFadeIntervalRef.current = null;
		}
		musicFadeFromRef.current = null;
		musicFadeToRef.current = null;
	};

	const stopTownBeachFade = () => {
		if (townBeachFadeIntervalRef.current !== null) {
			window.clearInterval(townBeachFadeIntervalRef.current);
			townBeachFadeIntervalRef.current = null;
		}
	};

	const markBgMusicTransition = (durationMs: number) => {
		bgMusicTransitionUntilRef.current = Date.now() + durationMs + 250;
	};

	const stopStaleBackgroundTracks = () => {
		const now = Date.now();
		const allowed = new Set<HTMLAudioElement>();
		const areaTracks = [
			farmMusicRef.current,
			townMusicRef.current,
			houseMusicRef.current,
			forestMusicRef.current,
			caveMusicRef.current,
			bureaucracyMusicRef.current,
			endOfDayRef.current,
			cafeOrderMusicRef.current,
			beachAmbienceRef.current,
		].filter((t): t is HTMLAudioElement => t !== null);

		if (musicFadeFromRef.current) allowed.add(musicFadeFromRef.current);
		if (musicFadeToRef.current) allowed.add(musicFadeToRef.current);

		if (hasDayTransition) {
			if (endOfDayRef.current) allowed.add(endOfDayRef.current);
		} else if (
			isOrdering ||
			isDoctorCompounding ||
			(isFishing &&
				currentAreaMusicRef.current === cafeOrderMusicRef.current &&
				!!cafeOrderMusicRef.current)
		) {
			if (cafeOrderMusicRef.current) allowed.add(cafeOrderMusicRef.current);
		} else if (!isFishing) {
			const intended = getAreaMusicForMap(playerRef.current.map);
			if (intended) allowed.add(intended);
			if (
				playerRef.current.map === "town" ||
				townBeachFadeIntervalRef.current !== null
			) {
				if (townMusicRef.current) allowed.add(townMusicRef.current);
				if (beachAmbienceRef.current) allowed.add(beachAmbienceRef.current);
			}
		}

		const withinTransitionWindow = now < bgMusicTransitionUntilRef.current;
		areaTracks.forEach((track) => {
			if (allowed.has(track)) return;
			if (withinTransitionWindow) return;
			if (!track.paused) {
				track.pause();
			}
			track.currentTime = 0;
			track.volume = getDesiredVolumeForTrack(track);
		});
	};

	const fadeTownAndBeach = (
		targetTownVolume: number,
		targetBeachVolume: number,
		durationMs = 650,
	) => {
		const townTrack = townMusicRef.current;
		const beachTrack = beachAmbienceRef.current;
		if (!townTrack || !beachTrack) return;
		stopTownBeachFade();
		const startTown = townTrack.volume;
		const startBeach = beachTrack.volume;
		const deltaTown = targetTownVolume - startTown;
		const deltaBeach = targetBeachVolume - startBeach;
		if (Math.abs(deltaTown) < 0.001 && Math.abs(deltaBeach) < 0.001) return;
		markBgMusicTransition(durationMs);
		const tickMs = 50;
		let elapsed = 0;
		townBeachFadeIntervalRef.current = window.setInterval(() => {
			elapsed += tickMs;
			const t = Math.min(elapsed / durationMs, 1);
			townTrack.volume = startTown + deltaTown * t;
			beachTrack.volume = startBeach + deltaBeach * t;
			if (t >= 1) {
				stopTownBeachFade();
			}
		}, tickMs);
	};

	const stopEndOfDaySong = () => {
		const track = endOfDayRef.current;
		if (!track) return;
		track.volume = 1;
		track.loop = false;
		track.pause();
		track.currentTime = 0;
		track.load();
		track.loop = true;
	};

	const fadeOutCurrentAreaMusic = (durationMs = 450) => {
		const track = currentAreaMusicRef.current;
		if (!track) return;
		stopAreaFade();
		musicFadeFromRef.current = track;
		musicFadeToRef.current = null;
		markBgMusicTransition(durationMs);
		const tickMs = 50;
		const startVolume = track.volume;
		let elapsed = 0;
		musicFadeIntervalRef.current = window.setInterval(() => {
			elapsed += tickMs;
			const t = Math.min(elapsed / durationMs, 1);
			track.volume = Math.max(0, startVolume * (1 - t));
			if (t >= 1) {
				stopAreaFade();
				track.pause();
				track.currentTime = 0;
				track.volume = getDesiredVolumeForTrack(track);
				stopStaleBackgroundTracks();
			}
		}, tickMs);
	};

	const switchAreaMusic = (
		target: HTMLAudioElement | null,
		instant = false,
	) => {
		if (!target) return;
		stopAreaFade();
		stopEndOfDaySong();

		const current = currentAreaMusicRef.current;
		if (!current) {
			target.volume = getDesiredVolumeForTrack(target);
			void target.play().catch(() => undefined);
			currentAreaMusicRef.current = target;
			stopStaleBackgroundTracks();
			return;
		}

		if (current === target) {
			if (current.paused) {
				current.volume = getDesiredVolumeForTrack(current);
				void current.play().catch(() => undefined);
			}
			stopStaleBackgroundTracks();
			return;
		}

		if (instant) {
			current.pause();
			current.currentTime = 0;
			target.volume = getDesiredVolumeForTrack(target);
			void target.play().catch(() => undefined);
			currentAreaMusicRef.current = target;
			stopStaleBackgroundTracks();
			return;
		}

		target.volume = 0;
		void target.play().catch(() => undefined);
		const durationMs = 2000;
		musicFadeFromRef.current = current;
		musicFadeToRef.current = target;
		markBgMusicTransition(durationMs);
		const tickMs = 50;
		let elapsed = 0;
		musicFadeIntervalRef.current = window.setInterval(() => {
			elapsed += tickMs;
			const t = Math.min(elapsed / durationMs, 1);
			current.volume = 1 - t;
			target.volume = t;
			if (t >= 1) {
				stopAreaFade();
				current.pause();
				current.currentTime = 0;
				current.volume = getDesiredVolumeForTrack(current);
				target.volume = getDesiredVolumeForTrack(target);
				stopStaleBackgroundTracks();
			}
		}, tickMs);
		currentAreaMusicRef.current = target;
	};

	const crossFadeEndOfDayTo = (target: HTMLAudioElement | null, durationMs = 1000) => {
		const endTrack = endOfDayRef.current;
		const targetVolume = getDesiredVolumeForTrack(target);
		if (!target) {
			stopEndOfDaySong();
			return;
		}
		if (!endTrack) {
			target.volume = targetVolume;
			void target.play().catch(() => undefined);
			currentAreaMusicRef.current = target;
			return;
		}
		stopAreaFade();
		target.volume = 0;
		void target.play().catch(() => undefined);
		musicFadeFromRef.current = endTrack;
		musicFadeToRef.current = target;
		markBgMusicTransition(durationMs);
		const tickMs = 50;
		let elapsed = 0;
		musicFadeIntervalRef.current = window.setInterval(() => {
			elapsed += tickMs;
			const t = Math.min(elapsed / durationMs, 1);
			endTrack.volume = 1 - t;
			target.volume = targetVolume * t;
			if (t >= 1) {
				stopAreaFade();
				endTrack.pause();
				endTrack.currentTime = 0;
				endTrack.volume = 1;
				target.volume = targetVolume;
				currentAreaMusicRef.current = target;
				stopStaleBackgroundTracks();
			}
		}, tickMs);
	};

	return {
		getAreaMusicForMap,
		stopAreaFade,
		stopTownBeachFade,
		stopStaleBackgroundTracks,
		fadeTownAndBeach,
		fadeOutCurrentAreaMusic,
		switchAreaMusic,
		crossFadeEndOfDayTo,
		stopEndOfDaySong,
	};
};
