type PriceMap = Record<string, number>;
type NameMap = Record<string, string>;

export const positiveEventsByItem: Record<string, string[]> = {
	turnip_seed: [
		"A celebrity rabbit endorsed turnip gardens",
		"The seed vendor won a turnip beauty pageant",
		"A town-wide turnip challenge went viral",
	],
	carrot_seed: [
		"The horses started an influencer campaign for carrots",
		"A carrot-cake festival sold out in one hour",
		"Kids declared carrots the official snack of adventure",
	],
	pumpkin_seed: [
		"The mayor announced pumpkin parade season early",
		"A giant pumpkin photo contest exploded online",
		"Local bakers panic-bought pumpkin supplies",
	],
	corn_seed: [
		"A corn maze championship was announced",
		"Tourists booked a corn-themed weekend retreat",
		"The town band dropped a chart-topping corn anthem",
	],
	turnip: [
		"A gourmet chef called turnip 'the future of flavor'",
		"A luxury turnip tasting menu opened downtown",
		"Turnip smoothies became oddly fashionable",
	],
	carrot: [
		"The eye doctor recommended carrots on every radio station",
		"A fitness club started carrot-only Tuesdays",
		"Carrot muffins became the trendiest breakfast",
	],
	pumpkin: [
		"Haunted house season arrived way too early",
		"A pumpkin sculpture contest drew huge crowds",
		"Town café launched a pumpkin-everything menu",
	],
	corn: [
		"A movie crew rented fields for dramatic corn scenes",
		"Street vendors sold out of buttered corn by noon",
		"Cornbread became the official town comfort food",
	],
	feed: [
		"The animals union negotiated premium snack standards",
		"A petting-zoo boom increased feed demand",
		"Every barn in three counties panic-bought feed",
	],
	milk: [
		"A milk mustache contest hit national TV",
		"A cereal startup signed a huge milk contract",
		"The bakery guild doubled its milk orders",
	],
	wool: [
		"A designer launched a luxury wool cloak line",
		"A cold snap made wool the hottest commodity",
		"Tailors started a 'wool week' promotion",
	],
	egg: [
		"A breakfast festival announced an omelet marathon",
		"The diner started serving twelve-egg challenge platters",
		"A baking contest caused an egg buying frenzy",
	],
	fish: [
		"A sushi pop-up opened beside the market",
		"A fishing tournament filled the town with buyers",
		"Tourists demanded fresh fish for every meal",
	],
	iron: [
		"A blacksmith demo made everyone crave stronger tools",
		"A forge festival lit up demand for raw iron",
		"Local crafters started a wildly competitive anvil club",
	],
	shell: [
		"Collectors declared this season's shells 'museum-grade'",
		"A beach wedding boom created sudden shell demand",
		"Tourists started a shiny shell scavenger trend",
	],
	diamond: [
		"Treasure hunters whispered about hidden brilliance underground",
		"Jewelers started bidding wars before sunrise",
		"A royal collector demanded flawless gemstones immediately",
	],
	emerald: [
		"Fashion houses declared green gems this season's must-have",
		"Collectors formed a queue for premium emerald cuts",
		"A museum curator panic-bought stones for a new exhibit",
	],
	ruby: [
		"A ringmaker announced a ruby rush sale",
		"Traveling nobles started paying extra for red gemstones",
		"A jeweler's guild event boosted ruby demand overnight",
	],
	coral_fruit: [
		"A deep-sea chef called coral fruit 'perfectly mysterious'",
		"A luxury gala demanded rare coral fruit desserts",
		"Collectors began trading coral fruit like treasure",
	],
};

export const negativeEventsByItem: Record<string, string[]> = {
	turnip_seed: [
		"A seed shipment got mistaken for confetti",
		"Nobody understood the turnip planting tutorial",
		"A rumor claimed turnips can sense fear",
	],
	carrot_seed: [
		"A rabbit podcast warned listeners to avoid contracts",
		"The carrot mascot slipped and hurt market morale",
		"A carrot jingle was declared 'too annoying'",
	],
	pumpkin_seed: [
		"Pumpkin decorators switched to inflatable pumpkins",
		"A viral video mocked tiny pumpkin hats",
		"Town council postponed all spooky events",
	],
	corn_seed: [
		"A storm flattened the corn maze billboard",
		"Tourists got lost and reviewed corn badly",
		"The corn anthem was banned for excessive kazoo",
	],
	turnip: [
		"A critic called turnips 'aggressively humble'",
		"The turnip tasting menu closed after one night",
		"Shoppers chose dramatic radishes instead",
	],
	carrot: [
		"A juice trend replaced carrots with mystery greens",
		"The fitness club moved to celery week",
		"Carrot muffins were rated 'emotionally confusing'",
	],
	pumpkin: [
		"Warm weather crushed spooky drink demand",
		"A pumpkin carving judge resigned mid-event",
		"Café customers pivoted to lemon desserts",
	],
	corn: [
		"Street vendors switched from corn to pretzels",
		"The movie crew replaced corn with cardboard",
		"Cornbread was briefly canceled for being too cozy",
	],
	feed: [
		"The goats started a temporary hunger strike",
		"A barn trend pushed 'minimalist snacking'",
		"An overstocked warehouse gave away free feed",
	],
	milk: [
		"The mustache contest was postponed indefinitely",
		"A cereal startup pivoted to dry cereal only",
		"Bakery guild switched to oat experiments",
	],
	wool: [
		"A warm week tanked wool coat demand",
		"Fashion week moved to breathable fabrics",
		"Tailors declared wool 'too cuddly for spring'",
	],
	egg: [
		"The omelet marathon was canceled for nap time",
		"Bakers switched to banana substitutions",
		"Diners embraced toast-only breakfasts",
	],
	fish: [
		"The sushi pop-up became a noodle shop",
		"Tournament judges ordered pizza instead of fish",
		"Tourists suddenly became suspicious of boats",
	],
	iron: [
		"The blacksmith took a nap and canceled all orders",
		"A shipment of scrap metal flooded the market",
		"Crafters switched to wood for a minimalist phase",
	],
	shell: [
		"Souvenir stands overstocked shells after a slow weekend",
		"A fashion critic called shell decor 'last tide'",
		"Tourists switched from shells to postcards overnight",
	],
	diamond: [
		"A gemstone influencer declared diamonds 'overrated today'",
		"Luxury buyers delayed orders after a gala cancellation",
		"An auction house paused bidding for high-end stones",
	],
	emerald: [
		"A style blog called emeralds 'too last season'",
		"Collectors shifted budgets away from green gems",
		"A jeweler's expo canceled its emerald showcase",
	],
	ruby: [
		"A ring trend moved from ruby to plain silver",
		"Tourists bought postcards instead of gemstones",
		"A trader dumped cheap ruby stock into town",
	],
	coral_fruit: [
		"A critic called coral fruit 'too fancy for weekdays'",
		"The gala switched to plain pudding and canceled rare fruit",
		"Buyers got distracted by a novelty pickle expo",
	],
};

export const newspaperIntros = [
	"It's another beautiful day in the valley.",
	"We hope you slept well. Here is your morning news.",
	"Fresh ink, fresh gossip, fresh market numbers.",
	"Good morning, farmer. The economy did a little wiggle.",
	"Today's headline: the market had feelings overnight.",
	"Breaking moo-s: prices shifted while you were dreaming.",
	"Welcome back to your favorite tiny financial chaos report.",
	"Top story: supply, demand, and one dramatic goose.",
] as const;

export const newspaperFinishers = [
	"Thank you for reading.",
	"Feel free to recycle this newspaper.",
	"Tell your friends, then sell your crops.",
	"And a final personal note: Hi Mom, I'm in the paper now!",
	"Stay hydrated and respect your local turnips.",
	"Until tomorrow: keep calm and hoe on.",
	"This edition was approved by three chickens and a cow.",
	"If this paper gets wet, just call it avant-garde.",
] as const;

export const generatePriceChange = (oldPrice: number, randomInt: (min: number, max: number) => number) => {
	for (let i = 0; i < 20; i += 1) {
		const raw = randomInt(-4, 4);
		if (raw === 0) continue;
		const next = Math.max(2, oldPrice + raw);
		const delta = next - oldPrice;
		if (delta !== 0) return delta;
	}
	return oldPrice <= 2 ? 1 : -1;
};

export const generateDailyNewspaper = (
	oldPrices: PriceMap,
	newPrices: PriceMap,
	changedItems: string[],
	weather: string,
	itemNames: NameMap,
	randomInt: (min: number, max: number) => number,
) => {
	const intro = newspaperIntros[randomInt(0, newspaperIntros.length - 1)]!;
	const finisher = newspaperFinishers[randomInt(0, newspaperFinishers.length - 1)]!;
	const weatherLine = `It's going to be a ${weather} day today`;
	const body = changedItems
		.map((item) => {
			const oldPrice = oldPrices[item] ?? 0;
			const newPrice = newPrices[item] ?? oldPrice;
			const delta = newPrice - oldPrice;
			const events = delta >= 0 ? positiveEventsByItem[item] : negativeEventsByItem[item];
			const event = (events && events.length > 0
				? events[randomInt(0, events.length - 1)]
				: "Market conditions shifted unexpectedly")!;
			const riseOrFall = delta >= 0 ? "rise by" : "fall by";
			const priceChange = Math.abs(delta);
			const label = itemNames[item] ?? item;
			return `${event} which made the cost of ${label} ${riseOrFall} $${priceChange}.`;
		})
		.join("\n\n");
	return `${intro}\n${weatherLine}\n\n${body}\n\n${finisher}`;
};
