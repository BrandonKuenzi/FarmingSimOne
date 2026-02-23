// @ts-nocheck
import { motion } from "framer-motion";

export const renderGameRuntimeView = (ctx: any) => {
const {_,active,activeMapLayouts,amount,an,animals,arrives,Arrow,b,backdrop,badge,banner,bar,barn,baseUnitPrice,bed,bite,bobber,body,Boolean,brown,buy,cafeObservation,can,cancel,candidate,card,cave,caveLadderPos,caveRubble,cell,center,cloud,clouds,color,column,confirm,content,continueAfterSleep,controls,crops,Current,currentWeather,d,daily,data,day,dayTransition,dayTransitionClosePhase,dayTransitionPrompt,dayTransitionStage,dayTransitionStarsState,deal,dealBadge,dealMeta,dirt,display,doctorObservation,doorGroundClass,driving,dry,durationSec,earned,earnings,easeInOut,easeOut,em,emoji,Esc,F,face,farm,Feed,fill,final,fish,fishing,flex,flexDirection,floor,focus,fog,foliage,fontSize,footer,forest,G,game,gap,getCaveFogOpacity,getDealBadge,getDoorGroundClass,getForestFogOpacity,getToolTierName,glyph,grass,grassFoliageVariant,grid,groundClass,groundClassBase,groundClassForTile,groundTile,grow,has,hasHeadlamp,hasTractor,Headlamp,high,highlight,hit,house,hud,i,icon,id,idle,idx,info,initialPrices,interact,intro,inventory,inventoryRows,isAnimatedGrassTile,isDoctorCompounding,isDrivenTractorCell,isDrivingTractor,isFarmHouseDoorTile,isOn,isOrdering,isPetGlyphCell,isRippleWaterTile,isShopDecorTile,isShopMap,isWindSlashOn,item,itemId,keyForPos,Keys,label,ladder,layer,left,legend,length,level,li,line,linear,list,Location,log,low,marginTop,market,marketRows,Max,menu,menus,mid,min,modal,modalIndex,mode,money,moon,moonPhases,More,move,name,navigate,newspaper,next,ok,on,onAnimationComplete,one,opt,option,options,order,overlay,overlayGlyph,overnight,owned,P,pane,panel,path,pending,pendingTractorDelivery,petFacing,phase,Plant,player,playerEmoji,Please,plot,plots,pole,prev,previousDayEarned,price,prices,px,quantity,quantityPrompt,r,rainy,rainyFarmSoil,refill,renderedMap,repeat,requiredKey,ripple,row,rubble,S,scale,scaleUp,scaleX,seeds,select,selectedOption,sell,setClouds,shadow,shell,shellRef,shopDecorByMap,shouldFlipGlyph,showForestHit,showTiredFace,size,Sleep,slice,small,so,soil,Space,splash,spriteTilesNeedingGround,stamina,staminaMax,star,stars,start,startsWith,startX,stat,strip,subtext,success,T,text,the,they,tile,TIP,tips,tired,to,tomorrow,tool,toolRows,Tools,top,total,totalEarned,toUpperCase,toVisual,town,tractor,tractorFacing,Transaction,transform,tree,trend,ul,unitPrice,Use,value,vendors,Visit,visual,W,wait,waiting,Wardrobe,WASD,water,watered,waterLevel,waterRefillTile,waterRipplePhase,Weather,weatherEmojiById,wet,width,wind,withGround,wrap,x,y,yesterday} = ctx;
	return (
		<div
			className='game-shell'
			tabIndex={0}
			onKeyDown={onKeyDown}
			ref={shellRef}
		>
			<div className='hud'>
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
						<span className='inventory-item-icon'>🫗</span> {/* water can */}
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

			<div className='map-wrap'>
				<div
					className={`map ${player.map === "forest" ? "map-forest" : ""} ${player.map === "cave" ? "map-cave" : ""}`}
				>
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
									: cell === "P"
										? {
												glyph:
													isDrivingTractor
														? "🚜" // driving tractor
														: fishing && fishing.phase !== "success"
														? "🎣" // fishing pole mode
														: showTiredFace
															? "🥱" // tired face
															: playerEmoji,
											}
										: waterRefillTile &&
											  waterRefillTile.map === player.map &&
											  waterRefillTile.x === x &&
											  waterRefillTile.y === y
											? { glyph: "🫗", className: "tile-water" } // refill splash icon
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
															glyph: "🐟", // fish bite icon
															className: "tile-water tile-fishing-catch",
															overlayGlyph: fishing.requiredKey.toUpperCase(),
														}
													: cell === "~" && isRippleWaterTile(player.map, x, y)
														? {
																glyph: waterRipplePhase ? "-" : "—",
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
																? { glyph: "🪜", className: "tile-cave-next-ladder" } // next-level ladder
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
					<div className='cloud-overlay'>
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
				)}
			</div>

			<div className='info-grid'>
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<div className='controls-market-row'>
						<div className='controls'>
							<div className='panel-title'>Controls</div>
							<div>`WASD` move</div>
							<div>`Arrow Keys` interact one tile</div>
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
											{row.trend > 0 ? "📈" : row.trend < 0 ? "📉" : ""} {/* market trend */}
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
											<div>{`◂ ${quantityPrompt.value} ▸`}</div>
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
		</div>
	);
};
