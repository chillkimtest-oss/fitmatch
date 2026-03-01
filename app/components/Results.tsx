'use client';

import { useMemo, useState } from 'react';
import { calculateScore, scoreLabel } from '@/src/lib/score';
import type { TrainerProfile, UserPreferences } from '@/src/lib/score';
import trainersData from '@/src/data/trainers.json';

const trainers = trainersData as TrainerProfile[];

interface RankedTrainer {
  trainer: TrainerProfile;
  score: number;
  label: string;
}

interface ResultsProps {
  preferences: UserPreferences;
  onRestart: () => void;
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return (
    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 text-lg font-bold text-zinc-600">
      {initials.toUpperCase()}
    </div>
  );
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  let colorClass = 'bg-zinc-100 text-zinc-500';
  if (label === 'Great Match') colorClass = 'bg-emerald-100 text-emerald-700';
  else if (label === 'Good Match') colorClass = 'bg-blue-100 text-blue-700';

  return (
    <div className={`flex flex-col items-center rounded-xl px-3 py-2 ${colorClass}`}>
      <span className="text-xl font-bold leading-none">{score}</span>
      <span className="mt-0.5 text-xs font-medium">{label}</span>
    </div>
  );
}

export default function Results({ preferences, onRestart }: ResultsProps) {
  const ranked: RankedTrainer[] = useMemo(() => {
    return trainers
      .map((trainer) => ({
        trainer,
        score: calculateScore(trainer, preferences),
        label: scoreLabel(calculateScore(trainer, preferences)),
      }))
      .sort((a, b) => b.score - a.score);
  }, [preferences]);

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Your Top Matches</h1>
        <p className="mt-1 text-sm text-zinc-500">Toronto trainers ranked by compatibility</p>
      </div>

      <div className="flex flex-col gap-4">
        {ranked.map((item, index) => {
          const isTopMatch = index === 0;
          return (
            <div
              key={item.trainer.id}
              className={`relative rounded-2xl border-2 p-4 transition-colors ${
                isTopMatch
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-zinc-100 bg-zinc-50'
              }`}
            >
              {isTopMatch && (
                <span className="absolute -top-3 left-4 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Best Match
                </span>
              )}
              <div className="flex items-start gap-4">
                <Initials name={item.trainer.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-zinc-900">{item.trainer.name}</p>
                  <p className="text-sm text-zinc-500">{item.trainer.specialty}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{item.trainer.area}</p>
                  <a
                    href={item.trainer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-semibold text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
                  >
                    View Profile →
                  </a>
                </div>
                <ScoreBadge score={item.score} label={item.label} />
              </div>
            </div>
          );
        })}
      </div>

      <NotifyForm trainerIds={ranked.map((r) => r.trainer.id)} />

      <button
        onClick={onRestart}
        className="mt-4 w-full rounded-2xl bg-zinc-900 py-4 text-base font-semibold text-white transition-opacity active:opacity-70"
      >
        Start over
      </button>
    </div>
  );
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

function NotifyForm({ trainerIds }: { trainerIds: string[] }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), trainerIds }),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg((data as { error?: string }).error ?? 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-5 py-5 text-center">
        <p className="text-base font-semibold text-emerald-700">You&apos;re on the list!</p>
        <p className="mt-1 text-sm text-emerald-600">We&apos;ll connect you with your top matches soon.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border-2 border-zinc-100 bg-zinc-50 px-5 py-5">
      <p className="text-base font-semibold text-zinc-900">Get connected with your matches</p>
      <p className="mt-1 text-sm text-zinc-500">Leave your details and we&apos;ll introduce you to your top trainers.</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3" noValidate>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900"
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900"
        />
        {status === 'error' && (
          <p className="text-xs text-red-600">{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-2xl bg-zinc-900 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50 active:opacity-70"
        >
          {status === 'loading' ? 'Sending…' : 'Notify my matches'}
        </button>
      </form>
    </div>
  );
}
