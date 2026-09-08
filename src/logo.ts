export function logoMarkup(
  compact = false,
): string {
  return `
    <div
      class="brand-logo ${
        compact ? "brand-logo-compact" : ""
      }"
      aria-label="DRE2learn"
    >
      <svg
        class="brand-logo-icon"
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <path
          d="M10 21
             L32 12
             L54 21
             L32 30
             Z"
          fill="currentColor"
        />

        <path
          d="M17 26
             L17 38
             C25 43 39 43 47 38
             L47 26
             L32 33
             Z"
          fill="currentColor"
          opacity="0.92"
        />

        <path
          d="M54 21
             L54 36"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
        />

        <circle
          cx="54"
          cy="39"
          r="3"
          fill="currentColor"
        />
      </svg>

      ${
        compact
          ? ""
          : `<span class="brand-logo-text">DRE2learn</span>`
      }
    </div>
  `;
}