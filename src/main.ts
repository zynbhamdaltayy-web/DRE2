import "./style.css";

import type {
  AppState,
  Article,
  Level,
  LevelTestAnswer,
  LevelTestQuestion,
  Page,
  VocabularyWord,
  UserProfile,
} from "./types";

import { defaultAvatar, createDefaultState } from "./state";

import {
  saveState,
  loadStoredState,
  clearStoredState,
  addXP,
  markArticleCompleted,
  addVocabularyWord,
  markPracticeCompleted,
  markRoomJoined,
} from "./storage";

import { sidebarMarkup } from "./sidebar";
import { logoMarkup } from "./logo";
import { avatarMarkup } from "./avatar";
import { welcomePageMarkup } from "./welcome";
import { signupPageMarkup } from "./signup";
import { loginPageMarkup } from "./login";

import {
  getLibraryArticles,
  getLibraryTopics,
  LIBRARY_LEVELS,
  type LibraryArticle,
} from "./data/library";

import {
  getProgressStatistics,
  getLevelFromXp,
  getNextLevel,
  getXpToNextLevel,
  getLevelProgress,
  getDailyGoalProgress,
  getStreakSummary,
  getProgressStats,
} from "./data/progress";

import {
  levelTestQuestions,
  getNextAdaptiveQuestion,
  createAdaptiveState,
  recordAdaptiveAnswer,
  calculateLevelTestResult,
  shouldFinishTest,
} from "./data/levelTest";

import {
  getAllRooms,
  createAndSaveRoom,
  joinStoredRoom,
  leaveStoredRoom,
} from "./data/roomStorage";

import type {
  RoomGender,
  RoomType,
} from "./data/rooms";

import {
  getAllConversations,
  getAllMessages,
  getAllMessageRequests,
} from "./data/messageStorage";

import { createGoogleTranslateUrl } from "./data/library";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container not found.");
}

const LEVELS: Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

let state: AppState =
  loadStoredState() ?? createDefaultState();

let practiceIndex = 0;
let practiceAnswered = false;

let levelTestIndex = 0;
let levelTestAnswers: LevelTestAnswer[] = [];

let adaptiveState = createAdaptiveState();

function esc(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currentUser(): UserProfile | null {
  return state.user;
}

function userId(): string {
  return state.user?.email || "local-user";
}

function persist(): void {
  state = {
    ...state,
    totalXp: Math.max(
      0,
      state.totalXp || state.user?.xp || 0,
    ),
  };

  saveState(state);
}

function navigate(page: Page): void {
  state.page = page;

  persist();

  render();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function shell(content: string): string {
  const authenticated =
    state.isAuthenticated && !!state.user;

  if (!authenticated) {
    return content;
  }

  return `
    <div class="app-shell">
      ${sidebarMarkup(state.page)}

      <div class="app-main">
        <header class="topbar">
          <div class="topbar-mobile-brand">
            ${logoMarkup(true)}
          </div>

          <div class="topbar-spacer"></div>

          <button
            class="topbar-profile"
            data-action="profile"
            aria-label="Profile"
          >
            ${avatarMarkup(
              state.user?.avatar ?? defaultAvatar,
              42,
            )}
          </button>
        </header>

        <main class="page">
          ${content}
        </main>
      </div>
    </div>
  `;
}

function pageHeader(
  eyebrow: string,
  title: string,
  description = "",
): string {
  return `
    <div class="page-header">
      <div>
        <div class="eyebrow">
          ${esc(eyebrow)}
        </div>

        <h1>
          ${esc(title)}
        </h1>

        ${
          description
            ? `<p>${esc(description)}</p>`
            : ""
        }
      </div>
    </div>
  `;
}

function statCard(
  label: string,
  value: string | number,
  detail: string,
): string {
  return `
    <div class="stat-card">
      <span class="stat-label">
        ${esc(label)}
      </span>

      <strong>
        ${esc(value)}
      </strong>

      <small>
        ${esc(detail)}
      </small>
    </div>
  `;
}

function renderHome(): string {
  const user = currentUser();

  if (!user) {
    return renderWelcomeScreen();
  }

  const level = getLevelFromXp(state.totalXp);

  const progress =
    getLevelProgress(state.totalXp);

  const daily =
    getDailyGoalProgress(state);

  const streak =
    getStreakSummary(state);

  const next =
    getNextLevel(level);

  return shell(`
    ${pageHeader(
      "DRE2learn",
      `Welcome back, ${user.name || "Learner"}`,
      "Learn languages, practice with others, and grow with a safe community.",
    )}

    <section class="hero-card">
      <div>
        <span class="hero-kicker">
          Your learning path
        </span>

        <h2>
          ${level}
        </h2>

        <p>
          ${
            next
              ? `${getXpToNextLevel(
                  state.totalXp,
                )} XP to ${next}.`
              : "You reached the highest level."
          }
        </p>

        <div class="progress-track">
          <span
            style="width:${progress}%"
          ></span>
        </div>

        <small>
          ${progress}% through your current level
        </small>
      </div>

      <div class="hero-avatar">
        ${avatarMarkup(user.avatar, 120)}
      </div>
    </section>

    <section class="stats-grid">
      ${statCard(
        "XP",
        state.totalXp,
        "Total learning XP",
      )}

      ${statCard(
        "Streak",
        `${streak.currentStreak} days`,
        "Keep your daily practice",
      )}

      ${statCard(
        "Today",
        `${daily.current}/${daily.goal}`,
        daily.completed
          ? "Goal completed"
          : "Daily goal",
      )}

      ${statCard(
        "Articles",
        state.articlesRead,
        "Completed readings",
      )}
    </section>

    <section class="section-block">
      <div class="section-title">
        <h2>
          Continue learning
        </h2>
      </div>

      <div class="action-grid">
        <button
          class="feature-card"
          data-action="library"
        >
          <span>▤</span>
          <strong>Library</strong>
          <small>
            Read by level and topic
          </small>
        </button>

        <button
          class="feature-card"
          data-action="practice"
        >
          <span>✓</span>
          <strong>Practice</strong>
          <small>
            Build accuracy every day
          </small>
        </button>

        <button
          class="feature-card"
          data-action="rooms"
        >
          <span>◉</span>
          <strong>Rooms</strong>
          <small>
            Practice with other learners
          </small>
        </button>

        <button
          class="feature-card"
          data-action="games"
        >
          <span>🎮</span>
          <strong>Games</strong>
          <small>
            Use language in a fun way
          </small>
        </button>
      </div>
    </section>
  `);
}

function renderLibrary(): string {
  const level =
    state.selectedLibraryLevel;

  const topic =
    state.selectedTopic;

  const articles =
    getLibraryArticles(
      level === "ALL"
        ? undefined
        : level,
      topic === "ALL"
        ? undefined
        : topic,
    );

  return shell(`
    ${pageHeader(
      "Learn",
      "Library",
      "Choose a level and topic, then open an article.",
    )}

    <div class="filter-row">
      <div class="filter-group">
        <span>
          Level
        </span>

        ${[
          "ALL",
          ...LEVELS,
        ]
          .map(
            (l) => `
              <button
                class="chip ${
                  level === l
                    ? "selected"
                    : ""
                }"
                data-level="${l}"
              >
                ${l}
              </button>
            `,
          )
          .join("")}
      </div>

      <div class="filter-group">
        <span>
          Topic
        </span>

        <select
          id="topicFilter"
          class="select-control"
        >
          <option value="ALL">
            All topics
          </option>

          ${getLibraryTopics()
            .map(
              (t) => `
                <option
                  value="${esc(t)}"
                  ${
                    topic === t
                      ? "selected"
                      : ""
                  }
                >
                  ${esc(t)}
                </option>
              `,
            )
            .join("")}
        </select>
      </div>
    </div>

    <section class="article-grid">
      ${
        articles.map(articleCard).join("")
        ||
        `
          <div class="empty-state">
            <strong>
              No articles found.
            </strong>

            <p>
              Try another level or topic.
            </p>
          </div>
        `
      }
    </section>
  `);
}

function articleCard(
  article: LibraryArticle,
): string {
  return `
    <button
      class="article-card"
      data-article-id="${esc(article.id)}"
    >
      <div class="article-card-top">
        <span class="level-pill">
          ${esc(article.level)}
        </span>

        <span>
          ${article.readingTime} min
        </span>
      </div>

      <h3>
        ${esc(article.title)}
      </h3>

      <p>
        ${esc(article.topic)}
      </p>

      <span class="text-link">
        Read article →
      </span>
    </button>
  `;
}

function renderArticle(): string {
  const article =
    state.currentArticleId
      ? getLibraryArticles().find(
          (a) =>
            a.id === state.currentArticleId,
        )
      : undefined;

  if (!article) {
    return shell(`
      <div class="empty-state">
        <h2>
          Article not found
        </h2>

        <button
          class="primary-btn small"
          data-action="library"
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
      article.title,
      article.topic,
    )}

    <article class="reading-card">
      <div class="reading-meta">
        <span>
          ${article.readingTime} min read
        </span>

        <a
          href="${createGoogleTranslateUrl(
            article.content,
          )}"
          target="_blank"
          rel="noreferrer"
        >
          Google Translate
        </a>
      </div>

      <div class="reading-content">
        ${article.content
          .split(/\n+/)
          .map(
            (p) =>
              `<p>${esc(p)}</p>`,
          )
          .join("")}
      </div>

      <div class="vocab-inline">
        <h3>
          Key vocabulary
        </h3>

        <div class="word-list">
          ${article.vocabulary
            .map(
              (word) => `
                <button
                  class="word-chip"
                  data-word="${esc(word)}"
                >
                  ${esc(word)}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>

      <button
        class="primary-btn"
        data-action="completeArticle"
        data-article-id="${esc(article.id)}"
        ${completed ? "disabled" : ""}
      >
        ${
          completed
            ? "Completed ✓"
            : "Mark as completed +10 XP"
        }
      </button>
    </article>
  `);
}

function renderVocabulary(): string {
  const words =
    state.vocabulary;

  return shell(`
    ${pageHeader(
      "Learn",
      "Vocabulary",
      "Words you saved while reading.",
    )}

    ${
      words.length
        ? `
          <div class="vocabulary-list">
            ${words
              .map(
                (word) => `
                  <div class="vocabulary-row">
                    <strong>
                      ${esc(word.word)}
                    </strong>

                    <span>
                      ${esc(word.meaning)}
                    </span>

                    <button
                      class="icon-btn"
                      data-remove-word="${esc(
                        word.id,
                      )}"
                    >
                      Remove
                    </button>
                  </div>
                `,
              )
              .join("")}
          </div>
        `
        : `
          <div class="empty-state">
            <div class="empty-icon">
              🔖
            </div>

            <h2>
              Your vocabulary is empty
            </h2>

            <p>
              Open an article and tap words
              you want to remember.
            </p>

            <button
              class="primary-btn small"
              data-action="library"
            >
              Open Library
            </button>
          </div>
        `
    }
  `);
}

const practiceBank = [
  {
    q: "Choose the correct sentence.",
    a: [
      "She go to school every day.",
      "She goes to school every day.",
      "She going to school every day.",
      "She gone to school every day.",
    ],
    c: 1,
  },

  {
    q: "I have lived here ___ 2022.",
    a: [
      "for",
      "since",
      "during",
      "from",
    ],
    c: 1,
  },

  {
    q: "Choose the closest meaning of “improve”.",
    a: [
      "to get better",
      "to disappear",
      "to forget",
      "to stop",
    ],
    c: 0,
  },

  {
    q: "If I ___ more time, I would learn Chinese.",
    a: [
      "have",
      "had",
      "will have",
      "having",
    ],
    c: 1,
  },
];

function renderPractice(): string {
  const item =
    practiceBank[practiceIndex];

  return shell(`
    ${pageHeader(
      "Practice",
      "Practice",
      "Short exercises to strengthen grammar and vocabulary.",
    )}

    <div class="practice-card">
      <div class="practice-progress">
        <span>
          Question ${
            practiceIndex + 1
          } of ${practiceBank.length}
        </span>

        <span>
          ${state.practiceScore} correct
        </span>
      </div>

      <h2>
        ${esc(item.q)}
      </h2>

      <div class="answer-list">
        ${item.a
          .map(
            (answer, i) => {
              const stateClass =
                practiceAnswered
                  ? i === item.c
                    ? "correct"
                    : "wrong"
                  : "";

              return `
                <button
                  class="answer-option ${stateClass}"
                  data-answer-index="${i}"
                  ${
                    practiceAnswered
                      ? "disabled"
                      : ""
                  }
                >
                  ${esc(answer)}
                </button>
              `;
            },
          )
          .join("")}
      </div>

      ${
        practiceAnswered
          ? `
            <button
              class="primary-btn small"
              data-action="nextPractice"
            >
              ${
                practiceIndex ===
                practiceBank.length - 1
                  ? "Start again"
                  : "Next question"
              }
            </button>
          `
          : ""
      }
    </div>
  `);
}

function renderRooms(): string {
  const rooms =
    getAllRooms().filter(
      (room) =>
        room.status !== "ended",
    );

  return shell(`
    ${pageHeader(
      "Talk",
      "Rooms",
      "Simple conversation rooms — like Free4Talk, with DRE2learn safety controls.",
    )}

    <div class="rooms-toolbar">
      <button
        class="primary-btn small"
        data-action="newRoom"
      >
        Create room
      </button>

      <div class="room-note">
        Up to 8 participants per room
      </div>
    </div>

    <section class="room-grid">
      ${
        rooms.map(
          (room) => `
            <article class="room-card">
              <div class="room-card-head">
                <span class="level-pill">
                  ${esc(room.level)}
                </span>

                <span>
                  ${room.participantIds.length}/${room.maxParticipants}
                </span>
              </div>

              <h3>
                ${esc(room.title)}
              </h3>

              <p>
                ${esc(room.language)}
                ·
                ${esc(room.topic)}
              </p>

              <div class="room-tags">
                <span>
                  ${
                    room.type === "video"
                      ? "Video"
                      : "Audio"
                  }
                </span>

                <span>
                  ${esc(room.gender)}
                </span>
              </div>

              <button
                class="secondary-btn small"
                data-join-room="${esc(room.id)}"
              >
                Join room
              </button>
            </article>
          `,
        ).join("")
        ||
        `
          <div class="empty-state">
            <h2>
              No rooms yet
            </h2>

            <p>
              Create the first room and
              invite learners.
            </p>
          </div>
        `
      }
    </section>

    <div id="roomComposer"></div>
  `);
}

function roomComposer(): string {
  return `
    <div
      class="modal-backdrop"
      id="roomModal"
    >
      <div class="modal-card">
        <button
          class="modal-close"
          data-action="closeModal"
        >
          ×
        </button>

        <h2>
          Create a room
        </h2>

        <form
          id="roomForm"
          class="form-stack"
        >
          <label>
            Room title

            <input
              name="title"
              required
              maxlength="60"
              placeholder="English conversation"
            />
          </label>

          <label>
            Language

            <input
              name="language"
              required
              value="English"
            />
          </label>

          <label>
            Level

            <select name="level">
              ${LEVELS
                .map(
                  (l) =>
                    `<option>${l}</option>`,
                )
                .join("")}
            </select>
          </label>

          <label>
            Topic

            <select name="topic">
              <option>
                Reading
              </option>

              ${getLibraryTopics()
                .filter(
                  (t) =>
                    t !== "Reading",
                )
                .map(
                  (t) =>
                    `<option>${esc(
                      t,
                    )}</option>`,
                )
                .join("")}
            </select>
          </label>

          <label>
            Room type

            <select name="type">
              <option value="audio">
                Audio
              </option>

              <option value="video">
                Video
              </option>
            </select>
          </label>

          <label>
            Who can join

            <select name="gender">
              <option value="girls">
                Girls
              </option>

              <option value="boys">
                Boys
              </option>

              <option value="mixed">
                Mixed
              </option>
            </select>
          </label>

          <button
            class="primary-btn"
            type="submit"
          >
            Create room
          </button>
        </form>
      </div>
    </div>
  `;
}

function renderMessages(): string {
  const requests =
    getAllMessageRequests();

  const conversations =
    getAllConversations();

  const messages =
    getAllMessages();

  const uid =
    userId();

  const pending =
    requests.filter(
      (r) =>
        r.receiverId === uid &&
        r.status === "pending",
    ).length;

  const unread =
    messages.filter(
      (m) =>
        m.receiverId === uid &&
        !m.read,
    ).length;

  return shell(`
    ${pageHeader(
      "Connect",
      "Messages",
      "Private messaging opens only after both people accept the request.",
    )}

    <div class="message-summary">
      ${statCard(
        "Requests",
        pending,
        "Pending requests",
      )}

      ${statCard(
        "Unread",
        unread,
        "Unread messages",
      )}

      ${statCard(
        "Chats",
        conversations.filter(
          (c) =>
            c.participantIds.includes(
              uid,
            ),
        ).length,
        "Accepted conversations",
      )}
    </div>

    <div class="empty-state">
      <div class="empty-icon">
        ✉
      </div>

      <h2>
        Your messages
      </h2>

      <p>
        Message requests, accepted
        conversations, and unread
        messages will appear here.
      </p>
    </div>
  `);
}

function renderGames(): string {
  return shell(`
    ${pageHeader(
      "Practice",
      "Games",
      "Quick language games for rooms and individual practice.",
    )}

    <div class="game-grid">
      <button class="game-card">
        <span>🧩</span>

        <h3>
          Guess the word
        </h3>

        <p>
          Explain a word without saying it.
        </p>
      </button>

      <button class="game-card">
        <span>⏱</span>

        <h3>
          30 seconds
        </h3>

        <p>
          Keep talking until the timer ends.
        </p>
      </button>

      <button class="game-card">
        <span>❓</span>

        <h3>
          Reverse question
        </h3>

        <p>
          Answer only by asking a question.
        </p>
      </button>

      <button class="game-card">
        <span>🕵️</span>

        <h3>
          Mystery Card
        </h3>

        <p>
          Unexpected missions for your session.
        </p>
      </button>
    </div>
  `);
}

function renderProgress(): string {
  const stats =
    getProgressStats(state);

  const level =
    getLevelFromXp(
      state.totalXp,
    );

  return shell(`
    ${pageHeader(
      "Your journey",
      "Progress",
      "Track learning without exposing private conversations.",
    )}

    <div class="stats-grid">
      ${statCard(
        "Level",
        level,
        "Current CEFR progress",
      )}

      ${statCard(
        "XP",
        state.totalXp,
        "Total",
      )}

      ${statCard(
        "Streak",
        `${stats.currentStreak} days`,
        "Current",
      )}

      ${statCard(
        "Daily goal",
        `${stats.dailyGoalProgress}/${stats.dailyGoal}`,
        stats.dailyGoalCompleted
          ? "Completed"
          : "Keep going",
      )}
    </div>

    <section class="progress-panel">
      <h2>
        Level progress
      </h2>

      ${LEVELS
        .map(
          (l) => {
            const active =
              l === level;

            const percentage =
              l === level
                ? getLevelProgress(
                    state.totalXp,
                  )
                : LEVELS.indexOf(l) <
                    LEVELS.indexOf(level)
                  ? 100
                  : 0;

            return `
              <div class="level-row">
                <span
                  class="${
                    active
                      ? "active-level"
                      : ""
                  }"
                >
                  ${l}
                </span>

                <div class="progress-track">
                  <span
                    style="width:${percentage}%"
                  ></span>
                </div>
              </div>
            `;
          },
        )
        .join("")}
    </section>

    <section class="stats-grid">
      ${statCard(
        "Articles",
        state.articlesRead,
        "Completed",
      )}

      ${statCard(
        "Vocabulary",
        state.vocabularyLearned,
        "Learned",
      )}

      ${statCard(
        "Practice",
        state.practiceCompleted,
        "Sessions",
      )}

      ${statCard(
        "Rooms",
        state.roomsJoined,
        "Joined",
      )}
    </section>
  `);
}

function renderProfile(): string {
  const user =
    currentUser();

  if (!user) {
    return renderWelcomeScreen();
  }

  return shell(`
    ${pageHeader(
      "Account",
      "Profile",
      "Your DRE2learn learning identity.",
    )}

    <section class="profile-card">
      <div class="profile-avatar">
        ${avatarMarkup(
          user.avatar,
          150,
        )}
      </div>

      <div class="profile-main">
        <span class="level-pill">
          ${esc(
            getLevelFromXp(
              state.totalXp,
            ),
          )}
        </span>

        <h2>
          ${esc(
            user.name || "Learner",
          )}
        </h2>

        <p>
          ${esc(user.email)}
        </p>

        <div class="profile-stats">
          <span>
            <strong>
              ${state.totalXp}
            </strong>
            XP
          </span>

          <span>
            <strong>
              ${state.cardsCollected}
            </strong>
            cards
          </span>

          <span>
            <strong>
              ${state.roomsJoined}
            </strong>
            rooms
          </span>
        </div>
      </div>
    </section>

    <div class="profile-actions">
      <button
        class="secondary-btn"
        data-action="avatar"
      >
        Edit avatar
      </button>

      <button
        class="outline-btn"
        data-action="logout"
      >
        Log out
      </button>
    </div>
  `);
}

function renderAvatar(): string {
  const user =
    currentUser();

  const avatar =
    user?.avatar ??
    defaultAvatar;

  const colors = {
    skinTone: [
      ["light", "#F8D7C4"],
      ["fair", "#F1C6A8"],
      ["medium", "#D99A72"],
      ["tan", "#B9784F"],
      ["deep", "#75452F"],
    ],

    eyeColor: [
      ["brown", "#5A321F"],
      ["darkBrown", "#2E1A12"],
      ["blue", "#4A90D9"],
      ["green", "#4D8B62"],
      ["gray", "#69727D"],
    ],

    hairColor: [
      ["black", "#1E1B1A"],
      ["darkBrown", "#38251C"],
      ["brown", "#6B432D"],
      ["blonde", "#D9AE55"],
      ["auburn", "#8D4A32"],
    ],

    shirtColor: [
      ["orange", "#F47A32"],
      ["blue", "#4E83C4"],
      ["green", "#5C9B75"],
      ["purple", "#8468B4"],
      ["pink", "#D9829A"],
      ["yellow", "#D9B84A"],
      ["white", "#F5F3EF"],
      ["black", "#252525"],
    ],
  } as const;

  const optionGroup = (
    key: keyof typeof colors,
    title: string,
  ) => `
    <div class="avatar-option-group">
      <h3>
        ${title}
      </h3>

      <div class="swatch-row">
        ${colors[key]
          .map(
            ([value, color]) => `
              <button
                class="swatch ${
                  avatar[key] === value
                    ? "selected"
                    : ""
                }"
                style="--swatch:${color}"
                data-avatar-key="${key}"
                data-avatar-color="${value}"
                aria-label="${value}"
              ></button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;

  return shell(`
    ${pageHeader(
      "Identity",
      "Choose your avatar",
      "A simple 2D avatar — no profile photo required.",
    )}

    <section class="avatar-editor">
      <div class="avatar-preview">
        ${avatarMarkup(
          avatar,
          190,
        )}
      </div>

      <div class="avatar-options">
        ${optionGroup(
          "skinTone",
          "Skin",
        )}

        ${optionGroup(
          "eyeColor",
          "Eyes",
        )}

        ${optionGroup(
          "hairColor",
          "Hair color",
        )}

        <div class="avatar-option-group">
          <h3>
            Hair style
          </h3>

          <div class="choice-row">
            ${
              [
                "short",
                "medium",
                "long",
                "ponytail",
                "bob",
                "hijab",
              ]
                .map(
                  (v) => `
                    <button
                      class="choice-btn ${
                        avatar.hairStyle === v
                          ? "selected"
                          : ""
                      }"
                      data-avatar-key="hairStyle"
                      data-avatar-color="${v}"
                    >
                      ${v}
                    </button>
                  `,
                )
                .join("")
            }
          </div>
        </div>

        ${optionGroup(
          "shirtColor",
          "Top",
        )}

        <button
          class="primary-btn"
          data-action="saveAvatar"
        >
          Save avatar
        </button>
      </div>
    </section>
  `);
}

function renderLevelTest(): string {
  const question =
    levelTestQuestions[
      levelTestIndex
    ];

  if (!question) {
    return shell(`
      <div class="empty-state">
        <h2>
          Level test complete
        </h2>

        <button
          class="primary-btn small"
          data-action="home"
        >
          Continue
        </button>
      </div>
    `);
  }

  return shell(`
    ${pageHeader(
      "Assessment",
      "Level Test",
      "Progressive assessment from A1 to C2. Maximum 50 questions.",
    )}

    <div class="test-card">
      <div class="test-top">
        <span>
          Question ${
            levelTestIndex + 1
          } / ${
            Math.min(
              50,
              levelTestQuestions.length,
            )
          }
        </span>

        <span>
          ${esc(question.level)}
        </span>
      </div>

      ${
        question.passage
          ? `
            <div class="passage">
              ${esc(
                question.passage,
              )}
            </div>
          `
          : ""
      }

      <h2>
        ${esc(
          question.question,
        )}
      </h2>

      ${
        question.options?.length
          ? `
            <div class="answer-list">
              ${question.options
                .map(
                  (o) => `
                    <button
                      class="answer-option"
                      data-test-answer="${esc(
                        o,
                      )}"
                    >
                      ${esc(o)}
                    </button>
                  `,
                )
                .join("")}
            </div>
          `
          : `
            <textarea
              id="writingAnswer"
              class="text-area"
              placeholder="${esc(
                question.writingPrompt ||
                  "Write your answer",
              )}"
            ></textarea>

            <button
              class="primary-btn small"
              data-action="submitWriting"
            >
              Continue
            </button>
          `
      }
    </div>
  `);
}

function renderWelcomeScreen(): string {
  return welcomePageMarkup();
}

function render(): void {
  switch (state.page) {
    case "welcome":
      app.innerHTML =
        renderWelcomeScreen();
      break;

    case "auth":
      app.innerHTML =
        welcomePageMarkup();
      break;

    case "signup":
      app.innerHTML =
        signupPageMarkup();
      break;

    case "login":
      app.innerHTML =
        loginPageMarkup();
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

    default:
      app.innerHTML =
        renderWelcomeScreen();
  }

  bindEvents();
}

function bindEvents(): void {
  document
    .querySelectorAll<HTMLElement>(
      "[data-action]",
    )
    .forEach((el) => {
      el.addEventListener(
        "click",
        () =>
          handleAction(
            el.dataset.action || "",
            el,
          ),
      );
    });

  document
    .querySelectorAll<HTMLElement>(
      "[data-level]",
    )
    .forEach((el) => {
      el.addEventListener(
        "click",
        () => {
          const value =
            el.dataset.level;

          if (
            value === "ALL" ||
            LEVELS.includes(
              value as Level,
            )
          ) {
            state.selectedLibraryLevel =
              value as Level;

            persist();
            render();
          }
        },
      );
    });

  document
    .querySelector<HTMLSelectElement>(
      "#topicFilter",
    )
    ?.addEventListener(
      "change",
      (e) => {
        state.selectedTopic =
          (
            e.target as HTMLSelectElement
          ).value;

        persist();
        render();
      },
    );

  document
    .querySelectorAll<HTMLElement>(
      "[data-article-id]",
    )
    .forEach((el) => {
      el.addEventListener(
        "click",
        () => {
          state.currentArticleId =
            el.dataset.articleId ||
            null;

          navigate("article");
        },
      );
    });

  document
    .querySelectorAll<HTMLElement>(
      "[data-word]",
    )
    .forEach((el) => {
      el.addEventListener(
        "click",
        () => {
          const word =
            el.dataset.word || "";

          if (!word) {
            return;
          }

          if (
            !state.vocabulary.some(
              (v) =>
                v.word.toLowerCase() ===
                word.toLowerCase(),
            )
          ) {
            const item: VocabularyWord =
              {
                id: `vocab-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`,

                word,

                meaning:
                  "Saved from Library",

                example: "",

                articleId:
                  state.currentArticleId ||
                  "",

                savedAt:
                  new Date().toISOString(),
              };

            state =
              addVocabularyWord(
                state,
              );

            state.vocabulary = [
              ...state.vocabulary,
              item,
            ];

            persist();
            render();
          }
        },
      );
    });

  document
    .querySelectorAll<HTMLElement>(
      "[data-remove-word]",
    )
    .forEach((el) => {
      el.addEventListener(
        "click",
        () => {
          state.vocabulary =
            state.vocabulary.filter(
              (v) =>
                v.id !==
                el.dataset.removeWord,
            );

          persist();
          render();
        },
      );
    });

  document
    .querySelectorAll<HTMLElement>(
      "[data-answer-index]",
    )
    .forEach((el) => {
      el.addEventListener(
        "click",
        () => {
          if (practiceAnswered) {
            return;
          }

          const item =
            practiceBank[
              practiceIndex
            ];

          if (
            Number(
              el.dataset.answerIndex,
            ) === item.c
          ) {
            state.practiceScore += 1;
          }

          practiceAnswered = true;

          persist();
          render();
        },
      );
    });

  document
    .querySelectorAll<HTMLElement>(
      "[data-test-answer]",
    )
    .forEach((el) => {
      el.addEventListener(
        "click",
        () =>
          submitTestAnswer(
            el.dataset.testAnswer ||
              "",
          ),
      );
    });

  document
    .querySelectorAll<HTMLElement>(
      "[data-avatar-key]",
    )
    .forEach((el) => {
      el.addEventListener(
        "click",
        () => {
          const key =
            el.dataset.avatarKey as keyof typeof defaultAvatar;

          const value =
            el.dataset.avatarColor;

          if (
            !key ||
            !value ||
            !state.user
          ) {
            return;
          }

          state.user.avatar = {
            ...state.user.avatar,
            [key]: value,
          };

          persist();
          render();
        },
      );
    });

  document
    .querySelectorAll<HTMLElement>(
      "[data-join-room]",
    )
    .forEach((el) => {
      el.addEventListener(
        "click",
        () =>
          joinRoom(
            el.dataset.joinRoom ||
              "",
          ),
      );
    });

  document
    .querySelector<HTMLFormElement>(
      "#roomForm",
    )
    ?.addEventListener(
      "submit",
      (e) => {
        e.preventDefault();

        const fd =
          new FormData(
            e.currentTarget as HTMLFormElement,
          );

        if (!state.user) {
          return;
        }

        const room =
          createAndSaveRoom({
            title: String(
              fd.get("title") ||
                "",
            ).trim(),

            language: String(
              fd.get("language") ||
                "English",
            ),

            level: String(
              fd.get("level") ||
                "A1",
            ) as Level,

            topic: String(
              fd.get("topic") ||
                "Reading",
            ),

            type: String(
              fd.get("type") ||
                "audio",
            ) as RoomType,

            gender: String(
              fd.get("gender") ||
                "mixed",
            ) as RoomGender,

            hostId: userId(),

            maxParticipants: 8,
          });

        state.joinedRoomId =
          room.id;

        markRoomJoined(state);

        persist();
        render();
      },
    );

  document
    .querySelector<HTMLFormElement>(
      "#signupForm",
    )
    ?.addEventListener(
      "submit",
      handleSignup,
    );

  document
    .querySelector<HTMLFormElement>(
      "#loginForm",
    )
    ?.addEventListener(
      "submit",
      handleLogin,
    );
}

function handleAction(
  action: string,
  element: HTMLElement,
): void {
  switch (action) {
    case "start":
    case "auth":
      navigate("signup");
      break;

    case "welcome":
      navigate("welcome");
      break;

    case "signup":
      navigate("signup");
      break;

    case "login":
      navigate("login");
      break;

    case "home":
    case "library":
    case "vocabulary":
    case "practice":
    case "rooms":
    case "messages":
    case "games":
    case "progress":
    case "profile":
      navigate(action as Page);
      break;

    case "avatar":
      navigate("avatar");
      break;

    case "levelTest":
      levelTestIndex = 0;

      levelTestAnswers = [];

      adaptiveState =
        createAdaptiveState();

      navigate("levelTest");
      break;

    case "saveAvatar":
      if (state.user) {
        state.user.avatar = {
          ...state.user.avatar,
        };

        persist();
      }

      navigate("home");
      break;

    case "completeArticle": {
      const id =
        element.dataset.articleId;

      if (
        !id ||
        state.completedArticles.includes(
          id,
        )
      ) {
        return;
      }

      state =
        markArticleCompleted(
          state,
          id,
        );

      persist();
      render();
      break;
    }

    case "nextPractice":
      practiceIndex =
        (practiceIndex + 1) %
        practiceBank.length;

      practiceAnswered = false;

      if (practiceIndex === 0) {
        state =
          markPracticeCompleted(
            state,
          );
      }

      persist();
      render();
      break;

    case "newRoom":
      app
        .querySelector(
          "#roomComposer",
        )
        ?.replaceWith(
          document
            .createRange()
            .createContextualFragment(
              roomComposer(),
            ),
        );

      bindEvents();
      break;

    case "closeModal":
      document
        .querySelector(
          "#roomModal",
        )
        ?.remove();

      break;

    case "logout":
      clearStoredState();

      state =
        createDefaultState();

      navigate("welcome");
      break;

    case "submitWriting":
      submitTestAnswer(
        (
          document.querySelector(
            "#writingAnswer",
          ) as HTMLTextAreaElement
        )?.value || "",
      );

      break;
  }
}

function handleSignup(
  event: SubmitEvent,
): void {
  event.preventDefault();

  const form =
    event.currentTarget as HTMLFormElement;

  const fd =
    new FormData(form);

  const name =
    String(
      fd.get("name") || "",
    ).trim();

  const email =
    String(
      fd.get("email") || "",
    ).trim();

  const level =
    String(
      fd.get("level") || "A1",
    ) as Level;

  if (
    !name ||
    !email ||
    !LEVELS.includes(level)
  ) {
    return;
  }

  const user: UserProfile = {
    name,

    email,

    countryCode: "IQ",

    level,

    avatar: {
      ...defaultAvatar,
    },

    xp: 0,

    identityCard: null,

    levelTestCompleted: false,

    levelTestResult: null,

    isVip: false,
  };

  state = {
    ...createDefaultState(),

    page: "avatar",

    user,

    isAuthenticated: true,
  };

  persist();
  render();
}

function handleLogin(
  event: SubmitEvent,
): void {
  event.preventDefault();

  const form =
    event.currentTarget as HTMLFormElement;

  const fd =
    new FormData(form);

  const email =
    String(
      fd.get("email") || "",
    ).trim();

  if (!email) {
    return;
  }

  const existing =
    loadStoredState();

  if (existing?.user) {
    state = {
      ...existing,
      page: "home",
      isAuthenticated: true,
    };
  } else {
    state = {
      ...createDefaultState(),

      page: "home",

      user: {
        name:
          email.split("@")[0] ||
          "Learner",

        email,

        countryCode: "IQ",

        level: "A1",

        avatar: {
          ...defaultAvatar,
        },

        xp: 0,

        identityCard: null,

        levelTestCompleted: false,

        levelTestResult: null,
      },

      isAuthenticated: true,
    };
  }

  persist();
  render();
}

function submitTestAnswer(
  answer: string,
): void {
  const question =
    levelTestQuestions[
      levelTestIndex
    ];

  if (!question) {
    return;
  }

  const correct =
    question.correctAnswer
      ? answer ===
        question.correctAnswer
      : answer.trim().length > 0;

  levelTestAnswers.push({
    questionId: question.id,

    answer,

    isCorrect: correct,

    pointsEarned: correct
      ? question.points
      : 0,
  });

  adaptiveState =
    recordAdaptiveAnswer(
      adaptiveState,
      question,
      answer,
    );

  const finish =
    shouldFinishTest(
      adaptiveState,
    );

  if (
    finish ||
    adaptiveState.answeredQuestionIds
      .length >= 50
  ) {
    const result =
      calculateLevelTestResult(
        adaptiveState,
      );

    const skillValues =
      Object.values(
        result.skillScores,
      );

    const score =
      skillValues.reduce(
        (sum, item) =>
          sum + item.correct,
        0,
      );

    const total =
      skillValues.reduce(
        (sum, item) =>
          sum + item.total,
        0,
      );

    if (state.user) {
      state.user.level =
        result.overallLevel;

      state.user.levelTestCompleted =
        true;

      state.user.levelTestResult =
        null;
    }

    state.levelTestScore =
      score;

    state.levelTestTotal =
      total;

    addXP(state, 50);

    persist();

    navigate("home");

    return;
  }

  levelTestIndex += 1;

  render();
}

function joinRoom(
  roomId: string,
): void {
  if (
    !state.user ||
    !roomId
  ) {
    return;
  }

  const room =
    joinStoredRoom(
      roomId,
      userId(),
      state.user.avatar.gender,
    );

  if (!room) {
    return;
  }

  state.joinedRoomId =
    room.id;

  state =
    markRoomJoined(state);

  persist();
  render();
}

render();