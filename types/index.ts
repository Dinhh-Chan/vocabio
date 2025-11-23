// ============================================
// Types cho Vocabio App
// ============================================

// ============================================
// User Types
// ============================================
export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Vocabulary Types
// ============================================
export interface VocabularyDefinition {
  _id?: string;
  definition: string;
  example?: string;
  exampleTranslation?: string;
}

export interface Vocabulary {
  _id: string;
  user_id: string;
  word: string;
  definitions: VocabularyDefinition[];
  pronunciation?: string;
  ipa?: string;
  audio_url?: string;
  tags?: string[];
  priority?: number;
  topic?: string;
  edit_history?: VocabularyEditHistory[];
  study_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyEditHistory {
  _id: string;
  edited_at: string;
  changes: string;
}

// ============================================
// Study Set Types
// ============================================
export interface StudySet {
  _id: string;
  user_id: string;
  name: string;
  description?: string;
  image_url?: string;
  vocabulary_ids: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  level?: string;
  sort_order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudySetWithVocab extends StudySet {
  vocabularies: Vocabulary[];
}

// ============================================
// Folder Types
// ============================================
export interface Folder {
  _id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FolderItem {
  _id: string;
  folder_id: string;
  item_type: 'study_set' | 'quiz' | 'class';
  item_id: string;
  sort_order: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SRS Types
// ============================================
export interface SrsProgress {
  _id: string;
  user_id: string;
  vocabulary_id: string;
  interval: number;
  easiness: number;
  repetitions: number;
  next_review_at?: string;
  last_review_at?: string;
  createdAt: string;
  updatedAt: string;
}

export type SrsQuality = 0 | 1 | 2 | 3 | 4 | 5;

// ============================================
// Quiz Types
// ============================================
export type QuizType = 
  | 'multiple_choice'
  | 'choose_definition'
  | 'listen_write'
  | 'fill_blank'
  | 'match_word_definition'
  | 'spelling'
  | 'arrange_sentence'
  | 'speed_test';

export interface Quiz {
  _id: string;
  user_id: string;
  study_set_id?: string;
  type: QuizType;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  _id: string;
  quiz_id: string;
  vocabulary_id: string;
  question_type: QuizType;
  question_text: string;
  audio_url?: string;
  sort_order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAnswer {
  _id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  sort_order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizResult {
  _id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Activity & Statistics Types
// ============================================
export interface Activity {
  _id: string;
  user_id: string;
  date: string;
  vocabularies_studied: number;
  time_spent: number; // minutes
  flashcards_reviewed: number;
  quizzes_completed: number;
}

export interface Statistics {
  total_vocabularies: number;
  mastered_vocabularies: number;
  learning_vocabularies: number;
  total_study_sets: number;
  total_quizzes: number;
  current_streak: number;
  longest_streak: number;
  total_study_time: number; // minutes
  average_score: number;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

