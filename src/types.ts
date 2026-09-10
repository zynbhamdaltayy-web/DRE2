/* =========================================================
   DRE2learn — Shared Application Types
   ========================================================= */

export type Level =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "C2";

/* =========================================================
   PAGES
   ========================================================= */

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

/* =========================================================
   AVATAR
   ========================================================= */

export type Gender =
  | "girl"
  | "boy";

export type AvatarGender =
  | "girl"
  | "boy";

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
  | "orange"
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

  /**
   * Kept for compatibility with the existing avatar editor.
   */
  hijab: boolean;
}

/* =========================================================
   IDENTITY CARD
   ========================================================= */

export interface IdentityCard {
  issuedAt: string;
  expiresAt: string;
  countryCode: string;
  countryName?: string;
  countryFlag?: string;
  countryMapCode?: string;
}

/* =========================================================
   USER PROFILE
   ========================================================= */

export interface UserProfile {
  id: string;

  /**
   * Current UI uses name.
   * displayName/username are kept for profile/storage modules.
   */
  name: string;
  username: string;
  displayName: string;

  email?: string;

  bio?: string;

  avatar: Avatar;

  xp: number;

  level: Level;

  countryCode: string;

  isVip: boolean;

  vipSince?: string;

  vipUntil?: string;

  identityCard: IdentityCard | null;

  identityCardIssuedAt?: string;

  identityCardExpiresAt?: string;

  /**
   * Level-test information used by main.ts and storage.ts.
   */
  levelTestCompleted: boolean;

  levelTestResult: LevelTestResultSummary | null;

  createdAt?: string;
  joinedAt?: string;
  updatedAt?: string;
}

/* =========================================================
   ARTICLES
   ========================================================= */

export interface Article {
  id: string;
  title: string;
  topic: string;
  level: Level;
  content: string;

  description?: string;
  summary?: string;

  estimatedMinutes?: number;

  readingTime?: number;

  vocabulary?: string[];

  questions?: LibraryQuestion[];

  completed?: boolean;

  createdAt?: string;
}

/* =========================================================
   LIBRARY
   ========================================================= */

export interface LibraryQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface LibraryArticle {
  id: string;
  title: string;
  level: Level;
  topic: string;
  readingTime: number;
  content: string;
  vocabulary: string[];
  questions: LibraryQuestion[];
}

/* =========================================================
   VOCABULARY
   ========================================================= */

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;

  example?: string;

  level?: Level;

  articleId?: string;

  createdAt?: string;

  /**
   * Used by the current main.ts.
   */
  savedAt?: string;
}

/* =========================================================
   PRACTICE
   ========================================================= */

export interface PracticeItem {
  id: string;
  question: string;

  answer?: string;

  correctAnswer?: string;

  options?: string[];

  explanation?: string;

  type?:
    | "multiple-choice"
    | "fill-blank"
    | "translation"
    | "speaking";

  level?: Level;
}

export interface PracticeQuestion {
  id: string;
  level: Level;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

/* =========================================================
   LEVEL TEST
   ========================================================= */

export type LevelTestSkill =
  | "reading"
  | "listening"
  | "writing"
  | "grammar";

export type LevelTestQuestionType =
  | "multiple-choice"
  | "writing";

export interface LevelTestQuestion {
  id: string;

  level: Level;

  skill: LevelTestSkill;

  type: LevelTestQuestionType;

  question: string;

  options?: string[];

  correctAnswer?: string;

  explanation?: string;

  passage?: string;

  writingPrompt?: string;

  points: number;

  audioUrl?: string;

  /**
   * Existing question bank uses audioSrc.
   */
  audioSrc?: string;
}

export interface LevelTestAnswer {
  questionId: string;

  answer: string;

  /**
   * Newer code.
   */
  isCorrect: boolean;

  /**
   * Kept for compatibility with older storage logic.
   */
  correct: boolean;

  level: Level;

  points?: number;
}

/* =========================================================
   LEVEL TEST RESULT TYPES
   ========================================================= */

export interface LevelScore {
  level: Level;
  correct: number;
  total: number;
  percentage: number;
}

export interface SkillScore {
  skill: LevelTestSkill;
  correct: number;
  total: number;
  percentage: number;
  level: Level;
}

export interface WritingRubricScore {
  grammar: number;
  vocabulary: number;
  organization: number;
  taskAchievement: number;
  overall: number;
}

export interface WritingEvaluation {
  score: number;
  percentage: number;
  level: Level;
  feedback: string;
  rubric?: WritingRubricScore;
}

export interface AdaptiveAnswer {
  questionId: string;
  level: Level;
  answer: string;
  correct: boolean;
  points: number;
}

export interface AdaptiveState {
  currentLevel: Level;

  answeredQuestionIds: string[];

  answers: Record<string, string>;

  history: AdaptiveAnswer[];

  consecutiveCorrect: number;

  consecutiveIncorrect: number;

  highestDemonstratedLevel: Level;

  lowestWeakLevel: Level | null;

  completed: boolean;
}

export interface LevelTestResultSummary {
  overallLevel: Level;

  overallPercentage: number;

  skillLevels: Record<
    LevelTestSkill,
    Level
  >;

  skillScores: Record<
    LevelTestSkill,
    SkillScore
  >;

  levelScores: Record<
    Level,
    LevelScore
  >;

  questionsAnswered: number;

  completed: boolean;
}

/* =========================================================
   LEARNING CARDS
   ========================================================= */

export type LearningCardType =
  | "word"
  | "phrase"
  | "question"
  | "challenge"
  | "roleplay"
  | "mystery";

export type CardDifficulty =
  | "easy"
  | "medium"
  | "hard";

export interface LearningCard {
  id: string;

  title: string;

  content: string;

  answer?: string;

  word?: string;

  meaning?: string;

  example?: string;

  type: LearningCardType;

  level: Level;

  topic: string;

  difficulty: CardDifficulty;

  xpCost: number;

  xpReward: number;

  /**
   * Optional because older cardData objects did not include it.
   */
  createdAt?: string;
}

export interface CollectedCard {
  cardId: string;

  collectedAt: string;

  timesUsed?: number;

  timesPlayed?: number;

  rewardClaimed?: boolean;
}

/* =========================================================
   XP
   ========================================================= */

export type XpAction =
  | "article"
  | "vocabulary"
  | "practice"
  | "room"
  | "card"
  | "levelTest"
  | "daily";

export interface XpReward {
  action: XpAction;

  amount: number;

  label?: string;

  description?: string;
}

/* =========================================================
   PROGRESS
   ========================================================= */

export interface AppProgress {
  currentStreak: number;

  longestStreak: number;

  lastActiveDate: string;

  dailyXp: number;

  dailyGoal: number;
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

/* =========================================================
   APP STATE
   ========================================================= */

export interface AppState {
  /**
   * The current navigation property used by the original
   * storage/state layer.
   */
  page: Page;

  /**
   * Kept as an alias for compatibility with newer UI code.
   */
  currentPage?: Page;

  user: UserProfile | null;

  vocabulary: VocabularyWord[];

  completedArticles: string[];

  practiceScore: number;

  practiceAnswered: number;

  currentArticleId: string | null;

  selectedLibraryLevel: Level | "ALL";

  selectedTopic: string;

  selectedPracticeLevel: Level;

  isAuthenticated: boolean;

  totalXp: number;

  articlesRead: number;

  vocabularyLearned: number;

  practiceCompleted: number;

  roomsJoined: number;

  cardsCollected: number;

  levelTestScore: number;

  levelTestTotal: number;

  levelTestAnswers: LevelTestAnswer[];

  levelTestResult: LevelTestResultSummary | null;

  joinedRoomId: string | null;

  collectedCards: CollectedCard[];

  seenUpdates: string[];

  progress: AppProgress;

  settings: AppSettings;
}

/* =========================================================
   SETTINGS
   ========================================================= */

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

export type ThemeMode =
  | "light"
  | "system"
  | "dark";

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