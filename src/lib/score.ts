export type Goal = 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'general_fitness';
export type Style = 'high_intensity' | 'low_impact' | 'strength' | 'cardio' | 'yoga';
export type FeedbackStyle = 'detailed' | 'brief' | 'motivational' | 'technical';
export type Structure = 'strict' | 'flexible' | 'mixed';
export type CheckinFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface TrainerProfile {
  id: string;
  name: string;
  goal: Goal;
  style: Style;
  feedback: FeedbackStyle;
  structure: Structure;
  checkins: CheckinFrequency;
  area: string;
  specialty: string;
  website: string;
}

export interface UserPreferences {
  goal: Goal;
  style: Style;
  feedback: FeedbackStyle;
  structure: Structure;
  checkins: CheckinFrequency;
}

const WEIGHTS = {
  goal: 30,
  style: 20,
  feedback: 20,
  structure: 20,
  checkins: 10,
} as const;

export const MATCH_THRESHOLD = 60;

/**
 * Calculates a compatibility score (0–100) between a trainer and user preferences.
 * Each attribute contributes its weight when trainer and user values match.
 */
export function calculateScore(trainer: TrainerProfile, user: UserPreferences): number {
  let score = 0;
  if (trainer.goal === user.goal) score += WEIGHTS.goal;
  if (trainer.style === user.style) score += WEIGHTS.style;
  if (trainer.feedback === user.feedback) score += WEIGHTS.feedback;
  if (trainer.structure === user.structure) score += WEIGHTS.structure;
  if (trainer.checkins === user.checkins) score += WEIGHTS.checkins;
  return score;
}

/**
 * Returns a human-readable label for a compatibility score.
 * Scores >= 80 are "Great Match", >= 60 (threshold) are "Good Match", below is "Poor Match".
 */
export function scoreLabel(score: number): string {
  if (score >= 80) return 'Great Match';
  if (score >= MATCH_THRESHOLD) return 'Good Match';
  return 'Poor Match';
}
