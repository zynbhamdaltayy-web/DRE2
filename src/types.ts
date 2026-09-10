export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Page =
  | "welcome"
  | "signup"
  | "login"
  | "avatar"
  | "levelTest"
  | "home"
  | "library"
  | "article"
  | "vocabulary"
  | "practice"
  | "rooms"
  | "messages"
  | "games"
  | "progress"
  | "profile"
  | "settings"
  | "updates";

export type Gender = "girl" | "boy";

export type AvatarGender = "girl" | "boy";

export type SkinTone = "light" | "fair" | "medium" | "tan" | "deep";

export type EyeColor =
  | "brown"
  | "darkBrown"
  | "blue"
  | "green"
  | "hazel"
  | "gray";

export type HairColor =
  | "black"
  | "darkBrown"
  | "brown"
  | "lightBrown"
  | "blonde"
  | "red"
  | "gray";

export type HairStyle =
  | "short"
  | "medium"
  | "long"
  | "curly"
  | "wavy"
  | "ponytail"
  | "hijab";

export type ShirtColor =
  | "peach"
  | "blue"
  | "green"
  | "purple"
  | "pink"
  | "yellow"
  | "black"
  | "white";

export interface Avatar {
  gender: AvatarGender;
  skinTone: SkinTone;
  eyeColor: EyeColor;
  hairColor: HairColor;
  hairStyle: HairStyle;
  shirtColor: ShirtColor;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatar: Avatar;
  xp: number;
  level: Level;
  countryCode?: string;
  isVip: boolean;
  vipSince?: string;
  vipUntil?: string;
  identityCardIssuedAt?: string;
  identityCardExpiresAt?: string;
  identityCardActive: boolean;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  topic: string;
  level: Level;
  content: string;
  summary?: string;
  completed?: boolean;
  createdAt?: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  level?: Level;
  articleId?: string;
  createdAt: string;
}

export interface PracticeItem {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  type?: "multiple-choice" | "fill-blank" | "translation" | "speaking";
  level?: Level;
}

export interface LevelTestAnswer {
  questionId: string;
  answer: string;
  correct: boolean;
  level: Level;
}

export interface LevelTestQuestion {
  id: string;
  level: Level;
  skill: "reading" | "listening" | "writing" | "grammar-vocabulary";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  audioUrl?: string;
}

export interface ProgressStats {
  articlesRead: number;
  vocabularyLearned: number;
  practiceCompleted: number;
  roomsJoined: number;
  cardsCollected: number;

  totalXp: number;
  level: Level;

  levelTestCompleted: boolean;
  levelTestScore: number;
  levelTestTotal: number;
  levelTestPercentage: number;

  overallProgress: number;

  dailyGoal: number;
  dailyGoalProgress: number;
  dailyGoalCompleted: boolean;

  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface AppProgress {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  dailyXp: number;
  dailyGoal: number;
}

export interface AppState {
  currentPage: Page;

  isAuthenticated: boolean;

  user: UserProfile | null;

  progress: AppProgress;

  articles: Article[];

  vocabulary: VocabularyWord[];

  selectedArticleId: string | null;

  selectedLibraryLevel: Level | "ALL";

  selectedLibraryTopic: string;

  selectedRoomId: string | null;

  settings: AppSettings;
}

export type AppLanguage =
  | "ar"
  | "en"
  | "zh-CN"
  | "ru"
  | "ku"
  | "tr"
  | "fr"
  | "de"
  | "es"
  | "it"
  | "ja"
  | "ko";

export type ThemeMode = "light" | "system" | "dark";

export interface NotificationSettings {
  pushNotifications: boolean;
  messageNotifications: boolean;
  followNotifications: boolean;
  learningNotifications: boolean;
  officialUpdates: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  showOnlineStatus: boolean;
  allowMessageRequests: boolean;
  allowRoomInvites: boolean;
}

export interface LearningSettings {
  dailyGoal: number;
  defaultLevel: Level;
  defaultLanguage: string;
  autoplayAudio: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  language: AppLanguage;

  notifications: NotificationSettings;

  privacy: PrivacySettings;

  learning: LearningSettings;

  soundEffects: boolean;
  autoplayAudio: boolean;

  privateMessages: boolean;
  showOnlineStatus: boolean;

  preferredTheme: ThemeMode;
  preferredLanguage: AppLanguage;

  defaultLanguage: string;
}