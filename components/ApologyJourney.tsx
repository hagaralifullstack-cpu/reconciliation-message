'use client';

import React, { useCallback, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  Volume2,
  VolumeX,
  ArrowRight,
  Music,
  CloudRain,
} from 'lucide-react';
import {
  DEFAULT_CONFIG,
  FeelingChoice,
  JourneyConfig,
  REMOTE_GIFT_OPTIONS,
  SCENE_LABELS,
  UpsetLevel,
} from '@/lib/apology-data';
import { AmbientMode, soundEngine } from '@/lib/sound';
import { CharacterStage, StageMood } from './CharacterStage';
import { ConfettiOverlay } from './ConfettiOverlay';
import { SetupScene } from './scenes/SetupScene';
import { ConfessionScene } from './scenes/ConfessionScene';
import { EmpathyScene } from './scenes/EmpathyScene';
import { NoExcusesScene } from './scenes/NoExcusesScene';
import { PromisesScene } from './scenes/PromisesScene';
import { CompensationScene } from './scenes/CompensationScene';
import { ReconciliationScene } from './scenes/ReconciliationScene';
import { CertificateScene } from './scenes/CertificateScene';

interface ApologyJourneyProps {
  initialConfig?: JourneyConfig;
  initialScene?: number;
}

export function ApologyJourney({
  initialConfig = DEFAULT_CONFIG,
  initialScene = 0,
}: ApologyJourneyProps) {
  const [config, setConfig] = useState<JourneyConfig>(initialConfig);
  const [scene, setScene] = useState<number>(initialScene);
  const [muted, setMuted] = useState<boolean>(false);
  const [ambientMode, setAmbientMode] = useState<AmbientMode>('off');

  // Journey interactive state
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingChoice | null>(null);
  const [upsetLevel, setUpsetLevel] = useState<UpsetLevel>(2);
  const [remainingExcuses, setRemainingExcuses] = useState<number>(5);
  const [selectedPromiseIds, setSelectedPromiseIds] = useState<string[]>([]);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [couponRevealed, setCouponRevealed] = useState<boolean>(false);
  const [giftChoice, setGiftChoice] = useState<string>(REMOTE_GIFT_OPTIONS[0].label);
  const [giftDetails, setGiftDetails] = useState<string>('');
  const [approachProgress, setApproachProgress] = useState<number>(0);
  const [reconciled, setReconciled] = useState<boolean>(false);
  const [mutualNote, setMutualNote] = useState<string>('');

  const handleAmbientChange = (mode: AmbientMode) => {
    if (mode !== 'off' && muted) {
      setMuted(false);
      soundEngine.setMuted(false);
    }
    setAmbientMode(mode);
    soundEngine.setAmbientMode(mode);
  };

  const cycleAmbientMode = () => {
    const order: AmbientMode[] = ['off', 'music', 'nature'];
    const next = order[(order.indexOf(ambientMode) + 1) % order.length];
    handleAmbientChange(next);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playTap();
    }
  };

  const resetJourneyState = useCallback((goToSetup = false) => {
    setSelectedFeeling(null);
    setUpsetLevel(2);
    setRemainingExcuses(5);
    setSelectedPromiseIds([]);
    setSignatureDataUrl(null);
    setCouponRevealed(false);
    setGiftChoice(REMOTE_GIFT_OPTIONS[0].label);
    setGiftDetails('');
    setApproachProgress(0);
    setReconciled(false);
    setMutualNote('');
    setScene(goToSetup ? 0 : 1);
  }, []);

  const stageMood: StageMood =
    scene === 0
      ? 'setup'
      : scene === 1
        ? 'confession'
        : scene === 2
          ? 'empathy'
          : scene === 3
            ? 'no-excuses'
            : scene === 4
              ? 'promises'
              : scene === 5
                ? 'compensation'
                : scene === 6
                  ? reconciled
                    ? 'reconciled'
                    : 'reconciling'
                  : 'reconciled';

  const senderCaption =
    scene === 1
      ? 'أنا غلطت وحقك عليا'
      : scene === 2 && selectedFeeling
        ? 'مقدّرة زعلك جداً'
        : scene === 3
          ? remainingExcuses === 0
            ? 'أنا آسفة بجد'
            : 'مفيش أي مبرر'
          : scene === 4
            ? 'دي وعودي ليك'
            : scene === 5
              ? 'هدية توصلك عن بُعد'
              : scene === 6
                ? reconciled
                  ? 'شكراً إنك صافي'
                  : 'قرب خطوة كمان'
                : scene === 7
                  ? 'ربنا يديم الود'
                  : undefined;

  const recipientCaption =
    scene === 2 && selectedFeeling
      ? selectedFeeling === 'bothered'
        ? 'اتضايقت بصراحة'
        : selectedFeeling === 'hurt'
          ? 'اتجرحت من الموقف'
          : 'اتعصبت وقتها'
      : scene === 5 && couponRevealed
        ? 'تم اختيار الهدية'
        : scene === 6 && reconciled
          ? 'حصل خير يا غالية'
          : scene === 7
            ? 'ميثاق مودة واحترام'
            : undefined;

  const progressRatio = scene === 0 ? 0 : Math.round((scene / 7) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/25 to-amber-50/25 text-slate-900 flex flex-col">
      <ConfettiOverlay active={reconciled && scene === 6} />

      {/* Compact Top Navigation Bar */}
      <header className="sticky top-0 z-30 h-14 border-b border-indigo-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              setScene(0);
            }}
            className="font-display text-2xl font-bold text-indigo-950 whitespace-nowrap shrink-0 hover:text-amber-700 transition-colors"
          >
            رسالة صلح
          </button>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 truncate">
            <span className="font-semibold text-indigo-900">{SCENE_LABELS[scene]}</span>
            {scene > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{scene} من ٧</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {scene > 0 && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  setScene(scene - 1);
                }}
                aria-label="الرجوع للخطوة السابقة"
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {scene > 0 && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  setScene(0);
                }}
                className="hidden sm:inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-700" />
                <span>تعديل الرسالة</span>
              </button>
            )}

            {/* Ambient Music / Nature Sound Toggle */}
            <button
              type="button"
              onClick={cycleAmbientMode}
              aria-label="تبديل موسيقى الخلفية أو صوت الطبيعة"
              title={
                ambientMode === 'off'
                  ? 'تشغيل خلفية صوتية هادئة'
                  : ambientMode === 'music'
                    ? 'موسيقى هادئة شغالة (اضغط للتغيير لصوت الطبيعة)'
                    : 'صوت طبيعة شغال (اضغط للإيقاف)'
              }
              className={`min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                ambientMode === 'music'
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                  : ambientMode === 'nature'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {ambientMode === 'nature' ? (
                <CloudRain className="h-4 w-4 text-emerald-700" />
              ) : (
                <Music className={`h-4 w-4 ${ambientMode === 'music' ? 'text-indigo-700' : 'text-slate-500'}`} />
              )}
              <span className="hidden md:inline">
                {ambientMode === 'off'
                  ? 'صوت هادئ'
                  : ambientMode === 'music'
                    ? 'موسيقى'
                    : 'طبيعة'}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              {muted ? (
                <VolumeX className="h-4 w-4 text-slate-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-indigo-700" />
              )}
            </button>
          </div>
        </div>

        {scene > 0 && (
          <div className="h-0.5 w-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-l from-amber-500 via-indigo-600 to-emerald-600 transition-all duration-300"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Responsive Stage */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <aside className="space-y-4 lg:col-span-5 lg:sticky lg:top-20">
            <CharacterStage
              senderName={config.senderName || 'حبيبه'}
              recipientName={config.recipientName || 'خالد'}
              mood={stageMood}
              approachProgress={approachProgress}
              senderCaption={senderCaption}
              recipientCaption={recipientCaption}
            />

            <nav
              aria-label="مراحل الرحلة"
              className="hidden lg:block rounded-2xl border border-indigo-100 bg-white p-4 shadow-xs"
            >
              <p className="mb-3 text-xs font-semibold text-amber-800">محطات الرحلة</p>
              <ol className="space-y-1.5">
                {SCENE_LABELS.slice(1).map((label, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = scene === stepNum;
                  const isCompleted = scene > stepNum;
                  return (
                    <li
                      key={label}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50 font-bold text-indigo-950'
                          : isCompleted
                            ? 'text-emerald-800'
                            : 'text-slate-500'
                      }`}
                    >
                      <span>
                        0{stepNum}. {label}
                      </span>
                      <span className="text-[11px] font-semibold">
                        {isCurrent ? 'الآن' : isCompleted ? 'تمت ✓' : ''}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>

          <section className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {scene === 0 && (
                <SetupScene
                  key="setup"
                  config={config}
                  onChange={setConfig}
                  onStart={() => resetJourneyState(false)}
                />
              )}

              {scene === 1 && (
                <ConfessionScene
                  key="confession"
                  senderName={config.senderName || 'حبيبه'}
                  recipientName={config.recipientName || 'خالد'}
                  mistake={config.mistake}
                  specialMemory={config.specialMemory}
                  ambientMode={ambientMode}
                  onChangeAmbientMode={handleAmbientChange}
                  onNext={() => setScene(2)}
                />
              )}

              {scene === 2 && (
                <EmpathyScene
                  key="empathy"
                  senderName={config.senderName || 'حبيبه'}
                  recipientName={config.recipientName || 'خالد'}
                  selectedFeeling={selectedFeeling}
                  upsetLevel={upsetLevel}
                  onSelectFeeling={setSelectedFeeling}
                  onSelectUpsetLevel={setUpsetLevel}
                  onNext={() => setScene(3)}
                />
              )}

              {scene === 3 && (
                <NoExcusesScene
                  key="no-excuses"
                  recipientName={config.recipientName || 'خالد'}
                  onPopUpdate={setRemainingExcuses}
                  onNext={() => setScene(4)}
                />
              )}

              {scene === 4 && (
                <PromisesScene
                  key="promises"
                  selectedPromiseIds={selectedPromiseIds}
                  onChangePromises={setSelectedPromiseIds}
                  signatureDataUrl={signatureDataUrl}
                  onSaveSignature={setSignatureDataUrl}
                  onNext={() => setScene(5)}
                />
              )}

              {scene === 5 && (
                <CompensationScene
                  key="compensation"
                  senderName={config.senderName || 'حبيبه'}
                  recipientName={config.recipientName || 'خالد'}
                  revealed={couponRevealed}
                  giftChoice={giftChoice}
                  giftDetails={giftDetails}
                  onReveal={() => setCouponRevealed(true)}
                  onChangeGiftChoice={setGiftChoice}
                  onChangeGiftDetails={setGiftDetails}
                  onNext={() => setScene(6)}
                />
              )}

              {scene === 6 && (
                <ReconciliationScene
                  key="reconciliation"
                  senderName={config.senderName || 'حبيبه'}
                  recipientName={config.recipientName || 'خالد'}
                  reconciled={reconciled}
                  onProgressChange={setApproachProgress}
                  onReconcile={() => setReconciled(true)}
                  onNext={() => setScene(7)}
                />
              )}

              {scene === 7 && (
                <CertificateScene
                  key="certificate"
                  senderName={config.senderName || 'حبيبه'}
                  recipientName={config.recipientName || 'خالد'}
                  selectedPromiseIds={selectedPromiseIds}
                  signatureDataUrl={signatureDataUrl}
                  giftChoice={giftChoice}
                  giftDetails={giftDetails}
                  mutualNote={mutualNote}
                  onChangeMutualNote={setMutualNote}
                  onRestart={() => resetJourneyState(true)}
                />
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
}
