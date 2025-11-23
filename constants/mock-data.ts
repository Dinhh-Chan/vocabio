// ============================================
// Mock Data for Testing
// ============================================

import { Folder, StudySet, Vocabulary } from '@/types';

// Mock Vocabularies
export const mockVocabularies: Vocabulary[] = [
  {
    _id: 'vocab1',
    user_id: 'user1',
    word: 'Serendipity',
    definitions: [
      {
        _id: 'def1',
        definition: 'The occurrence of events by chance in a happy or beneficial way',
        example: 'Meeting my best friend was pure serendipity',
        exampleTranslation: 'Gặp bạn thân của tôi là điều may mắn thuần túy',
      },
    ],
    pronunciation: '/ˌserənˈdɪpɪti/',
    ipa: 'ˌserənˈdɪpɪti',
    tags: ['advanced', 'emotion'],
    priority: 3,
    topic: 'Feeling & Emotions',
    study_count: 5,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    _id: 'vocab2',
    user_id: 'user1',
    word: 'Ephemeral',
    definitions: [
      {
        _id: 'def2',
        definition: 'Lasting for a very short time',
        example: 'The beauty of cherry blossoms is ephemeral',
        exampleTranslation: 'Vẻ đẹp của anh đào là thoáng qua',
      },
    ],
    pronunciation: '/ɪˈfɛm(ə)rəl/',
    ipa: 'ɪˈfɛm(ə)rəl',
    tags: ['advanced', 'nature'],
    priority: 2,
    topic: 'Nature',
    study_count: 3,
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
  },
  {
    _id: 'vocab3',
    user_id: 'user1',
    word: 'Eloquent',
    definitions: [
      {
        _id: 'def3',
        definition: 'Fluent or persuasive in speaking or writing',
        example: 'The speaker gave an eloquent speech',
        exampleTranslation: 'Người nói đã đưa ra một bài phát biểu hùng hồn',
      },
    ],
    pronunciation: '/ˈɛləkwənt/',
    ipa: 'ˈɛləkwənt',
    tags: ['intermediate', 'communication'],
    priority: 2,
    topic: 'Communication',
    study_count: 2,
    createdAt: '2024-01-17T09:45:00Z',
    updatedAt: '2024-01-17T09:45:00Z',
  },
  {
    _id: 'vocab4',
    user_id: 'user1',
    word: 'Ubiquitous',
    definitions: [
      {
        _id: 'def4',
        definition: 'Present, appearing, or found everywhere',
        example: 'Smartphones are ubiquitous in modern society',
        exampleTranslation: 'Điện thoại thông minh có mặt ở khắp nơi trong xã hội hiện đại',
      },
    ],
    pronunciation: '/juːˈbɪkwɪtəs/',
    ipa: 'juːˈbɪkwɪtəs',
    tags: ['advanced', 'technology'],
    priority: 3,
    topic: 'Technology',
    study_count: 4,
    createdAt: '2024-01-18T11:15:00Z',
    updatedAt: '2024-01-18T11:15:00Z',
  },
  {
    _id: 'vocab5',
    user_id: 'user1',
    word: 'Pragmatic',
    definitions: [
      {
        _id: 'def5',
        definition: 'Dealing with things in a realistic and practical way',
        example: 'We need to take a pragmatic approach to solve this problem',
        exampleTranslation: 'Chúng ta cần tiếp cận thực tế để giải quyết vấn đề này',
      },
    ],
    pronunciation: '/præɡˈmætɪk/',
    ipa: 'præɡˈmætɪk',
    tags: ['intermediate', 'business'],
    priority: 2,
    topic: 'Business',
    study_count: 3,
    createdAt: '2024-01-19T16:30:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
  },
  {
    _id: 'vocab6',
    user_id: 'user1',
    word: 'Melancholy',
    definitions: [
      {
        _id: 'def6',
        definition: 'A feeling of pensive sadness, typically with no obvious cause',
        example: 'A sense of melancholy hung over the room',
        exampleTranslation: 'Một cảm giác buồn bã nhẹ lơ lửng trong phòng',
      },
    ],
    pronunciation: '/ˈmɛlənkəli/',
    ipa: 'ˈmɛlənkəli',
    tags: ['advanced', 'emotion'],
    priority: 2,
    topic: 'Feeling & Emotions',
    study_count: 2,
    createdAt: '2024-01-20T13:00:00Z',
    updatedAt: '2024-01-20T13:00:00Z',
  },
];

// Mock Study Sets
export const mockStudySets: StudySet[] = [
  {
    _id: 'studyset1',
    user_id: 'user1',
    name: 'Advanced English Vocabulary',
    description: 'Collection of advanced English words for proficiency improvement',
    difficulty: 'advanced',
    level: 'C1-C2',
    vocabulary_ids: ['vocab1', 'vocab2', 'vocab4'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    _id: 'studyset2',
    user_id: 'user1',
    name: 'Business English',
    description: 'Essential vocabulary for business and professional communication',
    difficulty: 'intermediate',
    level: 'B2-C1',
    vocabulary_ids: ['vocab3', 'vocab5'],
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
  },
  {
    _id: 'studyset3',
    user_id: 'user1',
    name: 'Emotions & Feelings',
    description: 'Vocabulary related to emotions, feelings and human expressions',
    difficulty: 'intermediate',
    level: 'B1-B2',
    vocabulary_ids: ['vocab1', 'vocab6'],
    createdAt: '2024-01-17T09:45:00Z',
    updatedAt: '2024-01-17T09:45:00Z',
  },
  {
    _id: 'studyset4',
    user_id: 'user1',
    name: 'TOEFL Preparation',
    description: 'High frequency words for TOEFL exam preparation',
    difficulty: 'advanced',
    level: 'C1',
    vocabulary_ids: ['vocab1', 'vocab2', 'vocab3', 'vocab4', 'vocab5'],
    createdAt: '2024-01-18T11:15:00Z',
    updatedAt: '2024-01-18T11:15:00Z',
  },
  {
    _id: 'studyset5',
    user_id: 'user1',
    name: 'Beginner English Basics',
    description: 'Fundamental English vocabulary for beginners',
    difficulty: 'beginner',
    level: 'A1-A2',
    vocabulary_ids: ['vocab3'],
    createdAt: '2024-01-19T16:30:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
  },
];

// Mock Folders
export const mockFolders: Folder[] = [
  {
    _id: 'folder1',
    user_id: 'user1',
    name: 'Exam Preparation',
    description: 'All learning materials for exam preparation',
    parent_id: undefined,
    item_count: 3,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    _id: 'folder2',
    user_id: 'user1',
    name: 'Work & Career',
    description: 'Professional and business-related vocabulary',
    parent_id: undefined,
    item_count: 2,
    createdAt: '2024-01-11T09:30:00Z',
    updatedAt: '2024-01-11T09:30:00Z',
  },
  {
    _id: 'folder3',
    user_id: 'user1',
    name: 'Daily Life',
    description: 'Common words for everyday situations',
    parent_id: undefined,
    item_count: 4,
    createdAt: '2024-01-12T10:15:00Z',
    updatedAt: '2024-01-12T10:15:00Z',
  },
  {
    _id: 'folder4',
    user_id: 'user1',
    name: 'Literature & Culture',
    description: 'Vocabulary from books and cultural studies',
    parent_id: undefined,
    item_count: 2,
    createdAt: '2024-01-13T14:45:00Z',
    updatedAt: '2024-01-13T14:45:00Z',
  },
  {
    _id: 'folder5',
    user_id: 'user1',
    name: 'Technical Terms',
    description: 'Technology and science-related vocabulary',
    parent_id: undefined,
    item_count: 5,
    createdAt: '2024-01-14T11:20:00Z',
    updatedAt: '2024-01-14T11:20:00Z',
  },
];

// Mock Flashcard Data (converted from mockVocabularies)
export const mockFlashcardData = {
  'studyset1': [
    { 
      id: 'vocab1', 
      front: 'Serendipity', 
      back: 'The occurrence of events by chance in a happy or beneficial way' 
    },
    { 
      id: 'vocab2', 
      front: 'Ephemeral', 
      back: 'Lasting for a very short time' 
    },
    { 
      id: 'vocab4', 
      front: 'Ubiquitous', 
      back: 'Present, appearing, or found everywhere' 
    },
  ],
  'studyset2': [
    { 
      id: 'vocab3', 
      front: 'Eloquent', 
      back: 'Fluent or persuasive in speaking or writing' 
    },
    { 
      id: 'vocab5', 
      front: 'Pragmatic', 
      back: 'Dealing with things in a realistic and practical way' 
    },
  ],
  'studyset3': [
    { 
      id: 'vocab1', 
      front: 'Serendipity', 
      back: 'The occurrence of events by chance in a happy or beneficial way' 
    },
    { 
      id: 'vocab6', 
      front: 'Melancholy', 
      back: 'A feeling of pensive sadness, typically with no obvious cause' 
    },
  ],
  'studyset4': [
    { 
      id: 'vocab1', 
      front: 'Serendipity', 
      back: 'The occurrence of events by chance in a happy or beneficial way' 
    },
    { 
      id: 'vocab2', 
      front: 'Ephemeral', 
      back: 'Lasting for a very short time' 
    },
    { 
      id: 'vocab3', 
      front: 'Eloquent', 
      back: 'Fluent or persuasive in speaking or writing' 
    },
    { 
      id: 'vocab4', 
      front: 'Ubiquitous', 
      back: 'Present, appearing, or found everywhere' 
    },
    { 
      id: 'vocab5', 
      front: 'Pragmatic', 
      back: 'Dealing with things in a realistic and practical way' 
    },
  ],
  'studyset5': [
    { 
      id: 'vocab3', 
      front: 'Eloquent', 
      back: 'Fluent or persuasive in speaking or writing' 
    },
  ],
  'studyset6': [
    { 
      id: 'vocab1', 
      front: 'Serendipity', 
      back: 'The occurrence of events by chance in a happy or beneficial way' 
    },
    { 
      id: 'vocab2', 
      front: 'Ephemeral', 
      back: 'Lasting for a very short time' 
    },
    { 
      id: 'vocab3', 
      front: 'Eloquent', 
      back: 'Fluent or persuasive in speaking or writing' 
    },
    { 
      id: 'vocab4', 
      front: 'Ubiquitous', 
      back: 'Present, appearing, or found everywhere' 
    },
    { 
      id: 'vocab5', 
      front: 'Pragmatic', 
      back: 'Dealing with things in a realistic and practical way' 
    },
    { 
      id: 'vocab6', 
      front: 'Melancholy', 
      back: 'A feeling of pensive sadness, typically with no obvious cause' 
    },
  ],
  'studyset7': [
    { 
      id: 'vocab1', 
      front: 'Serendipity', 
      back: 'The occurrence of events by chance in a happy or beneficial way' 
    },
    { 
      id: 'vocab2', 
      front: 'Ephemeral', 
      back: 'Lasting for a very short time' 
    },
    { 
      id: 'vocab3', 
      front: 'Eloquent', 
      back: 'Fluent or persuasive in speaking or writing' 
    },
    { 
      id: 'vocab4', 
      front: 'Ubiquitous', 
      back: 'Present, appearing, or found everywhere' 
    },
  ],
};

// Mock data cho học phần đang học (Continue Learning)
export interface ContinueLearningItem {
  studySetId: string;
  name: string;
  totalCards: number;
  completedCards: number;
  progress: number; // 0-100
  status: 'completed' | 'in_progress';
  lastStudied?: string;
}

export const mockContinueLearning: ContinueLearningItem[] = [
  {
    studySetId: 'studyset1',
    name: '4.2',
    totalCards: 15,
    completedCards: 15,
    progress: 100,
    status: 'completed',
    lastStudied: '2024-01-20T10:30:00Z',
  },
  {
    studySetId: 'studyset2',
    name: 'Business English',
    totalCards: 20,
    completedCards: 12,
    progress: 60,
    status: 'in_progress',
    lastStudied: '2024-01-20T08:15:00Z',
  },
  {
    studySetId: 'studyset4',
    name: 'TOEFL Preparation',
    totalCards: 50,
    completedCards: 35,
    progress: 70,
    status: 'in_progress',
    lastStudied: '2024-01-19T16:45:00Z',
  },
  {
    studySetId: 'studyset3',
    name: 'Emotions & Feelings',
    totalCards: 25,
    completedCards: 8,
    progress: 32,
    status: 'in_progress',
    lastStudied: '2024-01-18T14:20:00Z',
  },
];

// Mock data cho học phần gần đây (Recent)
export interface RecentStudySet {
  studySetId: string;
  name: string;
  totalCards: number;
  author: string;
  lastAccessed: string;
}

export const mockRecentStudySets: RecentStudySet[] = [
  {
    studySetId: 'studyset1',
    name: '4.2',
    totalCards: 15,
    author: 'bạn',
    lastAccessed: '2024-01-20T10:30:00Z',
  },
  {
    studySetId: 'studyset6',
    name: 'Thông tin cơ bản về Quizlet',
    totalCards: 9,
    author: 'Quizlet',
    lastAccessed: '2024-01-19T15:20:00Z',
  },
  {
    studySetId: 'studyset7',
    name: 'Nội dung học tập',
    totalCards: 12,
    author: 'bạn',
    lastAccessed: '2024-01-18T11:10:00Z',
  },
  {
    studySetId: 'studyset2',
    name: 'Business English',
    totalCards: 20,
    author: 'bạn',
    lastAccessed: '2024-01-17T09:30:00Z',
  },
];

