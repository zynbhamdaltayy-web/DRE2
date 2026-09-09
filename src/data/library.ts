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
] as const;

export const LIBRARY_LEVELS: Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

export const LIBRARY_ARTICLES: LibraryArticle[] = [
  {
    id: "a1-daily-morning",
    title: "A Simple Morning",
    level: "A1",
    topic: "Daily Life",
    readingTime: 2,
    content:
      "Every morning, Sara wakes up at seven o'clock. She opens the window and looks at the sky. Then she washes her face and drinks a glass of water. After breakfast, she gets her school bag and goes to school. Sara likes mornings because the streets are quiet and the air is fresh.",
    vocabulary: [
      "morning",
      "window",
      "sky",
      "breakfast",
      "school bag",
      "quiet",
      "fresh",
    ],
    questions: [
      {
        id: "a1-daily-morning-q1",
        question: "What time does Sara wake up?",
        options: [
          "Six o'clock",
          "Seven o'clock",
          "Eight o'clock",
          "Nine o'clock",
        ],
        correctAnswer: "Seven o'clock",
      },
      {
        id: "a1-daily-morning-q2",
        question: "Why does Sara like mornings?",
        options: [
          "The school is closed.",
          "She can sleep all day.",
          "The streets are quiet and the air is fresh.",
          "She does not have breakfast.",
        ],
        correctAnswer:
          "The streets are quiet and the air is fresh.",
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
      "Maya has a new class this year. Her classroom is on the second floor. There are twenty students in the class. Maya sits near the window with her friend Lina. They study English, mathematics, science, and history. Maya enjoys English because she likes learning new words.",
    vocabulary: [
      "classroom",
      "floor",
      "students",
      "window",
      "mathematics",
      "history",
      "words",
    ],
    questions: [
      {
        id: "a1-school-class-q1",
        question: "Where is Maya's classroom?",
        options: [
          "On the first floor",
          "On the second floor",
          "On the third floor",
          "Outside the school",
        ],
        correctAnswer: "On the second floor",
      },
      {
        id: "a1-school-class-q2",
        question: "Why does Maya enjoy English?",
        options: [
          "She likes mathematics.",
          "She likes sports.",
          "She likes learning new words.",
          "She likes history.",
        ],
        correctAnswer:
          "She likes learning new words.",
      },
    ],
  },

  {
    id: "a2-travel-city",
    title: "Exploring a New City",
    level: "A2",
    topic: "Travel",
    readingTime: 3,
    content:
      "Last summer, Adam visited a city he had never seen before. He spent three days exploring its streets, museums, and parks. On the first day, he walked through the old market and tried several local foods. The next day, he visited a large museum and learned about the history of the city. Before returning home, he bought a small gift for his family.",
    vocabulary: [
      "explore",
      "visited",
      "museum",
      "local",
      "market",
      "history",
      "gift",
    ],
    questions: [
      {
        id: "a2-travel-city-q1",
        question: "How long did Adam stay in the city?",
        options: [
          "One day",
          "Two days",
          "Three days",
          "One week",
        ],
        correctAnswer: "Three days",
      },
      {
        id: "a2-travel-city-q2",
        question: "What did Adam buy before returning home?",
        options: [
          "A book",
          "A small gift",
          "A new phone",
          "A painting",
        ],
        correctAnswer: "A small gift",
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
      "Sleep is an important part of a healthy lifestyle. When people sleep well, they often have more energy during the day. Good sleep can also help people concentrate at school or work. Experts generally recommend having a regular sleeping schedule and avoiding bright screens shortly before bedtime.",
    vocabulary: [
      "sleep",
      "healthy",
      "energy",
      "concentrate",
      "regular",
      "schedule",
      "bedtime",
    ],
    questions: [
      {
        id: "a2-health-sleep-q1",
        question: "What can good sleep help people do?",
        options: [
          "Concentrate better",
          "Avoid all work",
          "Stay awake all night",
          "Skip meals",
        ],
        correctAnswer: "Concentrate better",
      },
      {
        id: "a2-health-sleep-q2",
        question: "What should people avoid before bedtime?",
        options: [
          "Water",
          "Books",
          "Bright screens",
          "Quiet rooms",
        ],
        correctAnswer: "Bright screens",
      },
    ],
  },

  {
    id: "b1-technology-learning",
    title: "Technology and Learning",
    level: "B1",
    topic: "Technology",
    readingTime: 4,
    content:
      "Technology has changed the way many students learn. Instead of depending only on printed textbooks, students can now watch educational videos, use digital libraries, and communicate with learners around the world. However, having access to information does not automatically mean that students will learn effectively. They still need to evaluate sources, organize their time, and practice what they have learned.",
    vocabulary: [
      "depend",
      "digital",
      "communicate",
      "access",
      "automatically",
      "evaluate",
      "sources",
    ],
    questions: [
      {
        id: "b1-technology-learning-q1",
        question:
          "What can students use instead of only printed textbooks?",
        options: [
          "Educational videos and digital libraries",
          "Only social media",
          "Only newspapers",
          "Nothing",
        ],
        correctAnswer:
          "Educational videos and digital libraries",
      },
      {
        id: "b1-technology-learning-q2",
        question:
          "What do students still need to do?",
        options: [
          "Avoid practice",
          "Evaluate sources and organize their time",
          "Stop using technology",
          "Memorize every website",
        ],
        correctAnswer:
          "Evaluate sources and organize their time",
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
      "Environmental problems can seem too large for one person to solve, but everyday choices can still make a difference. Using reusable bottles, reducing unnecessary waste, and saving electricity are simple examples. When many people make similar choices, their combined effect can become significant. Schools and communities can also encourage environmental responsibility through practical projects.",
    vocabulary: [
      "environmental",
      "reusable",
      "waste",
      "electricity",
      "combined",
      "significant",
      "responsibility",
    ],
    questions: [
      {
        id: "b1-environment-actions-q1",
        question:
          "Why can individual choices matter?",
        options: [
          "They are always expensive.",
          "Their combined effect can become significant.",
          "They solve every problem immediately.",
          "They require no effort.",
        ],
        correctAnswer:
          "Their combined effect can become significant.",
      },
      {
        id: "b1-environment-actions-q2",
        question:
          "What can schools encourage?",
        options: [
          "Environmental responsibility",
          "More waste",
          "Higher electricity use",
          "Less community activity",
        ],
        correctAnswer:
          "Environmental responsibility",
      },
    ],
  },

  {
    id: "b2-science-curiosity",
    title: "The Value of Curiosity",
    level: "B2",
    topic: "Science",
    readingTime: 5,
    content:
      "Curiosity is one of the forces that drives scientific discovery. Researchers often begin with a simple question about something that appears ordinary. They observe, test possible explanations, and revise their ideas when evidence challenges their assumptions. This process can be slow, but uncertainty is not necessarily a weakness in science. In many cases, recognizing what is not yet known is the first step toward discovering something new.",
    vocabulary: [
      "curiosity",
      "discovery",
      "researcher",
      "evidence",
      "assumption",
      "uncertainty",
      "recognizing",
    ],
    questions: [
      {
        id: "b2-science-curiosity-q1",
        question:
          "What often begins scientific discovery?",
        options: [
          "A simple question",
          "A final answer",
          "A completed experiment",
          "A random guess",
        ],
        correctAnswer: "A simple question",
      },
      {
        id: "b2-science-curiosity-q2",
        question:
          "Why can uncertainty be useful in science?",
        options: [
          "It prevents research.",
          "It shows that nothing is known.",
          "Recognizing what is unknown can lead to new discoveries.",
          "It replaces evidence.",
        ],
        correctAnswer:
          "Recognizing what is unknown can lead to new discoveries.",
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
      "Museums have traditionally been places where people encounter objects from history, art, and science. Today, however, many museums are reconsidering how visitors interact with their collections. Digital exhibitions, interactive displays, and accessible educational programs can make cultural knowledge available to a wider audience. The challenge is to use technology without allowing it to distract visitors from the objects and ideas that museums are intended to preserve.",
    vocabulary: [
      "traditionally",
      "encounter",
      "collections",
      "interactive",
      "accessible",
      "audience",
      "preserve",
    ],
    questions: [
      {
        id: "b2-culture-museums-q1",
        question:
          "How are museums changing visitor experiences?",
        options: [
          "By removing all collections",
          "By using digital and interactive approaches",
          "By closing educational programs",
          "By avoiding technology completely",
        ],
        correctAnswer:
          "By using digital and interactive approaches",
      },
      {
        id: "b2-culture-museums-q2",
        question:
          "What challenge does the article identify?",
        options: [
          "Making museums smaller",
          "Avoiding all visitors",
          "Using technology without distracting from the museum's purpose",
          "Replacing objects with advertisements",
        ],
        correctAnswer:
          "Using technology without distracting from the museum's purpose",
      },
    ],
  },

  {
    id: "c1-education-deep-learning",
    title: "Beyond Memorization",
    level: "C1",
    topic: "Education",
    readingTime: 6,
    content:
      "Memorization has a legitimate role in education, particularly when learners need to establish a foundation of essential knowledge. Yet an educational system that treats memorization as the final objective risks confusing familiarity with genuine understanding. Deep learning requires students to connect ideas, question assumptions, apply concepts in unfamiliar contexts, and explain their reasoning. Such learning is usually slower than simply recalling information, but it is considerably more durable.",
    vocabulary: [
      "memorization",
      "legitimate",
      "foundation",
      "familiarity",
      "genuine",
      "assumptions",
      "durable",
    ],
    questions: [
      {
        id: "c1-education-learning-q1",
        question:
          "What is the main limitation of treating memorization as the final objective?",
        options: [
          "It is always impossible.",
          "It can confuse familiarity with genuine understanding.",
          "It eliminates all knowledge.",
          "It makes learning faster.",
        ],
        correctAnswer:
          "It can confuse familiarity with genuine understanding.",
      },
      {
        id: "c1-education-learning-q2",
        question:
          "What makes deep learning more durable?",
        options: [
          "Repeating isolated facts only",
          "Avoiding unfamiliar situations",
          "Connecting ideas and applying concepts",
          "Studying without explanation",
        ],
        correctAnswer:
          "Connecting ideas and applying concepts",
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
      "Online communities do not become healthy merely because people have access to a communication platform. Their quality is influenced by the rules, incentives, and social expectations embedded in the design of that platform. Clear reporting mechanisms, meaningful moderation, and privacy-conscious defaults can reduce certain risks. At the same time, communities require members who are willing to contribute constructively rather than treating safety as a responsibility that belongs exclusively to administrators.",
    vocabulary: [
      "architecture",
      "incentives",
      "embedded",
      "moderation",
      "privacy-conscious",
      "constructively",
      "administrators",
    ],
    questions: [
      {
        id: "c1-society-communities-q1",
        question:
          "What influences the quality of online communities?",
        options: [
          "Only the number of users",
          "Rules, incentives, and social expectations",
          "Only the platform's logo",
          "The absence of moderation",
        ],
        correctAnswer:
          "Rules, incentives, and social expectations",
      },
      {
        id: "c1-society-communities-q2",
        question:
          "What does the article say about safety?",
        options: [
          "It is only an administrator's responsibility.",
          "It is impossible online.",
          "Members also have a responsibility to contribute constructively.",
          "It does not require rules.",
        ],
        correctAnswer:
          "Members also have a responsibility to contribute constructively.",
      },
    ],
  },

  {
    id: "c2-science-uncertainty",
    title: "Reasoning Under Uncertainty",
    level: "C2",
    topic: "Science",
    readingTime: 7,
    content:
      "Scientific reasoning rarely proceeds from absolute certainty. Researchers frequently work with incomplete observations, competing explanations, and measurements that contain some degree of error. Rather than eliminating uncertainty entirely, rigorous inquiry attempts to characterize it and determine how strongly the available evidence supports competing claims. This distinction is crucial: a conclusion can be well supported without being permanently immune to revision. Indeed, the capacity to revise a conclusion in response to better evidence is one of the defining strengths of scientific practice.",
    vocabulary: [
      "uncertainty",
      "competing",
      "measurements",
      "rigorous",
      "characterize",
      "revision",
      "inquiry",
    ],
    questions: [
      {
        id: "c2-science-uncertainty-q1",
        question:
          "What does rigorous scientific inquiry attempt to do with uncertainty?",
        options: [
          "Pretend it does not exist.",
          "Eliminate it completely.",
          "Characterize it and evaluate its effect on competing claims.",
          "Replace evidence with certainty.",
        ],
        correctAnswer:
          "Characterize it and evaluate its effect on competing claims.",
      },
      {
        id: "c2-science-uncertainty-q2",
        question:
          "Why is revising conclusions considered a strength?",
        options: [
          "Because conclusions are never useful.",
          "Because science can respond to better evidence.",
          "Because evidence is unnecessary.",
          "Because uncertainty disappears.",
        ],
        correctAnswer:
          "Because science can respond to better evidence.",
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
      "Institutional reforms are often evaluated according to their intended outcomes, yet the effects of a policy may extend well beyond what its designers anticipated. Changes in incentives can alter individual behavior, redistribute resources, or create strategies for circumventing newly established rules. Consequently, evaluating a reform requires more than measuring whether its immediate objectives were achieved. It also requires attention to second-order effects, distributional consequences, and the possibility that apparently successful interventions may generate new problems elsewhere in the system.",
    vocabulary: [
      "institutional",
      "reform",
      "incentives",
      "redistribute",
      "circumvent",
      "second-order",
      "distributional",
    ],
    questions: [
      {
        id: "c2-society-institutions-q1",
        question:
          "Why should reforms be evaluated beyond their immediate objectives?",
        options: [
          "Policies never have objectives.",
          "Their effects may include unintended and second-order consequences.",
          "Immediate objectives are always irrelevant.",
          "Reforms cannot change behavior.",
        ],
        correctAnswer:
          "Their effects may include unintended and second-order consequences.",
      },
      {
        id: "c2-society-institutions-q2",
        question:
          "What can changes in incentives do?",
        options: [
          "They can alter behavior and redistribute resources.",
          "They always eliminate problems.",
          "They prevent people from adapting.",
          "They have no effect outside institutions.",
        ],
        correctAnswer:
          "They can alter behavior and redistribute resources.",
      },
    ],
  },
];

/* ======================================================
   HELPERS
====================================================== */

export function getLibraryArticles(
  level?: Level,
  topic?: string,
): LibraryArticle[] {
  return LIBRARY_ARTICLES.filter(
    (article) => {
      const matchesLevel =
        !level ||
        article.level === level;

      const matchesTopic =
        !topic ||
        article.topic === topic;

      return (
        matchesLevel &&
        matchesTopic
      );
    },
  );
}

export function getArticleById(
  articleId: string,
): LibraryArticle | null {
  return (
    LIBRARY_ARTICLES.find(
      (article) =>
        article.id === articleId,
    ) ?? null
  );
}

export function getArticlesByLevel(
  level: Level,
): LibraryArticle[] {
  return getLibraryArticles(level);
}

export function getArticlesByTopic(
  topic: string,
): LibraryArticle[] {
  return getLibraryArticles(
    undefined,
    topic,
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
  return (
    getArticleById(articleId)
      ?.vocabulary ?? []
  );
}

export function getArticleQuestions(
  articleId: string,
): LibraryQuestion[] {
  return (
    getArticleById(articleId)
      ?.questions ?? []
  );
}

export function getReadingTime(
  articleId: string,
): number {
  return (
    getArticleById(articleId)
      ?.readingTime ?? 0
  );
}

export function searchLibrary(
  searchTerm: string,
): LibraryArticle[] {
  const term =
    searchTerm
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
      article.content
        .toLowerCase()
        .includes(term) ||
      article.vocabulary.some(
        (word) =>
          word
            .toLowerCase()
            .includes(term),
      ),
  );
}

export function getLibraryStats() {
  const articlesByLevel =
    LIBRARY_LEVELS.reduce(
      (result, level) => {
        result[level] =
          LIBRARY_ARTICLES.filter(
            (article) =>
              article.level === level,
          ).length;

        return result;
      },
      {} as Record<Level, number>,
    );

  const articlesByTopic =
    LIBRARY_TOPICS.reduce(
      (result, topic) => {
        result[topic] =
          LIBRARY_ARTICLES.filter(
            (article) =>
              article.topic === topic,
          ).length;

        return result;
      },
      {} as Record<string, number>,
    );

  return {
    totalArticles:
      LIBRARY_ARTICLES.length,

    totalVocabulary:
      LIBRARY_ARTICLES.reduce(
        (total, article) =>
          total +
          article.vocabulary.length,
        0,
      ),

    totalQuestions:
      LIBRARY_ARTICLES.reduce(
        (total, article) =>
          total +
          article.questions.length,
        0,
      ),

    articlesByLevel,
    articlesByTopic,
  };
}