let toastTimer: number | undefined;

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
): void {
  const existing =
    document.querySelector(
      ".dre-toast",
    );

  existing?.remove();

  const toast =
    document.createElement("div");

  toast.className = `dre-toast dre-toast-${type}`;

  toast.innerHTML = `
    <span class="dre-toast-icon">
      ${
        type === "success"
          ? "✓"
          : type === "error"
            ? "!"
            : "i"
      }
    </span>

    <span class="dre-toast-message">
      ${escapeToastText(message)}
    </span>
  `;

  document.body.appendChild(toast);

  window.clearTimeout(toastTimer);

  toastTimer = window.setTimeout(() => {
    toast.classList.add("dre-toast-hide");

    window.setTimeout(() => {
      toast.remove();
    }, 220);
  }, 2800);
}

function escapeToastText(
  value: string,
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}