'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Check,
  Copy,
  Download,
  RotateCcw,
  Gift,
} from 'lucide-react';
import { MUTUAL_APOLOGY_PRESETS, PROMISE_CARDS } from '@/lib/apology-data';
import { soundEngine } from '@/lib/sound';

interface CertificateSceneProps {
  senderName: string;
  recipientName: string;
  selectedPromiseIds: string[];
  signatureDataUrl: string | null;
  giftChoice: string;
  giftDetails: string;
  mutualNote: string;
  onChangeMutualNote: (note: string) => void;
  onRestart: () => void;
}

const CLOSING_RATINGS = [
  { id: '100', label: 'صافي ١٠٠٪' },
  { id: 'fresh', label: 'صفحة جديدة تماماً' },
  { id: 'respect', label: 'الود والاحترام أغلى' },
];

export function CertificateScene({
  senderName,
  recipientName,
  selectedPromiseIds,
  signatureDataUrl,
  giftChoice,
  giftDetails,
  mutualNote,
  onChangeMutualNote,
  onRestart,
}: CertificateSceneProps) {
  const [issued, setIssued] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);
  const [closingBadge, setClosingBadge] = useState(CLOSING_RATINGS[0].label);

  const promises = PROMISE_CARDS.filter((p) => selectedPromiseIds.includes(p.id));
  const formattedDate = new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const giftSummary = giftDetails.trim()
    ? `${giftChoice || 'هدية عن بُعد من اختيارك'} (${giftDetails.trim()})`
    : giftChoice || 'هدية أو طلب أونلاين لحد عندك 🎁';

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playCelebration();
    setIssued(true);
  };

  const handleCopyReply = async () => {
    soundEngine.playChime(2);
    const text = `يا ${senderName}، قبلت اعتذارك وطلعنا شهادة الصلح الرسمية بتاعتنا (${closingBadge}). واختياري للتعويض عن بُعد هو: ${giftSummary}.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 3000);
    } catch {
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 3000);
    }
  };

  const handleDownloadImage = async () => {
    setDownloading(true);
    soundEngine.playChime(3);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 1720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Rich Parchment Ivory Background
      ctx.fillStyle = '#FFFDF7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer Royal Navy Frame
      ctx.strokeStyle = '#1E1B4B';
      ctx.lineWidth = 10;
      ctx.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);

      // Middle Gold Filigree Frame
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 4;
      ctx.strokeRect(64, 64, canvas.width - 128, canvas.height - 128);

      // Inner Fine Gold Line
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(78, 78, canvas.width - 156, canvas.height - 156);

      // Corner Gold Ornaments
      const corners = [
        [78, 78, 1, 1],
        [canvas.width - 78, 78, -1, 1],
        [78, canvas.height - 78, 1, -1],
        [canvas.width - 78, canvas.height - 78, -1, -1],
      ];
      ctx.fillStyle = '#B45309';
      corners.forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx * 18, cy + dy * 18, 9, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.direction = 'rtl';
      ctx.textAlign = 'center';

      // Serial & Header Emblem
      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('وثيقة مودة واحترام متبادل · رقم SOLH-2026', 700, 155);

      ctx.fillStyle = '#1E1B4B';
      ctx.font = 'bold 72px serif';
      ctx.fillText('شهادة صلح رسمية', 700, 248);

      // Gold Decorative Rule
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(420, 285);
      ctx.lineTo(980, 285);
      ctx.stroke();

      // Formal Attestation Statement
      ctx.fillStyle = '#334155';
      ctx.font = '28px sans-serif';
      ctx.fillText('تشهد هذه الوثيقة بتصفية النفوس وتجديد الود والاحترام بين', 700, 352);

      ctx.fillStyle = '#1E1B4B';
      ctx.font = 'bold 46px serif';
      ctx.fillText(`${senderName}   ✦   ${recipientName}`, 700, 424);

      ctx.fillStyle = '#64748B';
      ctx.font = '24px sans-serif';
      ctx.fillText(`تحريراً في ${formattedDate} · ${closingBadge}`, 700, 476);

      // Promises Box
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(130, 520, 1140, 300, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('الوعود الثلاثة المحفوظة في برطمان العهد', 700, 575);

      ctx.fillStyle = '#1E293B';
      ctx.font = '24px sans-serif';
      promises.forEach((p, idx) => {
        ctx.fillText(`✦  ${p.title}: ${p.detail}`, 700, 640 + idx * 54);
      });

      // Mutual Note Box
      ctx.fillStyle = '#FEFCE8';
      ctx.strokeStyle = '#FDE68A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(130, 855, 1140, 150, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 25px sans-serif';
      ctx.fillText(`كلمة ${recipientName} الختامية`, 700, 908);

      ctx.fillStyle = '#1E293B';
      ctx.font = '26px sans-serif';
      const noteDisplay = mutualNote.trim() || 'حصل خير، وربنا يديم الاحترام والتقدير.';
      ctx.fillText(`"${noteDisplay.slice(0, 74)}"`, 700, 962);

      // Remote Gift Voucher Banner
      ctx.fillStyle = '#EEF2FF';
      ctx.strokeStyle = '#A5B4FC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(180, 1045, 1040, 145, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#312E81';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`كوبون التعويض عن بُعد: ${giftSummary}`, 700, 1105);
      ctx.fillStyle = '#4338CA';
      ctx.font = '23px sans-serif';
      ctx.fillText(`هدية تصلك من ${senderName} لحد عندك`, 700, 1152);

      // Official Gold Seal Stamp in center bottom
      ctx.fillStyle = '#FEF3C7';
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(700, 1370, 92, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(700, 1370, 78, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('ميثاق مودة', 700, 1358);
      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('مُعتمد ✓', 700, 1396);

      // Signature Left & Sender Right
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`توقيع ${recipientName}`, 320, 1290);
      ctx.fillText(`تأكيد ${senderName}`, 1080, 1290);

      if (signatureDataUrl) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 170, 1310, 300, 120);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = signatureDataUrl;
        });
      }

      ctx.fillStyle = '#1E1B4B';
      ctx.font = 'bold 34px serif';
      ctx.fillText(senderName, 1080, 1380);

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(200, 1445);
      ctx.lineTo(440, 1445);
      ctx.moveTo(960, 1445);
      ctx.lineTo(1200, 1445);
      ctx.stroke();

      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('✦ ربنا يديم المعروف والاحترام دايماً ✦', 700, 1580);

      const link = document.createElement('a');
      link.download = `shihadat-solh-${recipientName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  if (!issued) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-indigo-100 bg-white p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-700">٠٧ · ونعتذر لبعض</p>
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl [text-wrap:balance]">
            &ldquo;وأنا كمان آسف لو..&rdquo;
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            يا {recipientName}، لو في حاجة تحب تقولها في ختام الصلح اختار من الكروت أو اكتب كلمتك عشان تتحط جوه الشهادة الرسمية.
          </p>
        </div>

        <form onSubmit={handleIssue} className="space-y-5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {MUTUAL_APOLOGY_PRESETS.map((preset) => {
              const active = mutualNote === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    onChangeMutualNote(preset);
                  }}
                  className={`min-h-[60px] flex items-center justify-between gap-3 rounded-xl border p-3.5 text-right text-sm transition-all ${
                    active
                      ? 'border-indigo-700 bg-indigo-50/75 font-semibold text-indigo-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="leading-relaxed">{preset}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-indigo-700" />}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mutual-note" className="block text-xs font-medium text-slate-600">
              أو اكتب جملة من عندك (اختياري)
            </label>
            <textarea
              id="mutual-note"
              rows={2}
              value={mutualNote}
              onChange={(e) => onChangeMutualNote(e.target.value)}
              placeholder="مثال: حصل خير، ومقامك محفوظ دايماً..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-700">تقييم ختام الصلح</span>
            <div className="grid grid-cols-3 gap-2">
              {CLOSING_RATINGS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    setClosingBadge(r.label);
                  }}
                  className={`min-h-[44px] rounded-xl border px-2 py-2 text-xs font-semibold transition-all ${
                    closingBadge === r.label
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="min-h-[50px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-600 via-amber-700 to-indigo-800 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:opacity-95 active:scale-[0.99] whitespace-nowrap"
          >
            <Award className="h-4 w-4" />
            <span>إصدار شهادة الصلح الرسمية</span>
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* True Ornate Official Certificate */}
      <div className="relative overflow-hidden rounded-2xl border-[3px] border-indigo-950 bg-[#FFFDF7] p-2.5 sm:p-3.5 shadow-md">
        <div className="relative rounded-xl border-2 border-amber-600/80 p-1">
          <div className="relative rounded-lg border border-amber-500/50 bg-[#FFFDF7] px-4 py-6 sm:px-8 sm:py-8 space-y-6">
            {/* Decorative SVG Corner Flourishes */}
            <svg className="pointer-events-none absolute top-2 right-2 h-8 w-8 text-amber-700/70" viewBox="0 0 32 32" fill="none">
              <path d="M30 2 H10 C5 2 2 5 2 10 V30" stroke="currentColor" strokeWidth="2" />
              <circle cx="10" cy="10" r="2.5" fill="currentColor" />
            </svg>
            <svg className="pointer-events-none absolute top-2 left-2 h-8 w-8 text-amber-700/70" viewBox="0 0 32 32" fill="none">
              <path d="M2 2 H22 C27 2 30 5 30 10 V30" stroke="currentColor" strokeWidth="2" />
              <circle cx="22" cy="10" r="2.5" fill="currentColor" />
            </svg>
            <svg className="pointer-events-none absolute bottom-2 right-2 h-8 w-8 text-amber-700/70" viewBox="0 0 32 32" fill="none">
              <path d="M30 30 H10 C5 30 2 27 2 22 V2" stroke="currentColor" strokeWidth="2" />
              <circle cx="10" cy="22" r="2.5" fill="currentColor" />
            </svg>
            <svg className="pointer-events-none absolute bottom-2 left-2 h-8 w-8 text-amber-700/70" viewBox="0 0 32 32" fill="none">
              <path d="M2 30 H22 C27 30 30 27 30 22 V2" stroke="currentColor" strokeWidth="2" />
              <circle cx="22" cy="22" r="2.5" fill="currentColor" />
            </svg>

            {/* Top Official Emblem & Serial */}
            <div className="border-b border-amber-200/90 pb-5 text-center space-y-2.5">
              <p className="text-[11px] font-semibold tracking-wide text-amber-800">
                وثيقة مودة واحترام متبادل · رقم SOLH-2026
              </p>

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-800">
                <Award className="h-6 w-6" />
              </div>

              <h2 className="font-display text-3xl font-bold text-indigo-950 sm:text-5xl">
                شهادة صلح رسمية
              </h2>

              <p className="text-xs sm:text-sm text-slate-600">
                تشهد هذه الوثيقة بتصفية النفوس وإغلاق باب الزعل بين
              </p>

              <p className="font-display text-2xl font-bold text-indigo-900 sm:text-3xl">
                {senderName} <span className="mx-2 text-amber-600">✦</span> {recipientName}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-500">
                <span>تحريراً في {formattedDate}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-emerald-800">{closingBadge}</span>
              </div>
            </div>

            {/* Promises Grid */}
            <div className="space-y-2.5">
              <h3 className="text-center text-xs font-bold text-amber-900">
                الوعود الثلاثة المحفوظة في برطمان العهد
              </h3>
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {promises.map((promise) => (
                  <li
                    key={promise.id}
                    className="rounded-xl border border-amber-200/80 bg-white p-3 text-right shadow-2xs"
                  >
                    <p className="text-xs font-bold text-indigo-950">{promise.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                      {promise.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Khaled's Closing Words */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/45 p-4 text-center space-y-1">
              <p className="text-xs font-bold text-amber-900">كلمة {recipientName} الختامية</p>
              <p className="font-display text-lg leading-relaxed text-slate-800">
                &ldquo;{mutualNote.trim() || 'حصل خير، وربنا يديم الاحترام والتقدير.'}&rdquo;
              </p>
            </div>

            {/* Chosen Remote Gift Voucher */}
            <div className="flex items-center justify-center gap-3 rounded-xl border border-indigo-200 bg-gradient-to-l from-indigo-50/80 via-white to-amber-50/60 p-4 text-right">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-900 text-amber-300">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-800">
                  كوبون التعويض عن بُعد من {senderName}
                </p>
                <p className="text-sm font-bold text-slate-900">{giftSummary}</p>
              </div>
            </div>

            {/* Official Bottom Signatures & Gold Wax Seal */}
            <div className="grid grid-cols-1 gap-5 border-t border-amber-200/90 pt-5 sm:grid-cols-3 sm:items-center">
              <div className="flex flex-col items-center justify-center space-y-1 text-center">
                <span className="text-[11px] font-semibold text-slate-500">توقيع {recipientName}</span>
                {signatureDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={signatureDataUrl}
                    alt="توقيع الموافقة على الصلح"
                    className="h-14 w-auto object-contain"
                  />
                ) : (
                  <span className="font-display text-xl font-bold text-indigo-950">
                    {recipientName}
                  </span>
                )}
                <div className="h-px w-32 bg-slate-300" />
              </div>

              <div className="flex flex-col items-center justify-center">
                <svg viewBox="0 0 110 110" className="h-24 w-24" role="img" aria-label="ختم الصلح المعتمد">
                  <circle cx="55" cy="55" r="46" fill="#FEF3C7" stroke="#B45309" strokeWidth="2.5" />
                  <circle
                    cx="55"
                    cy="55"
                    r="39"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <text
                    x="55"
                    y="48"
                    textAnchor="middle"
                    fill="#92400E"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    ميثاق مودة
                  </text>
                  <text
                    x="55"
                    y="67"
                    textAnchor="middle"
                    fill="#065F46"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    مُعتمد ✓
                  </text>
                </svg>
              </div>

              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <span className="text-[11px] font-semibold text-slate-500">تأكيد {senderName}</span>
                <span className="font-display text-2xl font-bold text-indigo-950">
                  {senderName}
                </span>
                <div className="h-px w-32 bg-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={downloading}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-indigo-700 to-indigo-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:opacity-95 active:scale-[0.99] whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            <span>{downloading ? 'جاري تجهيز الصورة...' : 'حفظ الشهادة كصورة رسمية'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyReply}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-950 hover:bg-amber-100/70 whitespace-nowrap"
          >
            {copiedReply ? (
              <>
                <Check className="h-4 w-4 text-emerald-700" />
                <span className="text-emerald-800">تم نسخ رسالة الرد</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-amber-700" />
                <span>نسخ رد الصلح لـ {senderName}</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playTap();
            onRestart();
          }}
          className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
        >
          <RotateCcw className="h-4 w-4" />
          <span>إعادة الرحلة</span>
        </button>
      </div>
    </motion.div>
  );
}
