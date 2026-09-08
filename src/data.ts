import type {
  Article,
  PracticeQuestion,
  Level,
} from "./types";

export const LEVELS: Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

export const TOPICS = [
  "Daily Life",
  "Travel",
  "Education",
  "Technology",
  "Science",
  "Environment",
  "Culture",
  "History",
  "Health",
  "Animals",
  "Space",
  "Society",
];

export const articles: Article[] = [
  {
    id: "daily-routine-a1",
    level: "A1",
    topic: "Daily Life",
    title: "A Simple Daily Routine",
    description:
      "Learn simple English words and sentences about everyday activities.",
    estimatedMinutes: 3,
    content: `
Every day, I wake up early in the morning.

I get out of bed and open the window. Then I wash my face and brush my teeth. After that, I have breakfast with my family.

I usually eat bread, eggs, and fruit. I also drink water or tea.

After breakfast, I get ready for school. I take my school bag and leave home.

At school, I study English, science, mathematics, and other subjects.

When I come home, I have lunch and rest for a short time. Then I do my homework.

In the evening, I like reading, drawing, or learning something new.

Before I go to bed, I prepare my things for the next day.

I usually go to sleep at night because I want to feel ready and active the next morning.
    `.trim(),
  },

  {
    id: "travel-a2",
    level: "A2",
    topic: "Travel",
    title: "Why People Love Traveling",
    description:
      "Discover some simple reasons why people enjoy visiting new places.",
    estimatedMinutes: 4,
    content: `
Traveling gives people the opportunity to discover new places and meet different people.

When we travel, we can learn about different cultures, traditions, foods, and languages.

Some people travel to relax. They may visit beaches, mountains, or quiet villages. Other people travel because they want adventure and new experiences.

Traveling can also help people become more independent. When someone visits a new place, they often need to make decisions, solve small problems, and communicate with people they do not know.

Learning a few words in the local language can make a trip more enjoyable. Even a simple greeting can help create a friendly connection.

Travel does not always have to be expensive. People can explore places near their homes and still discover something new.

The most important part of traveling is not always the distance. Sometimes, the best experience comes from seeing familiar things from a different perspective.
    `.trim(),
  },

  {
    id: "education-b1",
    level: "B1",
    topic: "Education",
    title: "Learning Beyond the Classroom",
    description:
      "Explore how learning can happen outside traditional classrooms.",
    estimatedMinutes: 5,
    content: `
Education is often associated with schools, teachers, textbooks, and examinations. However, learning does not stop when students leave the classroom.

People learn throughout their lives from their experiences, conversations, mistakes, books, and communities.

The internet has also changed the way people access information. A student can watch a lecture from another country, read an article written by a researcher, or practice a language with someone living thousands of kilometers away.

Independent learning requires discipline. Without a teacher reminding us what to study, it can be difficult to remain consistent.

One useful strategy is to create small and realistic goals. Instead of trying to learn everything in one day, a learner can study for a short period every day.

Another important part of learning is asking questions. Curiosity encourages people to investigate ideas rather than simply memorize information.

Education therefore extends far beyond examinations. It can become a lifelong process that helps people understand themselves, other people, and the world around them.
    `.trim(),
  },

  {
    id: "technology-b2",
    level: "B2",
    topic: "Technology",
    title: "How Technology Changes Communication",
    description:
      "Read about the positive and challenging effects of modern communication technology.",
    estimatedMinutes: 6,
    content: `
Communication has changed dramatically over the past few decades.

In the past, people often depended on letters, landline telephones, or face-to-face meetings to communicate across long distances. Today, messages can travel around the world almost instantly.

Social media, messaging applications, and video calls allow people to maintain relationships even when they live in different countries.

This has created many opportunities. Students can collaborate internationally, families can stay connected, and organizations can communicate with people in different regions.

However, faster communication also creates challenges. People may feel pressure to respond immediately to messages. Online conversations can also cause misunderstandings because written text does not always communicate tone or emotion clearly.

Another concern is the amount of information people receive every day. Constant notifications can make it difficult to concentrate.

Technology itself is neither completely positive nor negative. Its effects depend largely on how people use it.

Developing healthy digital habits can help people benefit from modern communication while reducing some of its disadvantages.
    `.trim(),
  },

  {
    id: "science-c1",
    level: "C1",
    topic: "Science",
    title: "Why Scientific Curiosity Matters",
    description:
      "A higher-level article about curiosity, evidence, and scientific thinking.",
    estimatedMinutes: 7,
    content: `
Scientific progress begins with curiosity.

Many important discoveries started when someone noticed something unusual and decided to investigate it rather than ignore it.

Curiosity encourages people to ask questions, but scientific thinking requires more than asking questions. Researchers must collect evidence, test explanations, examine alternative possibilities, and remain willing to change their conclusions when new evidence appears.

This process can be difficult because humans naturally have assumptions and biases. We may prefer information that supports what we already believe and overlook evidence that challenges our opinions.

Science provides methods for reducing these problems. Repeated experiments, peer review, transparent methods, and careful measurement allow researchers to evaluate ideas systematically.

Scientific knowledge is also constantly developing. A scientific explanation that is accepted today may be refined or replaced in the future when stronger evidence becomes available.

This does not mean that science is unreliable. Instead, its strength comes from its ability to correct itself.

Scientific curiosity is therefore valuable not only to researchers but to everyone. It encourages people to distinguish between evidence and assumption and to approach unfamiliar questions with an open mind.
    `.trim(),
  },

  {
    id: "space-c2",
    level: "C2",
    topic: "Space",
    title: "The Challenges of Human Life Beyond Earth",
    description:
      "An advanced discussion of the scientific and practical challenges of living beyond Earth.",
    estimatedMinutes: 8,
    content: `
Human exploration beyond Earth presents challenges that extend far beyond the engineering difficulty of reaching another celestial body.

The human body evolved under Earth's conditions, including its gravity, atmosphere, radiation environment, and biological cycles. Outside this environment, astronauts face physiological risks that must be carefully managed.

Long-duration missions also create psychological and social challenges. A small group of people may have to live together for months or years while experiencing isolation and limited communication with Earth.

Resources present another major problem. Water, oxygen, food, energy, and spare equipment cannot always be delivered from Earth efficiently.

For this reason, future settlements may need systems capable of recycling resources and producing essential materials locally.

Mars is often discussed as a possible destination for long-term human exploration. However, reaching Mars is only one part of the problem. A sustainable settlement would require reliable energy systems, protection from radiation, food production, medical facilities, and methods for maintaining equipment in a hostile environment.

The question of whether humans can live beyond Earth is therefore not simply a question of transportation.

It is a question of whether we can create an environment in which human beings can remain physically healthy, psychologically stable, and technologically self-sufficient for extended periods.

The answer will depend on advances across many scientific disciplines and, equally importantly, on international cooperation.
    `.trim(),
  },
];

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: "a1-1",
    level: "A1",
    question: "Choose the correct sentence.",
    options: [
      "She go to school.",
      "She goes to school.",
      "She going to school.",
      "She gone to school.",
    ],
    correctAnswer: "She goes to school.",
    explanation:
      "With he, she, and it in the present simple, the verb usually takes -s or -es.",
  },

  {
    id: "a1-2",
    level: "A1",
    question: "What is the opposite of 'big'?",
    options: [
      "Small",
      "Long",
      "Fast",
      "High",
    ],
    correctAnswer: "Small",
    explanation: "'Small' is the opposite of 'big'.",
  },

  {
    id: "a2-1",
    level: "A2",
    question: "Choose the correct past form: 'I ___ a movie yesterday.'",
    options: [
      "watch",
      "watches",
      "watched",
      "watching",
    ],
    correctAnswer: "watched",
    explanation:
      "The sentence refers to yesterday, so the past form 'watched' is correct.",
  },

  {
    id: "b1-1",
    level: "B1",
    question:
      "Choose the best word: 'She has lived here ___ 2020.'",
    options: [
      "for",
      "since",
      "during",
      "from",
    ],
    correctAnswer: "since",
    explanation:
      "'Since' is used with a specific starting point in time.",
  },

  {
    id: "b2-1",
    level: "B2",
    question:
      "Which sentence is grammatically correct?",
    options: [
      "If I knew, I would tell you.",
      "If I know, I would told you.",
      "If I had know, I tell you.",
      "If I knowing, I would tell you.",
    ],
    correctAnswer: "If I knew, I would tell you.",
    explanation:
      "This is a second conditional structure: if + past simple, would + base verb.",
  },

  {
    id: "c1-1",
    level: "C1",
    question:
      "Choose the word that best completes the sentence: 'The evidence was ___ to support the conclusion.'",
    options: [
      "sufficient",
      "sufficiency",
      "sufficiently",
      "suffice",
    ],
    correctAnswer: "sufficient",
    explanation:
      "'Sufficient' is an adjective and correctly describes the evidence.",
  },

  {
    id: "c2-1",
    level: "C2",
    question:
      "Which word most closely means 'ambiguous'?",
    options: [
      "Unclear",
      "Certain",
      "Immediate",
      "Permanent",
    ],
    correctAnswer: "Unclear",
    explanation:
      "'Ambiguous' describes something that can have more than one interpretation or is not clear.",
  },
];

export function getArticlesByLevel(level: Level): Article[] {
  return articles.filter((article) => article.level === level);
}

export function getArticlesByTopic(
  level: Level,
  topic: string,
): Article[] {
  return articles.filter(
    (article) =>
      article.level === level &&
      article.topic === topic,
  );
}

export function getArticleById(
  id: string,
): Article | undefined {
  return articles.find((article) => article.id === id);
}

export function getQuestionsByLevel(
  level: Level,
): PracticeQuestion[] {
  return practiceQuestions.filter(
    (question) => question.level === level,
  );
}