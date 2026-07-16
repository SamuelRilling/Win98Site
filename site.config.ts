// ─────────────────────────────────────────────────────────────────────────────
//  site.config.ts — EDIT THIS FILE to make the portfolio yours.
//
//  This is the single source of truth for all content. You should not need to
//  touch the React components for the common case. See README.md for a guide.
//
//  The demo content below belongs to a fictional person ("Riley Quinn"). Replace
//  every value with your own. Placeholders like "yourusername" and the
//  ".example" domain are meant to be swapped out.
// ─────────────────────────────────────────────────────────────────────────────

/** Every window the desktop knows how to render. Reorder/disable via `sections`. */
export type WindowKey =
  | "hero"
  | "portfolio"
  | "projects"
  | "about"
  | "documents"
  | "help"
  | "computer"
  | "recycle"

export type WindowMeta = {
  title: string
  /** Any image URL; the win98icons.alexmeub.com set is used throughout. */
  icon: string
  /** Opening position and size in pixels (clamped to the viewport on mobile). */
  initial: { x: number; y: number; w: number; h: number }
}

export type Project = {
  title: string
  url: string
  /** Path under public/ (e.g. "/my-shot.png"), prefixed with basePath at runtime. */
  image: string
  tags: string[]
  blurb: string
  role: string
  result: string
}

export type ContactLink = { label: string; href: string; icon: string }
export type Skill = { title: string; description: string }
export type WelcomeLinkColor = "blue" | "red" | "green" | "yellow"

export type SiteConfig = {
  identity: { name: string; role: string; metaTitle: string; metaDescription: string }
  /** Optional desktop wallpaper: a URL under public/ ("/wallpaper.svg") or any CSS
   *  background value. Leave empty for the classic flat teal. */
  theme: { wallpaper: string }
  windows: Record<WindowKey, WindowMeta>
  /** Controls which windows appear and in what order. Remove a key to hide it. */
  sections: { desktopIcons: WindowKey[]; startMenu: WindowKey[]; initial: WindowKey }
  welcome: {
    heading: string
    paragraphs: string[]
    /** One-line hint shown at the bottom of the Welcome dialog. */
    tip: string
    contents: { label: string; target: WindowKey; color: WelcomeLinkColor }[]
  }
  about: { title: string; bio: string[]; skills: Skill[] }
  projects: Project[]
  contacts: ContactLink[]
  portfolio: { externalUrl: string; externalLabel: string; intro: string; resumePath: string }
  /** The Help window. In the template this documents customization; repoint it at
   *  anything you like once the site is yours. */
  help: { intro: string; steps: string[]; showWelcomeLabel: string }
  /** The "Shut Down" screen. Its click-to-restart just reloads the page. */
  shutdown: { message: string; signoff: string; restartLabel: string }
}

const ICON = "https://win98icons.alexmeub.com/icons/png"

export const site: SiteConfig = {
  identity: {
    name: "Riley Quinn",
    role: "Frontend Developer",
    metaTitle: "Riley Quinn Portfolio",
    metaDescription: "A developer portfolio built as a nostalgic Windows 98 desktop.",
  },

  theme: {
    wallpaper: "",
  },

  windows: {
    hero: { title: "Welcome to Windows 98", icon: `${ICON}/windows-0.png`, initial: { x: 120, y: 60, w: 560, h: 420 } },
    portfolio: { title: "Portfolio", icon: `${ICON}/computer_explorer-5.png`, initial: { x: 200, y: 90, w: 480, h: 340 } },
    projects: { title: "My Projects", icon: `${ICON}/directory_open_file_mydocs-4.png`, initial: { x: 240, y: 110, w: 580, h: 440 } },
    about: { title: "About Me", icon: `${ICON}/notepad-3.png`, initial: { x: 220, y: 80, w: 560, h: 470 } },
    documents: { title: "Contact", icon: `${ICON}/html-0.png`, initial: { x: 260, y: 120, w: 420, h: 340 } },
    help: { title: "Help", icon: `${ICON}/help_book_cool-0.png`, initial: { x: 180, y: 70, w: 500, h: 400 } },
    computer: { title: "My Computer", icon: `${ICON}/cd_drive-4.png`, initial: { x: 280, y: 100, w: 460, h: 360 } },
    recycle: { title: "Recycle Bin", icon: `${ICON}/recycle_bin_full-4.png`, initial: { x: 300, y: 140, w: 420, h: 300 } },
  },

  sections: {
    desktopIcons: ["portfolio", "projects", "about", "documents", "help", "computer", "recycle"],
    startMenu: ["portfolio", "projects", "about", "documents", "help", "computer"],
    initial: "hero",
  },

  welcome: {
    heading: "Welcome",
    paragraphs: [
      "Welcome to my corner of the web, rebuilt as the desktop you grew up with.",
      "Take a moment to click around: every icon opens a window with something to explore.",
      "To open something, just click it.",
    ],
    tip: "Tip: drag any window by its title bar, and resize it from the bottom-right corner.",
    contents: [
      { label: "My Projects", target: "projects", color: "blue" },
      { label: "View Portfolio", target: "portfolio", color: "red" },
      { label: "About Me", target: "about", color: "green" },
      { label: "Contact", target: "documents", color: "yellow" },
    ],
  },

  about: {
    title: "Riley Quinn, Frontend Developer",
    bio: [
      "I build fast, accessible web interfaces with React, TypeScript, and a soft spot for retro UI.",
      "Lately I have been working on developer tools and design systems. I care about the details: focus states, motion, and copy that respects the reader.",
      "Currently open to frontend and product engineering roles.",
    ],
    skills: [
      { title: "Frontend", description: "React, Next.js, TypeScript, Tailwind CSS." },
      { title: "Design systems", description: "Accessible components, design tokens, Figma to code." },
      { title: "Tooling", description: "Vite, Playwright, and GitHub Actions." },
    ],
  },

  projects: [
    {
      title: "PixelPad",
      url: "https://example.com",
      image: "/demo-project-1.svg",
      tags: ["React", "Local-first"],
      blurb: "A tiny notes app with a Windows 98 skin and Markdown export.",
      role: "Solo builder",
      result: "Featured in a retro-computing newsletter; 1k+ users.",
    },
    {
      title: "Dialup Weather",
      url: "https://example.com",
      image: "/demo-project-2.svg",
      tags: ["TypeScript", "API"],
      blurb: "A weather dashboard that renders forecasts as faux 56k terminal output.",
      role: "Design and build",
      result: "Open-source, 300+ stars.",
    },
    {
      title: "Sysmon 98",
      url: "https://example.com",
      image: "/demo-project-3.svg",
      tags: ["Canvas", "Realtime"],
      blurb: "A system-monitor widget styled after the classic Windows resource meter.",
      role: "Frontend",
      result: "Used as a teaching example for canvas rendering.",
    },
  ],

  contacts: [
    { label: "hello@yoursite.example", href: "mailto:hello@yoursite.example", icon: `${ICON}/outlook_express-4.png` },
    { label: "GitHub", href: "https://github.com/yourusername", icon: `${ICON}/html-0.png` },
    { label: "LinkedIn", href: "https://linkedin.com/in/yourusername", icon: `${ICON}/html-0.png` },
    { label: "X / Twitter", href: "https://x.com/yourusername", icon: `${ICON}/html-0.png` },
    { label: "yoursite.example", href: "https://yoursite.example", icon: `${ICON}/html-0.png` },
  ],

  portfolio: {
    externalUrl: "https://yoursite.example",
    externalLabel: "yoursite.example",
    intro: "You will find longer case studies, writing, and the occasional experiment there.",
    resumePath: "/resume.pdf",
  },

  help: {
    intro: "This site is an open-source template. Here is how to make it yours:",
    steps: [
      "Open site.config.ts and replace the demo content with your own.",
      "Edit the projects and contacts lists; drop images in the public folder.",
      "Add your resume at public/resume.pdf, or point portfolio.resumePath elsewhere.",
      "Show or hide windows by editing the sections lists.",
      "Push to GitHub and enable Pages (Settings, Pages, Source: GitHub Actions).",
    ],
    showWelcomeLabel: "Show the Welcome screen",
  },

  shutdown: {
    message: "It is now safe to turn off your computer.",
    signoff: "Thanks for stopping by.",
    restartLabel: "Click anywhere to restart",
  },
}
