# Barmenti website

The public website of Barmenti (ברמנתי), a Hebrew cocktail-recipe app for bartenders. For now it
holds what the app stores require: the privacy policy, the terms of use, and how to delete an
account. Built by GitHub Pages (Jekyll) from this repository; no local tooling needed.

Live at <https://oriamram.github.io/barmenti-site/>.

| Page                 | File                | Linked from                                   |
| -------------------- | ------------------- | --------------------------------------------- |
| `/`                  | `index.html`        | -                                             |
| `/privacy/`          | `privacy.md`        | the app (settings, sign-up), both store pages |
| `/terms/`            | `terms.md`          | the app (settings, sign-up)                   |
| `/delete-account/`   | `delete-account.md` | Google Play (account deletion URL)            |

- **Edit a page:** change its Markdown and push; GitHub Pages rebuilds within a minute or two. When
  a policy changes, update its "עודכן לאחרונה" date.
- **Look:** one shared template (`_layouts/default.html`) and stylesheet (`assets/style.css`), in
  the app's colors. The font is Assistant (Google Fonts); the app's Discovery font is licensed for
  the app only.
- **Contact address:** `contact_email` in `_config.yml` (the footer) and in the pages themselves.
- **Own domain later:** add a `CNAME` file with the domain, set `baseurl: ""` in `_config.yml`, and
  change `SITE` in the app's `src/config/links.ts`.
- The page addresses are linked from the app and the store listings: don't rename them.
