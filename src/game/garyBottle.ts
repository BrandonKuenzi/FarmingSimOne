const garyIslandNouns = [
	"coconuts",
	"ancient maps",
	"golden seashells",
	"squeaky crabs",
	"mysterious turnips",
	"singing parrots",
	"driftwood sofas",
	"lost treasure chests",
	"banana statues",
	"shiny pebbles",
	"wild pumpkins",
	"barn doors",
	"giant eggs",
	"fishing nets",
	"moonlit carrots",
	"wool blankets",
	"floating barrels",
	"soap bubbles",
	"rubber boots",
	"pirate hats",
	"tiny goats",
	"glittering coins",
	"tea kettles",
	"paper boats",
	"wooden spoons",
	"strange footprints",
	"marshmallows",
	"friendly seagulls",
	"broken compasses",
	"sparkly rocks",
] as const;

const messagesFromGaryA = [
	"This is Gary again. Still marooned, still confused, still collecting GARY_ISLAND_NOUNS.",
	"Hello from the island. I tripped over more GARY_ISLAND_NOUNS before breakfast.",
	"Dear mainland friend, the beach washed in a fresh pile of GARY_ISLAND_NOUNS.",
	"I woke up to rain, gulls, and suspiciously organized GARY_ISLAND_NOUNS.",
	"Good news: I found shelter. Bad news: it's full of GARY_ISLAND_NOUNS.",
	"Every cave here somehow contains GARY_ISLAND_NOUNS and zero explanations.",
	"I counted the stars last night and then counted my GARY_ISLAND_NOUNS.",
	"Please tell civilization that this island is 80% sand and 20% GARY_ISLAND_NOUNS.",
	"I made a raft. It sank. At least it uncovered more GARY_ISLAND_NOUNS.",
	"The tide keeps delivering GARY_ISLAND_NOUNS like it's a subscription service.",
] as const;

const messagesFromGaryB = [
	"I miss normal conversations and chairs with four legs.",
	"At this point my best friend is a very judgmental crab.",
	"If rescue is delayed, please mail me a decent sandwich.",
	"I have started naming clouds to stay optimistic.",
	"The parrots now critique my survival strategy daily.",
	"I traded with a seagull and somehow lost that trade.",
	"I remain brave, mostly because screaming takes energy.",
	"The island is rich, but my social calendar is empty.",
	"If you send help, also send socks.",
	"I am thriving spiritually and failing at navigation.",
] as const;

const garyBottleSignoffs = [
	"I put this in a bottle and hoped for the best.",
	"Please tell everyone I am still very handsome and mostly hydrated.",
	"The island has everything except wifi and normal neighbors.",
	"If you can send rescue, also send a decent pillow.",
	"I remain optimistic and slightly sunburned.",
	"I keep waving at passing clouds in case one is a helicopter.",
] as const;

type RandomIntFn = (min: number, max: number) => number;

export const makeGaryBottleMessage = (
	rewardName: string,
	randomInt: RandomIntFn,
) => {
	const noun = garyIslandNouns[randomInt(0, garyIslandNouns.length - 1)]!;
	const lineA = messagesFromGaryA[randomInt(0, messagesFromGaryA.length - 1)]!;
	const lineB = messagesFromGaryB[randomInt(0, messagesFromGaryB.length - 1)]!;
	const signoff =
		garyBottleSignoffs[randomInt(0, garyBottleSignoffs.length - 1)]!;
	const replaceNoun = (line: string) => line.replace(/GARY_ISLAND_NOUNS/g, noun);
	return `${replaceNoun(lineA)} ${replaceNoun(lineB)} ${signoff} Thanks for listening. Enjoy the attached ${rewardName}.`;
};
