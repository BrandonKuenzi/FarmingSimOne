import React from "react";
import { GLYPH } from "../config/glyphs";

type CurrentMarketRow = {
	id: string;
	name: string;
	price: number;
	trend: number;
};

type Props = {
	rows: CurrentMarketRow[];
	compact?: boolean;
	className?: string;
};

export const CurrentMarket = ({ rows, compact = false, className }: Props) => {
	return (
		<div
			className={[
				"legend",
				"market-panel",
				compact ? "market-panel-compact" : "",
				className ?? "",
			]
				.filter(Boolean)
				.join(" ")}
		>
			<div className='panel-title'>Current Market</div>
			<ul className='market-list'>
				{rows.map((row) => (
					<li key={`market-${row.id}`}>
						<span>{row.name}:</span>{" "}
						<span>
							${row.price}{" "}
							{row.trend > 0
								? GLYPH.chartUp
								: row.trend < 0
									? GLYPH.chartDown
									: ""}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
};
