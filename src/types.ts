export type Page =
  | "welcome"
  | "auth"
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
  | "games"
  | "progress"
  | "profile"
  | "settings"
  | "updates";

// ======================================================
// CEFR LEVELS
// ======================================================

export type Level =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "C2";

// ======================================================
// AVATAR
// ======================================================

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

// ======================================================
// LIBRARY / ARTICLES
// ======================================================

export interface Article {
  id: string;
  level: Level;
  topic: string;
  title: string;
  description: string;
  content: string;
  estimatedMinutes: number;

  vocabulary?: ArticleVocabulary[];
  comprehensionQuestions?: ComprehensionQuestion[];

  audioSrc?: string;

  publishedAt?: string;
}

export interface ArticleVocabulary {
  word: string;
  meaning: string;
  example: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

// ======================================================
// VOCABULARY
// ======================================================

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example: string;

  articleId: string;

  savedAt: string;
}

// ======================================================
// PRACTICE
// ======================================================

export interface PracticeQuestion {
  id: string;
  level: Level;

  question: string;

  options: string[];

  correctAnswer: string;

  explanation: string;
}

// ======================================================
// LEVEL TEST
// ======================================================

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

  passage?: string;

  audioSrc?: string;

  options?: string[];

  correctAnswer?: string;

  writingPrompt?: string;

  points: number;
}

// ======================================================
// LEVEL TEST ANSWER
// ======================================================

export interface LevelTestAnswer {
  questionId: string;

  answer: string;

  isCorrect?: boolean;

  pointsEarned?: number;
}

// ======================================================
// LEVEL TEST RESULT
// ======================================================

export interface LevelTestSkillResult {
  skill: LevelTestSkill;

  score: number;

  total: number;

  percentage: number;

  level: Level;
}

export interface LevelTestResult {
  score: number;

  total: number;

  percentage: number;

  level: Level;

  reading: LevelTestSkillResult;

  listening: LevelTestSkillResult;

  writing: LevelTestSkillResult;

  grammar: LevelTestSkillResult;

  completedAt: string;
}

// ======================================================
// XP
// ======================================================

export interface XpReward {
  action:
    | "article"
    | "vocabulary"
    | "practice"
    | "room"
    | "card"
    | "levelTest"
    | "daily";

  amount: number;

  description: string;
}

// ======================================================
// CARDS
// ======================================================

export type CardDifficulty =
  | "easy"
  | "medium"
  | "hard";

export type LearningCardType =
  | "word"
  | "phrase"
  | "question"
  | "challenge"
  | "roleplay"
  | "mystery";

export interface LearningCard {
  id: string;

  title?: string;

  content?: string;

  answer?: string;

  word?: string;

  meaning?: string;

  example?: string;

  type?: LearningCardType;

  level: Level;

  topic: string;

  difficulty?: CardDifficulty;

  // XP required to collect the card.
  xpCost: number;

  // XP received after completing the card.
  xpReward?: number;

  createdAt?: string;
}

export interface CollectedCard {
  cardId: string;

  collectedAt: string;

  timesUsed?: number;

  timesPlayed?: number;

  // true = the 3 XP completion reward
  // has already been claimed.
  rewardClaimed?: boolean;
}

// ======================================================
// ROOMS
// ======================================================

export type RoomGender =
  | "girls"
  | "boys"
  | "mixed";

export type RoomType =
  | "audio"
  | "video";

export interface RoomSettings {
  topic: string;

  level: Level;

  gender: RoomGender;

  type: RoomType;

  maxParticipants: number;

  allowPrivateMessages: boolean;
}

export interface LearningRoom {
  id: string;

  name: string;

  hostId: string;

  settings: RoomSettings;

  participants: string[];

  createdAt: string;

  isActive: boolean;
}

// ======================================================
// IDENTITY CARD
// ======================================================

export interface IdentityCard {
  issuedAt: string;

  expiresAt: string;

  renewalXpCost?: number;
}

// ======================================================
// USER PROFILE
// ======================================================

export interface UserProfile {
  name: string;

  email: string;

  countryCode: string;

  level: Level;

  avatar: Avatar;

  xp: number;

  identityCard: IdentityCard | null;

  levelTestCompleted: boolean;

  levelTestResult?: LevelTestResult | null;

  isVip?: boolean;

  vipSince?: string;

  vipUntil?: string;
}

// ======================================================
// SETTINGS
// ======================================================

export interface AppSettings {
  notifications: boolean;

  soundEffects: boolean;

  autoplayAudio: boolean;

  privateMessages: boolean;

  showOnlineStatus: boolean;

  preferredTheme:
    | "light"
    | "system"
    | "dark";

  preferredLanguage:
    | "en"
    | "ar";
}

// ======================================================
// UPDATES
// ======================================================

export type UpdateType =
  | "feature"
  | "improvement"
  | "fix"
  | "announcement";

export interface AppUpdate {
  id: string;

  title: string;

  description: string;

  type: UpdateType;

  version: string;

  date: string;

  isNew: boolean;
}

// ======================================================
// PROGRESS
// ======================================================

export interface ProgressStats {
  articlesRead: number;

  vocabularyLearned: number;

  practiceCompleted: number;

  roomsJoined: number;

  cardsCollected: number;

  totalXp: number;

  levelTestScore: number;

  levelTestTotal: number;
}

// ======================================================
// APPLICATION STATE
// ======================================================

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

  // XP
  totalXp: number;

  // Progress
  articlesRead: number;

  vocabularyLearned: number;

  practiceCompleted: number;

  roomsJoined: number;

  cardsCollected: number;

  // Level Test
  levelTestScore: number;

  levelTestTotal: number;

  levelTestAnswers?: LevelTestAnswer[];

  levelTestResult?: LevelTestResult | null;

  // Cards
  collectedCards?: CollectedCard[];

  // Rooms
  joinedRoomId?: string | null;

  // Settings
  settings?: AppSettings;

  // Updates
  seenUpdates?: string[];

  // Streak / daily progress
  progress?: {
    currentStreak?: number;
    longestStreak?: number;
    lastActiveDate?: string;
    dailyXp?: number;
    dailyGoal?: number;
  };
}
  
    


  


  