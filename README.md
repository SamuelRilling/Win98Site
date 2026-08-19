# Windows 98 Portfolio Template

A nostalgic Windows 98 desktop portfolio you can edit **entirely in the browser** with GitHub Codespaces and deploy automatically to GitHub Pages. No local Node.js, npm, or editor installation is required for the main workflow.

You fill in **one file** — `site.config.ts` — and push. The site handles the retro desktop UI, windows, taskbar, Start menu, and static export for you.

> Live demo: `https://<your-username>.github.io/<your-repo>`

## Why this template

- **Browser-first workflow:** edit in Codespaces, preview in the browser, commit from GitHub.
- **No local software needed:** the repo is ready to work with from a browser-only machine.
- **Automatic deployment:** every push to `main` builds and deploys through GitHub Actions.
- **One-file content editing:** most of the site lives in `site.config.ts`.
- **Static hosting:** no server, no database, no extra infrastructure.
- **Still supports local development:** if you prefer a local workflow, `npm install` and `npm run dev` still work.

## Fastest way to use it

### Option A: browser-only workflow

1. Open the repository in GitHub.
2. Click **Code → Codespaces → Create codespace on main**.
3. Wait for dependencies to install automatically.
4. Run:
   ```bash
   npm run dev
   ```
5. Open the forwarded port in your browser.
6. Edit `site.config.ts`, save, preview, commit, and push.

### Option B: local workflow

If you prefer working on your own machine:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What to edit first

Almost all content is driven by `site.config.ts`.

| What you want to change | Where to edit |
|---|---|
| Your name, role, tab title, meta description | `identity` |
| Welcome dialog copy and shortcuts | `welcome` |
| Bio and skill cards | `about` |
| Projects | `projects` |
| Contact links | `contacts` |
| External portfolio and résumé link | `portfolio` |
| Help window text | `help` |
| Shut Down screen message | `shutdown` |
| Wallpaper | `theme.wallpaper` |
| Which windows appear | `sections` |
| Window titles, icons, and size/position | `windows` |

## Adding your own content

### Projects

Copy one object in `projects`, update the text, and replace the image file in `public/`.

Example:

```ts
{
  title: "My Project",
  url: "https://example.com",
  image: "/my-project.png",
  tags: ["React", "TypeScript"],
  blurb: "Short summary of what it does.",
  role: "Solo builder",
  result: "Outcome or proof point.",
}
```

### Résumé

Place a PDF at `public/resume.pdf` or point `portfolio.resumePath` to another URL.

### Images

Any image used by the config should live in `public/` and be referenced with a root path like:

```ts
"/my-image.png"
```

## Deployment

This repo is set up for GitHub Pages already.

1. Push to GitHub.
2. Go to **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Push to `main` again and the workflow will publish the site automatically.

The workflow derives the GitHub Pages base path from the repository name, so project sites work correctly without extra setup.

## Technical notes

- Next.js 16 with static export
- React 19
- TypeScript
- Tailwind CSS v4
- No backend

## Credits and license

- Icons by [win98icons.alexmeub.com](https://win98icons.alexmeub.com).
- Released under the MIT License. Update the copyright holder in `LICENSE` to your name.
This branch (`Samuelrilling-cline`) is a copy of the `Samuel-Rilling` branch and serves as a test playground for Cline to edit the project via the Cline AI coding agent. Changes made here are experimental and intended for demonstrating AI-assisted development workflows.
