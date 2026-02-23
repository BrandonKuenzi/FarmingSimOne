import { randomRoll } from "./game/shared/random";

export type NpcDialogType = "Problem" | "RandomFact" | "Complement";

export type NpcDailyAssignment = {
	currentNounA: string;
	currentNounB: string;
	currentAdjective: string;
};

const pick = <T,>(arr: T[]) => arr[Math.floor(randomRoll() * arr.length)]!;

export const nouns = [
	"turnip",
	"carrot",
	"pumpkin",
	"cornstalk",
	"hay bale",
	"barn door",
	"watering can",
	"tractor",
	"scarecrow",
	"fence post",
	"pitchfork",
	"milk bucket",
	"wool bundle",
	"egg basket",
	"seed sack",
	"rain barrel",
	"farm cat",
	"cowbell",
	"windmill",
	"greenhouse",
	"wheelbarrow",
	"chicken coop",
	"goat",
	"sheepdog",
	"mud puddle",
	"compost pile",
	"field mouse",
	"sun hat",
	"boots",
	"overalls",
	"lunch pail",
	"barn owl",
	"garden gnome",
	"rubber duck",
	"spatula",
	"teapot",
	"couch cushion",
	"sock",
	"toaster",
	"spoon",
	"flashlight",
	"lantern",
	"accordion",
	"kazoo",
	"pineapple",
	"waffle",
	"pickle jar",
	"paperclip",
	"yo-yo",
	"snow globe",
	"drumstick",
	"pillow",
	"backpack",
	"sunglasses",
	"watermelon",
	"umbrella",
	"trophy",
	"map",
	"compass",
	"helmet",
	"kettle",
	"muffin",
	"gingerbread",
	"marble",
	"dice",
	"chessboard",
	"blanket",
	"slipper",
	"soap bubble",
	"rubber boot",
	"wooden crate",
	"paintbrush",
	"bucket",
	"shovel",
	"rake",
	"hoe",
	"apple pie",
	"jam jar",
	"pepper shaker",
	"cookie tin",
	"wind chime",
	"ladder",
	"rope",
	"saddle",
	"wagon wheel",
	"banana peel",
	"turntable",
	"harmonica",
	"bell pepper",
	"zucchini",
	"soup pot",
	"dandelion",
	"fern",
	"mushroom",
	"moss rock",
	"tree stump",
	"sunflower",
	"watering hose",
	"garden hose",
	"mailbox",
	"newspaper",
] as const;

export const adjectives = [
	"wobbly",
	"sparkly",
	"grumpy",
	"dramatic",
	"suspicious",
	"overcaffeinated",
	"sleepy",
	"heroic",
	"confused",
	"glorious",
	"dusty",
	"muddy",
	"shiny",
	"crooked",
	"tiny",
	"gigantic",
	"squeaky",
	"crunchy",
	"soggy",
	"crispy",
	"nervous",
	"charming",
	"whimsical",
	"noisy",
	"silent",
	"bouncy",
	"stubborn",
	"legendary",
	"awkward",
	"fancy",
	"smol",
	"goofy",
	"chaotic",
	"tidy",
	"untidy",
	"spicy",
	"salty",
	"sweet",
	"buttery",
	"ancient",
	"brand-new",
	"fluffy",
	"itchy",
	"jolly",
	"moody",
	"speedy",
	"slow-motion",
	"mysterious",
	"yodeling",
	"rubbery",
	"pointy",
	"spherical",
	"rectangular",
	"zigzag",
	"striped",
	"polka-dot",
	"moonlit",
	"sunburned",
	"frosty",
	"toasty",
	"electric",
	"magnetic",
	"sassy",
	"dramatically average",
	"overqualified",
	"underprepared",
	"magnificent",
	"ridiculous",
	"unbothered",
	"panicked",
	"cheerful",
	"melodramatic",
	"stealthy",
	"loud",
	"boisterous",
	"velvety",
	"wooden",
	"metallic",
	"papery",
	"glittery",
	"foggy",
	"windy",
	"rainy",
	"sunny",
	"stormy",
	"chilly",
	"lukewarm",
	"lukewarm-but-trying",
	"ornery",
	"fragrant",
	"stinky",
	"vintage",
	"futuristic",
	"accidental",
	"intentional-ish",
	"brave",
	"cowardly",
	"talkative",
	"shy",
	"unreasonably optimistic",
	"mildly haunted",
] as const;

export const problemPartA = [
	"My CURRENT_ADJECTIVE CURRENT_NOUN_A got stuck in my CURRENT_NOUN_B",
	"I tripped over a CURRENT_ADJECTIVE CURRENT_NOUN_A near my CURRENT_NOUN_B",
	"I accidentally traded my CURRENT_NOUN_A for a CURRENT_ADJECTIVE CURRENT_NOUN_B",
	"My CURRENT_NOUN_A keeps arguing with my CURRENT_ADJECTIVE CURRENT_NOUN_B",
	"I watered my CURRENT_NOUN_A and now my CURRENT_NOUN_B is offended",
	"My CURRENT_ADJECTIVE CURRENT_NOUN_A vanished behind the CURRENT_NOUN_B",
	"I sneezed and launched my CURRENT_NOUN_A into a CURRENT_ADJECTIVE CURRENT_NOUN_B",
	"I challenged my CURRENT_NOUN_A to a race and lost to a CURRENT_ADJECTIVE CURRENT_NOUN_B",
	"I put jam on my CURRENT_NOUN_A and now the CURRENT_NOUN_B follows me",
	"My CURRENT_NOUN_A is making suspicious noises at my CURRENT_ADJECTIVE CURRENT_NOUN_B",
	"I named my CURRENT_ADJECTIVE CURRENT_NOUN_A and now my CURRENT_NOUN_B is jealous",
	"My CURRENT_NOUN_A refuses to cooperate unless the CURRENT_NOUN_B applauds",
	"I tried to polish my CURRENT_NOUN_A with a CURRENT_ADJECTIVE CURRENT_NOUN_B",
	"My CURRENT_ADJECTIVE CURRENT_NOUN_A is giving motivational speeches to my CURRENT_NOUN_B",
	"I misplaced my CURRENT_NOUN_A under a CURRENT_ADJECTIVE CURRENT_NOUN_B",
] as const;

export const problemPartB = [
	"and the mayor is somehow involved.",
	"and now everyone in town has questions.",
	"and I have no idea what the legal procedure is.",
	"and it keeps happening at sunrise.",
	"and my dignity has left the chat.",
	"and the chickens will not stop clapping.",
	"and I cannot live without my CURRENT_NOUN_B.",
	"and I think it's becoming sentient.",
	"and the weather made it worse.",
	"and the barn cat took notes.",
	"and I am emotionally unprepared.",
	"and the situation is escalating politely.",
	"and my boots are filing a complaint.",
	"and I am requesting heroic assistance.",
	"and this is somehow my third time this week.",
] as const;

export const solutionPartA = [
	"Then I offered a CURRENT_ADJECTIVE CURRENT_NOUN_A to the CURRENT_NOUN_B",
	"So I negotiated with my CURRENT_NOUN_B using a CURRENT_ADJECTIVE CURRENT_NOUN_A",
	"I solved it by balancing a CURRENT_NOUN_A on a CURRENT_ADJECTIVE CURRENT_NOUN_B",
	"I calmed everyone down with a CURRENT_ADJECTIVE CURRENT_NOUN_A",
	"I fixed it by singing to my CURRENT_NOUN_A near the CURRENT_NOUN_B",
	"I invented a new method involving one CURRENT_NOUN_A and two CURRENT_ADJECTIVE CURRENT_NOUN_Bs",
	"I wrote a heartfelt letter to my CURRENT_NOUN_B and gifted a CURRENT_NOUN_A",
	"I distracted the CURRENT_NOUN_B with a CURRENT_ADJECTIVE CURRENT_NOUN_A",
	"I asked my CURRENT_NOUN_A to apologize to the CURRENT_ADJECTIVE CURRENT_NOUN_B",
	"I bribed the universe with a CURRENT_ADJECTIVE CURRENT_NOUN_A",
] as const;

export const solutionPartB = [
	"and somehow it worked perfectly.",
	"and peace returned to the farm.",
	"and now we pretend it was planned.",
	"and the crowd went wild.",
	"and everyone agreed to never mention it again.",
	"and my confidence increased by 2.",
	"and the barn cat approved.",
	"and I won a very tiny trophy.",
	"and now the CURRENT_NOUN_B calls me captain.",
	"and the problem became a tradition.",
] as const;

export const randomFactPartA = [
	"Fun fact: a CURRENT_ADJECTIVE CURRENT_NOUN_A can outstare a CURRENT_NOUN_B",
	"Science says my CURRENT_NOUN_A becomes CURRENT_ADJECTIVE near a CURRENT_NOUN_B",
	"Historical record: the first CURRENT_NOUN_A wore a CURRENT_ADJECTIVE CURRENT_NOUN_B",
	"I read that a CURRENT_ADJECTIVE CURRENT_NOUN_A is excellent for morale",
	"Statistically, every CURRENT_NOUN_A dreams of a CURRENT_ADJECTIVE CURRENT_NOUN_B",
	"Rural lore says a CURRENT_NOUN_B respects a CURRENT_ADJECTIVE CURRENT_NOUN_A",
	"Breaking news: one CURRENT_NOUN_A can influence three CURRENT_ADJECTIVE CURRENT_NOUN_Bs",
	"Field data suggests a CURRENT_ADJECTIVE CURRENT_NOUN_A improves harvest vibes",
	"Experts confirm a CURRENT_NOUN_A is 12% better with a CURRENT_ADJECTIVE CURRENT_NOUN_B nearby",
	"Town trivia: the CURRENT_NOUN_B festival began with one CURRENT_ADJECTIVE CURRENT_NOUN_A",
] as const;

export const randomFactPartB = [
	"nobody can prove me wrong.",
	"the numbers are very convincing.",
	"I double-checked on a napkin chart.",
	"my cousin swears by it.",
	"and that's basically science.",
	"according to highly questionable sources.",
	"which explains several things.",
	"and frankly it tracks.",
	"and yes, I made a diagram.",
	"please cite me in your memoir.",
] as const;

export const complementPartA = [
	"You have a CURRENT_ADJECTIVE talent for handling CURRENT_NOUN_A",
	"Your CURRENT_NOUN_B energy is extremely CURRENT_ADJECTIVE today",
	"You make even a CURRENT_NOUN_A look CURRENT_ADJECTIVE",
	"Your farm style is CURRENT_ADJECTIVE, especially with that CURRENT_NOUN_B",
	"You radiate CURRENT_ADJECTIVE confidence around every CURRENT_NOUN_A",
	"Only you could make a CURRENT_NOUN_B seem so CURRENT_ADJECTIVE",
	"Your strategy with CURRENT_NOUN_A is surprisingly CURRENT_ADJECTIVE",
	"You are the most CURRENT_ADJECTIVE person this side of the CURRENT_NOUN_B",
	"The way you carry a CURRENT_NOUN_A is truly CURRENT_ADJECTIVE",
	"You have CURRENT_ADJECTIVE main-character energy near that CURRENT_NOUN_B",
] as const;

export const complementPartB = [
	"never change.",
	"I am genuinely impressed.",
	"the town notices.",
	"that is rare around here.",
	"you make it look easy.",
	"it should be illegal to be that cool.",
	"the crops can tell.",
	"you have excellent vibes.",
	"I would frame that accomplishment.",
	"you are carrying this season.",
] as const;

export const greetingPartA = [
	"Hello farmer.",
	"Howdy, neighbor.",
	"Morning, legend.",
	"Ah, my favorite farmer!",
	"Well butter my boots, it's you.",
	"Hey there, crop commander.",
	"Greetings, field champion.",
	"Yo, soil superstar.",
	"Good day, dirt whisperer.",
	"Hiya, harvest hero.",
] as const;

export const greetingPartB = [
	"It's nice to see you.",
	"Hope your crops are thriving.",
	"Your vibe is very CURRENT_ADJECTIVE today.",
	"I was just thinking about CURRENT_NOUN_A.",
	"May your CURRENT_NOUN_B behave itself.",
	"Today's a good day for farming nonsense.",
	"The town feels luckier when you're around.",
	"Don't let the chickens unionize.",
	"Try not to trip over any CURRENT_NOUN_A.",
	"Let's make this day weird in a good way.",
] as const;

export const OverfedAnimal_A = [
	"I appreciate the offer, but ",
	"My CURRENT_ADJECTIVE CURRENT_ANIMAL tummy says thank you, but ",
	"I already inhaled a heroic amount of CURRENT_NOUN_A, but ",
	"The barn nutrition committee approved one snack only, but ",
	"I ate so much my CURRENT_NOUN_A filed a complaint, but ",
	"My personal trainer is a CURRENT_ADJECTIVE goose, but ",
	"I am currently at maximum munch capacity, but ",
	"I promised my CURRENT_NOUN_B I would pace myself, but ",
	"I've reached my daily snack limit and my lawyer agrees, but ",
	"My digestion is doing a CURRENT_ADJECTIVE backflip right now, but ",
	"I'm one bite away from becoming a decorative balloon, but ",
	"I already had breakfast, second breakfast, and emotional breakfast, but ",
] as const;

export const OverfedAnimal_B = [
	"I'm trying to watch my figure.",
	"my hooves need a cooldown period.",
	"I need room for tomorrow's dramatic entrance.",
	"my stylist said no more crumbs today.",
	"the chickens are already judging me.",
	"I can still taste yesterday's mystery casserole.",
	"my stomach just raised a tiny white flag.",
	"I'm saving appetite for a CURRENT_ADJECTIVE feast later.",
	"I promised to be at least 3% graceful today.",
	"if I eat more, I'll start orbiting the barn.",
	"I'd like to keep my CURRENT_NOUN_A where it is.",
	"my brand is now 'light snacking and heavy confidence'.",
] as const;

const replacePlaceholders = (
	template: string,
	assignment: NpcDailyAssignment,
) =>
	template
		.replace(/CURRENT_NOUN_A/g, assignment.currentNounA)
		.replace(/CURRENT_NOUN_B/g, assignment.currentNounB)
		.replace(/CURRENT_ADJECTIVE/g, assignment.currentAdjective);

const randomDialogType = (): NpcDialogType =>
	pick(["Problem", "RandomFact", "Complement"]);

export const generateDailyAssignment = (): NpcDailyAssignment => ({
	currentNounA: pick([...nouns]),
	currentNounB: pick([...nouns]),
	currentAdjective: pick([...adjectives]),
});

export const generateDailyAssignmentsForNpcs = (
	keys: string[],
): Record<string, NpcDailyAssignment> =>
	Object.fromEntries(keys.map((k) => [k, generateDailyAssignment()]));

export const generateNpcDialogLine = (
	assignment: NpcDailyAssignment,
	type: NpcDialogType = randomDialogType(),
): string => {
	if (type === "Problem") {
		const pA = replacePlaceholders(pick([...problemPartA]), assignment);
		const pB = replacePlaceholders(pick([...problemPartB]), assignment);
		const sA = replacePlaceholders(pick([...solutionPartA]), assignment);
		const sB = replacePlaceholders(pick([...solutionPartB]), assignment);
		return `${pA}, ${pB} ${sA}, ${sB}`;
	}
	if (type === "RandomFact") {
		const a = replacePlaceholders(pick([...randomFactPartA]), assignment);
		const b = replacePlaceholders(pick([...randomFactPartB]), assignment);
		return `${a}, ${b}`;
	}
	const a = replacePlaceholders(pick([...complementPartA]), assignment);
	const b = replacePlaceholders(pick([...complementPartB]), assignment);
	return `${a}, ${b}`;
};

export const generateNpcGreetingLine = (
	assignment: NpcDailyAssignment,
): string => {
	const a = replacePlaceholders(pick([...greetingPartA]), assignment);
	const b = replacePlaceholders(pick([...greetingPartB]), assignment);
	return `${a} ${b}`;
};

export const generateOverfedAnimalLine = (animalName: string): string => {
	const assignment: NpcDailyAssignment = {
		currentNounA: pick([...nouns]),
		currentNounB: pick([...nouns]),
		currentAdjective: pick([...adjectives]),
	};
	const a = replacePlaceholders(pick([...OverfedAnimal_A]), assignment).replace(
		/CURRENT_ANIMAL/g,
		animalName,
	);
	const b = replacePlaceholders(pick([...OverfedAnimal_B]), assignment).replace(
		/CURRENT_ANIMAL/g,
		animalName,
	);
	return `${a}${b}`;
};
