export const isPassableChar = (c: string): boolean => {
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
	if (c === "U" || c === "j" || c === "b") return false;
	if (c === "R" || c === "W" || c === "g" || c === "Q" || c === "H" || c === "B")
		return false;
	if ("sfa$tck".includes(c)) return false;
	if (c === "~" || c === "[") return false;
	return true;
};
