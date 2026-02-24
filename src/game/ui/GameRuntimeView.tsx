import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { GameRuntimeViewModel } from "./viewModel";
import { BUREAUCRACY_EXIT_POS } from "../world/layout";
import { GLYPH } from "../config/glyphs";

const bureaucracyFloppyGlyphs = [GLYPH.floppyDisk, GLYPH.hardDisk] as const;
const CLOUD_VERTICAL_SCROLL_RANGE_PCT = 16;
const getBureaucracyStarGlyph = (star: { id: number; left: number; top: number; glyph: string }) => {
	const roll = (star.id * 17 + Math.floor(star.left) + Math.floor(star.top)) % 10;
	if (roll < 2) {
		return bureaucracyFloppyGlyphs[roll % bureaucracyFloppyGlyphs.length]!;
	}
	return star.glyph;
};

type MapViewportCtx = Pick<
	GameRuntimeViewModel,
	| "activeMapLayouts"
	| "player"
	| "isWindSlashOn"
	| "renderedMap"
	| "mapZoom"
	| "cameraTarget"
	| "plots"
	| "keyForPos"
	| "currentWeather"
	| "groundClassForTile"
	| "isShopMap"
	| "shopDecorByMap"
	| "isFarmHouseDoorTile"
	| "getDoorGroundClass"
	| "isDrivingTractor"
	| "fishing"
	| "showTiredFace"
	| "playerEmoji"
	| "waterRefillTile"
	| "isRippleWaterTile"
	| "waterRipplePhase"
	| "isAnimatedGrassTile"
	| "grassFoliageVariant"
	| "caveLadderPos"
	| "caveRubble"
	| "toVisual"
	| "spriteTilesNeedingGround"
	| "petFacing"
	| "tractorFacing"
	| "showForestHit"
	| "getForestFogOpacity"
	| "getCaveFogOpacity"
	| "clouds"
	| "setClouds"
	| "cloudOverlayVisible"
	| "unfedAnimalMap"
	| "unfedAnimalTileKeys"
	| "dayTransitionStarsState"
>;

const MapViewport = ({ ctx }: { ctx: MapViewportCtx }) => {
	const {
		activeMapLayouts,
		player,
		isWindSlashOn,
		renderedMap,
		mapZoom,
		cameraTarget,
		plots,
		keyForPos,
		currentWeather,
		groundClassForTile,
		isShopMap,
		shopDecorByMap,
		isFarmHouseDoorTile,
		getDoorGroundClass,
		fishing,
		isDrivingTractor,
		showTiredFace,
		playerEmoji,
		waterRefillTile,
		isRippleWaterTile,
		waterRipplePhase,
		isAnimatedGrassTile,
		grassFoliageVariant,
		caveLadderPos,
		caveRubble,
		toVisual,
		spriteTilesNeedingGround,
		petFacing,
		tractorFacing,
		showForestHit,
		getForestFogOpacity,
		getCaveFogOpacity,
		clouds,
		setClouds,
		cloudOverlayVisible,
		unfedAnimalMap,
		unfedAnimalTileKeys,
		dayTransitionStarsState,
	} = ctx;
	const mapRef = useRef<HTMLDivElement | null>(null);
	const scrollAnimRef = useRef<number | null>(null);
	const [cloudVerticalOffsetPct, setCloudVerticalOffsetPct] = useState(0);

	const syncCloudVerticalOffset = (mapEl: HTMLDivElement) => {
		const scrollRange = mapEl.scrollHeight - mapEl.clientHeight;
		if (scrollRange <= 0) {
			setCloudVerticalOffsetPct((prev) => (prev === 0 ? prev : 0));
			return;
		}
		const ratio = Math.min(1, Math.max(0, mapEl.scrollTop / scrollRange));
		const nextOffset = -ratio * CLOUD_VERTICAL_SCROLL_RANGE_PCT;
		setCloudVerticalOffsetPct((prev) =>
			Math.abs(prev - nextOffset) < 0.05 ? prev : nextOffset,
		);
	};

	useLayoutEffect(() => {
		const mapEl = mapRef.current;
		if (!mapEl) return;
		if (scrollAnimRef.current !== null) {
			window.cancelAnimationFrame(scrollAnimRef.current);
			scrollAnimRef.current = null;
		}
		const centerMap = () => {
			const tileEl = mapEl.querySelector(".tile") as HTMLElement | null;
			if (!tileEl) return;
			const tileRect = tileEl.getBoundingClientRect();
			if (tileRect.width <= 0 || tileRect.height <= 0) return;
			const focus =
				cameraTarget && cameraTarget.map === player.map
					? cameraTarget
					: { x: player.x, y: player.y, smooth: false, durationMs: undefined };
			const targetLeft = Math.max(
				0,
				(focus.x + 0.5) * tileRect.width - mapEl.clientWidth / 2,
			);
			const targetTop = Math.max(
				0,
				(focus.y + 0.5) * tileRect.height - mapEl.clientHeight / 2,
			);
			if (!focus.smooth) {
				mapEl.scrollLeft = targetLeft;
				mapEl.scrollTop = targetTop;
				syncCloudVerticalOffset(mapEl);
				return;
			}
			const durationMs = Math.max(50, focus.durationMs ?? 650);
			const startLeft = mapEl.scrollLeft;
			const startTop = mapEl.scrollTop;
			const deltaLeft = targetLeft - startLeft;
			const deltaTop = targetTop - startTop;
			const startAt = performance.now();
			const step = (now: number) => {
				const t = Math.min(1, (now - startAt) / durationMs);
				mapEl.scrollLeft = startLeft + deltaLeft * t;
				mapEl.scrollTop = startTop + deltaTop * t;
				syncCloudVerticalOffset(mapEl);
				if (t < 1) {
					scrollAnimRef.current = window.requestAnimationFrame(step);
				} else {
					scrollAnimRef.current = null;
				}
			};
			scrollAnimRef.current = window.requestAnimationFrame(step);
		};
		const rafId = window.requestAnimationFrame(centerMap);
		return () => {
			window.cancelAnimationFrame(rafId);
			if (scrollAnimRef.current !== null) {
				window.cancelAnimationFrame(scrollAnimRef.current);
				scrollAnimRef.current = null;
			}
		};
	}, [player.map, player.x, player.y, mapZoom, renderedMap, cameraTarget]);

	useEffect(() => {
		const mapEl = mapRef.current;
		if (!mapEl) return;
		const handleScroll = () => syncCloudVerticalOffset(mapEl);
		handleScroll();
		mapEl.addEventListener("scroll", handleScroll, { passive: true });
		return () => mapEl.removeEventListener("scroll", handleScroll);
	}, [player.map, mapZoom, renderedMap]);

	return (
			<div className='map-wrap'>
				<div
					ref={mapRef}
					className={`map ${player.map === "forest" ? "map-forest" : ""} ${player.map === "cave" ? "map-cave" : ""} ${player.map === "bureaucracy_office" ? "map-bureaucracy" : ""}`}
					style={{ fontSize: `calc(${mapZoom} * clamp(13px, 1.48vw, 24px))` }}
				>
					{player.map === "bureaucracy_office" && (
						<div className='day-stars-layer bureaucracy-stars-layer'>
							{dayTransitionStarsState.map((star) => (
								<motion.div
									key={`bureaucracy-star-${star.id}`}
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
									{getBureaucracyStarGlyph(star)}
								</motion.div>
							))}
						</div>
					)}
					<div className='grass-wind-overlay'>
						{activeMapLayouts[player.map].map((row, y) => (
							<div
								key={`wind-row-${y}`}
								className='map-row'
							>
								{row.split("").map((tile, x) => {
									const isOn = tile === "," && isWindSlashOn(x, y);
									return (
										<span
											key={`wind-${x}-${y}`}
											className='tile grass-wind-tile'
										>
											{isOn ? "/" : ""}
										</span>
									);
								})}
							</div>
						))}
					</div>
					{renderedMap.map((row, y) => (
						<div
							key={`row-${y}`}
							className='map-row'
						>
							{row.map((cell, x) => {
								const plot =
									player.map === "farm" ? plots[keyForPos(x, y)] : null;
								const rainyFarmSoil =
									player.map === "farm" && currentWeather === "rainy";
								const groundTile = plot
									? ";"
									: (activeMapLayouts[player.map]?.[y]?.[x] ?? ".");
								const groundClassBase =
									plot && player.map === "farm"
										? plot.watered || rainyFarmSoil
											? "tile-soil-wet"
											: "tile-soil-dry"
										: groundClassForTile(groundTile, player.map);
								const isShopDecorTile =
									isShopMap(player.map) &&
									!!shopDecorByMap[player.map]?.[keyForPos(x, y)];
								const doorGroundClass =
									cell === "+"
										? isFarmHouseDoorTile(player.map, x, y)
											? "tile-floor"
											: (getDoorGroundClass(player.map, x, y) ??
												(player.map === "forest" ? "tile-grass" : undefined) ??
												(player.map === "house" ? "tile-floor" : undefined))
										: undefined;
								const groundClass =
									doorGroundClass ??
									(!groundClassBase &&
									player.map === "house" &&
									(cell === "d" || cell === "w")
										? "tile-floor"
										: groundClassBase);
								const visual = isShopDecorTile
									? {
											glyph: cell,
											className: groundClassBase ?? "tile-floor",
										}
									: player.map === "bureaucracy_office" &&
										  x === BUREAUCRACY_EXIT_POS.x &&
										  y === BUREAUCRACY_EXIT_POS.y + 2
										? { glyph: GLYPH.earth, className: "tile-earth-dim" }
									: player.map === "bureaucracy_office" && cell === "j"
										? { glyph: GLYPH.officeWorker, className: "tile-floor" }
									: player.map === "bureaucracy_office" && cell === "x"
										? { glyph: GLYPH.brownSquare, className: "tile-floor" }
									: cell === "P"
										? {
												glyph:
													isDrivingTractor
														? GLYPH.tractor // driving tractor
														: fishing && fishing.phase !== "success"
														? GLYPH.fishingPole // fishing pole mode
														: showTiredFace
															? GLYPH.yawn // tired face
															: playerEmoji,
											}
										: waterRefillTile &&
											  waterRefillTile.map === player.map &&
											  waterRefillTile.x === x &&
											  waterRefillTile.y === y
											? { glyph: GLYPH.pouringLiquid, className: "tile-water" } // refill splash icon
											: cell === "b" &&
												  fishing?.phase === "waiting" &&
												  fishing.map === player.map &&
												  fishing.x === x &&
												  fishing.y === y
												? {
														glyph: ".",
														className: "tile-water tile-fishing-bobber",
													}
												: cell === "F" && fishing?.phase === "bite"
													? {
															glyph: GLYPH.fish, // fish bite icon
															className: "tile-water tile-fishing-catch",
															overlayGlyph: fishing.requiredKey.toUpperCase(),
														}
													: cell === "~" && isRippleWaterTile(player.map, x, y)
														? {
																glyph: waterRipplePhase ? "-" : "--",
																className: "tile-water tile-ripple",
															}
															: cell === "," &&
																  isAnimatedGrassTile(player.map, x, y)
																? {
																		glyph: "|",
																		className: `tile-grass tile-foliage tile-foliage-${grassFoliageVariant(player.map, x, y)}`,
																	}
															: cell === "/" &&
																  player.map === "cave" &&
																  caveLadderPos &&
																  caveLadderPos.x === x &&
																  caveLadderPos.y === y
																? { glyph: GLYPH.ladder, className: "tile-cave-next-ladder" } // next-level ladder
																: player.map === "cave" && cell === ")"
																	? caveRubble[keyForPos(x, y)]
																		? {
																				glyph: caveRubble[keyForPos(x, y)]!,
																				className: "tile-cave-path tile-cave-rubble",
																			}
																		: toVisual(cell)
																: toVisual(cell);
								const withGround =
									groundClass &&
									!visual.className &&
									spriteTilesNeedingGround.has(cell)
										? { ...visual, className: groundClass }
										: plot && cell === ";"
											? {
													...visual,
													className: groundClass ?? visual.className,
												}
											: visual;
								const isPetGlyphCell =
									cell === "@" || cell === "%" || cell === "&" || cell === "?";
								const isDrivenTractorCell = cell === "P" && isDrivingTractor;
								const shouldFlipGlyph =
									(isPetGlyphCell && petFacing < 0) ||
									(isDrivenTractorCell && tractorFacing < 0);
								return (
									<span
										key={`${x}-${y}`}
										className={[
											"tile",
											withGround.className ?? "",
											cell === "P" &&
											(player.map === "forest" || player.map === "cave") &&
											showForestHit
												? "tile-player-hit"
												: "",
										]
											.filter(Boolean)
											.join(" ")}
										title={`${x},${y}`}
										data-overlay={withGround.overlayGlyph ?? ""}
									>
										<span
										className={[
											"emoji-glyph",
											player.map === "forest" ? "forest-emoji-glyph" : "",
											player.map === "cave" ? "cave-emoji-glyph" : "",
											withGround.className === "tile-cave-next-ladder"
												? "cave-ladder-hole-glyph"
												: "",
											player.map === unfedAnimalMap &&
											unfedAnimalTileKeys[keyForPos(x, y)]
												? "animal-unfed-emoji-glyph"
												: "",
											player.map === "forest" && (cell === "T" || cell === "G")
												? "forest-tree-emoji-glyph"
												: "",
										]
												.filter(Boolean)
												.join(" ")}
										style={{
											transform: shouldFlipGlyph ? "scaleX(-1)" : undefined,
											transformOrigin: shouldFlipGlyph ? "center center" : undefined,
										}}
										>
											{withGround.glyph}
										</span>
									</span>
								);
							})}
						</div>
					))}
					{(player.map === "forest" || player.map === "cave") && (
						<div className='fog-overlay'>
							{activeMapLayouts[player.map].map((row, y) => (
								<div
									key={`fog-row-${y}`}
									className='map-row'
								>
									{row.split("").map((_, x) => (
										<span
											key={`fog-${x}-${y}`}
											className='tile fog-tile'
											style={{
												opacity:
													player.map === "cave"
														? getCaveFogOpacity(x, y)
														: getForestFogOpacity(x, y),
											}}
										/>
									))}
								</div>
							))}
						</div>
					)}
				</div>
				{(player.map === "farm" || player.map === "town") && (
					<div
						className='cloud-overlay'
						style={{
							transform: `scale(${mapZoom})`,
							transformOrigin: "top left",
							width: `${100 / mapZoom}%`,
							height: `${100 / mapZoom}%`,
							opacity: cloudOverlayVisible ? 1 : 0,
							transition: "opacity 550ms ease",
						}}
					>
						<div
							style={{
								position: "absolute",
								inset: 0,
								transform: `translateY(${cloudVerticalOffsetPct}%)`,
							}}
						>
							{clouds.map((cloud) => (
								<motion.div
									key={cloud.id}
									className='cloud-item'
									initial={{ left: `${cloud.startX}%` }}
									animate={{ left: "-14%" }}
									transition={{
										duration: cloud.durationSec,
										ease: "linear",
									}}
									onAnimationComplete={() => {
										setClouds((prev) =>
											prev.filter((candidate) => candidate.id !== cloud.id),
										);
									}}
									style={{
										top: `${cloud.y}%`,
										fontSize: `${cloud.size}em`,
									}}
								>
									<span className='cloud-glyph'>{cloud.glyph}</span>
									<span className='cloud-shadow' />
								</motion.div>
							))}
						</div>
					</div>
				)}
			</div>

				);
};

const MemoMapViewport = React.memo(
	MapViewport,
	(prev, next) =>
		prev.ctx.player === next.ctx.player &&
		prev.ctx.activeMapLayouts === next.ctx.activeMapLayouts &&
		prev.ctx.renderedMap === next.ctx.renderedMap &&
		prev.ctx.mapZoom === next.ctx.mapZoom &&
		prev.ctx.cameraTarget === next.ctx.cameraTarget &&
		prev.ctx.plots === next.ctx.plots &&
		prev.ctx.currentWeather === next.ctx.currentWeather &&
		prev.ctx.shopDecorByMap === next.ctx.shopDecorByMap &&
		prev.ctx.fishing === next.ctx.fishing &&
		prev.ctx.isDrivingTractor === next.ctx.isDrivingTractor &&
		prev.ctx.showTiredFace === next.ctx.showTiredFace &&
		prev.ctx.playerEmoji === next.ctx.playerEmoji &&
		prev.ctx.waterRefillTile === next.ctx.waterRefillTile &&
		prev.ctx.waterRipplePhase === next.ctx.waterRipplePhase &&
		prev.ctx.caveLadderPos === next.ctx.caveLadderPos &&
		prev.ctx.caveRubble === next.ctx.caveRubble &&
		prev.ctx.petFacing === next.ctx.petFacing &&
		prev.ctx.tractorFacing === next.ctx.tractorFacing &&
		prev.ctx.showForestHit === next.ctx.showForestHit &&
		prev.ctx.clouds === next.ctx.clouds &&
		prev.ctx.cloudOverlayVisible === next.ctx.cloudOverlayVisible &&
		prev.ctx.unfedAnimalMap === next.ctx.unfedAnimalMap &&
		prev.ctx.unfedAnimalTileKeys === next.ctx.unfedAnimalTileKeys &&
		prev.ctx.dayTransitionStarsState === next.ctx.dayTransitionStarsState,
);
export const renderGameRuntimeView = (ctx: GameRuntimeViewModel) => {
	const {
		onKeyDown,
		shellRef,
		day,
		player,
		currentWeather,
		weatherEmojiById,
		money,
		stamina,
		staminaMax,
		waterLevel,
		inventoryRows,
		log,
		activeMapLayouts,
		isWindSlashOn,
		renderedMap,
		mapZoom,
		cameraTarget,
		plots,
		keyForPos,
		groundClassForTile,
		isShopMap,
		shopDecorByMap,
		isFarmHouseDoorTile,
		getDoorGroundClass,
		fishing,
		isDrivingTractor,
		showTiredFace,
		playerEmoji,
		waterRefillTile,
		isRippleWaterTile,
		waterRipplePhase,
		isAnimatedGrassTile,
		grassFoliageVariant,
		caveLadderPos,
		caveRubble,
		toVisual,
		spriteTilesNeedingGround,
		petFacing,
		tractorFacing,
		showForestHit,
		getForestFogOpacity,
		getCaveFogOpacity,
		clouds,
		setClouds,
		cloudOverlayVisible,
		unfedAnimalMap,
		unfedAnimalTileKeys,
		marketRows,
		toolRows,
		getToolTierName,
		pendingTractorDelivery,
		hasTractor,
		hasHeadlamp,
		newspaper,
		isOrdering,
		isDoctorCompounding,
		doctorObservation,
		cafeObservation,
		modal,
		modalIndex,
		quantityPrompt,
		selectModal,
		getDealBadge,
		prices,
		initialPrices,
		cancelQuantityPrompt,
		moveQuantity,
		moveModal,
		moonPhases,
		dayTransition,
		dayTransitionStarsState,
		dayTransitionStage,
		dayTransitionClosePhase,
		continueAfterSleep,
		dayTransitionPrompt,
		isSaveLoadMenuOpen,
		canSaveGame,
		saveDisabledMessage,
		saveLoadStatus,
		toggleSaveLoadMenu,
		closeSaveLoadMenu,
		saveGameToFile,
		loadGameFromFilePicker,
		directorPopup,
		confirmDirectorPopup,
	} = ctx;
	return (
		<div
			className='game-shell'
			tabIndex={0}
			onKeyDown={onKeyDown}
			ref={shellRef}
		>
			{isSaveLoadMenuOpen && (
				<div
					className='save-load-overlay'
					onClick={closeSaveLoadMenu}
				>
					<div
						className='save-load-panel'
						onClick={(event) => event.stopPropagation()}
					>
						<div className='panel-title'>Menu</div>
						<button
							type='button'
							className='save-load-action'
							onClick={saveGameToFile}
							disabled={!canSaveGame}
						>
							Save
						</button>
						<button
							type='button'
							className='save-load-action'
							onClick={loadGameFromFilePicker}
						>
							Load
						</button>
						<button
							type='button'
							className='save-load-action'
							onClick={closeSaveLoadMenu}
						>
							Close
						</button>
						{saveDisabledMessage && <div className='small'>{saveDisabledMessage}</div>}
						{saveLoadStatus && <div className='small'>{saveLoadStatus}</div>}
					</div>
				</div>
			)}
			<div className='hud'>
				<button
					type='button'
					className='save-load-menu-button'
					onClick={toggleSaveLoadMenu}
					aria-label='Open save and load menu'
				>
					{GLYPH.burger}
				</button>
				<div>Day: {day}</div>
				<div>Location: {player.map}</div>
				<div>Current Weather: {weatherEmojiById[currentWeather]}</div>
				<div>Money: ${money}</div>
				<div className='stamina-wrap'>
					<span title={`${stamina}/${staminaMax}`}>Stamina</span>
					<div className='stamina-bar'>
						<div
							className={`stamina-fill ${stamina > 50 ? "high" : stamina > 30 ? "mid" : "low"}`}
							style={{
								width: `${(Math.max(0, Math.min(staminaMax, stamina)) / staminaMax) * 100}%`,
							}}
						/>
					</div>
				</div>
			</div>

			<div className='inventory inventory-strip'>
				<div className='panel-title'>Inventory</div>
				<ul className='inventory-row'>
					<li
						key='water-row'
						className='inventory-item'
					>
						<span className='inventory-item-icon'>{GLYPH.pouringLiquid}</span> {/* water can */}
						<span>Water:</span>
						<span>{waterLevel}</span>
					</li>
					{inventoryRows.map((r) => (
						<li
							key={r.id}
							className='inventory-item'
						>
							<span className='inventory-item-icon'>{r.icon}</span>
							<span>{r.name}:</span>
							<span>{r.amount}</span>
						</li>
					))}
				</ul>
			</div>

			<div className='legend log-strip'>
				<div className='log-list'>
					<div className='small'>{log[0] ?? ""}</div>
				</div>
			</div>

			<MemoMapViewport
				ctx={{
					activeMapLayouts,
					player,
					isWindSlashOn,
					renderedMap,
					mapZoom,
					cameraTarget,
					plots,
					keyForPos,
					currentWeather,
					groundClassForTile,
					isShopMap,
					shopDecorByMap,
					isFarmHouseDoorTile,
					getDoorGroundClass,
					fishing,
					isDrivingTractor,
					showTiredFace,
					playerEmoji,
					waterRefillTile,
					isRippleWaterTile,
					waterRipplePhase,
					isAnimatedGrassTile,
					grassFoliageVariant,
					caveLadderPos,
					caveRubble,
					toVisual,
					spriteTilesNeedingGround,
					petFacing,
					tractorFacing,
					showForestHit,
					getForestFogOpacity,
					getCaveFogOpacity,
					clouds,
					setClouds,
					cloudOverlayVisible,
					unfedAnimalMap,
					unfedAnimalTileKeys,
					dayTransitionStarsState,
				}}
			/>
			<div className='info-grid'>
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<div className='controls-market-row'>
						<div className='controls'>
							<div className='panel-title'>Controls</div>
							<div>`WASD` move</div>
							<div>`Arrow Keys` interact one tile</div>
							<div>`Q/E` zoom out/in</div>
							<div>`W/S` navigate menus</div>
							<div>`Space` confirm menu option</div>
						</div>
						<div className='legend market-panel'>
							<div className='panel-title'>Current Market</div>
							<ul className='market-list'>
								{marketRows.map((row) => (
									<li key={`market-${row.id}`}>
										<span>{row.name}:</span>{" "}
										<span>
											${row.price}{" "}
											{row.trend > 0 ? GLYPH.chartUp : row.trend < 0 ? GLYPH.chartDown : ""} {/* market trend */}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className='tips-tools-row'>
						<div className='legend'>
							<div className='panel-title'>Farm Tips</div>
							<ul>
								<li>Plant seeds on brown dirt plots.</li>
								<li>Water crops daily so they grow overnight.</li>
								<li>Feed animals daily in the farm barn.</li>
								<li>Sleep in house bed to start next day.</li>
								<li>Visit town vendors to buy/sell.</li>
							</ul>
						</div>
						<div className='legend'>
							<div className='panel-title'>Tools</div>
							<ul>
								{toolRows.map((tool) => (
									<li key={tool.id}>
										{getToolTierName(tool.level)} {tool.name}
									</li>
								))}
								{pendingTractorDelivery && (
									<li key='tractor-pending'>Tractor (arrives tomorrow)</li>
								)}
								{hasTractor && <li key='tractor-owned'>Tractor</li>}
								{hasHeadlamp && <li key='headlamp-owned'>Headlamp</li>}
							</ul>
						</div>
					</div>
				</div>
				<div className='newspaper'>
					<div className='panel-title'>Daily Newspaper</div>
					<div className='newspaper-body'>{newspaper}</div>
				</div>
			</div>

			{(isOrdering || isDoctorCompounding) && (
				<div className='order-wait-overlay'>
					<div className='order-wait-banner'>
						<div className='order-wait-content'>
							<motion.div
								className='order-wait-text'
								initial={{ scale: 1 }}
								animate={{ scale: [1, 1.06, 1] }}
								transition={{
									duration: 1.1,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							>
								Please wait...
							</motion.div>
							<div className='order-wait-subtext'>
								{isDoctorCompounding ? doctorObservation : cafeObservation}
							</div>
						</div>
					</div>
				</div>
			)}

			{modal && (
				<div className='modal-backdrop'>
					<div className='modal'>
						{(() => {
							const selectedOption = modal.options[modalIndex];
							const dealMeta = selectedOption?.dealMeta;
							const dealBadge = dealMeta
								? getDealBadge(
										dealMeta.mode,
										dealMeta.unitPrice ?? prices[dealMeta.itemId],
										dealMeta.baseUnitPrice ?? initialPrices[dealMeta.itemId],
									)
								: undefined;
							return (
								<>
						<div className='panel-title'>{modal.title}</div>
						{modal.body.map((b, i) => (
							<div
								key={`${b}-${i}`}
								className='small'
							>
								{b.startsWith("TIP: ") ? (
									<>
										<strong>TIP:</strong> {b.slice(5)}
									</>
								) : (
									b
								)}
							</div>
						))}
						<div className={`modal-layout${quantityPrompt ? " quantity-mode" : ""}`}>
							<div className='modal-left-pane'>
								{quantityPrompt ? (
									<div className='quantity-pane'>
										<div className='quantity-focus'>
											<div>Amount:</div>
											<div>{`\u25C0 ${quantityPrompt.value} \u25B6`}</div>
										</div>
										<div className='small quantity-footer'>
											Space to confirm. Esc to cancel
										</div>
									</div>
								) : (
									modal.options.map((opt, idx) => (
										<div
											key={opt.label + idx}
											className={`option ${idx === modalIndex ? "active" : ""}`}
										>
											{idx === modalIndex ? ">" : " "}{" "}
											<span
												className={
													modal.title === "Wardrobe"
														? "wardrobe-option-label"
														: undefined
												}
											>
												{opt.label}
											</span>
										</div>
									))
								)}
							</div>
							<div className='modal-info'>
								<div className='panel-title'>More Info</div>
								{(quantityPrompt
									? [
											`Max amount: ${quantityPrompt.max}`,
											`Transaction total: $${
												quantityPrompt.value * quantityPrompt.unitPrice
											}`,
										]
									: (modal.options[modalIndex]?.info ?? [
											"Use W/S to highlight an option.",
										])
								).map((line, i) => (
									<div
										key={`${line}-${i}`}
										className='small'
									>
										{line}
									</div>
								))}
								{!quantityPrompt && dealBadge && (
									<motion.div
										className='deal-badge'
										style={{
											color: dealBadge.color,
											transformOrigin: "center center",
										}}
										animate={{ scale: [1, dealBadge.scaleUp, 1] }}
										transition={{
											duration: 1.1,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									>
										{dealBadge.label}
									</motion.div>
								)}
							</div>
						</div>
						{!quantityPrompt && (
							<div
								className='small'
								style={{ marginTop: 6 }}
							>
								Use W/S to move, Space to select.
							</div>
						)}
								</>
							);
						})()}
					</div>
				</div>
			)}

			{dayTransition && (
				<motion.div
					className='day-transition-backdrop'
					animate={{ opacity: dayTransitionClosePhase === "backdrop" ? 0 : 1 }}
					transition={{
						duration: dayTransitionClosePhase === "backdrop" ? 1 : 0.2,
						ease: "linear",
					}}
				>
					<div className='day-stars-layer'>
						{dayTransitionStarsState.map((star) => (
							<motion.div
								key={`day-star-${star.id}`}
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
					<motion.div
						className='day-transition-card'
						layout
						initial={{ opacity: 0, y: -200 }}
						animate={
							dayTransitionClosePhase === "idle"
								? { opacity: 1, y: 0 }
								: { opacity: 0, y: -200 }
						}
						transition={{
							duration: dayTransitionClosePhase === "idle" ? 4 : 0.55,
							delay: dayTransitionClosePhase === "idle" ? 2 : 0,
							ease: "linear",
							layout: { duration: 0.55, ease: "easeInOut" },
						}}
					>
						<div className='day-moon'>
							{moonPhases[
								(dayTransitionStage === "intro"
									? dayTransition.day - 1
									: dayTransition.day) % moonPhases.length
							]}
						</div>
						<div className='panel-title day-transition-day'>
							Day {dayTransitionStage === "intro" ? dayTransition.day - 1 : dayTransition.day}
						</div>
						{(dayTransitionStage === "earned" || dayTransitionStage === "final") && (
							<motion.div
								className='small day-transition-stat day-earned-row'
								layout
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.8, ease: "easeOut" }}
							>
								Earned yesterday (Day {dayTransition.day - 1}): $
								{dayTransition.previousDayEarned}
							</motion.div>
						)}
						{dayTransitionStage === "final" && (
							<>
								<motion.div
									className='small day-transition-stat'
									layout
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.8, ease: "easeOut" }}
								>
									Total earnings: ${dayTransition.totalEarned}
								</motion.div>
								<motion.div
									className='day-ok-wrap'
									layout
									initial={{ opacity: 0 }}
									animate={{ opacity: [0, 0, 1] }}
									transition={{ duration: 0.8, ease: "easeOut" }}
								>
									<button
										className='option active day-ok-button'
										onClick={continueAfterSleep}
										type='button'
										disabled={dayTransitionClosePhase !== "idle"}
									>
										{dayTransitionPrompt}
									</button>
								</motion.div>
							</>
						)}
					</motion.div>
				</motion.div>
			)}
			{directorPopup && (
				<div className='director-popup-backdrop'>
					<div className='director-popup'>
						<div>{directorPopup.message}</div>
						<button
							type='button'
							className='option active director-popup-button'
							onClick={confirmDirectorPopup}
						>
							OK.
						</button>
					</div>
				</div>
			)}
		</div>
	);
};



