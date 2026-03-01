import { motion, useAnimationControls } from "framer-motion";
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { TileFxEmote, TileFxHandle } from "../shared/types";
import { GLYPH } from "../config/glyphs";

type Props = {
	glyph: string;
	glyphClassName: string;
	glyphStyle?: React.CSSProperties;
};

type ToastState = {
	id: number;
	text: string;
	durationMs: number;
};

const emoteGlyphByKind: Record<TileFxEmote, string> = {
	happy: GLYPH.smile,
	sad: GLYPH.womanFrown,
};

export const AnimatedEmojiTile = forwardRef<TileFxHandle, Props>(
	({ glyph, glyphClassName, glyphStyle }, ref) => {
		const controls = useAnimationControls();
		const bounceSquashControls = useAnimationControls();
		const [emote, setEmote] = useState<{
			id: number;
			kind: TileFxEmote;
		} | null>(null);
		const [toasts, setToasts] = useState<ToastState[]>([]);
		const emoteTimerRef = useRef<number | null>(null);
		const nextFxIdRef = useRef(1);
		const nextBobbleSignRef = useRef<-1 | 1>(-1);

		useEffect(() => {
			return () => {
				if (emoteTimerRef.current !== null)
					window.clearTimeout(emoteTimerRef.current);
			};
		}, []);

		useImperativeHandle(ref, () => {
			const squeeze = (scaleX = 0.5, durationMs = 1000) => {
				void controls.start({
					scaleX: [1, scaleX, 1],
					transition: { duration: durationMs / 1000, ease: "easeInOut" },
				});
			};
			const stretch = (scaleY = 1.5, durationMs = 1000) => {
				void controls.start({
					scaleY: [1, scaleY, 1],
					transition: { duration: durationMs / 1000, ease: "easeInOut" },
				});
			};
			const bounceSquash = (enabled = true, durationMs = 2000) => {
				if (!enabled) {
					bounceSquashControls.stop();
					bounceSquashControls.set({ scaleY: 1 });
					return;
				}
				void bounceSquashControls.start({
					scaleY: [0.9, 1.1],
					transition: {
						duration: durationMs / 1000,
						ease: "easeInOut",
						repeat: Infinity,
						repeatType: "reverse",
					},
				});
			};
			const bobble = (durationMs = 320) => {
				const sign = nextBobbleSignRef.current;
				nextBobbleSignRef.current = sign === -1 ? 1 : -1;
				const targetAngle = 10 * sign;
				void controls.start({
					rotateZ: [0, targetAngle, 0],
					y: [0, -3, 0],
					transition: { duration: durationMs / 1000, ease: "easeInOut" },
				});
			};
			const jump = (durationMs = 320) => {
				void controls.start({
					y: [0, -10, 0],
					transition: { duration: durationMs / 1000, ease: "easeInOut" },
				});
			};
			const emoteFn = (kind: TileFxEmote, durationMs = 1000) => {
				const id = nextFxIdRef.current++;
				setEmote({ id, kind });
				if (emoteTimerRef.current !== null)
					window.clearTimeout(emoteTimerRef.current);
				emoteTimerRef.current = window.setTimeout(() => {
					setEmote((prev) => (prev?.id === id ? null : prev));
					emoteTimerRef.current = null;
				}, durationMs);
			};
			const toastFn = (text: string, durationMs = 5000) => {
				const id = nextFxIdRef.current++;
				setToasts((prev) => [...prev, { id, text, durationMs }]);
			};
			return {
				squeeze,
				stretch,
				streatch: stretch,
				bounceSquash,
				bobble,
				jump,
				emote: emoteFn,
				toast: toastFn,
			};
		}, [controls]);

		return (
			<div className='tile-fx-wrapper'>
				<motion.div
					className='tile-fx-glyph-motion'
					animate={controls}
				>
					<motion.div
						animate={bounceSquashControls}
						style={{ transformOrigin: "50% 100%" }}
					>
						<span
							className={glyphClassName}
							style={glyphStyle}
						>
							{glyph}
						</span>
					</motion.div>
					{emote && (
						<motion.div
							key={`emote-${emote.id}`}
							className='tile-fx-emote'
							initial={{ opacity: 0, y: 2, scale: 0.9 }}
							animate={{ opacity: 1, y: -2, scale: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15, ease: "easeOut" }}
						>
							{emoteGlyphByKind[emote.kind]}
						</motion.div>
					)}
				</motion.div>
				<div className='tile-fx-toast-stack'>
					{toasts.map((toast, index) => {
						const stackOffsetEm = (toasts.length - 1 - index) * 1.72;
						return (
							<motion.div
								key={`toast-${toast.id}`}
								className='tile-fx-toast'
								initial={{ opacity: 0, y: `${-1.5 - stackOffsetEm}em` }}
								animate={{
									opacity: [0, 1, 1, 0],
									y: [
										`${-1.5 - stackOffsetEm}em`,
										`${-2.0 - stackOffsetEm}em`,
										`${-2.2 - stackOffsetEm}em`,
										`${-2.5 - stackOffsetEm}em`,
									],
								}}
								transition={{
									duration: toast.durationMs / 1000,
									ease: "easeOut",
								}}
								onAnimationComplete={() => {
									setToasts((prev) =>
										prev.filter((item) => item.id !== toast.id),
									);
								}}
							>
								{toast.text}
							</motion.div>
						);
					})}
				</div>
			</div>
		);
	},
);

AnimatedEmojiTile.displayName = "AnimatedEmojiTile";
