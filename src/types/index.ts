export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  loginAttempts: number; // Add this line
}

export interface Question {
  id: string;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface Test {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // in minutes
  questions: Question[];
  createdAt: string;
  isActive: boolean;
  createdBy: string;
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  timeSpent: number; // in seconds
  completedAt: string;
  submissionType: 'manual' | 'auto';
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  tests: Test[];
  testAttempts: TestAttempt[];
}