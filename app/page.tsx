"use client"

import { useEffect, useState, type ReactNode } from "react"
import { WinWindow } from "@/components/win-window"
import { TaskbarClock } from "@/components/taskbar-clock"
import { WinContextMenu } from "@/components/win-context-menu"
import { asset, onImgError } from "@/lib/utils"
import { site, type WindowKey } from "@/site.config"

const { windows: WINDOWS, sections } = site

/** Base URL for the third-party Win98 icon set used by the desktop chrome. */
const ICON = "https://win98icons.alexmeub.com/icons/png"

// Build timestamp for deployment verification
const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || "dev"

/** A desktop icon or recycle-bin row. */
interface DesktopEntry {
  id: string
  type: WindowKey
  label: string
  cut?: boolean
}

interface ContextMenuState {
  x: number
  y: number
  mode: "desktop" | "bin" | "background"
  entryId: string | null
}

interface ClipboardState {
  entryId: string
  type: WindowKey
  label: string
  cut: boolean
}

/** Simple counter so pasted icons get unique ids. */
let nextPasteId = 1
function freshPasteId() {
  nextPasteId += 1
  return `paste-${nextPasteId}`
}

export default function Home() {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [stack, setStack] = useState<WindowKey[]>([sections.initial])
  // Taskbar order is stable in open order; stack only drives z-index/focus.
  const [openOrder, setOpenOrder] = useState<WindowKey[]>([sections.initial])
  const [minimized, setMinimized] = useState<Partial<Record<WindowKey, boolean>>>({})
  const [isShutdown, setIsShutdown] = useState(false)

  // Desktop icons and recycle-bin contents
  const [desktopEntries, setDesktopEntries] = useState<DesktopEntry[]>(() =>
    sections.desktopIcons.map((t) => ({ id: t, type: t, label: WINDOWS[t].title }))
  )
  const [binEntries, setBinEntries] = useState<DesktopEntry[]>([
    { id: "virus", type: "virus", label: "virus.exe" },
  ])
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [showVirusWarning, setShowVirusWarning] = useState(false)
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState("")
  const [propertiesId, setPropertiesId] = useState<string | null>(null)

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
    setOpenOrder((o) => (o.includes(type) ? o : [...o, type]))
    setIsStartMenuOpen(false)
  }

  const close = (type: WindowKey) => {
    setStack((s) => s.filter((w) => w !== type))
    setOpenOrder((o) => o.filter((w) => w !== type))
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

  // ── Icon / recycle-bin context menu ────────────────────────────────────────
  const entryLocation = (id: string): "desktop" | "bin" =>
    binEntries.some((b) => b.id === id) ? "bin" : "desktop"

  const findEntry = (id: string): DesktopEntry | undefined => {
    return desktopEntries.find((e) => e.id === id) ?? binEntries.find((e) => e.id === id)
  }

  const clearCutMarks = () => {
    setDesktopEntries((d) => d.map((e) => ({ ...e, cut: false })))
    setBinEntries((b) => b.map((e) => ({ ...e, cut: false })))
  }

  const openDesktopMenu = (e: React.MouseEvent<HTMLElement> | undefined, id: string) => {
    if (renamingId) return
    e?.preventDefault()
    e?.stopPropagation()
    setContextMenu({ x: e?.clientX ?? 120, y: e?.clientY ?? 200, mode: "desktop", entryId: id })
  }

  const openBinMenu = (e: React.MouseEvent | undefined, id: string) => {
    if (renamingId) return
    e?.preventDefault()
    e?.stopPropagation()
    setContextMenu({ x: e?.clientX ?? 120, y: e?.clientY ?? 200, mode: "bin", entryId: id })
  }

  const openBackgroundMenu = (e: React.MouseEvent<HTMLElement>) => {
    if (renamingId) return
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, mode: "background", entryId: null })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const restoreToDesktop = (id: string) => {
    const item = binEntries.find((e) => e.id === id)
    if (!item) return
    setBinEntries((b) => b.filter((e) => e.id !== id))
    setDesktopEntries((d) => [...d, { ...item, cut: false }])
  }

  const deleteEntry = (id: string, loc: "desktop" | "bin") => {
    const item = findEntry(id)
    if (!item) return
    if (clipboard?.entryId === id) setClipboard(null)
    if (loc === "bin") {
      // Permanently remove from the recycle bin.
      setBinEntries((b) => b.filter((e) => e.id !== id))
    } else {
      // Send to the recycle bin.
      setDesktopEntries((d) => d.filter((e) => e.id !== id))
      setBinEntries((b) => [...b, { ...item, cut: false }])
    }
  }

  const cutEntry = (id: string) => {
    const entry = findEntry(id)
    if (!entry) return
    const loc = entryLocation(id)
    if (loc === "bin") {
      setBinEntries((b) => b.map((e) => ({ ...e, cut: e.id === id })))
    } else {
      setDesktopEntries((d) => d.map((e) => ({ ...e, cut: e.id === id })))
    }
    setClipboard({ entryId: id, type: entry.type, label: entry.label, cut: true })
  }

  const copyEntry = (id: string) => {
    const entry = findEntry(id)
    if (!entry) return
    clearCutMarks()
    setClipboard({ entryId: id, type: entry.type, label: entry.label, cut: false })
  }

  const pasteFromClipboard = () => {
    if (!clipboard) return
    clearCutMarks()
    if (clipboard.cut) {
      // Cut + Paste = move to the desktop.
      const loc = entryLocation(clipboard.entryId)
      if (loc === "bin") {
        setBinEntries((b) => b.filter((e) => e.id !== clipboard.entryId))
      } else {
        setDesktopEntries((d) => d.filter((e) => e.id !== clipboard.entryId))
      }
    }
    const label = clipboard.cut ? clipboard.label : `${clipboard.label} - Copy`
    setDesktopEntries((d) => [
      ...d.filter((e) => e.id !== clipboard.entryId),
      { id: freshPasteId(), type: clipboard.type, label, cut: false },
    ])
    setClipboard(null)
  }

  const doRename = (id: string, draft: string) => {
    const label = draft.trim()
    if (!label) {
      setRenamingId(null)
      return
    }
    setRenamingId(null)
    setDesktopEntries((d) => d.map((e) => (e.id === id ? { ...e, label } : e)))
    setBinEntries((b) => b.map((e) => (e.id === id ? { ...e, label } : e)))
  }

  const handleContextMenuAction = (action: string) => {
    const menu = contextMenu
    if (!menu) return
    if (menu.mode === "background" || !menu.entryId) {
      closeContextMenu()
      return
    }
    const id = menu.entryId
    const loc = entryLocation(id)
    const entry = findEntry(id)
    if (!entry) return

    switch (action) {
      case "open":
      case "restore":
        if (loc === "bin") {
          restoreToDesktop(id)
        } else if (entry.type === "virus") {
          setShowVirusWarning(true)
        } else {
          open(entry.type)
        }
        break
      case "cut":
        cutEntry(id)
        break
      case "copy":
        copyEntry(id)
        break
      case "paste":
        pasteFromClipboard()
        break
      case "delete":
        deleteEntry(id, loc)
        break
      case "rename":
        setRenamingId(id)
        setRenameDraft(entry.label)
        break
      case "properties":
        setPropertiesId(id)
        break
    }
    closeContextMenu()
  }

  const buildBackgroundMenuItems = () => [
    { label: "Arrange Icons", action: "noop" },
    { label: "Line up Icons", action: "noop", separatorAfter: true },
    { label: "Paste", action: "noop", icon: `${ICON}/paste-0.png`, disabled: !clipboard },
    { label: "Paste Shortcut", action: "noop", disabled: !clipboard, separatorAfter: true },
    { label: "New", action: "noop", separatorAfter: true },
    { label: "Properties", action: "noop", icon: `${ICON}/property_sheet-4.png` },
  ]

  const buildMenuItems = () => {
    const menu = contextMenu
    if (!menu) return []
    if (menu.mode === "background") return buildBackgroundMenuItems()
    if (!menu.entryId) return []
    const entry = findEntry(menu.entryId)
    if (!entry) return []
    const isInBin = menu.mode === "bin"
    const isVirus = entry.type === "virus"
    const items: {
      label: string
      action: string
      icon?: string
      disabled?: boolean
      separatorAfter?: boolean
    }[] = []

    if (isInBin) {
      items.push({
        label: isVirus ? "Restore" : "Open",
        action: "open",
        icon: isVirus ? `${ICON}/restore-0.png` : `${ICON}/folder_open-3.png`,
        separatorAfter: true,
      })
    } else {
      items.push({
        label: "Open",
        action: "open",
        icon: `${ICON}/folder_open-3.png`,
        separatorAfter: true,
      })
    }

    items.push({ label: "Cut", action: "cut", icon: `${ICON}/cut-0.png` })
    items.push({ label: "Copy", action: "copy", icon: `${ICON}/copy-0.png` })
    items.push({
      label: "Paste",
      action: "paste",
      icon: `${ICON}/paste-0.png`,
      disabled: !clipboard,
      separatorAfter: true,
    })
    items.push({ label: "Delete", action: "delete", icon: `${ICON}/delete-0.png`, separatorAfter: true })
    items.push({ label: "Rename", action: "rename", icon: `${ICON}/rename-0.png` })
    items.push({ label: "Properties", action: "properties", icon: `${ICON}/property_sheet-4.png` })

    return items
  }

  // Desktop rendering uses desktopEntries (managed via the context menu).

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
            <div className="window-header" style={{ cursor: "default", padding: "2px 4px", fontSize: "11px", opacity: 0.7 }}>
              Build: {BUILD_TIME}
            </div>
            <div className="window-content">
              {binEntries.length ? (
                binEntries.map((entry) => {
                  const renaming = renamingId === entry.id
                  return (
                    <div
                      key={entry.id}
                      className={`recycle-item${entry.cut ? " is-cut" : ""}${
                        contextMenu && contextMenu.mode === "bin" && contextMenu.entryId === entry.id
                          ? " is-selected"
                          : ""
                      }`}
                      role="button"
                      tabIndex={0}
                      aria-haspopup="menu"
                      aria-label={entry.label}
                      onContextMenu={(e) => openBinMenu(e as React.MouseEvent<HTMLDivElement>, entry.id)}
                      onDoubleClick={() => restoreToDesktop(entry.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          openBinMenu(undefined, entry.id)
                        }
                      }}
                    >
                      <img
                        src={WINDOWS[entry.type].icon || asset("/placeholder.svg")}
                        alt={entry.label}
                        style={{ width: "32px", height: "32px", imageRendering: "pixelated" }}
                        onError={onImgError}
                      />
                      {renaming ? (
                        <input
                          className="recycle-rename-input"
                          value={renameDraft}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onBlur={() => doRename(entry.id, renameDraft)}
                          onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === "Enter") doRename(entry.id, renameDraft)
                            else if (e.key === "Escape") setRenamingId(null)
                          }}
                        />
                      ) : (
                        <span>{entry.label}</span>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="recycle-empty">
                  <img
                    src={`${ICON}/recycle_bin_empty-4.png`}
                    alt="Empty"
                    style={{ width: "64px", height: "64px", imageRendering: "pixelated" }}
                    onError={onImgError}
                  />
                  <p>The Recycle Bin is empty.</p>
                </div>
              )}
            </div>
            <div className="status-bar">
              <span>{binEntries.length} object(s)</span>
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
    <main
      className="desktop"
      style={desktopStyle}
      onDoubleClick={(e) => {
        if (e.target === e.currentTarget) openBackgroundMenu(e)
      }}
    >
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
        {desktopEntries.map((entry) => {
          const renaming = renamingId === entry.id
          const selected =
            contextMenu && contextMenu.mode === "desktop" && contextMenu.entryId === entry.id
          return (
            <div
              key={entry.id}
              role="button"
              tabIndex={0}
              aria-haspopup="menu"
              aria-label={entry.label}
              className={`icon-item${renaming ? " is-renaming" : ""}${entry.cut ? " is-cut" : ""}${
                selected ? " is-selected" : ""
              }`}
              onContextMenu={(e) => openDesktopMenu(e as React.MouseEvent<HTMLDivElement>, entry.id)}
              onDoubleClick={() => (entry.type === "virus" ? setShowVirusWarning(true) : open(entry.type))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openDesktopMenu(undefined, entry.id)
                }
              }}
            >
              <img
                src={WINDOWS[entry.type].icon || asset("/placeholder.svg")}
                alt={entry.label}
                onError={onImgError}
              />
              {renaming ? (
                <input
                  className="desktop-rename-input"
                  value={renameDraft}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => setRenameDraft(e.target.value)}
                  onBlur={() => doRename(entry.id, renameDraft)}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === "Enter") doRename(entry.id, renameDraft)
                    else if (e.key === "Escape") setRenamingId(null)
                  }}
                />
              ) : (
                <span>{entry.label}</span>
              )}
            </div>
          )
        })}
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

      {/* Context Menu */}
      {contextMenu && (
        <WinContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={buildMenuItems()}
          onAction={handleContextMenuAction}
          onClose={closeContextMenu}
        />
      )}

      {/* Virus warning dialog */}
      {showVirusWarning && (
        <div
          className="virus-dialog-overlay"
          onClick={() => setShowVirusWarning(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowVirusWarning(false)
          }}
        >
          <div
            className="win98-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="virusDialogTitle"
          >
            <div className="win98-dialog-titlebar">
              <span className="win98-dialog-title-icon">
                <img
                  src={WINDOWS["virus"].icon || asset("/placeholder.svg")}
                  alt=""
                  width={14}
                  height={14}
                  onError={onImgError}
                />
              </span>
              <span id="virusDialogTitle" className="win98-dialog-title-text">
                virus.exe
              </span>
              <button
                type="button"
                className="win98-dialog-close"
                aria-label="Close"
                onClick={() => setShowVirusWarning(false)}
              >
                ×
              </button>
            </div>
            <div className="win98-dialog-body">
              <img
                src={WINDOWS["virus"].icon || asset("/placeholder.svg")}
                alt="Warning"
                className="win98-dialog-icon"
                onError={onImgError}
              />
              <div className="win98-dialog-message">
                <p>
                  Are you sure you want to run <strong>virus.exe</strong>? This
                  program may be harmful to your computer.
                </p>
                <p>Click <strong>Yes</strong> to run it, or <strong>No</strong> to cancel.</p>
              </div>
            </div>
            <div className="win98-dialog-actions">
              <button
                type="button"
                className="button-retro"
                onClick={() => setShowVirusWarning(false)}
              >
                Yes
              </button>
              <button
                type="button"
                className="button-retro"
                autoFocus
                onClick={() => setShowVirusWarning(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Properties dialog */}
      {propertiesId &&
        (() => {
          const entry = findEntry(propertiesId)
          if (!entry) return null
          const loc = entryLocation(propertiesId)
          const typeName =
            entry.type === "virus"
              ? "Application (virus.exe)"
              : entry.type === "recycle"
                ? "System Folder"
                : "Shortcut"
          const icon = WINDOWS[entry.type].icon || asset("/placeholder.svg")
          return (
            <div
              className="prop-dialog-overlay"
              onMouseDown={() => setPropertiesId(null)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setPropertiesId(null)
              }}
            >
              <div
                className="win98-dialog prop-dialog"
                role="dialog"
                aria-modal="true"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="win98-dialog-titlebar">
                  <span className="win98-dialog-title-icon">
                    <img src={icon} alt="" width={14} height={14} onError={onImgError} />
                  </span>
                  <span className="win98-dialog-title-text">{entry.label} Properties</span>
                  <button
                    type="button"
                    className="win98-dialog-close"
                    aria-label="Close"
                    onClick={() => setPropertiesId(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="prop-dialog-body">
                  <div className="prop-dialog-head">
                    <img src={icon} alt="" className="prop-dialog-bigicon" onError={onImgError} />
                    <span className="prop-dialog-name">{entry.label}</span>
                  </div>
                  <div className="prop-dialog-form">
                    <div className="prop-row">
                      <span className="prop-label">Type:</span>
                      <span className="prop-value">{typeName}</span>
                    </div>
                    <div className="prop-row">
                      <span className="prop-label">Location:</span>
                      <span className="prop-value">{loc === "bin" ? "Recycle Bin" : "Desktop"}</span>
                    </div>
                    <div className="prop-row">
                      <span className="prop-label">Size:</span>
                      <span className="prop-value">{entry.type === "virus" ? "1.44 MB" : "0 KB (shortcut)"}</span>
                    </div>
                    <div className="prop-row">
                      <span className="prop-label">Created:</span>
                      <span className="prop-value">August 20, 1998</span>
                    </div>
                  </div>
                  <div className="prop-dialog-actions">
                    <button type="button" className="button-retro" autoFocus onClick={() => setPropertiesId(null)}>
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

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
          {openOrder.map((type) => (
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
