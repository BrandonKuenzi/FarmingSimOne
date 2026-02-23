type AudioLike = HTMLAudioElement | null;

export const playOneShot = (sound: AudioLike) => {
	if (!sound) return;
	sound.currentTime = 0;
	void sound.play().catch(() => undefined);
};

export const startLoopSound = (sound: AudioLike, volume = 1) => {
	if (!sound) return;
	sound.volume = volume;
	sound.currentTime = 0;
	void sound.play().catch(() => undefined);
};

export const stopAndResetSound = (sound: AudioLike) => {
	if (!sound) return;
	sound.pause();
	sound.currentTime = 0;
};

export const fadeOutAndStopSound = (ctx: {
	sound: AudioLike;
	durationMs?: number;
	intervalRef: { current: number | null };
}) => {
	const durationMs = ctx.durationMs ?? 650;
	const sound = ctx.sound;
	if (!sound) return;
	if (ctx.intervalRef.current !== null) {
		window.clearInterval(ctx.intervalRef.current);
		ctx.intervalRef.current = null;
	}
	if (sound.paused || sound.volume <= 0) {
		sound.volume = 1;
		return;
	}
	const tickMs = 50;
	const startVolume = sound.volume;
	let elapsed = 0;
	ctx.intervalRef.current = window.setInterval(() => {
		elapsed += tickMs;
		const t = Math.min(elapsed / durationMs, 1);
		sound.volume = Math.max(0, startVolume * (1 - t));
		if (t >= 1) {
			if (ctx.intervalRef.current !== null) {
				window.clearInterval(ctx.intervalRef.current);
				ctx.intervalRef.current = null;
			}
			sound.pause();
			sound.currentTime = 0;
			sound.volume = 1;
		}
	}, tickMs);
};
