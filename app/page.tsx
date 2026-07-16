"use client"

import { useEffect, useState, type ReactNode } from "react"
import { WinWindow } from "@/components/win-window"
import { TaskbarClock } from "@/components/taskbar-clock"
import { asset, onImgError } from "@/lib/utils"

type WindowType = "computer" | "documents" | "recycle" | "projects" | "about" | "portfolio" | "hero"

const WINDOWS: Record<WindowType, { title: string; icon: string; initial: { x: number; y: number; w: number; h: number } }> = {
  hero: { title: "Welcome to Windows 98", icon: "https://win98icons.alexmeub.com/icons/png/windows-0.png", initial: { x: 120, y: 60, w: 560, h: 400 } },
  portfolio: { title: "Portfolio", icon: "https://win98icons.alexmeub.com/icons/png/computer_explorer-5.png", initial: { x: 200, y: 90, w: 480, h: 360 } },
  projects: { title: "My Projects", icon: "https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png", initial: { x: 240, y: 110, w: 580, h: 420 } },
  about: { title: "About Me", icon: "https://win98icons.alexmeub.com/icons/png/notepad-3.png", initial: { x: 220, y: 80, w: 560, h: 470 } },
  documents: { title: "Contact", icon: "https://win98icons.alexmeub.com/icons/png/html-0.png", initial: { x: 260, y: 120, w: 420, h: 340 } },
  computer: { title: "My Computer", icon: "https://win98icons.alexmeub.com/icons/png/cd_drive-4.png", initial: { x: 280, y: 100, w: 460, h: 360 } },
  recycle: { title: "Recycle Bin", icon: "https://win98icons.alexmeub.com/icons/png/recycle_bin_full-4.png", initial: { x: 300, y: 140, w: 420, h: 300 } },
}

// ─── CONTENT — fill in the [TODO] fields with your real details ───────────────
type Project = {
  title: string
  url: string
  image: string
  tags: string[]
  blurb: string
  role: string
  result: string
}

const PROJECTS: Project[] = [
  {
    title: "1UI.dev",
    url: "https://1ui.dev",
    image: "/modern-ui-component-library-design-system.jpg",
    tags: ["React", "UI Library"],
    blurb: "[TODO: one sentence — what 1UI.dev is and who it's for]",
    role: "[TODO: your role, e.g. Solo builder / Lead frontend]",
    result: "[TODO: a concrete outcome — users, stars, launch, revenue]",
  },
  {
    title: "Apichecker.io",
    url: "https://apichecker.io",
    image: "/api-testing-monitoring-dashboard-interface.jpg",
    tags: ["API", "Testing"],
    blurb: "[TODO: one sentence — what Apichecker.io does]",
    role: "[TODO: your role]",
    result: "[TODO: a concrete outcome / traction]",
  },
  // [TODO: add more projects by copying the shape above]
]

type ContactLink = { label: string; href: string; icon: string }

const CONTACTS: ContactLink[] = [
  { label: "[TODO] you@email.com", href: "mailto:TODO@example.com", icon: "https://win98icons.alexmeub.com/icons/png/outlook_express-4.png" },
  { label: "[TODO] GitHub", href: "https://github.com/TODO", icon: "https://win98icons.alexmeub.com/icons/png/html-0.png" },
  { label: "[TODO] LinkedIn", href: "https://linkedin.com/in/TODO", icon: "https://win98icons.alexmeub.com/icons/png/html-0.png" },
  { label: "[TODO] X / Twitter", href: "https://x.com/TODO", icon: "https://win98icons.alexmeub.com/icons/png/html-0.png" },
  { label: "jess.vc", href: "https://jess.vc", icon: "https://win98icons.alexmeub.com/icons/png/html-0.png" },
]

const MENU_BAR = (
  <div className="menu-bar">
    <span>
      <u>F</u>ile
    </span>
    <span>
      <u>E</u>dit
    </span>
    <span>
      <u>V</u>iew
    </span>
    <span>
      <u>H</u>elp
    </span>
  </div>
)

export default function Home() {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [stack, setStack] = useState<WindowType[]>(["hero"])
  const [minimized, setMinimized] = useState<Partial<Record<WindowType, boolean>>>({})

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".start-btn") && !target.closest(".start-menu")) {
        setIsStartMenuOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const focus = (type: WindowType) => setStack((s) => [...s.filter((w) => w !== type), type])

  const open = (type: WindowType) => {
    setMinimized((m) => ({ ...m, [type]: false }))
    setStack((s) => [...s.filter((w) => w !== type), type])
    setIsStartMenuOpen(false)
  }

  const close = (type: WindowType) => {
    setStack((s) => s.filter((w) => w !== type))
    setMinimized((m) => ({ ...m, [type]: false }))
  }

  const minimize = (type: WindowType) => setMinimized((m) => ({ ...m, [type]: true }))

  const taskbarClick = (type: WindowType) => {
    if (minimized[type]) {
      open(type)
    } else if (stack[stack.length - 1] === type) {
      minimize(type)
    } else {
      focus(type)
    }
  }

  const renderBody = (type: WindowType): ReactNode => {
    switch (type) {
      case "hero":
        return (
          <div className="welcome-body">
            <div className="welcome-banner">
              <img
                src="https://win98icons.alexmeub.com/icons/png/windows-0.png"
                alt=""
                className="welcome-flag" onError={onImgError}
              />
              <div className="welcome-banner-text">
                <span className="welcome-ms">Microsoft</span>
                <span className="welcome-win">
                  Windows<span className="welcome-98">98</span>
                </span>
              </div>
            </div>
            <div className="welcome-rainbow" />
            <div className="welcome-main">
              <div className="welcome-contents">
                <div className="welcome-contents-title">CONTENTS</div>
                <button className="welcome-link blue" onClick={() => open("projects")}>
                  My Projects
                </button>
                <button className="welcome-link red" onClick={() => open("portfolio")}>
                  View Portfolio
                </button>
                <button className="welcome-link green" onClick={() => open("about")}>
                  About Me
                </button>
                <button className="welcome-link yellow" onClick={() => open("documents")}>
                  Links &amp; Contact
                </button>
              </div>
              <div className="welcome-text">
                <h2 className="welcome-heading">Welcome</h2>
                <p>
                  Welcome to the creative world of Jessin Sam S, where design meets development on the desktop you know
                  and love.
                </p>
                <p>
                  Sit back and relax as you take a brief tour of the projects and work available on this screen.
                </p>
                <p>If you want to explore an option, just click it.</p>
              </div>
            </div>
            <div className="welcome-footer">
              <label className="welcome-checkbox">
                <input type="checkbox" defaultChecked /> Show this screen each time you visit.
              </label>
              <button className="button-retro" onClick={() => close("hero")}>
                Close
              </button>
            </div>
          </div>
        )
      case "portfolio":
        return (
          <>
            {MENU_BAR}
            <div className="window-content">
              <p style={{ marginBottom: 12 }}>
                My full, up-to-date portfolio lives at{" "}
                <a
                  href="https://jess.vc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent-red)", fontWeight: "bold" }}
                >
                  jess.vc
                </a>
                .
              </p>
              <p style={{ marginBottom: 16 }}>[TODO: a line or two on what visitors will find there.]</p>
              {/* [TODO: drop your CV at public/resume.pdf, or point href to an external link] */}
              <a
                href={asset("/resume.pdf")}
                target="_blank"
                rel="noopener noreferrer"
                className="button-retro"
                style={{ textDecoration: "none", display: "inline-block", color: "inherit" }}
              >
                Download résumé (CV)
              </a>
            </div>
            <div className="status-bar">
              <span>jess.vc</span>
              <span>Portfolio</span>
            </div>
          </>
        )
      case "projects":
        return (
          <>
            {MENU_BAR}
            <div className="window-content">
              <div className="project-grid-modal">
                {PROJECTS.map((p) => (
                  <a
                    key={p.title}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <img src={asset(p.image)} alt={p.title} className="project-img" onError={onImgError} />
                    <div className="project-info">
                      <h3 className="project-title">{p.title}</h3>
                      <p className="project-blurb">{p.blurb}</p>
                      <p className="project-meta">
                        <strong>Role:</strong> {p.role}
                      </p>
                      <p className="project-meta">
                        <strong>Result:</strong> {p.result}
                      </p>
                      <div className="project-tags">
                        {p.tags.map((t) => (
                          <span key={t} className="tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="status-bar">
              <span>{PROJECTS.length} items</span>
              <span>Ready</span>
            </div>
          </>
        )
      case "about":
        return (
          <>
            {MENU_BAR}
            <div className="window-content">
              <div className="about-content-modal">
                <h2 className="about-title">[TODO: Your name and a real one-line title]</h2>
                <p className="about-description">
                  [TODO: 2 to 3 sentences, first person. Who you are, what you actually build, the stack you
                  reach for, where you&apos;re based, and the kind of work you want. Name real tools and years;
                  skip adjectives like &quot;passionate&quot; and &quot;creative&quot;.]
                </p>
                <div className="skills-grid">
                  <div className="skill-card">
                    <h3 className="skill-title">[TODO: Skill area 1]</h3>
                    <p className="skill-description">[TODO: concrete tools and frameworks, not adjectives.]</p>
                  </div>
                  <div className="skill-card">
                    <h3 className="skill-title">[TODO: Skill area 2]</h3>
                    <p className="skill-description">[TODO: concrete tools and frameworks.]</p>
                  </div>
                  <div className="skill-card">
                    <h3 className="skill-title">[TODO: Skill area 3]</h3>
                    <p className="skill-description">[TODO: concrete tools and frameworks.]</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="status-bar">
              <span>Readme.txt</span>
              <span>100%</span>
            </div>
          </>
        )
      case "documents":
        return (
          <>
            {MENU_BAR}
            <div className="window-content">
              <div className="folder-list">
                {CONTACTS.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="folder-item"
                    style={{ textDecoration: "none", color: "inherit", padding: "4px 8px" }}
                  >
                    <img src={c.icon} alt="" onError={onImgError} />
                    <span>{c.label}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="status-bar">
              <span>{CONTACTS.length} object(s)</span>
              <span>Contact</span>
            </div>
          </>
        )
      case "computer":
        return (
          <>
            {MENU_BAR}
            <div className="window-content">
              <div className="computer-drives">
                <div className="drive-item">
                  <img src="https://win98icons.alexmeub.com/icons/png/cd_drive-4.png" alt="C Drive" onError={onImgError} />
                  <div>
                    <div className="drive-label">(C:)</div>
                    <div className="drive-name">Local Disk</div>
                  </div>
                </div>
                <div className="drive-item">
                  <img src="https://win98icons.alexmeub.com/icons/png/cd_drive-4.png" alt="D Drive" onError={onImgError} />
                  <div>
                    <div className="drive-label">(D:)</div>
                    <div className="drive-name">CD-ROM</div>
                  </div>
                </div>
                <div className="drive-item">
                  <img src="https://win98icons.alexmeub.com/icons/png/cd_drive-4.png" alt="A Drive" onError={onImgError} />
                  <div>
                    <div className="drive-label">(A:)</div>
                    <div className="drive-name">3½ Floppy</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="status-bar">
              <span>3 object(s)</span>
              <span>My Computer</span>
            </div>
          </>
        )
      case "recycle":
        return (
          <>
            {MENU_BAR}
            <div className="window-content">
              <div className="recycle-empty">
                <img
                  src="https://win98icons.alexmeub.com/icons/png/recycle_bin_empty-4.png"
                  alt="Empty"
                  style={{ width: "64px", height: "64px", imageRendering: "pixelated" }} onError={onImgError}
                />
                <p>The Recycle Bin is empty.</p>
              </div>
            </div>
            <div className="status-bar">
              <span>0 object(s)</span>
              <span>Recycle Bin</span>
            </div>
          </>
        )
    }
  }

  const desktopIcons: WindowType[] = ["portfolio", "projects", "about", "documents", "computer", "recycle"]

  return (
    <main className="desktop">
      <h1 className="sr-only">Portfolio of Jessin Sam S</h1>
      {/* Desktop icons column */}
      <div className="desktop-icons">
        {desktopIcons.map((type) => (
          <button key={type} onClick={() => open(type)} className="icon-item">
            <img src={WINDOWS[type].icon || asset("/placeholder.svg")} alt={WINDOWS[type].title} onError={onImgError} />
            <span>{WINDOWS[type].title}</span>
          </button>
        ))}
      </div>

      {/* Floating windows */}
      {stack.map((type, i) => (
        <WinWindow
          key={type}
          title={WINDOWS[type].title}
          icon={WINDOWS[type].icon}
          minimized={!!minimized[type]}
          zIndex={100 + i}
          initial={WINDOWS[type].initial}
          controls={type === "hero" ? "closeOnly" : "full"}
          resizable={type !== "hero"}
          onClose={() => close(type)}
          onMinimize={() => minimize(type)}
          onFocus={() => focus(type)}
        >
          {renderBody(type)}
        </WinWindow>
      ))}

      {/* Taskbar */}
      <div className="taskbar">
        <button className="start-btn" onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}>
          <img src="https://win98icons.alexmeub.com/icons/png/windows-0.png" alt="Start" onError={onImgError} />
          <span className="start-text">Start</span>
        </button>

        {isStartMenuOpen && (
          <div className="start-menu">
            <div className="start-menu-header">
              <span className="windows-logo">Windows</span>
              <span className="windows-version">98</span>
            </div>
            <div className="start-menu-items">
              {(["portfolio", "projects", "about", "documents", "computer"] as WindowType[]).map((type) => (
                <button key={type} onClick={() => open(type)} className="start-menu-item">
                  <img src={WINDOWS[type].icon || asset("/placeholder.svg")} alt={WINDOWS[type].title} onError={onImgError} />
                  <span>{WINDOWS[type].title}</span>
                </button>
              ))}
              <div className="start-menu-separator"></div>
              <button type="button" className="start-menu-item">
                <img src="https://win98icons.alexmeub.com/icons/png/settings_gear-0.png" alt="Settings" onError={onImgError} />
                <span>Settings</span>
              </button>
              <div className="start-menu-separator"></div>
              <button type="button" className="start-menu-item">
                <img src="https://win98icons.alexmeub.com/icons/png/shut_down_with_computer-0.png" alt="Shut Down" onError={onImgError} />
                <span>Shut Down...</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick launch */}
        <div className="quick-launch">
          <img src="https://win98icons.alexmeub.com/icons/png/msie1-2.png" alt="Internet Explorer" onError={onImgError} />
          <img src="https://win98icons.alexmeub.com/icons/png/channels-3.png" alt="Channels" onError={onImgError} />
          <img src="https://win98icons.alexmeub.com/icons/png/desktop-0.png" alt="Show Desktop" onError={onImgError} />
        </div>

        {/* Open window buttons */}
        <div className="taskbar-windows">
          {stack.map((type) => (
            <button
              key={type}
              className={`taskbar-window-btn${!minimized[type] && stack[stack.length - 1] === type ? " active" : ""}`}
              onClick={() => taskbarClick(type)}
            >
              <img src={WINDOWS[type].icon || asset("/placeholder.svg")} alt="" className="taskbar-icon" onError={onImgError} />
              <span>{WINDOWS[type].title}</span>
            </button>
          ))}
        </div>

        <TaskbarClock />
      </div>
    </main>
  )
}
