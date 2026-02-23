import type { Dir } from "../shared/types";

export const runInteract = (ctx: any, dir: Dir): void => {
const {
modal,beachBottlePos,playHoe,playYaya,prices,CORAL_FRUIT_SELL_PRICE,nextDay,handleLateInteractionBlocks,money,playMunch,speakNpcLine,fishing,isOrdering,isDoctorCompounding,isDrivingTractor,dirDelta,player,activeMapLayouts,forestEntranceDoorPos,openForestExitMenu,forestForwardExitPos,continueForestDungeon,caveEntranceDoorPos,openCaveExitMenu,caveLadderPos,continueCaveDungeon,mapDoors,forestLockedToday,canEnterForest,caveLockedToday,canEnterCave,playBad,addLog,playNotification,setPlayer,ownedPet,petTile,playPetSound,setPetHeartTile,petHeartTimeoutRef,hasTractor,tractorParked,TRACTOR_PARK_POS,openMenu,closeMenu,enterTractor,allPlantableCropIds,cropDefs,inventory,itemNames,setBeachBottlePos,playGotReward,rollBeachBottleReward,randomInt,stamina,staminaMax,animals,barnAnimalCap,nextOpenBarnTile,animalTiles,setStamina,setOwnedWardrobeLooks,spawnAnimalInBarn,makeGaryBottleMessage,playSeagulls,beachShellDrops,keyForPos,setBeachShellDrops,playPluck,day,starterChestOpened,STARTER_CHEST_POS,setStarterChestOpened,applyMoneyDelta,updateInventory,openRewardPopup,farmWeedObstacles,trySpendStamina,setFarmWeedObstacles,getWaterCapacity,tools,tryUseToolAction,setWaterLevel,playWater,setWaterRefillTile,waterRefillTileTimeoutRef,startFishing,forestChest,setForestChest,openHighValueForestChestReward,forestBonusChests,setForestBonusChests,forestIsBonusLevel,grantBonusChestRewardSet,forestObstacleAt,setForestObstacles,getSmashAxeActionCost,getSmashAxeWoodSeedChance,getRandomCropId,standardCropIds,getSmashAxeRockDamage,getSmashAxeIronChance,caveObstacleAt,setCaveObstacles,caveLevel,setCaveLadderPos,caveObstacles,animalsMap,farmForestBlockers,setFarmForestBlockers,farmCaveBlockers,setFarmCaveBlockers,petGraveObstacles,setPetGraveObstacles,plots,getHoeTargets,setPlots,currentWeather,playPloop,waterLevel,isShopMap,shopDecorByMap,isFarmHouseDoorTile,getDoorGroundClass,isBathing,playBath,setIsBathing,clothingShopItems,ownedWardrobeLooks,starterWardrobeLooks,purchasableFunnyLooks,setPlayerEmoji,farmEggDrops,setFarmEggDrops,isCowLikeAnimal,rollLivestockYield,setAnimals,generateOverfedAnimalLine,interactBuilderVendor,interactVendor,vendorByShopMap,petVendorActive,pendingPet,canAfford,playChaChing,setPendingPet,petOptions,petVendorSoldLine,doctorVendorActive,doctorUsedToday,doctorFinishedTodayLine,doctorIntroLines,startDoctorMedicine,traderActive,TRADER_BOX_POS,traderBoxLines,TRADER_HELI_POS,traderHeliLines,TRADER_POS,traderTrades,traderSoldOutLines,traderIntroLines,openQuantityPrompt,setTraderTrades,traderAfterSaleLines,sketchyMerchantActive,sketchyMerchantStock,SKETCHY_CRATE_POS,dontTouchSketchy,SKETCHY_MERCHANT_POS,sketchyMerchantIntro,setSketchyMerchantStock,sketchyVendorSales,boatTiles,boatDialogArray,townNpcTiles,townNpcNames,npcDailyAssignments,generateDailyAssignmentsForNpcs,npcTalkedToday,townTips,generateNpcGreetingLine,generateNpcDialogLine,setNpcTalkedToday,DOCTOR_POS,PET_VENDOR_POS
} = ctx;
		if (modal || fishing || isOrdering || isDoctorCompounding || isDrivingTractor)
			return;
		const { dx, dy } = dirDelta[dir];
		const tx = player.x + dx;
		const ty = player.y + dy;
		const targetBaseTile = activeMapLayouts[player.map]?.[ty]?.[tx];
		if (
			player.map === "forest" &&
			tx === forestEntranceDoorPos.x &&
			ty === forestEntranceDoorPos.y
		) {
			openForestExitMenu();
			return;
		}
		if (
			player.map === "forest" &&
			tx === forestForwardExitPos.x &&
			ty === forestForwardExitPos.y
		) {
			continueForestDungeon();
			return;
		}
		if (
			player.map === "cave" &&
			tx === caveEntranceDoorPos.x &&
			ty === caveEntranceDoorPos.y
		) {
			openCaveExitMenu();
			return;
		}
		if (player.map === "cave" && caveLadderPos && tx === caveLadderPos.x && ty === caveLadderPos.y) {
			continueCaveDungeon();
			return;
		}
		const targetDoor =
			player.map === "forest"
				? undefined
				: mapDoors[player.map].find((d: any) => d.x === tx && d.y === ty);
		if (targetDoor) {
			if (targetDoor.target.map === "forest" && forestLockedToday) {
				playBad();
				addLog("You are too scared to go back in the forest today.");
				return;
			}
			if (targetDoor.target.map === "forest" && !canEnterForest()) {
				playBad();
				addLog("You are too exhausted to enter the forest.");
				return;
			}
			if (targetDoor.target.map === "cave" && caveLockedToday) {
				playBad();
				addLog("You are too scared to go back in the cave today.");
				return;
			}
			if (targetDoor.target.map === "cave" && !canEnterCave()) {
				playBad();
				addLog("You are too exhausted to enter the cave.");
				return;
			}
			playNotification();
			setPlayer({
				map: targetDoor.target.map,
				x: targetDoor.target.x,
				y: targetDoor.target.y,
			});
			addLog(`Entered ${targetDoor.target.map}.`);
			return;
		}
		if (player.map === "farm" && ownedPet && petTile && petTile.x === tx && petTile.y === ty) {
			playPetSound(ownedPet);
			setPetHeartTile({ x: petTile.x, y: Math.max(0, petTile.y - 1) });
			if (petHeartTimeoutRef.current !== null) {
				window.clearTimeout(petHeartTimeoutRef.current);
			}
			petHeartTimeoutRef.current = window.setTimeout(() => {
				setPetHeartTile(null);
				petHeartTimeoutRef.current = null;
			}, 600);
			addLog(`You play with your pet ${ownedPet}.`);
			return;
		}
		if (
			player.map === "farm" &&
			hasTractor &&
			tractorParked &&
			tx === TRACTOR_PARK_POS.x &&
			ty === TRACTOR_PARK_POS.y
		) {
			openMenu("Choose Implament", ["Choose tractor implement."], [
				{
					label: "Plow",
					info: [
						"Turns grass into dirt as you drive.",
						"When driving tractor, press space to turn on and off your implement",
					],
					onSelect: () => {
						closeMenu();
						enterTractor("plow");
					},
				},
				{
					label: "Sow",
					info: [
						"Plants loaded seeds into empty dirt while driving.",
						"When driving tractor, press space to turn on and off your implement",
					],
					onSelect: () => {
						const seedChoices = allPlantableCropIds
							.map((cropId: any) => cropDefs[cropId].seedItem)
							.filter((itemId: any, idx: any, arr: any) => arr.indexOf(itemId) === idx)
							.filter((itemId: any) => inventory[itemId] > 0);
						if (seedChoices.length < 1) {
							playBad();
							openMenu("Tractor", ["Out of seeds"], [
								{ label: "OK", onSelect: closeMenu },
							]);
							return;
						}
						openMenu(
							"Load Seeds",
							["Choose seeds to load into the tractor."],
							[
								...seedChoices.map((seedItem: any) => ({
									label: `${itemNames[seedItem]} (${inventory[seedItem]})`,
									info: [
										"When driving tractor, press space to turn on and off your implement",
									],
									onSelect: () => {
										closeMenu();
										enterTractor("sow", seedItem);
									},
								})),
								{ label: "Back", onSelect: closeMenu },
							],
						);
					},
				},
				{
					label: "Water",
					info: [
						"Waters dry dirt and dry plants as you drive.",
						"When driving tractor, press space to turn on and off your implement",
					],
					onSelect: () => {
						closeMenu();
						enterTractor("water");
					},
				},
				{
					label: "Harvest",
					info: [
						"Harvests ready crops as you drive.",
						"When driving tractor, press space to turn on and off your implement",
					],
					onSelect: () => {
						closeMenu();
						enterTractor("harvest");
					},
				},
				{ label: "Back", onSelect: closeMenu },
			]);
			return;
		}
		if (
			player.map === "town" &&
			beachBottlePos &&
			beachBottlePos.x === tx &&
			beachBottlePos.y === ty
		) {
			setBeachBottlePos(null);
			playGotReward();
			const rewardName = rollBeachBottleReward({
				randomInt,
				stamina,
				staminaMax,
				animalsCount: animals.length,
				barnAnimalCap,
				canSpawnAnimal: nextOpenBarnTile(animalTiles) !== null,
				ownedWardrobeLooks,
				applyMoneyDelta,
				updateInventory,
				setStamina,
				setOwnedWardrobeLooks,
				spawnAnimalInBarn,
			});
			const garyMessage = makeGaryBottleMessage(rewardName, randomInt);
			addLog(garyMessage);
			playSeagulls();
			openMenu("Message In A Bottle", [garyMessage], [
				{ label: "Take Reward", onSelect: closeMenu },
			]);
			return;
		}
		if (player.map === "town" && beachShellDrops[keyForPos(tx, ty)]) {
			const shellKey = keyForPos(tx, ty);
			setBeachShellDrops((prev: any) => {
				const next = { ...prev };
				delete next[shellKey];
				return next;
			});
			playPluck();
			updateInventory("shell", 1);
			addLog("Picked up a shell.");
			return;
		}
		if (
			player.map === "farm" &&
			day === 1 &&
			!starterChestOpened &&
			tx === STARTER_CHEST_POS.x &&
			ty === STARTER_CHEST_POS.y
		) {
			setStarterChestOpened(true);
			applyMoneyDelta(1200);
			updateInventory("turnip_seed", 5);
			openRewardPopup("Starter chest reward: $1200 and Turnip Seeds x5.");
			return;
		}
		const farmTargetKey = keyForPos(tx, ty);
		if (player.map === "farm" && farmWeedObstacles[farmTargetKey]) {
			if (!trySpendStamina(1)) return;
			setFarmWeedObstacles((prev: any) => ({ ...prev, [farmTargetKey]: false }));
			playHoe();
			const gotFeed = Math.random() < 0.5;
			const gotMoney = Math.random() < 0.02;
			const lines: string[] = [];
			if (gotFeed) {
				updateInventory("feed", 1);
				lines.push("Found Feed +1.");
			}
			if (gotMoney) {
				const amount = randomInt(1, 5);
				applyMoneyDelta(amount);
				lines.push(`Found $${amount}.`);
			}
			addLog(lines.length > 0 ? lines.join(" ") : "You cleared some weeds.");
			return;
		}
		if (targetBaseTile === "~" || targetBaseTile === "[") {
			const waterCapacity = getWaterCapacity(tools);
			if (waterLevel < waterCapacity) {
				if (!tryUseToolAction(tools.wateringCan)) return;
				setWaterLevel(waterCapacity);
				playWater();
				setWaterRefillTile({ map: player.map, x: tx, y: ty });
				if (waterRefillTileTimeoutRef.current !== null) {
					window.clearTimeout(waterRefillTileTimeoutRef.current);
				}
				waterRefillTileTimeoutRef.current = window.setTimeout(() => {
					setWaterRefillTile(null);
					waterRefillTileTimeoutRef.current = null;
				}, 1000);
				addLog("Refilled water.");
				return;
			}
			if (tools.fishingRod <= 0) {
				playBad();
				addLog("You need a Fishing Rod to fish.");
				return;
			}
			if (!tryUseToolAction(tools.fishingRod)) return;
			startFishing(player.map, tx, ty);
			return;
		}

		if (player.map === "forest") {
			if (forestChest.x === tx && forestChest.y === ty && !forestChest.opened) {
				setForestChest((prev: any) => ({ ...prev, opened: true }));
				openHighValueForestChestReward();
				return;
			}

			const bonusChest = forestBonusChests.find(
				(chest: any) => chest.x === tx && chest.y === ty && !chest.opened,
			);
			if (bonusChest) {
				setForestBonusChests((prev: any) =>
					prev.map((chest: any) =>
						chest.id === bonusChest.id ? { ...chest, opened: true } : chest,
					),
				);
				if (forestIsBonusLevel) {
					openHighValueForestChestReward();
					return;
				}
				const roll = Math.random();
				let line = "";
				if (roll < 0.2) {
					const options: Array<"food" | "money" | "seeds" | "iron"> = [
						"food",
						"money",
						"seeds",
						"iron",
					];
					line = grantBonusChestRewardSet([
						options[randomInt(0, options.length - 1)]!,
					]);
				} else if (roll < 0.4) {
					line = grantBonusChestRewardSet(["money"]);
				} else if (roll < 0.6) {
					line = grantBonusChestRewardSet(["seeds"]);
				} else if (roll < 0.8) {
					const options = ["food", "money", "seeds", "iron"] as const;
					const shuffled = [...options].sort(() => Math.random() - 0.5);
					line = grantBonusChestRewardSet([shuffled[0]!, shuffled[1]!]);
				} else {
					const options = ["food", "money", "seeds", "iron"] as const;
					const withIron = Math.random() < 0.5;
					line = grantBonusChestRewardSet(
						withIron ? [...options] : ["food", "money", "seeds"],
					);
				}
				openRewardPopup(line);
				return;
			}

			const obstacle = forestObstacleAt(tx, ty);
			if (obstacle?.type === "weed") {
				if (!trySpendStamina(1)) return;
				setForestObstacles((prev: any) => prev.filter((o: any) => o.id !== obstacle.id));
				playHoe();
				const gotFeed = Math.random() < 0.5;
				const gotMoney = Math.random() < 0.02;
				const lines: string[] = [];
				if (gotFeed) {
					updateInventory("feed", 1);
					lines.push("Found Feed +1.");
				}
				if (gotMoney) {
					const amount = randomInt(1, 5);
					applyMoneyDelta(amount);
					lines.push(`Found $${amount}.`);
				}
				addLog(lines.length > 0 ? lines.join(" ") : "You cleared some weeds.");
				return;
			}
			if (obstacle?.type === "wood") {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 0) {
					playBad();
					addLog("A Smash Axe is needed to break wood.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				setForestObstacles((prev: any) => prev.filter((o: any) => o.id !== obstacle.id));
				playHoe();
				const seedChance = getSmashAxeWoodSeedChance(smashAxeLevel);
				if (Math.random() < seedChance) {
					const cropId = getRandomCropId(standardCropIds, randomInt);
					const seedItem = cropDefs[cropId].seedItem;
					updateInventory(seedItem, 1);
					addLog(`You chopped wood and found ${itemNames[seedItem]} +1.`);
				} else {
					addLog("You broke the wood obstacle.");
				}
				return;
			}
			if (obstacle?.type === "rock") {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 1) {
					playBad();
					addLog("Your Smash Axe tier is too low to break rocks.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				const damage = getSmashAxeRockDamage(smashAxeLevel);
				const nextHitsRemaining = Math.max(0, obstacle.hitsRemaining - damage);
				setForestObstacles((prev: any) =>
					prev
						.map((o: any) =>
							o.id === obstacle.id
								? { ...o, hitsRemaining: Math.max(0, o.hitsRemaining - damage) }
								: o,
						)
						.filter((o: any) => o.hitsRemaining > 0),
				);
				playHoe();
				if (nextHitsRemaining > 0) {
					const swingsLeft = Math.ceil(nextHitsRemaining / damage);
					addLog(`You chip the rock. ${swingsLeft} swing${swingsLeft === 1 ? "" : "s"} left.`);
				} else {
					if (Math.random() < getSmashAxeIronChance(smashAxeLevel)) {
						updateInventory("iron", 1);
						playYaya();
						addLog("You broke the rock and found Iron +1.");
					} else {
						addLog("You broke the rock.");
					}
				}
				return;
			}
		}
		if (player.map === "cave") {
			const obstacle = caveObstacleAt(tx, ty);
			if (obstacle?.type === "rock") {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 1) {
					playBad();
					addLog("Your Smash Axe tier is too low to break cave rocks.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				const damage = getSmashAxeRockDamage(smashAxeLevel);
				const nextHitsRemaining = Math.max(0, obstacle.hitsRemaining - damage);
				setCaveObstacles((prev: any) =>
					prev
						.map((o: any) =>
							o.id === obstacle.id
								? { ...o, hitsRemaining: Math.max(0, o.hitsRemaining - damage) }
								: o,
						)
						.filter((o: any) => o.hitsRemaining > 0),
				);
				playHoe();
				if (nextHitsRemaining > 0) {
					const swingsLeft = Math.ceil(nextHitsRemaining / damage);
					addLog(`You chip the cave rock. ${swingsLeft} swing${swingsLeft === 1 ? "" : "s"} left.`);
				} else {
					let foundGem = false;
					if (caveLevel >= 10 && Math.random() < 1 / 40) {
						updateInventory("diamond", 1);
						playYaya();
						addLog("You found a Diamond! (+1)");
						foundGem = true;
					} else if (caveLevel >= 5 && Math.random() < 1 / 30) {
						updateInventory("emerald", 1);
						playYaya();
						addLog("You found an Emerald! (+1)");
						foundGem = true;
					} else if (Math.random() < 1 / 10) {
						updateInventory("ruby", 1);
						playYaya();
						addLog("You found a Ruby! (+1)");
						foundGem = true;
					}
					if (!foundGem && Math.random() < getSmashAxeIronChance(smashAxeLevel)) {
						updateInventory("iron", 1);
						playYaya();
						addLog("You broke the cave rock and found Iron +1.");
					} else if (!foundGem) {
						addLog("You broke the cave rock.");
					}
					if (!caveLadderPos) {
						const remainingRocks = caveObstacles.filter((o: any) => o.id !== obstacle.id).length;
						const revealChance = 1 / 12;
						if (remainingRocks <= 0 || Math.random() < revealChance) {
							setCaveLadderPos({ x: obstacle.x, y: obstacle.y });
							addLog("A ladder appears leading deeper into the cave.");
						}
					}
				}
				return;
			}
		}

		if (player.map === animalsMap) {
			const blockerKey = keyForPos(tx, ty);
			if (farmForestBlockers[blockerKey]) {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 0) {
					playBad();
					addLog("A Smash Axe is needed to clear this path.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				setFarmForestBlockers((prev: any) => ({ ...prev, [blockerKey]: false }));
				playHoe();
				const seedChance = getSmashAxeWoodSeedChance(smashAxeLevel);
				if (Math.random() < seedChance) {
					const cropId = getRandomCropId(standardCropIds, randomInt);
					const seedItem = cropDefs[cropId].seedItem;
					updateInventory(seedItem, 1);
					addLog(`You cleared the path and found ${itemNames[seedItem]} +1.`);
				} else {
					addLog("You chopped away the forest blockage.");
				}
				return;
			}
			if (farmCaveBlockers[blockerKey]) {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 1) {
					playBad();
					addLog("Your Smash Axe tier is too low to break these cave rocks.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				const damage = getSmashAxeRockDamage(smashAxeLevel);
				const hitsRemaining = farmCaveBlockers[blockerKey] ?? 0;
				const nextHitsRemaining = Math.max(0, hitsRemaining - damage);
				setFarmCaveBlockers((prev: any) => {
					const current = prev[blockerKey] ?? 0;
					const remaining = Math.max(0, current - damage);
					if (remaining <= 0) {
						const next = { ...prev };
						delete next[blockerKey];
						return next;
					}
					return { ...prev, [blockerKey]: remaining };
				});
				playHoe();
				if (nextHitsRemaining > 0) {
					const swingsLeft = Math.ceil(nextHitsRemaining / damage);
					addLog(
						`You chip the cave blockage. ${swingsLeft} swing${swingsLeft === 1 ? "" : "s"} left.`,
					);
				} else {
					if (Math.random() < getSmashAxeIronChance(smashAxeLevel)) {
						updateInventory("iron", 1);
						playYaya();
						addLog("You smashed the cave blockage and found Iron +1.");
					} else {
						addLog("You smashed the cave blockage.");
					}
				}
				return;
			}
			if (petGraveObstacles[blockerKey]) {
				const smashAxeLevel = tools.smashAxe;
				if (smashAxeLevel <= 1) {
					playBad();
					addLog("Your Smash Axe tier is too low to break this gravestone.");
					return;
				}
				if (!trySpendStamina(getSmashAxeActionCost(smashAxeLevel))) return;
				const damage = getSmashAxeRockDamage(smashAxeLevel);
				const hitsRemaining = petGraveObstacles[blockerKey] ?? 0;
				const nextHitsRemaining = Math.max(0, hitsRemaining - damage);
				setPetGraveObstacles((prev: any) => {
					const current = prev[blockerKey] ?? 0;
					const remaining = Math.max(0, current - damage);
					if (remaining <= 0) {
						const next = { ...prev };
						delete next[blockerKey];
						return next;
					}
					return { ...prev, [blockerKey]: remaining };
				});
				playHoe();
				if (nextHitsRemaining > 0) {
					const swingsLeft = Math.ceil(nextHitsRemaining / damage);
					addLog(
						`You chip the gravestone. ${swingsLeft} swing${swingsLeft === 1 ? "" : "s"} left.`,
					);
				} else if (Math.random() < getSmashAxeIronChance(smashAxeLevel)) {
					updateInventory("iron", 1);
					playYaya();
					addLog("You smashed the gravestone and found Iron +1.");
				} else {
					addLog("You smashed the gravestone.");
				}
				return;
			}
			const baseTile = activeMapLayouts.farm[ty]?.[tx];
			const plotKey = keyForPos(tx, ty);
			if (baseTile === "," && !plots[plotKey]) {
				const targets = getHoeTargets(player.x, player.y, dir, tools.hoe);
				const nextPlots: Record<string, any> = { ...plots };
				let hoedCount = 0;
				targets.forEach(({ x, y }: any) => {
					const row = activeMapLayouts.farm[y];
					if (!row || row[x] !== ",") return;
					const key = keyForPos(x, y);
					if (nextPlots[key]) return;
					nextPlots[key] = { crop: null, growthDays: 0, watered: false };
					hoedCount += 1;
				});
				if (hoedCount > 0) {
					if (!tryUseToolAction(tools.hoe)) return;
					setPlots(nextPlots);
					playHoe();
					addLog(`Hoed ${hoedCount} tile${hoedCount === 1 ? "" : "s"}.`);
				} else {
					addLog("No grass to hoe there.");
				}
				return;
			}
			if (plots[plotKey]) {
				const plot = plots[plotKey];
				if (!plot.crop) {
					const seedOptions = allPlantableCropIds
						.filter((cropId: any) => inventory[cropDefs[cropId].seedItem] > 0)
						.map((cropId: any) => ({
							cropId,
							def: cropDefs[cropId],
						}));
					openMenu(
						"Plant Seed",
						[
							seedOptions.length > 0
								? "Choose seed to plant in this plot."
								: "No seeds available. You can reset this tile to grass.",
						],
						[
							...seedOptions.map(({ cropId, def }: any) => ({
								label: `${cropId === "coral_fruit" ? "Sea Shell" : def.name} (${inventory[def.seedItem]})`,
								info: [
									`Grow Time: ${def.growDays} day${def.growDays === 1 ? "" : "s"}`,
									`Current Sell Value: $${def.harvestItem === "coral_fruit" ? CORAL_FRUIT_SELL_PRICE : prices[def.harvestItem]}`,
									`Seed In Bag: ${inventory[def.seedItem]}`,
								],
								onSelect: () => {
									updateInventory(def.seedItem, -1);
									setPlots((prev: any) => ({
										...prev,
										[plotKey]: {
											crop: cropId,
											growthDays: 0,
											watered: currentWeather === "rainy",
										},
									}));
									playPloop();
									addLog(`Planted ${def.name}.`);
									closeMenu();
								},
							})),
							{
								label: "Reset to Grass",
								info: ["Turn this soil tile back into grass."],
								onSelect: () => {
									setPlots((prev: any) => {
										const next = { ...prev };
										delete next[plotKey];
										return next;
									});
									playHoe();
									addLog("Reset soil to grass.");
									closeMenu();
								},
							},
							{
								label: "Back",
								info: ["Close this menu."],
								onSelect: closeMenu,
							},
						],
					);
					return;
				}

				const crop = cropDefs[plot.crop];
				const grown = plot.growthDays >= crop.growDays;
				if (grown) {
					setPlots((prev: any) => ({
						...prev,
						[plotKey]: { crop: null, growthDays: 0, watered: false },
					}));
					updateInventory(crop.harvestItem, 1);
					playPluck();
					addLog(`Harvested ${crop.name}.`);
				} else if (!plot.watered) {
					const targets = getHoeTargets(
						player.x,
						player.y,
						dir,
						tools.wateringCan,
					);
					const waterableKeys = targets
						.map(({ x, y }: any) => keyForPos(x, y))
						.filter((k: any) => {
							const p = plots[k];
							if (!p?.crop || p.watered) return false;
							const def = cropDefs[p.crop];
							return p.growthDays < def.growDays;
						});
					if (waterLevel <= 0) {
						playBad();
						addLog("Out of water. Refill at a water tile.");
						return;
					}
					const wateredCount = Math.min(waterLevel, waterableKeys.length);
					if (wateredCount <= 0) {
						addLog("No thirsty plants in range.");
						return;
					}
					if (!tryUseToolAction(tools.wateringCan)) return;
					const keysToWater = waterableKeys.slice(0, wateredCount);
					setWaterLevel((w: any) => Math.max(0, w - wateredCount));
					setPlots((prev: any) => ({
						...prev,
						...Object.fromEntries(
							keysToWater.map((k: any) => [k, { ...prev[k]!, watered: true }]),
						),
					}));
					playWater();
					addLog(
						`Watered ${wateredCount} plant${wateredCount === 1 ? "" : "s"}.`,
					);
				} else {
					addLog(
						`${crop.name} is growing (${plot.growthDays}/${crop.growDays} days). This plant is watered and will grow tonight.`,
					);
				}
				return;
			}
		}

		if (player.map === "house" && targetBaseTile === "d") {
			openMenu(
				"Call it a day?",
				["Sleep until tomorrow?"],
				[
					{
						label: "Yes",
						onSelect: () => {
							playNotification();
							closeMenu();
							nextDay();
						},
					},
					{ label: "No", onSelect: closeMenu },
				],
			);
			return;
		}
		if (player.map === "house" && targetBaseTile === "U") {
			if (stamina >= staminaMax) {
				addLog("You are not tired enough to take a bath right now.");
				return;
			}
			setIsBathing(true);
			playBath();
			addLog("You settle into a warm bath.");
			return;
		}
		if (player.map === "house" && targetBaseTile === "w") {
			const remainingOutfits = clothingShopItems.filter(
				(item: any) => !ownedWardrobeLooks.includes(item.look),
			).length;
			const hasMoreToPurchase = remainingOutfits > 0;
			openMenu(
				"Wardrobe",
				["Choose your look."],
				[
					...ownedWardrobeLooks.map((look: any) => ({
						label: look,
						info: [
							starterWardrobeLooks.includes(
								look as (typeof starterWardrobeLooks)[number],
							)
								? "A starter outfit that came with your house"
								: purchasableFunnyLooks.includes(
											look as (typeof purchasableFunnyLooks)[number],
									  )
									? "A very fancy costume you bought for a pretty penny"
									: "An outfit you bought from town",
							...(hasMoreToPurchase
								? ["", "", "More outfits can be purchased in town."]
								: []),
						],
						onSelect: () => {
							setPlayerEmoji(look);
							addLog(`Changed outfit to ${look}.`);
							closeMenu();
						},
					})),
					{ label: "Back", onSelect: closeMenu },
				],
			);
			return;
		}

		if (
			handleLateInteractionBlocks({
				playerMap: player.map,
				tx,
				ty,
				targetBaseTile,
				farmTargetKey,
				farmEggDrops,
				setFarmEggDrops,
				animals,
				animalTiles,
				tools,
				inventory,
				money,
				traderTrades,
				sketchyMerchantStock,
				boatTiles,
				townNpcTiles,
				npcDailyAssignments,
				npcTalkedToday,
				petVendorActive,
				ownedPet,
				pendingPet,
				doctorVendorActive,
				doctorUsedToday,
				traderActive,
				sketchyMerchantActive,
				playPluck,
				playBad,
				playMunch,
				playChaChing,
				speakNpcLine,
				addLog,
				updateInventory,
				canAfford,
				applyMoneyDelta,
				setAnimals,
				setPendingPet,
				setTraderTrades,
				setSketchyMerchantStock,
				setNpcTalkedToday,
				interactVendor,
				interactBuilderVendor,
				startDoctorMedicine,
				closeMenu,
				openMenu,
				openQuantityPrompt,
				randomInt,
			})
		)
			return;

		addLog("Nothing to interact with.");
}


