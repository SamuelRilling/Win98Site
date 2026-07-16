"use client"

import { useEffect, useState, type ReactNode } from "react"
import { WinWindow } from "@/components/win-window"
import { TaskbarClock } from "@/components/taskbar-clock"
import { asset, onImgError } from "@/lib/utils"
import { site, type WindowKey } from "@/site.config"

const { windows: WINDOWS, sections } = site

/** Base URL for the third-party Win98 icon set used by the desktop chrome. */
const ICON = "https://win98icons.alexmeub.com/icons/png"

export default function Home() {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [stack, setStack] = useState<WindowKey[]>([sections.initial])
  const [minimized, setMinimized] = useState<Partial<Record<WindowKey, boolean>>>({})
  const [isShutdown, setIsShutdown] = useState(false)

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

  const focus = (type: WindowKey) => setStack((s) => [...s.filter((w) => w !== type), type])

  const open = (type: WindowKey) => {
    setMinimized((m) => ({ ...m, [type]: false }))
    setStack((s) => [...s.filter((w) => w !== type), type])
    setIsStartMenuOpen(false)
  }

  const close = (type: WindowKey) => {
    setStack((s) => s.filter((w) => w !== type))
    setMinimized((m) => ({ ...m, [type]: false }))
  }

  const minimize = (type: WindowKey) => setMinimized((m) => ({ ...m, [type]: true }))

  const taskbarClick = (type: WindowKey) => {
    if (minimized[type]) {
      open(type)
    } else if (stack[stack.length - 1] === type) {
      minimize(type)
    } else {
      focus(type)
    }
  }

  const shutDown = () => {
    setIsStartMenuOpen(false)
    setIsShutdown(true)
  }

  // File/Edit/View are period chrome; Help is wired to open the Help window.
  const menuBar = (
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
      <button type="button" className="menu-bar-item" onClick={() => open("help")}>
        <u>H</u>elp
      </button>
    </div>
  )

  const renderBody = (type: WindowKey): ReactNode => {
    switch (type) {
      case "hero":
        return (
          <div className="welcome-body">
            <div className="welcome-banner">
              <img src={`${ICON}/windows-0.png`} alt="" className="welcome-flag" onError={onImgError} />
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
                {site.welcome.contents.map((c) => (
                  <button key={c.target} className={`welcome-link ${c.color}`} onClick={() => open(c.target)}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="welcome-text">
                <h2 className="welcome-heading">{site.welcome.heading}</h2>
                {site.welcome.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {site.welcome.tip && <p className="welcome-tip">{site.welcome.tip}</p>}
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
            {menuBar}
            <div className="window-content">
              <p style={{ marginBottom: 12 }}>
                My full, up-to-date portfolio lives at{" "}
                <a
                  href={site.portfolio.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent-red)", fontWeight: "bold" }}
                >
                  {site.portfolio.externalLabel}
                </a>
                .
              </p>
              <p style={{ marginBottom: 16 }}>{site.portfolio.intro}</p>
              <a
                href={asset(site.portfolio.resumePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="button-retro"
                style={{ textDecoration: "none", display: "inline-block", color: "inherit" }}
              >
                Download résumé (CV)
              </a>
            </div>
            <div className="status-bar">
              <span>{site.portfolio.externalLabel}</span>
              <span>Portfolio</span>
            </div>
          </>
        )
      case "projects":
        return (
          <>
            {menuBar}
            <div className="window-content">
              <div className="project-grid-modal">
                {site.projects.map((p) => (
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
              <span>{site.projects.length} items</span>
              <span>Ready</span>
            </div>
          </>
        )
      case "about":
        return (
          <>
            {menuBar}
            <div className="window-content">
              <div className="about-content-modal">
                <h2 className="about-title">{site.about.title}</h2>
                {site.about.bio.map((p, i) => (
                  <p key={i} className="about-description">
                    {p}
                  </p>
                ))}
                <div className="skills-grid">
                  {site.about.skills.map((s) => (
                    <div key={s.title} className="skill-card">
                      <h3 className="skill-title">{s.title}</h3>
                      <p className="skill-description">{s.description}</p>
                    </div>
                  ))}
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
            {menuBar}
            <div className="window-content">
              <div className="folder-list">
                {site.contacts.map((c) => (
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
              <span>{site.contacts.length} object(s)</span>
              <span>Contact</span>
            </div>
          </>
        )
      case "help":
        return (
          <>
            {menuBar}
            <div className="window-content">
              <div className="help-content">
                <div className="help-header">
                  <img src={`${ICON}/help_book_cool-0.png`} alt="" onError={onImgError} />
                  <p>{site.help.intro}</p>
                </div>
                <ol className="help-steps">
                  {site.help.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                <button type="button" className="button-retro" onClick={() => open("hero")}>
                  {site.help.showWelcomeLabel}
                </button>
              </div>
            </div>
            <div className="status-bar">
              <span>Help</span>
              <span>Ready</span>
            </div>
          </>
        )
      case "computer":
        return (
          <>
            {menuBar}
            <div className="window-content">
              <div className="computer-drives">
                <div className="drive-item">
                  <img src={`${ICON}/cd_drive-4.png`} alt="C Drive" onError={onImgError} />
                  <div>
                    <div className="drive-label">(C:)</div>
                    <div className="drive-name">Local Disk</div>
                  </div>
                </div>
                <div className="drive-item">
                  <img src={`${ICON}/cd_drive-4.png`} alt="D Drive" onError={onImgError} />
                  <div>
                    <div className="drive-label">(D:)</div>
                    <div className="drive-name">CD-ROM</div>
                  </div>
                </div>
                <div className="drive-item">
                  <img src={`${ICON}/cd_drive-4.png`} alt="A Drive" onError={onImgError} />
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
            {menuBar}
            <div className="window-content">
              <div className="recycle-empty">
                <img
                  src={`${ICON}/recycle_bin_empty-4.png`}
                  alt="Empty"
                  style={{ width: "64px", height: "64px", imageRendering: "pixelated" }}
                  onError={onImgError}
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

  const wallpaper = site.theme.wallpaper
  const desktopStyle = wallpaper
    ? wallpaper.startsWith("/")
      ? { backgroundImage: `url(${asset(wallpaper)})`, backgroundSize: "cover", backgroundPosition: "center" }
      : { background: wallpaper }
    : undefined

  return (
    <main className="desktop" style={desktopStyle}>
      <h1 className="sr-only">Portfolio of {site.identity.name}</h1>

      {isShutdown && (
        <div
          className="shutdown-screen"
          role="button"
          tabIndex={0}
          aria-label={site.shutdown.restartLabel}
          onClick={() => window.location.reload()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") window.location.reload()
          }}
        >
          <div className="shutdown-text">
            <p className="shutdown-message">{site.shutdown.message}</p>
            <p className="shutdown-signoff">{site.shutdown.signoff}</p>
            <p className="shutdown-restart">{site.shutdown.restartLabel}</p>
          </div>
        </div>
      )}

      {/* Desktop icons column */}
      <div className="desktop-icons">
        {sections.desktopIcons.map((type) => (
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
          <img src={`${ICON}/windows-0.png`} alt="Start" onError={onImgError} />
          <span className="start-text">Start</span>
        </button>

        {isStartMenuOpen && (
          <div className="start-menu">
            <div className="start-menu-header">
              <span className="windows-logo">Windows</span>
              <span className="windows-version">98</span>
            </div>
            <div className="start-menu-items">
              {sections.startMenu.map((type) => (
                <button key={type} onClick={() => open(type)} className="start-menu-item">
                  <img src={WINDOWS[type].icon || asset("/placeholder.svg")} alt={WINDOWS[type].title} onError={onImgError} />
                  <span>{WINDOWS[type].title}</span>
                </button>
              ))}
              <div className="start-menu-separator"></div>
              <button type="button" className="start-menu-item" onClick={shutDown}>
                <img src={`${ICON}/shut_down_with_computer-0.png`} alt="Shut Down" onError={onImgError} />
                <span>Shut Down...</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick launch */}
        <div className="quick-launch">
          <img src={`${ICON}/msie1-2.png`} alt="Internet Explorer" onError={onImgError} />
          <img src={`${ICON}/channels-3.png`} alt="Channels" onError={onImgError} />
          <img src={`${ICON}/desktop-0.png`} alt="Show Desktop" onError={onImgError} />
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
