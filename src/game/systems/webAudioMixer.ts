type AudioContextLike = AudioContext;

declare global {
	interface Window {
		webkitAudioContext?: typeof AudioContext;
	}
}

type BufferedPlayback = {
	source: AudioBufferSourceNode;
	gain: GainNode;
};

const mediaSourceByElement = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();
const mediaGainByElement = new WeakMap<HTMLAudioElement, GainNode>();
const activeBufferedByElement = new WeakMap<HTMLAudioElement, Set<BufferedPlayback>>();
const activeBufferedElements = new Set<HTMLAudioElement>();
const pendingLoopTokenByElement = new WeakMap<HTMLAudioElement, number>();
const bufferCache = new Map<string, Promise<AudioBuffer>>();

let sharedContext: AudioContextLike | null = null;
let masterGain: GainNode | null = null;
let unlockAttached = false;

const getAudioContext = (): AudioContextLike | null => {
	if (typeof window === "undefined") return null;
	const Ctor = window.AudioContext ?? window.webkitAudioContext;
	if (!Ctor) return null;
	if (!sharedContext) {
		sharedContext = new Ctor();
		masterGain = sharedContext.createGain();
		masterGain.gain.value = 1;
		masterGain.connect(sharedContext.destination);
	}
	return sharedContext;
};

const getMasterGain = (ctx: AudioContextLike): GainNode => {
	if (!masterGain) {
		masterGain = ctx.createGain();
		masterGain.gain.value = 1;
		masterGain.connect(ctx.destination);
	}
	return masterGain;
};

const syncElementGain = (element: HTMLAudioElement) => {
	const gainNode = mediaGainByElement.get(element);
	if (!gainNode) return;
	gainNode.gain.value = element.muted ? 0 : element.volume;
};

export const resumeAudioContext = async (): Promise<void> => {
	const ctx = getAudioContext();
	if (!ctx) return;
	if (ctx.state !== "suspended") return;
	try {
		await ctx.resume();
	} catch {
		// Ignore resume failures and keep HTMLAudio fallback paths working.
	}
};

export const attachAudioContextUnlock = () => {
	if (unlockAttached || typeof window === "undefined") return;
	unlockAttached = true;
	const unlock = () => {
		void resumeAudioContext();
		window.removeEventListener("pointerdown", unlock);
		window.removeEventListener("touchstart", unlock);
		window.removeEventListener("keydown", unlock);
	};
	window.addEventListener("pointerdown", unlock, { passive: true });
	window.addEventListener("touchstart", unlock, { passive: true });
	window.addEventListener("keydown", unlock, { passive: true });
};

export const registerMediaElementTrack = (element: HTMLAudioElement | null) => {
	if (!element) return;
	const ctx = getAudioContext();
	if (!ctx) return;
	if (mediaSourceByElement.has(element)) return;
	try {
		const source = ctx.createMediaElementSource(element);
		const gain = ctx.createGain();
		source.connect(gain);
		gain.connect(getMasterGain(ctx));
		mediaSourceByElement.set(element, source);
		mediaGainByElement.set(element, gain);
		syncElementGain(element);
		element.addEventListener("volumechange", () => {
			syncElementGain(element);
		});
	} catch {
		// Creating MediaElementSource can fail in edge cases; fallback remains HTMLAudio.
	}
};

const getActiveBufferedSet = (element: HTMLAudioElement): Set<BufferedPlayback> => {
	let active = activeBufferedByElement.get(element);
	if (!active) {
		active = new Set<BufferedPlayback>();
		activeBufferedByElement.set(element, active);
	}
	return active;
};

const clearPlayback = (element: HTMLAudioElement, playback: BufferedPlayback) => {
	const active = activeBufferedByElement.get(element);
	if (active) {
		active.delete(playback);
		if (active.size === 0) {
			activeBufferedByElement.delete(element);
			activeBufferedElements.delete(element);
		}
	}
};

const loadBuffer = async (
	ctx: AudioContextLike,
	url: string,
): Promise<AudioBuffer | null> => {
	let entry = bufferCache.get(url);
	if (!entry) {
		entry = fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Failed to fetch audio: ${response.status}`);
				}
				return response.arrayBuffer();
			})
			.then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer.slice(0)));
		bufferCache.set(url, entry);
	}
	try {
		return await entry;
	} catch {
		bufferCache.delete(url);
		return null;
	}
};

const nextLoopToken = (element: HTMLAudioElement): number => {
	const next = (pendingLoopTokenByElement.get(element) ?? 0) + 1;
	pendingLoopTokenByElement.set(element, next);
	return next;
};

export const playBufferedOneShot = async (
	element: HTMLAudioElement | null,
): Promise<boolean> => {
	if (!element) return false;
	const src = element.currentSrc || element.src;
	if (!src) return false;
	const ctx = getAudioContext();
	if (!ctx) return false;
	await resumeAudioContext();
	const buffer = await loadBuffer(ctx, src);
	if (!buffer) return false;

	const source = ctx.createBufferSource();
	const gain = ctx.createGain();
	source.buffer = buffer;
	gain.gain.value = element.muted ? 0 : element.volume;
	source.connect(gain);
	gain.connect(getMasterGain(ctx));
	const playback: BufferedPlayback = { source, gain };
	getActiveBufferedSet(element).add(playback);
	activeBufferedElements.add(element);
	source.onended = () => {
		clearPlayback(element, playback);
		source.disconnect();
		gain.disconnect();
	};
	source.start(0);
	return true;
};

export const startBufferedLoop = async (
	element: HTMLAudioElement | null,
): Promise<boolean> => {
	if (!element) return false;
	const src = element.currentSrc || element.src;
	if (!src) return false;
	const ctx = getAudioContext();
	if (!ctx) return false;
	const token = nextLoopToken(element);
	await resumeAudioContext();
	const buffer = await loadBuffer(ctx, src);
	if (!buffer) return false;
	if ((pendingLoopTokenByElement.get(element) ?? 0) !== token) return true;

	stopBufferedSound(element, { preservePendingLoopToken: true });
	const source = ctx.createBufferSource();
	const gain = ctx.createGain();
	source.buffer = buffer;
	source.loop = true;
	gain.gain.value = element.muted ? 0 : element.volume;
	source.connect(gain);
	gain.connect(getMasterGain(ctx));
	const playback: BufferedPlayback = { source, gain };
	getActiveBufferedSet(element).add(playback);
	activeBufferedElements.add(element);
	source.onended = () => {
		clearPlayback(element, playback);
		source.disconnect();
		gain.disconnect();
	};
	source.start(0);
	return true;
};

export const hasBufferedPlayback = (element: HTMLAudioElement | null): boolean => {
	if (!element) return false;
	return (activeBufferedByElement.get(element)?.size ?? 0) > 0;
};

export const stopBufferedSound = (
	element: HTMLAudioElement | null,
	options?: { preservePendingLoopToken?: boolean },
): boolean => {
	if (!element) return false;
	if (!options?.preservePendingLoopToken) {
		nextLoopToken(element);
	}
	const active = activeBufferedByElement.get(element);
	if (!active || active.size === 0) return false;
	Array.from(active).forEach((playback) => {
		try {
			playback.source.stop();
		} catch {
			// Ignore nodes that already ended.
		}
		playback.source.disconnect();
		playback.gain.disconnect();
	});
	active.clear();
	activeBufferedByElement.delete(element);
	activeBufferedElements.delete(element);
	return true;
};

export const fadeOutBufferedSound = (args: {
	element: HTMLAudioElement | null;
	durationMs: number;
	intervalRef: { current: number | null };
}): boolean => {
	const { element, durationMs, intervalRef } = args;
	if (!element) return false;
	const active = activeBufferedByElement.get(element);
	if (!active || active.size === 0) return false;
	if (intervalRef.current !== null) {
		window.clearTimeout(intervalRef.current);
		intervalRef.current = null;
	}
	const ctx = getAudioContext();
	if (!ctx) return false;
	const now = ctx.currentTime;
	const endAt = now + Math.max(durationMs, 1) / 1000;
	Array.from(active).forEach((playback) => {
		const current = playback.gain.gain.value;
		playback.gain.gain.cancelScheduledValues(now);
		playback.gain.gain.setValueAtTime(current, now);
		playback.gain.gain.linearRampToValueAtTime(0, endAt);
	});
	intervalRef.current = window.setTimeout(() => {
		stopBufferedSound(element);
		element.volume = 1;
		intervalRef.current = null;
	}, durationMs);
	return true;
};

export const stopAllBufferedAudio = () => {
	Array.from(activeBufferedElements).forEach((element) => {
		stopBufferedSound(element);
	});
};
