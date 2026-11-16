'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MailOpen, Music, CloudRain, Sparkles, VolumeX } from 'lucide-react';
import { AmbientMode, soundEngine } from '@/lib/sound';

interface ConfessionSceneProps {
  senderName: string;
  recipientName: string;
  mistake: string;
  specialMemory: string;
  ambientMode: AmbientMode;
  onChangeAmbientMode: (mode: AmbientMode) => void;
  onNext: () => void;
}

export function ConfessionScene({
  senderName,
  recipientName,
  mistake,
  specialMemory,
  ambientMode,
  onChangeAmbientMode,
  onNext,
}: ConfessionSceneProps) {
  const fullHeadline = `يا ${recipientName}.. أنا غلطت في حق حضرتك`;
  const [typedCount, setTypedCount] = useState(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return fullHeadline.length;
    }
    return 0;
  });
  const [memoryOpened, setMemoryOpened] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const interval = setInterval(() => {
      setTypedCount((prev) => {
        if (prev >= fullHeadline.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 55);

    return () => clearInterval(interval);
  }, [fullHeadline]);

  const isTypingDone = typedCount >= fullHeadline.length;
  const paragraphs = mistake
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-white p-6 sm:p-8 shadow-sm"
    >
      {/* Peaceful moving mist backdrop */}
      <motion.div
        aria-hidden="true"
        animate={{
          transform: [
            'translate3d(0px, 0px, 0px) scale(1)',
            'translate3d(-18px, 10px, 0px) scale(1.07)',
            'translate3d(0px, 0px, 0px) scale(1)',
          ],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{
          transform: [
            'translate3d(0px, 0px, 0px) scale(1)',
            'translate3d(16px, -12px, 0px) scale(1.08)',
            'translate3d(0px, 0px, 0px) scale(1)',
          ],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl"
      />

      <div className="relative z-10 space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-amber-700">
            ٠١ · الاعتراف · رسالة صادقة من {senderName}
          </p>

          <h1
            className="font-display min-h-[3.2rem] text-3xl font-bold leading-snug text-slate-900 sm:text-4xl [text-wrap:balance]"
            aria-label={fullHeadline}
          >
            {fullHeadline.slice(0, typedCount)}
            {!isTypingDone && (
              <span className="mr-1 inline-block h-7 w-0.5 animate-pulse bg-indigo-700 align-middle" />
            )}
          </h1>
        </div>

        {/* Soothing Background Audio Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5">
          <span className="text-xs font-medium text-slate-600">
            خلفية صوتية هادئة أثناء القراءة
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChangeAmbientMode(ambientMode === 'music' ? 'off' : 'music')}
              className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                ambientMode === 'music'
                  ? 'border-indigo-700 bg-indigo-700 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Music className="h-3.5 w-3.5" />
              <span>موسيقى هادئة</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeAmbientMode(ambientMode === 'nature' ? 'off' : 'nature')}
              className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                ambientMode === 'nature'
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CloudRain className="h-3.5 w-3.5" />
              <span>صوت طبيعة خفيف</span>
            </button>

            {ambientMode !== 'off' && (
              <button
                type="button"
                onClick={() => onChangeAmbientMode('off')}
                aria-label="إيقاف صوت الخلفية"
                className="min-h-[38px] inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 whitespace-nowrap"
              >
                <VolumeX className="h-3.5 w-3.5" />
                <span>إيقاف</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-paragraph dignified apology letter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isTypingDone ? 1 : 0.45, y: isTypingDone ? 0 : 6 }}
          transition={{ duration: 0.45 }}
          className="space-y-3.5 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/45 via-white to-amber-50/40 p-5 sm:p-6"
        >
          <p className="text-xs font-semibold text-indigo-800">نص الاعتذار</p>
          <div className="space-y-3 text-sm leading-loose text-slate-800 sm:text-base">
            {paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </motion.div>

        {/* Interactive Appreciation Envelope */}
        {specialMemory && (
          <div>
            {!memoryOpened ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playChime(2);
                  setMemoryOpened(true);
                }}
                className="min-h-[48px] w-full flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/70 px-4 py-3 text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-100/70"
              >
                <MailOpen className="h-4 w-4 text-amber-700" />
                <span>افتح ظرف التقدير قبل ما نكمل</span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>رسالة تقدير لحضرتك</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-800">{specialMemory}</p>
              </motion.div>
            )}
          </div>
        )}

        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playChime(1);
              onNext();
            }}
            className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-indigo-700 to-indigo-800 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:from-indigo-800 hover:to-indigo-900 active:scale-[0.99] whitespace-nowrap"
          >
            <span>كمّل معايا</span>
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
