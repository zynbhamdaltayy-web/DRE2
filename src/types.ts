export type Page =
  | "welcome"
  | "auth"
  | "signup"
  | "login"
  | "avatar"
  | "home"
  | "library"
  | "article"
  | "vocabulary"
  | "practice"
  | "rooms"
  | "games"
  | "progress"
  | "profile"
  | "settings"
  | "updates";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type AvatarGender = "girl" | "boy";

export type SkinTone =
  | "light"
  | "fair"
  | "medium"
  | "tan"
  | "deep";

export type EyeColor =
  | "brown"
  | "darkBrown"
  | "blue"
  | "green"
  | "gray";

export type HairStyle =
  | "short"
  | "medium"
  | "long"
  | "ponytail"
  | "bob"
  | "hijab";

export type HairColor =
  | "black"
  | "darkBrown"
  | "brown"
  | "blonde"
  | "auburn";

export type ShirtColor =
  | "orange"
  | "blue"
  | "green"
  | "purple"
  | "pink"
  | "yellow"
  | "white"
  | "black";

export interface Avatar {
  gender: AvatarGender;
  skinTone: SkinTone;
  eyeColor: EyeColor;
  hairStyle: HairStyle;
  hairColor: HairColor;
  shirtColor: ShirtColor;
  hijab: boolean;
}

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  articleId: string;
  savedAt: string;
}

export interface Article {
  id: string;
  level: Level;
  topic: string;
  title: string;
  description: string;
  content: string;
  estimatedMinutes: number;
}

export interface PracticeQuestion {
  id: string;
  level: Level;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

/* =========================
   LEVEL TEST
========================= */

export interface LevelTestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  level: Level;
}

/* =========================
   IDENTITY CARD
========================= */

export interface IdentityCard {
  issuedAt: string;
  expiresAt: string;
}

/* =========================
   USER PROFILE
========================= */

export interface UserProfile {
  name: string;
  email: string;
  level: Level;
  avatar: Avatar;

  xp: number;

  identityCard: IdentityCard | null;

  levelTestCompleted: boolean;
}

/* =========================
   APP STATE
========================= */

export interface AppState {
  page: Page;

  user: UserProfile | null;

  vocabulary: VocabularyWord[];

  completedArticles: string[];

  practiceScore: number;

  practiceAnswered: number;

  currentArticleId: string | null;

  selectedLibraryLevel: Level;

  selectedTopic: string;

  selectedPracticeLevel: Level;

  isAuthenticated: boolean;

  /* Progress */

  totalXp: number;

  articlesRead: number;

  vocabularyLearned: number;

  practiceCompleted: number;

  roomsJoined: number;

  cardsCollected: number;

  /* Level Test */

  levelTestScore: number;

  levelTestTotal: number;
}