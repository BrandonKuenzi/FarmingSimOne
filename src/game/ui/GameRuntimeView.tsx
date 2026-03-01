import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { motion } from "framer-motion";
import type { GameRuntimeViewModel } from "./viewModel";
import { BUREAUCRACY_EXIT_POS } from "../world/layout";
import { GLYPH } from "../config/glyphs";
import { AnimatedEmojiTile } from "./AnimatedEmojiTile";
import { CurrentMarket } from "./CurrentMarket";
import {
	CAMERA_FOLLOW_ANIMATION_EASE,
	CAMERA_FOLLOW_MS,
	CLOUD_DRIFT_ANIMATION_EASE,
	CLOUD_WOOSH_ANIMATION_EASE,
	POSITION_ANIMATION_EASE,
	POSITION_ANIMATION_MS,
} from "../config/visualMotion";

const bureaucracyFloppyGlyphs = [GLYPH.floppyDisk, GLYPH.hardDisk] as const;
const CLOUD_VERTICAL_SCROLL_RANGE_PCT = 16;
const CAMERA_EDGE_FOLLOW_RATIO_X = 0.25;
const CAMERA_EDGE_FOLLOW_RATIO_Y = 0.4;
const CLOUD_ZOOM_WHOOSH_RATIO_X = 0.05;
const CLOUD_ZOOM_WHOOSH_RATIO_Y = 0.05;
const POSITION_ANIMATION_S = POSITION_ANIMATION_MS / 1000;
const MODAL_TITLES_WITH_MARKET = new Set([
	"Seed Vendor",
	"Supermarket",
	"Sketchy Merchant",
	"Trader",
]);
const newspaperPictureScale = (
	emoji: string,
	index: number,
	seed: number,
): number => {
	if (!emoji.trim()) return 1;
	let hash = (seed * 131 + index * 977) >>> 0;
	for (let i = 0; i < emoji.length; i += 1) {
		hash = Math.imul(hash ^ emoji.charCodeAt(i), 16777619) >>> 0;
	}
	const normalized = (hash % 1000) / 999;
	return 1 + normalized * 3;
};
const getBureaucracyStarGlyph = (star: {
	id: number;
	left: number;
	top: number;
	glyph: string;
}) => {
	const roll =
		(star.id * 17 + Math.floor(star.left) + Math.floor(star.top)) % 10;
	if (roll < 2) {
		return bureaucracyFloppyGlyphs[roll % bureaucracyFloppyGlyphs.length]!;
	}
	return star.glyph;
};

type VisualMover = {
	id: string;
	x: number;
	y: number;
	glyph: string;
	className?: string;
	overlayGlyph?: string;
	flip?: boolean;
	isPlayer?: boolean;
};

type MapViewportCtx = Pick<
	GameRuntimeViewModel,
	| "activeMapLayouts"
	| "player"
	| "townNpcTiles"
	| "forestEnemies"
	| "caveEnemies"
	| "animalsMap"
	| "animals"
	| "animalTiles"
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
	| "isBathing"
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
	| "tileFxBus"
>;

const MapViewport = ({ ctx }: { ctx: MapViewportCtx }) => {
	const {
		activeMapLayouts,
		player,
		townNpcTiles,
		forestEnemies,
		caveEnemies,
		animalsMap,
		animals,
		animalTiles,
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
		isBathing,
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
		tileFxBus,
	} = ctx;
	const mapRef = useRef<HTMLDivElement | null>(null);
	const scrollAnimRef = useRef<number | null>(null);
	const scrollTargetRef = useRef<{
		left: number;
		top: number;
		durationMs: number;
	} | null>(null);
	const lastScrollStepAtRef = useRef<number | null>(null);
	const zoomAnchorAnimRef = useRef<number | null>(null);
	const prevMapRef = useRef(player.map);
	const prevZoomRef = useRef(mapZoom);
	const prevCloudZoomRef = useRef(mapZoom);
	const prevEntityMapRef = useRef(player.map);
	const cloudDriftRef = useRef<HTMLDivElement | null>(null);
	const cloudVerticalOffsetRef = useRef(0);
	const prevPlayerTileRef = useRef({
		map: player.map,
		x: player.x,
		y: player.y,
	});
	const detachedCameraFocusRef = useRef({
		map: player.map,
		x: player.x,
		y: player.y,
	});
	const [isZoomAnchoring, setIsZoomAnchoring] = useState(false);
	const [cloudWhooshById, setCloudWhooshById] = useState<
		Record<number, { x: number; y: number }>
	>({});
	const mapChangedForEntityAnimation = prevEntityMapRef.current !== player.map;
	const mapRowCount = activeMapLayouts[player.map]?.length ?? 0;
	const mapColCount = activeMapLayouts[player.map]?.[0]?.length ?? 0;

	useEffect(() => {
		prevEntityMapRef.current = player.map;
	}, [player.map]);

	useEffect(() => {
		setCloudWhooshById((prev) => {
			if (clouds.length === 0) return {};
			const next: Record<number, { x: number; y: number }> = {};
			clouds.forEach((cloud) => {
				if (prev[cloud.id]) next[cloud.id] = prev[cloud.id]!;
			});
			return Object.keys(prev).length === Object.keys(next).length
				? prev
				: next;
		});
	}, [clouds]);

	useEffect(() => {
		const zoomChanged = Math.abs(prevCloudZoomRef.current - mapZoom) > 0.001;
		prevCloudZoomRef.current = mapZoom;
		if (!zoomChanged) return;
		if (!(player.map === "farm" || player.map === "town")) return;
		const mapEl = mapRef.current;
		if (!mapEl) return;
		const deltaX = mapEl.clientWidth * CLOUD_ZOOM_WHOOSH_RATIO_X;
		const deltaY = mapEl.clientHeight * CLOUD_ZOOM_WHOOSH_RATIO_Y;
		setCloudWhooshById((prev) => {
			const next: Record<number, { x: number; y: number }> = { ...prev };
			clouds.forEach((cloud) => {
				const prior = next[cloud.id] ?? { x: 0, y: 0 };
				const fromCenterX =
					(cloud.startX - 50) * (mapEl.clientWidth / 100) + prior.x;
				const fromCenterY =
					(cloud.y - 50) * (mapEl.clientHeight / 100) + prior.y;
				next[cloud.id] = {
					x: prior.x + deltaX * (fromCenterX >= 0 ? 1 : -1),
					y: prior.y + deltaY * (fromCenterY >= 0 ? 1 : -1),
				};
			});
			return next;
		});
	}, [mapZoom, player.map, clouds]);

	const syncCloudVerticalOffset = (mapEl: HTMLDivElement) => {
		if (isZoomAnchoring) return;
		const scrollRange = mapEl.scrollHeight - mapEl.clientHeight;
		if (scrollRange <= 0) {
			if (cloudVerticalOffsetRef.current === 0) return;
			cloudVerticalOffsetRef.current = 0;
			if (cloudDriftRef.current) {
				cloudDriftRef.current.style.transform = "translateY(0%)";
			}
			return;
		}
		const ratio = Math.min(1, Math.max(0, mapEl.scrollTop / scrollRange));
		const nextOffset = -ratio * CLOUD_VERTICAL_SCROLL_RANGE_PCT;
		if (Math.abs(cloudVerticalOffsetRef.current - nextOffset) < 0.05) return;
		cloudVerticalOffsetRef.current = nextOffset;
		if (cloudDriftRef.current) {
			cloudDriftRef.current.style.transform = `translateY(${nextOffset}%)`;
		}
	};

	const movingEntities = useMemo<VisualMover[]>(() => {
		const entities: VisualMover[] = [];
		const resolvePlayerGlyph = () => {
			if (isDrivingTractor) return GLYPH.tractor;
			if (fishing && fishing.phase !== "success") return GLYPH.fishingPole;
			if (showTiredFace) return GLYPH.yawn;
			return playerEmoji;
		};
		if (!(player.map === "house" && isBathing)) {
			entities.push({
				id: "player",
				x: player.x,
				y: player.y,
				glyph: resolvePlayerGlyph(),
				flip: isDrivingTractor && tractorFacing < 0,
				isPlayer: true,
			});
		}

		if (player.map === "town") {
			const labels: Record<string, string> = {
				neighbor_1: "n",
				neighbor_2: "m",
				neighbor_3: "o",
				neighbor_4: "p",
			};
			Object.entries(townNpcTiles).forEach(([key, pos]) => {
				const marker = labels[key];
				if (!marker) return;
				const visual = toVisual(marker, player.map);
				entities.push({
					id: `town-npc-${key}`,
					x: pos.x,
					y: pos.y,
					glyph: visual.glyph,
					className: visual.className,
					overlayGlyph: visual.overlayGlyph,
				});
			});
		}

		if (player.map === animalsMap) {
			const markerByAnimal: Record<string, string> = {
				cow: "1",
				sheep: "2",
				chicken: "3",
				hippo: "A",
				unicorn: "D",
				mammoth: "F",
				slug: "I",
				gorilla: "N",
			};
			animals.forEach((animal) => {
				const pos = animalTiles[animal.id];
				if (!pos) return;
				const marker = markerByAnimal[animal.type];
				if (!marker) return;
				const visual = toVisual(marker, player.map);
				entities.push({
					id: `animal-${animal.id}`,
					x: pos.x,
					y: pos.y,
					glyph: visual.glyph,
					className: visual.className,
					overlayGlyph: visual.overlayGlyph,
				});
			});
		}

		if (player.map === "forest") {
			forestEnemies.forEach((enemy) => {
				const marker =
					enemy.type === "bear" ? "e" : enemy.type === "snake" ? "y" : "!";
				const visual = toVisual(marker, player.map);
				entities.push({
					id: `forest-enemy-${enemy.id}`,
					x: enemy.x,
					y: enemy.y,
					glyph: visual.glyph,
					className: visual.className,
					overlayGlyph: visual.overlayGlyph,
				});
			});
		}

		if (player.map === "cave") {
			caveEnemies.forEach((enemy) => {
				const marker =
					enemy.type === "bear" ? "e" : enemy.type === "poop" ? "!" : "`";
				const visual = toVisual(marker, player.map);
				entities.push({
					id: `cave-enemy-${enemy.id}`,
					x: enemy.x,
					y: enemy.y,
					glyph: visual.glyph,
					className: visual.className,
					overlayGlyph: visual.overlayGlyph,
				});
			});
		}

		return entities;
	}, [
		player.map,
		player.x,
		player.y,
		playerEmoji,
		showTiredFace,
		isDrivingTractor,
		isBathing,
		tractorFacing,
		fishing,
		townNpcTiles,
		forestEnemies,
		caveEnemies,
		animalsMap,
		animals,
		animalTiles,
		toVisual,
	]);

	const mapTileRows = useMemo(
		() =>
			renderedMap.map((row, y) => (
				<div
					key={`row-${y}`}
					className='map-row'
				>
					{row.map((cell, x) => {
						const tileKey = keyForPos(x, y);
						const plot = player.map === "farm" ? plots[tileKey] : null;
						const rainyFarmSoil =
							player.map === "farm" && currentWeather === "rainy";
						const groundTile = plot
							? ";"
							: (activeMapLayouts[player.map]?.[y]?.[x] ?? ".");
						const effectiveCell = cell;
						const groundClassBase =
							plot && player.map === "farm"
								? plot.watered || rainyFarmSoil
									? "tile-soil-wet"
									: "tile-soil-dry"
								: groundClassForTile(groundTile, player.map);
						const isShopDecorTile =
							isShopMap(player.map) && !!shopDecorByMap[player.map]?.[tileKey];
						const doorGroundClass =
							effectiveCell === "+"
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
							(effectiveCell === "d" || effectiveCell === "w")
								? "tile-floor"
								: groundClassBase);
						const visual = isShopDecorTile
							? {
									glyph: effectiveCell,
									className: groundClassBase ?? "tile-floor",
								}
							: player.map === "bureaucracy_office" &&
								  x === BUREAUCRACY_EXIT_POS.x &&
								  y === BUREAUCRACY_EXIT_POS.y + 2
								? { glyph: GLYPH.earth, className: "tile-earth-dim" }
								: player.map === "bureaucracy_office" && effectiveCell === "j"
									? { glyph: GLYPH.officeWorker, className: "tile-floor" }
									: player.map === "bureaucracy_office" && effectiveCell === "x"
										? { glyph: GLYPH.brownSquare, className: "tile-floor" }
										: waterRefillTile &&
											  waterRefillTile.map === player.map &&
											  waterRefillTile.x === x &&
											  waterRefillTile.y === y
											? {
													glyph: GLYPH.pouringLiquid,
													className: "tile-water",
												}
											: effectiveCell === "b" &&
												  fishing?.phase === "waiting" &&
												  fishing.map === player.map &&
												  fishing.x === x &&
												  fishing.y === y
												? {
														glyph: ".",
														className: "tile-water tile-fishing-bobber",
													}
												: effectiveCell === "F" && fishing?.phase === "bite"
													? {
															glyph: GLYPH.fish,
															className: "tile-water tile-fishing-catch",
															overlayGlyph: fishing.requiredKey.toUpperCase(),
														}
													: effectiveCell === "~" &&
														  isRippleWaterTile(player.map, x, y)
														? {
																glyph: waterRipplePhase ? "-" : "--",
																className: "tile-water tile-ripple",
															}
														: effectiveCell === "," &&
															  isAnimatedGrassTile(player.map, x, y)
															? {
																	glyph: "|",
																	className: `tile-grass tile-foliage tile-foliage-${grassFoliageVariant(player.map, x, y)}`,
																}
															: effectiveCell === "/" &&
																  player.map === "cave" &&
																  caveLadderPos &&
																  caveLadderPos.x === x &&
																  caveLadderPos.y === y
																? {
																		glyph: GLYPH.ladder,
																		className: "tile-cave-next-ladder",
																	}
																: player.map === "cave" && effectiveCell === ")"
																	? caveRubble[tileKey]
																		? {
																				glyph: caveRubble[tileKey]!,
																				className:
																					"tile-cave-path tile-cave-rubble",
																			}
																		: toVisual(effectiveCell)
																	: toVisual(effectiveCell);
						const withGround =
							groundClass &&
							!visual.className &&
							spriteTilesNeedingGround.has(effectiveCell)
								? { ...visual, className: groundClass }
								: plot && effectiveCell === ";"
									? {
											...visual,
											className: groundClass ?? visual.className,
										}
									: visual;
						const isPetGlyphCell =
							effectiveCell === "@" ||
							effectiveCell === "%" ||
							effectiveCell === "&" ||
							effectiveCell === "?";
						const shouldFlipGlyph = isPetGlyphCell && petFacing < 0;
						const glyphClassName = [
							"emoji-glyph",
							player.map === "forest" ? "forest-emoji-glyph" : "",
							player.map === "cave" ? "cave-emoji-glyph" : "",
							withGround.className === "tile-cave-next-ladder"
								? "cave-ladder-hole-glyph"
								: "",
							player.map === unfedAnimalMap && unfedAnimalTileKeys[tileKey]
								? "animal-unfed-emoji-glyph"
								: "",
							player.map === "forest" &&
							(effectiveCell === "T" || effectiveCell === "G")
								? "forest-tree-emoji-glyph"
								: "",
						]
							.filter(Boolean)
							.join(" ");
						const glyphStyle = {
							transform: shouldFlipGlyph ? "scaleX(-1)" : undefined,
							transformOrigin: shouldFlipGlyph ? "center center" : undefined,
						};
						const shouldWrapFxTile =
							withGround.glyph.trim().length > 0 &&
							(withGround.glyph === GLYPH.newspaper ||
								(withGround.className !== "tile-grass" &&
									withGround.className !== "tile-water" &&
									withGround.className !== "tile-forest-grass"));
						return (
							<span
								key={`${x}-${y}`}
								className={[
									"tile",
									withGround.className ?? "",
									shouldWrapFxTile ? "tile-fx-host" : "",
								]
									.filter(Boolean)
									.join(" ")}
								title={`${x},${y}`}
								data-overlay={withGround.overlayGlyph ?? ""}
							>
								{shouldWrapFxTile ? (
									<AnimatedEmojiTile
										ref={(handle) => {
											if (handle) {
												tileFxBus.registerMapTile(player.map, x, y, handle);
												return;
											}
											tileFxBus.unregisterMapTile(player.map, x, y);
										}}
										glyph={withGround.glyph}
										glyphClassName={glyphClassName}
										glyphStyle={glyphStyle}
									/>
								) : (
									<span
										className={glyphClassName}
										style={glyphStyle}
									>
										{withGround.glyph}
									</span>
								)}
							</span>
						);
					})}
				</div>
			)),
		[
			renderedMap,
			player.map,
			plots,
			currentWeather,
			activeMapLayouts,
			keyForPos,
			groundClassForTile,
			isShopMap,
			shopDecorByMap,
			isFarmHouseDoorTile,
			getDoorGroundClass,
			waterRefillTile,
			fishing,
			isRippleWaterTile,
			waterRipplePhase,
			isAnimatedGrassTile,
			grassFoliageVariant,
			caveLadderPos,
			caveRubble,
			toVisual,
			spriteTilesNeedingGround,
			petFacing,
			unfedAnimalMap,
			unfedAnimalTileKeys,
			tileFxBus,
		],
	);

	useLayoutEffect(() => {
		const mapEl = mapRef.current;
		if (!mapEl) return;
		const stopZoomAnchoring = () => {
			if (zoomAnchorAnimRef.current !== null) {
				window.cancelAnimationFrame(zoomAnchorAnimRef.current);
				zoomAnchorAnimRef.current = null;
			}
			setIsZoomAnchoring(false);
		};
		stopZoomAnchoring();
		const centerMap = () => {
			const tileEl = mapEl.querySelector(".tile") as HTMLElement | null;
			if (!tileEl) return;
			const tileRect = tileEl.getBoundingClientRect();
			if (tileRect.width <= 0 || tileRect.height <= 0) return;
			const prevPlayerTile = prevPlayerTileRef.current;
			const movedOnSameMap =
				prevPlayerTile.map === player.map &&
				(prevPlayerTile.x !== player.x || prevPlayerTile.y !== player.y);
			const dx = player.x - prevPlayerTile.x;
			const dy = player.y - prevPlayerTile.y;
			prevPlayerTileRef.current = { map: player.map, x: player.x, y: player.y };
			const explicitCameraTarget =
				cameraTarget && cameraTarget.map === player.map ? cameraTarget : null;
			let focus =
				explicitCameraTarget ??
				({
					x: player.x,
					y: player.y,
					smooth: true,
					durationMs: CAMERA_FOLLOW_MS,
				} as const);
			if (explicitCameraTarget) {
				detachedCameraFocusRef.current = {
					map: player.map,
					x: player.x,
					y: player.y,
				};
			} else {
				const detached = detachedCameraFocusRef.current;
				if (detached.map !== player.map) {
					detachedCameraFocusRef.current = {
						map: player.map,
						x: player.x,
						y: player.y,
					};
				}
				const anchor = detachedCameraFocusRef.current;
				const viewportWidthPx = mapEl.clientWidth;
				const viewportHeightPx = mapEl.clientHeight;
				const playerScreenX =
					viewportWidthPx / 2 + (player.x - anchor.x) * tileRect.width;
				const playerScreenY =
					viewportHeightPx / 2 + (player.y - anchor.y) * tileRect.height;
				const nearLeftViewportEdge =
					playerScreenX <= viewportWidthPx * CAMERA_EDGE_FOLLOW_RATIO_X;
				const nearRightViewportEdge =
					playerScreenX >= viewportWidthPx * (1 - CAMERA_EDGE_FOLLOW_RATIO_X);
				const nearTopViewportEdge =
					playerScreenY <= viewportHeightPx * CAMERA_EDGE_FOLLOW_RATIO_Y;
				const nearBottomViewportEdge =
					playerScreenY >= viewportHeightPx * (1 - CAMERA_EDGE_FOLLOW_RATIO_Y);
				const movingTowardHorizontalWall =
					movedOnSameMap &&
					((dx < 0 && nearLeftViewportEdge) ||
						(dx > 0 && nearRightViewportEdge));
				const movingTowardVerticalWall =
					movedOnSameMap &&
					((dy < 0 && nearTopViewportEdge) ||
						(dy > 0 && nearBottomViewportEdge));
				const shouldFollowPlayer =
					prevMapRef.current !== player.map ||
					movingTowardHorizontalWall ||
					movingTowardVerticalWall;
				if (shouldFollowPlayer) {
					detachedCameraFocusRef.current = {
						map: player.map,
						x: player.x,
						y: player.y,
					};
				}
				focus = {
					x: detachedCameraFocusRef.current.x,
					y: detachedCameraFocusRef.current.y,
					smooth: true,
					durationMs: CAMERA_FOLLOW_MS,
				};
			}
			const targetLeft = Math.max(
				0,
				(focus.x + 0.5) * tileRect.width - mapEl.clientWidth / 2,
			);
			const targetTop = Math.max(
				0,
				(focus.y + 0.5) * tileRect.height - mapEl.clientHeight / 2,
			);
			const mapChanged = prevMapRef.current !== player.map;
			const zoomChanged = Math.abs(prevZoomRef.current - mapZoom) > 0.001;
			if (zoomChanged && !mapChanged) {
				if (scrollAnimRef.current !== null) {
					window.cancelAnimationFrame(scrollAnimRef.current);
					scrollAnimRef.current = null;
				}
				scrollTargetRef.current = null;
				lastScrollStepAtRef.current = null;
				setIsZoomAnchoring(true);
				const startAt = performance.now();
				const keepFocusAnchored = (now: number) => {
					const liveTileEl = mapEl.querySelector(".tile") as HTMLElement | null;
					if (!liveTileEl) {
						stopZoomAnchoring();
						return;
					}
					const liveTileRect = liveTileEl.getBoundingClientRect();
					if (liveTileRect.width <= 0 || liveTileRect.height <= 0) {
						stopZoomAnchoring();
						return;
					}
					const liveTargetLeft = Math.max(
						0,
						(focus.x + 0.5) * liveTileRect.width - mapEl.clientWidth / 2,
					);
					const liveTargetTop = Math.max(
						0,
						(focus.y + 0.5) * liveTileRect.height - mapEl.clientHeight / 2,
					);
					mapEl.scrollLeft = liveTargetLeft;
					mapEl.scrollTop = liveTargetTop;
					syncCloudVerticalOffset(mapEl);
					if (now - startAt < POSITION_ANIMATION_MS) {
						zoomAnchorAnimRef.current =
							window.requestAnimationFrame(keepFocusAnchored);
					} else {
						stopZoomAnchoring();
					}
				};
				zoomAnchorAnimRef.current =
					window.requestAnimationFrame(keepFocusAnchored);
				prevMapRef.current = player.map;
				prevZoomRef.current = mapZoom;
				return;
			}
			const shouldSmooth = !mapChanged && focus.smooth;
			prevMapRef.current = player.map;
			prevZoomRef.current = mapZoom;
			if (!shouldSmooth) {
				mapEl.scrollLeft = targetLeft;
				mapEl.scrollTop = targetTop;
				scrollTargetRef.current = null;
				lastScrollStepAtRef.current = null;
				syncCloudVerticalOffset(mapEl);
				return;
			}
			scrollTargetRef.current = {
				left: targetLeft,
				top: targetTop,
				durationMs: focus.durationMs ?? CAMERA_FOLLOW_MS,
			};
			if (scrollAnimRef.current !== null) return;
			const step = (now: number) => {
				const target = scrollTargetRef.current;
				if (!target) {
					scrollAnimRef.current = null;
					lastScrollStepAtRef.current = null;
					return;
				}
				const lastAt = lastScrollStepAtRef.current ?? now;
				const dt = Math.max(1, now - lastAt);
				lastScrollStepAtRef.current = now;
				const t = Math.min(1, dt / target.durationMs);
				mapEl.scrollLeft += (target.left - mapEl.scrollLeft) * t;
				mapEl.scrollTop += (target.top - mapEl.scrollTop) * t;
				syncCloudVerticalOffset(mapEl);
				const done =
					Math.abs(target.left - mapEl.scrollLeft) < 0.5 &&
					Math.abs(target.top - mapEl.scrollTop) < 0.5;
				if (done) {
					mapEl.scrollLeft = target.left;
					mapEl.scrollTop = target.top;
					scrollTargetRef.current = null;
					scrollAnimRef.current = null;
					lastScrollStepAtRef.current = null;
					return;
				}
				scrollAnimRef.current = window.requestAnimationFrame(step);
			};
			scrollAnimRef.current = window.requestAnimationFrame(step);
		};
		const rafId = window.requestAnimationFrame(centerMap);
		return () => {
			window.cancelAnimationFrame(rafId);
			if (zoomAnchorAnimRef.current !== null) {
				window.cancelAnimationFrame(zoomAnchorAnimRef.current);
			}
			setIsZoomAnchoring(false);
		};
	}, [player.map, player.x, player.y, mapZoom, cameraTarget, activeMapLayouts]);

	useEffect(() => {
		return () => {
			if (scrollAnimRef.current !== null) {
				window.cancelAnimationFrame(scrollAnimRef.current);
				scrollAnimRef.current = null;
			}
			scrollTargetRef.current = null;
			lastScrollStepAtRef.current = null;
			if (zoomAnchorAnimRef.current !== null) {
				window.cancelAnimationFrame(zoomAnchorAnimRef.current);
				zoomAnchorAnimRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		const mapEl = mapRef.current;
		if (!mapEl) return;
		const handleScroll = () => syncCloudVerticalOffset(mapEl);
		handleScroll();
		mapEl.addEventListener("scroll", handleScroll, { passive: true });
		return () => mapEl.removeEventListener("scroll", handleScroll);
	}, [player.map, mapZoom, isZoomAnchoring]);

	useEffect(() => {
		if (isZoomAnchoring) return;
		const mapEl = mapRef.current;
		if (!mapEl) return;
		syncCloudVerticalOffset(mapEl);
	}, [isZoomAnchoring]);

	return (
		<div className='map-wrap'>
			<div
				ref={mapRef}
				className={`map ${player.map === "forest" ? "map-forest" : ""} ${player.map === "cave" ? "map-cave" : ""} ${player.map === "bureaucracy_office" ? "map-bureaucracy" : ""}`}
				style={{
					fontSize: `calc(${mapZoom} * clamp(13px, 1.48vw, 24px))`,
					transition: `font-size ${POSITION_ANIMATION_MS}ms ${CAMERA_FOLLOW_ANIMATION_EASE}`,
				}}
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
				{mapTileRows}
				{mapRowCount > 0 && mapColCount > 0 && (
					<div
						className='entity-overlay'
						style={{
							left: "6px",
							top: "6px",
							width: `${mapColCount}em`,
							height: `${mapRowCount}em`,
						}}
					>
						{movingEntities.map((entity) => {
							const tileKey = keyForPos(
								Math.round(entity.x),
								Math.round(entity.y),
							); // or entity.tileKey if you have it

							const isUnfed =
								player.map === unfedAnimalMap && !!unfedAnimalTileKeys[tileKey];

							return (
								<span
									key={entity.id}
									className={[
										"tile",
										"tile-entity",
										"tile-fx-host",
										entity.className ?? "",
										entity.isPlayer &&
										(player.map === "forest" || player.map === "cave") &&
										showForestHit
											? "tile-player-hit"
											: "",
									]
										.filter(Boolean)
										.join(" ")}
									data-overlay={entity.overlayGlyph ?? ""}
									style={{
										left: 0,
										top: 0,
										width: "1em",
										height: "1em",
										zIndex: entity.isPlayer ? 4 : 2,
										transform: `translate(${entity.x}em, ${entity.y}em)`,
										transition:
											isZoomAnchoring ||
											(entity.isPlayer && mapChangedForEntityAnimation)
												? "none"
												: `transform ${POSITION_ANIMATION_S}s ${POSITION_ANIMATION_EASE}`,
									}}
								>
									<AnimatedEmojiTile
										ref={(handle) => {
											if (handle) {
												tileFxBus.registerActor(entity.id, handle);
												return;
											}
											tileFxBus.unregisterActor(entity.id);
										}}
										glyph={entity.glyph}
										glyphClassName={[
											"emoji-glyph",
											isUnfed ? "animal-unfed-emoji-glyph" : "",
											player.map === "forest" ? "forest-emoji-glyph" : "",
											player.map === "cave" ? "cave-emoji-glyph" : "",
										]
											.filter(Boolean)
											.join(" ")}
										glyphStyle={{
											transform: entity.flip ? "scaleX(-1)" : undefined,
											transformOrigin: entity.flip
												? "center center"
												: undefined,
										}}
									/>
								</span>
							);
						})}
					</div>
				)}
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
						ref={cloudDriftRef}
						style={{
							position: "absolute",
							inset: 0,
							transform: "translateY(0%)",
							transition: isZoomAnchoring
								? "none"
								: `transform ${POSITION_ANIMATION_MS}ms ${CLOUD_DRIFT_ANIMATION_EASE}`,
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
									setCloudWhooshById((prev) => {
										if (!prev[cloud.id]) return prev;
										const next = { ...prev };
										delete next[cloud.id];
										return next;
									});
								}}
								style={{
									top: `${cloud.y}%`,
									fontSize: `${cloud.size * 2}em`,
								}}
							>
								<span
									className='cloud-whoosh'
									style={{
										transform: `translate(${cloudWhooshById[cloud.id]?.x ?? 0}px, ${cloudWhooshById[cloud.id]?.y ?? 0}px)`,
										transition: `transform ${POSITION_ANIMATION_MS}ms ${CLOUD_WOOSH_ANIMATION_EASE}`,
									}}
								>
									<span className='cloud-glyph'>{cloud.glyph}</span>
									<span className='cloud-shadow' />
								</span>
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
		prev.ctx.townNpcTiles === next.ctx.townNpcTiles &&
		prev.ctx.forestEnemies === next.ctx.forestEnemies &&
		prev.ctx.caveEnemies === next.ctx.caveEnemies &&
		prev.ctx.animalsMap === next.ctx.animalsMap &&
		prev.ctx.animals === next.ctx.animals &&
		prev.ctx.animalTiles === next.ctx.animalTiles &&
		prev.ctx.activeMapLayouts === next.ctx.activeMapLayouts &&
		prev.ctx.renderedMap === next.ctx.renderedMap &&
		prev.ctx.mapZoom === next.ctx.mapZoom &&
		prev.ctx.cameraTarget === next.ctx.cameraTarget &&
		prev.ctx.plots === next.ctx.plots &&
		prev.ctx.currentWeather === next.ctx.currentWeather &&
		prev.ctx.shopDecorByMap === next.ctx.shopDecorByMap &&
		prev.ctx.fishing === next.ctx.fishing &&
		prev.ctx.isDrivingTractor === next.ctx.isDrivingTractor &&
		prev.ctx.isBathing === next.ctx.isBathing &&
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
		prev.ctx.dayTransitionStarsState === next.ctx.dayTransitionStarsState &&
		prev.ctx.tileFxBus === next.ctx.tileFxBus,
);
export const renderGameRuntimeView = (ctx: GameRuntimeViewModel) => {
	const {
		onKeyDown,
		onKeyUp,
		onBlur,
		shellRef,
		day,
		player,
		townNpcTiles,
		forestEnemies,
		caveEnemies,
		animalsMap,
		animals,
		animalTiles,
		currentWeather,
		weatherEmojiById,
		money,
		stamina,
		staminaMax,
		waterLevel,
		inventoryRows,
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
		isBathing,
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
		newspaperImage,
		isNewspaperPopupOpen,
		closeNewspaperPopup,
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
		setQuantityToMax,
		setQuantityToMin,
		moveModal,
		moonPhases,
		dayTransition,
		dayTransitionStarsState,
		dayTransitionStage,
		dayTransitionClosePhase,
		continueAfterSleep,
		dayTransitionPrompt,
		isSaveLoadMenuOpen,
		controlMode,
		canSaveGame,
		saveDisabledMessage,
		saveLoadStatus,
		toggleSaveLoadMenu,
		toggleControlMode,
		closeSaveLoadMenu,
		saveGameToFile,
		loadGameFromFilePicker,
		mobileMoveJoystickAnchor,
		mobileMoveJoystickThumb,
		mobileInteractJoystickAnchor,
		mobileInteractJoystickThumb,
		onMobileMoveJoystickTouchStart,
		onMobileMoveJoystickTouchMove,
		onMobileMoveJoystickTouchEnd,
		onMobileInteractJoystickTouchStart,
		onMobileInteractJoystickTouchMove,
		onMobileInteractJoystickTouchEnd,
		canZoomOut,
		canZoomIn,
		zoomOut,
		zoomIn,
		directorPopup,
		confirmDirectorPopup,
		tileFxBus,
	} = ctx;
	const newspaperSections = newspaper
		.split(/\n\s*\n/)
		.map((section) => section.trim())
		.filter(Boolean);
	const newspaperTopSection = newspaperSections[0] ?? "";
	const newspaperSecondSection = newspaperSections[1] ?? "";
	const newspaperTailSections = newspaperSections.slice(2);
	const newspaperPictureSeed = day + newspaper.length;
	return (
		<div
			className={`game-shell${controlMode === "mobile" ? " mobile-controls-enabled" : ""}`}
			tabIndex={0}
			onKeyDown={onKeyDown}
			onKeyUp={onKeyUp}
			onBlur={onBlur}
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
						<button
							type='button'
							className='save-load-action'
							onClick={toggleControlMode}
						>
							Controls: {controlMode === "pc" ? "PC" : "Mobile"}
						</button>
						{saveDisabledMessage && (
							<div className='small'>{saveDisabledMessage}</div>
						)}
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

			<div className='gameplay-main'>
				<div className='inventory inventory-strip gameplay-inventory'>
					<div className='header-inline-list'>
						<div className='panel-title'>Inventory</div>
						<ul className='inventory-row'>
							<li
								key='water-row'
								className='inventory-item'
							>
								<span className='inventory-item-icon'>{GLYPH.pouringLiquid}</span>{" "}
								{/* water can */}
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
				</div>

				<div className='tools tools-strip gameplay-tools'>
					<div className='header-inline-list'>
						<div className='panel-title'>Tools</div>
						<ul className='inventory-row'>
							{toolRows.map((tool) => (
								<li
									key={tool.id}
									className='inventory-item'
								>
									{getToolTierName(tool.level)} {tool.name}
								</li>
							))}
							{pendingTractorDelivery && (
								<li
									key='tractor-pending'
									className='inventory-item'
								>
									Tractor (arrives tomorrow)
								</li>
							)}
							{hasTractor && (
								<li
									key='tractor-owned'
									className='inventory-item'
								>
									Tractor
								</li>
							)}
							{hasHeadlamp && (
								<li
									key='headlamp-owned'
									className='inventory-item'
								>
									Headlamp
								</li>
							)}
						</ul>
					</div>
				</div>

				<div className='gameplay-map-slot'>
					{controlMode === "mobile" && (
						<div className='mobile-zoom-overlay'>
							{canZoomOut && (
								<button
									type='button'
									className='mobile-zoom-button mobile-zoom-button-out'
									onClick={zoomOut}
									aria-label='Zoom out'
								>
									<div className='mobile-zoom-icon'>
										<span className='mobile-zoom-base'>{GLYPH.magnifierLeft}</span>
										<span className='mobile-zoom-mark'>-</span>
									</div>
								</button>
							)}
							{canZoomIn && (
								<button
									type='button'
									className='mobile-zoom-button mobile-zoom-button-in'
									onClick={zoomIn}
									aria-label='Zoom in'
								>
									<div className='mobile-zoom-icon'>
										<span className='mobile-zoom-base'>{GLYPH.magnifierLeft}</span>
										<span className='mobile-zoom-mark'>+</span>
									</div>
								</button>
							)}
						</div>
					)}
					<MemoMapViewport
						ctx={{
							activeMapLayouts,
							player,
							townNpcTiles,
							forestEnemies,
							caveEnemies,
							animalsMap,
							animals,
							animalTiles,
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
							isBathing,
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
							tileFxBus,
						}}
					/>
				</div>
			</div>
			{isNewspaperPopupOpen && (
				<div
					className='newspaper-popup-backdrop'
					onClick={closeNewspaperPopup}
				>
					<div
						className='newspaper-popup'
						onClick={(event) => event.stopPropagation()}
					>
						<div className='panel-title'>Daily Newspaper</div>
						<div className='newspaper-body newspaper-body-article'>
							<CurrentMarket
								rows={marketRows}
								compact
								className='newspaper-market-float'
							/>
							<div className='newspaper-copy'>
								{newspaperTopSection && (
									<div className='newspaper-copy-section'>
										{newspaperTopSection}
									</div>
								)}
								<div className='newspaper-story-flex'>
									<div className='newspaper-story-half newspaper-copy-section'>
										{newspaperSecondSection}
									</div>
									<div className='newspaper-story-half newspaper-emoji-picture'>
										{Array.from({ length: 9 }, (_, index) => {
											const emoji = newspaperImage[index] ?? "";
											const scale = newspaperPictureScale(
												emoji,
												index,
												newspaperPictureSeed,
											);
											return (
												<div
													key={`newspaper-picture-cell-${index}`}
													className='newspaper-emoji-cell'
												>
													<span
														className='newspaper-emoji-glyph'
														style={{ transform: `scale(${scale})` }}
													>
														{emoji}
													</span>
												</div>
											);
										})}
									</div>
								</div>
								{newspaperTailSections.map((section, index) => (
									<div
										key={`newspaper-tail-${index}`}
										className='newspaper-copy-section'
									>
										{section}
									</div>
								))}
							</div>
						</div>
						<div className='newspaper-popup-actions'>
							<button
								type='button'
								className='option active newspaper-popup-button'
								onClick={closeNewspaperPopup}
							>
								OK
							</button>
						</div>
					</div>
				</div>
			)}

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
							const showMarketInModal =
								!quantityPrompt && MODAL_TITLES_WITH_MARKET.has(modal.title);
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
									<div
										className={`modal-layout${quantityPrompt ? " quantity-mode" : ""}`}
									>
										<div className='modal-left-pane'>
											{quantityPrompt ? (
												<div className='quantity-pane'>
													<div className='quantity-focus'>
														<div>Amount:</div>
														<div>{`\u25C0 ${quantityPrompt.value} \u25B6`}</div>
													</div>
													<div className='quantity-touch-controls'>
														<div className='quantity-touch-row'>
															<button
																type='button'
																className='option quantity-touch-button'
																onClick={setQuantityToMin}
															>
																Min
															</button>
															<button
																type='button'
																className='option quantity-touch-button'
																onClick={() => moveQuantity(-1)}
															>
																-
															</button>
															<button
																type='button'
																className='option quantity-touch-button'
																onClick={() => moveQuantity(1)}
															>
																+
															</button>
															<button
																type='button'
																className='option quantity-touch-button'
																onClick={setQuantityToMax}
															>
																Max
															</button>
														</div>
														<div className='quantity-touch-row'>
															<button
																type='button'
																className='option active quantity-touch-button'
																onClick={selectModal}
															>
																OK
															</button>
															<button
																type='button'
																className='option quantity-touch-button'
																onClick={cancelQuantityPrompt}
															>
																Cancel
															</button>
														</div>
													</div>
													<div className='small quantity-footer'>
														Space to confirm. Esc to cancel
													</div>
												</div>
											) : (
												modal.options.map((opt, idx) => (
													<button
														key={opt.label + idx}
														type='button'
														className={`option modal-option-button ${idx === modalIndex ? "active" : ""}`}
														onClick={opt.onSelect}
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
													</button>
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
											{showMarketInModal && (
												<CurrentMarket
													rows={marketRows}
													compact
													className='modal-market-panel'
												/>
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
							{
								moonPhases[
									(dayTransitionStage === "intro"
										? dayTransition.day - 1
										: dayTransition.day) % moonPhases.length
								]
							}
						</div>
						<div className='panel-title day-transition-day'>
							Day{" "}
							{dayTransitionStage === "intro"
								? dayTransition.day - 1
								: dayTransition.day}
						</div>
						{(dayTransitionStage === "earned" ||
							dayTransitionStage === "final") && (
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
			{controlMode === "mobile" && (
				<div className='mobile-controls-overlay'>
					<div
						className='mobile-joystick-zone'
						onTouchStart={onMobileMoveJoystickTouchStart}
						onTouchMove={onMobileMoveJoystickTouchMove}
						onTouchEnd={onMobileMoveJoystickTouchEnd}
						onTouchCancel={onMobileMoveJoystickTouchEnd}
					>
						<div
							className={`mobile-joystick-anchor${mobileMoveJoystickAnchor ? " active" : ""}`}
							style={
								mobileMoveJoystickAnchor
									? {
											position: "fixed",
											left: mobileMoveJoystickAnchor.x,
											top: mobileMoveJoystickAnchor.y,
										}
									: undefined
							}
						>
							<span className='mobile-joystick-label'>Movement</span>
						</div>
					</div>
					{mobileMoveJoystickThumb && (
						<div
							className='mobile-joystick-thumb'
							style={{
								left: mobileMoveJoystickThumb.x,
								top: mobileMoveJoystickThumb.y,
							}}
						/>
					)}
					<div
						className='mobile-interact-zone'
						onTouchStart={onMobileInteractJoystickTouchStart}
						onTouchMove={onMobileInteractJoystickTouchMove}
						onTouchEnd={onMobileInteractJoystickTouchEnd}
						onTouchCancel={onMobileInteractJoystickTouchEnd}
					>
						<div
							className={`mobile-joystick-anchor${mobileInteractJoystickAnchor ? " active" : ""}`}
							style={
								mobileInteractJoystickAnchor
									? {
											position: "fixed",
											left: mobileInteractJoystickAnchor.x,
											top: mobileInteractJoystickAnchor.y,
										}
									: undefined
							}
						>
							<span className='mobile-joystick-label'>Interact</span>
						</div>
					</div>
					{mobileInteractJoystickThumb && (
						<div
							className='mobile-joystick-thumb'
							style={{
								left: mobileInteractJoystickThumb.x,
								top: mobileInteractJoystickThumb.y,
							}}
						/>
					)}
				</div>
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
