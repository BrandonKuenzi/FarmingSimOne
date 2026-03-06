import { motion } from "framer-motion";
import type React from "react";
import type { SideViewSceneRuntime } from "../cutscenes";

type Props = {
	scene: SideViewSceneRuntime | null;
	onOk: () => void;
};

export const SideViewCutsceneOverlay = ({ scene, onOk }: Props) => {
	if (!scene || !scene.active) return null;
	const cutsceneTitle =
		scene.cutsceneId === "new_game_rules_intro"
			? "New Game"
			: scene.cutsceneId === "a_dairy_good_surprise"
				? "A Dairy Good Surprise!"
				: scene.cutsceneId === "sheer_delight"
					? "Sheer Delight!"
					: scene.cutsceneId === "bruises_in_the_forest"
						? "Bruises in the Forest"
						: scene.cutsceneId === "you_caved_under_pressure"
							? "You Caved Under Pressure"
							: scene.cutsceneId === "looky_here"
								? "Looky here!"
				: scene.cutsceneId.replace(/_/g, " ");
	const rows = scene.subScene.map.rows;
	const rowCount = rows.length;
	const colCount = Math.max(1, ...rows.map((row) => row.length));

	return (
		<div className='sideview-cutscene-backdrop'>
			<div className='sideview-cutscene-panel'>
				<div className='sideview-cutscene-header'>
					<div className='sideview-cutscene-title'>{cutsceneTitle}</div>
				</div>
				<div
					className='sideview-cutscene-stage'
					style={
						{
							"--svc-cols": String(colCount),
							"--svc-rows": String(rowCount),
						} as React.CSSProperties
					}
				>
					<div
						className='sideview-cutscene-map'
						style={{
							opacity: scene.mapOpacity,
							transition: `opacity ${Math.max(0, scene.mapFadeDurationMs)}ms ease-in-out`,
						}}
					>
						{rows.map((row, y) =>
							row.split("").map((tileId, x) => {
								const tile = scene.subScene.map.legend[tileId] ?? {
									glyph: " ",
									bg: "#111",
									fg: "#f5f5f5",
								};
								return (
									<div
										key={`tile-${x}-${y}`}
										className='sideview-cutscene-tile'
										style={{
											background: tile.bg,
											color: tile.fg,
										}}
									>
										{tile.glyph ?? " "}
									</div>
								);
							}),
						)}
					</div>
					<div className='sideview-cutscene-actors-clip'>
						<div className='sideview-cutscene-actors'>
							{Object.values(scene.actors).map((actor) => {
								const zIndex = (actor.zIndex ?? actor.y) + 100;
								const loopClass = actor.loopAnimation
									? `svc-anim-${actor.loopAnimation}`
									: "";
								const oneShotClass = actor.oneShotAnimation
									? `svc-anim-${actor.oneShotAnimation}`
									: "";
								const oneShotAnimate = actor.oneShotAnimation
									? { scale: [1, 1.08, 1], rotate: [0, -5, 0] }
									: undefined;
								const oneShotTransition = actor.oneShotAnimation
									? { duration: 0.35, ease: "easeInOut" as const }
									: undefined;
								return (
									<motion.div
										key={actor.id}
										className={`sideview-cutscene-actor ${loopClass} ${oneShotClass}`.trim()}
										data-actor-id={actor.id}
										style={{
											left: `calc(${actor.x} * var(--svc-tile-size))`,
											top: `calc(${actor.y} * var(--svc-tile-size))`,
											zIndex,
											transition: `left ${Math.max(1, actor.moveDurationMs)}ms ease-in-out, top ${Math.max(1, actor.moveDurationMs)}ms ease-in-out`,
											background: "transparent",
											color: actor.fg,
										}}
										animate={oneShotAnimate}
										transition={oneShotTransition}
									>
										<span
											key={actor.oneShotKey}
											style={{
												display: "inline-block",
												transform:
													actor.scale && actor.scale !== 1
														? `scale(${actor.scale})`
														: undefined,
											}}
										>
											{actor.glyph}
										</span>
									</motion.div>
								);
							})}
						</div>
					</div>
					<div className='sideview-cutscene-toasts'>
						{scene.toasts.map((toast) => {
							const actor = toast.targetActorId
								? scene.actors[toast.targetActorId]
								: undefined;
							const x = actor?.x ?? toast.targetTile?.x ?? Math.max(0, Math.floor(colCount / 2));
							const baseY = actor?.y ?? toast.targetTile?.y ?? Math.max(0, rowCount - 2);
							const y = Math.max(0, baseY - 1);
							return (
								<motion.div
									key={`svc-toast-${toast.id}`}
									className='sideview-cutscene-toast'
									style={{
										left: `calc(${x} * var(--svc-tile-size))`,
										top: `calc(${y} * var(--svc-tile-size))`,
									}}
									initial={{ opacity: 0, y: 0 }}
									animate={{ opacity: [0, 1, 1, 0], y: [0, -12, -20, -30] }}
									transition={{ duration: Math.max(300, toast.durationMs) / 1000, ease: "easeOut" }}
								>
									{toast.message}
								</motion.div>
							);
						})}
					</div>
				</div>
				<div className='sideview-cutscene-story'>
					{scene.frameStoryText.trim() ? scene.frameStoryText : "\u00A0"}
				</div>
				<div className='sideview-cutscene-hud'>
					<div
						className={`sideview-cutscene-next${scene.readyArrowVisible ? "" : " is-hidden"}`}
						onClick={onOk}
					>
						<span className='sideview-cutscene-next-label'>OK</span>
						<span className='sideview-cutscene-next-arrow'>{"\u{27A1}\u{FE0F}"}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

