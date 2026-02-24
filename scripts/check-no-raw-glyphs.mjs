import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const ALLOWED_FILE = path.join(ROOT, "src", "game", "config", "glyphs.ts");
const TARGET_EXTS = new Set([".ts", ".tsx"]);
const EMOJI_RE = /\p{Extended_Pictographic}/u;

const walk = async (dir) => {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walk(full)));
			continue;
		}
		if (!TARGET_EXTS.has(path.extname(entry.name))) continue;
		files.push(full);
	}
	return files;
};

const lineColAt = (text, index) => {
	let line = 1;
	let col = 1;
	for (let i = 0; i < index; i += 1) {
		if (text[i] === "\n") {
			line += 1;
			col = 1;
		} else {
			col += 1;
		}
	}
	return { line, col };
};

const findFirstEmoji = (text) => {
	for (const match of text.matchAll(/\p{Extended_Pictographic}/gu)) {
		const i = match.index ?? -1;
		if (i >= 0 && EMOJI_RE.test(match[0])) return { index: i, glyph: match[0] };
	}
	return null;
};

const main = async () => {
	const files = await walk(SRC_DIR);
	const offenders = [];

	for (const file of files) {
		if (file === ALLOWED_FILE) continue;
		const text = await readFile(file, "utf8");
		const found = findFirstEmoji(text);
		if (!found) continue;
		const { line, col } = lineColAt(text, found.index);
		offenders.push({
			file: path.relative(ROOT, file),
			line,
			col,
			glyph: found.glyph,
		});
	}

	if (offenders.length === 0) {
		console.log("Glyph check passed: no raw emoji outside src/game/config/glyphs.ts");
		return;
	}

	console.error("Glyph check failed. Move raw emoji literals into src/game/config/glyphs.ts:");
	for (const offender of offenders) {
		console.error(
			`- ${offender.file}:${offender.line}:${offender.col} contains '${offender.glyph}'`,
		);
	}
	process.exitCode = 1;
};

await main();
