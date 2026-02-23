import type { AnimalDef, AnimalType, CropDef, CropId, ItemId, SnakePatrolState } from "../shared/types";

export const makeSnakeDirections = (enemies: Array<{ id: number; type: string }>) =>
	Object.fromEntries(
		enemies
			.filter((enemy) => enemy.type === "snake")
			.map((enemy) => [
				enemy.id,
				{
					hDir: (Math.random() < 0.5 ? -1 : 1) as -1 | 1,
					vDir: (Math.random() < 0.5 ? -1 : 1) as -1 | 1,
					verticalMode: false,
				} satisfies SnakePatrolState,
			]),
	) as Record<number, SnakePatrolState>;

export const cropDefs: Record<CropId, CropDef> = {
	turnip: {
		name: "Turnip",
		growDays: 2,
		seedItem: "turnip_seed",
		harvestItem: "turnip",
		buyPrice: 4,
		baseSell: 10,
	},
	carrot: {
		name: "Carrot",
		growDays: 4,
		seedItem: "carrot_seed",
		harvestItem: "carrot",
		buyPrice: 6,
		baseSell: 20,
	},
	pumpkin: {
		name: "Pumpkin",
		growDays: 8,
		seedItem: "pumpkin_seed",
		harvestItem: "pumpkin",
		buyPrice: 12,
		baseSell: 75,
	},
	corn: {
		name: "Corn",
		growDays: 5,
		seedItem: "corn_seed",
		harvestItem: "corn",
		buyPrice: 12,
		baseSell: 30,
	},
	coral_fruit: {
		name: "Coral Fruit",
		growDays: 14,
		seedItem: "shell",
		harvestItem: "coral_fruit",
		buyPrice: 0,
		baseSell: 500,
	},
};

export const standardCropIds: CropId[] = ["turnip", "carrot", "pumpkin", "corn"];
export const allPlantableCropIds: CropId[] = [...standardCropIds, "coral_fruit"];

export const animalDefs: Record<AnimalType, AnimalDef> = {
	cow: { name: "Cow", buyPrice: 180, productItem: "milk" },
	sheep: { name: "Sheep", buyPrice: 170, productItem: "wool" },
	chicken: { name: "Chicken", buyPrice: 85, productItem: "egg" },
	hippo: { name: "Hippo", buyPrice: 180, productItem: "milk" },
	unicorn: { name: "Unicorn", buyPrice: 180, productItem: "milk" },
	mammoth: { name: "Mammoth", buyPrice: 180, productItem: "milk" },
	slug: { name: "Slug", buyPrice: 180, productItem: "milk" },
	gorilla: { name: "Gorilla", buyPrice: 180, productItem: "milk" },
};

export const purchasableAnimalTypes: AnimalType[] = ["cow", "sheep", "chicken"];
export const rareCowVariantTypes: AnimalType[] = ["hippo", "unicorn", "mammoth", "slug", "gorilla"];
export const highValueChestAnimalTypes: AnimalType[] = [...purchasableAnimalTypes, ...rareCowVariantTypes];
export const isCowLikeAnimal = (type: AnimalType) => type === "cow" || rareCowVariantTypes.includes(type);

export const itemNames: Record<ItemId, string> = {
	turnip_seed: "Turnip Seed",
	carrot_seed: "Carrot Seed",
	pumpkin_seed: "Pumpkin Seed",
	corn_seed: "Corn Seed",
	turnip: "Turnip",
	carrot: "Carrot",
	pumpkin: "Pumpkin",
	corn: "Corn",
	feed: "Animal Feed",
	milk: "Milk",
	wool: "Wool",
	egg: "Egg",
	fish: "Fish",
	iron: "Iron",
	shell: "Shell",
	diamond: "Diamond",
	emerald: "Emerald",
	ruby: "Ruby",
	coral_fruit: "Coral Fruit",
};

export const itemIcons: Record<ItemId, string> = {
	turnip_seed: "🌱", // seedling
	carrot_seed: "🥕", // carrot
	pumpkin_seed: "🎃", // pumpkin
	corn_seed: "🌽", // corn
	turnip: "🥬", // leafy veggie
	carrot: "🥕", // carrot
	pumpkin: "🎃", // pumpkin
	corn: "🌽", // corn
	feed: "🧺", // basket (feed)
	milk: "🥛", // milk glass
	wool: "🧶", // yarn
	egg: "🥚", // egg
	fish: "🐟", // fish
	iron: "🪨", // rock (iron)
	shell: "🐚", // shell
	diamond: "💎", // diamond
	emerald: "🟢", // green gem proxy
	ruby: "🔴", // red gem proxy
	coral_fruit: "🪸", // coral
};
