"use client"

import { useRef, useState, type ReactNode, type PointerEvent } from "react"
import { onImgError } from "@/lib/utils"

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
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const resize = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null)

  const onHeaderDown = (e: PointerEvent) => {
    onFocus()
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }
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
    if (drag.current) {
      setPos({
        x: Math.max(0, e.clientX - drag.current.dx),
        y: Math.max(0, e.clientY - drag.current.dy),
      })
    } else if (resize.current) {
      setSize({
        w: Math.max(280, resize.current.sw + (e.clientX - resize.current.sx)),
        h: Math.max(160, resize.current.sh + (e.clientY - resize.current.sy)),
      })
    }
  }

  const onUp = () => {
    drag.current = null
    resize.current = null
  }

  return (
    <div
      className="window floating-window"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex,
        display: minimized ? "none" : "flex",
      }}
      onPointerDown={onFocus}
      onPointerMove={onMove}
      onPointerUp={onUp}
    >
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
            <span className="win-btn-maximize" aria-hidden="true">
              □
            </span>
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
      {resizable && <div className="resize-handle" onPointerDown={onResizeDown} style={{ touchAction: "none" }} />}
    </div>
  )
}
