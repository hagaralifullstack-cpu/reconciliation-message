'use client';

export type AmbientMode = 'off' | 'music' | 'nature';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private lastScratchTime = 0;

  // Ambient soundscape state
  private ambientMode: AmbientMode = 'off';
  private ambientGain: GainNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private natureSource: AudioBufferSourceNode | null = null;
  private natureLfo: OscillatorNode | null = null;
  private chordIndex = 0;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined' || this.muted) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (mute) {
      this.stopAmbientNodes();
    } else if (this.ambientMode !== 'off') {
      this.startAmbient(this.ambientMode);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setAmbientMode(mode: AmbientMode) {
    this.ambientMode = mode;
    this.stopAmbientNodes();
    if (mode !== 'off' && !this.muted) {
      this.startAmbient(mode);
    }
  }

  public getAmbientMode(): AmbientMode {
    return this.ambientMode;
  }

  private stopAmbientNodes() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.natureSource) {
      try {
        this.natureSource.stop();
        this.natureSource.disconnect();
      } catch {
        // Ignore already stopped
      }
      this.natureSource = null;
    }
    if (this.natureLfo) {
      try {
        this.natureLfo.stop();
        this.natureLfo.disconnect();
      } catch {
        // Ignore already stopped
      }
      this.natureLfo = null;
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch {
        // Ignore
      }
      this.ambientGain = null;
    }
  }

  private startAmbient(mode: AmbientMode) {
    const ctx = this.getContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
    masterGain.connect(ctx.destination);
    this.ambientGain = masterGain;

    if (mode === 'music') {
      // Gentle warm ambient piano-pad progression (Cmaj9 -> Am9 -> Fmaj7 -> G6)
      const chords = [
        [261.63, 329.63, 392.0, 493.88],
        [220.0, 261.63, 329.63, 392.0],
        [174.61, 261.63, 329.63, 440.0],
        [196.0, 293.66, 329.63, 493.88],
      ];

      const playSoftChord = () => {
        if (!this.ambientGain || this.muted || this.ambientMode !== 'music') return;
        const currentChord = chords[this.chordIndex % chords.length];
        this.chordIndex += 1;

        currentChord.forEach((freq, idx) => {
          const start = ctx.currentTime + idx * 0.28;
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const noteGain = ctx.createGain();

          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, start);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(950, start);

          noteGain.gain.setValueAtTime(0.0001, start);
          noteGain.gain.linearRampToValueAtTime(0.028, start + 0.6);
          noteGain.gain.exponentialRampToValueAtTime(0.0008, start + 4.4);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.ambientGain!);

          osc.start(start);
          osc.stop(start + 4.5);
        });
      };

      playSoftChord();
      this.musicTimer = setInterval(playSoftChord, 4200);
    } else if (mode === 'nature') {
      // Soft evening rain / gentle breeze synthesized via pink-filtered noise
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.963 * b1 + white * 0.2965164;
        b2 = 0.57 * b2 + white * 1.0526913;
        output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.04;
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(680, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.28, ctx.currentTime);

      // Gentle breeze swell LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.14, ctx.currentTime);
      lfoGain.gain.setValueAtTime(180, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      source.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(masterGain);

      source.start();
      lfo.start();
      this.natureSource = source;
      this.natureLfo = lfo;
    }
  }

  public playTap() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playChime(pitchIndex = 0) {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [440, 523.25, 587.33, 659.25, 783.99];
    const freq = notes[pitchIndex % notes.length];
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playPop(remaining: number) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const baseFreq = 320 + (5 - remaining) * 75;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.9, now + 0.09);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playScratchTick() {
    const nowMs = Date.now();
    if (nowMs - this.lastScratchTime < 75) return;
    this.lastScratchTime = nowMs;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900 + Math.random() * 400, now);
    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  public playHoldPulse(progress: number) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 280 + progress * 340;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playCelebration() {
    const ctx = this.getContext();
    if (!ctx) return;
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.78);
    });
  }
}

export const soundEngine = new SoundEngine();
