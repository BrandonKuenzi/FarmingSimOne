import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { motion } from "framer-motion";
import progressShortSoundSrc from "../../assets/progressShort.mp3";
import progressMediumSoundSrc from "../../assets/progressMedium.mp3";
import progressLongSoundSrc from "../../assets/progressLong.mp3";
import type { GameRuntimeViewModel } from "./viewModel";
import { BUREAUCRACY_EXIT_POS } from "../world/layout";
import { GLYPH } from "../config/glyphs";
import { fishItemIds } from "../content/catalog";
import { getBonusDelta } from "../economy/moneyBonus";
import type { IncomeSource, ItemId } from "../shared/types";
import { AnimatedEmojiTile } from "./AnimatedEmojiTile";
import { CurrentMarket } from "./CurrentMarket";
import { SideViewCutsceneOverlay } from "./SideViewCutsceneOverlay";
import { StoneUI } from "./StoneUI";
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
const fishItemIdSet = new Set<ItemId>(fishItemIds as ItemId[]);
const toIncomeSourceForMarketSale = (itemId: ItemId): IncomeSource => {
	if (itemId === "milk") return "milk_sales";
	if (itemId === "wool") return "wool_sales";
	if (itemId === "egg") return "egg_sales";
	if (itemId === "diamond" || itemId === "emerald" || itemId === "ruby") {
		return "gem_sales";
	}
	if (fishItemIdSet.has(itemId)) return "fish_sales";
	return "crop_sales";
};
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

const PopStatValue = ({ value }: { value: number }) => (
	<motion.span
		key={`stat-${value}`}
		initial={{ scale: 1 }}
		animate={{ scale: [1, 1.22, 1] }}
		transition={{ duration: 0.35, ease: "easeOut" }}
	>
		{value}
	</motion.span>
);

const PROGRESS_POINTS_MAX = 1000;
const PROGRESS_ANIMATION_BURST_WINDOW_MS = 450;
const PROGRESS_SOUND_COOLDOWN_MS = 1000;

const clampProgressPoints = (value: number): number =>
	Math.max(0, Math.min(PROGRESS_POINTS_MAX, value));

const progressDurationMsForDelta = (deltaPoints: number): number => {
	if (deltaPoints <= 10) return 1000;
	if (deltaPoints < 50) return 2000;
	return 3000;
};

const easeOutCubic = (value: number): number => 1 - (1 - value) ** 3;

const ProgressHudRow = ({
	progressPoints,
	progressWon,
}: {
	progressPoints: number;
	progressWon: boolean;
}) => {
	const initialPoints = clampProgressPoints(progressPoints);
	const [animatedPoints, setAnimatedPoints] = useState(initialPoints);
	const [progressPulseDurationMs, setProgressPulseDurationMs] = useState(0);
	const [progressPulseKey, setProgressPulseKey] = useState(0);
	const displayedPointsRef = useRef(initialPoints);
	const animationFrameRef = useRef<number | null>(null);
	const progressShortSoundRef = useRef<HTMLAudioElement | null>(null);
	const progressMediumSoundRef = useRef<HTMLAudioElement | null>(null);
	const progressLongSoundRef = useRef<HTMLAudioElement | null>(null);
	const lastProgressSoundAtMsRef = useRef(0);
	const burstStateRef = useRef({
		lastUpdateAtMs: 0,
		rollingDeltaPoints: 0,
	});
	const targetPoints = clampProgressPoints(progressPoints);

	useEffect(() => {
		progressShortSoundRef.current = new Audio(progressShortSoundSrc);
		progressShortSoundRef.current.preload = "auto";
		progressMediumSoundRef.current = new Audio(progressMediumSoundSrc);
		progressMediumSoundRef.current.preload = "auto";
		progressLongSoundRef.current = new Audio(progressLongSoundSrc);
		progressLongSoundRef.current.preload = "auto";
	}, []);

	useEffect(() => {
		const startPoints = displayedPointsRef.current;
		if (startPoints === targetPoints) return;

		const nowMs = performance.now();
		const thisDelta = Math.abs(targetPoints - startPoints);
		const burstState = burstStateRef.current;
		const inBurstWindow =
			nowMs - burstState.lastUpdateAtMs <= PROGRESS_ANIMATION_BURST_WINDOW_MS;
		const rollingDelta = inBurstWindow
			? burstState.rollingDeltaPoints + thisDelta
			: thisDelta;
		burstState.lastUpdateAtMs = nowMs;
		burstState.rollingDeltaPoints = rollingDelta;
		const durationMs = progressDurationMsForDelta(rollingDelta);
		setProgressPulseDurationMs(durationMs);
		setProgressPulseKey((prev) => prev + 1);
		const canPlaySoundNow =
			nowMs - lastProgressSoundAtMsRef.current >= PROGRESS_SOUND_COOLDOWN_MS;
		if (canPlaySoundNow && rollingDelta > 0) {
			const soundRef =
				rollingDelta <= 10
					? progressShortSoundRef
					: rollingDelta < 50
						? progressMediumSoundRef
						: progressLongSoundRef;
			if (soundRef.current) {
				soundRef.current.currentTime = 0;
				void soundRef.current.play().catch(() => undefined);
				lastProgressSoundAtMsRef.current = nowMs;
			}
		}

		if (animationFrameRef.current !== null) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}
		const animationStartAt = nowMs;

		const tick = (frameNowMs: number) => {
			const elapsedMs = frameNowMs - animationStartAt;
			const ratio = durationMs <= 0 ? 1 : Math.min(1, elapsedMs / durationMs);
			const easedRatio = easeOutCubic(ratio);
			const nextPoints =
				startPoints + (targetPoints - startPoints) * easedRatio;
			displayedPointsRef.current = nextPoints;
			setAnimatedPoints(nextPoints);

			if (ratio < 1) {
				animationFrameRef.current = requestAnimationFrame(tick);
				return;
			}
			displayedPointsRef.current = targetPoints;
			setAnimatedPoints(targetPoints);
			animationFrameRef.current = null;
		};

		animationFrameRef.current = requestAnimationFrame(tick);
		return () => {
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, [targetPoints]);

	const displayedProgressPercent = Math.max(
		0,
		Math.min(100, Math.floor(animatedPoints / 10)),
	);
	const displayedProgressPercentExact = Math.max(
		0,
		Math.min(100, animatedPoints / 10),
	);

	return (
		<div className='hud-progress-row'>
			<span className='hud-progress-label'>
				Progress: {displayedProgressPercent}%{progressWon ? " (Complete)" : ""}
			</span>
			<div className='progress-bar'>
				<div
					key={`progress-fill-pulse-${progressPulseKey}`}
					className='progress-fill'
					style={{
						width: `${displayedProgressPercentExact}%`,
						animation:
							progressPulseDurationMs > 0
								? `progress-fill-pulse ${progressPulseDurationMs}ms ease-in-out 1 forwards`
								: undefined,
					}}
				/>
			</div>
		</div>
	);
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
	| "townNpcGlyphs"
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
	| "progressLoadoutRows"
	| "moneyLoadoutRows"
	| "petFacing"
	| "tractorFacing"
	| "showForestHit"
	| "getForestFogOpacity"
	| "getCaveFogOpacity"
	| "clouds"
	| "setClouds"
	| "cloudOverlayVisible"
	| "aquariumBubbles"
	| "aquariumSeaweedXs"
	| "aquariumOceanSeaweedXs"
	| "aquariumCuratorTile"
	| "aquariumFishTiles"
	| "activeMapLayouts"
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
		townNpcGlyphs,
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
		progressLoadoutRows,
		moneyLoadoutRows,
		petFacing,
		tractorFacing,
		showForestHit,
		getForestFogOpacity,
		getCaveFogOpacity,
		clouds,
		setClouds,
		cloudOverlayVisible,
		aquariumBubbles,
		aquariumSeaweedXs,
		aquariumOceanSeaweedXs,
		aquariumCuratorTile,
		aquariumFishTiles,
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
	const [playerFacing, setPlayerFacing] = useState<1 | -1>(1);
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
			if (fishing && fishing.phase === "waiting") return GLYPH.fishingPole;
			if (showTiredFace) return GLYPH.yawn;
			return playerEmoji;
		};
		if (!(player.map === "house" && isBathing)) {
			entities.push({
				id: "player",
				x: player.x,
				y: player.y,
				glyph: resolvePlayerGlyph(),
				flip: isDrivingTractor ? tractorFacing < 0 : playerFacing < 0,
				isPlayer: true,
			});
		}

		if (player.map === "town") {
			Object.entries(townNpcTiles).forEach(([key, pos]) => {
				const glyph = townNpcGlyphs[key];
				if (!glyph) return;
				entities.push({
					id: `town-npc-${key}`,
					x: pos.x,
					y: pos.y,
					glyph,
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

		if (player.map === "aquarium") {
			if (aquariumCuratorTile) {
				entities.push({
					id: "aquarium-curator",
					x: aquariumCuratorTile.x,
					y: aquariumCuratorTile.y,
					glyph: "\u{1F913}",
				});
			}
			aquariumFishTiles.forEach((fish) => {
				entities.push({
					id: `aquarium-fish-${fish.fishId}`,
					x: fish.x,
					y: fish.y,
					glyph: fish.glyph,
					flip: fish.facing < 0,
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
		playerFacing,
		fishing,
		townNpcTiles,
		forestEnemies,
		caveEnemies,
		aquariumCuratorTile,
		aquariumFishTiles,
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
																	: toVisual(effectiveCell, player.map)
																: toVisual(effectiveCell, player.map);
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
						const withCounterPalette =
							player.map === "computer_lab" && effectiveCell === "x"
								? {
										...withGround,
										glyph: x <= 7 ? GLYPH.purpleSquare : GLYPH.greenSquare,
									}
								: withGround;
						const isPetGlyphCell =
							effectiveCell === "@" ||
							effectiveCell === "%" ||
							effectiveCell === "&" ||
							effectiveCell === "?";
						const labPcRowIndex: 0 | 1 | 2 | -1 =
							y === 2 ? 0 : y === 4 ? 1 : y === 6 ? 2 : -1;
						const isLabProgressPcActive =
							player.map === "computer_lab" &&
							x === 2 &&
							effectiveCell === "x" &&
							labPcRowIndex >= 0 &&
							!!progressLoadoutRows[labPcRowIndex as 0 | 1 | 2].targetStoneId;
						const isLabMoneyPcActive =
							player.map === "computer_lab" &&
							x === 9 &&
							effectiveCell === "x" &&
							labPcRowIndex >= 0 &&
							!!moneyLoadoutRows[labPcRowIndex as 0 | 1 | 2].moneyStoneId;
						const shouldFlipGlyph = isPetGlyphCell && petFacing < 0;
						const glyphClassName = [
							"emoji-glyph",
							player.map === "forest" ? "forest-emoji-glyph" : "",
							player.map === "cave" ? "cave-emoji-glyph" : "",
							withCounterPalette.className === "tile-cave-next-ladder"
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
							withCounterPalette.glyph.trim().length > 0 &&
							(withCounterPalette.glyph === GLYPH.newspaper ||
								(withCounterPalette.className !== "tile-grass" &&
									withCounterPalette.className !== "tile-water" &&
									withCounterPalette.className !== "tile-forest-grass"));
						const labRowIndex: 0 | 1 | 2 | -1 =
							y === 2 ? 0 : y === 4 ? 1 : y === 6 ? 2 : -1;
						let stoneOverlay: JSX.Element | null = null;
						if (
							player.map === "computer_lab" &&
							labRowIndex >= 0 &&
							(x === 3 ||
								x === 4 ||
								x === 5 ||
								x === 6 ||
								x === 10 ||
								x === 11 ||
								x === 12 ||
								x === 13)
						) {
							const rowSlotIndex = labRowIndex as 0 | 1 | 2;
							const rowLoadout = progressLoadoutRows[rowSlotIndex];
							const moneyRowLoadout = moneyLoadoutRows[rowSlotIndex];
							stoneOverlay = x === 3 ? (
								<StoneUI
									kind='target'
									row={rowLoadout}
								/>
							) : x >= 4 && x <= 6 ? (
								<StoneUI
									kind='algorithm'
									row={rowLoadout}
									algorithmIndex={(x - 4) as 0 | 1 | 2}
								/>
							) : x === 10 ? (
								<StoneUI
									kind='money'
									row={moneyRowLoadout}
								/>
							) : (
								<StoneUI
									kind='money_algorithm'
									row={moneyRowLoadout}
									algorithmIndex={(x - 11) as 0 | 1 | 2}
								/>
							);
						}
						const terminalOverlay =
							player.map === "computer_lab" &&
							labRowIndex >= 0 &&
							(x === 2 || x === 9) &&
							effectiveCell === "x" ? (
								<span className='stone-ui-overlay'>
									<span
										className={[
											"computer-lab-terminal-overlay-glyph",
											isLabProgressPcActive || isLabMoneyPcActive
												? "stone-ui-pc-active"
												: "",
										]
											.filter(Boolean)
											.join(" ")}
									>
										{GLYPH.desktopComputer}
									</span>
								</span>
							) : null;
						return (
							<span
								key={`${x}-${y}`}
								className={[
									"tile",
									withCounterPalette.className ?? "",
									shouldWrapFxTile ? "tile-fx-host" : "",
								]
									.filter(Boolean)
									.join(" ")}
								title={`${x},${y}`}
								data-overlay={withCounterPalette.overlayGlyph ?? ""}
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
										glyph={withCounterPalette.glyph}
										glyphClassName={glyphClassName}
										glyphStyle={glyphStyle}
									/>
								) : (
									<span
										className={glyphClassName}
										style={glyphStyle}
									>
										{withCounterPalette.glyph}
									</span>
								)}
								{terminalOverlay}
								{stoneOverlay}
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
			progressLoadoutRows,
			moneyLoadoutRows,
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
			if (movedOnSameMap && dx > 0) setPlayerFacing(-1);
			else if (movedOnSameMap && dx < 0) setPlayerFacing(1);
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
				className={`map ${player.map === "forest" ? "map-forest" : ""} ${player.map === "cave" ? "map-cave" : ""} ${player.map === "bureaucracy_office" ? "map-bureaucracy" : ""} ${player.map === "aquarium" ? "map-aquarium" : ""} ${player.map === "computer_lab" ? "map-computer-lab" : ""}`}
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
				{player.map === "aquarium" && (
					<div className='aquarium-seaweed-overlay'>
						{activeMapLayouts[player.map].map((row, y) => (
							<div
								key={`seaweed-row-${y}`}
								className='map-row'
							>
								{row.split("").map((_, x) => {
									const hasSeaweed =
										y === 7 &&
										((x >= 2 && x <= 11 && aquariumSeaweedXs.includes(x)) ||
											(x >= 15 &&
												x <= 24 &&
												x !== 23 &&
												aquariumOceanSeaweedXs.includes(x)));
									return (
										<span
											key={`seaweed-${x}-${y}`}
											className='tile aquarium-seaweed-overlay-item'
										>
											{hasSeaweed ? (
												<span className='aquarium-seaweed-glyph'>|</span>
											) : (
												""
											)}
										</span>
									);
								})}
							</div>
						))}
					</div>
				)}
				{player.map === "aquarium" && (
					<div className='aquarium-bubble-overlay'>
						{activeMapLayouts[player.map].map((row, y) => (
							<div
								key={`bubble-row-${y}`}
								className='map-row'
							>
								{row.split("").map((_, x) => {
									const hasBubble = aquariumBubbles.some(
										(bubble) =>
											bubble.x === x &&
											bubble.y === y &&
											((bubble.tank === "fresh" &&
												bubble.x >= 2 &&
												bubble.x <= 11 &&
												bubble.y >= 1 &&
												bubble.y <= 7) ||
												(bubble.tank === "salt" &&
													bubble.x >= 15 &&
													bubble.x <= 24 &&
													bubble.y >= 1 &&
													bubble.y <= 7) ||
												(bubble.tank === "cave" &&
													bubble.x >= 28 &&
													bubble.x <= 38 &&
													bubble.y >= 1 &&
													bubble.y <= 7)),
									);
									return (
										<span
											key={`bubble-${x}-${y}`}
											className='tile aquarium-bubble-overlay-item tile-aquarium-bubble'
										>
											{hasBubble ? (
												<span className='aquarium-bubble-glyph'>o</span>
											) : (
												""
											)}
										</span>
									);
								})}
							</div>
						))}
					</div>
				)}
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
		prev.ctx.townNpcGlyphs === next.ctx.townNpcGlyphs &&
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
		prev.ctx.progressLoadoutRows === next.ctx.progressLoadoutRows &&
		prev.ctx.moneyLoadoutRows === next.ctx.moneyLoadoutRows &&
		prev.ctx.petFacing === next.ctx.petFacing &&
		prev.ctx.tractorFacing === next.ctx.tractorFacing &&
		prev.ctx.showForestHit === next.ctx.showForestHit &&
		prev.ctx.clouds === next.ctx.clouds &&
		prev.ctx.cloudOverlayVisible === next.ctx.cloudOverlayVisible &&
		prev.ctx.aquariumBubbles === next.ctx.aquariumBubbles &&
		prev.ctx.aquariumSeaweedXs === next.ctx.aquariumSeaweedXs &&
		prev.ctx.aquariumOceanSeaweedXs === next.ctx.aquariumOceanSeaweedXs &&
		prev.ctx.aquariumCuratorTile === next.ctx.aquariumCuratorTile &&
		prev.ctx.aquariumFishTiles === next.ctx.aquariumFishTiles &&
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
		playerName,
		player,
		townNpcTiles,
		townNpcGlyphs,
		forestEnemies,
		caveEnemies,
		animalsMap,
		animals,
		animalTiles,
		currentWeather,
		weatherEmojiById,
		money,
		progressPercent,
		progressWon,
		progressLoadoutRows,
		moneyLoadoutRows,
		stamina,
		staminaMax,
		waterLevel,
		inventory,
		inventoryRows,
		tools,
		progressStoneAlgorithmCounts,
		aquariumDonations,
		barnTier,
		highestForestLevelReached,
		highestCaveLevelReached,
		statistics,
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
		fishingProgress,
		previewFishingMoveById,
		previewFishingBuffChoiceByIndex,
		selectFishingMove,
		selectFishingLevelUpBuffChoice,
		selectFishingMoveById,
		cutFishingLine,
		fishingMoveOrder,
		fishingMoveInfo,
		fishingMoveUnlocks,
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
		aquariumBubbles,
		aquariumSeaweedXs,
		aquariumOceanSeaweedXs,
		aquariumCuratorTile,
		aquariumFishTiles,
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
		isStatsDebugOverlayOpen,
		isDebugToolsPanelOpen,
		friendPostcardUnlockAtMs,
		statisticsRows,
		controlMode,
		canSaveGame,
		saveDisabledMessage,
		saveLoadStatus,
		toggleSaveLoadMenu,
		toggleStatsDebugOverlay,
		toggleDebugToolsPanel,
		toggleControlMode,
		closeSaveLoadMenu,
		closeStatsDebugOverlay,
		closeDebugToolsPanel,
		runDebugGrantResources,
		runDebugGrantAllStones,
		runDebugSpawnBarnAnimals,
		runDebugSpawnTownBeachBottle,
		runDebugAdvanceAllNpcFriendshipTiers,
		runDebugSpawnFriendshipLetter,
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
		sideViewCutscene,
		sideViewCutscenePending,
		sideViewCutsceneOk,
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
	const showFishingEncounter = !!fishing && fishing.phase !== "waiting";
	const openingStage = fishing?.openingStage ?? "none";
	const fishingBuffChoiceVisible =
		!!fishing && fishing.awaitingLevelUpBuffChoice;
	const fishingMenuVisible =
		(!!fishing &&
			fishing.showMenu &&
			fishing.phase === "player_turn" &&
			openingStage === "ready") ||
		fishingBuffChoiceVisible;
	const fishingTextVisible =
		!!fishing &&
		!fishingMenuVisible &&
		(fishing.phase !== "intro" || openingStage === "fish_hook_text");
	const fishingBottomActive = fishingTextVisible || fishingMenuVisible;
	const fishingBuffChoiceEnabled = !!fishing && fishing.canChooseLevelUpBuff;
	const fishingWipeActive =
		!!fishing && fishing.phase === "intro" && openingStage === "fade_bg";
	const showFishPortrait =
		!!fishing && (fishing.phase !== "intro" || openingStage !== "fade_bg");
	const showPlayerPortrait =
		!!fishing &&
		(fishing.phase !== "intro" ||
			openingStage === "player_stats_enter" ||
			openingStage === "ready");
	const showHud =
		!!fishing &&
		(fishing.phase !== "intro" ||
			openingStage === "player_stats_enter" ||
			openingStage === "ready");
	const hasFishingRod = toolRows.some((tool) => tool.id === "fishingRod");
	const showMobileTouchControls =
		controlMode === "mobile" &&
		!sideViewCutscene &&
		!sideViewCutscenePending &&
		!showFishingEncounter;
	const showFishingSelectionCaret = controlMode !== "mobile";
	const displayedFishingLevel = fishing?.playerLevel ?? fishingProgress.level;
	const displayedFishingExp = fishing?.playerExp ?? fishingProgress.exp;
	const fishingExpToNext =
		displayedFishingLevel >= 100
			? 0
			: Math.max(10, Math.floor(displayedFishingLevel * 10));
	const fishingExpRatio =
		displayedFishingLevel >= 100
			? 1
			: Math.max(
					0,
					Math.min(1, displayedFishingExp / Math.max(1, fishingExpToNext)),
				);
	const fishingExpAnimate = fishing?.expBarLevelUpBurst
		? {
				width: [
					"100%",
					"100%",
					"0%",
					`${Math.max(0, Math.min(1, fishingExpRatio)) * 100}%`,
				],
			}
		: { width: `${Math.max(0, Math.min(1, fishingExpRatio)) * 100}%` };
	const fishingExpTransition = fishing?.expBarLevelUpBurst
		? {
				duration: 2,
				ease: "easeInOut" as const,
				times: [0, 0.5, 0.5001, 1],
			}
		: { duration: 2, ease: "easeInOut" as const };
	const fishingBuffOptions = fishing
		? [
				{
					key: "attack",
					label: `Attack +${fishing.levelUpBuffAttackAmount}`,
					description: "Permanently increase fishing attack.",
					onSelect: () => selectFishingLevelUpBuffChoice(0),
				},
				{
					key: "defense",
					label: `Defense +${fishing.levelUpBuffDefenseAmount}`,
					description: "Permanently increase fishing defense.",
					onSelect: () => selectFishingLevelUpBuffChoice(1),
				},
			]
		: [];
	const selectedBuffOption = fishing
		? (fishingBuffOptions[fishing.selectedMoveIndex] ?? fishingBuffOptions[0])
		: null;
	const unlockedMoveEntries = fishingMoveOrder
		.map((moveId, sourceIndex) => ({ moveId, sourceIndex }))
		.filter(({ moveId }) => fishingMoveUnlocks[moveId]);
	const selectedMoveOption = fishing
		? (() => {
				const moveId = fishingMoveOrder[fishing.selectedMoveIndex];
				if (moveId && fishingMoveUnlocks[moveId])
					return fishingMoveInfo[moveId];
				const fallback = unlockedMoveEntries[0];
				return fallback ? fishingMoveInfo[fallback.moveId] : null;
			})()
		: null;
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
			{isStatsDebugOverlayOpen && (
				<div
					className='save-load-overlay'
					onClick={closeStatsDebugOverlay}
				>
					<div
						className='save-load-panel'
						onClick={(event) => event.stopPropagation()}
					>
						<div className='panel-title'>Statistics Debug</div>
						<div className='small'>Press L to close.</div>
						<div className='small'>
							Tracked counters: {statisticsRows.length}
						</div>
						<div className='small'>
							{statisticsRows.length <= 0 ? (
								"No statistics tracked yet."
							) : (
								statisticsRows.map((row) => (
									<div key={`stat-row-${row.key}`}>
										{row.key}: {row.value}
									</div>
								))
							)}
						</div>
						<button
							type='button'
							className='save-load-action'
							onClick={closeStatsDebugOverlay}
						>
							Close
						</button>
					</div>
				</div>
			)}
			{isDebugToolsPanelOpen && (
				<div
					className='save-load-overlay'
					onClick={closeDebugToolsPanel}
				>
					<div
						className='save-load-panel'
						onClick={(event) => event.stopPropagation()}
					>
						<div className='panel-title'>Debug Tools</div>
						<div className='small'>Press P to close.</div>
						<button
							type='button'
							className='save-load-action'
							onClick={runDebugGrantResources}
						>
							Grant Resources
						</button>
						<button
							type='button'
							className='save-load-action'
							onClick={runDebugGrantAllStones}
						>
							Grant All Stones
						</button>
						<button
							type='button'
							className='save-load-action'
							onClick={runDebugSpawnBarnAnimals}
						>
							Spawn Barn Animals
						</button>
						<button
							type='button'
							className='save-load-action'
							onClick={runDebugSpawnTownBeachBottle}
						>
							Spawn Town Beach Bottle
						</button>
						<button
							type='button'
							className='save-load-action'
							onClick={runDebugAdvanceAllNpcFriendshipTiers}
						>
							Advance NPC Friendship Tier
						</button>
						<button
							type='button'
							className='save-load-action'
							onClick={runDebugSpawnFriendshipLetter}
						>
							Spawn Friendship Letter
						</button>
						<button
							type='button'
							className='save-load-action'
							onClick={toggleStatsDebugOverlay}
						>
							Toggle Stats Overlay
						</button>
						<button
							type='button'
							className='save-load-action'
							onClick={toggleDebugToolsPanel}
						>
							Close
						</button>
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
				<div>{playerName}</div>
				<div>Day: {day}</div>
				<div>Location: {player.map}</div>
				<div>
					Current Weather: {weatherEmojiById[currentWeather]}
					{hasFishingRod ? ` | Fishing Level: ${displayedFishingLevel}` : ""}
				</div>
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
			<ProgressHudRow
				progressPoints={progressPercent}
				progressWon={progressWon}
			/>

			<div className='gameplay-main'>
				<div className='inventory inventory-strip gameplay-inventory'>
					<div className='header-inline-list'>
						<div className='panel-title'>Inventory</div>
						<ul className='inventory-row'>
							<li
								key='water-row'
								className='inventory-item'
							>
								<span className='inventory-item-icon'>
									{GLYPH.pouringLiquid}
								</span>{" "}
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
					{showMobileTouchControls && (
						<div className='mobile-zoom-overlay'>
							{canZoomOut && (
								<button
									type='button'
									className='mobile-zoom-button mobile-zoom-button-out'
									onClick={zoomOut}
									aria-label='Zoom out'
								>
									<div className='mobile-zoom-icon'>
										<span className='mobile-zoom-base'>
											{GLYPH.magnifierLeft}
										</span>
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
										<span className='mobile-zoom-base'>
											{GLYPH.magnifierLeft}
										</span>
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
							townNpcGlyphs,
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
							progressLoadoutRows,
							moneyLoadoutRows,
							petFacing,
							tractorFacing,
							showForestHit,
							getForestFogOpacity,
							getCaveFogOpacity,
							clouds,
							setClouds,
							cloudOverlayVisible,
							aquariumBubbles,
							aquariumSeaweedXs,
							aquariumOceanSeaweedXs,
							aquariumCuratorTile,
							aquariumFishTiles,
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
			{showFishingEncounter && fishing && (
				<motion.div
					className='fishing-encounter-backdrop'
					animate={{ opacity: 1 }}
					transition={{
						duration: 0.2,
						ease: "linear",
					}}
				>
					{fishingWipeActive && (
						<div className='fishing-intro-wipe'>
							<motion.div
								className='fishing-intro-wipe-half top'
								initial={{ scaleX: 0 }}
								animate={{ scaleX: 1 }}
								transition={{ duration: 2, ease: "easeInOut" }}
							/>
							<motion.div
								className='fishing-intro-wipe-half bottom'
								initial={{ scaleX: 0 }}
								animate={{ scaleX: 1 }}
								transition={{ duration: 2, ease: "easeInOut" }}
							/>
						</div>
					)}
					<div
						className={`fishing-encounter-stage ${fishingWipeActive ? "wipe-only" : ""}`}
					>
						{showHud && (
							<>
								<motion.div
									className='fishing-hud fishing-hud-enemy'
									initial={{ y: -50, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										duration:
											fishing.phase === "intro" &&
											openingStage === "player_stats_enter"
												? 1
												: 0.2,
									}}
								>
									<div className='fishing-hud-name'>
										You LVL {displayedFishingLevel}
									</div>
									<div className='small'>
										{GLYPH.crossedSwords}{" "}
										<PopStatValue value={fishing.playerAttack} /> {GLYPH.shield}{" "}
										<PopStatValue value={fishing.playerDefense} />
									</div>
									<div className='fishing-bar-wrap'>
										<div className='fishing-bar-track'>
											<motion.div
												className='fishing-bar-fill player'
												initial={false}
												animate={{
													width: `${(Math.max(0, Math.min(staminaMax, stamina)) / Math.max(1, staminaMax)) * 100}%`,
												}}
												transition={{ duration: 2, ease: "easeInOut" }}
											/>
										</div>
										<div className='small'>
											STA <PopStatValue value={stamina} />/{staminaMax}
										</div>
										<div className='fishing-exp-row small'>
											<span>EXP</span>
											<div className='fishing-bar-track exp'>
												<motion.div
													className='fishing-bar-fill exp'
													initial={false}
													animate={fishingExpAnimate}
													transition={fishingExpTransition}
												/>
											</div>
											<span>
												<PopStatValue value={displayedFishingExp} />/
												{fishingExpToNext}
											</span>
										</div>
									</div>
								</motion.div>
								<motion.div
									className='fishing-hud fishing-hud-player'
									initial={{ y: -50, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										duration:
											fishing.phase === "intro" &&
											openingStage === "player_stats_enter"
												? 1
												: 0.2,
									}}
								>
									<div className='fishing-hud-name'>{fishing.fishName}</div>
									<div className='small'>
										{GLYPH.crossedSwords}{" "}
										<PopStatValue value={fishing.fishAttack} /> {GLYPH.shield}{" "}
										<PopStatValue value={fishing.fishDefense} />
									</div>
									<div className='fishing-bar-wrap'>
										<div className='fishing-bar-track'>
											<motion.div
												className='fishing-bar-fill fish'
												initial={false}
												animate={{
													width: `${(Math.max(0, Math.min(fishing.fishMaxHp, fishing.fishHp)) / Math.max(1, fishing.fishMaxHp)) * 100}%`,
												}}
												transition={{ duration: 2, ease: "easeInOut" }}
											/>
										</div>
										<div className='small'>
											HP <PopStatValue value={fishing.fishHp} />/
											{fishing.fishMaxHp}
										</div>
									</div>
								</motion.div>
							</>
						)}
						<div className='fishing-portraits'>
							<div className='fishing-portrait-slot player'>
								{showPlayerPortrait && (
									<motion.div
										className='fishing-portrait player'
										initial={{
											x:
												fishing.phase === "intro" &&
												openingStage === "player_stats_enter"
													? 260
													: 0,
											opacity:
												fishing.phase === "intro" &&
												openingStage === "player_stats_enter"
													? 0
													: 1,
										}}
										animate={
											fishing.playerAnim === "stretch"
												? {
														x: 0,
														opacity: 1,
														scaleY: [1, 1.35, 0.82, 1],
														scaleX: [1, 0.95, 1.08, 1],
													}
												: fishing.playerAnim === "squash"
													? {
															x: 0,
															opacity: 1,
															scaleY: [1, 0.78, 1.1, 1],
															scaleX: [1, 1.18, 0.95, 1],
														}
													: { x: 0, opacity: 1, scaleY: 1, scaleX: 1 }
										}
										transition={{
											duration:
												fishing.phase === "intro" &&
												openingStage === "player_stats_enter"
													? 1
													: 0.45,
											ease: "easeInOut",
										}}
									>
										{playerEmoji}
									</motion.div>
								)}
								<div className='fishing-combat-toast-stack player'>
									{fishing.playerToasts.map((toast) => (
										<motion.div
											key={toast.id}
											className={`fishing-combat-toast ${toast.tone}`}
											initial={{ opacity: 0, y: 0, scale: 0.9 }}
											animate={{
												opacity: [0, 1, 1, 0],
												y: [0, -8, -20, -34],
												scale: 1,
											}}
											transition={{
												duration: (toast.durationMs ?? 900) / 1000,
												ease: "easeOut",
											}}
										>
											{toast.text}
										</motion.div>
									))}
								</div>
							</div>
							<div className='fishing-portrait-slot fish'>
								{showFishPortrait && (
									<motion.div
										className='fishing-portrait fish'
										initial={{
											x:
												fishing.phase === "intro" &&
												openingStage === "fish_enter"
													? 260
													: 0,
											opacity:
												fishing.phase === "intro" &&
												openingStage === "fish_enter"
													? 0
													: 1,
										}}
										animate={
											fishing.fishAnim === "defeat"
												? { x: 0, opacity: 0, scale: 0, rotate: 360 }
												: fishing.fishAnim === "stretch"
													? {
															x: 0,
															opacity: 1,
															scaleY: [1, 1.35, 0.82, 1],
															scaleX: [1, 0.95, 1.08, 1],
															rotate: 0,
														}
													: fishing.fishAnim === "squash"
														? {
																x: 0,
																opacity: 1,
																scaleY: [1, 0.78, 1.1, 1],
																scaleX: [1, 1.18, 0.95, 1],
																rotate: 0,
															}
														: fishing.fishAnim === "bobble"
															? {
																	x: 0,
																	opacity: 1,
																	y: [0, -14, 0, -14, 0],
																	rotate: 0,
																}
															: { x: 0, opacity: 1, y: 0, scale: 1, rotate: 0 }
										}
										transition={{
											duration:
												fishing.fishAnim === "defeat"
													? 2
													: fishing.phase === "intro" &&
														  openingStage === "fish_enter"
														? 1
														: fishing.fishAnim === "bobble"
															? 2
															: 0.45,
											ease: "easeInOut",
										}}
									>
										{fishing.fishGlyph}
									</motion.div>
								)}
								<div className='fishing-combat-toast-stack fish'>
									{fishing.fishToasts.map((toast) => (
										<motion.div
											key={toast.id}
											className={`fishing-combat-toast ${toast.tone}`}
											initial={{ opacity: 0, y: 0, scale: 0.9 }}
											animate={{
												opacity: [0, 1, 1, 0],
												y: [0, -8, -20, -34],
												scale: 1,
											}}
											transition={{
												duration: (toast.durationMs ?? 900) / 1000,
												ease: "easeOut",
											}}
										>
											{toast.text}
										</motion.div>
									))}
								</div>
							</div>
						</div>
						<div
							className={`fishing-bottom-panel ${fishingBottomActive ? "active" : "inactive"}`}
						>
							<div
								className={`fishing-text-panel fishing-panel-layer ${fishingTextVisible ? "active" : ""}`}
								aria-hidden={!fishingTextVisible}
							>
								<div className='fishing-encounter-line'>{fishing.message}</div>
							</div>
							<div
								className={`fishing-options-panel fishing-panel-layer ${fishingMenuVisible ? "active" : ""} ${controlMode === "mobile" ? "mobile-mode" : "pc-mode"}`}
								aria-hidden={!fishingMenuVisible}
							>
								{fishingBuffChoiceVisible ? (
									<>
										<div className='fishing-options-moves'>
											{fishingBuffOptions.map((option, idx) => {
												const isSelected = fishing.selectedMoveIndex === idx;
												const selectForInfo = () =>
													previewFishingBuffChoiceByIndex(idx);
												const buttonClassName = `option fishing-move-button ${showFishingSelectionCaret ? "" : " no-caret"}`;
												return (
													<div
														key={option.key}
														className={`fishing-move-action-row${isSelected ? " is-selected" : ""}`}
													>
														<button
															type='button'
															className={buttonClassName}
															onClick={option.onSelect}
															onMouseEnter={selectForInfo}
															disabled={
																!fishingMenuVisible || !fishingBuffChoiceEnabled
															}
														>
															{showFishingSelectionCaret && (
																<span>{isSelected ? ">" : " "}</span>
															)}
															<span>{option.label}</span>
														</button>
														<button
															type='button'
															className='option fishing-move-info-button'
															onClick={selectForInfo}
															onMouseEnter={selectForInfo}
															disabled={
																!fishingMenuVisible || !fishingBuffChoiceEnabled
															}
															aria-label={`Show info for ${option.label}`}
														>
															{"\u2139\uFE0F"}
														</button>
													</div>
												);
											})}
										</div>
										<div className='fishing-options-description small'>
											{selectedBuffOption?.description ?? ""}
										</div>
									</>
								) : (
									<>
										<div className='fishing-options-moves'>
											{unlockedMoveEntries.map(({ moveId, sourceIndex }) => {
												const info = fishingMoveInfo[moveId];
												const isSelected =
													fishing.selectedMoveIndex === sourceIndex;
												const isTurn = fishing.phase === "player_turn";
												const selectForInfo = () =>
													previewFishingMoveById(moveId);
												const buttonClassName = `option fishing-move-button ${showFishingSelectionCaret ? "" : " no-caret"}`;
												return (
													<div
														key={moveId}
														className={`fishing-move-action-row${isSelected ? " is-selected" : ""}`}
													>
														<button
															type='button'
															className={buttonClassName}
															onClick={() => selectFishingMoveById(moveId)}
															onMouseEnter={selectForInfo}
															disabled={!isTurn || !fishingMenuVisible}
														>
															{showFishingSelectionCaret && (
																<span>{isSelected ? ">" : " "}</span>
															)}
															<span>{info.label}</span>
														</button>
														<button
															type='button'
															className='option fishing-move-info-button'
															onClick={selectForInfo}
															onMouseEnter={selectForInfo}
															disabled={!isTurn || !fishingMenuVisible}
															aria-label={`Show info for ${info.label}`}
														>
															{"\u2139\uFE0F"}
														</button>
													</div>
												);
											})}
										</div>
										<div className='fishing-options-description small'>
											{selectedMoveOption?.description ?? ""}
										</div>
									</>
								)}
							</div>
						</div>
						{openingStage === "ready" && (
							<div className='small fishing-encounter-tip'>
								Arrows/WASD to choose, Space/Enter to act, Esc for Cut Line.
							</div>
						)}
					</div>
				</motion.div>
			)}

			{modal && (
				<div className='modal-backdrop'>
					<div
						className={`modal${modal.title.startsWith("[friendPostcard:") ? " modal-postcard" : ""}`}
					>
						{(() => {
							const selectedOption = modal.options[modalIndex];
							const dealMeta = selectedOption?.dealMeta;
							const showMarketInModal =
								!quantityPrompt && MODAL_TITLES_WITH_MARKET.has(modal.title);
							const friendPostcardMatch = modal.title.match(
								/^\[friendPostcard:([^|\]]+)(?:\|([^\]]+))?\]\n?/,
							);
							const isFriendPostcard = !!friendPostcardMatch;
							const friendPostcardSender = friendPostcardMatch?.[1] ?? "";
							const friendPostcardGlyph = friendPostcardMatch?.[2] ?? "";
							const isBottlePostcard =
								friendPostcardSender === "Message In A Bottle";
							const friendPostcardReady = Date.now() >= friendPostcardUnlockAtMs;
							const simpleMessageMatch = modal.title.match(
								/^\[simpleMessage\]\n?/,
							);
							const isSimpleMessageModal = !!simpleMessageMatch;
							const portraitMatch = modal.title.match(/^\[npcPortrait:(.+?)\]\n?/);
							const modalPortraitGlyph = portraitMatch?.[1] ?? null;
							const modalDisplayTitle = portraitMatch
								? modal.title.slice(portraitMatch[0].length)
								: modal.title;
							const [modalTitleMain, modalTitleSub] =
								modalDisplayTitle.split("\n", 2);
							const dealBadge = dealMeta
								? getDealBadge(
										dealMeta.mode,
										dealMeta.unitPrice ?? prices[dealMeta.itemId],
										dealMeta.baseUnitPrice ?? initialPrices[dealMeta.itemId],
									)
								: undefined;
							const selectedSellIncomeSource: IncomeSource | null =
								modal.title === "Supermarket" &&
								dealMeta?.mode === "sell" &&
								dealMeta.itemId
									? toIncomeSourceForMarketSale(dealMeta.itemId)
									: null;
							const selectedSellUnitPrice =
								dealMeta?.mode === "sell"
									? (dealMeta.unitPrice ?? prices[dealMeta.itemId])
									: 0;
							const selectedSellBonusPerUnit =
								selectedSellIncomeSource && selectedSellUnitPrice > 0
									? getBonusDelta(
											selectedSellUnitPrice,
											selectedSellIncomeSource,
											1,
											{
												moneyLoadoutRows,
												day,
												progressStoneAlgorithmCounts,
												inventory,
												aquariumDonations,
												animals,
												plots,
												tools,
												barnTier,
												highestForestLevelReached,
												highestCaveLevelReached,
												statistics,
											},
									  )
									: 0;
							if (isSimpleMessageModal) {
								return (
									<div
										style={{
											minHeight: 140,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											textAlign: "center",
											padding: "0 14px",
										}}
									>
										<div>{modal.body[0] ?? ""}</div>
									</div>
								);
							}
							if (isFriendPostcard) {
								return (
									<div className='friend-postcard'>
										<div className='friend-postcard-stamp'>
											<div className='friend-postcard-stamp-inner'>
												{friendPostcardGlyph}
											</div>
										</div>
										<div className='friend-postcard-address'>
											<div>From: {friendPostcardSender}</div>
											{isBottlePostcard ? <div>To: Whoever</div> : null}
										</div>
										<div className='friend-postcard-body'>
											{modal.body[0] ?? ""}
										</div>
										<div className='friend-postcard-actions'>
											<div className='friend-postcard-attachment'>
												{modal.body[1] ?? ""}
											</div>
											{friendPostcardReady ? (
												<button
													type='button'
													className='option active'
													onClick={selectModal}
												>
													CLOSE
												</button>
											) : null}
										</div>
									</div>
								);
							}
							return (
								<>
									<div
										className={`modal-shell${modalPortraitGlyph ? " with-npc-portrait" : ""}`}
									>
										{modalPortraitGlyph ? (
											<div className='modal-npc-portrait'>{modalPortraitGlyph}</div>
										) : null}
										<div className='modal-main'>
											<div className='panel-title'>{modalTitleMain}</div>
											{modalTitleSub ? (
												<div className='modal-title-sub small'>{modalTitleSub}</div>
											) : null}
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
											).map((line, i) => {
												const shouldShowSellBonus =
													!quantityPrompt &&
													selectedSellBonusPerUnit > 0 &&
													line.startsWith("Sell Price: $") &&
													line.endsWith(" each");
												return (
													<div
														key={`${line}-${i}`}
														className='small'
													>
														{line}
														{shouldShowSellBonus ? (
															<span style={{ color: "#2f9e44" }}>
																{" "}
																+${selectedSellBonusPerUnit}
															</span>
														) : null}
													</div>
												);
											})}
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
										</div>
									</div>
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
			{showMobileTouchControls && (
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
			{sideViewCutscenePending && !sideViewCutscene && (
				<div className='sideview-cutscene-backdrop' />
			)}
			<SideViewCutsceneOverlay
				scene={sideViewCutscene}
				onOk={sideViewCutsceneOk}
			/>
		</div>
	);
};
