import type { Level } from "../types";

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

/**
 * Languages available for the in-app word translation panel.
 *
 * The actual translation service will be connected from the app layer.
 * These language codes are compatible with Google Translate language codes.
 */
export interface TranslationLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "zh-CN",
    name: "Chinese",
    nativeName: "中文",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
  },
  {
    code: "ku",
    name: "Kurdish",
    nativeName: "کوردی",
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
  },
];

export const DEFAULT_TRANSLATION_LANGUAGE = "ar";

/**
 * Information returned when the user taps a word.
 *
 * `translation` and `pronunciation` are filled by the translation /
 * pronunciation service when the user selects a word.
 */
export interface WordTranslation {
  word: string;
  translation: string;
  targetLanguage: string;
  pronunciation: string;
  pronunciationLanguage: string;
  audioText: string;
}

/**
 * Data used by the Library word popup.
 */
export interface LibraryWordSelection {
  word: string;
  articleId: string;
  targetLanguage: string;
}

/**
 * Library topics.
 */
export const LIBRARY_TOPICS = [
  "Daily Life",
  "School",
  "Family",
  "Travel",
  "Food",
  "Health",
  "Technology",
  "Nature",
  "Culture",
  "Science",
  "Environment",
  "Society",
  "Education",
  "Work",
  "Personal Growth",
  "Politics",
  "Law",
  "Sports",
  "Art",
] as const;

/**
 * Supported CEFR levels.
 */
export const LIBRARY_LEVELS: Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

/**
 * Manually authored Library articles.
 *
 * No AI article generation is used here.
 */
export const LIBRARY_ARTICLES: LibraryArticle[] = [
  // =========================================================
  // A1
  // =========================================================

  {
    id: "a1-daily-morning",
    title: "A Simple Morning",
    level: "A1",
    topic: "Daily Life",
    readingTime: 2,
    content:
      "Every morning, Sara wakes up at seven o'clock. " +
      "She opens the window and looks at the sky. " +
      "Then she drinks a glass of water and has breakfast with her family. " +
      "After breakfast, she gets ready for school. " +
      "She puts her books in her bag and walks to the bus stop. " +
      "Sara likes mornings because they give her a fresh start.",
    vocabulary: [
      "morning",
      "window",
      "sky",
      "breakfast",
      "family",
      "school",
      "books",
      "fresh",
    ],
    questions: [
      {
        id: "a1-daily-morning-q1",
        question: "What time does Sara wake up?",
        options: ["Six o'clock", "Seven o'clock", "Eight o'clock"],
        correctAnswer: "Seven o'clock",
      },
      {
        id: "a1-daily-morning-q2",
        question: "What does Sara drink?",
        options: ["Milk", "Juice", "Water"],
        correctAnswer: "Water",
      },
    ],
  },

  {
    id: "a1-school-new-class",
    title: "A New Class",
    level: "A1",
    topic: "School",
    readingTime: 2,
    content:
      "Mina starts a new English class on Monday. " +
      "There are twelve students in the room. " +
      "The teacher writes some words on the board. " +
      "Mina sits next to a friendly girl named Lina. " +
      "They practice simple sentences together. " +
      "At the end of the class, Mina feels happy because she learns something new.",
    vocabulary: [
      "class",
      "students",
      "teacher",
      "board",
      "friendly",
      "practice",
      "sentence",
      "learn",
    ],
    questions: [
      {
        id: "a1-school-new-class-q1",
        question: "When does Mina start the class?",
        options: ["Monday", "Friday", "Sunday"],
        correctAnswer: "Monday",
      },
      {
        id: "a1-school-new-class-q2",
        question: "How many students are there?",
        options: ["Ten", "Twelve", "Twenty"],
        correctAnswer: "Twelve",
      },
    ],
  },

  // =========================================================
  // A2
  // =========================================================

  {
    id: "a2-travel-city",
    title: "Exploring a New City",
    level: "A2",
    topic: "Travel",
    readingTime: 3,
    content:
      "When people visit a new city, they often want to see important places. " +
      "Some travelers visit museums, old buildings, parks, and markets. " +
      "Walking around the city can be a good way to discover small streets and local shops. " +
      "Public transportation is also useful because it helps visitors move from one place to another. " +
      "Trying local food can make the trip even more interesting.",
    vocabulary: [
      "explore",
      "traveler",
      "museum",
      "building",
      "market",
      "discover",
      "transportation",
      "local",
    ],
    questions: [
      {
        id: "a2-travel-city-q1",
        question: "What can visitors discover by walking?",
        options: [
          "Small streets and local shops",
          "Only airports",
          "Only hotels",
        ],
        correctAnswer: "Small streets and local shops",
      },
      {
        id: "a2-travel-city-q2",
        question: "Why is public transportation useful?",
        options: [
          "It helps visitors move around",
          "It gives visitors free food",
          "It closes the museums",
        ],
        correctAnswer: "It helps visitors move around",
      },
    ],
  },

  {
    id: "a2-health-sleep",
    title: "Why Sleep Matters",
    level: "A2",
    topic: "Health",
    readingTime: 3,
    content:
      "Sleep is an important part of a healthy life. " +
      "When people sleep well, they often have more energy during the day. " +
      "Good sleep can also help people concentrate at school or work. " +
      "A regular sleep schedule may make it easier to fall asleep. " +
      "Turning off bright screens before bed can also help the body prepare for rest.",
    vocabulary: [
      "healthy",
      "energy",
      "concentrate",
      "schedule",
      "regular",
      "screens",
      "prepare",
      "rest",
    ],
    questions: [
      {
        id: "a2-health-sleep-q1",
        question: "What can good sleep help with?",
        options: ["Concentration", "Noise", "Traffic"],
        correctAnswer: "Concentration",
      },
      {
        id: "a2-health-sleep-q2",
        question: "What may help people fall asleep?",
        options: [
          "A regular sleep schedule",
          "More screen time",
          "Skipping rest",
        ],
        correctAnswer: "A regular sleep schedule",
      },
    ],
  },

  // =========================================================
  // B1
  // =========================================================

  {
    id: "b1-technology-learning",
    title: "Technology and Learning",
    level: "B1",
    topic: "Technology",
    readingTime: 4,
    content:
      "Technology has changed the way students learn. " +
      "A student can now watch a lesson, read an article, or practice a language online. " +
      "Digital tools can make learning more flexible because students can study at different times and places. " +
      "However, technology is most useful when learners use it actively. " +
      "Simply watching videos is not always enough. " +
      "Students need to think, practice, ask questions, and apply what they learn.",
    vocabulary: [
      "technology",
      "flexible",
      "digital",
      "actively",
      "learners",
      "practice",
      "apply",
      "useful",
    ],
    questions: [
      {
        id: "b1-technology-learning-q1",
        question: "Why can digital tools make learning more flexible?",
        options: [
          "Students can study at different times and places",
          "Students never need to practice",
          "Students stop asking questions",
        ],
        correctAnswer:
          "Students can study at different times and places",
      },
      {
        id: "b1-technology-learning-q2",
        question: "What should students do besides watching videos?",
        options: [
          "Think and practice",
          "Stop learning",
          "Avoid questions",
        ],
        correctAnswer: "Think and practice",
      },
    ],
  },

  {
    id: "b1-environment-small-actions",
    title: "Small Actions, Real Change",
    level: "B1",
    topic: "Environment",
    readingTime: 4,
    content:
      "Environmental problems can sometimes feel too large for one person to solve. " +
      "However, small actions can become meaningful when many people make them. " +
      "Using less plastic, saving water, reducing unnecessary electricity use, and choosing public transportation can all help. " +
      "Schools and communities can also organize projects that encourage people to protect local environments. " +
      "The important idea is that consistent actions can create larger changes over time.",
    vocabulary: [
      "environmental",
      "meaningful",
      "plastic",
      "reduce",
      "electricity",
      "transportation",
      "community",
      "consistent",
    ],
    questions: [
      {
        id: "b1-environment-small-actions-q1",
        question: "Why can small actions become meaningful?",
        options: [
          "Many people can make them",
          "They are always expensive",
          "They require no effort",
        ],
        correctAnswer: "Many people can make them",
      },
      {
        id: "b1-environment-small-actions-q2",
        question: "What can communities organize?",
        options: [
          "Environmental projects",
          "Traffic accidents",
          "Longer school holidays",
        ],
        correctAnswer: "Environmental projects",
      },
    ],
  },

  // =========================================================
  // B2
  // =========================================================

  {
    id: "b2-science-curiosity",
    title: "The Value of Curiosity",
    level: "B2",
    topic: "Science",
    readingTime: 5,
    content:
      "Curiosity is one of the forces that drives scientific discovery. " +
      "Researchers often begin with a simple question about something they do not understand. " +
      "Instead of accepting the first explanation, they collect evidence, compare possibilities, and test their ideas. " +
      "This process can take years, and some experiments fail. " +
      "Nevertheless, failure can provide useful information because it shows researchers which explanations may be incorrect. " +
      "Curiosity therefore supports not only discovery, but also a willingness to revise our understanding.",
    vocabulary: [
      "curiosity",
      "discovery",
      "researcher",
      "evidence",
      "possibility",
      "experiment",
      "revise",
      "understanding",
    ],
    questions: [
      {
        id: "b2-science-curiosity-q1",
        question: "What often begins scientific research?",
        options: [
          "A question",
          "A finished answer",
          "A celebration",
        ],
        correctAnswer: "A question",
      },
      {
        id: "b2-science-curiosity-q2",
        question: "Why can failure be useful?",
        options: [
          "It provides information",
          "It guarantees success",
          "It removes the need for evidence",
        ],
        correctAnswer: "It provides information",
      },
    ],
  },

  {
    id: "b2-culture-museums",
    title: "Museums in a Changing World",
    level: "B2",
    topic: "Culture",
    readingTime: 5,
    content:
      "Museums have traditionally been places where people preserve and study objects from the past. " +
      "Today, many museums are also experimenting with new ways to communicate with visitors. " +
      "Interactive exhibitions, digital archives, and educational programs can make collections more accessible. " +
      "At the same time, museums face questions about whose stories are represented and how historical objects should be presented. " +
      "Modern museums therefore have to balance preservation with interpretation and public engagement.",
    vocabulary: [
      "traditionally",
      "preserve",
      "interactive",
      "exhibition",
      "archive",
      "accessible",
      "interpretation",
      "engagement",
    ],
    questions: [
      {
        id: "b2-culture-museums-q1",
        question: "What can make museum collections more accessible?",
        options: [
          "Digital archives and educational programs",
          "Closing exhibitions",
          "Removing information",
        ],
        correctAnswer:
          "Digital archives and educational programs",
      },
      {
        id: "b2-culture-museums-q2",
        question: "What must modern museums balance?",
        options: [
          "Preservation and public engagement",
          "Food and transportation",
          "Sports and music",
        ],
        correctAnswer: "Preservation and public engagement",
      },
    ],
  },

  // =========================================================
  // C1
  // =========================================================

  {
    id: "c1-education-deep-learning",
    title: "Beyond Memorization",
    level: "C1",
    topic: "Education",
    readingTime: 6,
    content:
      "Memorization has an important role in education, but learning cannot be reduced to remembering information. " +
      "Deep learning requires students to connect ideas, evaluate evidence, and transfer knowledge to unfamiliar situations. " +
      "A student who understands a principle can often use it in a new context, whereas a student who has memorized an isolated fact may struggle when the question changes. " +
      "Effective education therefore combines foundational knowledge with opportunities for analysis, discussion, experimentation, and reflection.",
    vocabulary: [
      "memorization",
      "reduced",
      "foundational",
      "principle",
      "context",
      "analysis",
      "experimentation",
      "reflection",
    ],
    questions: [
      {
        id: "c1-education-deep-learning-q1",
        question: "What does deep learning require?",
        options: [
          "Connecting ideas and evaluating evidence",
          "Only memorizing facts",
          "Avoiding unfamiliar situations",
        ],
        correctAnswer:
          "Connecting ideas and evaluating evidence",
      },
      {
        id: "c1-education-deep-learning-q2",
        question: "Why can understanding a principle be useful?",
        options: [
          "It can be transferred to a new context",
          "It removes the need for knowledge",
          "It prevents experimentation",
        ],
        correctAnswer:
          "It can be transferred to a new context",
      },
    ],
  },

  {
    id: "c1-society-online-communities",
    title: "The Architecture of Online Communities",
    level: "C1",
    topic: "Society",
    readingTime: 6,
    content:
      "Online communities do not develop solely because people have access to communication technology. " +
      "Their structure is influenced by rules, incentives, moderation, social norms, and the design of the platform itself. " +
      "A community that rewards constructive participation may develop very different patterns of interaction from one that rewards attention at any cost. " +
      "Consequently, digital spaces should be understood not merely as neutral channels, but as environments whose architecture can influence behavior and relationships.",
    vocabulary: [
      "architecture",
      "incentive",
      "moderation",
      "social norms",
      "constructive",
      "interaction",
      "neutral",
      "influence",
    ],
    questions: [
      {
        id: "c1-society-online-communities-q1",
        question: "What can influence the structure of online communities?",
        options: [
          "Rules, incentives, and moderation",
          "Weather only",
          "Physical distance only",
        ],
        correctAnswer:
          "Rules, incentives, and moderation",
      },
      {
        id: "c1-society-online-communities-q2",
        question: "How should digital spaces be understood?",
        options: [
          "As environments that can influence behavior",
          "As completely neutral spaces",
          "As places without social norms",
        ],
        correctAnswer:
          "As environments that can influence behavior",
      },
    ],
  },

  // =========================================================
  // C2
  // =========================================================

  {
    id: "c2-science-uncertainty",
    title: "Reasoning Under Uncertainty",
    level: "C2",
    topic: "Science",
    readingTime: 7,
    content:
      "Scientific reasoning rarely operates under conditions of absolute certainty. " +
      "Researchers must often make judgments using incomplete observations, imperfect measurements, and competing explanations. " +
      "A strong conclusion is therefore not necessarily one expressed with complete confidence, but one whose confidence is proportionate to the quality of the available evidence. " +
      "This distinction is particularly important when scientific findings are communicated to the public, because uncertainty can be mistaken for ignorance even when it reflects careful evaluation of complex evidence.",
    vocabulary: [
      "uncertainty",
      "absolute",
      "observation",
      "measurement",
      "competing",
      "proportionate",
      "evidence",
      "evaluation",
    ],
    questions: [
      {
        id: "c2-science-uncertainty-q1",
        question:
          "Why do researchers sometimes have to make judgments under uncertainty?",
        options: [
          "Evidence can be incomplete",
          "Science never uses evidence",
          "Measurements are always perfect",
        ],
        correctAnswer: "Evidence can be incomplete",
      },
      {
        id: "c2-science-uncertainty-q2",
        question: "What should confidence be proportionate to?",
        options: [
          "The quality of available evidence",
          "The popularity of an idea",
          "The length of a report",
        ],
        correctAnswer: "The quality of available evidence",
      },
    ],
  },

  {
    id: "c2-society-institutions",
    title: "Institutions and Unintended Consequences",
    level: "C2",
    topic: "Society",
    readingTime: 7,
    content:
      "Institutions are designed to achieve particular social objectives, yet their policies can produce consequences that were never anticipated by their creators. " +
      "A rule intended to improve efficiency may create new incentives that alter behavior in unexpected ways. " +
      "Likewise, a policy designed to solve one problem can shift costs elsewhere without eliminating the underlying difficulty. " +
      "Understanding such outcomes requires more than examining whether a policy succeeded according to its immediate objective; it requires attention to feedback, incentives, distributional effects, and the broader system in which the institution operates.",
    vocabulary: [
      "institution",
      "objective",
      "consequence",
      "anticipated",
      "efficiency",
      "incentive",
      "distributional",
      "feedback",
    ],
    questions: [
      {
        id: "c2-society-institutions-q1",
        question: "What can institutional policies produce?",
        options: [
          "Unintended consequences",
          "Only expected results",
          "No behavioral changes",
        ],
        correctAnswer: "Unintended consequences",
      },
      {
        id: "c2-society-institutions-q2",
        question: "What should be examined when evaluating a policy?",
        options: [
          "Feedback, incentives, and broader effects",
          "Only its title",
          "Only its immediate popularity",
        ],
        correctAnswer:
          "Feedback, incentives, and broader effects",
      },
    ],
  },
];

/* ============================================================
   Library query helpers
   ============================================================ */

export function getLibraryArticles(
  level?: Level,
  topic?: string,
): LibraryArticle[] {
  return LIBRARY_ARTICLES.filter((article) => {
    const matchesLevel =
      !level || article.level === level;

    const matchesTopic =
      !topic || article.topic === topic;

    return matchesLevel && matchesTopic;
  });
}

export function getArticleById(
  articleId: string,
): LibraryArticle | null {
  return (
    LIBRARY_ARTICLES.find(
      (article) => article.id === articleId,
    ) ?? null
  );
}

export function getArticlesByLevel(
  level: Level,
): LibraryArticle[] {
  return LIBRARY_ARTICLES.filter(
    (article) => article.level === level,
  );
}

export function getArticlesByTopic(
  topic: string,
): LibraryArticle[] {
  return LIBRARY_ARTICLES.filter(
    (article) => article.topic === topic,
  );
}

export function getLibraryTopics(): string[] {
  return [...LIBRARY_TOPICS];
}

export function getLibraryLevels(): Level[] {
  return [...LIBRARY_LEVELS];
}

export function getArticleVocabulary(
  articleId: string,
): string[] {
  return getArticleById(articleId)?.vocabulary ?? [];
}

export function getArticleQuestions(
  articleId: string,
): LibraryQuestion[] {
  return getArticleById(articleId)?.questions ?? [];
}

export function getReadingTime(
  articleId: string,
): number {
  return getArticleById(articleId)?.readingTime ?? 0;
}

/* ============================================================
   Library search
   ============================================================ */

export function searchLibrary(
  searchTerm: string,
): LibraryArticle[] {
  const term = searchTerm
    .trim()
    .toLowerCase();

  if (!term) {
    return [...LIBRARY_ARTICLES];
  }

  return LIBRARY_ARTICLES.filter(
    (article) =>
      article.title
        .toLowerCase()
        .includes(term) ||
      article.topic
        .toLowerCase()
        .includes(term) ||
      article.level
        .toLowerCase()
        .includes(term) ||
      article.content
        .toLowerCase()
        .includes(term) ||
      article.vocabulary.some((word) =>
        word.toLowerCase().includes(term),
      ),
  );
}

/* ============================================================
   Translation language helpers
   ============================================================ */

export function getTranslationLanguages(): TranslationLanguage[] {
  return [...TRANSLATION_LANGUAGES];
}

export function getTranslationLanguage(
  code: string,
): TranslationLanguage | null {
  return (
    TRANSLATION_LANGUAGES.find(
      (language) => language.code === code,
    ) ?? null
  );
}

export function isSupportedTranslationLanguage(
  code: string,
): boolean {
  return TRANSLATION_LANGUAGES.some(
    (language) => language.code === code,
  );
}

/**
 * Creates the object used when a word is selected in an article.
 *
 * Translation/pronunciation values start empty because they are supplied
 * by the service connected to the Library UI.
 */
export function createWordSelection(
  word: string,
  articleId: string,
  targetLanguage: string = DEFAULT_TRANSLATION_LANGUAGE,
): LibraryWordSelection {
  return {
    word: word.trim(),
    articleId,
    targetLanguage:
      isSupportedTranslationLanguage(targetLanguage)
        ? targetLanguage
        : DEFAULT_TRANSLATION_LANGUAGE,
  };
}

/**
 * Creates an empty translation result.
 *
 * The UI/service layer will fill:
 * - translation
 * - pronunciation
 * - audioText
 */
export function createEmptyWordTranslation(
  word: string,
  targetLanguage: string = DEFAULT_TRANSLATION_LANGUAGE,
): WordTranslation {
  const language = getTranslationLanguage(
    targetLanguage,
  );

  return {
    word: word.trim(),
    translation: "",
    targetLanguage:
      language?.code ??
      DEFAULT_TRANSLATION_LANGUAGE,
    pronunciation: "",
    pronunciationLanguage: "en",
    audioText: word.trim(),
  };
}

/* ============================================================
   Word extraction
   ============================================================ */

/**
 * Removes punctuation from a word while preserving apostrophes.
 *
 * Examples:
 *   "learning," -> "learning"
 *   "student's" -> "student's"
 */
export function normalizeLibraryWord(
  word: string,
): string {
  return word
    .trim()
    .replace(
      /^[^A-Za-zÀ-ÖØ-öø-ÿ'-]+|[^A-Za-zÀ-ÖØ-öø-ÿ'-]+$/g,
      "",
    );
}

/**
 * Extracts individual words from article content.
 *
 * This is used by the UI to make words clickable.
 */
export function getArticleWords(
  articleId: string,
): string[] {
  const article = getArticleById(articleId);

  if (!article) {
    return [];
  }

  const words =
    article.content.match(
      /[A-Za-zÀ-ÖØ-öø-ÿ]+(?:'[A-Za-zÀ-ÖØ-öø-ÿ]+)?/g,
    ) ?? [];

  return words;
}

/**
 * Returns unique words from an article.
 */
export function getUniqueArticleWords(
  articleId: string,
): string[] {
  const words = getArticleWords(articleId);

  return [
    ...new Set(
      words.map((word) =>
        word.toLowerCase(),
      ),
    ),
  ];
}

/**
 * Checks whether a selected word exists in an article.
 */
export function articleContainsWord(
  articleId: string,
  word: string,
): boolean {
  const normalized =
    normalizeLibraryWord(word).toLowerCase();

  if (!normalized) {
    return false;
  }

  return getArticleWords(articleId).some(
    (articleWord) =>
      normalizeLibraryWord(articleWord)
        .toLowerCase() === normalized,
  );
}

/* ============================================================
   Vocabulary helpers
   ============================================================ */

/**
 * Checks whether a word is part of the article's
 * manually selected learning vocabulary.
 */
export function isArticleVocabularyWord(
  articleId: string,
  word: string,
): boolean {
  const normalized =
    normalizeLibraryWord(word).toLowerCase();

  return getArticleVocabulary(articleId).some(
    (vocabularyWord) =>
      normalizeLibraryWord(vocabularyWord)
        .toLowerCase() === normalized,
  );
}

/**
 * Finds the exact vocabulary entry used by the article.
 */
export function findArticleVocabularyWord(
  articleId: string,
  word: string,
): string | null {
  const normalized =
    normalizeLibraryWord(word).toLowerCase();

  return (
    getArticleVocabulary(articleId).find(
      (vocabularyWord) =>
        normalizeLibraryWord(vocabularyWord)
          .toLowerCase() === normalized,
    ) ?? null
  );
}

/* ============================================================
   Google Translate URL helpers
   ============================================================ */

/**
 * Creates a Google Translate URL for a selected word.
 *
 * This is a fallback/navigation URL.
 * The main Library experience should use the in-app translation
 * service so the result appears inside the application.
 */
export function createGoogleTranslateUrl(
  word: string,
  targetLanguage: string = DEFAULT_TRANSLATION_LANGUAGE,
): string {
  const sourceWord = word.trim();

  const target =
    isSupportedTranslationLanguage(targetLanguage)
      ? targetLanguage
      : DEFAULT_TRANSLATION_LANGUAGE;

  const params = new URLSearchParams({
    sl: "auto",
    tl: target,
    text: sourceWord,
  });

  return `https://translate.google.com/?${params.toString()}`;
}

/**
 * Creates a Google Translate URL for a complete article.
 *
 * This is useful as a fallback if the user wants to translate
 * the complete article rather than one selected word.
 */
export function createGoogleTranslateArticleUrl(
  articleId: string,
  targetLanguage: string = DEFAULT_TRANSLATION_LANGUAGE,
): string | null {
  const article = getArticleById(articleId);

  if (!article) {
    return null;
  }

  const target =
    isSupportedTranslationLanguage(targetLanguage)
      ? targetLanguage
      : DEFAULT_TRANSLATION_LANGUAGE;

  const params = new URLSearchParams({
    sl: "en",
    tl: target,
    text: article.content,
  });

  return `https://translate.google.com/?${params.toString()}`;
}

/* ============================================================
   Library statistics
   ============================================================ */

export function getLibraryStats() {
  const byLevel: Record<Level, number> = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
  };

  const byTopic: Record<string, number> = {};

  for (const article of LIBRARY_ARTICLES) {
    byLevel[article.level] += 1;

    byTopic[article.topic] =
      (byTopic[article.topic] ?? 0) + 1;
  }

  return {
    totalArticles: LIBRARY_ARTICLES.length,
    totalTopics: LIBRARY_TOPICS.length,
    totalLevels: LIBRARY_LEVELS.length,
    byLevel,
    byTopic,
  };
}

/* ============================================================
   Validation
   ============================================================ */

export function validateLibrary(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const article of LIBRARY_ARTICLES) {
    if (ids.has(article.id)) {
      errors.push(
        `Duplicate article ID: ${article.id}`,
      );
    }

    ids.add(article.id);

    if (!article.title.trim()) {
      errors.push(
        `Article ${article.id} has no title.`,
      );
    }

    if (!article.content.trim()) {
      errors.push(
        `Article ${article.id} has no content.`,
      );
    }

    if (
      !LIBRARY_LEVELS.includes(
        article.level,
      )
    ) {
      errors.push(
        `Article ${article.id} has invalid level.`,
      );
    }

    if (
      !LIBRARY_TOPICS.includes(
        article.topic as (typeof LIBRARY_TOPICS)[number],
      )
    ) {
      errors.push(
        `Article ${article.id} has invalid topic: ${article.topic}`,
      );
    }

    for (const question of article.questions) {
      if (
        !question.options.includes(
          question.correctAnswer,
        )
      ) {
        errors.push(
          `Question ${question.id} has a correct answer that is not in its options.`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}