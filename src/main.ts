// src/main.ts

import "./style.css";

import type {
  AppState,
  Avatar,
  IdentityCard,
  Level,
  LevelTestAnswer,
  LevelTestQuestion,
  Page,
  UserProfile,
} from "./types";

import {
  createDefaultState,
  defaultAvatar,
} from "./state";

import {
  addXP,
  addVocabularyWord,
  clearStoredState,
  collectCardWithXP,
  createSafeState,
  getLevelFromXp,
  getLevelProgress,
  getProgressStats,
  loadStoredState,
  markArticleCompleted,
  markPracticeCompleted,
  markRoomJoined,
  persist,
  saveState,
} from "./storage";

import { sidebarMarkup } from "./sidebar";
import { logoMarkup } from "./logo";
import { avatarMarkup } from "./avatar";
import { welcomeMarkup } from "./welcome";
import { signupMarkup } from "./signup";
import { loginMarkup } from "./login";
import { libraryMarkup } from "./library";
import { progressMarkup } from "./progress";
import { levelTestMarkup } from "./levelTest";
import { roomsMarkup } from "./rooms";
import { messagesMarkup } from "./messages";
import { profileMarkup } from "./profile";
import { vocabularyMarkup } from "./vocabulary";
import { practiceMarkup } from "./practice";
import { gamesMarkup } from "./games";

import {
  levelTestQuestions,
  getNextAdaptiveQuestion,
  createAdaptiveState,
  recordAdaptiveAnswer,
  shouldFinishTest,
  calculateLevelTestResult,
} from "./data/levelTest";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container not found");
}

let state: AppState = loadStoredState() ?? createDefaultState();

if (!state.isAuthenticated || !state.user) {
  state.page = "login";
}

type OnboardingStep = "questions" | "avatar";

let onboardingStep: OnboardingStep = "questions";

const COUNTRY_OPTIONS = [
  ["IQ", "Iraq 🇮🇶"],
  ["US", "United States 🇺🇸"],
  ["GB", "United Kingdom 🇬🇧"],
  ["CA", "Canada 🇨🇦"],
  ["AU", "Australia 🇦🇺"],
  ["TR", "Türkiye 🇹🇷"],
  ["CN", "China 🇨🇳"],
  ["RU", "Russia 🇷🇺"],
  ["DE", "Germany 🇩🇪"],
  ["FR", "France 🇫🇷"],
  ["AE", "United Arab Emirates 🇦🇪"],
  ["SA", "Saudi Arabia 🇸🇦"],
] as const;

let selectedAvatar: Avatar = { ...defaultAvatar };

let levelTestIndex = 0;
let levelTestAnswers: LevelTestAnswer[] = [];

const adaptiveState = createAdaptiveState();

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCountryFlag(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();

  if (code.length !== 2) {
    return "🌍";
  }

  return code
    .split("")
    .map(char =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    )
    .join("");
}

function getCountryName(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();

  const found = COUNTRY_OPTIONS.find(
    ([country]) => country === code,
  );

  if (!found) {
    return code || "Unknown";
  }

  return found[1].replace(/\s*[\u{1F1E6}-\u{1F1FF}]{2}\s*$/u, "").trim();
}

function makeUsername(name: string): string {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 16) || "learner";

  return `${base}${Date.now().toString().slice(-4)}`;
}

function persistState(): void {
  state = createSafeState(state);
  saveState(state);
}

function navigate(page: Page): void {
  state.page = page;
  state.currentPage = page;

  persistState();
  render();
}

function issueIdentityCardAfterLevelTest(): void {
  if (!state.user) {
    return;
  }

  const issuedAt = new Date();

  const expiresAt = new Date(issuedAt);
  expiresAt.setDate(expiresAt.getDate() + 30);

  const countryCode =
    state.user.countryCode.trim().toUpperCase() || "IQ";

  const card: IdentityCard = {
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    countryCode,
    countryName: getCountryName(countryCode),
    countryFlag: getCountryFlag(countryCode),
    countryMapCode: countryCode,
  };

  state.user.identityCard = card;
  state.user.identityCardIssuedAt = card.issuedAt;
  state.user.identityCardExpiresAt = card.expiresAt;
  state.user.updatedAt = new Date().toISOString();
}

function handleLogout(): void {
  clearStoredState();

  state = createDefaultState();

  onboardingStep = "questions";
  selectedAvatar = { ...defaultAvatar };
  levelTestIndex = 0;
  levelTestAnswers = [];

  navigate("login");
}

function handleSignup(): void {
  const nameInput =
    document.querySelector<HTMLInputElement>("#signup-name");

  const emailInput =
    document.querySelector<HTMLInputElement>("#signup-email");

  const passwordInput =
    document.querySelector<HTMLInputElement>("#signup-password");

  if (!nameInput || !emailInput || !passwordInput) {
    return;
  }

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!name || !email || !password) {
    alert("Please complete all fields.");
    return;
  }

  const now = new Date().toISOString();

  const user: UserProfile = {
    id: `user-${Date.now()}`,
    name,
    username: makeUsername(name),
    displayName: name,
    email,
    countryCode: "IQ",
    bio: "",
    avatar: {
      ...defaultAvatar,
      gender: "girl",
      hijab: false,
    },
    xp: 0,
    level: "A1",
    isVip: false,
    identityCard: null,
    levelTestCompleted: false,
    levelTestResult: null,
    createdAt: now,
    joinedAt: now,
    updatedAt: now,
  };

  state = {
    ...state,
    user,
    isAuthenticated: true,
    page: "avatar",
    currentPage: "avatar",
    totalXp: 0,
  };

  selectedAvatar = { ...user.avatar };
  onboardingStep = "questions";

  persistState();
  render();
}

function handleLogin(): void {
  const emailInput =
    document.querySelector<HTMLInputElement>("#login-email");

  const passwordInput =
    document.querySelector<HTMLInputElement>("#login-password");

  if (!emailInput || !passwordInput) {
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  const now = new Date().toISOString();

  const existingUser =
    state.user?.email?.toLowerCase() === email.toLowerCase()
      ? state.user
      : null;

  if (existingUser) {
    state.user = {
      ...existingUser,
      updatedAt: now,
    };

    state.isAuthenticated = true;

    if (existingUser.levelTestCompleted) {
      navigate("home");
    } else {
      navigate("avatar");
    }

    return;
  }

  const user: UserProfile = {
    id: `user-${Date.now()}`,
    name: email.split("@")[0],
    username: makeUsername(email.split("@")[0]),
    displayName: email.split("@")[0],
    email,
    countryCode: "IQ",
    bio: "",
    avatar: {
      ...defaultAvatar,
      gender: "girl",
      hijab: false,
    },
    xp: 0,
    level: "A1",
    isVip: false,
    identityCard: null,
    levelTestCompleted: false,
    levelTestResult: null,
    createdAt: now,
    joinedAt: now,
    updatedAt: now,
  };

  state = {
    ...state,
    user,
    isAuthenticated: true,
    totalXp: 0,
    page: "avatar",
    currentPage: "avatar",
  };

  selectedAvatar = { ...user.avatar };
  onboardingStep = "questions";

  persistState();
  render();
}

function saveAvatar(): void {
  if (!state.user) {
    return;
  }

  state.user.avatar = {
    ...selectedAvatar,
  };

  state.user.updatedAt = new Date().toISOString();

  onboardingStep = "questions";

  persistState();

  navigate("levelTest");
}

function submitTestAnswer(
  question: LevelTestQuestion,
  answer: string,
): void {
  const correct =
    question.correctAnswer !== undefined &&
    answer.trim().toLowerCase() ===
      question.correctAnswer.trim().toLowerCase();

  const answerRecord: LevelTestAnswer = {
    questionId: question.id,
    answer,
    isCorrect: correct,
    correct,
    level: question.level,
    points: correct ? question.points : 0,
  };

  levelTestAnswers.push(answerRecord);

  recordAdaptiveAnswer(
    adaptiveState,
    question,
    answer,
  );

  const finish =
    shouldFinishTest(adaptiveState) ||
    adaptiveState.answeredQuestionIds.length >= 50;

  if (finish) {
    const result =
      calculateLevelTestResult(adaptiveState);

    const skillValues =
      Object.values(result.skillScores);

    const score = skillValues.reduce(
      (sum, item) => sum + item.correct,
      0,
    );

    const total = skillValues.reduce(
      (sum, item) => sum + item.total,
      0,
    );

    if (state.user) {
      state.user.level = result.overallLevel;
      state.user.levelTestCompleted = true;
      state.user.levelTestResult = result;
      state.user.updatedAt = new Date().toISOString();
    }

    state.levelTestAnswers = [...levelTestAnswers];
    state.levelTestResult = result;
    state.levelTestScore = score;
    state.levelTestTotal = total;

    state = addXP(state, 50);

    issueIdentityCardAfterLevelTest();

    persistState();

    navigate("home");

    return;
  }

  levelTestIndex += 1;

  render();
}

function renderAvatar(): string {
  if (!state.user) {
    return "";
  }

  if (onboardingStep === "questions") {
    return `
      <main class="onboarding-page">
        <section class="onboarding-card">
          <div class="onboarding-header">
            <div class="onboarding-logo">
              ${logoMarkup()}
            </div>

            <h1>Let’s get to know you</h1>

            <p>
              A few questions before we build your learning profile.
            </p>
          </div>

          <div class="onboarding-question">
            <label for="onboarding-gender">
              Gender
            </label>

            <select id="onboarding-gender">
              <option value="girl"
                ${selectedAvatar.gender === "girl" ? "selected" : ""}>
                Girl
              </option>

              <option value="boy"
                ${selectedAvatar.gender === "boy" ? "selected" : ""}>
                Boy
              </option>
            </select>
          </div>

          <div class="onboarding-question">
            <label for="onboarding-country">
              Country
            </label>

            <select id="onboarding-country">
              ${COUNTRY_OPTIONS.map(([code, label]) => `
                <option
                  value="${escapeHtml(code)}"
                  ${state.user?.countryCode === code ? "selected" : ""}
                >
                  ${escapeHtml(label)}
                </option>
              `).join("")}
            </select>
          </div>

          <button
            class="primary-button"
            id="continue-onboarding"
            type="button"
          >
            Continue
          </button>
        </section>
      </main>
    `;
  }

  return `
    <main class="onboarding-page">
      <section class="onboarding-card avatar-editor-card">

        <div class="onboarding-header">
          <h1>Create your avatar</h1>
          <p>
            Choose the look that represents you.
          </p>
        </div>

        <div class="avatar-preview-large">
          ${avatarMarkup(selectedAvatar)}
        </div>

        <div class="avatar-controls">

          <label>
            Skin tone
            <select id="avatar-skin">
              <option value="light">Light</option>
              <option value="fair">Fair</option>
              <option value="medium">Medium</option>
              <option value="tan">Tan</option>
              <option value="deep">Deep</option>
            </select>
          </label>

          <label>
            Eyes
            <select id="avatar-eyes">
              <option value="brown">Brown</option>
              <option value="darkBrown">Dark Brown</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="hazel">Hazel</option>
              <option value="gray">Gray</option>
            </select>
          </label>

          <label>
            Hairstyle
            <select id="avatar-hair-style">
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
              <option value="curly">Curly</option>
              <option value="wavy">Wavy</option>
              <option value="ponytail">Ponytail</option>
              <option value="hijab">Hijab</option>
            </select>
          </label>

          <label>
            Hair color
            <select id="avatar-hair-color">
              <option value="black">Black</option>
              <option value="darkBrown">Dark Brown</option>
              <option value="brown">Brown</option>
              <option value="lightBrown">Light Brown</option>
              <option value="blonde">Blonde</option>
              <option value="red">Red</option>
              <option value="gray">Gray</option>
            </select>
          </label>

          <label>
            Shirt color
            <select id="avatar-shirt">
              <option value="orange">Orange</option>
              <option value="peach">Peach</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="pink">Pink</option>
              <option value="yellow">Yellow</option>
              <option value="black">Black</option>
              <option value="white">White</option>
            </select>
          </label>

        </div>

        <button
          class="primary-button"
          id="save-avatar"
          type="button"
        >
          Continue to Level Test
        </button>

      </section>
    </main>
  `;
}
function renderLevelTest(): string {
  const question =
    levelTestQuestions[levelTestIndex];

  if (!question) {
    return shell(`
      <div class="empty-state">
        <h2>Level test complete</h2>

        <button
          class="primary-btn small"
          data-action="home"
        >
          Continue
        </button>
      </div>
    `);
  }

  const progress =
    Math.min(
      100,
      Math.round(
        (adaptiveState.answeredQuestionIds.length / 50) * 100,
      ),
    );

  return shell(`
    ${pageHeader(
      "Assessment",
      "Level Test",
      "Progressive assessment from A1 to C2. Maximum 50 questions.",
    )}

    <div class="test-card">

      <div class="test-top">
        <span>
          Question ${adaptiveState.answeredQuestionIds.length + 1} / 50
        </span>

        <span>
          ${question.level}
        </span>
      </div>

      <div class="progress-track">
        <div
          class="progress-fill"
          style="width:${progress}%"
        ></div>
      </div>

      <div class="test-skill">
        ${esc(question.skill)}
      </div>

      ${
        question.passage
          ? `
            <div class="test-passage">
              ${esc(question.passage)}
            </div>
          `
          : ""
      }

      <h2 class="test-question">
        ${esc(question.question)}
      </h2>

      ${
        question.type === "writing"
          ? `
            <textarea
              id="levelTestAnswer"
              class="text-area"
              rows="7"
              placeholder="${esc(
                question.writingPrompt ??
                  "Write your answer here...",
              )}"
            ></textarea>

            <button
              type="button"
              class="primary-btn"
              data-level-test-submit
            >
              Submit answer
            </button>
          `
          : `
            <div class="test-options">
              ${(question.options ?? [])
                .map(
                  option => `
                    <button
                      type="button"
                      class="test-option"
                      data-level-test-option="${esc(option)}"
                    >
                      <span class="test-option-letter">
                        ${String.fromCharCode(
                          65 +
                            (question.options ?? []).indexOf(
                              option,
                            ),
                        )}
                      </span>

                      <span>
                        ${esc(option)}
                      </span>
                    </button>
                  `,
                )
                .join("")}
            </div>
          `
      }

    </div>
  `);
}

function renderHome(): string {
  const user = currentUser();

  if (!user) {
    return renderWelcomeScreen();
  }

  const stats = getProgressStats(state);

  const currentLevel =
    getLevelFromXp(state.totalXp);

  const levelProgress =
    getLevelProgress(state.totalXp);

  return shell(`
    ${pageHeader(
      "Home",
      `Welcome back, ${esc(user.displayName || user.name)} 👋`,
      "Learn languages, practice with others, and grow with a safe community.",
    )}

    <section class="home-grid">

      <div class="home-card hero-home-card">
        <div>
          <span class="eyebrow">
            YOUR LEVEL
          </span>

          <h2>
            ${currentLevel}
          </h2>

          <p>
            Keep learning and build your progress every day.
          </p>
        </div>

        <div class="level-circle">
          ${currentLevel}
        </div>
      </div>

      <div class="home-card xp-card">
        <span class="eyebrow">
          TOTAL XP
        </span>

        <strong>
          ${state.totalXp}
        </strong>

        <span>
          XP
        </span>
      </div>

      <div class="home-card streak-card">
        <span class="eyebrow">
          STREAK
        </span>

        <strong>
          ${stats.currentStreak}
        </strong>

        <span>
          days 🔥
        </span>
      </div>

    </section>

    <section class="home-section">

      <div class="section-heading">
        <div>
          <span class="eyebrow">
            TODAY
          </span>

          <h2>
            Your daily progress
          </h2>
        </div>

        <span class="daily-xp">
          ${state.progress.dailyXp} /
          ${state.progress.dailyGoal} XP
        </span>
      </div>

      <div class="progress-track large">
        <div
          class="progress-fill"
          style="width:${Math.min(
            100,
            Math.round(
              (state.progress.dailyXp /
                Math.max(
                  1,
                  state.progress.dailyGoal,
                )) *
                100,
            ),
          )}%"
        ></div>
      </div>

    </section>

    <section class="quick-actions">

      <button
        type="button"
        class="quick-action-card"
        data-page="rooms"
      >
        <span class="quick-action-icon">◉</span>
        <strong>Join a Room</strong>
        <span>Practice with other learners.</span>
      </button>

      <button
        type="button"
        class="quick-action-card"
        data-page="library"
      >
        <span class="quick-action-icon">▤</span>
        <strong>Read an Article</strong>
        <span>Improve your reading skills.</span>
      </button>

      <button
        type="button"
        class="quick-action-card"
        data-page="practice"
      >
        <span class="quick-action-icon">✓</span>
        <strong>Practice</strong>
        <span>Train your grammar and vocabulary.</span>
      </button>

      <button
        type="button"
        class="quick-action-card"
        data-page="games"
      >
        <span class="quick-action-icon">♟</span>
        <strong>Play a Game</strong>
        <span>Learn while having fun.</span>
      </button>

    </section>

    <section class="home-section">

      <div class="section-heading">
        <div>
          <span class="eyebrow">
            PROGRESS
          </span>

          <h2>
            Keep going
          </h2>
        </div>

        <button
          type="button"
          class="text-button"
          data-page="progress"
        >
          View progress
        </button>
      </div>

      <div class="stats-grid">

        <div class="stat-card">
          <strong>${stats.articlesRead}</strong>
          <span>Articles read</span>
        </div>

        <div class="stat-card">
          <strong>${stats.vocabularyLearned}</strong>
          <span>Words learned</span>
        </div>

        <div class="stat-card">
          <strong>${stats.practiceCompleted}</strong>
          <span>Practice completed</span>
        </div>

        <div class="stat-card">
          <strong>${stats.roomsJoined}</strong>
          <span>Rooms joined</span>
        </div>

      </div>

    </section>
  `);
}

function renderLibrary(): string {
  const levels: Array<Level | "ALL"> = [
    "ALL",
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
  ];

  return shell(`
    ${pageHeader(
      "Library",
      "Learn through reading",
      "Choose a level and explore articles written for language learners.",
    )}

    <div class="filter-row">

      ${levels
        .map(
          level => `
            <button
              type="button"
              class="filter-chip ${
                state.selectedLibraryLevel === level
                  ? "active"
                  : ""
              }"
              data-library-level="${level}"
            >
              ${level}
            </button>
          `,
        )
        .join("")}

    </div>

    <div class="topic-row">

      ${LIBRARY_TOPICS.map(
        topic => `
          <button
            type="button"
            class="filter-chip ${
              state.selectedTopic === topic
                ? "active"
                : ""
            }"
            data-library-topic="${esc(topic)}"
          >
            ${esc(topic)}
          </button>
        `,
      ).join("")}

    </div>

    <div class="article-grid">

      ${getVisibleArticles()
        .map(
          article => `
            <article class="article-card">

              <div class="article-card-top">
                <span class="level-badge">
                  ${article.level}
                </span>

                <span class="article-time">
                  ${article.readingTime} min
                </span>
              </div>

              <h3>
                ${esc(article.title)}
              </h3>

              <p>
                ${esc(article.description ?? "")}
              </p>

              <div class="article-card-bottom">

                <span>
                  ${esc(article.topic)}
                </span>

                <button
                  type="button"
                  class="primary-btn small"
                  data-article-id="${esc(article.id)}"
                >
                  Read
                </button>

              </div>

            </article>
          `,
        )
        .join("")}

    </div>

    <div class="external-tools">

      <a
        href="https://www.oxfordlearnersdictionaries.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="tool-link"
      >
        Oxford Learner's Dictionaries
      </a>

      <a
        href="https://translate.google.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="tool-link"
      >
        Google Translate
      </a>

    </div>
  `);
}

function renderArticle(): string {
  const article =
    getCurrentArticle();

  if (!article) {
    return shell(`
      <div class="empty-state">
        <h2>Article not found</h2>

        <button
          type="button"
          class="primary-btn"
          data-page="library"
        >
          Back to Library
        </button>
      </div>
    `);
  }

  const completed =
    state.completedArticles.includes(
      article.id,
    );

  return shell(`
    ${pageHeader(
      article.level,
      esc(article.title),
      esc(article.topic),
    )}

    <article class="reading-page">

      <div class="reading-meta">
        <span>
          ${article.readingTime} min read
        </span>

        <span>
          ${article.level}
        </span>

        ${
          completed
            ? `<span class="completed-label">✓ Completed</span>`
            : ""
        }
      </div>

      <div class="reading-content">
        ${formatArticleContent(article.content)}
      </div>

      <section class="reading-vocabulary">

        <div class="section-heading">
          <div>
            <span class="eyebrow">
              VOCABULARY
            </span>

            <h2>
              Useful words
            </h2>
          </div>
        </div>

        <div class="vocabulary-preview">

          ${article.vocabulary
            .map(
              word => `
                <div class="mini-word-card">

                  <strong>
                    ${esc(word.word)}
                  </strong>

                  <span>
                    ${esc(word.meaning)}
                  </span>

                  ${
                    word.example
                      ? `<small>${esc(
                          word.example,
                        )}</small>`
                      : ""
                  }

                  <button
                    type="button"
                    class="text-button"
                    data-save-word="${esc(word.word)}"
                  >
                    Save
                  </button>

                </div>
              `,
            )
            .join("")}

        </div>

      </section>

      <div class="reading-actions">

        ${
          !completed
            ? `
              <button
                type="button"
                class="primary-btn"
                data-complete-article="${esc(article.id)}"
              >
                Complete article +10 XP
              </button>
            `
            : ""
        }

        <button
          type="button"
          class="secondary-btn"
          data-page="library"
        >
          Back to Library
        </button>

      </div>

    </article>
  `);
}

function renderVocabulary(): string {
  const words =
    state.vocabulary ?? [];

  return shell(`
    ${pageHeader(
      "Vocabulary",
      "Your saved words",
      "Review vocabulary you have collected from your learning sessions.",
    )}

    ${
      words.length === 0
        ? `
          <div class="empty-state">
            <div class="empty-icon">A</div>

            <h2>
              No saved words yet
            </h2>

            <p>
              Save useful words while reading articles.
            </p>

            <button
              type="button"
              class="primary-btn"
              data-page="library"
            >
              Go to Library
            </button>
          </div>
        `
        : `
          <div class="word-grid">

            ${words
              .map(
                word => `
                  <article class="word-card">

                    <div class="word-card-header">
                      <strong>
                        ${esc(word.word)}
                      </strong>

                      ${
                        word.level
                          ? `<span class="level-badge">${word.level}</span>`
                          : ""
                      }

                    </div>

                    <p class="word-meaning">
                      ${esc(word.meaning)}
                    </p>

                    ${
                      word.example
                        ? `
                          <p class="word-example">
                            “${esc(word.example)}”
                          </p>
                        `
                        : ""
                    }

                  </article>
                `,
              )
              .join("")}

          </div>
        `
    }
  `);
}

function renderPractice(): string {
  const questions =
    getPracticeQuestions(
      state.selectedPracticeLevel,
    );

  return shell(`
    ${pageHeader(
      "Practice",
      "Practice your English",
      "Train grammar and vocabulary at your current level.",
    )}

    <div class="filter-row">

      ${LEVELS.map(
        level => `
          <button
            type="button"
            class="filter-chip ${
              state.selectedPracticeLevel === level
                ? "active"
                : ""
            }"
            data-practice-level="${level}"
          >
            ${level}
          </button>
        `,
      ).join("")}

    </div>

    <div class="practice-list">

      ${questions
        .map(
          (question, index) => `
            <article class="practice-card">

              <div class="practice-number">
                ${index + 1}
              </div>

              <div class="practice-body">

                <span class="level-badge">
                  ${question.level}
                </span>

                <h3>
                  ${esc(question.question)}
                </h3>

                <div class="practice-options">

                  ${question.options
                    .map(
                      option => `
                        <button
                          type="button"
                          class="practice-option"
                          data-practice-id="${esc(question.id)}"
                          data-practice-answer="${esc(option)}"
                        >
                          ${esc(option)}
                        </button>
                      `,
                    )
                    .join("")}

                </div>

                ${
                  question.explanation
                    ? `
                      <p class="practice-explanation">
                        ${esc(question.explanation)}
                      </p>
                    `
                    : ""
                }

              </div>

            </article>
          `,
        )
        .join("")}

    </div>
  `);
}
function renderRooms(): string {
  return shell(`
    ${pageHeader(
      "Rooms",
      "Practice with others",
      "Join a safe language-learning room and practice together.",
    )}

    <div class="rooms-toolbar">

      <div class="filter-row">

        ${LEVELS.map(
          level => `
            <button
              type="button"
              class="filter-chip"
              data-room-level="${level}"
            >
              ${level}
            </button>
          `,
        ).join("")}

      </div>

      <button
        type="button"
        class="primary-btn"
        data-action="create-room"
      >
        + Create Room
      </button>

    </div>

    <div class="rooms-list">

      ${getAvailableRooms()
        .map(room => `
          <article class="room-card">

            <div class="room-card-main">

              <div class="room-card-title-row">

                <h3>
                  ${esc(room.title)}
                </h3>

                <span class="level-badge">
                  ${esc(room.level)}
                </span>

              </div>

              <p class="room-topic">
                ${esc(room.topic)}
              </p>

              <div class="room-details">

                <span>
                  🌐 ${esc(room.language)}
                </span>

                <span>
                  👥 ${room.participants}/${room.maxParticipants}
                </span>

                <span>
                  ${room.gender === "girls"
                    ? "Girls"
                    : room.gender === "boys"
                      ? "Boys"
                      : "Mixed"}
                </span>

                <span>
                  ${room.mode === "video"
                    ? "Video"
                    : "Audio"}
                </span>

              </div>

            </div>

            <button
              type="button"
              class="primary-btn small"
              data-join-room="${esc(room.id)}"
              ${
                room.participants >=
                room.maxParticipants
                  ? "disabled"
                  : ""
              }
            >
              ${
                room.participants >=
                room.maxParticipants
                  ? "Full"
                  : "Join"
              }
            </button>

          </article>
        `)
        .join("")}

    </div>

    ${
      getAvailableRooms().length === 0
        ? `
          <div class="empty-state">

            <div class="empty-icon">
              ◉
            </div>

            <h2>
              No rooms available
            </h2>

            <p>
              Create the first room and start practicing.
            </p>

          </div>
        `
        : ""
    }
  `);
}

function renderMessages(): string {
  return shell(`
    ${pageHeader(
      "Messages",
      "Your messages",
      "Messages are available only after both users accept the connection.",
    )}

    <div class="messages-page">

      <div class="messages-safety-note">
        <span>🔒</span>

        <div>
          <strong>
            Safe messaging
          </strong>

          <p>
            You can only message another learner after
            both sides accept the connection.
          </p>
        </div>
      </div>

      <div class="messages-list">

        ${
          getMessages().length === 0
            ? `
              <div class="empty-state">

                <div class="empty-icon">
                  ♡
                </div>

                <h2>
                  No messages yet
                </h2>

                <p>
                  Accepted connections will appear here.
                </p>

                <button
                  type="button"
                  class="primary-btn"
                  data-page="rooms"
                >
                  Find a Room
                </button>

              </div>
            `
            : getMessages()
                .map(message => `
                  <article
                    class="message-preview"
                    data-message-id="${esc(message.id)}"
                  >

                    <div class="message-avatar">
                      ${message.avatar
                        ? avatarMarkup(message.avatar)
                        : "👤"}
                    </div>

                    <div class="message-preview-body">

                      <div class="message-preview-top">
                        <strong>
                          ${esc(message.displayName)}
                        </strong>

                        ${
                          message.isOnline
                            ? `<span class="online-dot"></span>`
                            : ""
                        }
                      </div>

                      <p>
                        ${esc(message.lastMessage)}
                      </p>

                    </div>

                    ${
                      message.unread
                        ? `
                          <span class="unread-dot">
                            ${message.unread}
                          </span>
                        `
                        : ""
                    }

                  </article>
                `)
                .join("")
        }

      </div>

    </div>
  `);
}

function renderGames(): string {
  return shell(`
    ${pageHeader(
      "Games",
      "Learn while playing",
      "Use language challenges to build vocabulary, fluency and confidence.",
    )}

    <div class="games-grid">

      <article class="game-card">

        <div class="game-icon">
          🧩
        </div>

        <span class="level-badge">
          A1–C2
        </span>

        <h3>
          Continue the Sentence
        </h3>

        <p>
          Complete the sentence before the timer runs out.
        </p>

        <button
          type="button"
          class="primary-btn small"
          data-game="sentence"
        >
          Play
        </button>

      </article>

      <article class="game-card">

        <div class="game-icon">
          🎭
        </div>

        <span class="level-badge">
          A1–C2
        </span>

        <h3>
          Roleplay
        </h3>

        <p>
          Practice real-life conversations through short scenarios.
        </p>

        <button
          type="button"
          class="primary-btn small"
          data-game="roleplay"
        >
          Play
        </button>

      </article>

      <article class="game-card">

        <div class="game-icon">
          🕵️
        </div>

        <span class="level-badge">
          Challenge
        </span>

        <h3>
          Mystery Card
        </h3>

        <p>
          Complete an unexpected language mission.
        </p>

        <button
          type="button"
          class="primary-btn small"
          data-game="mystery"
        >
          Draw Card
        </button>

      </article>

      <article class="game-card">

        <div class="game-icon">
          ❓
        </div>

        <span class="level-badge">
          Vocabulary
        </span>

        <h3>
          Guess the Word
        </h3>

        <p>
          Explain a word without saying the word itself.
        </p>

        <button
          type="button"
          class="primary-btn small"
          data-game="guess"
        >
          Play
        </button>

      </article>

    </div>
  `);
}

function renderProgress(): string {
  const stats = getProgressStats(state);

  const level =
    getLevelFromXp(state.totalXp);

  const levelProgress =
    getLevelProgress(state.totalXp);

  return shell(`
    ${pageHeader(
      "Progress",
      "Your learning journey",
      "Track your consistency, XP and completed learning activities.",
    )}

    <section class="progress-overview">

      <div class="progress-level-card">

        <span class="eyebrow">
          CURRENT LEVEL
        </span>

        <strong>
          ${level}
        </strong>

        <div class="progress-track large">
          <div
            class="progress-fill"
            style="width:${levelProgress}%"
          ></div>
        </div>

        <span>
          ${levelProgress}% to the next level
        </span>

      </div>

      <div class="progress-xp-card">

        <span class="eyebrow">
          TOTAL XP
        </span>

        <strong>
          ${state.totalXp}
        </strong>

      </div>

      <div class="progress-streak-card">

        <span class="eyebrow">
          CURRENT STREAK
        </span>

        <strong>
          ${stats.currentStreak}
        </strong>

        <span>
          days
        </span>

      </div>

    </section>

    <section class="progress-section">

      <div class="section-heading">

        <div>
          <span class="eyebrow">
            ACTIVITIES
          </span>

          <h2>
            Your achievements
          </h2>
        </div>

      </div>

      <div class="stats-grid">

        <div class="stat-card">
          <strong>
            ${stats.articlesRead}
          </strong>
          <span>
            Articles read
          </span>
        </div>

        <div class="stat-card">
          <strong>
            ${stats.vocabularyLearned}
          </strong>
          <span>
            Words learned
          </span>
        </div>

        <div class="stat-card">
          <strong>
            ${stats.practiceCompleted}
          </strong>
          <span>
            Practice completed
          </span>
        </div>

        <div class="stat-card">
          <strong>
            ${stats.roomsJoined}
          </strong>
          <span>
            Rooms joined
          </span>
        </div>

        <div class="stat-card">
          <strong>
            ${stats.cardsCollected}
          </strong>
          <span>
            Cards collected
          </span>
        </div>

        <div class="stat-card">
          <strong>
            ${stats.longestStreak}
          </strong>
          <span>
            Longest streak
          </span>
        </div>

      </div>

    </section>

    <section class="progress-section">

      <div class="section-heading">

        <div>
          <span class="eyebrow">
            DAILY GOAL
          </span>

          <h2>
            Today
          </h2>
        </div>

        <strong>
          ${state.progress.dailyXp} /
          ${state.progress.dailyGoal} XP
        </strong>

      </div>

      <div class="progress-track large">
        <div
          class="progress-fill"
          style="width:${Math.min(
            100,
            Math.round(
              (state.progress.dailyXp /
                Math.max(
                  1,
                  state.progress.dailyGoal,
                )) *
                100,
            ),
          )}%"
        ></div>
      </div>

      ${
        state.progress.dailyXp >=
        state.progress.dailyGoal
          ? `
            <p class="success-message">
              ✓ Daily goal completed!
            </p>
          `
          : `
            <p class="muted-text">
              Keep going. Every activity counts.
            </p>
          `
      }

    </section>
  `);
}

function renderProfile(): string {
  const user = currentUser();

  if (!user) {
    return renderWelcomeScreen();
  }

  const identityCard =
    user.identityCard;

  return shell(`
    ${pageHeader(
      "Profile",
      esc(user.displayName || user.name),
      "Your DRE2learn learning identity.",
    )}

    <section class="profile-layout">

      <div class="profile-main-card">

        <div class="profile-avatar">
          ${avatarMarkup(user.avatar)}
        </div>

        <div class="profile-info">

          <div class="profile-name-row">

            <h2>
              ${esc(user.displayName || user.name)}
            </h2>

            ${
              user.isVip
                ? `<span class="vip-badge">VIP</span>`
                : ""
            }

          </div>

          <p class="profile-username">
            @${esc(user.username)}
          </p>

          <div class="profile-level">
            <span class="level-badge">
              ${user.level}
            </span>

            <span>
              ${state.totalXp} XP
            </span>
          </div>

          ${
            user.bio
              ? `
                <p class="profile-bio">
                  ${esc(user.bio)}
                </p>
              `
              : ""
          }

        </div>

      </div>

      <div class="identity-card-section">

        <div class="section-heading">

          <div>
            <span class="eyebrow">
              DRE2LEARN ID
            </span>

            <h2>
              Identity Card
            </h2>
          </div>

        </div>

        ${
          identityCard
            ? renderIdentityCard(
                user,
                identityCard,
              )
            : `
              <div class="empty-state compact">

                <h3>
                  Identity card not available yet
                </h3>

                <p>
                  Complete your level test to receive your
                  DRE2learn identity card.
                </p>

                <button
                  type="button"
                  class="primary-btn small"
                  data-page="levelTest"
                >
                  Take Level Test
                </button>

              </div>
            `
        }

      </div>

    </section>

    <section class="profile-actions">

      <button
        type="button"
        class="secondary-btn"
        data-action="logout"
      >
        Log out
      </button>

    </section>
  `);
}

function renderIdentityCard(
  user: UserProfile,
  card: IdentityCard,
): string {
  const issued =
    new Date(card.issuedAt);

  const expires =
    new Date(card.expiresAt);

  const expired =
    expires.getTime() <= Date.now();

  return `
    <article
      class="identity-card ${
        expired ? "expired" : ""
      }"
    >

      <div class="identity-card-map">
        ${esc(card.countryMapCode ?? card.countryCode)}
      </div>

      <div class="identity-card-header">

        <div class="identity-logo">
          🎓
          <strong>
            DRE2learn
          </strong>
        </div>

        <span class="identity-label">
          LEARNER ID
        </span>

      </div>

      <div class="identity-card-body">

        <div class="identity-avatar">
          ${avatarMarkup(user.avatar)}
        </div>

        <div class="identity-details">

          <strong class="identity-name">
            ${esc(user.username)}
          </strong>

          <span>
            Level ${esc(user.level)}
          </span>

          <span>
            ${state.totalXp} XP
          </span>

          <span>
            ${getCountryFlag(card.countryCode)}
            ${esc(card.countryName ?? card.countryCode)}
          </span>

        </div>

      </div>

      <div class="identity-card-footer">

        <span>
          Issued:
          ${formatDate(issued)}
        </span>

        <span>
          Expires:
          ${formatDate(expires)}
        </span>

      </div>

      ${
        expired
          ? `
            <div class="identity-expired">
              Expired
            </div>
          `
          : ""
      }

    </article>
  `;
}

function renderWelcomeScreen(): string {
  return `
    <main class="public-page">
      ${welcomeMarkup()}
    </main>
  `;
}

function shell(content: string): string {
  return `
    <div class="app-shell">

      ${sidebarMarkup(state.page)}

      <main class="app-main">
        ${content}
      </main>

    </div>
  `;
}

function pageHeader(
  eyebrow: string,
  title: string,
  description: string,
): string {
  return `
    <header class="page-header">

      <div>
        <span class="eyebrow">
          ${esc(eyebrow)}
        </span>

        <h1>
          ${title}
        </h1>

        <p>
          ${description}
        </p>
      </div>

    </header>
  `;
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currentUser(): UserProfile | null {
  return state.user;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

function formatArticleContent(
  content: string,
): string {
  return content
    .split(/\n{2,}/)
    .map(
      paragraph =>
        `<p>${esc(paragraph.trim())}</p>`,
    )
    .join("");
}

function getCurrentArticle() {
  if (!state.currentArticleId) {
    return null;
  }

  return LIBRARY_ARTICLES.find(
    article =>
      article.id ===
      state.currentArticleId,
  ) ?? null;
}

function getVisibleArticles() {
  return LIBRARY_ARTICLES.filter(
    article => {

      const levelMatch =
        state.selectedLibraryLevel ===
          "ALL" ||
        article.level ===
          state.selectedLibraryLevel;

      const topicMatch =
        !state.selectedTopic ||
        article.topic ===
          state.selectedTopic;

      return levelMatch && topicMatch;
    },
  );
}

function getPracticeQuestions(
  level: Level,
) {
  return PRACTICE_QUESTIONS.filter(
    question =>
      question.level === level,
  );
}

const LEVELS: Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

const LIBRARY_TOPICS = [
  "Daily Life",
  "Travel",
  "Education",
  "Technology",
  "Culture",
  "Science",
  "Environment",
  "Health",
  "Food",
  "Work",
  "Communication",
  "Books",
  "Movies",
  "Music",
  "Art",
  "History",
  "Nature",
  "Society",
  "Future",
];
// ============================================================
// PART 4 — EVENT HANDLERS + RENDER + NAVIGATION
// ============================================================

function handleOnboardingContinue(): void {
  const genderSelect =
    document.querySelector<HTMLSelectElement>(
      "#onboarding-gender",
    );

  const countrySelect =
    document.querySelector<HTMLSelectElement>(
      "#onboarding-country",
    );

  if (!genderSelect || !countrySelect || !state.user) {
    return;
  }

  selectedAvatar = {
    ...selectedAvatar,
    gender:
      genderSelect.value === "boy"
        ? "boy"
        : "girl",
  };

  state.user.countryCode =
    countrySelect.value.toUpperCase();

  state.user.updatedAt =
    new Date().toISOString();

  onboardingStep = "avatar";

  persistState();
  render();
}

function handleAvatarControlChange(
  target: HTMLSelectElement,
): void {
  switch (target.id) {
    case "avatar-skin":
      selectedAvatar = {
        ...selectedAvatar,
        skinTone:
          target.value as Avatar["skinTone"],
      };
      break;

    case "avatar-eyes":
      selectedAvatar = {
        ...selectedAvatar,
        eyeColor:
          target.value as Avatar["eyeColor"],
      };
      break;

    case "avatar-hair-style":
      selectedAvatar = {
        ...selectedAvatar,
        hairStyle:
          target.value as Avatar["hairStyle"],
        hijab:
          target.value === "hijab",
      };
      break;

    case "avatar-hair-color":
      selectedAvatar = {
        ...selectedAvatar,
        hairColor:
          target.value as Avatar["hairColor"],
      };
      break;

    case "avatar-shirt":
      selectedAvatar = {
        ...selectedAvatar,
        shirtColor:
          target.value as Avatar["shirtColor"],
      };
      break;
  }

  render();
}

function handleLibraryLevel(
  level: string,
): void {
  if (
    level === "ALL" ||
    LEVELS.includes(level as Level)
  ) {
    state.selectedLibraryLevel =
      level as Level | "ALL";

    persistState();
    render();
  }
}

function handleLibraryTopic(
  topic: string,
): void {
  state.selectedTopic = topic;

  persistState();
  render();
}

function handlePracticeLevel(
  level: string,
): void {
  if (!LEVELS.includes(level as Level)) {
    return;
  }

  state.selectedPracticeLevel =
    level as Level;

  persistState();
  render();
}

function openArticle(
  articleId: string,
): void {
  const article =
    LIBRARY_ARTICLES.find(
      item => item.id === articleId,
    );

  if (!article) {
    return;
  }

  state.currentArticleId =
    article.id;

  navigate("article");
}

function completeArticle(
  articleId: string,
): void {
  if (
    state.completedArticles.includes(
      articleId,
    )
  ) {
    return;
  }

  state =
    markArticleCompleted(
      state,
      articleId,
    );

  persistState();
  render();
}

function saveVocabularyWord(
  wordText: string,
): void {
  const article =
    getCurrentArticle();

  if (!article) {
    return;
  }

  const vocabularyItem =
    article.vocabulary.find(
      word =>
        word.word.toLowerCase() ===
        wordText.toLowerCase(),
    );

  if (!vocabularyItem) {
    return;
  }

  const alreadySaved =
    state.vocabulary.some(
      word =>
        word.word.toLowerCase() ===
        vocabularyItem.word.toLowerCase(),
    );

  if (alreadySaved) {
    return;
  }

  state = addVocabularyWord(
    state,
    {
      id:
        vocabularyItem.id ||
        `word-${Date.now()}`,
      word: vocabularyItem.word,
      meaning:
        vocabularyItem.meaning,
      example:
        vocabularyItem.example,
      level:
        vocabularyItem.level ??
        article.level,
      articleId:
        article.id,
      createdAt:
        new Date().toISOString(),
      savedAt:
        new Date().toISOString(),
    },
  );

  persistState();
  render();
}

function submitPracticeAnswer(
  questionId: string,
  answer: string,
): void {
  const question =
    PRACTICE_QUESTIONS.find(
      item =>
        item.id === questionId,
    );

  if (!question) {
    return;
  }

  const buttons =
    document.querySelectorAll<HTMLButtonElement>(
      `[data-practice-id="${CSS.escape(
        questionId,
      )}"]`,
    );

  buttons.forEach(button => {
    button.disabled = true;

    if (
      button.dataset.practiceAnswer ===
      question.correctAnswer
    ) {
      button.classList.add(
        "correct",
      );
    }

    if (
      button.dataset.practiceAnswer ===
        answer &&
      answer !==
        question.correctAnswer
    ) {
      button.classList.add(
        "incorrect",
      );
    }
  });

  state.practiceAnswered += 1;

  if (
    answer ===
    question.correctAnswer
  ) {
    state.practiceScore += 1;

    state =
      markPracticeCompleted(
        state,
      );
  }

  persistState();

  setTimeout(() => {
    render();
  }, 700);
}

function submitLevelTestTextAnswer(): void {
  const input =
    document.querySelector<HTMLTextAreaElement>(
      "#levelTestAnswer",
    );

  if (!input) {
    return;
  }

  const answer =
    input.value.trim();

  if (!answer) {
    alert(
      "Please write an answer before continuing.",
    );
    return;
  }

  const question =
    levelTestQuestions[
      levelTestIndex
    ];

  if (!question) {
    return;
  }

  submitTestAnswer(
    question,
    answer,
  );
}

function selectLevelTestOption(
  answer: string,
): void {
  const question =
    levelTestQuestions[
      levelTestIndex
    ];

  if (!question) {
    return;
  }

  submitTestAnswer(
    question,
    answer,
  );
}

function joinRoom(
  roomId: string,
): void {
  const room =
    getAvailableRooms().find(
      item => item.id === roomId,
    );

  if (!room) {
    alert(
      "This room is no longer available.",
    );
    return;
  }

  if (
    room.participants >=
    room.maxParticipants
  ) {
    alert(
      "This room is full.",
    );
    return;
  }

  state.joinedRoomId =
    room.id;

  state =
    markRoomJoined(
      state,
    );

  persistState();

  alert(
    `You joined ${room.title}.`,
  );

  render();
}

function createRoom(): void {
  alert(
    "Room creation will use the DRE2learn room system.",
  );
}

function startGame(
  game: string,
): void {
  switch (game) {
    case "sentence":
      alert(
        "Continue the Sentence game is ready to start.",
      );
      break;

    case "roleplay":
      alert(
        "Roleplay game is ready to start.",
      );
      break;

    case "mystery":
      drawMysteryCard();
      break;

    case "guess":
      alert(
        "Guess the Word game is ready to start.",
      );
      break;

    default:
      break;
  }
}

function drawMysteryCard(): void {
  const cards =
    getMysteryCards();

  if (cards.length === 0) {
    alert(
      "No Mystery Cards are available yet.",
    );
    return;
  }

  const randomIndex =
    Math.floor(
      Math.random() *
        cards.length,
    );

  const card =
    cards[randomIndex];

  if (!card) {
    return;
  }

  alert(
    `${card.title}\n\n${card.content}`,
  );
}

function getMysteryCards() {
  return LEARNING_CARDS.filter(
    card =>
      card.type === "mystery",
  );
}

function openMessage(
  messageId: string,
): void {
  const message =
    getMessages().find(
      item =>
        item.id === messageId,
    );

  if (!message) {
    return;
  }

  alert(
    `Messages with ${message.displayName} will open here.`,
  );
}

function handleAction(
  action: string,
): void {
  switch (action) {
    case "logout":
      handleLogout();
      break;

    case "create-room":
      createRoom();
      break;

    case "home":
      navigate("home");
      break;

    default:
      break;
  }
}

function handleClick(
  event: MouseEvent,
): void {
  const target =
    event.target as HTMLElement | null;

  if (!target) {
    return;
  }

  const pageButton =
    target.closest<HTMLElement>(
      "[data-page]",
    );

  if (pageButton) {
    const page =
      pageButton.dataset.page;

    if (
      page &&
      isPage(page)
    ) {
      navigate(page);
      return;
    }
  }

  const actionButton =
    target.closest<HTMLElement>(
      "[data-action]",
    );

  if (actionButton) {
    handleAction(
      actionButton.dataset.action ?? "",
    );
    return;
  }

  const signupButton =
    target.closest<HTMLElement>(
      "[data-signup]",
    );

  if (signupButton) {
    handleSignup();
    return;
  }

  const loginButton =
    target.closest<HTMLElement>(
      "[data-login]",
    );

  if (loginButton) {
    handleLogin();
    return;
  }

  const onboardingButton =
    target.closest<HTMLElement>(
      "#continue-onboarding",
    );

  if (onboardingButton) {
    handleOnboardingContinue();
    return;
  }

  const saveAvatarButton =
    target.closest<HTMLElement>(
      "#save-avatar",
    );

  if (saveAvatarButton) {
    saveAvatar();
    return;
  }

  const levelButton =
    target.closest<HTMLElement>(
      "[data-library-level]",
    );

  if (levelButton) {
    handleLibraryLevel(
      levelButton.dataset.libraryLevel ??
        "",
    );
    return;
  }

  const topicButton =
    target.closest<HTMLElement>(
      "[data-library-topic]",
    );

  if (topicButton) {
    handleLibraryTopic(
      topicButton.dataset.libraryTopic ??
        "",
    );
    return;
  }

  const articleButton =
    target.closest<HTMLElement>(
      "[data-article-id]",
    );

  if (articleButton) {
    openArticle(
      articleButton.dataset.articleId ??
        "",
    );
    return;
  }

  const completeArticleButton =
    target.closest<HTMLElement>(
      "[data-complete-article]",
    );

  if (completeArticleButton) {
    completeArticle(
      completeArticleButton.dataset
        .completeArticle ?? "",
    );
    return;
  }

  const saveWordButton =
    target.closest<HTMLElement>(
      "[data-save-word]",
    );

  if (saveWordButton) {
    saveVocabularyWord(
      saveWordButton.dataset.saveWord ??
        "",
    );
    return;
  }

  const practiceLevelButton =
    target.closest<HTMLElement>(
      "[data-practice-level]",
    );

  if (practiceLevelButton) {
    handlePracticeLevel(
      practiceLevelButton.dataset
        .practiceLevel ?? "",
    );
    return;
  }

  const practiceButton =
    target.closest<HTMLElement>(
      "[data-practice-id]",
    );

  if (practiceButton) {
    submitPracticeAnswer(
      practiceButton.dataset.practiceId ??
        "",
      practiceButton.dataset.practiceAnswer ??
        "",
    );
    return;
  }

  const testOption =
    target.closest<HTMLElement>(
      "[data-level-test-option]",
    );

  if (testOption) {
    selectLevelTestOption(
      testOption.dataset
        .levelTestOption ?? "",
    );
    return;
  }

  const testSubmit =
    target.closest<HTMLElement>(
      "[data-level-test-submit]",
    );

  if (testSubmit) {
    submitLevelTestTextAnswer();
    return;
  }

  const roomButton =
    target.closest<HTMLElement>(
      "[data-join-room]",
    );

  if (roomButton) {
    joinRoom(
      roomButton.dataset.joinRoom ??
        "",
    );
    return;
  }

  const gameButton =
    target.closest<HTMLElement>(
      "[data-game]",
    );

  if (gameButton) {
    startGame(
      gameButton.dataset.game ??
        "",
    );
    return;
  }

  const messageButton =
    target.closest<HTMLElement>(
      "[data-message-id]",
    );

  if (messageButton) {
    openMessage(
      messageButton.dataset.messageId ??
        "",
    );
    return;
  }
}

function handleChange(
  event: Event,
): void {
  const target =
    event.target as HTMLSelectElement | null;

  if (!target) {
    return;
  }

  if (
    target.id.startsWith(
      "avatar-",
    )
  ) {
    handleAvatarControlChange(
      target,
    );
  }
}

function isPage(
  value: string,
): value is Page {
  return [
    "welcome",
    "signup",
    "login",
    "avatar",
    "levelTest",
    "home",
    "library",
    "article",
    "vocabulary",
    "practice",
    "rooms",
    "messages",
    "games",
    "progress",
    "profile",
    "settings",
    "updates",
  ].includes(value);
}

function render(): void {
  switch (state.page) {
    case "welcome":
      app.innerHTML =
        renderWelcomeScreen();
      break;

    case "signup":
      app.innerHTML = `
        <main class="public-page">
          ${signupMarkup()}
        </main>
      `;
      break;

    case "login":
      app.innerHTML = `
        <main class="public-page">
          ${loginMarkup()}
        </main>
      `;
      break;

    case "avatar":
      app.innerHTML =
        renderAvatar();
      break;

    case "levelTest":
      app.innerHTML =
        renderLevelTest();
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

    case "messages":
      app.innerHTML =
        renderMessages();
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

    case "settings":
      app.innerHTML =
        renderSettings();
      break;

    case "updates":
      app.innerHTML =
        renderUpdates();
      break;

    default:
      app.innerHTML =
        renderWelcomeScreen();
      break;
  }
}

function renderSettings(): string {
  return shell(`
    ${pageHeader(
      "Settings",
      "Settings",
      "Manage your DRE2learn preferences.",
    )}

    <section class="settings-list">

      <div class="setting-row">

        <div>
          <strong>
            Sound effects
          </strong>

          <p>
            Play sounds during learning activities.
          </p>
        </div>

        <button
          type="button"
          class="secondary-btn small"
          data-setting="soundEffects"
        >
          ${
            state.settings.soundEffects
              ? "On"
              : "Off"
          }
        </button>

      </div>

      <div class="setting-row">

        <div>
          <strong>
            Autoplay audio
          </strong>

          <p>
            Automatically play learning audio.
          </p>
        </div>

        <button
          type="button"
          class="secondary-btn small"
          data-setting="autoplayAudio"
        >
          ${
            state.settings.autoplayAudio
              ? "On"
              : "Off"
          }
        </button>

      </div>

      <div class="setting-row">

        <div>
          <strong>
            Private messages
          </strong>

          <p>
            Allow accepted connections to message you.
          </p>
        </div>

        <button
          type="button"
          class="secondary-btn small"
          data-setting="privateMessages"
        >
          ${
            state.settings.privateMessages
              ? "On"
              : "Off"
          }
        </button>

      </div>

      <div class="setting-row">

        <div>
          <strong>
            Online status
          </strong>

          <p>
            Show when you are online.
          </p>
        </div>

        <button
          type="button"
          class="secondary-btn small"
          data-setting="showOnlineStatus"
        >
          ${
            state.settings.showOnlineStatus
              ? "On"
              : "Off"
          }
        </button>

      </div>

    </section>
  `);
}

function renderUpdates(): string {
  return shell(`
    ${pageHeader(
      "Updates",
      "DRE2learn Updates",
      "See the latest changes and improvements.",
    )}

    <section class="updates-list">

      <article class="update-card">
        <span class="level-badge">
          DRE2learn
        </span>

        <h3>
          Welcome to DRE2learn
        </h3>

        <p>
          Learn languages, practice with others,
          and grow with a safe community.
        </p>
      </article>

      <article class="update-card">
        <span class="level-badge">
          New
        </span>

        <h3>
          Identity Card
        </h3>

        <p>
          Complete your level test to unlock
          your DRE2learn identity card.
        </p>
      </article>

    </section>
  `);
}

function handleSetting(
  setting: string,
): void {
  const allowedSettings = [
    "soundEffects",
    "autoplayAudio",
    "privateMessages",
    "showOnlineStatus",
  ] as const;

  if (
    !allowedSettings.includes(
      setting as
        (typeof allowedSettings)[number],
    )
  ) {
    return;
  }

  const key =
    setting as keyof typeof state.settings;

  const current =
    state.settings[key];

  if (typeof current !== "boolean") {
    return;
  }

  state.settings[key] =
    !current;

  persistState();
  render();
}

function handleGlobalClick(
  event: MouseEvent,
): void {
  const target =
    event.target as HTMLElement | null;

  if (!target) {
    return;
  }

  const settingButton =
    target.closest<HTMLElement>(
      "[data-setting]",
    );

  if (settingButton) {
    handleSetting(
      settingButton.dataset.setting ??
        "",
    );
    return;
  }

  handleClick(event);
}

document.addEventListener(
  "click",
  handleGlobalClick,
);

document.addEventListener(
  "change",
  handleChange,
);

render();