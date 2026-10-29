'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface Question {
  id: string;
  questionEn: string;
  questionHi?: string;
  optionsEn: string[];
  optionsHi?: string[];
  correctIndex: number;
  explanation?: string;
}

interface CompanionQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: {
    _id: string;
    title: string;
    rewardStars: number;
    bookTitle: string;
    questions: Question[];
  };
}

export default function BookCompanionQuizModal({ isOpen, onClose, quiz }: CompanionQuizModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  if (!isOpen || !quiz || !quiz.questions || quiz.questions.length === 0) return null;

  const currentQ = quiz.questions[currentIdx];
  const isSelected = selectedAnswers[currentQ.id] !== undefined;
  const isLastQuestion = currentIdx === quiz.questions.length - 1;

  const handleSelectOption = (optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: optIdx });
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    setScore(correctCount);
    const passed = correctCount >= Math.ceil(quiz.questions.length * 0.5);
    const stars = passed ? quiz.rewardStars : Math.round(quiz.rewardStars * 0.4);
    setEarnedStars(stars);
    setSubmitted(true);
    setSubmitting(false);

    if (passed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    try {
      await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz._id,
          answers: selectedAnswers,
          userName: 'Young Reader',
        }),
      });
    } catch {
      // Quiet fail
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setEarnedStars(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-xl w-full shadow-tactile-xl max-h-[90vh] overflow-y-auto border border-[#b1f0d6]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-[#ffdea7] text-[#261800] flex items-center justify-center font-bold text-lg">
              🏆
            </span>
            <div>
              <h3 className="font-serif-story font-bold text-base sm:text-lg text-[#091b31]">
                {quiz.title}
              </h3>
              <p className="text-[11px] text-[#44474d]">
                Story: <span className="font-semibold text-[#091b31]">{quiz.bookTitle}</span> • Reward: +{quiz.rewardStars} Stars
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {!submitted ? (
          <div className="space-y-5">
            {/* Question Tracker */}
            <div className="flex items-center justify-between text-xs font-semibold text-[#2d6955]">
              <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
              <div className="flex gap-1.5">
                {quiz.questions.map((q, i) => (
                  <span
                    key={q.id || i}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentIdx
                        ? 'bg-[#203047] scale-125'
                        : selectedAnswers[q.id] !== undefined
                        ? 'bg-[#2d6955]'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-[#f4faff] border border-[#ddeaf2]">
              <h4 className="font-serif-story text-base sm:text-lg font-bold text-[#091b31] leading-snug">
                {currentQ.questionEn}
              </h4>
              {currentQ.questionHi && (
                <p className="text-sm font-serif-story text-[#2d6955] font-semibold mt-1.5">
                  {currentQ.questionHi}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.optionsEn.map((option, optIdx) => {
                const isChosen = selectedAnswers[currentQ.id] === optIdx;
                const optionHi = currentQ.optionsHi && currentQ.optionsHi[optIdx];
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center justify-between gap-3 ${
                      isChosen
                        ? 'bg-[#203047] text-white border-[#203047] shadow-tactile-sm'
                        : 'bg-white hover:bg-gray-50 text-[#091b31] border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isChosen ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#44474d]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <div>
                        <span>{option}</span>
                        {optionHi && (
                          <span className={`block text-[11px] ${isChosen ? 'text-[#ffdea7]' : 'text-[#2d6955]'}`}>
                            {optionHi}
                          </span>
                        )}
                      </div>
                    </div>
                    {isChosen && (
                      <span className="material-symbols-outlined text-[20px] text-[#b1f0d6]">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                ← Previous
              </button>

              {isLastQuestion ? (
                <button
                  disabled={!isSelected || submitting}
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-[#2d6955] text-white text-xs sm:text-sm font-bold hover:bg-[#205141] disabled:opacity-40 transition shadow-tactile flex items-center gap-2"
                >
                  <span>Submit &amp; Claim Stars</span>
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                </button>
              ) : (
                <button
                  disabled={!isSelected}
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-[#203047] text-white text-xs sm:text-sm font-bold hover:bg-[#091b31] disabled:opacity-40 transition shadow-tactile flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-[#b1f0d6] text-[#002117] flex items-center justify-center text-3xl mx-auto shadow-tactile">
              🌟
            </div>

            <div>
              <h4 className="font-serif-story text-2xl font-bold text-[#091b31]">
                Quiz Completed!
              </h4>
              <p className="text-xs text-[#44474d] mt-1">
                You got <span className="font-bold text-[#091b31]">{score}</span> out of{' '}
                <span className="font-bold text-[#091b31]">{quiz.questions.length}</span> questions correct!
              </p>
            </div>

            {/* Stars Award Banner */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffdea7] text-[#261800] text-sm font-bold shadow-tactile-sm">
              <span className="text-base">★</span>
              <span>+{earnedStars} Spark Stars Added to Your Profile!</span>
            </div>

            {/* Review questions summary */}
            <div className="text-left space-y-3 pt-3 border-t border-gray-100 max-h-48 overflow-y-auto">
              {quiz.questions.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <div key={q.id || idx} className="p-3 rounded-xl bg-[#f4faff] border border-gray-200 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#091b31]">Q{idx + 1}: {q.questionEn}</span>
                      <span className={isCorrect ? 'text-[#2d6955]' : 'text-red-500'}>
                        {isCorrect ? '✓ Correct' : '✕ Missed'}
                      </span>
                    </div>
                    {q.explanation && (
                      <p className="text-[11px] text-gray-500 mt-1 italic">{q.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Retake Quiz
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] transition shadow-tactile"
              >
                Close &amp; Continue Reading
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
