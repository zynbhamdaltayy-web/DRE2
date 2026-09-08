import type { Page } from "../types";
import { logoMarkup } from "./logo";

interface SidebarItem {
  page: Page;
  label: string;
  icon: string;
}

const mainItems: SidebarItem[] = [
  {
    page: "home",
    label: "Home",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    `,
  },

  {
    page: "library",
    label: "Library",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5Z" />
        <path d="M4 4.5v17" />
        <path d="M8 6h8" />
        <path d="M8 10h7" />
      </svg>
    `,
  },

  {
    page: "vocabulary",
    label: "Vocabulary",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5Z" />
        <path d="M5 4.5v17" />
        <path d="M9 7h7" />
        <path d="M9 11h6" />
        <path d="M9 15h7" />
      </svg>
    `,
  },

  {
    page: "practice",
    label: "Practice",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h14v16H5z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
    `,
  },

  {
    page: "rooms",
    label: "Rooms",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5h-5l-4 3v-3H6.5A2.5 2.5 0 0 1 4 14.5z" />
        <path d="M8 9h8" />
        <path d="M8 12h5" />
      </svg>
    `,
  },

  {
    page: "games",
    label: "Games",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 8h10a4 4 0 0 1 3.7 5.5l-1.5 3.7a2.5 2.5 0 0 1-4.5.3L13.5 15h-3l-1.2 2.5a2.5 2.5 0 0 1-4.5-.3l-1.5-3.7A4 4 0 0 1 7 8Z" />
        <path d="M7.5 11v4" />
        <path d="M5.5 13h4" />
        <circle cx="16.5" cy="12" r="1" />
        <circle cx="18.5" cy="14" r="1" />
      </svg>
    `,
  },

  {
    page: "progress",
    label: "Progress",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 20V10" />
        <path d="M12 20V5" />
        <path d="M19 20V8" />
      </svg>
    `,
  },
];

const secondaryItems: SidebarItem[] = [
  {
    page: "profile",
    label: "Profile",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
      </svg>
    `,
  },

  {
    page: "settings",
    label: "Settings",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 0 0 12 8.5Z" />
        <path d="m19 13 .1-1-.1-1 2-1.5-2-3.5-2.3.9a8 8 0 0 0-1.7-1L14.7 3h-5.4l-.3 2.9a8 8 0 0 0-1.7 1L5 6l-2 3.5L5 11a8 8 0 0 0 0 2l-2 1.5L5 18l2.3-.9a8 8 0 0 0 1.7 1l.3 2.9h5.4l.3-2.9a8 8 0 0 0 1.7-1L19 18l2-3.5Z" />
      </svg>
    `,
  },

  {
    page: "updates",
    label: "Updates",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
        <path d="M4 5.5v16" />
        <path d="M8 7h8" />
        <path d="M8 11h7" />
        <path d="M8 15h5" />
      </svg>
    `,
  },
];

export function sidebarMarkup(
  currentPage: Page,
  compact = false,
): string {
  return `
    <aside
      class="
        app-sidebar
        ${compact ? "app-sidebar-compact" : ""}
      "
      data-sidebar
    >
      <div class="sidebar-brand">
        ${logoMarkup(compact)}
      </div>

      <nav
        class="sidebar-navigation"
        aria-label="Main navigation"
      >
        <div class="sidebar-section">
          ${mainItems
            .map((item) =>
              navigationItemMarkup(
                item,
                currentPage,
              ),
            )
            .join("")}
        </div>

        <div class="sidebar-divider"></div>

        <div class="sidebar-section">
          ${secondaryItems
            .map((item) =>
              navigationItemMarkup(
                item,
                currentPage,
              ),
            )
            .join("")}
        </div>
      </nav>

      <div class="sidebar-footer">
        <button
          class="sidebar-help-button"
          type="button"
          data-action="help"
          title="Help"
        >
          <span class="sidebar-item-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.8.9-1.9 1.2-1.9 2.8" />
              <circle cx="12" cy="16.5" r=".8" fill="currentColor" stroke="none" />
            </svg>
          </span>

          <span class="sidebar-item-label">
            Help
          </span>
        </button>
      </div>
    </aside>
  `;
}

function navigationItemMarkup(
  item: SidebarItem,
  currentPage: Page,
): string {
  const active =
    currentPage === item.page;

  return `
    <button
      type="button"
      class="
        sidebar-navigation-item
        ${active ? "active" : ""}
      "
      data-page="${item.page}"
      aria-current="${
        active ? "page" : "false"
      }"
      title="${item.label}"
    >
      <span class="sidebar-item-icon">
        ${item.icon}
      </span>

      <span class="sidebar-item-label">
        ${item.label}
      </span>
    </button>
  `;
}