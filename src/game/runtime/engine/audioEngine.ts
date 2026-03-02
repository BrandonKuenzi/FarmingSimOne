import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { PetEmoji } from "../../shared/types";
import { GLYPH } from "../../config/glyphs";
import {
	fadeOutAndStopSound,
	initializeSharedAudioGraph,
	playOneShot,
	startLoopSound,
	stopAndResetSound,
} from "../../systems/sound";
import { speakLine } from "../../systems/tts";

type AudioRef = MutableRefObject<HTMLAudioElement | null>;
type TimerRef = MutableRefObject<number | null>;

type AudioSources = {
	bgMusicSrc: string;
	bgFarmSrc: string;
	townBGSrc: string;
	beachAmbienceSrc: string;
	chaChingSrc: string;
	endOfDaySrc: string;
	hoeSoundSrc: string;
	munchSoundSrc: string;
	badSoundSrc: string;
	waterSoundSrc: string;
	yayaSoundSrc: string;
	tooTiredSoundSrc: string;
	cafeOrderMusicSrc: string;
	notificationSoundSrc: string;
	forestMusicSrc: string;
	caveMusicSrc: string;
	spaceBgSrc: string;
	gotRewardSoundSrc: string;
	snakeSoundSrc: string;
	bearSoundSrc: string;
	pooSoundSrc: string;
	bathSoundSrc: string;
	pluckSoundSrc: string;
	ploopSoundSrc: string;
	seagullsSoundSrc: string;
	meowSoundSrc: string;
	woofSoundSrc: string;
	tractorSoundSrc: string;
	sighSoundSrc: string;
	whooshSoundSrc: string;
	battleMusicSrc: string;
	badWater1SoundSrc: string;
	badWater2SoundSrc: string;
	badWater3SoundSrc: string;
	badWater4SoundSrc: string;
	badWater5SoundSrc: string;
	badWater6SoundSrc: string;
};

type AudioRefs = {
	notificationRef: AudioRef;
	farmMusicRef: AudioRef;
	townMusicRef: AudioRef;
	beachAmbienceRef: AudioRef;
	houseMusicRef: AudioRef;
	forestMusicRef: AudioRef;
	caveMusicRef: AudioRef;
	bureaucracyMusicRef: AudioRef;
	chaChingRef: AudioRef;
	endOfDayRef: AudioRef;
	hoeSoundRef: AudioRef;
	munchSoundRef: AudioRef;
	badSoundRef: AudioRef;
	waterSoundRef: AudioRef;
	yayaSoundRef: AudioRef;
	tooTiredRef: AudioRef;
	gotRewardRef: AudioRef;
	snakeSoundRef: AudioRef;
	bearSoundRef: AudioRef;
	pooSoundRef: AudioRef;
	bathSoundRef: AudioRef;
	pluckSoundRef: AudioRef;
	ploopSoundRef: AudioRef;
	seagullsSoundRef: AudioRef;
	meowSoundRef: AudioRef;
	woofSoundRef: AudioRef;
	tractorSoundRef: AudioRef;
	sighSoundRef: AudioRef;
	whooshSoundRef: AudioRef;
	battleMusicRef: AudioRef;
	badWater1SoundRef: AudioRef;
	badWater2SoundRef: AudioRef;
	badWater3SoundRef: AudioRef;
	badWater4SoundRef: AudioRef;
	badWater5SoundRef: AudioRef;
	badWater6SoundRef: AudioRef;
	cafeOrderMusicRef: AudioRef;
	currentAreaMusicRef: AudioRef;
	ttsReadyRef: MutableRefObject<boolean>;
};

type InitAudioEngineArgs = {
	shellRef: MutableRefObject<HTMLDivElement | null>;
	refs: AudioRefs;
	sources: AudioSources;
};

export const initializeAudioEngine = ({
	shellRef,
	refs,
	sources,
}: InitAudioEngineArgs): void => {
	shellRef.current?.focus();
	refs.notificationRef.current = new Audio(sources.notificationSoundSrc);
	refs.notificationRef.current.preload = "auto";
	refs.farmMusicRef.current = new Audio(sources.bgFarmSrc);
	refs.farmMusicRef.current.preload = "auto";
	refs.farmMusicRef.current.loop = true;
	refs.townMusicRef.current = new Audio(sources.townBGSrc);
	refs.townMusicRef.current.preload = "auto";
	refs.townMusicRef.current.loop = true;
	refs.beachAmbienceRef.current = new Audio(sources.beachAmbienceSrc);
	refs.beachAmbienceRef.current.preload = "auto";
	refs.beachAmbienceRef.current.loop = true;
	refs.beachAmbienceRef.current.volume = 0;
	refs.houseMusicRef.current = new Audio(sources.bgMusicSrc);
	refs.houseMusicRef.current.preload = "auto";
	refs.houseMusicRef.current.loop = true;
	refs.forestMusicRef.current = new Audio(sources.forestMusicSrc);
	refs.forestMusicRef.current.preload = "auto";
	refs.forestMusicRef.current.loop = true;
	refs.caveMusicRef.current = new Audio(sources.caveMusicSrc);
	refs.caveMusicRef.current.preload = "auto";
	refs.caveMusicRef.current.loop = true;
	refs.bureaucracyMusicRef.current = new Audio(sources.spaceBgSrc);
	refs.bureaucracyMusicRef.current.preload = "auto";
	refs.bureaucracyMusicRef.current.loop = true;
	refs.chaChingRef.current = new Audio(sources.chaChingSrc);
	refs.chaChingRef.current.preload = "auto";
	refs.endOfDayRef.current = new Audio(sources.endOfDaySrc);
	refs.endOfDayRef.current.preload = "auto";
	refs.endOfDayRef.current.loop = true;
	refs.hoeSoundRef.current = new Audio(sources.hoeSoundSrc);
	refs.hoeSoundRef.current.preload = "auto";
	refs.munchSoundRef.current = new Audio(sources.munchSoundSrc);
	refs.munchSoundRef.current.preload = "auto";
	refs.badSoundRef.current = new Audio(sources.badSoundSrc);
	refs.badSoundRef.current.preload = "auto";
	refs.waterSoundRef.current = new Audio(sources.waterSoundSrc);
	refs.waterSoundRef.current.preload = "auto";
	refs.yayaSoundRef.current = new Audio(sources.yayaSoundSrc);
	refs.yayaSoundRef.current.preload = "auto";
	refs.tooTiredRef.current = new Audio(sources.tooTiredSoundSrc);
	refs.tooTiredRef.current.preload = "auto";
	refs.gotRewardRef.current = new Audio(sources.gotRewardSoundSrc);
	refs.gotRewardRef.current.preload = "auto";
	refs.snakeSoundRef.current = new Audio(sources.snakeSoundSrc);
	refs.snakeSoundRef.current.preload = "auto";
	refs.bearSoundRef.current = new Audio(sources.bearSoundSrc);
	refs.bearSoundRef.current.preload = "auto";
	refs.pooSoundRef.current = new Audio(sources.pooSoundSrc);
	refs.pooSoundRef.current.preload = "auto";
	refs.bathSoundRef.current = new Audio(sources.bathSoundSrc);
	refs.bathSoundRef.current.preload = "auto";
	refs.pluckSoundRef.current = new Audio(sources.pluckSoundSrc);
	refs.pluckSoundRef.current.preload = "auto";
	refs.ploopSoundRef.current = new Audio(sources.ploopSoundSrc);
	refs.ploopSoundRef.current.preload = "auto";
	refs.seagullsSoundRef.current = new Audio(sources.seagullsSoundSrc);
	refs.seagullsSoundRef.current.preload = "auto";
	refs.meowSoundRef.current = new Audio(sources.meowSoundSrc);
	refs.meowSoundRef.current.preload = "auto";
	refs.woofSoundRef.current = new Audio(sources.woofSoundSrc);
	refs.woofSoundRef.current.preload = "auto";
	refs.tractorSoundRef.current = new Audio(sources.tractorSoundSrc);
	refs.tractorSoundRef.current.preload = "auto";
	refs.tractorSoundRef.current.loop = true;
	refs.sighSoundRef.current = new Audio(sources.sighSoundSrc);
	refs.sighSoundRef.current.preload = "auto";
	refs.whooshSoundRef.current = new Audio(sources.whooshSoundSrc);
	refs.whooshSoundRef.current.preload = "auto";
	refs.cafeOrderMusicRef.current = new Audio(sources.cafeOrderMusicSrc);
	refs.cafeOrderMusicRef.current.preload = "auto";
	refs.cafeOrderMusicRef.current.loop = true;
	refs.battleMusicRef.current = new Audio(sources.battleMusicSrc);
	refs.battleMusicRef.current.preload = "auto";
	refs.battleMusicRef.current.loop = true;
	refs.badWater1SoundRef.current = new Audio(sources.badWater1SoundSrc);
	refs.badWater1SoundRef.current.preload = "auto";
	refs.badWater2SoundRef.current = new Audio(sources.badWater2SoundSrc);
	refs.badWater2SoundRef.current.preload = "auto";
	refs.badWater3SoundRef.current = new Audio(sources.badWater3SoundSrc);
	refs.badWater3SoundRef.current.preload = "auto";
	refs.badWater4SoundRef.current = new Audio(sources.badWater4SoundSrc);
	refs.badWater4SoundRef.current.preload = "auto";
	refs.badWater5SoundRef.current = new Audio(sources.badWater5SoundSrc);
	refs.badWater5SoundRef.current.preload = "auto";
	refs.badWater6SoundRef.current = new Audio(sources.badWater6SoundSrc);
	refs.badWater6SoundRef.current.preload = "auto";
	initializeSharedAudioGraph([
		refs.notificationRef.current,
		refs.farmMusicRef.current,
		refs.townMusicRef.current,
		refs.beachAmbienceRef.current,
		refs.houseMusicRef.current,
		refs.forestMusicRef.current,
		refs.caveMusicRef.current,
		refs.bureaucracyMusicRef.current,
		refs.chaChingRef.current,
		refs.endOfDayRef.current,
		refs.hoeSoundRef.current,
		refs.munchSoundRef.current,
		refs.badSoundRef.current,
		refs.waterSoundRef.current,
		refs.yayaSoundRef.current,
		refs.tooTiredRef.current,
		refs.gotRewardRef.current,
		refs.snakeSoundRef.current,
		refs.bearSoundRef.current,
		refs.pooSoundRef.current,
		refs.bathSoundRef.current,
		refs.pluckSoundRef.current,
		refs.ploopSoundRef.current,
		refs.seagullsSoundRef.current,
		refs.meowSoundRef.current,
		refs.woofSoundRef.current,
		refs.tractorSoundRef.current,
		refs.sighSoundRef.current,
		refs.whooshSoundRef.current,
		refs.cafeOrderMusicRef.current,
		refs.battleMusicRef.current,
		refs.badWater1SoundRef.current,
		refs.badWater2SoundRef.current,
		refs.badWater3SoundRef.current,
		refs.badWater4SoundRef.current,
		refs.badWater5SoundRef.current,
		refs.badWater6SoundRef.current,
	]);
	refs.ttsReadyRef.current =
		typeof window !== "undefined" && "speechSynthesis" in window;
};

type AudioActionsArgs = {
	refs: AudioRefs;
	seagullsFadeIntervalRef: TimerRef;
	tiredDuckTimeoutRef: TimerRef;
	tiredFaceTimeoutRef: TimerRef;
	setShowTiredFace: Dispatch<SetStateAction<boolean>>;
};

export const createAudioActions = ({
	refs,
	seagullsFadeIntervalRef,
	tiredDuckTimeoutRef,
	tiredFaceTimeoutRef,
	setShowTiredFace,
}: AudioActionsArgs) => {
	const playNotification = () => {
		playOneShot(refs.notificationRef.current);
	};

	const playChaChing = () => {
		playOneShot(refs.chaChingRef.current);
	};

	const playHoe = () => {
		playOneShot(refs.hoeSoundRef.current);
	};

	const playMunch = () => {
		playOneShot(refs.munchSoundRef.current);
	};

	const playBad = () => {
		playOneShot(refs.badSoundRef.current);
	};

	const playTooTired = () => {
		playOneShot(refs.tooTiredRef.current);
		setShowTiredFace(true);
		if (tiredFaceTimeoutRef.current !== null) {
			window.clearTimeout(tiredFaceTimeoutRef.current);
		}
		tiredFaceTimeoutRef.current = window.setTimeout(() => {
			setShowTiredFace(false);
			tiredFaceTimeoutRef.current = null;
		}, 1000);

		const track = refs.currentAreaMusicRef.current;
		if (!track) return;
		track.volume = 0.2;
		if (tiredDuckTimeoutRef.current !== null) {
			window.clearTimeout(tiredDuckTimeoutRef.current);
		}
		tiredDuckTimeoutRef.current = window.setTimeout(() => {
			if (refs.currentAreaMusicRef.current) {
				refs.currentAreaMusicRef.current.volume = 1;
			}
			tiredDuckTimeoutRef.current = null;
		}, 1000);
	};

	const playWater = () => {
		playOneShot(refs.waterSoundRef.current);
	};

	const playYaya = () => {
		playOneShot(refs.yayaSoundRef.current);
	};

	const playGotReward = () => {
		playOneShot(refs.gotRewardRef.current);
	};

	const playSnakeSound = () => {
		playOneShot(refs.snakeSoundRef.current);
	};

	const playBearSound = () => {
		playOneShot(refs.bearSoundRef.current);
	};

	const playPooSound = () => {
		playOneShot(refs.pooSoundRef.current);
	};

	const playBath = () => {
		playOneShot(refs.bathSoundRef.current);
	};

	const playPluck = () => {
		playOneShot(refs.pluckSoundRef.current);
	};

	const playPloop = () => {
		playOneShot(refs.ploopSoundRef.current);
	};

	const playSeagulls = () => {
		const sound = refs.seagullsSoundRef.current;
		if (!sound) return;
		if (seagullsFadeIntervalRef.current !== null) {
			window.clearInterval(seagullsFadeIntervalRef.current);
			seagullsFadeIntervalRef.current = null;
		}
		sound.volume = 1;
		playOneShot(sound);
	};

	const fadeOutSeagulls = (durationMs = 650) => {
		fadeOutAndStopSound({
			sound: refs.seagullsSoundRef.current,
			durationMs,
			intervalRef: seagullsFadeIntervalRef,
		});
	};

	const playPetSound = (pet: PetEmoji) => {
		const isCat = pet === GLYPH.cat || pet === GLYPH.blackCat;
		const sound = isCat ? refs.meowSoundRef.current : refs.woofSoundRef.current;
		playOneShot(sound);
	};

	const startTractorLoop = () => {
		startLoopSound(refs.tractorSoundRef.current, 0.7);
	};

	const stopTractorLoop = () => {
		stopAndResetSound(refs.tractorSoundRef.current);
	};

	const playSigh = () => {
		playOneShot(refs.sighSoundRef.current);
	};

	const playWhoosh = () => {
		playOneShot(refs.whooshSoundRef.current);
	};

	const playBadWaterSound = (
		soundId:
			| "badWater1"
			| "badWater2"
			| "badWater3"
			| "badWater4"
			| "badWater5"
			| "badWater6",
	) => {
		if (soundId === "badWater1") {
			playOneShot(refs.badWater1SoundRef.current);
			return;
		}
		if (soundId === "badWater2") {
			playOneShot(refs.badWater2SoundRef.current);
			return;
		}
		if (soundId === "badWater3") {
			playOneShot(refs.badWater3SoundRef.current);
			return;
		}
		if (soundId === "badWater4") {
			playOneShot(refs.badWater4SoundRef.current);
			return;
		}
		if (soundId === "badWater5") {
			playOneShot(refs.badWater5SoundRef.current);
			return;
		}
		playOneShot(refs.badWater6SoundRef.current);
	};

	const startBattleMusicLoop = () => {
		startLoopSound(refs.battleMusicRef.current, 0.7);
	};

	const stopBattleMusicLoop = () => {
		stopAndResetSound(refs.battleMusicRef.current);
	};

	const speakNpcLine = (line: string) => {
		speakLine(line, refs.ttsReadyRef.current);
	};

	return {
		playNotification,
		playChaChing,
		playHoe,
		playMunch,
		playBad,
		playTooTired,
		playWater,
		playYaya,
		playGotReward,
		playSnakeSound,
		playBearSound,
		playPooSound,
		playBath,
		playPluck,
		playPloop,
		playSeagulls,
		fadeOutSeagulls,
		playPetSound,
		startTractorLoop,
		stopTractorLoop,
		playSigh,
		playWhoosh,
		playBadWaterSound,
		startBattleMusicLoop,
		stopBattleMusicLoop,
		speakNpcLine,
	};
};
