// ============================================
// SRS Utility Functions
// ============================================

import { SRS_CONFIG } from '@/constants/config';
import { SrsProgress, SrsQuality } from '@/types';

/**
 * Calculate next review date using SM-2 algorithm
 */
export function calculateNextReview(
  currentProgress: SrsProgress | null,
  quality: SrsQuality
): Partial<SrsProgress> {
  // Initialize if no progress exists
  let interval = 1;
  let easiness = SRS_CONFIG.INITIAL_EASINESS;
  let repetitions = 0;

  if (currentProgress) {
    interval = currentProgress.interval;
    easiness = currentProgress.easiness;
    repetitions = currentProgress.repetitions;
  }

  // Update easiness factor
  const q = quality;
  const ef = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easiness = Math.max(SRS_CONFIG.MIN_EASINESS, ef);

  // Update repetitions and interval
  if (q < 3) {
    // Incorrect response - reset
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
  }

  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return {
    interval,
    easiness,
    repetitions,
    next_review_at: nextReviewAt.toISOString(),
    last_review_at: new Date().toISOString(),
  };
}

/**
 * Check if vocabulary is due for review
 */
export function isDueForReview(progress: SrsProgress | null): boolean {
  if (!progress || !progress.next_review_at) {
    return true; // New vocabulary
  }

  const nextReview = new Date(progress.next_review_at);
  const now = new Date();
  return now >= nextReview;
}

/**
 * Get mastery level based on SRS progress
 */
export function getMasteryLevel(progress: SrsProgress | null): 'new' | 'learning' | 'mastered' {
  if (!progress) {
    return 'new';
  }

  if (progress.repetitions >= 5 && progress.interval >= 30) {
    return 'mastered';
  }

  if (progress.repetitions > 0) {
    return 'learning';
  }

  return 'new';
}

