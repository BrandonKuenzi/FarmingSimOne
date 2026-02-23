import type { Dir } from "../shared/types";

export const runMovePlayer = (ctx: any, dir: Dir): void => {
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
	if (isDrivingTractor && mapDoors[player.map].some((d: any) => d.x === nx && d.y === ny)) {
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
	if (!isPassableAt(player.map, nx, ny) && !canTractorHarvestWeedStep) return;
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
		setPetGraveObstacles((prev: any) => ({ ...prev, [key]: 24 }));
		setPendingPetGravePos(null);
	}
	setPlayer((prev: any) => ({ ...prev, x: nx, y: ny }));
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

	const door = mapDoors[player.map].find((d: any) => d.x === nx && d.y === ny);
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
