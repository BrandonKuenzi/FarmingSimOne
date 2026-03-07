export type FriendshipLevel = 0 | 1 | 2 | 3 | 4 | 5;
export const FRIENDSHIP_HEART_THRESHOLDS = [2, 5, 9, 14, 20] as const;

export type NPCInterest =
	| "finger_painting"
	| "watching_paint_dry"
	| "selling_used_crayons_online"
	| "sorting_pebbles_by_personality"
	| "extreme_coupon_clipping"
	| "milk_temperature_research"
	| "dramatic_bird_watching"
	| "soap_carving"
	| "seed_polishing"
	| "whispering_to_fish";

export interface InterestDialogSet {
	level1: string[];
	level2: string[];
	level3: string[];
	level4: string[];
	level5: string[];
}

export interface GeneratedNPCDialogData {
	allLevelZero: string[];
	interests: Record<NPCInterest, InterestDialogSet>;
}

export const possibleNPCInterests: NPCInterest[] = [
	"finger_painting",
	"watching_paint_dry",
	"selling_used_crayons_online",
	"sorting_pebbles_by_personality",
	"extreme_coupon_clipping",
	"milk_temperature_research",
	"dramatic_bird_watching",
	"soap_carving",
	"seed_polishing",
	"whispering_to_fish",
];
export const NPCInterestTitles: Record<NPCInterest, string[]> = {
	finger_painting: [
		"",
		"Talks about hands.",
		"Finger Painting Hobbyist",
		"Finger Painting Enthusiast",
		"Obsessed With Painting Their Fingers",
		"Finger Paint Taste Tester",
	],

	watching_paint_dry: [
		"",
		"Lives life slowly",
		"Paint Drying Fan",
		"Watcher of the Second Coat",
		"Devotee of the Matte Finish",
		"Embodiment of Dry Paint ",
	],

	selling_used_crayons_online: [
		"",
		"Collector of... things?",
		"Online Crayon Merchant",
		"Curator of Previously Loved Crayons",
		"Regional Crayon Economy Specialist",
		"Used Crayon Inside Trading Offender",
	],

	sorting_pebbles_by_personality: [
		"",
		"Pebble Sorter",
		"Student of Pebble Personalities",
		"Pebble Personality Analyst",
		"Pebble Therapist",
		"Thinks Pebbles are People",
	],

	extreme_coupon_clipping: [
		"",
		"Frugal Shopper",
		"Deal Hunter",
		"Coupon Strategy Specialist",
		"Coupon Warrior",
		"Imaginary Coupon Disorder Patient",
	],

	milk_temperature_research: [
		"",
		"Calm and calculated individual.",
		"Milk Temperature Enthusiast",
		"Dairy Thermal Analyst",
		"Scholar of the Perfect Warm Milk",
		"Not an actual scientist",
	],

	dramatic_bird_watching: [
		"",
		"They like birds",
		"Bird Watching Fan",
		"Dramatic Bird Watching Commentator",
		"Director of Bird Drama",
		"Sees birds that arn't there",
	],

	soap_carving: [
		"",
		"Personal Hygiene Conscience.",
		"Soap Carving Hobbyist",
		"Soap Sculptor",
		"Soap Artisan",
		"Eats Soap for Breakfast",
	],

	seed_polishing: [
		"",
		"Green thumb.",
		"Seed Polishing Hobbyist",
		"Seed Shine Enthusiast",
		"Master of Polished Seeds",
		"Guardian of the Gleaming Seeds",
	],

	whispering_to_fish: [
		"",
		"Likes the calm.",
		"Soft Speaker to Fish",
		"Pond Communication Specialist",
		"Trusted Voice of the Fish",
		"Literally Whispers to Fish",
	],
};

export const NPCGiftLetterLines: Record<NPCInterest, string[]> = {
	finger_painting: [
		"I was finger painting earlier and accidentally flicked some paint onto this. It felt rude to throw it away after finger painting worked so hard on it. See attached.",
		"I finger painted something small today and thought you might appreciate the artistic courage involved. Enjoy the results of finger painting!",
		"While finger painting this morning I realized the town needs more encouragement. Please accept this gift and one extremely enthusiastic finger painted thumbs-up.",
	],

	watching_paint_dry: [
		"I was watching paint dry for a while and had plenty of time to think about generosity. I set this aside for you. See attached.",
		"During some very serious watching paint dry, I decided you deserved this.",
		"I finished a long session of watching paint dry and felt deeply moved by the second coat. That inspiration led to this gift for you.",
	],

	selling_used_crayons_online: [
		"I was sorting used crayons and found this item that did not quite fit the market. I thought you might want it.",
		"I just got a huge order of used crayons, but now I need to make some room for my expanding inventory. Do you want this?",
		"A happy customer of mine was so happy to get pink crayons sent to their house that they sent me this as a gift. I don't want it, do you?",
	],

	sorting_pebbles_by_personality: [
		"While looking at pebbles by the beach I found this item. One of my pebbles suggested you should have it. Enjoy!",
		"One of my pebbles insisted I give you this. I really wanted to keep it, but in the end it won the argument. I hope you enjoy it.",
		"I picked this up thinking it was a pebble. When I got home I realized, it wasn't. Do you want it?",
	],

	extreme_coupon_clipping: [
		"I had a coupon for buy one get one free. I only needed one though. Ive enclosed the extra for you. ",
		"I thought I had a good coupon for this item but it actually was expired. I bought it anyways but now cant stand to look at it. Will you take it off my hands please?",
		"I had a coupon for buy 7 get 3 free! But they gave me 11 instead. Do you want the extra one? See attached.",
	],

	milk_temperature_research: [
		"While conducting milk temperature research I realized this item was making the temperature in my lab fluctuate. Since I cant keep it I thought you might like it.",
		"I spilt milk on this item. I was going to throw it away cause it's starting to smell. But I thought I'd send it to you cause you might want it anyway.",
		"I was wondering if my own generosity has an effect on my milk temperature experiements. So as a test, I thought I would be generous. Enjoy.",
	],

	dramatic_bird_watching: [
		"I was watching a crow fly overhead, when all the sudden it dropped this at my feet! I have no use for it though. Do you want it?",
		"I paused dramatic bird watching when a gull performed an extremely convincing monologue. The gull wanted you to have this.",
		"After a long afternoon of dramatic bird watching I felt the sky itself wanted you to have this. Please accept this.",
	],

	soap_carving: [
		"I was soap carving earlier and realized 'This aint soap!!' Do you want it?",
		"Soap carving can make a person thoughtful, especially when tiny soap swans are involved. During soap carving I decided you might enjoy this.",
		"I finished a long soap carving session and the fragrance of accomplishment convinced me to send you this.",
	],

	seed_polishing: [
		"While seed polishing today I noticed this item was cluttering up my workspace. So you can have it.",
		"I paused seed polishing to package this gift carefully. I hope you enjoy it!",
		"Seed polishing teaches patience, and patient thoughts often turn generous. Please accept this.",
	],

	whispering_to_fish: [
		"While whispering to fish this morning the fish seemed to approve of sending you this gift. Whispering to fish rarely gives bad advice.",
		"I finished whispering to fish and the pond felt unusually encouraging. Whispering to fish said you should have this.",
		"I whispered to a fish. It whispered your name back and handed me this. I am just a messenger of the fish sending you this parcel.",
	],
};

export const generatedNPCDialog: GeneratedNPCDialogData = {
	allLevelZero: [
		"Um... how are you liking the farm?",
		"Hmmm... I've got, uh, things I gotta do.",
		"Some weather we're having, huh? {They don't make eye contact.}",
		"The crops sure are... crop-shaped today.",
		"I was just about to go stand somewhere else, actually.",
		"Well. Here we both are.",
		"The breeze is doing something interesting. Probably.",
		"Anyway... nice talking to you at this safe conversational distance.",
		"I don't really have any news. That's how I like it.",
		"The dirt seems stable today. Reassuring.",
		"I should probably get back to looking busy.",
		"Yep. That's a barn, all right.",
	],

	interests: {
		finger_painting: {
			level1: [
				"Some feelings are too large for brushes.",
				"My hands have been unusually busy with color lately.",
			],
			level2: [
				"I do a little finger painting now and then.",
				"Finger painting is one of those small things that keeps me occupied.",
				"I guess I can admit I like finger painting a fair bit.",
				"Finger painting is just a quiet little interest of mine.",
			],
			level3: [
				"I should be honest with you: finger painting matters more to me than I first let on.",
				"I made finger painting sound casual before, but finger painting actually means a lot to me.",
				"You've been kind, so I can admit finger painting is not just a passing interest for me.",
				"Finger painting has become part of how I think, which feels strange to say out loud.",
				"I downplayed finger painting because finger painting sounds sillier out loud than it feels in my heart.",
				"When I say finger painting is important to me, I mean finger painting genuinely steadies me.",
				"Finger painting started small, but finger painting became something personal somewhere along the way.",
				"I trust you enough to tell you that finger painting is tied up with who I am now.",
			],
			level4: [
				"I noticed I care more because I know I can tell you about it later. I accidentally stayed up too late finger painting the moon again. Finger painting needs firmer boundaries.",
				"Finger painting was only supposed to take ten minutes, and then finger painting stole the whole evening. You have become my favorite person to compare notes with on this.",
				"Sometimes finger painting feels less like a hobby and more like a colorful emergency. It means a lot that you keep listening and asking thoughtful questions.",
				"I know finger painting sounds harmless, but finger painting can become very powerful after midnight. I feel like we have built a nice rhythm around these talks.",
				"Finger painting has made me look at clouds like unpaid canvases. I trust you with the weird details, and that says a lot.",
				"I value your opinion on this more than you probably realize. I caught myself ranking my fingers by finger painting performance, which feels healthy enough for now.",
				"A little finger painting before breakfast became a lot of finger painting before breakfast. I kept thinking about our last chat while I was working on it.",
				"Finger painting has improved my mood, ruined my sleeves, and expanded my spiritual range. It helps that I can talk to you about this without feeling weird.",
				"I wrote a short poem about finger painting: 'O radiant smear, O joyful stain, finger painting calls my heart again.' You always give me a grounded perspective, and I appreciate that.",
				"Another finger painting poem came to me in the night: 'Where brushes fail and colors sing, finger painting crowns the trembling king.' I trust your read on things, so I wanted to tell you first.",
				"Talking with you has made this whole thing more fun lately. Finger painting has reached the point where I schedule my chores around good finger painting light.",
				"I meant to clean my table, but finger painting made a stronger argument. I like that we can be honest about this kind of stuff.",
				"There are moments when finger painting feels like the highest possible use of a hand. When we talk, I come away feeling clearer about everything.",
				"Finger painting keeps teaching me that restraint is important, and finger painting keeps teaching me that I do not have any. You are one of the few people I can say this to and mean it.",
				"The more finger painting I do, the more finger painting starts to feel like a calling with smudges. I genuinely look forward to these little check-ins with you.",
				"I thought about what you said last time, and it stuck with me. Sometimes I whisper encouraging things to my fingers before finger painting, just to keep morale high.",
			],
			level5: [
				"I saved this finger painting update for you first, because your face is my quality check.",
				"Yesterday I skipped lunch to keep finger painting, then waited by the road in case you walked by.",
				"My finger painting table has your name on a sticky note so I remember who this is all for.",
				"If you say one nice thing about finger painting, I will smile for three full farm days.",
				"I brought two finger painting pieces today, because I panic if I cannot show you both.",
				"My hands are stained from finger painting again. I left them stained so you can verify I worked hard.",
				"I canceled chores to finish finger painting. Do not tell the chickens, they think I betrayed them.",
				"I tried a normal hobby, lasted five minutes, then ran back to finger painting and to you.",
				"When finger painting goes well, I hear your voice in my head saying keep going.",
				"I taped your last compliment above my finger painting bucket like a sacred rule.",
				"No one else asks about finger painting details. You ask, so you are now management.",
				"I made a tiny finger painting map of town with a star where you usually stand.",
				"I keep finger painting even when tired, because tomorrow you might ask what I made.",
				"My finger painting mood swings are simple: no you, sad; yes you, champion energy.",
				"If I do not report my finger painting progress to you, my brain starts buffering.",
				"You are my favorite person and finger painting is my favorite chaos, so this is a perfect system.",
			],
		},

		watching_paint_dry: {
			level1: [
				"I've been appreciating a few extremely slow developments lately.",
				"Some people rush through life. I prefer to notice when a wall is really committing to a finish.",
			],
			level2: [
				"I've gotten into watching paint dry. I know that sounds made up, but watching paint dry is genuinely calming.",
				"Watching paint dry has become a little part of my day, usually after chores when I want my brain to stop rattling.",
				"I do enjoy watching paint dry, especially when the second coat starts looking confident.",
				"Watching paint dry is probably the most peaceful thing I do on purpose.",
			],
			level3: [
				"I should be honest with you: watching paint dry matters more to me than I first admitted.",
				"I made watching paint dry sound like a tiny quirk, but watching paint dry is one of the few things that settles me clear down.",
				"You've been easy to talk to, so I can admit watching paint dry feels strangely personal to me.",
				"I used to joke about watching paint dry, but watching paint dry has gotten me through a few rough evenings.",
				"I hid how much watching paint dry helps because saying 'watching paint dry helps me emotionally' feels risky out loud.",
				"Watching paint dry started as a joke, but watching paint dry became a ritual before I fully noticed.",
				"I downplayed watching paint dry because I did not want to defend watching paint dry with my whole chest.",
				"Thank you for not laughing, because watching paint dry has become part of how I keep myself steady.",
			],
			level4: [
				"I stayed up too late watching paint dry because the second coat was entering its serious phase. I am glad we have this ongoing conversation about it.",
				"I noticed I care more because I know I can tell you about it later. My weekend plans are mostly watching paint dry, taking notes, and nodding at the wall like we understand each other.",
				"I told myself to stop watching paint dry at a sensible hour, but the matte finish was just beginning to reveal its character. You have become my favorite person to compare notes with on this.",
				"There is poetry in watching paint dry. The roller marks are like the handwriting of patience. It means a lot that you keep listening and asking thoughtful questions.",
				"I've started scheduling chores around watching paint dry, which is not ideal but is extremely honest. I feel like we have built a nice rhythm around these talks.",
				"Watching paint dry has made me develop opinions about sheen, and every one of those opinions feels correct. I trust you with the weird details, and that says a lot.",
				"I value your opinion on this more than you probably realize. I brought a chair to the shed just to improve my watching paint dry posture.",
				"People hear 'watching paint dry' and laugh, but those people have never seen a brave second coat pull itself together. I kept thinking about our last chat while I was working on it.",
				"Sometimes watching paint dry feels less like a pastime and more like attending a very quiet royal event. It helps that I can talk to you about this without feeling weird.",
				"I keep a little notebook for watching paint dry so I can record notable moments in the life of a wall. You always give me a grounded perspective, and I appreciate that.",
				"I wrote a small poem during watching paint dry: 'O noble coat, go firm, go bright, become your truest self tonight.' I trust your read on things, so I wanted to tell you first.",
				"Talking with you has made this whole thing more fun lately. Watching paint dry has reached the point where I can tell when a wall is having a good evening.",
				"I meant to have one normal glance at the fence, and then watching paint dry consumed the next forty minutes. I like that we can be honest about this kind of stuff.",
				"The dangerous thing about watching paint dry is how quickly admiration turns into reverence. When we talk, I come away feeling clearer about everything.",
				"I have favorite stages of watching paint dry now, which feels like growth and also a warning sign. You are one of the few people I can say this to and mean it.",
				"When watching paint dry really gets going, even the window trim starts to look like destiny with edges. I genuinely look forward to these little check-ins with you.",
			],
			level5: [
				"I timed watching paint dry for two hours, then wrote your initials in the notebook header.",
				"You are the only person I trust with watching paint dry updates at this level of detail.",
				"I found a perfect wall for watching paint dry and immediately wished you were there to witness it.",
				"My day feels wrong if I do watching paint dry and cannot tell you how smooth the finish looked.",
				"I brought a folding chair to town because watching paint dry can happen anytime and I must be ready.",
				"I rank each coat during watching paint dry, but your opinion is still the final score.",
				"I tried to stop watching paint dry early, then remembered you might ask and I stayed.",
				"The shed wall hit peak beauty during watching paint dry and I almost sent a town alert for you.",
				"People laugh at watching paint dry, but they do not know you approved my methods.",
				"My biggest dream is doing watching paint dry while you nod and say yep that coat is clean.",
				"I carry snack crumbs in my pocket so watching paint dry with you can last longer.",
				"When watching paint dry gets dramatic, I pretend you are my co-captain and calm down.",
				"I made a tiny chart from watching paint dry sessions and your name is in every good row.",
				"If you ever miss a day, I still do watching paint dry, but I sigh a lot between coats.",
				"I set an extra chair next to my wall because watching paint dry is better when my favorite person appears.",
				"You matter so much to me that even watching paint dry feels like a team sport now.",
			],
		},

		selling_used_crayons_online: {
			level1: [
				"I keep noticing value in things other people toss aside.",
				"Tiny leftovers can become important if you present them right.",
			],
			level2: [
				"I started selling used crayons online, and it is more relaxing than people think.",
				"I do selling used crayons online after chores to clear my head.",
				"Yes, selling used crayons online is a real part of my routine now.",
				"I keep telling myself selling used crayons online is normal small-town behavior.",
			],
			level3: [
				"I downplayed selling used crayons online before, but selling used crayons online actually matters to me.",
				"I called selling used crayons online a tiny side thing, but selling used crayons online is not tiny to me.",
				"You are easy to talk to, so I can admit selling used crayons online is personal for me.",
				"I used to joke about selling used crayons online, but selling used crayons online keeps me steady on hard days.",
				"I thought people would laugh at selling used crayons online, so I hid how much selling used crayons online helps me.",
				"I pretended selling used crayons online was casual, yet selling used crayons online is the part of my day I protect most.",
				"I am done minimizing selling used crayons online; selling used crayons online is important to who I am.",
				"Thank you for listening, because selling used crayons online is more serious in my heart than I ever said.",
			],
			level4: [
				"I stayed up too late doing selling used crayons online because the mauve nub needed one more pass. I trust you with the weird details, and that says a lot.",
				"I value your opinion on this more than you probably realize. My weekend plan is simple: selling used crayons online, tea, and notes about the sunset orange.",
				"I told myself to stop selling used crayons online, then the listing title looked at me and I continued selling used crayons online. I kept thinking about our last chat while I was working on it.",
				"There is poetry in selling used crayons online; the shipping envelope practically writes the next verse for me. It helps that I can talk to you about this without feeling weird.",
				"I reorganized my schedule so selling used crayons online gets prime evening hours, especially for the mauve nub. You always give me a grounded perspective, and I appreciate that.",
				"If joy had a sound, it would be selling used crayons online and the little triumph of the sunset orange. I trust your read on things, so I wanted to tell you first.",
				"Talking with you has made this whole thing more fun lately. I brought a chair outside just to keep selling used crayons online going until the listing title felt right.",
				"People call it a phase, but selling used crayons online plus a perfect shipping envelope feels like destiny. I like that we can be honest about this kind of stuff.",
				"I stayed up too late doing selling used crayons online because the mauve nub needed one more pass. When we talk, I come away feeling clearer about everything.",
				"My weekend plan is simple: selling used crayons online, tea, and notes about the sunset orange. You are one of the few people I can say this to and mean it.",
				"I told myself to stop selling used crayons online, then the listing title looked at me and I continued selling used crayons online. I genuinely look forward to these little check-ins with you.",
				"I thought about what you said last time, and it stuck with me. There is poetry in selling used crayons online; the shipping envelope practically writes the next verse for me.",
				"I reorganized my schedule so selling used crayons online gets prime evening hours, especially for the mauve nub. I appreciate that you take me seriously when I ramble about it.",
				"If joy had a sound, it would be selling used crayons online and the little triumph of the sunset orange. You make this feel less like a quirk and more like a real craft.",
				"I brought a chair outside just to keep selling used crayons online going until the listing title felt right. It is easier to keep going when I know you get where I am coming from.",
				"People call it a phase, but selling used crayons online plus a perfect shipping envelope feels like destiny. I am glad we have this ongoing conversation about it.",
			],
			level5: [
				"I listed three packs while selling used crayons online and named one bundle after your vibe.",
				"Your support turned selling used crayons online from side quest into main mission.",
				"I refresh the page during selling used crayons online and hope your luck is on my side.",
				"When a buyer sends a nice message about selling used crayons online, I want to tell you before anyone else.",
				"I sorted colors for selling used crayons online by what shades remind me of our chats.",
				"My shipping station for selling used crayons online has a sign that says make your favorite person proud.",
				"I almost missed bedtime doing selling used crayons online because one listing title needed your spirit.",
				"Nobody in town gets selling used crayons online like you do, so yes I am attached to this arrangement.",
				"I keep one lucky crayon stub for selling used crayons online and it only comes out on days I see you.",
				"If you hype me up once, I can power through ten boring tasks in selling used crayons online.",
				"I made a tiny stamp for selling used crayons online that means approved by my favorite farmer.",
				"My brain treats selling used crayons online like a festival when you ask how sales are going.",
				"I practice package photos for selling used crayons online until they look worthy of your thumbs up.",
				"Some people want fame; I want selling used crayons online numbers and your proud face.",
				"I built a secret score in selling used crayons online called would my favorite person laugh at this listing.",
				"You are big in my heart and selling used crayons online is big in my life, so now everything is big.",
			],
		},

		sorting_pebbles_by_personality: {
			level1: [
				"Some small objects radiate very specific moods.",
				"I can tell who is dramatic just by looking at their desk gravel.",
			],
			level2: [
				"I started sorting pebbles by personality, and it is more relaxing than people think.",
				"I do sorting pebbles by personality after chores to clear my head.",
				"Yes, sorting pebbles by personality is a real part of my routine now.",
				"I keep telling myself sorting pebbles by personality is normal small-town behavior.",
			],
			level3: [
				"I downplayed sorting pebbles by personality before, but sorting pebbles by personality actually matters to me.",
				"I called sorting pebbles by personality a tiny side thing, but sorting pebbles by personality is not tiny to me.",
				"You are easy to talk to, so I can admit sorting pebbles by personality is personal for me.",
				"I used to joke about sorting pebbles by personality, but sorting pebbles by personality keeps me steady on hard days.",
				"I thought people would laugh at sorting pebbles by personality, so I hid how much sorting pebbles by personality helps me.",
				"I pretended sorting pebbles by personality was casual, yet sorting pebbles by personality is the part of my day I protect most.",
				"I am done minimizing sorting pebbles by personality; sorting pebbles by personality is important to who I am.",
				"Thank you for listening, because sorting pebbles by personality is more serious in my heart than I ever said.",
			],
			level4: [
				"I stayed up too late doing sorting pebbles by personality because the brooding pebble needed one more pass. I feel like we have built a nice rhythm around these talks.",
				"My weekend plan is simple: sorting pebbles by personality, tea, and notes about the optimist stone. I trust you with the weird details, and that says a lot.",
				"I value your opinion on this more than you probably realize. I told myself to stop sorting pebbles by personality, then the gossipy gravel looked at me and I continued sorting pebbles by personality.",
				"There is poetry in sorting pebbles by personality; the stern little rock practically writes the next verse for me. I kept thinking about our last chat while I was working on it.",
				"I reorganized my schedule so sorting pebbles by personality gets prime evening hours, especially for the brooding pebble. It helps that I can talk to you about this without feeling weird.",
				"If joy had a sound, it would be sorting pebbles by personality and the little triumph of the optimist stone. You always give me a grounded perspective, and I appreciate that.",
				"I brought a chair outside just to keep sorting pebbles by personality going until the gossipy gravel felt right. I trust your read on things, so I wanted to tell you first.",
				"Talking with you has made this whole thing more fun lately. People call it a phase, but sorting pebbles by personality plus a perfect stern little rock feels like destiny.",
				"I stayed up too late doing sorting pebbles by personality because the brooding pebble needed one more pass. I like that we can be honest about this kind of stuff.",
				"My weekend plan is simple: sorting pebbles by personality, tea, and notes about the optimist stone. When we talk, I come away feeling clearer about everything.",
				"I told myself to stop sorting pebbles by personality, then the gossipy gravel looked at me and I continued sorting pebbles by personality. You are one of the few people I can say this to and mean it.",
				"There is poetry in sorting pebbles by personality; the stern little rock practically writes the next verse for me. I genuinely look forward to these little check-ins with you.",
				"I thought about what you said last time, and it stuck with me. I reorganized my schedule so sorting pebbles by personality gets prime evening hours, especially for the brooding pebble.",
				"If joy had a sound, it would be sorting pebbles by personality and the little triumph of the optimist stone. I appreciate that you take me seriously when I ramble about it.",
				"I brought a chair outside just to keep sorting pebbles by personality going until the gossipy gravel felt right. You make this feel less like a quirk and more like a real craft.",
				"People call it a phase, but sorting pebbles by personality plus a perfect stern little rock feels like destiny. It is easier to keep going when I know you get where I am coming from.",
			],
			level5: [
				"I moved six stones during sorting pebbles by personality because they were acting rude today.",
				"During sorting pebbles by personality I gave one pebble your job title, chief good influence.",
				"I cannot finish sorting pebbles by personality until I imagine what you would call the grumpy one.",
				"My best jar from sorting pebbles by personality is reserved for pebbles that feel like our friendship.",
				"I skip gossip now and do sorting pebbles by personality instead, then report to you like a field agent.",
				"Every strong day starts with sorting pebbles by personality and one thought of you saying nice work.",
				"I made tiny name cards for sorting pebbles by personality, and yes one card just says your fan club.",
				"When sorting pebbles by personality gets stressful, I ask what would my favorite person do and continue.",
				"I planned my walking route around places with better rocks for sorting pebbles by personality so I can impress you.",
				"The shy pebble opened up during sorting pebbles by personality right after I mentioned you.",
				"I keep a pocket pebble from sorting pebbles by personality for luck when I hope to see you.",
				"If I do not tell you my sorting pebbles by personality results, the pebbles feel offended and so do I.",
				"My dream weekend is sorting pebbles by personality with snacks while you judge the finalists.",
				"I talk less to people and more to stones during sorting pebbles by personality, but I always talk to you.",
				"Today a pebble got promoted in sorting pebbles by personality, and you are the only one who understands why.",
				"You are very important to me and sorting pebbles by personality is very important to me, case closed.",
			],
		},

		extreme_coupon_clipping: {
			level1: [
				"Paper can hide victories if you know where to cut.",
				"I slept fine, except for one whispering stack of circulars.",
			],
			level2: [
				"I started extreme coupon clipping, and it is more relaxing than people think.",
				"I do extreme coupon clipping after chores to clear my head.",
				"Yes, extreme coupon clipping is a real part of my routine now.",
				"I keep telling myself extreme coupon clipping is normal small-town behavior.",
			],
			level3: [
				"I downplayed extreme coupon clipping before, but extreme coupon clipping actually matters to me.",
				"I called extreme coupon clipping a tiny side thing, but extreme coupon clipping is not tiny to me.",
				"You are easy to talk to, so I can admit extreme coupon clipping is personal for me.",
				"I used to joke about extreme coupon clipping, but extreme coupon clipping keeps me steady on hard days.",
				"I thought people would laugh at extreme coupon clipping, so I hid how much extreme coupon clipping helps me.",
				"I pretended extreme coupon clipping was casual, yet extreme coupon clipping is the part of my day I protect most.",
				"I am done minimizing extreme coupon clipping; extreme coupon clipping is important to who I am.",
				"Thank you for listening, because extreme coupon clipping is more serious in my heart than I ever said.",
			],
			level4: [
				"I stayed up too late doing extreme coupon clipping because the double-stack deal needed one more pass. When we talk, I come away feeling clearer about everything.",
				"My weekend plan is simple: extreme coupon clipping, tea, and notes about the binder tab. You are one of the few people I can say this to and mean it.",
				"I told myself to stop extreme coupon clipping, then the expired onion flyer looked at me and I continued extreme coupon clipping. I genuinely look forward to these little check-ins with you.",
				"I thought about what you said last time, and it stuck with me. There is poetry in extreme coupon clipping; the checkout lane practically writes the next verse for me.",
				"I reorganized my schedule so extreme coupon clipping gets prime evening hours, especially for the double-stack deal. I appreciate that you take me seriously when I ramble about it.",
				"If joy had a sound, it would be extreme coupon clipping and the little triumph of the binder tab. You make this feel less like a quirk and more like a real craft.",
				"I brought a chair outside just to keep extreme coupon clipping going until the expired onion flyer felt right. It is easier to keep going when I know you get where I am coming from.",
				"People call it a phase, but extreme coupon clipping plus a perfect checkout lane feels like destiny. I am glad we have this ongoing conversation about it.",
				"I noticed I care more because I know I can tell you about it later. I stayed up too late doing extreme coupon clipping because the double-stack deal needed one more pass.",
				"My weekend plan is simple: extreme coupon clipping, tea, and notes about the binder tab. You have become my favorite person to compare notes with on this.",
				"I told myself to stop extreme coupon clipping, then the expired onion flyer looked at me and I continued extreme coupon clipping. It means a lot that you keep listening and asking thoughtful questions.",
				"There is poetry in extreme coupon clipping; the checkout lane practically writes the next verse for me. I feel like we have built a nice rhythm around these talks.",
				"I reorganized my schedule so extreme coupon clipping gets prime evening hours, especially for the double-stack deal. I trust you with the weird details, and that says a lot.",
				"I value your opinion on this more than you probably realize. If joy had a sound, it would be extreme coupon clipping and the little triumph of the binder tab.",
				"I brought a chair outside just to keep extreme coupon clipping going until the expired onion flyer felt right. I kept thinking about our last chat while I was working on it.",
				"People call it a phase, but extreme coupon clipping plus a perfect checkout lane feels like destiny. It helps that I can talk to you about this without feeling weird.",
			],
			level5: [
				"I did extreme coupon clipping at sunrise and thought wow I need to tell you this win.",
				"Your name is on my extreme coupon clipping binder tab labeled hero support.",
				"I treat extreme coupon clipping like a sport, and you are my entire cheering section.",
				"I found a wild discount during extreme coupon clipping and almost sprinted to town to report it.",
				"My scissors for extreme coupon clipping have a tiny sticker that says approved by favorite person.",
				"I missed a nap because extreme coupon clipping was hot and your future reaction mattered.",
				"When extreme coupon clipping gets intense, I remember you believe in me and I keep cutting.",
				"I made an emergency envelope for extreme coupon clipping wins to show you on hard days.",
				"The best part of extreme coupon clipping is pretending you will give me a victory nod.",
				"I practice calm breathing before extreme coupon clipping so I do not scream at huge savings.",
				"I rank stores for extreme coupon clipping by how proud you might look when I explain the deal.",
				"If you miss one day, extreme coupon clipping still happens, but I save the best story for later.",
				"My dream is a clean checkout from extreme coupon clipping while you whisper legendary move.",
				"I wrote a tiny rule for extreme coupon clipping that says if favorite person asks, tell full story.",
				"No one else wants extreme coupon clipping details, but you do, so we are now a power duo.",
				"You matter to me a lot and extreme coupon clipping matters to me a lot, so this is a loud life.",
			],
		},

		milk_temperature_research: {
			level1: [
				"One degree can be the difference between comfort and regret.",
				"I am very calm about thermometers, probably too calm.",
			],
			level2: [
				"I started milk temperature research, and it is more relaxing than people think.",
				"I do milk temperature research after chores to clear my head.",
				"Yes, milk temperature research is a real part of my routine now.",
				"I keep telling myself milk temperature research is normal small-town behavior.",
			],
			level3: [
				"I downplayed milk temperature research before, but milk temperature research actually matters to me.",
				"I called milk temperature research a tiny side thing, but milk temperature research is not tiny to me.",
				"You are easy to talk to, so I can admit milk temperature research is personal for me.",
				"I used to joke about milk temperature research, but milk temperature research keeps me steady on hard days.",
				"I thought people would laugh at milk temperature research, so I hid how much milk temperature research helps me.",
				"I pretended milk temperature research was casual, yet milk temperature research is the part of my day I protect most.",
				"I am done minimizing milk temperature research; milk temperature research is important to who I am.",
				"Thank you for listening, because milk temperature research is more serious in my heart than I ever said.",
			],
			level4: [
				"Talking with you has made this whole thing more fun lately. I stayed up too late doing milk temperature research because the 48 degrees needed one more pass.",
				"My weekend plan is simple: milk temperature research, tea, and notes about the warming curve. I like that we can be honest about this kind of stuff.",
				"I told myself to stop milk temperature research, then the steam line looked at me and I continued milk temperature research. When we talk, I come away feeling clearer about everything.",
				"There is poetry in milk temperature research; the ceramic mug practically writes the next verse for me. You are one of the few people I can say this to and mean it.",
				"I reorganized my schedule so milk temperature research gets prime evening hours, especially for the 48 degrees. I genuinely look forward to these little check-ins with you.",
				"I thought about what you said last time, and it stuck with me. If joy had a sound, it would be milk temperature research and the little triumph of the warming curve.",
				"I brought a chair outside just to keep milk temperature research going until the steam line felt right. I appreciate that you take me seriously when I ramble about it.",
				"People call it a phase, but milk temperature research plus a perfect ceramic mug feels like destiny. You make this feel less like a quirk and more like a real craft.",
				"I stayed up too late doing milk temperature research because the 48 degrees needed one more pass. It is easier to keep going when I know you get where I am coming from.",
				"My weekend plan is simple: milk temperature research, tea, and notes about the warming curve. I am glad we have this ongoing conversation about it.",
				"I noticed I care more because I know I can tell you about it later. I told myself to stop milk temperature research, then the steam line looked at me and I continued milk temperature research.",
				"There is poetry in milk temperature research; the ceramic mug practically writes the next verse for me. You have become my favorite person to compare notes with on this.",
				"I reorganized my schedule so milk temperature research gets prime evening hours, especially for the 48 degrees. It means a lot that you keep listening and asking thoughtful questions.",
				"If joy had a sound, it would be milk temperature research and the little triumph of the warming curve. I feel like we have built a nice rhythm around these talks.",
				"I brought a chair outside just to keep milk temperature research going until the steam line felt right. I trust you with the weird details, and that says a lot.",
				"I value your opinion on this more than you probably realize. People call it a phase, but milk temperature research plus a perfect ceramic mug feels like destiny.",
			],
			level5: [
				"I logged milk temperature research numbers all morning and circled the one I think you would like.",
				"Your opinion is my final step in milk temperature research, even before I trust my own notes.",
				"I carry a tiny chart for milk temperature research so I can update you the second we talk.",
				"When milk temperature research hits the sweet spot, I feel like texting the sky and then finding you.",
				"I skipped small talk at the store because milk temperature research data was burning in my pocket.",
				"My cup from milk temperature research has a mark called favorite person range.",
				"I do milk temperature research in quiet mode, except when I see you and then I report everything.",
				"A perfect result in milk temperature research means nothing until you hear about it.",
				"I built a tiny alarm for milk temperature research and named it do not disappoint your favorite human.",
				"I told the kettle milk temperature research is serious business because you keep me accountable.",
				"I almost cried at a perfect reading in milk temperature research because I wanted to share it with you.",
				"If you ask one question about milk temperature research, I instantly become ten times more alive.",
				"My notes for milk temperature research are color coded by how likely they are to impress you.",
				"I once reheated dinner because milk temperature research needed one more run before our chat.",
				"People hear milk temperature research and blink; you hear it and lean in, so you are elite.",
				"You are huge in my world and milk temperature research is huge in my brain, that is the truth.",
			],
		},

		dramatic_bird_watching: {
			level1: [
				"Some wings flap like they are making legal arguments.",
				"The sky staged a full performance this morning.",
			],
			level2: [
				"I started dramatic bird watching, and it is more relaxing than people think.",
				"I do dramatic bird watching after chores to clear my head.",
				"Yes, dramatic bird watching is a real part of my routine now.",
				"I keep telling myself dramatic bird watching is normal small-town behavior.",
			],
			level3: [
				"I downplayed dramatic bird watching before, but dramatic bird watching actually matters to me.",
				"I called dramatic bird watching a tiny side thing, but dramatic bird watching is not tiny to me.",
				"You are easy to talk to, so I can admit dramatic bird watching is personal for me.",
				"I used to joke about dramatic bird watching, but dramatic bird watching keeps me steady on hard days.",
				"I thought people would laugh at dramatic bird watching, so I hid how much dramatic bird watching helps me.",
				"I pretended dramatic bird watching was casual, yet dramatic bird watching is the part of my day I protect most.",
				"I am done minimizing dramatic bird watching; dramatic bird watching is important to who I am.",
				"Thank you for listening, because dramatic bird watching is more serious in my heart than I ever said.",
			],
			level4: [
				"I stayed up too late doing dramatic bird watching because the crow monologue needed one more pass. I feel like we have built a nice rhythm around these talks.",
				"My weekend plan is simple: dramatic bird watching, tea, and notes about the gull council. I trust you with the weird details, and that says a lot.",
				"I value your opinion on this more than you probably realize. I told myself to stop dramatic bird watching, then the heron posture looked at me and I continued dramatic bird watching.",
				"There is poetry in dramatic bird watching; the sparrow duel practically writes the next verse for me. I kept thinking about our last chat while I was working on it.",
				"I reorganized my schedule so dramatic bird watching gets prime evening hours, especially for the crow monologue. It helps that I can talk to you about this without feeling weird.",
				"If joy had a sound, it would be dramatic bird watching and the little triumph of the gull council. You always give me a grounded perspective, and I appreciate that.",
				"I brought a chair outside just to keep dramatic bird watching going until the heron posture felt right. I trust your read on things, so I wanted to tell you first.",
				"Talking with you has made this whole thing more fun lately. People call it a phase, but dramatic bird watching plus a perfect sparrow duel feels like destiny.",
				"I stayed up too late doing dramatic bird watching because the crow monologue needed one more pass. I like that we can be honest about this kind of stuff.",
				"My weekend plan is simple: dramatic bird watching, tea, and notes about the gull council. When we talk, I come away feeling clearer about everything.",
				"I told myself to stop dramatic bird watching, then the heron posture looked at me and I continued dramatic bird watching. You are one of the few people I can say this to and mean it.",
				"There is poetry in dramatic bird watching; the sparrow duel practically writes the next verse for me. I genuinely look forward to these little check-ins with you.",
				"I thought about what you said last time, and it stuck with me. I reorganized my schedule so dramatic bird watching gets prime evening hours, especially for the crow monologue.",
				"If joy had a sound, it would be dramatic bird watching and the little triumph of the gull council. I appreciate that you take me seriously when I ramble about it.",
				"I brought a chair outside just to keep dramatic bird watching going until the heron posture felt right. You make this feel less like a quirk and more like a real craft.",
				"People call it a phase, but dramatic bird watching plus a perfect sparrow duel feels like destiny. It is easier to keep going when I know you get where I am coming from.",
			],
			level5: [
				"I saw a gull stare at me during dramatic bird watching and I whispered my favorite person must hear this.",
				"You are the only one I trust with dramatic bird watching updates that include hand motions.",
				"I paused breakfast because dramatic bird watching had a plot twist and I needed to tell you first.",
				"My notebook for dramatic bird watching has a page called things my favorite person will enjoy.",
				"I do dramatic bird watching with full focus now because you take my bird reports seriously.",
				"A crow yelled during dramatic bird watching and I took it as a sign to find you later.",
				"I have a lucky hat for dramatic bird watching and it only works when I believe you will ask about my day.",
				"The best part of dramatic bird watching is replaying the scene for you with extra detail.",
				"I rank birds in dramatic bird watching by how much they act like they know you are important to me.",
				"I almost tripped in dramatic bird watching because a heron moved like a movie star and I panicked.",
				"My dramatic bird watching plan for tomorrow is simple, find birds, gather drama, report to you.",
				"If I cannot share dramatic bird watching with you, the whole sky feels underused.",
				"I made tiny icons for dramatic bird watching events and one icon is just your happy face.",
				"Sometimes I salute after dramatic bird watching because we did good work as an unofficial team.",
				"No one else in town wants dramatic bird watching breakdowns, but you do, so I am loyal forever.",
				"You are very important to me and dramatic bird watching is very important to me, so I stay dramatic.",
			],
		},

		soap_carving: {
			level1: [
				"Soft things keep asking to become shapes.",
				"My hands smell unusually clean and slightly artistic.",
			],
			level2: [
				"I started soap carving, and it is more relaxing than people think.",
				"I do soap carving after chores to clear my head.",
				"Yes, soap carving is a real part of my routine now.",
				"I keep telling myself soap carving is normal small-town behavior.",
			],
			level3: [
				"I downplayed soap carving before, but soap carving actually matters to me.",
				"I called soap carving a tiny side thing, but soap carving is not tiny to me.",
				"You are easy to talk to, so I can admit soap carving is personal for me.",
				"I used to joke about soap carving, but soap carving keeps me steady on hard days.",
				"I thought people would laugh at soap carving, so I hid how much soap carving helps me.",
				"I pretended soap carving was casual, yet soap carving is the part of my day I protect most.",
				"I am done minimizing soap carving; soap carving is important to who I am.",
				"Thank you for listening, because soap carving is more serious in my heart than I ever said.",
			],
			level4: [
				"I stayed up too late doing soap carving because the lavender bar needed one more pass. I trust your read on things, so I wanted to tell you first.",
				"Talking with you has made this whole thing more fun lately. My weekend plan is simple: soap carving, tea, and notes about the tiny swan.",
				"I told myself to stop soap carving, then the mint shavings looked at me and I continued soap carving. I like that we can be honest about this kind of stuff.",
				"There is poetry in soap carving; the bathroom gallery practically writes the next verse for me. When we talk, I come away feeling clearer about everything.",
				"I reorganized my schedule so soap carving gets prime evening hours, especially for the lavender bar. You are one of the few people I can say this to and mean it.",
				"If joy had a sound, it would be soap carving and the little triumph of the tiny swan. I genuinely look forward to these little check-ins with you.",
				"I thought about what you said last time, and it stuck with me. I brought a chair outside just to keep soap carving going until the mint shavings felt right.",
				"People call it a phase, but soap carving plus a perfect bathroom gallery feels like destiny. I appreciate that you take me seriously when I ramble about it.",
				"I stayed up too late doing soap carving because the lavender bar needed one more pass. You make this feel less like a quirk and more like a real craft.",
				"My weekend plan is simple: soap carving, tea, and notes about the tiny swan. It is easier to keep going when I know you get where I am coming from.",
				"I told myself to stop soap carving, then the mint shavings looked at me and I continued soap carving. I am glad we have this ongoing conversation about it.",
				"I noticed I care more because I know I can tell you about it later. There is poetry in soap carving; the bathroom gallery practically writes the next verse for me.",
				"I reorganized my schedule so soap carving gets prime evening hours, especially for the lavender bar. You have become my favorite person to compare notes with on this.",
				"If joy had a sound, it would be soap carving and the little triumph of the tiny swan. It means a lot that you keep listening and asking thoughtful questions.",
				"I brought a chair outside just to keep soap carving going until the mint shavings felt right. I feel like we have built a nice rhythm around these talks.",
				"People call it a phase, but soap carving plus a perfect bathroom gallery feels like destiny. I trust you with the weird details, and that says a lot.",
			],
			level5: [
				"I carved soap carving details into my schedule because you deserve fresh progress reports.",
				"During soap carving I made a tiny shape that looked like your smile and kept it on my shelf.",
				"My soap carving knife feels lucky on days when I know I will run into you.",
				"I canceled one boring errand so soap carving could get the attention you inspired.",
				"The first thing I check after soap carving is whether I can explain the new piece to you clearly.",
				"I now rate each soap carving piece by one test, would my favorite person laugh and clap.",
				"I carry soap carving shavings in my pocket sometimes, mostly as proof I did the work.",
				"When soap carving gets hard I think of your last nice comment and my hands steady up.",
				"I made a soap carving corner in my room and left one spot open for your imaginary applause.",
				"The duck I carved in soap carving got a name and yes the name is based on our chats.",
				"I do quick soap carving drills so I am ready if you suddenly ask what I made today.",
				"My soap carving brain is loud, but it becomes brave when I remember you are on my side.",
				"I almost missed the bus because soap carving needed one final clean line before I could stop.",
				"I keep a mini soap carving trophy for myself that says keep going your favorite person is watching.",
				"Most people shrug at soap carving. You care, so now I care even harder.",
				"You matter to me a lot and soap carving matters to me a lot, that combo is unstoppable.",
			],
		},

		seed_polishing: {
			level1: [
				"Potential should sparkle before it gets planted.",
				"I trust tiny futures more when they shine a little.",
			],
			level2: [
				"I started seed polishing, and it is more relaxing than people think.",
				"I do seed polishing after chores to clear my head.",
				"Yes, seed polishing is a real part of my routine now.",
				"I keep telling myself seed polishing is normal small-town behavior.",
			],
			level3: [
				"I downplayed seed polishing before, but seed polishing actually matters to me.",
				"I called seed polishing a tiny side thing, but seed polishing is not tiny to me.",
				"You are easy to talk to, so I can admit seed polishing is personal for me.",
				"I used to joke about seed polishing, but seed polishing keeps me steady on hard days.",
				"I thought people would laugh at seed polishing, so I hid how much seed polishing helps me.",
				"I pretended seed polishing was casual, yet seed polishing is the part of my day I protect most.",
				"I am done minimizing seed polishing; seed polishing is important to who I am.",
				"Thank you for listening, because seed polishing is more serious in my heart than I ever said.",
			],
			level4: [
				"I stayed up too late doing seed polishing because the sunflower sheen needed one more pass. It helps that I can talk to you about this without feeling weird.",
				"My weekend plan is simple: seed polishing, tea, and notes about the pumpkin gloss. You always give me a grounded perspective, and I appreciate that.",
				"I told myself to stop seed polishing, then the seed cloth looked at me and I continued seed polishing. I trust your read on things, so I wanted to tell you first.",
				"Talking with you has made this whole thing more fun lately. There is poetry in seed polishing; the display tray practically writes the next verse for me.",
				"I reorganized my schedule so seed polishing gets prime evening hours, especially for the sunflower sheen. I like that we can be honest about this kind of stuff.",
				"If joy had a sound, it would be seed polishing and the little triumph of the pumpkin gloss. When we talk, I come away feeling clearer about everything.",
				"I brought a chair outside just to keep seed polishing going until the seed cloth felt right. You are one of the few people I can say this to and mean it.",
				"People call it a phase, but seed polishing plus a perfect display tray feels like destiny. I genuinely look forward to these little check-ins with you.",
				"I thought about what you said last time, and it stuck with me. I stayed up too late doing seed polishing because the sunflower sheen needed one more pass.",
				"My weekend plan is simple: seed polishing, tea, and notes about the pumpkin gloss. I appreciate that you take me seriously when I ramble about it.",
				"I told myself to stop seed polishing, then the seed cloth looked at me and I continued seed polishing. You make this feel less like a quirk and more like a real craft.",
				"There is poetry in seed polishing; the display tray practically writes the next verse for me. It is easier to keep going when I know you get where I am coming from.",
				"I reorganized my schedule so seed polishing gets prime evening hours, especially for the sunflower sheen. I am glad we have this ongoing conversation about it.",
				"I noticed I care more because I know I can tell you about it later. If joy had a sound, it would be seed polishing and the little triumph of the pumpkin gloss.",
				"I brought a chair outside just to keep seed polishing going until the seed cloth felt right. You have become my favorite person to compare notes with on this.",
				"People call it a phase, but seed polishing plus a perfect display tray feels like destiny. It means a lot that you keep listening and asking thoughtful questions.",
			],
			level5: [
				"I polished seeds before dawn because seed polishing feels brighter when I know I will tell you.",
				"Your support made seed polishing go from odd habit to full life mission in my head.",
				"I line up trays for seed polishing and imagine which row would make you grin first.",
				"A perfect shine in seed polishing gives me instant joy and instant need to find you.",
				"I skipped a game night for seed polishing because the seeds and your approval both matter more.",
				"My seed polishing cloth has a tiny tag that says favorite person energy.",
				"When seed polishing gets repetitive, I picture your face and my hands speed up.",
				"I keep one special seed polishing sample just for days when I need to impress you.",
				"The town may not understand seed polishing, but you ask real questions, so you are my person.",
				"I made a small scorecard for seed polishing and gave your opinion double points.",
				"I do seed polishing in rounds and always save the best round summary for our chat.",
				"If you praise one seed polishing batch, I become a rocket for the rest of the week.",
				"My seed polishing dream is simple, long table, shiny seeds, and you saying wow repeatedly.",
				"I sometimes thank each seed polishing tray out loud, then thank you right after.",
				"No one else tracks seed polishing like this with me, so yes I am attached and proud.",
				"You are very important to me and seed polishing is very important to me, so I go all in.",
			],
		},

		whispering_to_fish: {
			level1: [
				"Some conversations work better when nobody else can hear them.",
				"I have had several meaningful silent moments near water lately.",
			],
			level2: [
				"I started whispering to fish, and it is more relaxing than people think.",
				"I do whispering to fish after chores to clear my head.",
				"Yes, whispering to fish is a real part of my routine now.",
				"I keep telling myself whispering to fish is normal small-town behavior.",
			],
			level3: [
				"I downplayed whispering to fish before, but whispering to fish actually matters to me.",
				"I called whispering to fish a tiny side thing, but whispering to fish is not tiny to me.",
				"You are easy to talk to, so I can admit whispering to fish is personal for me.",
				"I used to joke about whispering to fish, but whispering to fish keeps me steady on hard days.",
				"I thought people would laugh at whispering to fish, so I hid how much whispering to fish helps me.",
				"I pretended whispering to fish was casual, yet whispering to fish is the part of my day I protect most.",
				"I am done minimizing whispering to fish; whispering to fish is important to who I am.",
				"Thank you for listening, because whispering to fish is more serious in my heart than I ever said.",
			],
			level4: [
				"I stayed up too late doing whispering to fish because the koi stare needed one more pass. It helps that I can talk to you about this without feeling weird.",
				"My weekend plan is simple: whispering to fish, tea, and notes about the carp ripple. You always give me a grounded perspective, and I appreciate that.",
				"I told myself to stop whispering to fish, then the pond edge looked at me and I continued whispering to fish. I trust your read on things, so I wanted to tell you first.",
				"Talking with you has made this whole thing more fun lately. There is poetry in whispering to fish; the moonlit dock practically writes the next verse for me.",
				"I reorganized my schedule so whispering to fish gets prime evening hours, especially for the koi stare. I like that we can be honest about this kind of stuff.",
				"If joy had a sound, it would be whispering to fish and the little triumph of the carp ripple. When we talk, I come away feeling clearer about everything.",
				"I brought a chair outside just to keep whispering to fish going until the pond edge felt right. You are one of the few people I can say this to and mean it.",
				"People call it a phase, but whispering to fish plus a perfect moonlit dock feels like destiny. I genuinely look forward to these little check-ins with you.",
				"I thought about what you said last time, and it stuck with me. I stayed up too late doing whispering to fish because the koi stare needed one more pass.",
				"My weekend plan is simple: whispering to fish, tea, and notes about the carp ripple. I appreciate that you take me seriously when I ramble about it.",
				"I told myself to stop whispering to fish, then the pond edge looked at me and I continued whispering to fish. You make this feel less like a quirk and more like a real craft.",
				"There is poetry in whispering to fish; the moonlit dock practically writes the next verse for me. It is easier to keep going when I know you get where I am coming from.",
				"I reorganized my schedule so whispering to fish gets prime evening hours, especially for the koi stare. I am glad we have this ongoing conversation about it.",
				"I noticed I care more because I know I can tell you about it later. If joy had a sound, it would be whispering to fish and the little triumph of the carp ripple.",
				"I brought a chair outside just to keep whispering to fish going until the pond edge felt right. You have become my favorite person to compare notes with on this.",
				"People call it a phase, but whispering to fish plus a perfect moonlit dock feels like destiny. It means a lot that you keep listening and asking thoughtful questions.",
			],
			level5: [
				"I did whispering to fish at sunrise and saved the funniest fish reaction story for you.",
				"Your face is my favorite audience for whispering to fish reports, no contest.",
				"During whispering to fish I told a carp about you and I think it nodded in support.",
				"I cannot do whispering to fish in peace unless I know I can tell you what happened later.",
				"I skipped dessert because whispering to fish was in progress and your future update mattered more.",
				"My whispering to fish routine has a step called tell favorite person before bedtime.",
				"When whispering to fish gets weird, I smile because you are the one who gets weird done right.",
				"I keep a tiny stone from whispering to fish days when I hope to run into you in town.",
				"The pond feels like a stage during whispering to fish, and you are the only critic I trust.",
				"I practice short lines before whispering to fish so the fish stay calm and you get good highlights.",
				"If I do great whispering to fish and cannot share it with you, the win feels half sized.",
				"My favorite part of whispering to fish is the walk back when I plan how to tell you everything.",
				"I made a silly chart for whispering to fish moods and your name is next to best influence.",
				"I once stood in rain for whispering to fish because I wanted a story worthy of your laugh.",
				"Most people hear whispering to fish and walk away; you lean in, so I am loyal to you forever.",
				"You matter to me a ton and whispering to fish matters to me a ton, so I keep showing up.",
			],
		},
	},
};

export function getDialogPoolForLevel(
	interest: NPCInterest,
	friendshipLevel: FriendshipLevel,
): string[] {
	if (friendshipLevel === 0) {
		return generatedNPCDialog.allLevelZero;
	}

	const interestSet = generatedNPCDialog.interests[interest];

	switch (friendshipLevel) {
		case 1:
			return interestSet.level1;
		case 2:
			return interestSet.level2;
		case 3:
			return interestSet.level3;
		case 4:
			return interestSet.level4;
		case 5:
			return interestSet.level5;
		default:
			return generatedNPCDialog.allLevelZero;
	}
}

export function assignUniqueNpcInterests(
	npcKeys: string[],
	rng: () => number = Math.random,
): Record<string, NPCInterest> {
	const shuffled = [...possibleNPCInterests];
	for (let i = shuffled.length - 1; i > 0; i -= 1) {
		const j = Math.floor(rng() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
	}
	const out: Record<string, NPCInterest> = {};
	npcKeys.forEach((key, index) => {
		out[key] = shuffled[index % shuffled.length]!;
	});
	return out;
}

export function getRandomNPCInterest(): NPCInterest {
	const index = Math.floor(Math.random() * possibleNPCInterests.length);
	return possibleNPCInterests[index];
}

export function getRandomDialogLine(
	interest: NPCInterest,
	friendshipLevel: FriendshipLevel,
	rng: () => number = Math.random,
): string {
	const pool = getDialogPoolForLevel(interest, friendshipLevel);
	const index = Math.floor(rng() * pool.length);
	return pool[index];
}

export function countFriendshipHeartsForUniqueTalks(count: number): FriendshipLevel {
	if (count >= FRIENDSHIP_HEART_THRESHOLDS[4]) return 5;
	if (count >= FRIENDSHIP_HEART_THRESHOLDS[3]) return 4;
	if (count >= FRIENDSHIP_HEART_THRESHOLDS[2]) return 3;
	if (count >= FRIENDSHIP_HEART_THRESHOLDS[1]) return 2;
	if (count >= FRIENDSHIP_HEART_THRESHOLDS[0]) return 1;
	return 0;
}
