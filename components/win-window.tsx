"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent } from "react"
import { onImgError } from "@/lib/utils"

const VIEWPORT_MARGIN = 8
const TASKBAR_HEIGHT = 30

interface WinWindowProps {
  title: string
  icon?: string
  children: ReactNode
  minimized: boolean
  zIndex: number
  initial: { x: number; y: number; w: number; h: number }
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
  /** "full" shows minimize/maximize/close (default). "closeOnly" shows just the close button, matching dialogs like the Welcome screen. */
  controls?: "full" | "closeOnly"
  /** Whether the window shows a drag-to-resize handle. Defaults to true. */
  resizable?: boolean
}

export function WinWindow({
  title,
  icon,
  children,
  minimized,
  zIndex,
  initial,
  onClose,
  onMinimize,
  onFocus,
  controls = "full",
  resizable = true,
}: WinWindowProps) {
  const [pos, setPos] = useState({ x: initial.x, y: initial.y })
  const [size, setSize] = useState({ w: initial.w, h: initial.h })
  const [maximized, setMaximized] = useState(false)
  // Drag moves via a compositor-only transform, then commits to left/top on release.
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(null)
  const dragStart = useRef<{ px: number; py: number } | null>(null)
  const resize = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null)

  // Fixed desktop coordinates overflow small screens, so fit the window to the
  // viewport on mount (server renders the raw coords; the client clamps them).
  useEffect(() => {
    const maxW = window.innerWidth - VIEWPORT_MARGIN * 2
    const maxH = window.innerHeight - TASKBAR_HEIGHT - VIEWPORT_MARGIN * 2
    const w = Math.min(initial.w, maxW)
    const h = Math.min(initial.h, maxH)
    setSize({ w, h })
    setPos({
      x: Math.max(VIEWPORT_MARGIN, Math.min(initial.x, window.innerWidth - w - VIEWPORT_MARGIN)),
      y: Math.max(VIEWPORT_MARGIN, Math.min(initial.y, window.innerHeight - TASKBAR_HEIGHT - h - VIEWPORT_MARGIN)),
    })
  }, [initial])

  const onHeaderDown = (e: PointerEvent) => {
    onFocus()
    if (maximized) return
    dragStart.current = { px: e.clientX, py: e.clientY }
    setDragDelta({ x: 0, y: 0 })
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onResizeDown = (e: PointerEvent) => {
    if (!resizable) return
    e.stopPropagation()
    onFocus()
    resize.current = { sx: e.clientX, sy: e.clientY, sw: size.w, sh: size.h }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onMove = (e: PointerEvent) => {
    if (dragStart.current) {
      setDragDelta({ x: e.clientX - dragStart.current.px, y: e.clientY - dragStart.current.py })
    } else if (resize.current) {
      setSize({
        w: Math.max(280, resize.current.sw + (e.clientX - resize.current.sx)),
        h: Math.max(160, resize.current.sh + (e.clientY - resize.current.sy)),
      })
    }
  }

  const onUp = () => {
    if (dragStart.current && dragDelta) {
      setPos((p) => ({ x: Math.max(0, p.x + dragDelta.x), y: Math.max(0, p.y + dragDelta.y) }))
    }
    dragStart.current = null
    setDragDelta(null)
    resize.current = null
  }

  const winStyle: CSSProperties = maximized
    ? {
        left: 0,
        top: 0,
        width: "100vw",
        height: `calc(100vh - ${TASKBAR_HEIGHT}px)`,
        zIndex,
        display: minimized ? "none" : "flex",
      }
    : {
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex,
        display: minimized ? "none" : "flex",
        transform: dragDelta ? `translate3d(${dragDelta.x}px, ${dragDelta.y}px, 0)` : undefined,
      }

  return (
    <div className="window floating-window" style={winStyle} onPointerDown={onFocus} onPointerMove={onMove} onPointerUp={onUp}>
      <div className="window-header" onPointerDown={onHeaderDown} style={{ cursor: "move", touchAction: "none" }}>
        <span className="window-title-text">
          {icon && <img src={icon} alt="" onError={onImgError} />}
          {title}
        </span>
        <div className="window-controls">
          {controls === "full" && (
            <button
              type="button"
              className="win-btn-minimize"
              aria-label="Minimize"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onMinimize()
              }}
            >
              _
            </button>
          )}
          {controls === "full" && (
            <button
              type="button"
              className="win-btn-maximize"
              aria-label={maximized ? "Restore" : "Maximize"}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onFocus()
                setMaximized((m) => !m)
              }}
            >
              {maximized ? "❐" : "□"}
            </button>
          )}
          <button
            type="button"
            className="win-btn-close"
            aria-label="Close"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            ×
          </button>
        </div>
      </div>
      {children}
      {resizable && !maximized && <div className="resize-handle" onPointerDown={onResizeDown} style={{ touchAction: "none" }} />}
    </div>
  )
}
