'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, ArrowLeft, PenLine, HeartHandshake, FileDown } from 'lucide-react';
import { JourneyConfig, MISTAKE_PRESETS, buildShareUrl } from '@/lib/apology-data';
import { soundEngine } from '@/lib/sound';

interface SetupSceneProps {
  config: JourneyConfig;
  onChange: (next: JourneyConfig) => void;
  onStart: () => void;
}

export function SetupScene({ config, onChange, onStart }: SetupSceneProps) {
  const [copied, setCopied] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('sincere');

  const handleSelectPreset = (id: string, text: string) => {
    soundEngine.playTap();
    setSelectedPresetId(id);
    onChange({ ...config, mistake: text });
  };

  const handleCopyLink = async () => {
    soundEngine.playChime(2);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = buildShareUrl(origin, config);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownloadHtml = () => {
    soundEngine.playChime(1);
    const params = new URLSearchParams();
    if (config.senderName.trim()) params.set('from', config.senderName.trim());
    if (config.recipientName.trim()) params.set('to', config.recipientName.trim());
    if (config.mistake.trim()) params.set('mistake', config.mistake.trim());
    if (config.specialMemory.trim()) params.set('memory', config.specialMemory.trim());
    const link = document.createElement('a');
    link.href = `/api/export-html?${params.toString()}`;
    link.download = 'index.html';
    link.click();
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playChime(0);
    onStart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-indigo-100 bg-white p-6 sm:p-8 shadow-sm"
    >
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold text-amber-700">
          ٠١ · تجهيز الرسالة
        </p>
        <h1 className="font-display text-3xl font-bold leading-snug text-slate-900 sm:text-4xl [text-wrap:balance]">
          رحلة اعتذار صادقة من القلب
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          كل حاجة متجهزة باحترام ومودة، تقدري تعدّلي الكلام براحتك وبعدها تبدأي الرحلة أو تبعتي اللينك لـ{' '}
          <span className="font-semibold text-indigo-900">{config.recipientName || 'خالد'}</span>{' '}
          يفتح على الاعتراف على طول.
        </p>
      </div>

      <form onSubmit={handleStart} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="sender-name" className="block text-sm font-medium text-slate-800">
              اسمك
            </label>
            <input
              id="sender-name"
              type="text"
              value={config.senderName}
              onChange={(e) => onChange({ ...config, senderName: e.target.value })}
              placeholder="مثال: حبيبه"
              className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="recipient-name" className="block text-sm font-medium text-slate-800">
              اسم الشخص الغالي
            </label>
            <input
              id="recipient-name"
              type="text"
              value={config.recipientName}
              onChange={(e) => onChange({ ...config, recipientName: e.target.value })}
              placeholder="مثال: خالد"
              className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">اختاري صيغة الغلطة أو اكتبيها بطريقتك</span>
            <span className="text-xs text-slate-500">عامية مصرية محترمة</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {MISTAKE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id && config.mistake === preset.text;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id, preset.text)}
                  className={`min-h-[52px] rounded-xl border p-3.5 text-right transition-all focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{preset.title}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-indigo-700" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5 pt-1">
            <label htmlFor="mistake-text" className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <PenLine className="h-3.5 w-3.5 text-indigo-600" />
              <span>نص الاعتراف اللي هيظهر في أول مشهد</span>
            </label>
            <textarea
              id="mistake-text"
              rows={6}
              value={config.mistake}
              onChange={(e) => {
                setSelectedPresetId('custom');
                onChange({ ...config, mistake: e.target.value });
              }}
              placeholder="اكتبي هنا اللي حابة تعترفي بيه..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-slate-900 transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="memory-text" className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <HeartHandshake className="h-3.5 w-3.5 text-amber-600" />
              <span>حاجة حلوة بتقدّريها فيه (بتظهر جوه ظرف الاعتراف)</span>
            </label>
            <input
              id="memory-text"
              type="text"
              value={config.specialMemory}
              onChange={(e) => onChange({ ...config, specialMemory: e.target.value })}
              placeholder="مثال: جدعنتك ووقفتك جنبي ومكانتك الغالية..."
              className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center">
          <button
            type="submit"
            className="min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-indigo-700 to-indigo-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:from-indigo-800 hover:to-indigo-900 active:scale-[0.99] whitespace-nowrap"
          >
            <span>ابدأ الرحلة دلوقتي</span>
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/70 px-5 py-3 text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-100/70 active:scale-[0.99] whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-700" />
                <span className="text-emerald-800">تم نسخ اللينك لـ {config.recipientName || 'خالد'}</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-amber-700" />
                <span>نسخ رابط الإرسال لـ {config.recipientName || 'خالد'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.99] whitespace-nowrap"
            title="تنزيل نسخة ملف واحد HTML/CSS/JS جاهزة للرفع على GitHub Pages"
          >
            <FileDown className="h-4 w-4 text-indigo-700" />
            <span>تنزيل index.html لـ GitHub Pages</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
