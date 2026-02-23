import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { createDayTransitionStars } from "./content/dayTransition";
import { parseSaveGame } from "./state/saveGame";
import { useGameRuntime } from "./runtime/useGameRuntime";

const titleA = [
	"The Great",
	"Betty Jones Presents -",
	"Dr. Jones and the",
	"The Committee's",
	"A Modest",
	"Official",
] as const;

const titleB = [
	"Mysterious",
	"Simple",
	"Potato-Filled",
	"Unregulated",
	"Bureaucratic",
	"Unnecessarily Complicated",
] as const;

const titleC = [
	"Adventure",
	"Farming Sim",
	"Time Waster",
	"Project",
	"Progress Initiative",
	"Rural Event",
] as const;

const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]!;

function RuntimeHost({ bootSaveJson }: { bootSaveJson: string | null }) {
	return useGameRuntime({ bootSaveJson });
}

export default function GameApp() {
	const [started, setStarted] = useState(false);
	const [startMode, setStartMode] = useState<"new" | "load">("new");
	const [bootSaveJson, setBootSaveJson] = useState<string | null>(null);
	const [runtimeSessionId, setRuntimeSessionId] = useState(0);
	const [titleError, setTitleError] = useState<string | null>(null);
	const title = useMemo(() => `${pick(titleA)} ${pick(titleB)} ${pick(titleC)}`, []);
	const titleStars = useMemo(() => createDayTransitionStars(), []);

	const startNewGame = () => {
		setTitleError(null);
		setStartMode("new");
		setBootSaveJson(null);
		setRuntimeSessionId((prev) => prev + 1);
		setStarted(true);
	};
	const startLoadedGame = () => {
		const picker = document.createElement("input");
		picker.type = "file";
		picker.accept = ".json,application/json";
		picker.onchange = () => {
			const file = picker.files?.[0];
			if (!file) return;
			void file
				.text()
				.then((text) => {
					const parsed = parseSaveGame(text);
					if (!parsed) {
						setTitleError("That file is not a valid save.");
						return;
					}
					setTitleError(null);
					setStartMode("load");
					setBootSaveJson(text);
					setRuntimeSessionId((prev) => prev + 1);
					setStarted(true);
				})
				.catch(() => {
					setTitleError("Could not read that file.");
				});
		};
		picker.click();
	};

	const waitingForLoadBoot = started && startMode === "load" && !bootSaveJson;

	if (!started || waitingForLoadBoot) {
		return (
			<div className='title-screen'>
				<div className='day-stars-layer title-stars-layer'>
					{titleStars.map((star) => (
						<motion.div
							key={`title-star-${star.id}`}
							className='day-star'
							style={{
								left: `${star.left}%`,
								top: `${star.top}%`,
								fontSize: `${star.size}px`,
							}}
							initial={{ opacity: 0, scale: 1 }}
							animate={{ opacity: [0, 0.35, 0], scale: [1, 1.03, 1] }}
							transition={{
								duration: star.duration,
								delay: 0,
								repeat: Infinity,
								ease: "linear",
							}}
						>
							{star.glyph}
						</motion.div>
					))}
				</div>
				<div className='title-main'>{title}</div>
				<div className='title-actions'>
					<button
						type='button'
						className='title-action'
						onClick={startNewGame}
					>
						New Game
					</button>
					<button
						type='button'
						className='title-action'
						onClick={startLoadedGame}
					>
						Load Game
					</button>
					{titleError && <div className='title-error'>{titleError}</div>}
				</div>
			</div>
		);
	}

	return (
		<RuntimeHost
			key={runtimeSessionId}
			bootSaveJson={bootSaveJson}
		/>
	);
}
