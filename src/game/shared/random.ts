export const randomRoll = () => Math.random();

export const randomInt = (min: number, max: number) =>
	Math.floor(randomRoll() * (max - min + 1)) + min;

export const clampMin = (n: number, min: number) => (n < min ? min : n);
