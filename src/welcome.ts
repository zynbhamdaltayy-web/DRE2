import { logoMarkup } from "./logo";

export function welcomePageMarkup(): string {
  return `
    <main class="public-page welcome-page">
      <div class="public-page-inner">
        <header class="public-header">
          ${logoMarkup()}
        </header>

        <section class="welcome-hero">
          <div class="welcome-copy">
            <span class="eyebrow">
              Learn. Practice. Speak.
            </span>

            <h1>
              Improve your English,
              <span>your way.</span>
            </h1>

            <p>
              DRE2learn gives you a simple place to read,
              practice, build vocabulary, play, and speak
              with other English learners.
            </p>

            <div class="welcome-actions">
              <button
                type="button"
                class="primary-button large-button"
                data-page="signup"
              >
                Get started
              </button>

              <button
                type="button"
                class="secondary-button large-button"
                data-page="login"
              >
                I already have an account
              </button>
            </div>

            <div class="welcome-features">
              <div class="welcome-feature">
                <span class="feature-icon">📖</span>
                <span>Read</span>
              </div>

              <div class="welcome-feature">
                <span class="feature-icon">✍️</span>
                <span>Practice</span>
              </div>

              <div class="welcome-feature">
                <span class="feature-icon">💬</span>
                <span>Speak</span>
              </div>

              <div class="welcome-feature">
                <span class="feature-icon">🎮</span>
                <span>Play</span>
              </div>
            </div>
          </div>

          <div class="welcome-visual">
            <div class="welcome-card welcome-card-main">
              <div class="welcome-card-top">
                <span class="welcome-card-label">
                  Your English journey
                </span>

                <span class="welcome-card-level">
                  A1 → C2
                </span>
              </div>

              <div class="welcome-learning-preview">
                <div class="learning-preview-icon">
                  A
                </div>

                <div>
                  <strong>
                    Learn at your level
                  </strong>

                  <p>
                    Articles, practice and vocabulary
                  </p>
                </div>
              </div>

              <div class="welcome-learning-preview">
                <div class="learning-preview-icon">
                  💬
                </div>

                <div>
                  <strong>
                    Speak with learners
                  </strong>

                  <p>
                    Join real English-speaking rooms
                  </p>
                </div>
              </div>

              <div class="welcome-learning-preview">
                <div class="learning-preview-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Track your progress
                  </strong>

                  <p>
                    See what you have learned
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer class="public-footer">
          <span>
            DRE2learn
          </span>

          <span>
            Learn English simply.
          </span>
        </footer>
      </div>
    </main>
  `;
}