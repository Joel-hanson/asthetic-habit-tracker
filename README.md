# Aesthetic Habit Tracker

A clean and minimalist habit tracking application designed to help you build effective daily routines and document personal highlights.

## Features

- **Visual Habit Tracking** - Track multiple habits using an intuitive calendar grid
- **Customizable Colors** - Personalize each habit with distinct color coding
- **Privacy First** - All user data is stored locally in your browser
- **Responsive Design** - Optimized for both desktop and mobile devices
- **Installable PWA** - Add to your home screen and use offline
- **Share Progress** - Export and share your habit grid as an image

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## How to Use

### Adding a Habit
1. Click the **"Add"** button in the Habits section.
2. Enter the name of your habit (for example: "Morning Yoga", "Read 30 min").
3. Choose a color to help identify the habit.
4. Begin tracking.

### Tracking Daily
- Click any day's checkbox to mark a habit as complete.
- Navigate between months using the arrow buttons.
- Use the **"Today"** button to return to the current month.

## Deployment

### Deploy to GitHub Pages (subpath)

This app can live on your GitHub profile site as a subpath, for example:

`https://joel-hanson.github.io/asthetic-habit-tracker/`

Your main profile site (`https://joel-hanson.github.io/`) stays at the root. GitHub serves each repository as a project site under `/repository-name/` automatically.

**One-time setup**

1. Push this repo to GitHub.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Merge or push to `main`. The workflow in `.github/workflows/deploy-github-pages.yml` builds and deploys the static export.

**Local preview of the Pages build**

```bash
GITHUB_PAGES=true npm run build:pages
npx serve out
# Open http://localhost:3000/asthetic-habit-tracker/
```

**Notes**

- The subpath (`/asthetic-habit-tracker`) must match the GitHub repository name. Change `GITHUB_PAGES_BASE_PATH` in `lib/site.ts` if you rename the repo.
- PWA install is disabled on GitHub Pages so a service worker does not interfere with your root profile site.
- Use `npm run build` (without `GITHUB_PAGES`) for Vercel or other full Next.js hosting.

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Build for production
npm run build
npm start
```

## License

[MIT License](LICENSE) — Free for personal and commercial use.

## Acknowledgments

This project is built with modern web technologies and inspired by the principle of simple, effective habit tracking.
