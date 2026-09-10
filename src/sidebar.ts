import type { Page } from "./types";

export interface SidebarItem {
  id: Page;
  label: string;
  icon: string;
}

export const sidebarItems: SidebarItem[] = [
  {
    id: "home",
    label: "Home",
    icon: "⌂",
  },
  {
    id: "rooms",
    label: "Rooms",
    icon: "◉",
  },
  {
    id: "messages",
    label: "Messages",
    icon: "♡",
  },
  {
    id: "library",
    label: "Library",
    icon: "▤",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    icon: "A",
  },
  {
    id: "practice",
    label: "Practice",
    icon: "✓",
  },
  {
    id: "games",
    label: "Games",
    icon: "♟",
  },
  {
    id: "progress",
    label: "Progress",
    icon: "↗",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "◯",
  },
];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function sidebarMarkup(currentPage: Page): string {
  return `
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <button
          class="sidebar-logo-button"
          data-page="home"
          aria-label="DRE2learn Home"
        >
          <span class="sidebar-logo-mark">🎓</span>
          <span class="sidebar-logo-text">DRE2learn</span>
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Main navigation">
        ${sidebarItems
          .map(
            (item) => `
              <button
                class="sidebar-nav-item ${
                  currentPage === item.id ? "active" : ""
                }"
                data-page="${escapeHtml(item.id)}"
                type="button"
                aria-current="${
                  currentPage === item.id ? "page" : "false"
                }"
              >
                <span class="sidebar-nav-icon" aria-hidden="true">
                  ${escapeHtml(item.icon)}
                </span>
                <span class="sidebar-nav-label">
                  ${escapeHtml(item.label)}
                </span>
              </button>
            `,
          )
          .join("")}
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-footer-line"></div>
        <p class="sidebar-footer-text">
          Learn · Practice · Grow
        </p>
      </div>
    </aside>

    <nav class="mobile-bottom-nav" aria-label="Mobile navigation">
      ${sidebarItems
        .slice(0, 5)
        .map(
          (item) => `
            <button
              class="mobile-nav-item ${
                currentPage === item.id ? "active" : ""
              }"
              data-page="${escapeHtml(item.id)}"
              type="button"
              aria-current="${
                currentPage === item.id ? "page" : "false"
              }"
            >
              <span class="mobile-nav-icon" aria-hidden="true">
                ${escapeHtml(item.icon)}
              </span>
              <span class="mobile-nav-label">
                ${escapeHtml(item.label)}
              </span>
            </button>
          `,
        )
        .join("")}
    </nav>
  `;
}