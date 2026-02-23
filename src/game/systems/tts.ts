export const speakLine = (line: string, enabled: boolean) => {
	if (!enabled) return;
	const synth = window.speechSynthesis;
	try {
		synth.cancel();
		const utterance = new SpeechSynthesisUtterance(line);
		const voice = synth
			.getVoices()
			.find((v) => v.lang?.toLowerCase().startsWith("en"));
		if (voice) utterance.voice = voice;
		utterance.rate = 1;
		utterance.pitch = 1;
		utterance.volume = 1;
		synth.speak(utterance);
	} catch {
		// Ignore TTS issues so gameplay isn't interrupted.
	}
};
