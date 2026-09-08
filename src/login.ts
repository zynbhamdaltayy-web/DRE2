import { logoMarkup } from "../components/logo";

export function loginPageMarkup(): string {
  return `
    <main class="public-page form-page">
      <div class="form-page-container">

        <header class="form-page-header">
          ${logoMarkup()}
        </header>

        <section class="form-card">

          <button
            type="button"
            class="back-button"
            data-page="auth"
          >
            ← Back
          </button>

          <div class="form-header">
            <span class="step-label">
              Welcome back
            </span>

            <h1>
              Log in to DRE2learn
            </h1>

            <p>
              Continue your English learning journey.
            </p>
          </div>

          <form
            id="login-form"
            class="dre-form"
          >

            <div class="form-field">
              <label for="login-email">
                Email
              </label>

              <input
                id="login-email"
                name="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div class="form-field">
              <label for="login-name">
                Name
              </label>

              <input
                id="login-name"
                name="name"
                type="text"
                autocomplete="name"
                placeholder="Your name"
                required
              />
            </div>

            <button
              type="submit"
              class="primary-button full-width"
            >
              Continue
            </button>

          </form>

          <p class="form-note">
            Your learning data is stored locally
            in this version of DRE2learn.
          </p>

          <p class="form-switch">
            Don't have an account?

            <button
              type="button"
              class="inline-button"
              data-page="signup"
            >
              Create one
            </button>
          </p>

        </section>
      </div>
    </main>
  `;
}