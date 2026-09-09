import type {
  Level,
  LevelTestQuestion,
  LevelTestSkill,
} from "../types";

/*
 * =========================================================
 * DRE2learn Progressive / Adaptive Level Test
 * =========================================================
 *
 * Maximum questions: 50
 *
 * Skills:
 * - Reading
 * - Listening
 * - Writing
 * - Grammar & Vocabulary
 *
 * CEFR:
 * A1 → A2 → B1 → B2 → C1 → C2
 *
 * IMPORTANT:
 * This file contains both:
 *
 * 1. The question bank
 * 2. The progressive/adaptive scoring engine
 *
 * Writing questions are NOT automatically scored by
 * isAnswerCorrect(). They use the writing rubric below.
 */

/* =========================================================
 * CONSTANTS
 * ========================================================= */

export const MAX_LEVEL_TEST_QUESTIONS = 50;

export const MIN_LEVEL_TEST_QUESTIONS = 12;

export const EARLY_FINISH_MIN_QUESTIONS = 20;

export const levelOrder: Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

export const levelDescriptions: Record<Level, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-Intermediate",
  C1: "Advanced",
  C2: "Proficient",
};

/*
 * Minimum objective performance needed to demonstrate
 * a CEFR level with reasonable confidence.
 */
export const LEVEL_MASTERY_THRESHOLD = 0.6;

/*
 * Strong performance means the learner is ready to
 * move toward the next CEFR level.
 */
export const LEVEL_ADVANCE_THRESHOLD = 0.7;

/*
 * Weak performance suggests that the current level
 * may be the learner's ceiling.
 */
export const LEVEL_STOP_THRESHOLD = 0.4;

/*
 * Number of recent answers used by the adaptive engine.
 */
export const ADAPTIVE_WINDOW_SIZE = 4;

/* =========================================================
 * QUESTION BANK
 * ========================================================= */

export const levelTestQuestions: LevelTestQuestion[] = [
  /* =======================================================
   * A1 — FOUNDATION
   * ======================================================= */

  {
    id: "a1-g-01",
    level: "A1",
    skill: "grammar",
    type: "multiple-choice",
    question: "My name ___ Sara.",
    options: ["am", "is", "are", "be"],
    correctAnswer: "is",
    points: 1,
  },

  {
    id: "a1-g-02",
    level: "A1",
    skill: "grammar",
    type: "multiple-choice",
    question: "I ___ from Iraq.",
    options: ["am", "is", "are", "be"],
    correctAnswer: "am",
    points: 1,
  },

  {
    id: "a1-g-03",
    level: "A1",
    skill: "grammar",
    type: "multiple-choice",
    question: "She ___ a student.",
    options: ["am", "is", "are", "be"],
    correctAnswer: "is",
    points: 1,
  },

  {
    id: "a1-r-01",
    level: "A1",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "My name is Lina. I am fifteen years old. I live in Baghdad with my family. I have one brother and one sister.",
    question: "Where does Lina live?",
    options: [
      "Basra",
      "Baghdad",
      "Mosul",
      "Erbil",
    ],
    correctAnswer: "Baghdad",
    points: 1,
  },

  {
    id: "a1-r-02",
    level: "A1",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "Ali gets up at seven o'clock every morning. He eats breakfast and goes to school at eight.",
    question: "What time does Ali go to school?",
    options: [
      "Seven o'clock",
      "Eight o'clock",
      "Nine o'clock",
      "Ten o'clock",
    ],
    correctAnswer: "Eight o'clock",
    points: 1,
  },

  {
    id: "a1-l-01",
    level: "A1",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/a1-01.mp3",
    question: "Listen and choose the person's age.",
    options: [
      "13",
      "14",
      "15",
      "16",
    ],
    correctAnswer: "15",
    points: 1,
  },

  {
    id: "a1-l-02",
    level: "A1",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/a1-02.mp3",
    question: "Listen and choose the correct place.",
    options: [
      "School",
      "Hospital",
      "Library",
      "Airport",
    ],
    correctAnswer: "Library",
    points: 1,
  },

  {
    id: "a1-w-01",
    level: "A1",
    skill: "writing",
    type: "writing",
    question: "Introduce yourself.",
    writingPrompt:
      "Write 3–5 simple sentences about yourself. Include your name, age, country, and one thing you like.",
    points: 2,
  },

  /* =======================================================
   * A2 — ELEMENTARY
   * ======================================================= */

  {
    id: "a2-g-01",
    level: "A2",
    skill: "grammar",
    type: "multiple-choice",
    question: "We ___ to the park yesterday.",
    options: [
      "go",
      "goes",
      "went",
      "going",
    ],
    correctAnswer: "went",
    points: 1,
  },

  {
    id: "a2-g-02",
    level: "A2",
    skill: "grammar",
    type: "multiple-choice",
    question: "She has lived here ___ 2022.",
    options: [
      "for",
      "since",
      "during",
      "from",
    ],
    correctAnswer: "since",
    points: 1,
  },

  {
    id: "a2-g-03",
    level: "A2",
    skill: "grammar",
    type: "multiple-choice",
    question: "This book is ___ than that one.",
    options: [
      "interesting",
      "more interesting",
      "most interesting",
      "interest",
    ],
    correctAnswer: "more interesting",
    points: 1,
  },

  {
    id: "a2-r-01",
    level: "A2",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "Maya started learning English two years ago. At first, she found speaking difficult. Now she practices every day by watching videos and talking to other learners online.",
    question:
      "How does Maya practice English now?",
    options: [
      "Only by reading books",
      "By watching videos and talking to learners",
      "By going to an English-speaking country",
      "By studying mathematics",
    ],
    correctAnswer:
      "By watching videos and talking to learners",
    points: 1,
  },

  {
    id: "a2-r-02",
    level: "A2",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "Tom wanted to buy a new bicycle, but he did not have enough money. He decided to save a little money every week.",
    question:
      "Why did Tom decide to save money?",
    options: [
      "He wanted to travel",
      "He wanted to buy a bicycle",
      "He lost his bicycle",
      "He wanted to buy a phone",
    ],
    correctAnswer:
      "He wanted to buy a bicycle",
    points: 1,
  },

  {
    id: "a2-l-01",
    level: "A2",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/a2-01.mp3",
    question:
      "Listen and choose what the speaker did yesterday.",
    options: [
      "Visited a friend",
      "Went shopping",
      "Stayed at home",
      "Went to school",
    ],
    correctAnswer: "Visited a friend",
    points: 1,
  },

  {
    id: "a2-l-02",
    level: "A2",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/a2-02.mp3",
    question:
      "Listen and choose the reason the speaker gives.",
    options: [
      "The weather was bad",
      "The bus was late",
      "The shop was closed",
      "The speaker was tired",
    ],
    correctAnswer: "The bus was late",
    points: 1,
  },

  {
    id: "a2-w-01",
    level: "A2",
    skill: "writing",
    type: "writing",
    question: "Write about your daily routine.",
    writingPrompt:
      "Write 5–7 sentences about what you usually do during a normal day.",
    points: 2,
  },

  /* =======================================================
   * B1 — INTERMEDIATE
   * ======================================================= */

  {
    id: "b1-g-01",
    level: "B1",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "If I have enough time, I ___ you tomorrow.",
    options: [
      "visit",
      "visited",
      "will visit",
      "would visit",
    ],
    correctAnswer: "will visit",
    points: 1,
  },

  {
    id: "b1-g-02",
    level: "B1",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "I was tired, ___ I finished my homework.",
    options: [
      "because",
      "but",
      "so",
      "therefore",
    ],
    correctAnswer: "but",
    points: 1,
  },

  {
    id: "b1-g-03",
    level: "B1",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "She asked me where I ___.",
    options: [
      "live",
      "lived",
      "will live",
      "am living",
    ],
    correctAnswer: "lived",
    points: 1,
  },

  {
    id: "b1-r-01",
    level: "B1",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "Many students believe that studying for long hours is the best way to succeed. However, research suggests that taking regular breaks can improve concentration. Short breaks allow the brain to rest before returning to a difficult task.",
    question:
      "What is the main idea of the passage?",
    options: [
      "Students should never study for long hours.",
      "Taking breaks can help students concentrate.",
      "Research is unnecessary for students.",
      "Studying is always difficult.",
    ],
    correctAnswer:
      "Taking breaks can help students concentrate.",
    points: 1,
  },

  {
    id: "b1-r-02",
    level: "B1",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "Learning another language can expose people to new ways of thinking. It can also help learners communicate with people whose cultural backgrounds are different from their own.",
    question:
      "What is one benefit of learning another language mentioned in the passage?",
    options: [
      "It eliminates cultural differences.",
      "It makes communication unnecessary.",
      "It can introduce learners to new ways of thinking.",
      "It guarantees academic success.",
    ],
    correctAnswer:
      "It can introduce learners to new ways of thinking.",
    points: 1,
  },

  {
    id: "b1-l-01",
    level: "B1",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/b1-01.mp3",
    question:
      "Listen and identify the speaker's main reason for learning English.",
    options: [
      "For travel",
      "For university",
      "For entertainment",
      "For sport",
    ],
    correctAnswer: "For university",
    points: 1,
  },

  {
    id: "b1-l-02",
    level: "B1",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/b1-02.mp3",
    question:
      "What problem does the speaker describe?",
    options: [
      "Lack of time",
      "Lack of money",
      "Poor internet",
      "Difficulty finding books",
    ],
    correctAnswer: "Lack of time",
    points: 1,
  },

  {
    id: "b1-w-01",
    level: "B1",
    skill: "writing",
    type: "writing",
    question:
      "Why is learning languages useful?",
    writingPrompt:
      "Write 80–100 words explaining why learning another language can be useful.",
    points: 3,
  },

  /* =======================================================
   * B2 — UPPER INTERMEDIATE
   * ======================================================= */

  {
    id: "b2-g-01",
    level: "B2",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "By the time we arrived, the film ___.",
    options: [
      "started",
      "had started",
      "has started",
      "starts",
    ],
    correctAnswer: "had started",
    points: 1,
  },

  {
    id: "b2-g-02",
    level: "B2",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "Despite ___ tired, she continued studying.",
    options: [
      "be",
      "being",
      "was",
      "been",
    ],
    correctAnswer: "being",
    points: 1,
  },

  {
    id: "b2-g-03",
    level: "B2",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "The word 'significant' is closest in meaning to:",
    options: [
      "unimportant",
      "considerable",
      "temporary",
      "ordinary",
    ],
    correctAnswer: "considerable",
    points: 1,
  },

  {
    id: "b2-r-01",
    level: "B2",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "Although online education has expanded access to learning, it also requires students to become more independent. Without the structure of a traditional classroom, learners must manage their time, maintain motivation, and seek help when necessary.",
    question:
      "What does the passage suggest about online education?",
    options: [
      "It requires less responsibility from students.",
      "It completely replaces traditional education.",
      "It gives learners greater responsibility for managing their learning.",
      "It prevents students from seeking help.",
    ],
    correctAnswer:
      "It gives learners greater responsibility for managing their learning.",
    points: 1,
  },

  {
    id: "b2-r-02",
    level: "B2",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "Social media allows information to spread rapidly, but speed does not necessarily guarantee accuracy. Users should therefore evaluate the source of information before sharing it with others.",
    question:
      "What does the author imply?",
    options: [
      "Fast information is always reliable.",
      "People should verify information before sharing it.",
      "Social media should never be used.",
      "Information cannot spread online.",
    ],
    correctAnswer:
      "People should verify information before sharing it.",
    points: 1,
  },

  {
    id: "b2-l-01",
    level: "B2",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/b2-01.mp3",
    question:
      "What is the speaker's main argument?",
    options: [
      "Technology should be avoided.",
      "Technology can be useful when used responsibly.",
      "Students should stop using phones.",
      "Online learning is ineffective.",
    ],
    correctAnswer:
      "Technology can be useful when used responsibly.",
    points: 1,
  },

  {
    id: "b2-l-02",
    level: "B2",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/b2-02.mp3",
    question:
      "What concern does the speaker express?",
    options: [
      "Cost",
      "Privacy",
      "Transportation",
      "Weather",
    ],
    correctAnswer: "Privacy",
    points: 1,
  },

  {
    id: "b2-w-01",
    level: "B2",
    skill: "writing",
    type: "writing",
    question:
      "Technology and education",
    writingPrompt:
      "Write 120–150 words discussing whether technology has improved education.",
    points: 3,
  },

  /* =======================================================
   * C1 — ADVANCED
   * ======================================================= */

  {
    id: "c1-g-01",
    level: "C1",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "Had I known about the problem, I ___ earlier.",
    options: [
      "would act",
      "would have acted",
      "will act",
      "acted",
    ],
    correctAnswer:
      "would have acted",
    points: 1,
  },

  {
    id: "c1-g-02",
    level: "C1",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "The committee's decision was met with considerable ___.",
    options: [
      "controversy",
      "controversial",
      "controversially",
      "controverse",
    ],
    correctAnswer: "controversy",
    points: 1,
  },

  {
    id: "c1-g-03",
    level: "C1",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "She insisted that he ___ the report immediately.",
    options: [
      "revises",
      "revised",
      "revise",
      "revising",
    ],
    correctAnswer: "revise",
    points: 1,
  },

  {
    id: "c1-r-01",
    level: "C1",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "Public policy is rarely shaped by evidence alone. Political priorities, public opinion, institutional interests, and economic constraints can all influence which evidence is considered persuasive. Consequently, policymakers may interpret identical findings in markedly different ways.",
    question:
      "What is the central argument?",
    options: [
      "Evidence has no role in policymaking.",
      "Political factors can influence how evidence is interpreted.",
      "Economic constraints always determine policy.",
      "Policymakers always agree about research findings.",
    ],
    correctAnswer:
      "Political factors can influence how evidence is interpreted.",
    points: 1,
  },

  {
    id: "c1-r-02",
    level: "C1",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "While technological innovation is frequently presented as inherently beneficial, its consequences depend largely on how societies choose to implement and regulate it. The same innovation may create opportunities for some groups while intensifying existing inequalities for others.",
    question:
      "What assumption underlies the passage?",
    options: [
      "Technology affects everyone identically.",
      "Innovation is always harmful.",
      "The effects of technology depend partly on social and institutional choices.",
      "Regulation prevents all technological progress.",
    ],
    correctAnswer:
      "The effects of technology depend partly on social and institutional choices.",
    points: 1,
  },

  {
    id: "c1-l-01",
    level: "C1",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/c1-01.mp3",
    question:
      "What position does the speaker ultimately support?",
    options: [
      "Complete opposition",
      "A qualified position",
      "No position",
      "A purely economic position",
    ],
    correctAnswer:
      "A qualified position",
    points: 1,
  },

  {
    id: "c1-l-02",
    level: "C1",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/c1-02.mp3",
    question:
      "What can be inferred from the speaker's tone?",
    options: [
      "The speaker is completely certain.",
      "The speaker is skeptical.",
      "The speaker is confused.",
      "The speaker is enthusiastic.",
    ],
    correctAnswer: "The speaker is skeptical.",
    points: 1,
  },

  {
    id: "c1-w-01",
    level: "C1",
    skill: "writing",
    type: "writing",
    question:
      "Education and opportunity",
    writingPrompt:
      "Write 160–200 words discussing whether access to education is sufficient to reduce social inequality. Support your position with reasons and examples.",
    points: 4,
  },

  /* =======================================================
   * C2 — PROFICIENT
   * ======================================================= */

  {
    id: "c2-g-01",
    level: "C2",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "The proposal was rejected as being fundamentally ___.",
    options: [
      "flawed",
      "flaw",
      "flawless",
      "flawing",
    ],
    correctAnswer: "flawed",
    points: 1,
  },

  {
    id: "c2-g-02",
    level: "C2",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "Her argument was persuasive, albeit somewhat ___.",
    options: [
      "tenuous",
      "tenuously",
      "tenuity",
      "tenuated",
    ],
    correctAnswer: "tenuous",
    points: 1,
  },

  {
    id: "c2-g-03",
    level: "C2",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "The findings call into ___ the validity of the assumption.",
    options: [
      "question",
      "doubtful",
      "questionable",
      "querying",
    ],
    correctAnswer: "question",
    points: 1,
  },

  {
    id: "c2-r-01",
    level: "C2",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "Attempts to reduce complex social phenomena to singular causal explanations are often appealing precisely because they offer conceptual clarity. Yet such explanations can obscure the interaction of structural, historical, and individual factors that collectively shape outcomes. The resulting simplicity may therefore come at the expense of explanatory adequacy.",
    question:
      "What criticism does the passage make?",
    options: [
      "Complex explanations are always incorrect.",
      "Simple explanations may sacrifice a sufficiently comprehensive account of reality.",
      "Social phenomena have no identifiable causes.",
      "Historical factors are irrelevant.",
    ],
    correctAnswer:
      "Simple explanations may sacrifice a sufficiently comprehensive account of reality.",
    points: 1,
  },

  {
    id: "c2-r-02",
    level: "C2",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "The apparent contradiction between individual autonomy and social interdependence is less paradoxical than it first appears. Autonomy is not necessarily constituted by isolation; rather, individuals may acquire the resources, knowledge, and capacities required for self-determination precisely through their relationships with others.",
    question:
      "What distinction does the passage make?",
    options: [
      "Autonomy necessarily requires isolation.",
      "Interdependence and autonomy can coexist.",
      "Individuals cannot determine their own actions.",
      "Social relationships prevent self-determination.",
    ],
    correctAnswer:
      "Interdependence and autonomy can coexist.",
    points: 1,
  },

  {
    id: "c2-l-01",
    level: "C2",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/c2-01.mp3",
    question:
      "What implicit assumption does the speaker challenge?",
    options: [
      "That the issue has only one cause",
      "That evidence matters",
      "That people communicate",
      "That education is useful",
    ],
    correctAnswer:
      "That the issue has only one cause",
    points: 1,
  },

  {
    id: "c2-l-02",
    level: "C2",
    skill: "listening",
    type: "multiple-choice",
    audioSrc: "/DRE2/audio/level-test/c2-02.mp3",
    question:
      "Which interpretation best captures the speaker's argument?",
    options: [
      "The issue is entirely straightforward.",
      "The issue requires a nuanced interpretation.",
      "The issue has no possible explanation.",
      "The speaker rejects all evidence.",
    ],
    correctAnswer:
      "The issue requires a nuanced interpretation.",
    points: 1,
  },

  {
    id: "c2-w-01",
    level: "C2",
    skill: "writing",
    type: "writing",
    question:
      "Complexity and decision-making",
    writingPrompt:
      "Write 200–250 words discussing whether simplifying complex problems helps or harms decision-making. Present a nuanced argument and address an opposing perspective.",
    points: 5,
  },

  /*
   * Additional C2 questions.
   *
   * These bring the complete question bank to exactly 50.
   */

  {
    id: "c2-g-04",
    level: "C2",
    skill: "grammar",
    type: "multiple-choice",
    question:
      "Rarely ___ such a comprehensive analysis of the issue.",
    options: [
      "we encounter",
      "do we encounter",
      "we do encounter",
      "encounter we",
    ],
    correctAnswer:
      "do we encounter",
    points: 1,
  },

  {
    id: "c2-r-03",
    level: "C2",
    skill: "reading",
    type: "multiple-choice",
    passage:
      "Institutional reforms may appear successful when judged by formal indicators, yet their practical consequences can remain uneven. A policy may therefore satisfy its stated objectives while simultaneously producing unintended effects that are less visible in conventional measures of success.",
    question:
      "What limitation of conventional evaluation does the passage identify?",
    options: [
      "Formal indicators always exaggerate failure.",
      "Policies never achieve their stated objectives.",
      "Conventional measures may overlook unintended consequences.",
      "Institutional reforms cannot be evaluated.",
    ],
    correctAnswer:
      "Conventional measures may overlook unintended consequences.",
    points: 1,
  },
];

/* =========================================================
 * BANK VALIDATION
 * ========================================================= */

/*
 * The final bank must contain exactly 50 questions.
 */
export const LEVEL_TEST_QUESTION_COUNT =
  levelTestQuestions.length;

/*
 * Runtime-safe validation helper.
 */
export function validateLevelTestBank(): {
  valid: boolean;
  count: number;
  expected: number;
  duplicateIds: string[];
  missingLevels: Level[];
} {
  const ids = new Set<string>();
  const duplicateIds: string[] = [];

  for (const question of levelTestQuestions) {
    if (ids.has(question.id)) {
      duplicateIds.push(question.id);
    }

    ids.add(question.id);
  }

  const missingLevels = levelOrder.filter(
    (level) =>
      !levelTestQuestions.some(
        (question) => question.level === level,
      ),
  );

  return {
    valid:
      levelTestQuestions.length ===
        MAX_LEVEL_TEST_QUESTIONS &&
      duplicateIds.length === 0 &&
      missingLevels.length === 0,
    count: levelTestQuestions.length,
    expected: MAX_LEVEL_TEST_QUESTIONS,
    duplicateIds,
    missingLevels,
  };
}

/* =========================================================
 * BASIC QUESTION HELPERS
 * ========================================================= */

export function getQuestionsByLevel(
  level: Level,
): LevelTestQuestion[] {
  return levelTestQuestions.filter(
    (question) => question.level === level,
  );
}

export function getQuestionsBySkill(
  skill: LevelTestSkill,
): LevelTestQuestion[] {
  return levelTestQuestions.filter(
    (question) => question.skill === skill,
  );
}

export function getQuestionsUpToLevel(
  level: Level,
): LevelTestQuestion[] {
  const index = levelOrder.indexOf(level);

  if (index === -1) {
    return [];
  }

  const allowedLevels = new Set(
    levelOrder.slice(0, index + 1),
  );

  return levelTestQuestions.filter(
    (question) =>
      allowedLevels.has(question.level),
  );
}

export function getLevelIndex(
  level: Level,
): number {
  return levelOrder.indexOf(level);
}

export function getNextLevel(
  level: Level,
): Level | null {
  const index = getLevelIndex(level);

  if (
    index === -1 ||
    index >= levelOrder.length - 1
  ) {
    return null;
  }

  return levelOrder[index + 1];
}

export function getPreviousLevel(
  level: Level,
): Level | null {
  const index = getLevelIndex(level);

  if (index <= 0) {
    return null;
  }

  return levelOrder[index - 1];
}

/* =========================================================
 * ANSWER CHECKING
 * ========================================================= */

export function isAnswerCorrect(
  question: LevelTestQuestion,
  answer: string,
): boolean {
  if (question.type !== "multiple-choice") {
    return false;
  }

  if (!question.correctAnswer) {
    return false;
  }

  return (
    answer.trim().toLowerCase() ===
    question.correctAnswer
      .trim()
      .toLowerCase()
  );
}

/* =========================================================
 * PERCENTAGE
 * ========================================================= */

export function percentage(
  correct: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    Math.max(
      0,
      Math.min(100, (correct / total) * 100),
    ),
  );
}

/* =========================================================
 * QUESTION SCORE
 * ========================================================= */

export function getQuestionScore(
  question: LevelTestQuestion,
  answer: string,
): number {
  if (
    question.type !== "multiple-choice"
  ) {
    return 0;
  }

  return isAnswerCorrect(question, answer)
    ? question.points
    : 0;
}

/* =========================================================
 * LEVEL SCORE
 * ========================================================= */

export interface LevelScore {
  level: Level;
  correct: number;
  total: number;
  percentage: number;
}

export function calculateLevelScore(
  level: Level,
  answers: Record<string, string>,
): LevelScore {
  const questions = getQuestionsByLevel(level);

  let correct = 0;
  let total = 0;

  for (const question of questions) {
    if (question.type !== "multiple-choice") {
      continue;
    }

    const answer = answers[question.id];

    if (
      typeof answer !== "string" ||
      answer.trim() === ""
    ) {
      continue;
    }

    total += 1;

    if (isAnswerCorrect(question, answer)) {
      correct += 1;
    }
  }

  return {
    level,
    correct,
    total,
    percentage: percentage(
      correct,
      total,
    ),
  };
}

/* =========================================================
 * SKILL SCORE
 * ========================================================= */

export interface SkillScore {
  skill: LevelTestSkill;
  correct: number;
  total: number;
  percentage: number;
}

export function calculateSkillScore(
  skill: LevelTestSkill,
  answers: Record<string, string>,
): SkillScore {
  const questions =
    getQuestionsBySkill(skill);

  let correct = 0;
  let total = 0;

  for (const question of questions) {
    if (question.type !== "multiple-choice") {
      continue;
    }

    const answer = answers[question.id];

    if (
      typeof answer !== "string" ||
      answer.trim() === ""
    ) {
      continue;
    }

    total += 1;

    if (isAnswerCorrect(question, answer)) {
      correct += 1;
    }
  }

  return {
    skill,
    correct,
    total,
    percentage: percentage(
      correct,
      total,
    ),
  };
}

/* =========================================================
 * ALL SKILL SCORES
 * ========================================================= */

export function calculateAllSkillScores(
  answers: Record<string, string>,
): Record<
  LevelTestSkill,
  SkillScore
> {
  return {
    reading: calculateSkillScore(
      "reading",
      answers,
    ),

    listening: calculateSkillScore(
      "listening",
      answers,
    ),

    writing: calculateSkillScore(
      "writing",
      answers,
    ),

    grammar: calculateSkillScore(
      "grammar",
      answers,
    ),
  };
}

/* =========================================================
 * WRITING RUBRIC
 * ========================================================= */

/*
 * Writing is not auto-scored by this file.
 *
 * The UI / future evaluator can provide:
 *
 * - taskAchievement
 * - grammar
 * - vocabulary
 * - organization
 * - coherence
 *
 * Each category is scored from 0–5.
 */

export interface WritingRubricScore {
  taskAchievement: number;
  grammar: number;
  vocabulary: number;
  organization: number;
  coherence: number;
}

export interface WritingEvaluation {
  score: number;
  percentage: number;
  level: Level;
}

function clampRubricScore(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(5, Math.round(value)),
  );
}

export function evaluateWriting(
  rubric: WritingRubricScore,
): WritingEvaluation {
  const taskAchievement =
    clampRubricScore(
      rubric.taskAchievement,
    );

  const grammar =
    clampRubricScore(rubric.grammar);

  const vocabulary =
    clampRubricScore(rubric.vocabulary);

  const organization =
    clampRubricScore(
      rubric.organization,
    );

  const coherence =
    clampRubricScore(
      rubric.coherence,
    );

  const total =
    taskAchievement +
    grammar +
    vocabulary +
    organization +
    coherence;

  const maxScore = 25;

  const writingPercentage = percentage(
    total,
    maxScore,
  );

  let level: Level = "A1";

  if (writingPercentage >= 90) {
    level = "C2";
  } else if (writingPercentage >= 80) {
    level = "C1";
  } else if (writingPercentage >= 68) {
    level = "B2";
  } else if (writingPercentage >= 55) {
    level = "B1";
  } else if (writingPercentage >= 40) {
    level = "A2";
  } else {
    level = "A1";
  }

  return {
    score: total,
    percentage: writingPercentage,
    level,
  };
}

/* =========================================================
 * PROGRESSIVE LEVEL CALCULATION
 * ========================================================= */

export function calculateProgressiveLevel(
  levelScores: Record<
    Level,
    number
  >,
): Level {
  let strongestLevel: Level = "A1";

  for (const level of levelOrder) {
    const score =
      levelScores[level] ?? 0;

    if (
      score >=
      LEVEL_MASTERY_THRESHOLD
    ) {
      strongestLevel = level;
    } else {
      break;
    }
  }

  return strongestLevel;
}

/* =========================================================
 * OBJECTIVE LEVEL ESTIMATION
 * ========================================================= */

export function estimateLevelFromAnswers(
  answers: Record<string, string>,
): Level {
  let strongestLevel: Level = "A1";

  for (const level of levelOrder) {
    const score =
      calculateLevelScore(
        level,
        answers,
      );

    /*
     * Do not judge an untouched level.
     */
    if (score.total === 0) {
      break;
    }

    const ratio =
      score.correct /
      score.total;

    if (
      ratio >=
      LEVEL_MASTERY_THRESHOLD
    ) {
      strongestLevel = level;
    } else {
      break;
    }
  }

  return strongestLevel;
}

/* =========================================================
 * ADAPTIVE TEST TYPES
 * ========================================================= */

export interface AdaptiveAnswer {
  questionId: string;
  level: Level;
  skill: LevelTestSkill;
  correct: boolean;
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

/* =========================================================
 * ADAPTIVE STATE CREATOR
 * ========================================================= */

export function createAdaptiveState(): AdaptiveState {
  return {
    currentLevel: "A1",
    answeredQuestionIds: [],
    answers: {},
    history: [],
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    highestDemonstratedLevel: "A1",
    lowestWeakLevel: null,
    completed: false,
  };
}

/* =========================================================
 * RECENT PERFORMANCE
 * ========================================================= */

export function getRecentAnswers(
  state: AdaptiveState,
  size = ADAPTIVE_WINDOW_SIZE,
): AdaptiveAnswer[] {
  return state.history.slice(-size);
}

export function getRecentAccuracy(
  state: AdaptiveState,
  size = ADAPTIVE_WINDOW_SIZE,
): number {
  const recent =
    getRecentAnswers(state, size);

  if (recent.length === 0) {
    return 0;
  }

  const correct =
    recent.filter(
      (item) => item.correct,
    ).length;

  return correct / recent.length;
}

/* =========================================================
 * UPDATE ADAPTIVE STATE
 * ========================================================= */

export function recordAdaptiveAnswer(
  state: AdaptiveState,
  question: LevelTestQuestion,
  answer: string,
): AdaptiveState {
  const correct =
    isAnswerCorrect(
      question,
      answer,
    );

  const nextState: AdaptiveState = {
    ...state,
    answeredQuestionIds: [
      ...state.answeredQuestionIds,
      question.id,
    ],
    answers: {
      ...state.answers,
      [question.id]: answer,
    },
    history: [
      ...state.history,
      {
        questionId: question.id,
        level: question.level,
        skill: question.skill,
        correct,
      },
    ],
  };

  if (correct) {
    nextState.consecutiveCorrect =
      state.consecutiveCorrect + 1;

    nextState.consecutiveIncorrect = 0;
  } else {
    nextState.consecutiveIncorrect =
      state.consecutiveIncorrect + 1;

    nextState.consecutiveCorrect = 0;
  }

  const levelScore =
    calculateLevelScore(
      question.level,
      nextState.answers,
    );

  if (
    levelScore.total > 0 &&
    levelScore.percentage >=
      LEVEL_MASTERY_THRESHOLD * 100
  ) {
    nextState.highestDemonstratedLevel =
      question.level;
  }

  if (
    levelScore.total >= 2 &&
    levelScore.percentage <
      LEVEL_STOP_THRESHOLD * 100
  ) {
    nextState.lowestWeakLevel =
      question.level;
  }

  nextState.currentLevel =
    determineNextAdaptiveLevel(
      nextState,
    );

  nextState.completed =
    shouldFinishTest(
      nextState,
    );

  return nextState;
}

/* =========================================================
 * DETERMINE NEXT LEVEL
 * ========================================================= */

export function determineNextAdaptiveLevel(
  state: AdaptiveState,
): Level {
  const current =
    state.currentLevel;

  /*
   * Four consecutive correct answers indicate
   * strong evidence that the learner can attempt
   * the next CEFR level.
   */
  if (
    state.consecutiveCorrect >= 3
  ) {
    return (
      getNextLevel(current) ??
      current
    );
  }

  /*
   * Four consecutive incorrect answers indicate
   * that moving upward is probably premature.
   */
  if (
    state.consecutiveIncorrect >= 3
  ) {
    return current;
  }

  /*
   * Recent performance can also move the learner
   * upward when there is a strong pattern.
   */
  const recentAccuracy =
    getRecentAccuracy(state);

  if (
    state.history.length >= 4 &&
    recentAccuracy >=
      LEVEL_ADVANCE_THRESHOLD
  ) {
    return (
      getNextLevel(current) ??
      current
    );
  }

  return current;
}

/* =========================================================
 * SHOULD FINISH
 * ========================================================= */

export function shouldFinishTest(
  state: AdaptiveState,
): boolean {
  const answered =
    state.answeredQuestionIds.length;

  /*
   * Never finish before the minimum number
   * of questions.
   */
  if (
    answered <
    MIN_LEVEL_TEST_QUESTIONS
  ) {
    return false;
  }

  /*
   * Always stop at 50.
   */
  if (
    answered >=
    MAX_LEVEL_TEST_QUESTIONS
  ) {
    return true;
  }

  /*
   * Early finish:
   *
   * If the learner has demonstrated a level
   * and then repeatedly performs strongly,
   * the engine can finish without forcing
   * unnecessary questions.
   */
  if (
    answered >=
      EARLY_FINISH_MIN_QUESTIONS &&
    state.consecutiveCorrect >= 4
  ) {
    const next =
      getNextLevel(
        state.highestDemonstratedLevel,
      );

    /*
     * C2 is already the highest level.
     */
    if (
      state.highestDemonstratedLevel ===
      "C2"
    ) {
      return true;
    }

    /*
     * If the current level is already high
     * and the learner is consistently strong,
     * confidence is sufficient.
     */
    if (
      next === null ||
      getLevelIndex(
        state.highestDemonstratedLevel,
      ) >= 4
    ) {
      return true;
    }
  }

  return false;
}

/* =========================================================
 * GET NEXT QUESTION
 * ========================================================= */

export function getNextAdaptiveQuestion(
  state: AdaptiveState,
): LevelTestQuestion | null {
  if (state.completed) {
    return null;
  }

  if (
    state.answeredQuestionIds.length >=
    MAX_LEVEL_TEST_QUESTIONS
  ) {
    return null;
  }

  /*
   * First try the current adaptive level.
   */
  const currentLevelQuestions =
    getQuestionsByLevel(
      state.currentLevel,
    ).filter(
      (question) =>
        !state.answeredQuestionIds.includes(
          question.id,
        ),
    );

  if (
    currentLevelQuestions.length > 0
  ) {
    return selectBalancedQuestion(
      currentLevelQuestions,
      state,
    );
  }

  /*
   * If the current level has no unused
   * questions, try the next level.
   */
  const nextLevel =
    getNextLevel(
      state.currentLevel,
    );

  if (nextLevel) {
    const nextQuestions =
      getQuestionsByLevel(
        nextLevel,
      ).filter(
        (question) =>
          !state.answeredQuestionIds.includes(
            question.id,
          ),
      );

    if (nextQuestions.length > 0) {
      return selectBalancedQuestion(
        nextQuestions,
        state,
      );
    }
  }

  /*
   * Final fallback:
   * find any unused question.
   */
  const remaining =
    levelTestQuestions.filter(
      (question) =>
        !state.answeredQuestionIds.includes(
          question.id,
        ),
    );

  if (remaining.length === 0) {
    return null;
  }

  return selectBalancedQuestion(
    remaining,
    state,
  );
}

/* =========================================================
 * BALANCED QUESTION SELECTION
 * ========================================================= */

export function selectBalancedQuestion(
  questions: LevelTestQuestion[],
  state: AdaptiveState,
): LevelTestQuestion {
  /*
   * Count recent skills so we can avoid asking
   * too many questions from the same skill.
   */
  const recentSkills =
    getRecentAnswers(
      state,
      5,
    ).map(
      (item) => item.skill,
    );

  const skillCounts =
    new Map<
      LevelTestSkill,
      number
    >();

  for (const skill of recentSkills) {
    skillCounts.set(
      skill,
      (skillCounts.get(skill) ?? 0) + 1,
    );
  }

  /*
   * Prefer skills that have appeared less recently.
   */
  const sorted = [...questions].sort(
    (a, b) => {
      const aCount =
        skillCounts.get(a.skill) ?? 0;

      const bCount =
        skillCounts.get(b.skill) ?? 0;

      return aCount - bCount;
    },
  );

  return sorted[0];
}

/* =========================================================
 * TEST RESULT
 * ========================================================= */

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
 * SKILL → CEFR
 * ========================================================= */

export function percentageToLevel(
  score: number,
): Level {
  if (score >= 90) {
    return "C2";
  }

  if (score >= 80) {
    return "C1";
  }

  if (score >= 68) {
    return "B2";
  }

  if (score >= 55) {
    return "B1";
  }

  if (score >= 40) {
    return "A2";
  }

  return "A1";
}

/* =========================================================
 * CALCULATE FINAL RESULT
 * ========================================================= */

export function calculateLevelTestResult(
  state: AdaptiveState,
  writingEvaluation?: WritingEvaluation,
): LevelTestResultSummary {
  const levelScores =
    {} as Record<
      Level,
      LevelScore
    >;

  for (const level of levelOrder) {
    levelScores[level] =
      calculateLevelScore(
        level,
        state.answers,
      );
  }

  const skillScores =
    calculateAllSkillScores(
      state.answers,
    );

  /*
   * Writing questions are open-ended, so the
   * objective score for writing remains zero
   * until an evaluation is supplied.
   */
  if (writingEvaluation) {
    skillScores.writing = {
      skill: "writing",
      correct: writingEvaluation.score,
      total: 25,
      percentage:
        writingEvaluation.percentage,
    };
  }

  const skillLevels: Record<
    LevelTestSkill,
    Level
  > = {
    reading: percentageToLevel(
      skillScores.reading.percentage,
    ),

    listening: percentageToLevel(
      skillScores.listening.percentage,
    ),

    writing: writingEvaluation
      ? writingEvaluation.level
      : "A1",

    grammar: percentageToLevel(
      skillScores.grammar.percentage,
    ),
  };

  /*
   * Calculate objective overall performance.
   */
  const objectiveQuestions =
    state.history.filter(
      (item) => {
        const question =
          levelTestQuestions.find(
            (q) =>
              q.id === item.questionId,
          );

        return (
          question?.type ===
          "multiple-choice"
        );
      },
    );

  const objectiveCorrect =
    objectiveQuestions.filter(
      (item) => item.correct,
    ).length;

  const objectivePercentage =
    percentage(
      objectiveCorrect,
      objectiveQuestions.length,
    );

  /*
   * Writing contributes to the final result
   * when it has been evaluated.
   */
  const finalPercentage =
    writingEvaluation
      ? Math.round(
          objectivePercentage * 0.8 +
            writingEvaluation.percentage *
              0.2,
        )
      : objectivePercentage;

  let overallLevel =
    percentageToLevel(
      finalPercentage,
    );

  /*
   * Progressive evidence is stronger than
   * raw percentage alone.
   *
   * Do not award a high CEFR level merely because
   * the learner answered lower-level questions well.
   */
  const demonstratedLevel =
    state.highestDemonstratedLevel;

  if (
    getLevelIndex(overallLevel) >
    getLevelIndex(demonstratedLevel)
  ) {
    overallLevel =
      demonstratedLevel;
  }

  return {
    overallLevel,
    overallPercentage:
      finalPercentage,

    skillLevels,

    skillScores,

    levelScores,

    questionsAnswered:
      state.answeredQuestionIds.length,

    completed: state.completed,
  };
}

/* =========================================================
 * SIMPLE LEVEL DESCRIPTION
 * ========================================================= */

export function getLevelDescription(
  level: Level,
): string {
  return (
    levelDescriptions[level] ??
    "Beginner"
  );
}

/* =========================================================
 * PROGRESSIVE LEVEL FROM RAW SCORES
 * ========================================================= */

export function calculateProgressiveLevelFromScores(
  levelScores: Record<
    Level,
    number
  >,
): Level {
  let strongestLevel: Level = "A1";

  for (const level of levelOrder) {
    const score =
      levelScores[level] ?? 0;

    if (
      score >=
      LEVEL_MASTERY_THRESHOLD
    ) {
      strongestLevel = level;
    } else {
      /*
       * CEFR levels are progressive.
       * If a learner does not demonstrate
       * B1, we should not automatically award
       * B2 or C1 based on isolated answers.
       */
      break;
    }
  }

  return strongestLevel;
}

/* =========================================================
 * LEVEL TEST SUMMARY
 * ========================================================= */

export function getLevelTestSummary(
  state: AdaptiveState,
): {
  questionsAnswered: number;
  questionsRemaining: number;
  currentLevel: Level;
  currentLevelDescription: string;
  highestDemonstratedLevel: Level;
  completed: boolean;
  progressPercentage: number;
} {
  const answered =
    state.answeredQuestionIds.length;

  return {
    questionsAnswered: answered,

    questionsRemaining:
      Math.max(
        0,
        MAX_LEVEL_TEST_QUESTIONS -
          answered,
      ),

    currentLevel:
      state.currentLevel,

    currentLevelDescription:
      getLevelDescription(
        state.currentLevel,
      ),

    highestDemonstratedLevel:
      state.highestDemonstratedLevel,

    completed:
      state.completed,

    progressPercentage:
      percentage(
        answered,
        MAX_LEVEL_TEST_QUESTIONS,
      ),
  };
}

/* =========================================================
 * DEFAULT ANSWER MAP
 * ========================================================= */

export function createEmptyAnswers(): Record<
  string,
  string
> {
  return {};
}

/* =========================================================
 * DEFAULT LEVEL SCORES
 * ========================================================= */

export function createEmptyLevelScores(): Record<
  Level,
  number
> {
  return {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
  };
}

/* =========================================================
 * DEFAULT SKILL SCORES
 * ========================================================= */

export function createEmptySkillScores(): Record<
  LevelTestSkill,
  SkillScore
> {
  return {
    reading: {
      skill: "reading",
      correct: 0,
      total: 0,
      percentage: 0,
    },

    listening: {
      skill: "listening",
      correct: 0,
      total: 0,
      percentage: 0,
    },

    writing: {
      skill: "writing",
      correct: 0,
      total: 0,
      percentage: 0,
    },

    grammar: {
      skill: "grammar",
      correct: 0,
      total: 0,
      percentage: 0,
    },
  };
}

/* =========================================================
 * FINAL BANK CHECK
 * ========================================================= */

const bankValidation =
  validateLevelTestBank();

if (
  !bankValidation.valid
) {
  console.warn(
    "DRE2learn Level Test bank validation failed:",
    bankValidation,
  );
}
