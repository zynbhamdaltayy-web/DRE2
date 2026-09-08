export function openModal(
  content: string,
  options?: {
    title?: string;
    className?: string;
  },
): void {
  closeModal();

  const overlay =
    document.createElement("div");

  overlay.className =
    "dre-modal-overlay";

  overlay.innerHTML = `
    <div
      class="dre-modal ${
        options?.className ?? ""
      }"
      role="dialog"
      aria-modal="true"
    >
      <div class="dre-modal-header">
        ${
          options?.title
            ? `<h2>${escapeHtml(
                options.title,
              )}</h2>`
            : "<span></span>"
        }

        <button
          class="dre-modal-close"
          type="button"
          aria-label="Close"
          data-close-modal
        >
          ×
        </button>
      </div>

      <div class="dre-modal-content">
        ${content}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener(
    "click",
    (event) => {
      const target =
        event.target as HTMLElement;

      if (
        target === overlay ||
        target.closest(
          "[data-close-modal]",
        )
      ) {
        closeModal();
      }
    },
  );

  document.body.classList.add(
    "modal-open",
  );
}

export function closeModal(): void {
  document
    .querySelector(
      ".dre-modal-overlay",
    )
    ?.remove();

  document.body.classList.remove(
    "modal-open",
  );
}

function escapeHtml(
  value: string,
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}