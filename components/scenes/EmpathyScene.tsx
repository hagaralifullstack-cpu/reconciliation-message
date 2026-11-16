'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import {
  FEELING_RESPONSES,
  FeelingChoice,
  UPSET_LEVELS,
  UpsetLevel,
} from '@/lib/apology-data';
import { soundEngine } from '@/lib/sound';

interface EmpathySceneProps {
  senderName: string;
  recipientName: string;
  selectedFeeling: FeelingChoice | null;
  upsetLevel: UpsetLevel;
  onSelectFeeling: (feeling: FeelingChoice) => void;
  onSelectUpsetLevel: (level: UpsetLevel) => void;
  onNext: () => void;
}

const FEELING_KEYS: FeelingChoice[] = ['bothered', 'hurt', 'angry'];

export function EmpathyScene({
  senderName,
  recipientName,
  selectedFeeling,
  upsetLevel,
  onSelectFeeling,
  onSelectUpsetLevel,
  onNext,
}: EmpathySceneProps) {
  const response = selectedFeeling ? FEELING_RESPONSES[selectedFeeling] : null;
  const levelObj = UPSET_LEVELS.find((l) => l.level === upsetLevel) || UPSET_LEVELS[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-indigo-100 bg-white p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold text-amber-700">٠٢ · أنا فاهم زعلك</p>
        <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl [text-wrap:balance]">
          بصراحة يا {recipientName}.. حسيت بإيه وقتها؟
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          مهم أسمع إحساسك الأول عشان أكون فاهمة اللي عدّى عليك مش بس اللي أنا شايفاه.
        </p>
      </div>

      {/* Feeling Type Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {FEELING_KEYS.map((key) => {
          const item = FEELING_RESPONSES[key];
          const isActive = selectedFeeling === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                soundEngine.playChime(FEELING_KEYS.indexOf(key));
                onSelectFeeling(key);
              }}
              className={`min-h-[82px] flex flex-col justify-between rounded-xl border p-4 text-right transition-all focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                isActive
                  ? 'border-indigo-700 bg-indigo-50/80 text-indigo-950 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-base font-bold">{item.label}</span>
                {isActive && <Check className="h-4 w-4 text-indigo-700 shrink-0" />}
              </div>
              <span className="mt-1.5 text-xs leading-relaxed text-slate-600">
                {item.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Upset Intensity Selector */}
      <div className="space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
        <span className="block text-xs font-semibold text-slate-700">
          ودرجة زعلك دلوقتي قد إيه؟
        </span>
        <div className="grid grid-cols-3 gap-2">
          {UPSET_LEVELS.map((lvl) => {
            const active = upsetLevel === lvl.level;
            return (
              <button
                key={lvl.level}
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  onSelectUpsetLevel(lvl.level);
                }}
                className={`min-h-[44px] rounded-lg border px-2 py-2 text-xs font-semibold transition-all ${
                  active
                    ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>
      </div>

      {response && (
        <motion.div
          key={`${selectedFeeling}-${upsetLevel}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2.5 rounded-xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/40 p-5"
        >
          <h3 className="text-base font-bold text-indigo-950">{response.replyTitle}</h3>
          <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
            {response.replyBody(recipientName, senderName)} {levelObj.replyExtra}
          </p>
        </motion.div>
      )}

      <div className="pt-1">
        <button
          type="button"
          disabled={!selectedFeeling}
          onClick={() => {
            soundEngine.playChime(3);
            onNext();
          }}
          className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-indigo-700 to-indigo-800 px-7 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-800 hover:to-indigo-900 disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-500 whitespace-nowrap"
        >
          <span>الخطوة اللي بعدها</span>
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
