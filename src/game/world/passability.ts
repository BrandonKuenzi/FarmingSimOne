export const isPassableChar = (c: string): boolean => {
	if (c === " ") return false;
	if (
		c === "#" ||
		c === "T" ||
		c === "G" ||
		c === "O" ||
		c === "]" ||
		c === "<" ||
		c === ">" ||
		c === "*"
	)
		return false;
	if (c === "d" || c === "w" || c === "l" || c === "x" || c === "h") return false;
	if (c === '"') return false;
	if (c === "\u00A7") return false;
	if (c === "\u00D7" || c === "\u00D8" || c === "\u00D9")
		return false;
	if (c === "\u00DB") return false;
	if (c === "U" || c === "j" || c === "b") return false;
	if (c === "R" || c === "W" || c === "g" || c === "Q" || c === "H" || c === "B")
		return false;
	if (c === "(" || c === "-") return false;
	if ("sfa$tck".includes(c)) return false;
	if (c === "~" || c === "[") return false;
	if (c === "\u0192" || c === "\u00A2" || c === "\u00A4") return false;
	if (c === "\u00C4") return false;
	if (c === "\u00C5") return false;
	if (c === "\u00C6") return false;
	if (c === "\u00B1" || c === "\u00B5") return false;
	return true;
};
