import type {
  Level,
  LevelTestQuestion,
  LevelTestSkill,
} from "../types";

/*
 * DRE2learn Progressive Level Test
 *
 * Maximum: 50 questions
 * Skills:
 * - Reading
 * - Listening
 * - Writing
 * - Grammar & Vocabulary
 *
 * Difficulty:
 * A1 → A2 → B1 → B2 → C1 → C2
 *
 * The test does NOT simply calculate:
 * "number correct = level".
 *
 * Instead, performance at each CEFR level
 * is evaluated progressively.
 */

export const MAX_LEVEL_TEST_QUESTIONS = 50;

export const levelTestQuestions: LevelTestQuestion[] = [
  // =====================================================
  // A1 — FOUNDATION
  // =====================================================

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

  // =====================================================
  // A2 — ELEMENTARY
  // =====================================================

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

  // =====================================================
  // B1 — INTERMEDIATE
  // =====================================================

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

  // =====================================================
  // B2 — UPPER INTERMEDIATE
  // =====================================================

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

  // =====================================================
  // C1 — ADVANCED
  // =====================================================

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

  // =====================================================
  // C2 — PROFICIENT
  // =====================================================

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
];

/*
 * CEFR order
 */

export const levelOrder: Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

/*
 * Get questions belonging to a specific CEFR level.
 */

export function getQuestionsByLevel(
  level: Level,
): LevelTestQuestion[] {
  return levelTestQuestions.filter(
    (question) => question.level === level,
  );
}

/*
 * Get questions belonging to a specific skill.
 */

export function getQuestionsBySkill(
  skill: LevelTestSkill,
): LevelTestQuestion[] {
  return levelTestQuestions.filter(
    (question) => question.skill === skill,
  );
}

/*
 * Get questions available up to a certain level.
 */

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

/*
 * Basic MCQ scoring.
 *
 * Writing is intentionally NOT automatically scored here.
 * Writing will have its own rubric/scoring system.
 */

export function isAnswerCorrect(
  question: LevelTestQuestion,
  answer: string,
): boolean {
  if (
    question.type !== "multiple-choice"
  ) {
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

/*
 * Calculate the strongest level demonstrated.
 *
 * This is an initial calculation layer.
 * The final adaptive engine will use:
 *
 * - consecutive correct answers
 * - consecutive incorrect answers
 * - skill performance
 * - writing score
 * - confidence
 */

export function calculateProgressiveLevel(
  levelScores: Record<Level, number>,
): Level {
  let strongestLevel: Level = "A1";

  for (const level of levelOrder) {
    const score = levelScores[level] ?? 0;

    /*
     * A level is considered demonstrated
     * when the learner gets at least 60%
     * of the available objective questions
     * at that level.
     */
    if (score >= 0.6) {
      strongestLevel = level;
    }
  }

  return strongestLevel;
}

/*
 * Convert raw objective performance into
 * a normalized 0–100 percentage.
 */

export function percentage(
  correct: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (correct / total) * 100,
  );
}

/*
 * Get a human-readable description of
 * the current estimated CEFR level.
 */

export function getLevelDescription(
  level: Level,
): string {
  switch (level) {
    case "A1":
      return "Beginner";

    case "A2":
      return "Elementary";

    case "B1":
      return "Intermediate";

    case "B2":
      return "Upper-Intermediate";

    case "C1":
      return "Advanced";

    case "C2":
      return "Proficient";

    default:
      return "Beginner";
  }
}