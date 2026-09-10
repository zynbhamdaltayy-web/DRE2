import type {
  CardDifficulty,
  LearningCardType,
  Level,
} from "../types";

import {
  CARD_XP_COST,
  CARD_XP_REWARD,
  type LearningCard,
} from "./cards";

// ======================================================
// ORIGINAL 36 CARDS
// ======================================================

const originalCards: LearningCard[] = [
  // =========================
  // A1
  // =========================

  {
    id: "a1-word-001",
    type: "word" as LearningCardType,
    level: "A1" as Level,
    title: "Happy",
    content: "Use the word “happy” in a simple sentence.",
    topic: "Daily Life",
    difficulty: "easy" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "a1-phrase-001",
    type: "phrase" as LearningCardType,
    level: "A1" as Level,
    title: "Self Introduction",
    content:
      "Introduce yourself using your name, age, and where you are from.",
    topic: "Introductions",
    difficulty: "easy" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "a1-question-001",
    type: "question" as LearningCardType,
    level: "A1" as Level,
    title: "Morning Routine",
    content: "What do you usually do in the morning?",
    topic: "Daily Life",
    difficulty: "easy" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "a1-challenge-001",
    type: "challenge" as LearningCardType,
    level: "A1" as Level,
    title: "Favorite Food",
    content: "Talk about your favorite food for 30 seconds.",
    topic: "Food",
    difficulty: "easy" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "a1-roleplay-001",
    type: "roleplay" as LearningCardType,
    level: "A1" as Level,
    title: "At the Café",
    content:
      "Pretend you are ordering a drink or food at a café.",
    topic: "Food",
    difficulty: "easy" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "a1-mystery-001",
    type: "mystery" as LearningCardType,
    level: "A1" as Level,
    title: "Mystery Animal",
    content:
      "Describe an animal without saying its name. Let the other person guess it.",
    topic: "Animals",
    difficulty: "easy" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  // =========================
  // A2
  // =========================

  {
    id: "a2-word-001",
    type: "word" as LearningCardType,
    level: "A2" as Level,
    title: "Comfortable",
    content:
      "Use the word “comfortable” in a sentence about your daily life.",
    topic: "Daily Life",
    difficulty: "easy" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "a2-phrase-001",
    type: "phrase" as LearningCardType,
    level: "A2" as Level,
    title: "Asking for Directions",
    content:
      "Practice asking someone how to get to a place.",
    topic: "Travel",
    difficulty: "easy" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "a2-question-001",
    type: "question" as LearningCardType,
    level: "A2" as Level,
    title: "A Place to Visit",
    content:
      "What place would you like to visit and why?",
    topic: "Travel",
    difficulty: "easy" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "a2-challenge-001",
    type: "challenge" as LearningCardType,
    level: "A2" as Level,
    title: "No Repeated Adjective",
    content:
      "Talk about your school for 30 seconds without repeating the same adjective.",
    topic: "School",
    difficulty: "medium" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "a2-roleplay-001",
    type: "roleplay" as LearningCardType,
    level: "A2" as Level,
    title: "Weekend Plans",
    content:
      "Roleplay a conversation about your plans for the weekend.",
    topic: "Free Time",
    difficulty: "medium" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "a2-mystery-001",
    type: "mystery" as LearningCardType,
    level: "A2" as Level,
    title: "Mystery Object",
    content:
      "Describe an everyday object without saying its name. Let the other person guess it.",
    topic: "Everyday Objects",
    difficulty: "medium" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  // =========================
  // B1
  // =========================

  {
    id: "b1-word-001",
    type: "word" as LearningCardType,
    level: "B1" as Level,
    title: "Opportunity",
    content:
      "Explain what an opportunity means and give a personal example.",
    topic: "Education",
    difficulty: "medium" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "b1-phrase-001",
    type: "phrase" as LearningCardType,
    level: "B1" as Level,
    title: "Polite Disagreement",
    content:
      "Practice politely disagreeing with another person's opinion.",
    topic: "Communication",
    difficulty: "medium" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "b1-question-001",
    type: "question" as LearningCardType,
    level: "B1" as Level,
    title: "Homework",
    content:
      "Do you think homework is useful? Explain your opinion.",
    topic: "Education",
    difficulty: "medium" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "b1-challenge-001",
    type: "challenge" as LearningCardType,
    level: "B1" as Level,
    title: "No Like",
    content:
      "Talk about a hobby for 45 seconds without using the word “like”.",
    topic: "Hobbies",
    difficulty: "medium" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "b1-roleplay-001",
    type: "roleplay" as LearningCardType,
    level: "B1" as Level,
    title: "Solve the Problem",
    content:
      "Roleplay a situation where you and another person need to solve a problem at an event.",
    topic: "Problem Solving",
    difficulty: "medium" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "b1-mystery-001",
    type: "mystery" as LearningCardType,
    level: "B1" as Level,
    title: "No Why",
    content:
      "Ask a meaningful question without using the word “why”.",
    topic: "Communication",
    difficulty: "medium" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  // =========================
  // B2
  // =========================

  {
    id: "b2-word-001",
    type: "word" as LearningCardType,
    level: "B2" as Level,
    title: "Perspective",
    content:
      "Explain what perspective means and use it in a discussion.",
    topic: "Ideas",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "b2-phrase-001",
    type: "phrase" as LearningCardType,
    level: "B2" as Level,
    title: "Different Perspective",
    content:
      "Practice expressing that someone has a different perspective.",
    topic: "Discussion",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "b2-question-001",
    type: "question" as LearningCardType,
    level: "B2" as Level,
    title: "Social Media Communication",
    content:
      "How has social media changed the way people communicate?",
    topic: "Technology",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "b2-challenge-001",
    type: "challenge" as LearningCardType,
    level: "B2" as Level,
    title: "Difficult Decision",
    content:
      "Talk about a difficult decision for one minute and explain your reasoning.",
    topic: "Life",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "b2-roleplay-001",
    type: "roleplay" as LearningCardType,
    level: "B2" as Level,
    title: "School Uniform Debate",
    content:
      "Roleplay a debate about whether schools should require uniforms.",
    topic: "Education",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "b2-mystery-001",
    type: "mystery" as LearningCardType,
    level: "B2" as Level,
    title: "Question Switch",
    content:
      "Answer a question, then immediately turn your answer into a new question for the other person.",
    topic: "Communication",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  // =========================
  // C1
  // =========================

  {
    id: "c1-word-001",
    type: "word" as LearningCardType,
    level: "C1" as Level,
    title: "Assumption vs Evidence",
    content:
      "Explain the difference between an assumption and evidence and give an example.",
    topic: "Critical Thinking",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "c1-phrase-001",
    type: "phrase" as LearningCardType,
    level: "C1" as Level,
    title: "Qualify an Argument",
    content:
      "Practice making an argument more precise by qualifying your claim.",
    topic: "Academic English",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "c1-question-001",
    type: "question" as LearningCardType,
    level: "C1" as Level,
    title: "Technology and Social Problems",
    content:
      "Can technology solve major social problems? Discuss both sides.",
    topic: "Technology",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "c1-challenge-001",
    type: "challenge" as LearningCardType,
    level: "C1" as Level,
    title: "Explain It Simply",
    content:
      "Choose a complex idea and explain it clearly to someone who knows nothing about it.",
    topic: "Communication",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "c1-roleplay-001",
    type: "roleplay" as LearningCardType,
    level: "C1" as Level,
    title: "Education Reform",
    content:
      "Roleplay a formal discussion about how education should be improved.",
    topic: "Education",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "c1-mystery-001",
    type: "mystery" as LearningCardType,
    level: "C1" as Level,
    title: "Forbidden Words",
    content:
      "Speak for one minute without using the words “good”, “bad”, “thing”, or “very”.",
    topic: "Vocabulary",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  // =========================
  // C2
  // =========================

  {
    id: "c2-word-001",
    type: "word" as LearningCardType,
    level: "C2" as Level,
    title: "Ambiguous",
    content:
      "Explain the meaning of “ambiguous” and give an example of an ambiguous statement.",
    topic: "Advanced English",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "c2-phrase-001",
    type: "phrase" as LearningCardType,
    level: "C2" as Level,
    title: "Challenge an Assumption",
    content:
      "Practice respectfully challenging someone's assumption during a debate.",
    topic: "Debate",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "c2-question-001",
    type: "question" as LearningCardType,
    level: "C2" as Level,
    title: "Communication and Influence",
    content:
      "To what extent does communication influence the way people understand reality?",
    topic: "Philosophy",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "c2-challenge-001",
    type: "challenge" as LearningCardType,
    level: "C2" as Level,
    title: "Complex Concept",
    content:
      "Choose a complex concept and explain it clearly in 45 seconds.",
    topic: "Communication",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "c2-roleplay-001",
    type: "roleplay" as LearningCardType,
    level: "C2" as Level,
    title: "Defend the Opposite",
    content:
      "Defend a position that you personally disagree with and make the strongest possible argument for it.",
    topic: "Debate",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },

  {
    id: "c2-mystery-001",
    type: "mystery" as LearningCardType,
    level: "C2" as Level,
    title: "No I, You, or We",
    content:
      "Speak for one minute about an advanced topic without using “I”, “you”, or “we”.",
    topic: "Advanced English",
    difficulty: "hard" as CardDifficulty,
    xpCost: CARD_XP_COST,
    xpReward: CARD_XP_REWARD,
  },
];

// ======================================================
// GENERATED CARD CONFIGURATION
// ======================================================

const LEVELS: Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

const CARD_TYPES: LearningCardType[] = [
  "word",
  "phrase",
  "question",
  "challenge",
  "roleplay",
  "mystery",
];

const DIFFICULTIES: Record<Level, CardDifficulty> = {
  A1: "easy",
  A2: "easy",
  B1: "medium",
  B2: "hard",
  C1: "hard",
  C2: "hard",
};

const TOPICS: Record<Level, string[]> = {
  A1: [
    "Daily Life",
    "Introductions",
    "Food",
    "Animals",
    "Family",
    "School",
    "Colors",
    "Numbers",
    "Weather",
    "Home",
  ],

  A2: [
    "Travel",
    "Free Time",
    "School",
    "Food",
    "Daily Life",
    "Shopping",
    "Health",
    "Hobbies",
    "Transport",
    "Everyday Objects",
  ],

  B1: [
    "Education",
    "Communication",
    "Hobbies",
    "Problem Solving",
    "Travel",
    "Work",
    "Technology",
    "Environment",
    "Culture",
    "Health",
  ],

  B2: [
    "Ideas",
    "Discussion",
    "Technology",
    "Life",
    "Education",
    "Society",
    "Media",
    "Science",
    "Culture",
    "Debate",
  ],

  C1: [
    "Critical Thinking",
    "Academic English",
    "Technology",
    "Communication",
    "Education",
    "Research",
    "Society",
    "Ethics",
    "Culture",
    "Vocabulary",
  ],

  C2: [
    "Advanced English",
    "Debate",
    "Philosophy",
    "Communication",
    "Research",
    "Critical Thinking",
    "Ethics",
    "Academic English",
    "Society",
    "Language",
  ],
};

// ======================================================
// CONTENT BANKS
// ======================================================

const WORD_CONTENT: string[] = [
  "Use this vocabulary item in a clear sentence.",
  "Explain the meaning of the vocabulary item and use it naturally.",
  "Create a sentence using this vocabulary item.",
  "Give a simple example that shows how this word is used.",
  "Use the word in a sentence connected to your daily life.",
  "Explain when you would normally use this word.",
  "Give a synonym or related idea and then use the word.",
  "Describe a situation where this vocabulary would be useful.",
];

const PHRASE_CONTENT: string[] = [
  "Practice using this phrase in a natural conversation.",
  "Use this phrase to respond politely to another speaker.",
  "Create a short dialogue using this phrase.",
  "Practice saying this phrase in a realistic situation.",
  "Use this phrase to express your idea clearly.",
  "Turn this phrase into part of a short conversation.",
  "Use the phrase with another suitable sentence.",
  "Explain when this phrase would be useful.",
];

const QUESTION_CONTENT: string[] = [
  "Answer the question and explain your opinion.",
  "Give a complete answer and support it with an example.",
  "Answer naturally and ask a follow-up question.",
  "Explain your answer using at least two details.",
  "Give your opinion and explain why.",
  "Answer from your personal experience.",
  "Compare two possible answers before choosing one.",
  "Give a thoughtful answer and continue the discussion.",
];

const CHALLENGE_CONTENT: string[] = [
  "Complete the speaking challenge without stopping.",
  "Speak continuously and try to use varied vocabulary.",
  "Complete the challenge within the suggested time.",
  "Give a clear answer while following the special rule.",
  "Try to complete the task without repeating the same words.",
  "Complete the challenge and explain your reasoning.",
  "Keep speaking naturally while following the challenge rule.",
  "Finish the challenge with a clear concluding sentence.",
];

const ROLEPLAY_CONTENT: string[] = [
  "Roleplay the situation with another learner.",
  "Act out the situation and respond naturally.",
  "Imagine you are in this situation and continue the conversation.",
  "Take one role and keep the conversation going.",
  "Respond as naturally as possible to the other person's ideas.",
  "Create a realistic dialogue around the situation.",
  "Stay in character and solve the situation through conversation.",
  "Complete the roleplay using clear and appropriate language.",
];

const MYSTERY_CONTENT: string[] = [
  "Complete the mystery mission without revealing the answer too quickly.",
  "Follow the secret rule and let the other learner guess.",
  "Complete the mission while avoiding the forbidden clue.",
  "Give enough information to make the mystery solvable.",
  "Try to confuse the other learner without breaking the rules.",
  "Finish the mystery challenge using creative language.",
  "Keep the target hidden while communicating clearly.",
  "Complete the unusual mission without revealing the secret.",
];

// ======================================================
// GENERATED CARD BUILDER
// ======================================================

function getContentByType(
  type: LearningCardType,
  topic: string,
  level: Level,
  index: number,
): string {
  const position = index % 8;

  if (type === "word") {
    return `${WORD_CONTENT[position]} Topic: ${topic}. Level: ${level}.`;
  }

  if (type === "phrase") {
    return `${PHRASE_CONTENT[position]} Topic: ${topic}. Level: ${level}.`;
  }

  if (type === "question") {
    return `${QUESTION_CONTENT[position]} Topic: ${topic}. Level: ${level}.`;
  }

  if (type === "challenge") {
    return `${CHALLENGE_CONTENT[position]} Topic: ${topic}. Level: ${level}.`;
  }

  if (type === "roleplay") {
    return `${ROLEPLAY_CONTENT[position]} Topic: ${topic}. Level: ${level}.`;
  }

  return `${MYSTERY_CONTENT[position]} Topic: ${topic}. Level: ${level}.`;
}

function buildGeneratedCard(
  level: Level,
  index: number,
): LearningCard {
  const type = CARD_TYPES[index % CARD_TYPES.length];

  const topicList = TOPICS[level];

  const topic =
    topicList[
      Math.floor(index / CARD_TYPES.length) %
        topicList.length
    ];

  const difficulty = DIFFICULTIES[level];

  const serial = String(index + 1).padStart(4, "0");

  return {
    id: `${level.toLowerCase()}-generated-${serial}`,

    type,

    level,

    title: `${topic} ${type} ${serial}`,

    content: getContentByType(
      type,
      topic,
      level,
      index,
    ),

    topic,

    difficulty,

    xpCost: CARD_XP_COST,

    xpReward: CARD_XP_REWARD,
  };
}

// ======================================================
// GENERATE 9,000 NEW CARDS FOR EACH LEVEL
// ======================================================

const generatedCards: LearningCard[] = [];

const NEW_CARDS_PER_LEVEL = 9000;

for (const level of LEVELS) {
  for (
    let index = 0;
    index < NEW_CARDS_PER_LEVEL;
    index += 1
  ) {
    generatedCards.push(
      buildGeneratedCard(level, index),
    );
  }
}

// ======================================================
// FINAL CARD CATALOG
// ======================================================

export const cardData: LearningCard[] = [
  ...originalCards,
  ...generatedCards,
];

// ======================================================
// COUNTS
// ======================================================

export const ORIGINAL_CARD_COUNT =
  originalCards.length;

export const NEW_CARD_COUNT_PER_LEVEL =
  NEW_CARDS_PER_LEVEL;

export const TOTAL_NEW_CARD_COUNT =
  NEW_CARDS_PER_LEVEL * LEVELS.length;

export const TOTAL_CARD_COUNT =
  cardData.length;

// ======================================================
// GETTERS
// ======================================================

export function getAllCards(): LearningCard[] {
  return [...cardData];
}

export function getCardById(
  cardId: string,
): LearningCard | undefined {
  return cardData.find(
    (card) => card.id === cardId,
  );
}

export function getCardsByLevel(
  level: Level,
): LearningCard[] {
  return cardData.filter(
    (card) => card.level === level,
  );
}

export function getCardsByType(
  type: LearningCardType,
): LearningCard[] {
  return cardData.filter(
    (card) => card.type === type,
  );
}

export function getCardsByTopic(
  topic: string,
): LearningCard[] {
  return cardData.filter(
    (card) => card.topic === topic,
  );
}

export function getCardsByDifficulty(
  difficulty: CardDifficulty,
): LearningCard[] {
  return cardData.filter(
    (card) => card.difficulty === difficulty,
  );
}

export function getCardsForLevelAndTopic(
  level: Level,
  topic: string,
): LearningCard[] {
  return cardData.filter(
    (card) =>
      card.level === level &&
      card.topic === topic,
  );
}

export function getMysteryCards(): LearningCard[] {
  return cardData.filter(
    (card) => card.type === "mystery",
  );
}

export function getCardCount(): number {
  return cardData.length;
}

export function getCardCountByLevel(
  level: Level,
): number {
  return getCardsByLevel(level).length;
}

export function getCardCountByType(
  type: LearningCardType,
): number {
  return getCardsByType(type).length;
}

export const CARD_COUNT = cardData.length;

export const CARD_XP_COST_VALUE =
  CARD_XP_COST;

export const CARD_XP_REWARD_VALUE =
  CARD_XP_REWARD;