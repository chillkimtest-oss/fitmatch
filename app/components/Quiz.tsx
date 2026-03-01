'use client';

import { useState } from 'react';
import type { Goal, Style, FeedbackStyle, Structure, CheckinFrequency } from '@/src/lib/score';

export type Experience = 'beginner' | 'intermediate' | 'advanced';

export interface QuizAnswers {
  goal?: Goal;
  style?: Style;
  feedback?: FeedbackStyle;
  structure?: Structure;
  checkins?: CheckinFrequency;
  experience?: Experience;
}

interface Option<T extends string> {
  value: T;
  label: string;
  description: string;
}

interface Question<K extends keyof QuizAnswers> {
  id: K;
  question: string;
  options: Option<NonNullable<QuizAnswers[K]>>[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QUESTIONS: Question<any>[] = [
  {
    id: 'goal',
    question: "What's your main fitness goal?",
    options: [
      { value: 'weight_loss', label: 'Weight Loss', description: 'Burn fat and slim down' },
      { value: 'muscle_gain', label: 'Muscle Gain', description: 'Build strength and size' },
      { value: 'endurance', label: 'Endurance', description: 'Go longer and stronger' },
      { value: 'flexibility', label: 'Flexibility', description: 'Move better, feel free' },
      { value: 'general_fitness', label: 'General Fitness', description: 'Stay healthy and active' },
    ],
  },
  {
    id: 'style',
    question: 'What training style suits you?',
    options: [
      { value: 'high_intensity', label: 'High Intensity', description: 'Push to your limits' },
      { value: 'low_impact', label: 'Low Impact', description: 'Gentle on your joints' },
      { value: 'strength', label: 'Strength Training', description: 'Lift heavy, get strong' },
      { value: 'cardio', label: 'Cardio', description: 'Keep your heart pumping' },
      { value: 'yoga', label: 'Yoga', description: 'Mind-body balance' },
    ],
  },
  {
    id: 'feedback',
    question: 'How do you like to receive feedback?',
    options: [
      { value: 'detailed', label: 'Detailed', description: 'Full analysis and breakdowns' },
      { value: 'brief', label: 'Brief', description: 'Quick, to the point' },
      { value: 'motivational', label: 'Motivational', description: 'Encouragement and energy' },
      { value: 'technical', label: 'Technical', description: 'Data-driven insights' },
    ],
  },
  {
    id: 'structure',
    question: 'What program structure works for you?',
    options: [
      { value: 'strict', label: 'Strict', description: 'Precise plan, no deviations' },
      { value: 'flexible', label: 'Flexible', description: 'Adapt as you go' },
      { value: 'mixed', label: 'Mixed', description: 'Structured but adaptable' },
    ],
  },
  {
    id: 'checkins',
    question: 'How often do you want to check in?',
    options: [
      { value: 'daily', label: 'Daily', description: 'Stay on track every day' },
      { value: 'weekly', label: 'Weekly', description: 'Review progress each week' },
      { value: 'biweekly', label: 'Bi-weekly', description: 'Every two weeks' },
      { value: 'monthly', label: 'Monthly', description: 'Big-picture check-ins' },
    ],
  },
  {
    id: 'experience',
    question: "What's your fitness experience level?",
    options: [
      { value: 'beginner', label: 'Beginner', description: 'New to structured training' },
      { value: 'intermediate', label: 'Intermediate', description: 'Some training background' },
      { value: 'advanced', label: 'Advanced', description: 'Years of consistent training' },
    ],
  },
] satisfies Question<keyof QuizAnswers>[];

const TOTAL = QUESTIONS.length;

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const isDone = step >= TOTAL;
  const current = QUESTIONS[step];

  function handleSelect(value: string) {
    const key = current.id as keyof QuizAnswers;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setAnswers((prev) => ({ ...prev, [key]: value as any }));
    setStep((prev) => prev + 1);
  }

  function handleRestart() {
    setAnswers({});
    setStep(0);
  }

  if (isDone) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <span className="text-5xl">🎉</span>
            <h1 className="mt-4 text-2xl font-bold text-zinc-900">All set!</h1>
            <p className="mt-2 text-zinc-500">Here are your preferences</p>
          </div>
          <ul className="space-y-3">
            {QUESTIONS.map((q) => {
              const key = q.id as keyof QuizAnswers;
              const val = answers[key];
              const opt = q.options.find((o) => o.value === val);
              return (
                <li key={q.id} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <span className="text-sm text-zinc-500">{q.question}</span>
                  <span className="ml-4 text-sm font-semibold text-zinc-900">{opt?.label ?? '—'}</span>
                </li>
              );
            })}
          </ul>
          <button
            onClick={handleRestart}
            className="mt-8 w-full rounded-2xl bg-zinc-900 py-4 text-base font-semibold text-white transition-opacity active:opacity-70"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  const selectedValue = answers[current.id as keyof QuizAnswers];

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-10">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">
            {step + 1} / {TOTAL}
          </span>
          <span className="text-sm font-medium text-zinc-400">
            {Math.round(((step) / TOTAL) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all duration-300"
            style={{ width: `${(step / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 flex-1">
        <h1 className="text-2xl font-bold leading-snug text-zinc-900">
          {current.question}
        </h1>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {current.options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full rounded-2xl border-2 px-5 py-4 text-left transition-colors active:scale-[0.98] ${
                isSelected
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-100 bg-zinc-50 text-zinc-900 hover:border-zinc-300'
              }`}
            >
              <span className="block text-base font-semibold">{opt.label}</span>
              <span className={`mt-0.5 block text-sm ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
