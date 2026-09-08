import { logoMarkup } from "../components/logo";

export function authPageMarkup(): string {
  return `
    <main class="public-page auth-page">
      <div class="auth-container">

        <div class="auth-brand">
          ${logoMarkup()}
        </div>

        <section class="auth-card">
          <div class="auth-card-header">
            <span class="eyebrow">
              Welcome
            </span>

            <h1>
              Start learning English
            </h1>

            <p>
              Create an account or continue with
              your existing account.
            </p>
          </div>

          <div class="auth-choice-grid">

            <button
              type="button"
              class="auth-choice"
              data-page="signup"
            >
              <span class="auth-choice-icon">
                +
              </span>

              <span class="auth-choice-content">
                <strong>
                  Create an account
                </strong>

                <small>
                  Start your DRE2learn journey
                </small>
              </span>

              <span class="auth-choice-arrow">
                →
              </span>
            </button>

            <button
              type="button"
              class="auth-choice"
              data-page="login"
            >
              <span class="auth-choice-icon">
                →
              </span>

              <span class="auth-choice-content">
                <strong>
                  Log in
                </strong>

                <small>
                  Continue where you left off
                </small>
              </span>

              <span class="auth-choice-arrow">
                →
              </span>
            </button>

          </div>

          <button
            type="button"
            class="text-button auth-back"
            data-page="welcome"
          >
            ← Back
          </button>
        </section>

      </div>
    </main>
  `;
}