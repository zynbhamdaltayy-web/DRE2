import { logoMarkup } from "../components/logo";

export function signupPageMarkup(): string {
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
              Step 1 of 2
            </span>

            <h1>
              Create your account
            </h1>

            <p>
              Tell us a little about yourself.
            </p>
          </div>

          <form
            id="signup-form"
            class="dre-form"
          >

            <div class="form-field">
              <label for="signup-name">
                Name
              </label>

              <input
                id="signup-name"
                name="name"
                type="text"
                autocomplete="name"
                placeholder="Your name"
                required
                minlength="2"
              />
            </div>

            <div class="form-field">
              <label for="signup-email">
                Email
              </label>

              <input
                id="signup-email"
                name="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div class="form-field">
              <label for="signup-level">
                English level
              </label>

              <select
                id="signup-level"
                name="level"
                required
              >
                <option value="A1">
                  A1 — Beginner
                </option>

                <option value="A2">
                  A2 — Elementary
                </option>

                <option value="B1">
                  B1 — Intermediate
                </option>

                <option value="B2">
                  B2 — Upper intermediate
                </option>

                <option value="C1">
                  C1 — Advanced
                </option>

                <option value="C2">
                  C2 — Proficient
                </option>
              </select>
            </div>

            <button
              type="submit"
              class="primary-button full-width"
            >
              Continue
            </button>

          </form>

          <p class="form-switch">
            Already have an account?

            <button
              type="button"
              class="inline-button"
              data-page="login"
            >
              Log in
            </button>
          </p>

        </section>
      </div>
    </main>
  `;
}