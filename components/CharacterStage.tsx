'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

export type StageMood =
  | 'setup'
  | 'confession'
  | 'empathy'
  | 'no-excuses'
  | 'promises'
  | 'compensation'
  | 'reconciling'
  | 'reconciled';

interface CharacterStageProps {
  senderName: string;
  recipientName: string;
  mood: StageMood;
  /** 0 to 1 progress when reconciling via long-press */
  approachProgress?: number;
  /** Optional reaction text bubble above sender */
  senderCaption?: string;
  /** Optional reaction text bubble above recipient */
  recipientCaption?: string;
}

export function CharacterStage({
  senderName,
  recipientName,
  mood,
  approachProgress = 0,
  senderCaption,
  recipientCaption,
}: CharacterStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointerOffset({
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    });
  };

  const handlePointerLeave = () => {
    setPointerOffset({ x: 0, y: 0 });
  };

  // Horizontal positions of characters in original 320x175 SVG coordinates
  const baseSeparation =
    mood === 'promises' || mood === 'compensation'
      ? 52
      : mood === 'empathy' || mood === 'no-excuses'
        ? 74
        : 96;

  // Sender (Habiba) on right side, Recipient (Khaled) on left side
  const senderX =
    mood === 'reconciled'
      ? 178
      : mood === 'reconciling'
        ? 258 - approachProgress * 80
        : 210 + baseSeparation / 2;

  const recipientX =
    mood === 'reconciled'
      ? 142
      : mood === 'reconciling'
        ? 62 + approachProgress * 80
        : 110 - baseSeparation / 2;

  const isSmiling =
    mood === 'reconciled' || (mood === 'reconciling' && approachProgress > 0.72);
  const isWarming =
    mood === 'promises' ||
    mood === 'compensation' ||
    (mood === 'reconciling' && approachProgress > 0.35);

  const eyeShiftX = pointerOffset.x * 2.2;
  const eyeShiftY = pointerOffset.y * 1.5;

  return (
    <div
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 select-none touch-pan-y shadow-sm"
      aria-label={`رسم توضيحي تفاعلي يجمع ${senderName} و${recipientName}`}
    >
      {/* Gentle ambient horizon */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500"
        style={{
          background:
            mood === 'reconciled'
              ? 'radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.14), rgba(99, 102, 241, 0.06) 55%, transparent 80%)'
              : 'radial-gradient(circle at 50% 45%, rgba(99, 102, 241, 0.08), rgba(226, 232, 240, 0.25) 60%, transparent 85%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Optional dialogue captions */}
        {(senderCaption || recipientCaption) && (
          <div className="mb-2 grid w-full grid-cols-2 gap-3 text-center text-xs font-medium text-slate-600">
            <div className="min-h-[24px] flex items-center justify-center">
              {senderCaption && (
                <motion.span
                  key={senderCaption}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block rounded-lg border border-indigo-100 bg-indigo-50/70 px-2.5 py-1 text-indigo-900"
                >
                  {senderCaption}
                </motion.span>
              )}
            </div>
            <div className="min-h-[24px] flex items-center justify-center">
              {recipientCaption && (
                <motion.span
                  key={recipientCaption}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700"
                >
                  {recipientCaption}
                </motion.span>
              )}
            </div>
          </div>
        )}

        <svg
          viewBox="0 0 320 175"
          className="h-40 w-full max-w-[360px] sm:h-48"
          role="img"
          aria-hidden="true"
        >
          {/* Ground shadow */}
          <ellipse cx="160" cy="154" rx="115" ry="9" fill="#E2E8F0" opacity="0.7" />

          {/* Connecting bridge / heart-warmth arc when reconciled or approaching */}
          {(mood === 'reconciled' || (mood === 'reconciling' && approachProgress > 0.4)) && (
            <motion.path
              d="M 135 64 Q 160 34 185 64"
              fill="none"
              stroke={mood === 'reconciled' ? '#059669' : '#4F46E5'}
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: mood === 'reconciled' ? 0.9 : approachProgress }}
            />
          )}

          {/* Warmth spark above embrace */}
          {mood === 'reconciled' && (
            <motion.g
              initial={{ scale: 0.4, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <circle cx="160" cy="34" r="14" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.5" />
              <path
                d="M160 41 C160 41 151 35.5 151 30.8 C151 28.4 152.9 26.8 155 26.8 C156.5 26.8 158 27.6 158.8 29 C159.6 27.6 161.1 26.8 162.6 26.8 C164.7 26.8 166.6 28.4 166.6 30.8 C166.6 35.5 157.6 41 160 41 Z"
                fill="#059669"
              />
            </motion.g>
          )}

          {/* Recipient Character: Khaled (Left) */}
          <motion.g
            animate={{
              x: recipientX,
              y: mood === 'reconciled' ? -2 : 0,
            }}
            transition={
              mood === 'reconciling'
                ? { duration: 0.05, ease: 'linear' }
                : { type: 'spring', stiffness: 180, damping: 22 }
            }
          >
            {/* Torso */}
            <path
              d="M -22 146 C -22 118, -16 104, 0 104 C 16 104, 22 118, 22 146 Z"
              fill="#1E293B"
            />
            {/* Collar detail */}
            <path d="M -7 104 L 0 113 L 7 104" fill="none" stroke="#94A3B8" strokeWidth="1.5" />

            {/* Arm reaching gently when reconciled */}
            {mood === 'reconciled' ? (
              <path
                d="M 18 116 Q 34 118 36 128"
                fill="none"
                stroke="#1E293B"
                strokeWidth="7"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M -18 118 Q -24 132 -16 138"
                fill="none"
                stroke="#1E293B"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
            )}

            {/* Head */}
            <g transform={`translate(${pointerOffset.x * 2}, ${pointerOffset.y * 1.5})`}>
              <circle cx="0" cy="79" r="21" fill="#F1D4BA" />
              {/* Hair */}
              <path
                d="M -21 76 C -21 60, -10 54, 2 55 C 15 55, 22 63, 21 76 C 17 69, 9 67, 0 67 C -9 67, -16 70, -21 76 Z"
                fill="#0F172A"
              />
              {/* Eyes */}
              <circle cx={-6 + eyeShiftX} cy={79 + eyeShiftY} r="2.1" fill="#0F172A" />
              <circle cx={7 + eyeShiftX} cy={79 + eyeShiftY} r="2.1" fill="#0F172A" />
              {/* Brows */}
              {mood === 'confession' || mood === 'empathy' ? (
                <>
                  <path d="M -10 73 L -3 74.5" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M 4 74.5 L 11 73" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
                </>
              ) : null}
              {/* Mouth */}
              {isSmiling ? (
                <path
                  d="M -5 88 Q 1 93 7 88"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : isWarming ? (
                <path
                  d="M -4 89 L 5 89"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M -4 91 Q 1 88 6 91"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              )}
            </g>
          </motion.g>

          {/* Sender Character: Habiba (Right) */}
          <motion.g
            animate={{
              x: senderX,
              y: mood === 'reconciled' ? -2 : 0,
            }}
            transition={
              mood === 'reconciling'
                ? { duration: 0.05, ease: 'linear' }
                : { type: 'spring', stiffness: 180, damping: 22 }
            }
          >
            {/* Modest Hijab / Scarf Back Drape */}
            <path
              d="M -23 82 C -25 60, -12 52, 0 52 C 14 52, 25 62, 24 84 L 26 116 C 14 122, -14 122, -25 116 Z"
              fill="#3730A3"
            />
            {/* Torso */}
            <path
              d="M -22 146 C -22 117, -15 104, 0 104 C 15 104, 22 117, 22 146 Z"
              fill="#4338CA"
            />

            {/* Apologetic / Reaching Arm */}
            {mood === 'reconciled' ? (
              <path
                d="M -18 116 Q -34 118 -36 128"
                fill="none"
                stroke="#4338CA"
                strokeWidth="7"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M -16 118 Q -28 112 -26 102"
                fill="none"
                stroke="#4338CA"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
            )}

            {/* Head & Face */}
            <g transform={`translate(${pointerOffset.x * 2}, ${pointerOffset.y * 1.5})`}>
              {/* Scarf Inner Frame */}
              <circle cx="0" cy="79" r="20.5" fill="#E0E7FF" opacity="0.25" />
              <circle cx="0" cy="80" r="18.5" fill="#F5DBC3" />
              {/* Hijab Top Curve */}
              <path
                d="M -19 77 C -17 61, 17 61, 19 77 C 11 69, -11 69, -19 77 Z"
                fill="#3730A3"
              />
              {/* Eyes */}
              <circle cx={-6.5 + eyeShiftX} cy={80 + eyeShiftY} r="2" fill="#0F172A" />
              <circle cx={5.5 + eyeShiftX} cy={80 + eyeShiftY} r="2" fill="#0F172A" />
              {/* Subtle blush */}
              <circle cx="-11" cy="85" r="2.6" fill="#FDA4AF" opacity="0.45" />
              <circle cx="10" cy="85" r="2.6" fill="#FDA4AF" opacity="0.45" />
              {/* Mouth */}
              {isSmiling ? (
                <path
                  d="M -5 89 Q 0 94 5 89"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M -4 90 Q 0 92 4 90"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </g>
          </motion.g>
        </svg>

        {/* Clean unboxed character names under the stage */}
        <div className="mt-1 flex w-full max-w-[300px] items-center justify-between text-xs font-medium text-slate-500">
          <span>{recipientName}</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>{senderName}</span>
        </div>
      </div>
    </div>
  );
}
