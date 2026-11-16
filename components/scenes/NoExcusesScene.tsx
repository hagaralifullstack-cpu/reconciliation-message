'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { EXCUSES_BUBBLES } from '@/lib/apology-data';
import { soundEngine } from '@/lib/sound';

interface NoExcusesSceneProps {
  recipientName: string;
  onPopUpdate?: (remainingCount: number) => void;
  onNext: () => void;
}

export function NoExcusesScene({
  recipientName,
  onPopUpdate,
  onNext,
}: NoExcusesSceneProps) {
  const [poppedIds, setPoppedIds] = useState<string[]>([]);

  const remainingBubbles = EXCUSES_BUBBLES.filter((b) => !poppedIds.includes(b.id));
  const allPopped = remainingBubbles.length === 0;

  const handlePop = (id: string) => {
    if (poppedIds.includes(id)) return;
    const nextPopped = [...poppedIds, id];
    const remaining = EXCUSES_BUBBLES.length - nextPopped.length;
    soundEngine.playPop(remaining);
    setPoppedIds(nextPopped);
    onPopUpdate?.(remaining);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-indigo-100 bg-white p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold">
          <span className="text-amber-700">٠٣ · مفيش أعذار</span>
          <span className="tabular-nums text-slate-500">
            {allPopped
              ? 'مفيش ولا عذر فاضل'
              : `باقي ${remainingBubbles.length} من ${EXCUSES_BUBBLES.length}`}
          </span>
        </div>
        <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl [text-wrap:balance]">
          فرقع الأعذار اللي ملهاش لازمة
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          ممكن أي حد يطلع لنفسه مبررات، بس عشان إنت غالي يا {recipientName} اضغط على كل فقاعة عذر وشيلها من طريقنا.
        </p>
      </div>

      {/* Interactive Bubble Arena */}
      <div className="relative min-h-[280px] w-full overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-amber-50/30 p-4 sm:p-6 flex flex-col items-center justify-center">
        {!allPopped ? (
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {remainingBubbles.map((bubble, idx) => (
                <motion.button
                  key={bubble.id}
                  layout
                  type="button"
                  onClick={() => handlePop(bubble.id)}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, idx % 2 === 0 ? -8 : 8, 0],
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.45,
                    transition: { duration: 0.22 },
                  }}
                  transition={{
                    y: {
                      duration: 3 + idx * 0.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  whileTap={{ scale: 0.88 }}
                  className={`min-h-[54px] cursor-pointer rounded-full border px-5 py-3 text-sm font-semibold shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-indigo-600 ${bubble.tone}`}
                >
                  {bubble.text}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="flex flex-col items-center text-center space-y-3"
          >
            <div className="relative flex h-40 w-40 flex-col items-center justify-center rounded-full border-4 border-amber-200 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white shadow-lg">
              <Sparkles className="mb-1.5 h-5 w-5 text-amber-300" />
              <span className="font-display text-3xl font-bold">أنا آسفة</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-700">
              من غير أي &ldquo;بس&rdquo; أو أعذار.. الغلطة غلطتي وبعتذرلك بكل احترام يا {recipientName}.
            </p>
          </motion.div>
        )}
      </div>

      <div className="pt-1">
        <button
          type="button"
          disabled={!allPopped}
          onClick={() => {
            soundEngine.playChime(4);
            onNext();
          }}
          className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-indigo-700 to-indigo-800 px-7 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-800 hover:to-indigo-900 disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-500 whitespace-nowrap"
        >
          <span>{allPopped ? 'ندخل على برطمان الوعود' : 'فرقع كل الأعذار الأول'}</span>
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
