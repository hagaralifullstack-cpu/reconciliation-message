'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Eraser } from 'lucide-react';
import { PROMISE_CARDS } from '@/lib/apology-data';
import { soundEngine } from '@/lib/sound';

interface PromisesSceneProps {
  selectedPromiseIds: string[];
  onChangePromises: (ids: string[]) => void;
  signatureDataUrl: string | null;
  onSaveSignature: (dataUrl: string | null) => void;
  onNext: () => void;
}

const INK_COLORS = [
  { id: 'navy', label: 'حبر كحلي', hex: '#1E1B4B', dot: 'bg-indigo-950' },
  { id: 'emerald', label: 'حبر زمردي', hex: '#065F46', dot: 'bg-emerald-800' },
  { id: 'gold', label: 'حبر ذهبي', hex: '#92400E', dot: 'bg-amber-800' },
];

export function PromisesScene({
  selectedPromiseIds,
  onChangePromises,
  signatureDataUrl,
  onSaveSignature,
  onNext,
}: PromisesSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const hasStrokeRef = useRef(Boolean(signatureDataUrl));
  const [hasSigned, setHasSigned] = useState(Boolean(signatureDataUrl));
  const [inkHex, setInkHex] = useState<string>('#1E1B4B');

  const readyToSign = selectedPromiseIds.length === 3;

  const togglePromise = (id: string) => {
    if (selectedPromiseIds.includes(id)) {
      soundEngine.playTap();
      onChangePromises(selectedPromiseIds.filter((item) => item !== id));
    } else if (selectedPromiseIds.length < 3) {
      soundEngine.playChime(selectedPromiseIds.length);
      onChangePromises([...selectedPromiseIds, id]);
    }
  };

  useEffect(() => {
    if (!readyToSign) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = inkHex;
    ctx.lineWidth = 2.8;

    if (signatureDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = signatureDataUrl;
    }
  }, [readyToSign, signatureDataUrl, inkHex]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = inkHex;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
    hasStrokeRef.current = true;
    setHasSigned(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasStrokeRef.current) {
      onSaveSignature(canvas.toDataURL('image/png'));
      soundEngine.playTap();
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokeRef.current = false;
    setHasSigned(false);
    onSaveSignature(null);
    soundEngine.playTap();
  };

  const selectedPromises = PROMISE_CARDS.filter((p) => selectedPromiseIds.includes(p.id));

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
          <span className="text-amber-700">٠٤ · برطمان الوعود</span>
          <span className="tabular-nums text-slate-500">
            اخترت {selectedPromiseIds.length} من ٣ وعود
          </span>
        </div>
        <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl [text-wrap:balance]">
          اختار ٣ وعود تحطهم في البرطمان
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          الاعتذار الحقيقي بيتشاف في الفعل، اختار ٣ التزامات تحب يكونوا عهد بينا بعد الموقف ده.
        </p>
      </div>

      {/* Cards + Jar Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        {/* Promise Cards */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:col-span-8">
          {PROMISE_CARDS.map((card) => {
            const isSelected = selectedPromiseIds.includes(card.id);
            const disabled = !isSelected && selectedPromiseIds.length >= 3;
            return (
              <button
                key={card.id}
                type="button"
                disabled={disabled}
                onClick={() => togglePromise(card.id)}
                className={`min-h-[84px] flex flex-col justify-between rounded-xl border p-3.5 text-right transition-all focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                  isSelected
                    ? 'border-indigo-700 bg-indigo-50/75 text-indigo-950 shadow-xs'
                    : disabled
                      ? 'cursor-not-allowed border-slate-200/60 bg-slate-50 text-slate-400'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-bold">{card.title}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-indigo-700" />}
                </div>
                <span className="mt-1 text-xs leading-relaxed text-slate-600">
                  {card.detail}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ornate Jar of Promises SVG */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200/70 bg-gradient-to-b from-amber-50/40 to-indigo-50/40 p-4 lg:col-span-4">
          <svg
            viewBox="0 0 160 195"
            className="h-44 w-36"
            role="img"
            aria-label={`برطمان الوعود فيه ${selectedPromiseIds.length} وعود`}
          >
            {/* Gold Jar Lid */}
            <rect x="44" y="14" width="72" height="14" rx="5" fill="#B45309" />
            <rect x="46" y="16" width="68" height="4" rx="2" fill="#F59E0B" opacity="0.6" />
            <rect x="50" y="28" width="60" height="9" rx="3" fill="#312E81" />
            {/* Ribbon Tie */}
            <path d="M 48 41 Q 80 47 112 41" fill="none" stroke="#D97706" strokeWidth="3.5" />
            <circle cx="80" cy="44" r="4" fill="#F59E0B" />
            {/* Glass Body */}
            <path
              d="M 48 39 L 112 39 C 127 43 134 55 134 74 L 134 160 C 134 173 123 181 108 181 L 52 181 C 37 181 26 173 26 160 L 26 74 C 26 55 33 43 48 39 Z"
              fill="#FFFFFF"
              stroke="#94A3B8"
              strokeWidth="2.2"
            />
            {/* Glass Sheen */}
            <path
              d="M 38 66 L 38 156"
              stroke="#E2E8F0"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 122 86 L 122 146"
              stroke="#F1F5F9"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Folded Promise Notes inside the Jar */}
            {selectedPromises.map((promise, idx) => {
              const positions = [
                { x: 54, y: 141, rot: -11, fill: '#4338CA' },
                { x: 98, y: 143, rot: 13, fill: '#047857' },
                { x: 76, y: 109, rot: -4, fill: '#B45309' },
              ];
              const pos = positions[idx];
              return (
                <motion.g
                  key={promise.id}
                  initial={{ y: -55, opacity: 0, scale: 0.7 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                >
                  <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rot})`}>
                    <rect
                      x="-21"
                      y="-13"
                      width="42"
                      height="26"
                      rx="5"
                      fill={pos.fill}
                    />
                    <line
                      x1="-12"
                      y1="-3"
                      x2="12"
                      y2="-3"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    <line
                      x1="-10"
                      y1="4"
                      x2="8"
                      y2="4"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      opacity="0.75"
                    />
                  </g>
                </motion.g>
              );
            })}
          </svg>
          <span className="mt-1 text-xs font-semibold text-slate-700">
            برطمان الوعود ({selectedPromiseIds.length}/٣)
          </span>
        </div>
      </div>

      {/* Signature Pad with Ink Color Selector */}
      {readyToSign && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 border-t border-slate-200 pt-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">لوحة التوقيع المعتمد</h3>
              <p className="text-xs text-slate-500">
                اختار لون الحبر وامضي بإصبعك لتأكيد الوعود في الشهادة
              </p>
            </div>

            <div className="flex items-center gap-2">
              {INK_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    setInkHex(color.hex);
                  }}
                  aria-label={color.label}
                  className={`min-h-[36px] inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    inkHex === color.hex
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full ${color.dot}`} />
                  <span className="hidden sm:inline">{color.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={clearSignature}
                className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>مسح</span>
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-dashed border-amber-400/70 bg-[#FFFDF7]">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="h-36 w-full cursor-crosshair touch-none"
            />
            {!hasSigned && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                ارسم توقيعك بإصبعك هنا
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="pt-1">
        <button
          type="button"
          disabled={!readyToSign || !hasSigned}
          onClick={() => {
            soundEngine.playChime(2);
            onNext();
          }}
          className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-indigo-700 to-indigo-800 px-7 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-800 hover:to-indigo-900 disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-500 whitespace-nowrap"
        >
          <span>
            {!readyToSign
              ? 'اختار ٣ وعود الأول'
              : !hasSigned
                ? 'امضي لتأكيد الوعود'
                : 'شوف كارت التعويض'}
          </span>
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
