import { describe, it, expect } from 'vitest';
import { calculateScore, scoreLabel, MATCH_THRESHOLD } from './score';
import type { TrainerProfile, UserPreferences } from './score';

// Known trainer fixture (matches trainer-001 in trainers.json)
const trainerAlex: TrainerProfile = {
  id: 'trainer-001',
  name: 'Alex Chen',
  goal: 'weight_loss',
  style: 'high_intensity',
  feedback: 'motivational',
  structure: 'strict',
  checkins: 'weekly',
};

describe('calculateScore', () => {
  it('returns 100 for a perfect match', () => {
    const user: UserPreferences = {
      goal: 'weight_loss',
      style: 'high_intensity',
      feedback: 'motivational',
      structure: 'strict',
      checkins: 'weekly',
    };
    expect(calculateScore(trainerAlex, user)).toBe(100);
  });

  it('returns 0 for no matching attributes', () => {
    const user: UserPreferences = {
      goal: 'muscle_gain',
      style: 'cardio',
      feedback: 'detailed',
      structure: 'flexible',
      checkins: 'daily',
    };
    expect(calculateScore(trainerAlex, user)).toBe(0);
  });

  it('returns 30 when only goal matches (known trainer-001 + user)', () => {
    const user: UserPreferences = {
      goal: 'weight_loss',   // +30
      style: 'cardio',       // no match
      feedback: 'detailed',  // no match
      structure: 'flexible', // no match
      checkins: 'daily',     // no match
    };
    expect(calculateScore(trainerAlex, user)).toBe(30);
  });

  it('returns 70 when goal + style + feedback match', () => {
    const user: UserPreferences = {
      goal: 'weight_loss',      // +30
      style: 'high_intensity',  // +20
      feedback: 'motivational', // +20
      structure: 'flexible',    // no match
      checkins: 'daily',        // no match
    };
    expect(calculateScore(trainerAlex, user)).toBe(70);
  });

  it('returns 60 when goal + style + checkins match (at threshold)', () => {
    const user: UserPreferences = {
      goal: 'weight_loss',      // +30
      style: 'high_intensity',  // +20
      feedback: 'detailed',     // no match
      structure: 'flexible',    // no match
      checkins: 'weekly',       // +10
    };
    expect(calculateScore(trainerAlex, user)).toBe(60);
  });

  it('applies correct individual weights', () => {
    // Each attribute match tested in isolation
    const base: UserPreferences = {
      goal: 'muscle_gain',
      style: 'cardio',
      feedback: 'detailed',
      structure: 'flexible',
      checkins: 'daily',
    };

    expect(calculateScore(trainerAlex, { ...base, goal: 'weight_loss' })).toBe(30);      // goal weight
    expect(calculateScore(trainerAlex, { ...base, style: 'high_intensity' })).toBe(20);  // style weight
    expect(calculateScore(trainerAlex, { ...base, feedback: 'motivational' })).toBe(20); // feedback weight
    expect(calculateScore(trainerAlex, { ...base, structure: 'strict' })).toBe(20);      // structure weight
    expect(calculateScore(trainerAlex, { ...base, checkins: 'weekly' })).toBe(10);       // checkins weight
  });
});

describe('scoreLabel', () => {
  it('returns "Great Match" for scores >= 80', () => {
    expect(scoreLabel(80)).toBe('Great Match');
    expect(scoreLabel(100)).toBe('Great Match');
    expect(scoreLabel(90)).toBe('Great Match');
  });

  it('returns "Good Match" for scores >= 60 and < 80', () => {
    expect(scoreLabel(60)).toBe('Good Match');
    expect(scoreLabel(MATCH_THRESHOLD)).toBe('Good Match');
    expect(scoreLabel(79)).toBe('Good Match');
    expect(scoreLabel(70)).toBe('Good Match');
  });

  it('returns "Poor Match" for scores below 60', () => {
    expect(scoreLabel(0)).toBe('Poor Match');
    expect(scoreLabel(30)).toBe('Poor Match');
    expect(scoreLabel(59)).toBe('Poor Match');
  });
});

describe('MATCH_THRESHOLD', () => {
  it('is 60', () => {
    expect(MATCH_THRESHOLD).toBe(60);
  });
});
