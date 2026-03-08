import React from "react";
import { progressAlgorithmStones } from "../progression/progressStonesAlgorithmic";
import { GLYPH } from "../config/glyphs";
import type {
	MoneyLoadoutRow,
	MoneyStoneId,
	ProgressAlgorithmId,
	ProgressLoadoutRow,
	ProgressRarity,
	ProgressTargetId,
} from "../shared/types";

type StoneUISlot =
	| { kind: "target"; row: ProgressLoadoutRow }
	| { kind: "algorithm"; row: ProgressLoadoutRow; algorithmIndex: 0 | 1 | 2 }
	| { kind: "money"; row: MoneyLoadoutRow }
	| { kind: "money_algorithm"; row: MoneyLoadoutRow; algorithmIndex: 0 | 1 | 2 };

const targetEmojiById: Record<ProgressTargetId, string> = {
	money_gained: GLYPH.moneyBag,
	fish_caught: GLYPH.fish,
	forest_depth_advanced: GLYPH.treePine,
	cave_depth_advanced: GLYPH.rock,
	crop_harvested: GLYPH.seedling,
	animal_fed: GLYPH.basket,
	milk_collected: GLYPH.milk,
	wool_collected: GLYPH.yarn,
	egg_collected: GLYPH.egg,
	crop_sold: GLYPH.seedling,
	animal_product_sold: GLYPH.moneyNote,
	fish_sold: GLYPH.fish,
	aquarium_donated: GLYPH.tropicalFish,
};

const algorithmRarityById = Object.fromEntries(
	progressAlgorithmStones.map((stone) => [stone.id, stone.rarity]),
) as Record<ProgressAlgorithmId, ProgressRarity>;

const moneyEmojiById: Record<MoneyStoneId, string> = {
	loot_box: GLYPH.box,
	grass_breaking_award: GLYPH.weed,
	npc_gift: GLYPH.envelope,
	milk_sales: GLYPH.milk,
	wool_sales: GLYPH.yarn,
	egg_sales: GLYPH.egg,
	crop_sales: GLYPH.basket,
	gem_sales: GLYPH.diamond,
	fish_sales: GLYPH.fish,
};

const algorithmTypeById = (id: ProgressAlgorithmId): "add" | "mul" =>
	id.startsWith("mul_") ? "mul" : "add";

export const StoneUI = (slot: StoneUISlot) => {
	if (slot.kind === "target") {
		if (!slot.row.targetStoneId) {
			return (
				<span className='stone-ui-overlay'>
					<span className='stone-ui-hole stone-ui-hole-target'>
						{GLYPH.hole}
					</span>
				</span>
			);
		}
		const emoji = targetEmojiById[slot.row.targetStoneId] ?? GLYPH.star;
		return (
			<span className='stone-ui-overlay'>
				<span className='stone-ui-dot stone-ui-dot-target'>
					<span className='stone-ui-glyph'>{emoji}</span>
				</span>
			</span>
		);
	}

	if (slot.kind === "money") {
		if (!slot.row.moneyStoneId) {
			return (
				<span className='stone-ui-overlay'>
					<span className='stone-ui-hole stone-ui-hole-target'>
						{GLYPH.hole}
					</span>
				</span>
			);
		}
		const emoji = moneyEmojiById[slot.row.moneyStoneId] ?? GLYPH.moneyBag;
		return (
			<span className='stone-ui-overlay'>
				<span className='stone-ui-dot stone-ui-dot-target'>
					<span className='stone-ui-glyph'>{emoji}</span>
				</span>
			</span>
		);
	}

	const algorithmStoneId = slot.row.algorithmStoneIds[slot.algorithmIndex];
	if (!algorithmStoneId) {
		return (
			<span className='stone-ui-overlay'>
				<span className='stone-ui-hole stone-ui-hole-algorithm'>
					{GLYPH.hole}
				</span>
			</span>
		);
	}

	const rarity = algorithmRarityById[algorithmStoneId] ?? "common";
	const marker = algorithmTypeById(algorithmStoneId) === "mul" ? "x" : "+";

	return (
		<span className='stone-ui-overlay'>
			<span
				className={`stone-ui-dot stone-ui-dot-algorithm stone-ui-rarity-${rarity}`}
			>
				<span className='stone-ui-glyph stone-ui-op'>{marker}</span>
			</span>
		</span>
	);
};
