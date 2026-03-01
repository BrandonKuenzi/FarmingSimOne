import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { createDayTransitionStars } from "./content/dayTransition";
import { parseSaveGame } from "./state/saveGame";
import { useGameRuntime } from "./runtime/useGameRuntime";

const titleA = [
	"The Great",
	"The Slightly Concerned",
	"The Extremely Official",
	"The Deeply Unnecessary",
	"The Mildly Alarming",
	"The Highly Questionable",
	"The Somewhat Damp",
	"The Unexpected",
	"The Totally Legitimate",
	"The Suspiciously Affordable",
	"The Gently Used",
	"The Spiritually Confusing",
	"The Heroic",
	"The Barely Funded",
	"The Alarmingly Cheerful",
	"The Moderately Haunted",
	"The Almost Approved",
	"The Emotionally Invested",
	"The Wildly Inaccurate",
	"The Enthusiastically Misguided",
	"The Proudly Underqualified",
	"The Reluctantly Famous",
	"The Publicly Denied",
	"The Previously Cancelled",
	"The Definitely Not Cursed",
	"The Dramatically Overstated",
	"The Entirely Preventable",
	"The Mildly Fermented",
	"The Lightly Toasted",
	"The Aggressively Average",
	"The Comfortably Mediocre",
	"The Chronically Online",
	"The Bare Minimum",
	"The Excessively Detailed",
	"The Slightly Sticky",
	"The Gently Screaming",
	"The Heroically Misplaced",
	"The Long Awaited",
	"The Poorly Explained",
	"The Very Competitive",
	"The Unexpectedly Loud",
	"The Unreasonably Popular",
	"The Emotionally Supportive",
	"The Overly Ambitious",
	"The Deeply Rural",
	"The Proudly Agricultural",
	"The Totally Real",
	"The Slightly Enhanced",
	"The Modestly Ambitious",
	"The Endorsed By Nobody",
	"The Lightly Regulated",
	"The Nearly Legal",
	"The Tastefully Dramatic",
	"The Surprisingly Edible",
	"The Historically Inaccurate",
	"The Completely Normal",
	"The Whispered About",
	"The Overly Documented",
	"The Farm Adjacent",
	"The Spiritually Organic",
] as const;

const titleB = [
	"Mysterious",
	"Simple",
	"Potato-Filled",
	"Unregulated",
	"Bureaucratic",
	"Unnecessarily Complicated",
	"Lightly Taxed",
	"Emotionally Charged",
	"Highly Classified",
	"Budget-Friendly",
	"Over-Engineered",
	"Under-Explained",
	"Moderately Suspicious",
	"Farm-Adjacent",
	"Locally Sourced",
	"Free-Range",
	"Artisanal",
	"Handcrafted",
	"Grass-Fed",
	"Emotionally Stable",
	"Emotionally Unstable",
	"Government-Issued",
	"Committee-Approved",
	"Intern-Managed",
	"Heroically Misunderstood",
	"Poorly Funded",
	"Crowd-Controlled",
	"Community-Reviewed",
	"Spiritually Guided",
	"Data-Driven",
	"AI-Assisted",
	"Manually Sorted",
	"Seasonally Aware",
	"Weather-Resistant",
	"Neighbor-Endorsed",
	"Vaguely Magical",
	"Scientifically Dubious",
	"Morally Flexible",
	"Time-Consuming",
	"Progress-Oriented",
	"Yield-Optimized",
	"Over-Watered",
	"Under-Prepared",
	"Harvest-Ready",
	"Emotionally Harvested",
	"Farm-Certified",
	"Premium Grade",
	"Deluxe Edition",
	"Extended Warranty",
	"Extra Crispy",
	"Low-Effort",
	"High-Stakes",
	"Risk-Managed",
	"Crop-Compatible",
	"Barn-Focused",
	"Field-Tested",
	"Village-Approved",
	"Algorithmically Balanced",
	"Player-Controlled",
	"Achievement-Driven",
	"Strategically Chaotic",
	"Productivity-Adjacent",
	"Yield-Sensitive",
] as const;

const titleC = [
	"Adventure",
	"Farming Sim",
	"Time Waster",
	"Project",
	"Progress Initiative",
	"Rural Event",
	"Harvest Experience",
	"Agricultural Odyssey",
	"Potato Protocol",
	"Barnyard Saga",
	"Crop Expansion Pack",
	"Field Operations",
	"Village Simulator",
	"Yield Campaign",
	"Productivity Loop",
	"Growth Program",
	"Seasonal Deployment",
	"Strategic Farm Effort",
	"Resource Management Situation",
	"Community Outreach Program",
	"Rural Optimization Tool",
	"Harvest Festival",
	"Barn Management Suite",
	"Crop Logistics Platform",
	"Agricultural Compliance Exercise",
	"Potato Enhancement Module",
	"Livestock Initiative",
	"Farm-Based Narrative",
	"Rural Progress Simulator",
	"Growth Strategy",
	"Harvest Development Plan",
	"Yield Forecast",
	"Village Engagement Program",
	"Agricultural Sandbox",
	"Time Investment Opportunity",
	"Barnyard Expansion",
	"Crop Rotation Experience",
	"Rural Productivity Engine",
	"Seasonal Farming Event",
	"Field-Based Simulation",
	"Strategic Harvest Initiative",
	"Village Growth Protocol",
	"Potato Accumulation System",
	"Livestock Coordination Project",
	"Crop-Based Adventure",
	"Rural Progress Framework",
	"Agricultural Growth Platform",
	"Harvest Management Experience",
	"Field Optimization Program",
	"Barnyard Productivity Loop",
	"Strategic Farming Scenario",
	"Village Development Effort",
	"Crop Expansion Strategy",
	"Potato-Centric Campaign",
	"Rural Engagement Initiative",
	"Agricultural Advancement System",
	"Yield Maximization Project",
	"Harvest Coordination Suite",
	"Farm-Based Tactical Experience",
] as const;

const pick = <T,>(items: readonly T[]) =>
	items[Math.floor(Math.random() * items.length)]!;

function RuntimeHost({ bootSaveJson }: { bootSaveJson: string | null }) {
	return useGameRuntime({ bootSaveJson });
}

export default function GameApp() {
	const [started, setStarted] = useState(false);
	const [startMode, setStartMode] = useState<"new" | "load">("new");
	const [bootSaveJson, setBootSaveJson] = useState<string | null>(null);
	const [runtimeSessionId, setRuntimeSessionId] = useState(0);
	const [titleError, setTitleError] = useState<string | null>(null);
	const title = useMemo(
		() => `${pick(titleA)} ${pick(titleB)} ${pick(titleC)}`,
		[],
	);
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
