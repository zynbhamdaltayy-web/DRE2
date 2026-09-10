import type { Account } from "./accounts";

export type AchievementCategory =
  | "learning"
  | "practice"
  | "social"
  | "consistency"
  | "milestone"
  | "special";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  xpReward: number;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  xpReward: number;
  requirement: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first-article",
    title: "First Article",
    description: "Complete your first library article.",
    category: "learning",
    icon: "📖",
    xpReward: 10,
    requirement: 1,
  },
  {
    id: "article-reader",
    title: "Article Reader",
    description: "Complete 10 library articles.",
    category: "learning",
    icon: "📚",
    xpReward: 25,
    requirement: 10,
  },
  {
    id: "vocabulary-starter",
    title: "Vocabulary Starter",
    description: "Learn 25 vocabulary words.",
    category: "learning",
    icon: "🧠",
    xpReward: 15,
    requirement: 25,
  },
  {
    id: "vocabulary-builder",
    title: "Vocabulary Builder",
    description: "Learn 100 vocabulary words.",
    category: "learning",
    icon: "💡",
    xpReward: 40,
    requirement: 100,
  },
  {
    id: "practice-starter",
    title: "Practice Starter",
    description: "Complete 5 practice sessions.",
    category: "practice",
    icon: "✏️",
    xpReward: 15,
    requirement: 5,
  },
  {
    id: "practice-master",
    title: "Practice Master",
    description: "Complete 25 practice sessions.",
    category: "practice",
    icon: "🏆",
    xpReward: 50,
    requirement: 25,
  },
  {
    id: "first-room",
    title: "First Conversation",
    description: "Join your first speaking room.",
    category: "social",
    icon: "🎙️",
    xpReward: 10,
    requirement: 1,
  },
  {
    id: "room-explorer",
    title: "Room Explorer",
    description: "Join 10 speaking rooms.",
    category: "social",
    icon: "🌎",
    xpReward: 30,
    requirement: 10,
  },
  {
    id: "three-day-streak",
    title: "Getting Consistent",
    description: "Reach a 3-day learning streak.",
    category: "consistency",
    icon: "🔥",
    xpReward: 15,
    requirement: 3,
  },
  {
    id: "seven-day-streak",
    title: "One Week Strong",
    description: "Reach a 7-day learning streak.",
    category: "consistency",
    icon: "🔥",
    xpReward: 30,
    requirement: 7,
  },
  {
    id: "thirty-day-streak",
    title: "Thirty Days",
    description: "Reach a 30-day learning streak.",
    category: "consistency",
    icon: "🌟",
    xpReward: 100,
    requirement: 30,
  },
  {
    id: "level-test",
    title: "Level Test Completed",
    description: "Complete the DRE2learn level test.",
    category: "milestone",
    icon: "🎓",
    xpReward: 50,
    requirement: 1,
  },
  {
    id: "first-identity",
    title: "DRE2learn Identity",
    description: "Earn your DRE2learn identity card.",
    category: "milestone",
    icon: "🪪",
    xpReward: 25,
    requirement: 1,
  },
  {
    id: "xp-100",
    title: "100 XP",
    description: "Reach 100 XP.",
    category: "milestone",
    icon: "💫",
    xpReward: 10,
    requirement: 100,
  },
  {
    id: "xp-500",
    title: "500 XP",
    description: "Reach 500 XP.",
    category: "milestone",
    icon: "⭐",
    xpReward: 25,
    requirement: 500,
  },
  {
    id: "xp-1000",
    title: "1000 XP",
    description: "Reach 1000 XP.",
    category: "milestone",
    icon: "👑",
    xpReward: 50,
    requirement: 1000,
  },
];

function now(): string {
  return new Date().toISOString();
}

export function getAchievementDefinition(
  id: string,
): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find(
    (achievement) => achievement.id === id,
  );
}

export function createAchievement(
  definition: AchievementDefinition,
  progress = 0,
): Achievement {
  const safeProgress = Math.max(
    0,
    Math.min(progress, definition.requirement),
  );

  const unlocked =
    safeProgress >= definition.requirement;

  return {
    ...definition,
    progress: safeProgress,
    unlocked,
    unlockedAt: unlocked ? now() : undefined,
  };
}

export function calculateAchievementProgress(
  definition: AchievementDefinition,
  value: number,
): Achievement {
  return createAchievement(
    definition,
    Math.max(0, value),
  );
}

export function getUnlockedAchievements(
  achievements: Achievement[],
): Achievement[] {
  return achievements.filter(
    (achievement) => achievement.unlocked,
  );
}

export function getLockedAchievements(
  achievements: Achievement[],
): Achievement[] {
  return achievements.filter(
    (achievement) => !achievement.unlocked,
  );
}

export function getAchievementProgressPercentage(
  achievement: Achievement,
): number {
  if (achievement.requirement <= 0) {
    return 100;
  }

  return Math.min(
    100,
    Math.round(
      (achievement.progress /
        achievement.requirement) *
        100,
    ),
  );
}

export function getAchievementXP(
  achievements: Achievement[],
): number {
  return getUnlockedAchievements(
    achievements,
  ).reduce(
    (total, achievement) =>
      total + achievement.xpReward,
    0,
  );
}

export function createDefaultAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map(
    (definition) =>
      createAchievement(definition),
  );
}

export function updateAchievements(
  achievements: Achievement[],
  stats: {
    articlesRead: number;
    vocabularyLearned: number;
    practiceCompleted: number;
    roomsJoined: number;
    currentStreak: number;
    levelTestCompleted: boolean;
    identityCardIssued: boolean;
    totalXp: number;
  },
): Achievement[] {
  const values: Record<string, number> = {
    "first-article": stats.articlesRead,
    "article-reader": stats.articlesRead,
    "vocabulary-starter": stats.vocabularyLearned,
    "vocabulary-builder": stats.vocabularyLearned,
    "practice-starter": stats.practiceCompleted,
    "practice-master": stats.practiceCompleted,
    "first-room": stats.roomsJoined,
    "room-explorer": stats.roomsJoined,
    "three-day-streak": stats.currentStreak,
    "seven-day-streak": stats.currentStreak,
    "thirty-day-streak": stats.currentStreak,
    "level-test": stats.levelTestCompleted ? 1 : 0,
    "first-identity": stats.identityCardIssued ? 1 : 0,
    "xp-100": stats.totalXp,
    "xp-500": stats.totalXp,
    "xp-1000": stats.totalXp,
  };

  return achievements.map((achievement) => {
    const value = values[achievement.id] ?? 0;

    if (
      achievement.unlocked &&
      achievement.unlockedAt
    ) {
      return achievement;
    }

    const updated = createAchievement(
      {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        requirement: achievement.requirement,
      },
      value,
    );

    return {
      ...updated,
      unlockedAt:
        updated.unlocked
          ? achievement.unlockedAt ?? now()
          : undefined,
    };
  });
}

export function canViewAchievementManager(
  account: Account,
): boolean {
  return (
    account.status === "active" &&
    (account.role === "owner" ||
      account.role === "admin")
  );
}