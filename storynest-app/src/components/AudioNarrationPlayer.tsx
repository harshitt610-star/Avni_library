'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AudioNarrationPlayerProps {
  bookTitle: string;
  bookSynopsis?: string;
  bookSynopsisHindi?: string;
  chapterOneTitle?: string;
  chapterOneContentEn?: string;
  chapterOneContentHi?: string;
  audioPreviewUrl?: string;
  defaultVoice?: string;
}

export default function AudioNarrationPlayer({
  bookTitle,
  bookSynopsis,
  bookSynopsisHindi,
  chapterOneTitle,
  chapterOneContentEn,
  chapterOneContentHi,
  audioPreviewUrl,
  defaultVoice = 'barnaby-warm',
}: AudioNarrationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(135);
  const [narratorLang, setNarratorLang] = useState<'en' | 'hi'>('en');
  const [voicePersona, setVoicePersona] = useState<string>(defaultVoice);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeSentence, setActiveSentence] = useState<string>('');
  const [showTextFollowAlong, setShowTextFollowAlong] = useState(false);

  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Return narrative text
  const getNarrationText = () => {
    if (narratorLang === 'hi') {
      return (
        chapterOneContentHi ||
        bookSynopsisHindi ||
        `कहानी का नाम ${bookTitle} है। आइए हम इस जादुई दुनिया में चलें जहाँ हर पन्ना एक नया रोमांच लेकर आता है।`
      );
    }
    return (
      chapterOneContentEn ||
      bookSynopsis ||
      `Welcome to ${bookTitle}. Once upon a time, beneath a canopy of whispering stars, an unforgettable journey began.`
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAutoNarration();
    }
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  };

  const playAutoNarration = () => {
    // If custom audio preview url is present and user didn't switch to custom voice
    if (audioPreviewUrl && !audioRef.current) {
      const audio = new Audio(audioPreviewUrl);
      audioRef.current = audio;
      audio.playbackRate = playbackSpeed;
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      audio.ontimeupdate = () => {
        setCurrentTime(Math.round(audio.currentTime));
      };
      audio.play().catch(() => {
        // Fallback to TTS engine
        startSpeechSynthesis();
      });
      setIsPlaying(true);
      return;
    }

    startSpeechSynthesis();
  };

  const startSpeechSynthesis = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    window.speechSynthesis.cancel();
    const text = getNarrationText();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.rate = playbackSpeed;

    // Apply Persona Pitch & Tone
    if (voicePersona === 'luna-calm') {
      utterance.pitch = 1.15;
      utterance.rate = playbackSpeed * 0.9;
    } else if (voicePersona === 'leo-energetic') {
      utterance.pitch = 1.25;
      utterance.rate = playbackSpeed * 1.05;
    } else {
      // Barnaby warm storyteller
      utterance.pitch = 0.98;
      utterance.rate = playbackSpeed;
    }

    // Voice matching
    const voices = window.speechSynthesis.getVoices();
    if (narratorLang === 'hi') {
      const hiVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('IN'));
      if (hiVoice) utterance.voice = hiVoice;
      utterance.lang = 'hi-IN';
    } else {
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Arthur'))
      );
      if (preferred) utterance.voice = preferred;
      utterance.lang = 'en-US';
    }

    // Estimate total time
    const words = text.split(/\s+/).length;
    const estSeconds = Math.max(15, Math.round((words / (135 * playbackSpeed)) * 60));
    setDuration(estSeconds);
    setCurrentTime(0);

    // Sentence boundary tracking for real-time follow-along
    utterance.onboundary = (event) => {
      if (event.name === 'sentence' || event.name === 'word') {
        const textSlice = text.slice(event.charIndex, event.charIndex + 70);
        const sentenceEnd = textSlice.search(/[.!?।\n]/);
        if (sentenceEnd > 0) {
          setActiveSentence(textSlice.slice(0, sentenceEnd + 1).trim());
        } else {
          setActiveSentence(textSlice.trim());
        }
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      synthTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= estSeconds) return estSeconds;
          return prev + 1;
        });
      }, 1000);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveSentence('');
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
        synthTimerRef.current = null;
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
        synthTimerRef.current = null;
      }
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleCycleSpeed = () => {
    const speeds = [0.85, 1.0, 1.2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const next = speeds[nextIdx];
    setPlaybackSpeed(next);
    if (isPlaying) {
      pauseAudio();
      setTimeout(playAutoNarration, 100);
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="bg-white border border-[#ddeaf2] rounded-2xl p-4 sm:p-5 shadow-tactile-sm flex flex-col gap-3 transition-all hover:border-[#b1f0d6] w-full">
      {/* Top Header Row - Fully Responsive Flex */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[#2d6955] text-[22px] shrink-0">headphones</span>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-[#091b31] truncate">
              Audio Narration Sample
            </span>
            <span className="text-[10px] text-[#2d6955] font-bold flex items-center gap-1">
              <span>⚡ AI Auto-Voice Narrator</span>
            </span>
          </div>

          {isPlaying && (
            <span className="flex items-center gap-0.5 ml-1 shrink-0">
              <span className="w-1 h-3 bg-[#2d6955] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-4 bg-[#2d6955] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-2 bg-[#2d6955] rounded-full animate-bounce" />
            </span>
          )}
        </div>

        {/* Voice & Pace Controls Row */}
        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
          {/* Language Switch */}
          <button
            onClick={() => {
              const next = narratorLang === 'en' ? 'hi' : 'en';
              setNarratorLang(next);
              if (isPlaying) {
                pauseAudio();
                setTimeout(() => {
                  setNarratorLang(next);
                  playAutoNarration();
                }, 100);
              }
            }}
            title="Switch Narration Language"
            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#e9f6fd] text-[#203047] hover:bg-[#b1f0d6] transition-colors"
          >
            {narratorLang === 'en' ? '🗣️ EN' : '🗣️ हिंदी'}
          </button>

          {/* Voice Persona Picker */}
          <select
            value={voicePersona}
            onChange={(e) => {
              setVoicePersona(e.target.value);
              if (isPlaying) {
                pauseAudio();
                setTimeout(playAutoNarration, 100);
              }
            }}
            className="text-[10px] font-semibold py-1 px-1.5 rounded-lg border border-gray-200 bg-[#f4faff] text-[#091b31] focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none truncate"
          >
            <option value="barnaby-warm">🦉 Barnaby</option>
            <option value="luna-calm">🌙 Luna</option>
            <option value="leo-energetic">🚀 Leo</option>
          </select>

          {/* Speed Toggle */}
          <button
            onClick={handleCycleSpeed}
            title="Narration Pace"
            className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-gray-100 text-[#44474d] hover:bg-gray-200"
          >
            {playbackSpeed}x
          </button>

          <span className="text-[11px] text-[#75777e] font-mono whitespace-nowrap pl-0.5">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Main Interactive Player Track */}
      <div className="bg-[#e9f6fd] rounded-xl p-3 flex items-center gap-3 w-full">
        {/* Play / Pause Button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause narration' : 'Play auto narration'}
          className="w-10 h-10 rounded-full bg-[#203047] text-white flex items-center justify-center hover:bg-[#091b31] shadow-xs transition-transform active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[22px]">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Progress Track */}
        <div className="flex-1 min-w-0">
          <div
            className="h-2 bg-[#ddeaf2] rounded-full overflow-hidden cursor-pointer relative"
            title="Auto-narrated audio progress"
          >
            <div
              className="h-full bg-[#2d6955] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#44474d] mt-1.5 gap-2">
            <span className="font-mono font-semibold text-[#091b31] shrink-0">
              {formatTime(currentTime)}
            </span>
            <span className="truncate text-gray-600 font-medium text-[10px]">
              {chapterOneTitle ? `${chapterOneTitle} Narration` : 'Chapter 1 Intro Preview'}
            </span>
            <button
              onClick={() => setShowTextFollowAlong(!showTextFollowAlong)}
              className="text-[9px] uppercase font-bold text-[#2d6955] hover:underline shrink-0"
            >
              {showTextFollowAlong ? 'Hide Text' : 'Follow Along'}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Follow Along Text Bar */}
      {(showTextFollowAlong || isPlaying) && activeSentence && (
        <div className="p-2.5 rounded-xl bg-[#f0fbf6] border border-[#b1f0d6] text-xs text-[#002117] animate-fade-in flex items-start gap-2">
          <span className="material-symbols-outlined text-[#2d6955] text-[16px] shrink-0 mt-0.5">
            record_voice_over
          </span>
          <p className="font-serif-story italic leading-relaxed">
            &ldquo;{activeSentence}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
