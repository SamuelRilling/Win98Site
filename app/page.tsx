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
  documents: { title: "Links", icon: "https://win98icons.alexmeub.com/icons/png/html-0.png", initial: { x: 260, y: 120, w: 420, h: 320 } },
  computer: { title: "My Computer", icon: "https://win98icons.alexmeub.com/icons/png/cd_drive-4.png", initial: { x: 280, y: 100, w: 460, h: 360 } },
  recycle: { title: "Recycle Bin", icon: "https://win98icons.alexmeub.com/icons/png/recycle_bin_full-4.png", initial: { x: 300, y: 140, w: 420, h: 300 } },
}

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
              <p style={{ marginBottom: 16 }}>
                Full portfolio available at{" "}
                <a
                  href="https://jess.vc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent-red)", fontWeight: "bold" }}
                >
                  jess.vc
                </a>
              </p>
              <div className="folder-list">
                <a
                  href="https://1ui.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="folder-item"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img src="https://win98icons.alexmeub.com/icons/png/html-0.png" alt="1UI.dev" onError={onImgError} />
                  <span>1UI.dev</span>
                </a>
                <a
                  href="https://apichecker.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="folder-item"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img src="https://win98icons.alexmeub.com/icons/png/html-0.png" alt="Apichecker.io" onError={onImgError} />
                  <span>Apichecker.io</span>
                </a>
              </div>
            </div>
            <div className="status-bar">
              <span>2 object(s)</span>
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
                <a
                  href="https://1ui.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img src={asset("/modern-ui-component-library-design-system.jpg")} alt="1UI.dev" className="project-img" onError={onImgError} />
                  <div className="project-info">
                    <h3 className="project-title">1UI.dev</h3>
                    <div>
                      <span className="tag">React</span>
                      <span className="tag">UI Library</span>
                    </div>
                  </div>
                </a>
                <a
                  href="https://apichecker.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img src={asset("/api-testing-monitoring-dashboard-interface.jpg")} alt="Apichecker.io" className="project-img" onError={onImgError} />
                  <div className="project-info">
                    <h3 className="project-title">Apichecker.io</h3>
                    <div>
                      <span className="tag">API</span>
                      <span className="tag">Testing</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <div className="status-bar">
              <span>2 items</span>
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
                <h2 className="about-title">Creative Professional</h2>
                <p className="about-description">
                  I&apos;m passionate about creating meaningful digital experiences that blend aesthetics with
                  functionality. With expertise in design and development, I bring ideas to life through clean code and
                  thoughtful interfaces.
                </p>
                <div className="skills-grid">
                  <div className="skill-card">
                    <h3 className="skill-title">Design</h3>
                    <p className="skill-description">Crafting beautiful, user-centered interfaces with attention to detail.</p>
                  </div>
                  <div className="skill-card">
                    <h3 className="skill-title">Development</h3>
                    <p className="skill-description">Building responsive, performant web applications with modern technologies.</p>
                  </div>
                  <div className="skill-card">
                    <h3 className="skill-title">Creativity</h3>
                    <p className="skill-description">Bringing fresh ideas and innovative solutions to every project.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="status-bar">
              <span>Page 1 of 1</span>
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
                <a
                  href="https://1ui.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="folder-item"
                  style={{ textDecoration: "none", color: "inherit", padding: "4px 8px" }}
                >
                  <img src="https://win98icons.alexmeub.com/icons/png/html-0.png" alt="Project" onError={onImgError} />
                  <span>1UI.dev</span>
                </a>
                <a
                  href="https://apichecker.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="folder-item"
                  style={{ textDecoration: "none", color: "inherit", padding: "4px 8px" }}
                >
                  <img src="https://win98icons.alexmeub.com/icons/png/html-0.png" alt="Project" onError={onImgError} />
                  <span>Apichecker.io</span>
                </a>
              </div>
            </div>
            <div className="status-bar">
              <span>2 object(s)</span>
              <span>Links</span>
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
