import type {
  AppState,
  Avatar,
  Level,
} from "./types";

export const defaultAvatar: Avatar = {
  gender: "girl",
  skinTone: "medium",
  eyeColor: "brown",
  hairStyle: "long",
  hairColor: "black",
  shirtColor: "orange",
  hijab: false,
};

export const initialState: AppState = {
  page: "welcome",

  user: null,

  vocabulary: [],

  completedArticles: [],

  practiceScore: 0,

  practiceAnswered: 0,

  currentArticleId: null,

  selectedLibraryLevel: "A1",

  selectedTopic: "Daily Life",

  selectedPracticeLevel: "A1",

  isAuthenticated: false,
};

export function createDefaultAvatar(): Avatar {
  return {
    ...defaultAvatar,
  };
}

export function createDefaultState(): AppState {
  return {
    ...initialState,

    vocabulary: [],

    completedArticles: [],

    user: null,

    currentArticleId: null,
  };
}

export function normalizeLevel(
  value: string,
): Level {
  const levels: Level[] = [
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
  ];

  if (
    levels.includes(value as Level)
  ) {
    return value as Level;
  }

  return "A1";
}