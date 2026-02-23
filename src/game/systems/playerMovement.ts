import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type {
	Dir,
	Door,
	MapId,
	PetEmoji,
	Point,
	Position,
	TractorImplement,
} from "../shared/types";

type PlayerMovementContext = {
	modal: unknown;
	isOrdering: boolean;
	isDoctorCompounding: boolean;
	dirDelta: Record<Dir, { dx: number; dy: number }>;
	player: Position;
	height: number;
	width: number;
	isDrivingTractor: boolean;
	mapDoors: Record<MapId, Door[]>;
	addLog: (line: string) => void;
	farmWeedObstacles: Record<string, boolean>;
	keyForPos: (x: number, y: number) => string;
	tractorImplement: TractorImplement | null;
	tractorImplementOn: boolean;
	isPassableAt: (map: MapId, x: number, y: number) => boolean;
	handleBlockedStep?: (map: MapId, x: number, y: number) => boolean;
	ownedPet: PetEmoji | null;
	petTile: Point | null;
	isOccupied: (map: MapId, x: number, y: number) => boolean;
	playHoe: () => void;
	petRunoverBadTimeoutRef: MutableRefObject<number | null>;
	playBad: () => void;
	setOwnedPet: Dispatch<SetStateAction<PetEmoji | null>>;
	setPendingPet: Dispatch<SetStateAction<PetEmoji | null>>;
	setPetTile: Dispatch<SetStateAction<Point | null>>;
	setPetHeartTile: Dispatch<SetStateAction<Point | null>>;
	setPendingPetGravePos: Dispatch<SetStateAction<Point | null>>;
	setPetVendorActive: Dispatch<SetStateAction<boolean>>;
	setTractorFacing: Dispatch<SetStateAction<1 | -1>>;
	pendingPetGravePos: Point | null;
	setPetGraveObstacles: Dispatch<SetStateAction<Record<string, number>>>;
	setPlayer: Dispatch<SetStateAction<Position>>;
	applyTractorImplementAt: (x: number, y: number, force?: boolean) => void;
	TRACTOR_PARK_POS: Point;
	exitTractor: () => void;
	forestEntranceDoorPos: Point;
	openForestExitMenu: () => void;
	forestForwardExitPos: Point;
	continueForestDungeon: () => void;
	caveEntranceDoorPos: Point;
	openCaveExitMenu: () => void;
	caveLadderPos: Point | null;
	continueCaveDungeon: () => void;
	forestLockedToday: boolean;
	canEnterForest: () => boolean;
	caveLockedToday: boolean;
	canEnterCave: () => boolean;
	playNotification: () => void;
};

export const runMovePlayer = (ctx: PlayerMovementContext, dir: Dir): void => {
	const {
		modal,
		isOrdering,
		isDoctorCompounding,
		dirDelta,
		player,
		height,
		width,
		isDrivingTractor,
		mapDoors,
		addLog,
		farmWeedObstacles,
		keyForPos,
		tractorImplement,
		tractorImplementOn,
		isPassableAt,
		handleBlockedStep,
		ownedPet,
		petTile,
		isOccupied,
		playHoe,
		petRunoverBadTimeoutRef,
		playBad,
		setOwnedPet,
		setPendingPet,
		setPetTile,
		setPetHeartTile,
		setPendingPetGravePos,
		setPetVendorActive,
		setTractorFacing,
		pendingPetGravePos,
		setPetGraveObstacles,
		setPlayer,
		applyTractorImplementAt,
		TRACTOR_PARK_POS,
		exitTractor,
		forestEntranceDoorPos,
		openForestExitMenu,
		forestForwardExitPos,
		continueForestDungeon,
		caveEntranceDoorPos,
		openCaveExitMenu,
		caveLadderPos,
		continueCaveDungeon,
		forestLockedToday,
		canEnterForest,
		caveLockedToday,
		canEnterCave,
		playNotification,
	} = ctx;

	if (modal || isOrdering || isDoctorCompounding) return;
	const { dx, dy } = dirDelta[dir];
	const nx = player.x + dx;
	const ny = player.y + dy;
	if (nx < 0 || ny < 0 || ny >= height || nx >= width) return;
	if (isDrivingTractor && mapDoors[player.map].some((d) => d.x === nx && d.y === ny)) {
		addLog("The tractor can't go through doors.");
		return;
	}
	const targetFarmWeed = !!farmWeedObstacles[keyForPos(nx, ny)];
	if (isDrivingTractor && player.map === "farm" && targetFarmWeed) {
		if (tractorImplement !== "harvest") {
			addLog("You must have a harvester to harvest weeds.");
		} else if (!tractorImplementOn) {
			addLog("You must turn your implement on before you can harvest.");
		}
	}
	const canTractorHarvestWeedStep =
		isDrivingTractor &&
		player.map === "farm" &&
		tractorImplement === "harvest" &&
		tractorImplementOn &&
		targetFarmWeed;
	if (!isPassableAt(player.map, nx, ny) && !canTractorHarvestWeedStep) {
		if (handleBlockedStep?.(player.map, nx, ny)) return;
		return;
	}
	const tractorCrushesPet =
		isDrivingTractor &&
		player.map === "farm" &&
		!!ownedPet &&
		!!petTile &&
		petTile.x === nx &&
		petTile.y === ny;
	if (isOccupied(player.map, nx, ny) && !tractorCrushesPet) return;
	if (tractorCrushesPet) {
		playHoe();
		if (petRunoverBadTimeoutRef.current !== null) {
			window.clearTimeout(petRunoverBadTimeoutRef.current);
			petRunoverBadTimeoutRef.current = null;
		}
		petRunoverBadTimeoutRef.current = window.setTimeout(() => {
			playBad();
			petRunoverBadTimeoutRef.current = null;
		}, 500);
		setOwnedPet(null);
		setPendingPet(null);
		setPetTile(null);
		setPetHeartTile(null);
		setPendingPetGravePos({ x: nx, y: ny });
		setPetVendorActive(true);
		addLog("Your pet was run over by the tractor.");
	}
	if (isDrivingTractor) {
		if (dx < 0) setTractorFacing(1);
		else if (dx > 0) setTractorFacing(-1);
	}
	if (
		isDrivingTractor &&
		player.map === "farm" &&
		pendingPetGravePos &&
		pendingPetGravePos.x === player.x &&
		pendingPetGravePos.y === player.y &&
		(nx !== player.x || ny !== player.y)
	) {
		const key = keyForPos(player.x, player.y);
		setPetGraveObstacles((prev) => ({ ...prev, [key]: 24 }));
		setPendingPetGravePos(null);
	}
	setPlayer((prev) => ({ ...prev, x: nx, y: ny }));
	if (isDrivingTractor && player.map === "farm") {
		applyTractorImplementAt(nx, ny);
		if (nx === TRACTOR_PARK_POS.x && ny === TRACTOR_PARK_POS.y) {
			exitTractor();
		}
		return;
	}
	if (player.map === "forest" && nx === forestEntranceDoorPos.x && ny === forestEntranceDoorPos.y) {
		openForestExitMenu();
		return;
	}
	if (player.map === "forest" && nx === forestForwardExitPos.x && ny === forestForwardExitPos.y) {
		continueForestDungeon();
		return;
	}
	if (player.map === "cave" && nx === caveEntranceDoorPos.x && ny === caveEntranceDoorPos.y) {
		openCaveExitMenu();
		return;
	}
	if (player.map === "cave" && caveLadderPos && nx === caveLadderPos.x && ny === caveLadderPos.y) {
		continueCaveDungeon();
		return;
	}

	const door = mapDoors[player.map].find((d) => d.x === nx && d.y === ny);
	if (door) {
		if (door.target.map === "forest" && forestLockedToday) {
			playBad();
			addLog("You are too scared to go back in the forest today.");
			return;
		}
		if (door.target.map === "forest" && !canEnterForest()) {
			playBad();
			addLog("You are too exhausted to enter the forest.");
			return;
		}
		if (door.target.map === "cave" && caveLockedToday) {
			playBad();
			addLog("You are too scared to go back in the cave today.");
			return;
		}
		if (door.target.map === "cave" && !canEnterCave()) {
			playBad();
			addLog("You are too exhausted to enter the cave.");
			return;
		}
		playNotification();
		setPlayer({ map: door.target.map, x: door.target.x, y: door.target.y });
		addLog(`Entered ${door.target.map}.`);
	}
};
