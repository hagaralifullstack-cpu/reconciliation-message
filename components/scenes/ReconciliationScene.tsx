'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, HandHeart } from 'lucide-react';
import { soundEngine } from '@/lib/sound';

interface ReconciliationSceneProps {
  senderName: string;
  recipientName: string;
  reconciled: boolean;
  onProgressChange: (progress: number) => void;
  onReconcile: () => void;
  onNext: () => void;
}

const HOLD_DURATION_MS = 2100;

export function ReconciliationScene({
  senderName,
  recipientName,
  reconciled,
  onProgressChange,
  onReconcile,
  onNext,
}: ReconciliationSceneProps) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastPulseStepRef = useRef<number>(-1);
  const onProgressChangeRef = useRef(onProgressChange);
  const onReconcileRef = useRef(onReconcile);

  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
    onReconcileRef.current = onReconcile;
  }, [onProgressChange, onReconcile]);

  const stopHolding = () => {
    setHolding(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastPulseStepRef.current = -1;
    if (!reconciled) {
      setProgress(0);
      onProgressChangeRef.current(0);
    }
  };

  useEffect(() => {
    if (reconciled || !holding) {
      return;
    }

    startTimeRef.current = performance.now();

    const step = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const next = Math.min(1, elapsed / HOLD_DURATION_MS);
      setProgress(next);
      onProgressChangeRef.current(next);

      const pulseBucket = Math.floor(next * 6);
      if (pulseBucket !== lastPulseStepRef.current && next < 1) {
        lastPulseStepRef.current = pulseBucket;
        soundEngine.playHoldPulse(next);
      }

      if (next >= 1) {
        setHolding(false);
        soundEngine.playCelebration();
        onReconcileRef.current();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [holding, reconciled]);

  const effectiveProgress = reconciled ? 1 : progress;
  const pct = Math.round(effectiveProgress * 100);
  const stepsRemaining = Math.max(0, Math.round((1 - effectiveProgress) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-indigo-100 bg-white p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-amber-700">٠٦ · لحظة الصلح</span>
          <span className="tabular-nums text-slate-500">
            {reconciled ? 'تم الصلح ١٠٠٪' : `باقي ${stepsRemaining} خطوة (${pct}%)`}
          </span>
        </div>

        <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl [text-wrap:balance]">
          {reconciled
            ? `قلب ${recipientName} الكبير صفي`
            : `لو قبلت اعتذار ${senderName}.. قرّب المسافة`}
        </h2>

        <p className="text-sm leading-relaxed text-slate-600">
          {reconciled
            ? 'شكراً إنك فتحت صفحة صافية من جديد، المعزة والاحترام دايماً بيغلبوا أي زعل.'
            : 'خليك ضاغط مطوّل على الزرار اللي تحت، وشوف الشخصيتين بيقربوا من بعض لحد ما يتصالحوا.'}
        </p>
      </div>

      {!reconciled ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-amber-50/30 p-6 sm:p-8 space-y-4">
          <button
            type="button"
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={(e) => {
              e.preventDefault();
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // Ignore if pointer capture is unsupported
              }
              setHolding(true);
            }}
            onPointerUp={stopHolding}
            onPointerCancel={stopHolding}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !holding) {
                e.preventDefault();
                setHolding(true);
              }
            }}
            onKeyUp={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                stopHolding();
              }
            }}
            className="relative min-h-[66px] w-full max-w-sm overflow-hidden rounded-2xl border-2 border-indigo-700 bg-white px-6 py-4 text-base font-bold text-indigo-950 shadow-sm transition-transform active:scale-[0.98] select-none touch-none focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <div
              className="pointer-events-none absolute inset-0 origin-right bg-gradient-to-l from-indigo-700 via-indigo-800 to-emerald-700"
              style={{ transform: `scaleX(${effectiveProgress})` }}
            />
            <span
              className={`relative z-10 flex items-center justify-center gap-2.5 transition-colors ${
                pct > 45 ? 'text-white' : 'text-indigo-950'
              }`}
            >
              <HandHeart className="h-5 w-5" />
              <span>اضغط مطوّل علشان تسامح</span>
            </span>
          </button>

          <p className="text-xs font-medium text-slate-600">
            {holding ? 'بيقربوا من بعض أهوه.. خليك ضاغط!' : 'اضغط وفضّل ماسك لحد ١٠٠٪'}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 p-6 text-center"
        >
          <p className="font-display text-2xl font-bold text-emerald-950">
            ربنا يديم الود والاحترام بينكم 🤗
          </p>
          <p className="text-sm leading-relaxed text-emerald-900">
            دلوقتي باقي خطوة واحدة أخيرة عشان نطبع شهادة الصلح الرسمية بتاعتكم.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                soundEngine.playChime(4);
                onNext();
              }}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-700 to-emerald-800 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:from-emerald-800 hover:to-emerald-900 active:scale-[0.99] whitespace-nowrap"
            >
              <span>نكتب كلمة الختام ونطلع الشهادة</span>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
