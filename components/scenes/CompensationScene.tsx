'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Gift, Eye, Check } from 'lucide-react';
import { REMOTE_GIFT_OPTIONS } from '@/lib/apology-data';
import { soundEngine } from '@/lib/sound';

interface CompensationSceneProps {
  senderName: string;
  recipientName: string;
  revealed: boolean;
  giftChoice: string;
  giftDetails: string;
  onReveal: () => void;
  onChangeGiftChoice: (choice: string) => void;
  onChangeGiftDetails: (details: string) => void;
  onNext: () => void;
}

export function CompensationScene({
  senderName,
  recipientName,
  revealed,
  giftChoice,
  giftDetails,
  onReveal,
  onChangeGiftChoice,
  onChangeGiftDetails,
  onNext,
}: CompensationSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isScratchingRef = useRef(false);
  const scratchMoveCountRef = useRef(0);
  const [scratchPercent, setScratchPercent] = useState(revealed ? 100 : 0);

  useEffect(() => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Rich champagne-gold metallic scratch foil
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, '#D97706');
    grad.addColorStop(0.35, '#FCD34D');
    grad.addColorStop(0.7, '#F59E0B');
    grad.addColorStop(1, '#B45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Subtle sheen stripes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 2;
    for (let i = -rect.height; i < rect.width + rect.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + rect.height * 0.6, rect.height);
      ctx.stroke();
    }

    // Center prompt
    ctx.fillStyle = '#451A03';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('اخدش الكارت الذهبي بإصبعك هنا', rect.width / 2, rect.height / 2 - 11);
    ctx.fillStyle = '#78350F';
    ctx.font = '13px sans-serif';
    ctx.fillText('هدية تعويض عن بُعد مستنياك تحت الطبقة دي', rect.width / 2, rect.height / 2 + 16);
  }, [revealed]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    soundEngine.playScratchTick();
    scratchMoveCountRef.current += 1;

    if (scratchMoveCountRef.current % 6 === 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let cleared = 0;
      const step = 16;
      let total = 0;
      for (let i = 3; i < pixels.length; i += 4 * step) {
        total += 1;
        if (pixels[i] < 128) cleared += 1;
      }
      const pct = total > 0 ? Math.round((cleared / total) * 100) : 0;
      setScratchPercent(pct);
      if (pct >= 40) {
        soundEngine.playCelebration();
        onReveal();
      }
    }
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
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-amber-700">٠٥ · تعويض عن بُعد</span>
          <span className="tabular-nums text-slate-500">
            {revealed ? 'تم كشف الكوبون' : `تم خدش ${scratchPercent}%`}
          </span>
        </div>
        <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl [text-wrap:balance]">
          عشان رضاك غالي.. ليك كارت تعويض عن بُعد
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          حرّك إصبعك على الكارت الذهبي عشان تكشف الهدية اللي {senderName} تقدر تبعتها أو تعملها لحضرتك عن بُعد يا {recipientName}.
        </p>
      </div>

      {/* Scratch Card Container */}
      <div className="relative h-56 w-full overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50 via-white to-indigo-50 select-none shadow-xs">
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center space-y-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-xs">
            <Gift className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold text-amber-800">كوبون صلح عن بُعد</p>
          <h3 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            هدية أو طلب أونلاين لحد عندك 🎁
          </h3>
          <p className="max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm">
            بعتلك الكوبون ده من بعيد عشان تختار حاجة توصلك لحد باب بيتك أو أونلاين من {senderName}.
          </p>
        </div>

        {!revealed && (
          <canvas
            ref={canvasRef}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              isScratchingRef.current = true;
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (isScratchingRef.current) {
                scratchAt(e.clientX, e.clientY);
              }
            }}
            onPointerUp={() => {
              isScratchingRef.current = false;
            }}
            onPointerCancel={() => {
              isScratchingRef.current = false;
            }}
            className="absolute inset-0 h-full w-full cursor-pointer touch-none"
          />
        )}
      </div>

      {/* Interactive Remote Gift Picker after reveal */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 sm:p-5"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">
              اختار الهدية أو الطلب اللي تحب أوصله لحضرتك عن بُعد
            </h4>
            <p className="text-xs text-slate-600">اختيارك هيتسجل جوه شهادة الصلح النهائية</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {REMOTE_GIFT_OPTIONS.map((opt) => {
              const active = giftChoice === opt.label;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    onChangeGiftChoice(opt.label);
                  }}
                  className={`min-h-[48px] flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-right text-xs font-semibold transition-all ${
                    active
                      ? 'border-amber-600 bg-amber-100/80 text-amber-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-amber-700" />}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={giftDetails}
            onChange={(e) => onChangeGiftDetails(e.target.value)}
            placeholder="اكتب اسم الحاجة أو التفاصيل اللي تحبها (اختياري)..."
            className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-amber-600 focus:outline-none"
          />
        </motion.div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          disabled={!revealed}
          onClick={() => {
            soundEngine.playChime(3);
            onNext();
          }}
          className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-indigo-700 to-indigo-800 px-7 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-800 hover:to-indigo-900 disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-500 whitespace-nowrap"
        >
          <span>{revealed ? 'نوصل لحظة الصلح' : 'اخدش الكارت الأول'}</span>
          <ArrowLeft className="h-4 w-4" />
        </button>

        {!revealed && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playCelebration();
              onReveal();
            }}
            className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>كشف سريع بدون خدش</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
