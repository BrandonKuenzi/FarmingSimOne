import type { CafeOrderItem } from "../shared/types";

export const runStartDoctorMedicine = (ctx: any): void => {
	const {
		stopAreaFade,
		currentAreaMusicRef,
		cafeOrderMusicRef,
		closeMenu,
		clearDoctorMedicineTimers,
		setDoctorUsedToday,
		setIsDoctorCompounding,
		setPauseGame,
		nextDoctorSpeechLine,
		nextDoctorObservation,
		speakNpcLine,
		setDoctorObservation,
		doctorObservationIntervalRef,
		doctorProcessTimeoutRef,
		doctorRewardTimeoutRef,
		addLog,
		playMunch,
		playGotReward,
		setStaminaMax,
		setStamina,
		switchAreaMusic,
		getAreaMusicForMap,
		playerRef,
	} = ctx;

	stopAreaFade();
	if (currentAreaMusicRef.current) currentAreaMusicRef.current.pause();
	if (cafeOrderMusicRef.current) {
		cafeOrderMusicRef.current.currentTime = 0;
		void cafeOrderMusicRef.current.play().catch(() => undefined);
	}
	closeMenu();
	clearDoctorMedicineTimers();
	setDoctorUsedToday(true);
	setIsDoctorCompounding(true);
	setPauseGame(true);
	const tick = () => {
		const spoken = nextDoctorSpeechLine();
		const observed = nextDoctorObservation();
		speakNpcLine(spoken);
		setDoctorObservation(observed);
	};
	tick();
	doctorObservationIntervalRef.current = window.setInterval(tick, 5000);
	doctorProcessTimeoutRef.current = window.setTimeout(() => {
		clearDoctorMedicineTimers();
		setIsDoctorCompounding(false);
		setDoctorObservation("");
		const doneLine = "OK. Drink up.";
		speakNpcLine(doneLine);
		addLog(doneLine);
		playMunch();
		doctorRewardTimeoutRef.current = window.setTimeout(() => {
			playGotReward();
			setStaminaMax((prevMax: number) => {
				const nextMax = prevMax + 20;
				setStamina((s: number) => Math.min(nextMax, s + 20));
				return nextMax;
			});
			addLog("Your maximum stamina increased by 20.");
			if (cafeOrderMusicRef.current) {
				cafeOrderMusicRef.current.pause();
				cafeOrderMusicRef.current.currentTime = 0;
			}
			switchAreaMusic(getAreaMusicForMap(playerRef.current.map), true);
			setPauseGame(false);
			doctorRewardTimeoutRef.current = null;
		}, 1000);
		doctorProcessTimeoutRef.current = null;
	}, 20000);
};

export const runStartCafeOrder = (ctx: any, item: CafeOrderItem): void => {
	const {
		stopAreaFade,
		currentAreaMusicRef,
		cafeOrderMusicRef,
		closeMenu,
		setIsOrdering,
		setCafeObservation,
		nextCafeObservation,
		orderLine,
		orderStartedDialog,
		randomInt,
		speakNpcLine,
		addLog,
		orderMidTimeoutRef,
		orderCompleteTimeoutRef,
		orderRewardTimeoutRef,
		cafeObservationIntervalRef,
		playMunch,
		setStamina,
		staminaMax,
		switchAreaMusic,
		getAreaMusicForMap,
		playerRef,
		orderMiddleDialog,
		orderCompleteDialog,
	} = ctx;

	stopAreaFade();
	if (currentAreaMusicRef.current) currentAreaMusicRef.current.pause();
	if (cafeOrderMusicRef.current) {
		cafeOrderMusicRef.current.currentTime = 0;
		void cafeOrderMusicRef.current.play().catch(() => undefined);
	}
	closeMenu();
	setIsOrdering(true);
	setCafeObservation(nextCafeObservation(item.name));
	const started = orderLine(orderStartedDialog[randomInt(0, orderStartedDialog.length - 1)]!, item.name);
	speakNpcLine(started);
	addLog(started);

	if (orderMidTimeoutRef.current !== null) window.clearTimeout(orderMidTimeoutRef.current);
	if (orderCompleteTimeoutRef.current !== null) window.clearTimeout(orderCompleteTimeoutRef.current);
	if (orderRewardTimeoutRef.current !== null) window.clearTimeout(orderRewardTimeoutRef.current);
	if (cafeObservationIntervalRef.current !== null) window.clearInterval(cafeObservationIntervalRef.current);
	cafeObservationIntervalRef.current = window.setInterval(() => {
		setCafeObservation(nextCafeObservation(item.name));
	}, 5000);

	const extraMiddleSteps =
		item.name === "Pizza" ? 2 : item.name === "Hamburger" || item.name === "Salad" ? 1 : 0;
	const middleStepCount = 1 + extraMiddleSteps;
	let remainingMiddleSteps = middleStepCount;

	const finishOrder = () => {
		playMunch();
		setStamina((s: number) => Math.min(staminaMax, s + item.stamina));
		setIsOrdering(false);
		setCafeObservation("");
		if (cafeObservationIntervalRef.current !== null) {
			window.clearInterval(cafeObservationIntervalRef.current);
			cafeObservationIntervalRef.current = null;
		}
		if (cafeOrderMusicRef.current) {
			cafeOrderMusicRef.current.pause();
			cafeOrderMusicRef.current.currentTime = 0;
		}
		switchAreaMusic(getAreaMusicForMap(playerRef.current.map), true);
		orderMidTimeoutRef.current = null;
		orderCompleteTimeoutRef.current = null;
		orderRewardTimeoutRef.current = null;
	};

	const runMiddleStep = () => {
		const mid = orderMiddleDialog[randomInt(0, orderMiddleDialog.length - 1)]!;
		speakNpcLine(mid);
		addLog(mid);
		remainingMiddleSteps -= 1;
		if (remainingMiddleSteps > 0) {
			orderMidTimeoutRef.current = window.setTimeout(runMiddleStep, randomInt(5, 12) * 1000);
			return;
		}
		orderCompleteTimeoutRef.current = window.setTimeout(() => {
			const done = orderLine(orderCompleteDialog[randomInt(0, orderCompleteDialog.length - 1)]!, item.name);
			speakNpcLine(done);
			addLog(done);
			orderRewardTimeoutRef.current = window.setTimeout(finishOrder, 1500);
		}, randomInt(5, 12) * 1000);
	};

	orderMidTimeoutRef.current = window.setTimeout(runMiddleStep, randomInt(5, 12) * 1000);
};

export const runNextDay = (ctx: any): void => {
	const {
		endFishing,
		randomWeather,
		day,
		currentDayEarned,
		setPreviousDayEarned,
		setCurrentDayEarned,
		stopAreaFade,
		currentAreaMusicRef,
		endOfDayRef,
		setPauseGame,
		setDayTransitionPrompt,
		nextDayPrompts,
		randomInt,
		setDayTransition,
		totalEarned,
		setStamina,
		staminaMax,
		setDay,
		setCurrentWeather,
		setForestLockedToday,
		setCaveLockedToday,
		rollBeachBottleSpawn,
		townBeachBottleTiles,
		setBeachBottlePos,
		setBeachShellDrops,
		rollBeachShellDrops,
		keyForPos,
		setNpcDailyAssignments,
		generateDailyAssignmentsForNpcs,
		townNpcNames,
		setNpcTalkedToday,
		generateForestState,
		FOREST_GATE_Y,
		applyForestRoom,
		generateCaveState,
		CAVE_GATE_Y,
		applyCaveRoom,
		setFarmWeedObstacles,
		evolveFarmWeeds,
		mapLayouts,
		farmForestBlockers,
		farmCaveBlockers,
		plots,
		STARTER_CHEST_POS,
		setPlots,
		advancePlotsForNewDay,
		animals,
		setFarmEggDrops,
		animalTiles,
		getEggDropNearChicken,
		addLog,
		setAnimals,
		resetAnimalsForNewDay,
		pendingBarnUpgrade,
		BARN_MAX_TIER,
		barnTier,
		setBarnTier,
		setPendingBarnUpgrade,
		BARN_TIER_NAMES,
		isBarnExternal,
		buildBarnLayout,
		getBarnAnimalCap,
		placeAnimalsInBounds,
		setAnimalTiles,
		setAnimalAnchors,
		pendingTractorDelivery,
		setHasTractor,
		setTractorParked,
		setPendingTractorDelivery,
		pendingPet,
		setOwnedPet,
		setPendingPet,
		prices,
		ownedPet,
		rollDailyMarketState,
		initialPriceTrends,
		priceItems,
		generatePriceChange,
		setPrices,
		setPriceTrends,
		rollDailyVendorState,
		generateSketchyMerchantStock,
		generateTraderTrades,
		setSketchyMerchantActive,
		setSketchyMerchantStock,
		setTraderActive,
		setTraderTrades,
		setDoctorVendorActive,
		setDoctorUsedToday,
		setPetVendorActive,
		generateDailyNewspaper,
		itemNames,
		setNewspaper,
	} = ctx;

	endFishing();
	const nextWeather = randomWeather();
	const upcomingDay = day + 1;
	const earnedYesterday = currentDayEarned;
	setPreviousDayEarned(earnedYesterday);
	setCurrentDayEarned(0);
	stopAreaFade();
	if (currentAreaMusicRef.current) {
		currentAreaMusicRef.current.pause();
		currentAreaMusicRef.current.currentTime = 0;
	}
	if (endOfDayRef.current) {
		endOfDayRef.current.currentTime = 0;
		void endOfDayRef.current.play().catch(() => undefined);
	}
	setPauseGame(true);
	setDayTransitionPrompt(nextDayPrompts[randomInt(0, nextDayPrompts.length - 1)]!);
	setDayTransition({ day: upcomingDay, totalEarned, previousDayEarned: earnedYesterday });
	setStamina(staminaMax);

	setDay((d: number) => d + 1);
	setCurrentWeather(nextWeather);
	setForestLockedToday(false);
	setCaveLockedToday(false);
	const nextBottlePos = rollBeachBottleSpawn(townBeachBottleTiles, randomInt);
	setBeachBottlePos(nextBottlePos);
	setBeachShellDrops(
		rollBeachShellDrops(
			townBeachBottleTiles,
			keyForPos,
			randomInt,
			nextBottlePos ? new Set([keyForPos(nextBottlePos.x, nextBottlePos.y)]) : undefined,
		),
	);
	setNpcDailyAssignments(generateDailyAssignmentsForNpcs(Object.keys(townNpcNames)));
	setNpcTalkedToday({});
	const nextForest = generateForestState({
		level: 1,
		entranceSide: "left",
		entranceCoord: FOREST_GATE_Y,
		lastTurn: 0,
	});
	applyForestRoom(nextForest);
	const nextCave = generateCaveState({
		level: 1,
		entranceSide: "right",
		entranceCoord: CAVE_GATE_Y,
		lastTurn: 0,
	});
	applyCaveRoom(nextCave);
	setFarmWeedObstacles((prev: any) =>
		evolveFarmWeeds(
			prev,
			mapLayouts.farm,
			farmForestBlockers,
			farmCaveBlockers,
			new Set(Object.keys(plots)),
			false,
			STARTER_CHEST_POS,
		),
	);

	setPlots((prev: any) => advancePlotsForNewDay(prev, nextWeather));

	const chickensReadyToLay = animals.filter((a: any) => a.type === "chicken" && a.fedToday);
	if (chickensReadyToLay.length > 0) {
		let eggsLaid = 0;
		setFarmEggDrops((prev: any) => {
			const next = { ...prev };
			chickensReadyToLay.forEach((chicken: any) => {
				const pos = animalTiles[chicken.id];
				if (!pos) return;
				const drop = getEggDropNearChicken(pos, animalTiles, next);
				if (!drop) return;
				next[keyForPos(drop.x, drop.y)] = true;
				eggsLaid += 1;
			});
			return next;
		});
		if (eggsLaid > 0) addLog(`Chickens laid ${eggsLaid} egg${eggsLaid === 1 ? "" : "s"}.`);
	}
	setAnimals((prev: any) => resetAnimalsForNewDay(prev));
	if (pendingBarnUpgrade) {
		const nextBarnTier = Math.min(BARN_MAX_TIER, barnTier + 1);
		setBarnTier(nextBarnTier);
		setPendingBarnUpgrade(false);
		addLog(`Your barn was upgraded overnight to ${BARN_TIER_NAMES[nextBarnTier]}.`);
		if (isBarnExternal(nextBarnTier)) {
			const nextLayout = buildBarnLayout(nextBarnTier);
			const rows = nextLayout.map((r: string) => r.split(""));
			const bounds = { minX: 1, maxX: (rows[0]?.length ?? 0) - 2, minY: 1, maxY: rows.length - 2 };
			const nextCap = getBarnAnimalCap(nextBarnTier);
			const relocation = placeAnimalsInBounds({ animals, cap: nextCap, bounds });
			setAnimals(relocation.keptAnimals);
			setAnimalTiles(relocation.occupied);
			setAnimalAnchors(relocation.occupied);
			setFarmEggDrops({});
		}
	}
	if (pendingTractorDelivery) {
		setHasTractor(true);
		setTractorParked(true);
		setPendingTractorDelivery(false);
		addLog("Your tractor has been delivered to the farm driveway.");
	}
	const deliveredPet = pendingPet;
	if (deliveredPet) {
		setOwnedPet(deliveredPet);
		setPendingPet(null);
		addLog(`Your new pet arrived at the farm: ${deliveredPet}`);
	}

	const oldPrices = prices;
	const { newPrices, newTrends, changedItems } = rollDailyMarketState({
		oldPrices,
		initialPriceTrends,
		priceItems,
		generatePriceChange,
		randomInt,
	});
	setPrices(newPrices);
	setPriceTrends(newTrends);
	const dailyVendorRolls = rollDailyVendorState({
		newPrices,
		ownedPet,
		deliveredPet,
		generateSketchyMerchantStock,
		generateTraderTrades,
	});
	setSketchyMerchantActive(dailyVendorRolls.showSketchy);
	setSketchyMerchantStock(dailyVendorRolls.sketchyStock);
	setTraderActive(dailyVendorRolls.showTrader);
	setTraderTrades(dailyVendorRolls.traderTrades);
	setDoctorVendorActive(dailyVendorRolls.doctorVendorActive);
	setDoctorUsedToday(false);
	setPetVendorActive(dailyVendorRolls.petVendorActive);

	const dailyNewspaper = generateDailyNewspaper(
		oldPrices,
		newPrices,
		changedItems,
		nextWeather,
		itemNames,
		randomInt,
	);
	setNewspaper(dailyNewspaper);
	addLog(`Day ${day + 1} began.`);
};

export const runContinueAfterSleep = (ctx: any): void => {
	const {
		dayTransition,
		dayTransitionClosePhase,
		crossFadeEndOfDayTo,
		houseMusicRef,
		setDayTransitionClosePhase,
		finalizeAfterSleep,
		dayTransitionCloseTimersRef,
	} = ctx;
	if (!dayTransition || dayTransitionClosePhase !== "idle") return;
	crossFadeEndOfDayTo(houseMusicRef.current, 1000);
	setDayTransitionClosePhase("card");
	const toBackdrop = window.setTimeout(() => setDayTransitionClosePhase("backdrop"), 550);
	const finalize = window.setTimeout(() => finalizeAfterSleep(), 1550);
	dayTransitionCloseTimersRef.current = [toBackdrop, finalize];
};
