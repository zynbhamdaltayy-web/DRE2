import "./style.css";
import Peer, { MediaConnection } from "peerjs";

type Page =
  | "welcome"
  | "auth"
  | "signup"
  | "login"
  | "avatar"
  | "home"
  | "library"
  | "article"
  | "vocabulary"
  | "practice"
  | "rooms"
  | "games"
  | "progress"
  | "profile";

type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type Avatar = {
  skin: string;
  eyes: string;
  hair: string;
  shirt: string;
};

type Article = {
  id: string;
  level: Level;
  topic: string;
  title: string;
  content: string[];
};

type PracticeQuestion = {
  question: string;
  answers: string[];
  correct: number;
};

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container not found.");
}

const STORAGE_KEY = "dre2learn_state";

const defaultAvatar: Avatar = {
  skin: "#F2C7A5",
  eyes: "#4A3025",
  hair: "#3A2418",
  shirt: "#F6A27A",
};

const state = {
  page: "welcome" as Page,
  name: "",
  email: "",
  level: "B1" as Level,
  avatar: { ...defaultAvatar },
  vocabulary: [] as string[],
  completedArticles: [] as string[],
  practiceScore: 0,
  currentArticleId: "",
  selectedLibraryLevel: "ALL" as Level | "ALL",
  selectedTopic: "ALL",
};

const articles: Article[] = [
  {
    id: "daily-routines",
    level: "A2",
    topic: "Daily Life",
    title: "A Simple Daily Routine",
    content: [
      "Every morning, Sara wakes up early and opens the window.",
      "She drinks a glass of water and prepares a simple breakfast.",
      "After breakfast, she studies English for thirty minutes.",
      "In the afternoon, she usually helps her family and reads a book.",
      "In the evening, she prepares her school bag for the next day.",
    ],
  },
  {
    id: "learning-languages",
    level: "B1",
    topic: "Languages",
    title: "Why Learning Languages Matters",
    content: [
      "Learning a new language can change the way we understand the world.",
      "When people learn another language, they often discover new cultures and different ways of thinking.",
      "Language learning also gives people more opportunities to communicate with others.",
      "The most important part is to practice regularly and not be afraid of making mistakes.",
      "Small improvements every day can lead to strong results over time.",
    ],
  },
  {
    id: "technology",
    level: "B2",
    topic: "Technology",
    title: "Technology in Everyday Life",
    content: [
      "Technology has become an important part of everyday life.",
      "People use digital devices to communicate, study, work, and find information.",
      "Technology can save time, but it can also become distracting when people use it without limits.",
      "For this reason, learning how to use technology responsibly is increasingly important.",
    ],
  },
];

const practiceQuestions: PracticeQuestion[] = [
  {
    question: "Choose the correct sentence.",
    answers: [
      "She go to school every day.",
      "She goes to school every day.",
      "She going to school every day.",
      "She gone to school every day.",
    ],
    correct: 1,
  },
  {
    question: "Choose the correct word: I have lived here ___ 2022.",
    answers: ["for", "since", "during", "from"],
    correct: 1,
  },
  {
    question: "Choose the closest meaning of “improve”.",
    answers: ["to get better", "to disappear", "to forget", "to stop"],
    correct: 0,
  },
];

let currentPracticeIndex = 0;
let practiceAnswered = false;
let lastAnswer = -1;

/* =========================================================
   REAL ROOMS / WEBRTC STATE
   ========================================================= */

let peer: Peer | null = null;
let activeCall: MediaConnection | null = null;

let localMediaStream: MediaStream | null = null;
let screenStream: MediaStream | null = null;

let remoteStream: MediaStream | null = null;

let currentRoomPeerId = "";
let connectedRoomPeerId = "";

let isRoomConnected = false;
let isScreenSharing = false;

/*
  This keeps the room connection alive while the user navigates
  inside DRE2learn.
*/

let roomStatusMessage = "Not connected";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveState(): void {
  const data = {
    name: state.name,
    email: state.email,
    level: state.level,
    avatar: state.avatar,
    vocabulary: state.vocabulary,
    completedArticles: state.completedArticles,
    practiceScore: state.practiceScore,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState(): void {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    state.name = typeof data.name === "string" ? data.name : "";
    state.email = typeof data.email === "string" ? data.email : "";
    state.level = isLevel(data.level) ? data.level : "B1";

    if (data.avatar) {
      state.avatar = {
        skin: data.avatar.skin || defaultAvatar.skin,
        eyes: data.avatar.eyes || defaultAvatar.eyes,
        hair: data.avatar.hair || defaultAvatar.hair,
        shirt: data.avatar.shirt || defaultAvatar.shirt,
      };
    }

    state.vocabulary = Array.isArray(data.vocabulary)
      ? data.vocabulary
      : [];

    state.completedArticles = Array.isArray(
      data.completedArticles,
    )
      ? data.completedArticles
      : [];

    state.practiceScore =
      typeof data.practiceScore === "number"
        ? data.practiceScore
        : 0;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function isLevel(value: unknown): value is Level {
  return (
    value === "A1" ||
    value === "A2" ||
    value === "B1" ||
    value === "B2" ||
    value === "C1" ||
    value === "C2"
  );
}

function navigate(page: Page): void {
  state.page = page;
  render();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  /*
    If we return to Rooms after a connection already exists,
    restore the video streams.
  */
  if (page === "rooms") {
    window.setTimeout(() => {
      attachCurrentStreamsToRoomUI();
    }, 50);
  }
}

function showToast(message: string): void {
  const existing = document.querySelector(".toast");

  existing?.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2200);
}

function getInitials(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) return "D";

  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase(),
    )
    .join("");
}

function avatarSvg(size = 180): string {
  const { skin, eyes, hair, shirt } = state.avatar;

  return `
    <svg
      class="avatar-svg"
      width="${size}"
      height="${size}"
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DRE2learn avatar"
    >
      <circle cx="90" cy="90" r="84" fill="#FFF7F2"/>

      <path
        d="M49 78C49 47 67 29 90 29C113 29 131 47 131 78V108C131 136 113 153 90 153C67 153 49 136 49 108V78Z"
        fill="${skin}"
      />

      <path
        d="M46 79C44 45 63 22 91 22C120 22 137 46 134 81C124 68 116 61 101 57C84 53 69 59 55 73L46 79Z"
        fill="${hair}"
      />

      <circle cx="74" cy="91" r="5" fill="${eyes}"/>
      <circle cx="106" cy="91" r="5" fill="${eyes}"/>

      <path
        d="M78 116C85 121 95 121 102 116"
        fill="none"
        stroke="${eyes}"
        stroke-width="4"
        stroke-linecap="round"
      />

      <path
        d="M57 131C67 124 78 122 90 122C102 122 113 124 123 131L136 170H44L57 131Z"
        fill="${shirt}"
      />

      <circle cx="90" cy="143" r="13" fill="#FFF7F2"/>

      <path
        d="M84 143L88 147L97 138"
        fill="none"
        stroke="${shirt}"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function logo(): string {
  return `
    <div class="brand">
      <div class="brand-mark">D</div>
      <span>DRE2learn</span>
    </div>
  `;
}

function renderWelcome(): string {
  return `
    <main class="welcome-page page">
      <div class="welcome-card">
        <div class="welcome-logo">
          ${logo()}
        </div>

        <div class="welcome-illustration">
          ${avatarSvg(210)}
        </div>

        <p class="eyebrow">LEARN • PRACTICE • SPEAK</p>

        <h1>Learn English your way.</h1>

        <p class="welcome-text">
          Read, practice, save new words, and speak with people.
        </p>

        <button class="primary-btn large-btn" data-action="start">
          Get Started
        </button>

        <button class="text-btn" data-action="login">
          I already have an account
        </button>
      </div>
    </main>
  `;
}

function renderAuth(): string {
  return `
    <main class="auth-page page">
      <div class="auth-card">
        ${logo()}

        <div class="auth-icon">✨</div>

        <h1>Welcome to DRE2learn</h1>

        <p>
          Start your English learning journey.
        </p>

        <button class="primary-btn" data-action="signup">
          Create account
        </button>

        <button class="secondary-btn" data-action="login">
          Log in
        </button>

        <button class="text-btn" data-action="welcome">
          Back
        </button>
      </div>
    </main>
  `;
}

function renderSignup(): string {
  return `
    <main class="form-page page">
      <div class="form-card">
        ${logo()}

        <h1>Create your account</h1>

        <p class="form-intro">
          Just a few details to get started.
        </p>

        <form id="signupForm">
          <label for="signupName">Name</label>

          <input
            id="signupName"
            name="name"
            type="text"
            placeholder="Your name"
            autocomplete="name"
            required
          />

          <label for="signupEmail">Email</label>

          <input
            id="signupEmail"
            name="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />

          <label for="signupLevel">English level</label>

          <select id="signupLevel" name="level">
            ${renderLevelOptions()}
          </select>

          <label for="signupPassword">Password</label>

          <input
            id="signupPassword"
            name="password"
            type="password"
            placeholder="Create a password"
            autocomplete="new-password"
            minlength="6"
            required
          />

          <button class="primary-btn" type="submit">
            Continue
          </button>
        </form>

        <button class="text-btn" data-action="auth">
          Back
        </button>
      </div>
    </main>
  `;
}

function renderLogin(): string {
  return `
    <main class="form-page page">
      <div class="form-card">
        ${logo()}

        <h1>Welcome back</h1>

        <p class="form-intro">
          Continue your learning journey.
        </p>

        <form id="loginForm">
          <label for="loginEmail">Email</label>

          <input
            id="loginEmail"
            name="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />

          <label for="loginPassword">Password</label>

          <input
            id="loginPassword"
            name="password"
            type="password"
            placeholder="Your password"
            autocomplete="current-password"
            required
          />

          <button class="primary-btn" type="submit">
            Log in
          </button>
        </form>

        <button class="text-btn" data-action="auth">
          Back
        </button>
      </div>
    </main>
  `;
}

function renderLevelOptions(): string {
  return ["A1", "A2", "B1", "B2", "C1", "C2"]
    .map(
      (level) => `
        <option
          value="${level}"
          ${state.level === level ? "selected" : ""}
        >
          ${level}
        </option>
      `,
    )
    .join("");
}

function renderAvatar(): string {
  return `
    <main class="avatar-page page">
      <div class="avatar-card">
        ${logo()}

        <h1>Create your avatar</h1>

        <p>
          Choose your look. You can change it later.
        </p>

        <div class="avatar-preview">
          ${avatarSvg(220)}
        </div>

        <div class="avatar-section">
          <h3>Skin</h3>

          <div class="choice-row">
            ${renderColorChoices(
              "skin",
              [
                "#F2C7A5",
                "#D99A6C",
                "#B96F45",
                "#8B4F32",
              ],
            )}
          </div>
        </div>

        <div class="avatar-section">
          <h3>Eyes</h3>

          <div class="choice-row">
            ${renderColorChoices(
              "eyes",
              [
                "#4A3025",
                "#171717",
                "#315C75",
                "#3C6B3C",
              ],
            )}
          </div>
        </div>

        <div class="avatar-section">
          <h3>Hair</h3>

          <div class="choice-row">
            ${renderColorChoices(
              "hair",
              [
                "#3A2418",
                "#171717",
                "#70452D",
                "#B7773E",
              ],
            )}
          </div>
        </div>

        <div class="avatar-section">
          <h3>Top</h3>

          <div class="choice-row">
            ${renderColorChoices(
              "shirt",
              [
                "#F6A27A",
                "#F3C7B4",
                "#A8C7D8",
                "#A9BFA3",
              ],
            )}
          </div>
        </div>

        <button class="primary-btn" data-action="saveAvatar">
          Continue
        </button>
      </div>
    </main>
  `;
}

function renderColorChoices(
  key: keyof Avatar,
  colors: string[],
): string {
  return colors
    .map(
      (color) => `
        <button
          type="button"
          class="color-choice ${
            state.avatar[key] === color
              ? "selected"
              : ""
          }"
          style="background:${color}"
          data-avatar-key="${key}"
          data-avatar-color="${color}"
          aria-label="Choose color"
        ></button>
      `,
    )
    .join("");
}

function renderShell(content: string): string {
  return `
    <div class="app-shell">
      <header class="topbar">
        <button
          class="brand-button"
          data-action="home"
        >
          ${logo()}
        </button>

        <button
          class="avatar-mini"
          data-action="profile"
        >
          ${avatarSvg(48)}
        </button>
      </header>

      ${content}

      ${renderBottomNav()}
    </div>
  `;
}

function renderBottomNav(): string {
  const active = state.page;

  return `
    <nav class="bottom-nav">
      <button
        class="${active === "home" ? "active" : ""}"
        data-action="home"
      >
        <span>⌂</span>
        <small>Home</small>
      </button>

      <button
        class="${
          active === "library" ||
          active === "article"
            ? "active"
            : ""
        }"
        data-action="library"
      >
        <span>▤</span>
        <small>Library</small>
      </button>

      <button
        class="${
          active === "practice"
            ? "active"
            : ""
        }"
        data-action="practice"
      >
        <span>✓</span>
        <small>Practice</small>
      </button>

      <button
        class="${
          active === "profile"
            ? "active"
            : ""
        }"
        data-action="profile"
      >
        <span>○</span>
        <small>Profile</small>
      </button>
    </nav>
  `;
}

function renderHome(): string {
  const name = escapeHtml(
    state.name || "Learner",
  );

  return renderShell(`
    <main class="home-page page">
      <section class="home-header">
        <div>
          <p class="eyebrow">WELCOME BACK</p>

          <h1>
            Hi, ${name}! 👋
          </h1>

          <p>
            What would you like to practice today?
          </p>
        </div>

        <div class="level-pill">
          ${state.level}
        </div>
      </section>

      <section class="progress-card">
        <div>
          <span>Your progress</span>

          <strong>
            ${state.completedArticles.length}
            articles completed
          </strong>
        </div>

        <div class="progress-track">
          <div
            class="progress-fill"
            style="width:${Math.min(
              state.completedArticles.length * 20,
              100,
            )}%"
          ></div>
        </div>
      </section>

      <section class="feature-grid">
        <button
          class="feature-card peach"
          data-action="library"
        >
          <span class="feature-icon">📚</span>
          <strong>Library</strong>
          <small>Read articles</small>
        </button>

        <button
          class="feature-card"
          data-action="practice"
        >
          <span class="feature-icon">✓</span>
          <strong>Practice</strong>
          <small>Test your English</small>
        </button>

        <button
          class="feature-card"
          data-action="rooms"
        >
          <span class="feature-icon">🗣️</span>
          <strong>Rooms</strong>
          <small>Speak with others</small>
        </button>

        <button
          class="feature-card"
          data-action="vocabulary"
        >
          <span class="feature-icon">🔖</span>
          <strong>Vocabulary</strong>
          <small>Saved words</small>
        </button>

        <button
          class="feature-card"
          data-action="games"
        >
          <span class="feature-icon">🎮</span>
          <strong>Games</strong>
          <small>Learn by playing</small>
        </button>

        <button
          class="feature-card"
          data-action="progress"
        >
          <span class="feature-icon">📈</span>
          <strong>Progress</strong>
          <small>See your growth</small>
        </button>
      </section>
    </main>
  `);
}

function renderLibrary(): string {
  const filteredArticles =
    articles.filter((article) => {
      const levelMatches =
        state.selectedLibraryLevel === "ALL" ||
        article.level ===
          state.selectedLibraryLevel;

      const topicMatches =
        state.selectedTopic === "ALL" ||
        article.topic ===
          state.selectedTopic;

      return (
        levelMatches &&
        topicMatches
      );
    });

  const topics = Array.from(
    new Set(
      articles.map(
        (article) => article.topic,
      ),
    ),
  );

  return renderShell(`
    <main class="library-page page">
      <section class="section-heading">
        <div>
          <p class="eyebrow">READING</p>

          <h1>Library</h1>

          <p>
            Choose an article and learn at your level.
          </p>
        </div>

        <button
          class="outline-btn"
          data-action="vocabulary"
        >
          Vocabulary
        </button>
      </section>

      <div class="filter-block">
        <h3>Level</h3>

        <div class="filter-row">
          ${renderLevelFilters()}
        </div>
      </div>

      <div class="filter-block">
        <h3>Topic</h3>

        <div class="filter-row">
          <button
            class="filter-btn ${
              state.selectedTopic === "ALL"
                ? "selected"
                : ""
            }"
            data-topic="ALL"
          >
            All
          </button>

          ${topics
            .map(
              (topic) => `
                <button
                  class="filter-btn ${
                    state.selectedTopic ===
                    topic
                      ? "selected"
                      : ""
                  }"
                  data-topic="${escapeHtml(
                    topic,
                  )}"
                >
                  ${escapeHtml(topic)}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>

      <section class="article-list">
        ${
          filteredArticles.length
            ? filteredArticles
                .map(
                  renderArticleCard,
                )
                .join("")
            : `
              <div class="empty-card">
                <span>📚</span>

                <h2>No articles yet</h2>

                <p>
                  Add your own articles to the
                  <strong>articles</strong>
                  list in
                  <code>src/main.ts</code>.
                </p>
              </div>
            `
        }
      </section>
    </main>
  `);
}

function renderLevelFilters(): string {
  return `
    <button
      class="filter-btn ${
        state.selectedLibraryLevel === "ALL"
          ? "selected"
          : ""
      }"
      data-level="ALL"
    >
      All
    </button>

    ${(
      [
        "A1",
        "A2",
        "B1",
        "B2",
        "C1",
        "C2",
      ] as Level[]
    )
      .map(
        (level) => `
          <button
            class="filter-btn ${
              state.selectedLibraryLevel ===
              level
                ? "selected"
                : ""
            }"
            data-level="${level}"
          >
            ${level}
          </button>
        `,
      )
      .join("")}
  `;
}

function renderArticleCard(
  article: Article,
): string {
  const completed =
    state.completedArticles.includes(
      article.id,
    );

  return `
    <button
      class="article-card"
      data-article-id="${article.id}"
    >
      <div class="article-card-top">
        <span class="article-level">
          ${article.level}
        </span>

        ${
          completed
            ? `
              <span class="completed-label">
                ✓ Completed
              </span>
            `
            : ""
        }
      </div>

      <h2>
        ${escapeHtml(article.title)}
      </h2>

      <p>
        ${escapeHtml(article.content[0])}
      </p>

      <div class="article-card-bottom">
        <span>
          ${escapeHtml(article.topic)}
        </span>

        <span>Read →</span>
      </div>
    </button>
  `;
}

function renderArticle(): string {
  const article = articles.find(
    (item) =>
      item.id ===
      state.currentArticleId,
  );

  if (!article) {
    return renderLibrary();
  }

  const completed =
    state.completedArticles.includes(
      article.id,
    );

  return renderShell(`
    <main class="article-page page">
      <button
        class="back-btn"
        data-action="library"
      >
        ← Library
      </button>

      <div class="article-meta">
        <span class="article-level">
          ${article.level}
        </span>

        <span>
          ${escapeHtml(article.topic)}
        </span>
      </div>

      <h1>
        ${escapeHtml(article.title)}
      </h1>

      <p class="article-help">
        Tap any word to save it to your vocabulary.
      </p>

      <article class="article-content">
        ${article.content
          .map(
            (paragraph) => `
              <p>
                ${makeClickableWords(
                  paragraph,
                )}
              </p>
            `,
          )
          .join("")}
      </article>

      <div class="article-actions">
        <button
          class="primary-btn"
          data-action="completeArticle"
          data-article-id="${article.id}"
        >
          ${
            completed
              ? "Completed ✓"
              : "Mark as completed"
          }
        </button>

        <button
          class="secondary-btn"
          data-action="vocabulary"
        >
          Open Vocabulary
        </button>
      </div>
    </main>
  `);
}

function makeClickableWords(
  text: string,
): string {
  return text
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) {
        return part;
      }

      const cleanWord =
        part.replace(
          /^[^\p{L}\p{N}'-]+|[^\p{L}\p{N}'-]+$/gu,
          "",
        );

      if (!cleanWord) {
        return escapeHtml(part);
      }

      return `
        <button
          type="button"
          class="article-word ${
            state.vocabulary.includes(
              cleanWord.toLowerCase(),
            )
              ? "saved"
              : ""
          }"
          data-word="${escapeHtml(
            cleanWord.toLowerCase(),
          )}"
        >
          ${escapeHtml(part)}
        </button>
      `;
    })
    .join("");
}

function renderVocabulary(): string {
  return renderShell(`
    <main class="vocabulary-page page">
      <section class="section-heading">
        <div>
          <p class="eyebrow">MY WORDS</p>

          <h1>Vocabulary</h1>

          <p>
            Words you saved while reading.
          </p>
        </div>

        ${
          state.vocabulary.length
            ? `
              <button
                class="outline-btn danger"
                data-action="clearVocabulary"
              >
                Clear all
              </button>
            `
            : ""
        }
      </section>

      ${
        state.vocabulary.length
          ? `
            <div class="vocab-list">
              ${state.vocabulary
                .map(
                  (word) => `
                    <div class="vocab-item">
                      <span>
                        ${escapeHtml(
                          word,
                        )}
                      </span>

                      <button
                        class="remove-word"
                        data-remove-word="${escapeHtml(
                          word,
                        )}"
                        aria-label="Remove word"
                      >
                        ×
                      </button>
                    </div>
                  `,
                )
                .join("")}
            </div>
          `
          : `
            <div class="empty-card">
              <span>🔖</span>

              <h2>
                Your vocabulary is empty
              </h2>

              <p>
                Open an article and tap words
                you want to remember.
              </p>

              <button
                class="primary-btn"
                data-action="library"
              >
                Read an article
              </button>
            </div>
          `
      }
    </main>
  `);
}

function renderPractice(): string {
  const question =
    practiceQuestions[
      currentPracticeIndex
    ];

  return renderShell(`
    <main class="practice-page page">
      <section class="section-heading">
        <div>
          <p class="eyebrow">PRACTICE</p>

          <h1>Practice</h1>

          <p>
            Short exercises to strengthen your English.
          </p>
        </div>

        <div class="score-pill">
          Score: ${state.practiceScore}
        </div>
      </section>

      <div class="practice-progress">
        Question
        ${currentPracticeIndex + 1}
        of
        ${practiceQuestions.length}
      </div>

      <section class="question-card">
        <h2>
          ${escapeHtml(
            question.question,
          )}
        </h2>

        <div class="answers">
          ${question.answers
            .map(
              (
                answer,
                index,
              ) => `
                <button
                  class="answer-btn"
                  data-answer-index="${index}"
                  ${
                    practiceAnswered
                      ? "disabled"
                      : ""
                  }
                >
                  <span>
                    ${String.fromCharCode(
                      65 + index,
                    )}
                  </span>

                  ${escapeHtml(
                    answer,
                  )}
                </button>
              `,
            )
            .join("")}
        </div>

        ${
          practiceAnswered
            ? `
              <div class="answer-message">
                ${
                  practiceQuestions[
                    currentPracticeIndex
                  ].correct ===
                  getLastAnswer()
                    ? "Correct! 🎉"
                    : `The correct answer is: ${escapeHtml(
                        question.answers[
                          question.correct
                        ],
                      )}`
                }
              </div>

              <button
                class="primary-btn"
                data-action="nextQuestion"
              >
                ${
                  currentPracticeIndex ===
                  practiceQuestions.length -
                    1
                    ? "Finish"
                    : "Next question"
                }
              </button>
            `
            : ""
        }
      </section>
    </main>
  `);
}

/* =========================================================
   REAL ROOMS UI
   ========================================================= */

function renderRooms(): string {
  return renderShell(`
    <main class="rooms-page page">

      <section class="section-heading">
        <div>
          <p class="eyebrow">SPEAKING</p>

          <h1>Rooms</h1>

          <p>
            Speak with another learner in real time.
          </p>
        </div>
      </section>

      <section class="rooms-connection-card">

        <div class="room-connection-status">
          <span
            class="room-status ${
              isRoomConnected
                ? "connected"
                : ""
            }"
          ></span>

          <div>
            <strong>
              ${
                isRoomConnected
                  ? "Connected"
                  : "Not connected"
              }
            </strong>

            <small>
              ${escapeHtml(
                roomStatusMessage,
              )}
            </small>
          </div>
        </div>

        <div class="room-id-box">

          <label for="roomPeerId">
            Room code
          </label>

          <input
            id="roomPeerId"
            type="text"
            placeholder="Paste your partner's Room ID"
            autocomplete="off"
          />

          <button
            class="primary-btn"
            data-action="joinRealRoom"
          >
            Join Room
          </button>

        </div>

        <div class="my-room-box">

          <span>
            Your Room ID
          </span>

          <strong id="myPeerId">
            ${
              currentRoomPeerId ||
              "Connecting..."
            }
          </strong>

          <button
            class="secondary-btn"
            data-action="copyRoomId"
          >
            Copy Room ID
          </button>

        </div>

      </section>

      <section class="room-media-card">

        <div class="room-video-grid">

          <div class="video-card">

            <span class="video-label">
              You
            </span>

            <video
              id="localVideo"
              autoplay
              playsinline
              muted
            ></video>

            <div
              class="video-empty"
              id="localVideoEmpty"
            >
              Your camera
            </div>

          </div>

          <div class="video-card">

            <span class="video-label">
              Partner
            </span>

            <video
              id="remoteVideo"
              autoplay
              playsinline
            ></video>

            <div
              class="video-empty"
              id="remoteVideoEmpty"
            >
              Waiting for partner
            </div>

          </div>

        </div>

        <div class="room-controls">

          <button
            class="primary-small-btn"
            data-action="startCamera"
          >
            🎥 Camera
          </button>

          <button
            class="primary-small-btn"
            data-action="shareScreen"
            ${
              !isRoomConnected
                ? "disabled"
                : ""
            }
          >
            🖥️ Share Screen
          </button>

          <button
            class="secondary-small-btn"
            data-action="stopScreen"
            ${
              !isScreenSharing
                ? "disabled"
                : ""
            }
          >
            Stop Sharing
          </button>

          <button
            class="danger-small-btn"
            data-action="leaveRoom"
          >
            Leave
          </button>

        </div>

        ${
          isScreenSharing
            ? `
              <div class="screen-share-active">
                🟢 Screen sharing is active.
                You can move around DRE2learn normally.
              </div>
            `
            : ""
        }

      </section>

      <section class="rooms-notice">

        <span>🗣️</span>

        <div>

          <strong>
            Real-time speaking room
          </strong>

          <p>
            Share your Room ID with another learner.
            Once connected, you can communicate and share your screen.
          </p>

        </div>

      </section>

      <section class="translate-box">

        <div>

          <span class="translate-icon">
            文
          </span>

          <div>

            <h2>
              Google Translate
            </h2>

            <p>
              Use translation while you're speaking.
            </p>

          </div>

        </div>

        <textarea
          id="translateText"
          placeholder="Type a word or sentence..."
          rows="4"
        ></textarea>

        <button
          class="primary-btn"
          data-action="translate"
        >
          Open Google Translate
        </button>

      </section>

    </main>
  `);
}

function renderGames(): string {
  return renderShell(`
    <main class="games-page page">

      <section class="section-heading">

        <div>

          <p class="eyebrow">
            PLAY & LEARN
          </p>

          <h1>
            Games
          </h1>

          <p>
            Learn English while having fun.
          </p>

        </div>

      </section>

      <section class="game-card-large">

        <div class="game-placeholder">
          🎮
        </div>

        <h2>
          Your game is coming here
        </h2>

        <p>
          The game can be connected here when it is ready.
        </p>

      </section>

    </main>
  `);
}

function renderProgress(): string {
  const completed =
    state.completedArticles.length;

  const words =
    state.vocabulary.length;

  const score =
    state.practiceScore;

  return renderShell(`
    <main class="progress-page page">

      <section class="section-heading">

        <div>

          <p class="eyebrow">
            YOUR JOURNEY
          </p>

          <h1>
            Progress
          </h1>

          <p>
            Keep going. Small steps matter.
          </p>

        </div>

      </section>

      <section class="stats-grid">

        <div class="stat-card">

          <span>📚</span>

          <strong>
            ${completed}
          </strong>

          <small>
            Articles completed
          </small>

        </div>

        <div class="stat-card">

          <span>🔖</span>

          <strong>
            ${words}
          </strong>

          <small>
            Saved words
          </small>

        </div>

        <div class="stat-card">

          <span>✓</span>

          <strong>
            ${score}
          </strong>

          <small>
            Practice points
          </small>

        </div>

      </section>

      <section class="progress-card large-progress-card">

        <div>

          <span>
            Current level
          </span>

          <strong>
            ${state.level}
          </strong>

        </div>

        <p>
          Continue reading, practicing, and speaking
          to build your skills.
        </p>

      </section>

    </main>
  `);
}

function renderProfile(): string {
  const safeName =
    escapeHtml(
      state.name || "Learner",
    );

  const safeEmail =
    escapeHtml(
      state.email || "No email",
    );

  return renderShell(`
    <main class="profile-page page">

      <section class="profile-header">

        <div class="profile-avatar">
          ${avatarSvg(150)}
        </div>

        <h1>
          ${safeName}
        </h1>

        <p>
          ${safeEmail}
        </p>

        <span class="level-pill">
          English ${state.level}
        </span>

      </section>

      <section class="profile-menu">

        <button
          data-action="vocabulary"
        >

          <span>🔖</span>

          <div>

            <strong>
              Vocabulary
            </strong>

            <small>
              ${state.vocabulary.length}
              saved words
            </small>

          </div>

          <b>›</b>

        </button>

        <button
          data-action="progress"
        >

          <span>📈</span>

          <div>

            <strong>
              Progress
            </strong>

            <small>
              See your learning activity
            </small>

          </div>

          <b>›</b>

        </button>

        <button
          data-action="avatar"
        >

          <span>🎨</span>

          <div>

            <strong>
              Edit avatar
            </strong>

            <small>
              Change your avatar
            </small>

          </div>

          <b>›</b>

        </button>

      </section>

      <button
        class="logout-btn"
        data-action="logout"
      >
        Log out
      </button>

    </main>
  `);
}

/* =========================================================
   WEBRTC / PEERJS FUNCTIONS
   ========================================================= */

function createPeer(): void {
  if (peer && !peer.destroyed) {
    return;
  }

  roomStatusMessage =
    "Connecting to room service...";

  peer = new Peer();

  peer.on("open", (id) => {
    currentRoomPeerId = id;

    roomStatusMessage =
      "Your Room ID is ready.";

    if (state.page === "rooms") {
      render();

      window.setTimeout(() => {
        attachCurrentStreamsToRoomUI();
      }, 50);
    }
  });

  peer.on("call", (incomingCall) => {
    handleIncomingCall(incomingCall);
  });

  peer.on("error", (error) => {
    console.error(
      "PeerJS error:",
      error,
    );

    roomStatusMessage =
      "Room connection error.";

    showToast(
      "Room connection failed. Try again.",
    );

    if (state.page === "rooms") {
      render();
    }
  });

  peer.on("disconnected", () => {
    roomStatusMessage =
      "Disconnected from room service.";

    if (state.page === "rooms") {
      render();
    }
  });

  peer.on("close", () => {
    currentRoomPeerId = "";
    connectedRoomPeerId = "";
    isRoomConnected = false;

    roomStatusMessage =
      "Room closed.";
  });
}

async function startCamera(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast(
      "Your browser does not support camera access.",
    );

    return;
  }

  try {
    if (localMediaStream) {
      localMediaStream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    localMediaStream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

    attachCurrentStreamsToRoomUI();

    showToast(
      "Camera and microphone are ready.",
    );

    /*
      If already connected, replace the active
      outgoing media connection with the new stream.
    */
    if (
      activeCall &&
      connectedRoomPeerId
    ) {
      const newCall = peer?.call(
        connectedRoomPeerId,
        localMediaStream,
      );

      if (newCall) {
        setupOutgoingCall(newCall);
      }
    }
  } catch (error) {
    console.error(
      "Camera error:",
      error,
    );

    showToast(
      "Camera or microphone permission was denied.",
    );
  }
}

async function joinRealRoom(
  remotePeerId: string,
): Promise<void> {
  const targetId =
    remotePeerId.trim();

  if (!targetId) {
    showToast(
      "Enter the other user's Room ID.",
    );

    return;
  }

  if (!peer) {
    createPeer();

    /*
      Wait briefly for PeerJS to initialize.
    */
    await new Promise<void>(
      (resolve) => {
        let finished = false;

        const finish = () => {
          if (finished) return;

          finished = true;
          resolve();
        };

        const timeout =
          window.setTimeout(
            finish,
            1800,
          );

        if (peer) {
          peer.once(
            "open",
            () => {
              window.clearTimeout(
                timeout,
              );

              finish();
            },
          );
        }
      },
    );
  }

  if (!peer || peer.destroyed) {
    showToast(
      "Room service is not ready.",
    );

    return;
  }

  try {
    if (!localMediaStream) {
      localMediaStream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: true,
            audio: true,
          },
        );
    }

    connectedRoomPeerId =
      targetId;

    roomStatusMessage =
      "Connecting to your partner...";

    if (state.page === "rooms") {
      render();

      window.setTimeout(() => {
        attachCurrentStreamsToRoomUI();
      }, 50);
    }

    const call = peer.call(
      targetId,
      localMediaStream,
    );

    if (!call) {
      throw new Error(
        "Unable to create media call.",
      );
    }

    setupOutgoingCall(call);
  } catch (error) {
    console.error(
      "Join room error:",
      error,
    );

    roomStatusMessage =
      "Could not connect.";

    showToast(
      "Could not join this room.",
    );

    render();
  }
}

function setupOutgoingCall(
  call: MediaConnection,
): void {
  activeCall = call;

  call.on("stream", (stream) => {
    remoteStream = stream;

    isRoomConnected = true;

    roomStatusMessage =
      "Connected to your partner.";

    attachCurrentStreamsToRoomUI();
  });

  call.on("close", () => {
    if (activeCall === call) {
      activeCall = null;
    }

    remoteStream = null;
    isRoomConnected = false;

    roomStatusMessage =
      "Your partner left the room.";

    if (state.page === "rooms") {
      render();
    }
  });

  call.on("error", (error) => {
    console.error(
      "Media call error:",
      error,
    );

    roomStatusMessage =
      "Media connection error.";

    showToast(
      "The media connection failed.",
    );
  });
}

async function handleIncomingCall(
  incomingCall: MediaConnection,
): Promise<void> {
  try {
    if (!localMediaStream) {
      localMediaStream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: true,
            audio: true,
          },
        );
    }

    activeCall = incomingCall;

    connectedRoomPeerId =
      incomingCall.peer;

    incomingCall.answer(
      localMediaStream,
    );

    incomingCall.on(
      "stream",
      (stream) => {
        remoteStream = stream;

        isRoomConnected = true;

        roomStatusMessage =
          "Connected to your partner.";

        if (state.page === "rooms") {
          render();

          window.setTimeout(() => {
            attachCurrentStreamsToRoomUI();
          }, 50);
        }
      },
    );

    incomingCall.on("close", () => {
      activeCall = null;
      remoteStream = null;
      isRoomConnected = false;

      roomStatusMessage =
        "Your partner left the room.";

      if (state.page === "rooms") {
        render();
      }
    });

    showToast(
      "Incoming room connection accepted.",
    );
  } catch (error) {
    console.error(
      "Incoming call error:",
      error,
    );

    incomingCall.close();

    showToast(
      "Could not accept the room connection.",
    );
  }
}

async function shareScreen(): Promise<void> {
  if (!isRoomConnected) {
    showToast(
      "Join a room first.",
    );

    return;
  }

  if (!navigator.mediaDevices?.getDisplayMedia) {
    showToast(
      "Screen sharing is not supported by this browser.",
    );

    return;
  }

  try {
    screenStream =
      await navigator.mediaDevices.getDisplayMedia(
        {
          video: true,
          audio: false,
        },
      );

    const screenTrack =
      screenStream.getVideoTracks()[0];

    if (!screenTrack) {
      throw new Error(
        "No screen track was created.",
      );
    }

    isScreenSharing = true;

    /*
      The screen is sent as the video track
      through a new WebRTC media call.
    */
    if (
      peer &&
      connectedRoomPeerId
    ) {
      const screenOnlyStream =
        new MediaStream([
          screenTrack,
        ]);

      const screenCall =
        peer.call(
          connectedRoomPeerId,
          screenOnlyStream,
          {
            metadata: {
              type: "screen-share",
            },
          },
        );

      if (screenCall) {
        screenCall.on(
          "stream",
          () => {
            /*
              Screen share is one-way.
            */
          },
        );

        screenCall.on(
          "close",
          () => {
            if (screenStream) {
              screenStream
                .getTracks()
                .forEach(
                  (track) =>
                    track.stop(),
                );

              screenStream = null;
            }

            isScreenSharing = false;
          },
        );
      }
    }

    /*
      The browser tells us when the user clicks
      "Stop sharing" in the browser's own UI.
    */
    screenTrack.addEventListener(
      "ended",
      () => {
        stopScreenSharing(false);
      },
    );

    /*
      Show the shared screen locally as well.
    */
    attachScreenPreview();

    if (state.page === "rooms") {
      render();

      window.setTimeout(() => {
        attachCurrentStreamsToRoomUI();
        attachScreenPreview();
      }, 50);
    }

    showToast(
      "Screen sharing started.",
    );
  } catch (error) {
    console.error(
      "Screen share error:",
      error,
    );

    isScreenSharing = false;
    screenStream = null;

    showToast(
      "Screen sharing was cancelled or blocked.",
    );
  }
}

function stopScreenSharing(
  showMessage = true,
): void {
  if (screenStream) {
    screenStream
      .getTracks()
      .forEach((track) => {
        track.stop();
      });

    screenStream = null;
  }

  isScreenSharing = false;

  if (showMessage) {
    showToast(
      "Screen sharing stopped.",
    );
  }

  if (state.page === "rooms") {
    render();

    window.setTimeout(() => {
      attachCurrentStreamsToRoomUI();
    }, 50);
  }
}

function leaveRoom(): void {
  if (activeCall) {
    activeCall.close();
    activeCall = null;
  }

  if (localMediaStream) {
    localMediaStream
      .getTracks()
      .forEach((track) => {
        track.stop();
      });

    localMediaStream = null;
  }

  if (screenStream) {
    screenStream
      .getTracks()
      .forEach((track) => {
        track.stop();
      });

    screenStream = null;
  }

  remoteStream = null;

  connectedRoomPeerId = "";
  isRoomConnected = false;
  isScreenSharing = false;

  roomStatusMessage =
    "You left the room.";

  showToast(
    "You left the room.",
  );

  render();
}

function attachCurrentStreamsToRoomUI(): void {
  const localVideo =
    document.querySelector<HTMLVideoElement>(
      "#localVideo",
    );

  const remoteVideo =
    document.querySelector<HTMLVideoElement>(
      "#remoteVideo",
    );

  const localEmpty =
    document.querySelector<HTMLElement>(
      "#localVideoEmpty",
    );

  const remoteEmpty =
    document.querySelector<HTMLElement>(
      "#remoteVideoEmpty",
    );

  if (
    localVideo &&
    localMediaStream
  ) {
    localVideo.srcObject =
      localMediaStream;

    localVideo.style.display =
      "block";

    if (localEmpty) {
      localEmpty.style.display =
        "none";
    }
  }

  if (
    remoteVideo &&
    remoteStream
  ) {
    remoteVideo.srcObject =
      remoteStream;

    remoteVideo.style.display =
      "block";

    if (remoteEmpty) {
      remoteEmpty.style.display =
        "none";
    }
  }
}

function attachScreenPreview(): void {
  const existing =
    document.querySelector<HTMLVideoElement>(
      "#screenPreview",
    );

  if (!screenStream) {
    existing?.remove();

    return;
  }

  if (existing) {
    existing.srcObject =
      screenStream;

    return;
  }

  const roomCard =
    document.querySelector(
      ".room-media-card",
    );

  if (!roomCard) return;

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "screen-preview-card";

  wrapper.innerHTML = `
    <div class="video-label">
      Your shared screen
    </div>

    <video
      id="screenPreview"
      autoplay
      playsinline
      muted
    ></video>
  `;

  roomCard.appendChild(wrapper);

  const video =
    wrapper.querySelector<HTMLVideoElement>(
      "#screenPreview",
    );

  if (video) {
    video.srcObject =
      screenStream;
  }
}

function copyRoomId(): void {
  if (!currentRoomPeerId) {
    showToast(
      "Your Room ID is not ready yet.",
    );

    return;
  }

  navigator.clipboard
    ?.writeText(currentRoomPeerId)
    .then(() => {
      showToast(
        "Room ID copied.",
      );
    })
    .catch(() => {
      showToast(
        "Copy failed. Copy the Room ID manually.",
      );
    });
}

function openGoogleTranslate(
  text: string,
): void {
  const encoded =
    encodeURIComponent(
      text.trim(),
    );

  const url = encoded
    ? `https://translate.google.com/?sl=en&tl=ar&text=${encoded}&op=translate`
    : "https://translate.google.com/";

  window.open(
    url,
    "_blank",
    "noopener,noreferrer",
  );
}

/* =========================================================
   ACTIONS
   ========================================================= */

function handleAction(
  action: string,
  element: HTMLElement,
): void {
  switch (action) {
    case "start":
      navigate("auth");
      break;

    case "welcome":
      navigate("welcome");
      break;

    case "auth":
      navigate("auth");
      break;

    case "signup":
      navigate("signup");
      break;

    case "login":
      navigate("login");
      break;

    case "home":
      navigate("home");
      break;

    case "library":
      navigate("library");
      break;

    case "vocabulary":
      navigate("vocabulary");
      break;

    case "practice":
      navigate("practice");
      break;

    case "rooms":
      createPeer();
      navigate("rooms");
      break;

    case "games":
      navigate("games");
      break;

    case "progress":
      navigate("progress");
      break;

    case "profile":
      navigate("profile");
      break;

    case "avatar":
      navigate("avatar");
      break;

    case "saveAvatar":
      saveState();
      navigate("home");
      break;

    case "completeArticle": {
      const articleId =
        element.dataset.articleId;

      if (!articleId) return;

      if (
        !state.completedArticles.includes(
          articleId,
        )
      ) {
        state.completedArticles.push(
          articleId,
        );

        saveState();

        showToast(
          "Article completed ✓",
        );
      }

      render();
      break;
    }

    case "clearVocabulary":
      state.vocabulary = [];

      saveState();

      showToast(
        "Vocabulary cleared",
      );

      render();
      break;

    case "nextQuestion":
      if (
        currentPracticeIndex ===
        practiceQuestions.length - 1
      ) {
        currentPracticeIndex = 0;
        practiceAnswered = false;
        lastAnswer = -1;

        showToast(
          "Practice complete! 🎉",
        );

        render();
      } else {
        currentPracticeIndex += 1;
        practiceAnswered = false;
        lastAnswer = -1;

        render();
      }

      break;

    case "joinRoom": {
      createPeer();
      navigate("rooms");
      break;
    }

    case "joinRealRoom": {
      const input =
        document.querySelector<HTMLInputElement>(
          "#roomPeerId",
        );

      const remoteId =
        input?.value || "";

      void joinRealRoom(
        remoteId,
      );

      break;
    }

    case "startCamera":
      void startCamera();
      break;

    case "shareScreen":
      void shareScreen();
      break;

    case "stopScreen":
      stopScreenSharing();
      break;

    case "leaveRoom":
      leaveRoom();
      break;

    case "copyRoomId":
      copyRoomId();
      break;

    case "translate": {
      const textarea =
        document.querySelector<HTMLTextAreaElement>(
          "#translateText",
        );

      openGoogleTranslate(
        textarea?.value || "",
      );

      break;
    }

    case "logout":
      leaveRoom();

      state.name = "";
      state.email = "";
      state.vocabulary = [];
      state.completedArticles = [];
      state.practiceScore = 0;

      localStorage.removeItem(
        STORAGE_KEY,
      );

      navigate("welcome");

      break;
  }
}

/* =========================================================
   RENDER
   ========================================================= */

function render(): void {
  switch (state.page) {
    case "welcome":
      app.innerHTML =
        renderWelcome();
      break;

    case "auth":
      app.innerHTML =
        renderAuth();
      break;

    case "signup":
      app.innerHTML =
        renderSignup();
      break;

    case "login":
      app.innerHTML =
        renderLogin();
      break;

    case "avatar":
      app.innerHTML =
        renderAvatar();
      break;

    case "home":
      app.innerHTML =
        renderHome();
      break;

    case "library":
      app.innerHTML =
        renderLibrary();
      break;

    case "article":
      app.innerHTML =
        renderArticle();
      break;

    case "vocabulary":
      app.innerHTML =
        renderVocabulary();
      break;

    case "practice":
      app.innerHTML =
        renderPractice();
      break;

    case "rooms":
      app.innerHTML =
        renderRooms();
      break;

    case "games":
      app.innerHTML =
        renderGames();
      break;

    case "progress":
      app.innerHTML =
        renderProgress();
      break;

    case "profile":
      app.innerHTML =
        renderProfile();
      break;
  }

  bindEvents();
}

/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents(): void {
  document
    .querySelectorAll<HTMLElement>(
      "[data-action]",
    )
    .forEach((element) => {
      element.addEventListener(
        "click",
        () => {
          const action =
            element.dataset.action;

          if (!action) return;

          handleAction(
            action,
            element,
          );
        },
      );
    });

  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-avatar-key]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const key =
            button.dataset.avatarKey as keyof Avatar;

          const color =
            button.dataset.avatarColor;

          if (!key || !color) return;

          state.avatar[key] =
            color;

          render();
        },
      );
    });

  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-level]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const level =
            button.dataset.level;

          if (
            level === "ALL" ||
            isLevel(level)
          ) {
            state.selectedLibraryLevel =
              level;

            render();
          }
        },
      );
    });

  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-topic]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          state.selectedTopic =
            button.dataset.topic ||
            "ALL";

          render();
        },
      );
    });

  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-article-id]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const articleId =
            button.dataset.articleId;

          if (!articleId) return;

          state.currentArticleId =
            articleId;

          state.page =
            "article";

          render();
        },
      );
    });

  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-word]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const word =
            button.dataset.word;

          if (!word) return;

          if (
            !state.vocabulary.includes(
              word,
            )
          ) {
            state.vocabulary.push(
              word,
            );

            saveState();

            showToast(
              `"${word}" saved to Vocabulary`,
            );
          } else {
            showToast(
              `"${word}" is already saved`,
            );
          }

          render();
        },
      );
    });

  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-remove-word]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const word =
            button.dataset.removeWord;

          if (!word) return;

          state.vocabulary =
            state.vocabulary.filter(
              (item) =>
                item !== word,
            );

          saveState();

          render();
        },
      );
    });

  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-answer-index]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          if (practiceAnswered)
            return;

          const answerIndex =
            Number(
              button.dataset
                .answerIndex,
            );

          if (
            Number.isNaN(
              answerIndex,
            )
          ) {
            return;
          }

          lastAnswer =
            answerIndex;

          practiceAnswered =
            true;

          if (
            answerIndex ===
            practiceQuestions[
              currentPracticeIndex
            ].correct
          ) {
            state.practiceScore +=
              1;

            saveState();
          }

          render();
        },
      );
    });

  const signupForm =
    document.querySelector<HTMLFormElement>(
      "#signupForm",
    );

  signupForm?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const formData =
        new FormData(
          signupForm,
        );

      const name =
        String(
          formData.get(
            "name",
          ) || "",
        ).trim();

      const email =
        String(
          formData.get(
            "email",
          ) || "",
        ).trim();

      const levelValue =
        String(
          formData.get(
            "level",
          ) || "B1",
        );

      if (
        !name ||
        !email ||
        !isLevel(
          levelValue,
        )
      ) {
        showToast(
          "Please complete the form.",
        );

        return;
      }

      state.name =
        name;

      state.email =
        email;

      state.level =
        levelValue;

      saveState();

      navigate(
        "avatar",
      );
    },
  );

  const loginForm =
    document.querySelector<HTMLFormElement>(
      "#loginForm",
    );

  loginForm?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const formData =
        new FormData(
          loginForm,
        );

      const email =
        String(
          formData.get(
            "email",
          ) || "",
        ).trim();

      if (!email) {
        showToast(
          "Please enter your email.",
        );

        return;
      }

      state.email =
        email;

      if (!state.name) {
        state.name =
          email.split(
            "@",
          )[0] ||
          "Learner";
      }

      saveState();

      navigate(
        "home",
      );
    },
  );
}

loadState();
render();