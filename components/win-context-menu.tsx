"use client"

import { useEffect, useRef, type MouseEvent, Fragment } from "react"
import { onImgError } from "@/lib/utils"

interface ContextMenuItem {
  label: string
  action: string
  icon?: string
  disabled?: boolean
  separatorAfter?: boolean
}

interface WinContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onAction: (action: string) => void
  onClose: () => void
}

export function WinContextMenu({ x, y, items, onAction, onClose }: WinContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const focusedIndexRef = useRef(0)

  // Clamp position to viewport
  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const vpWidth = window.innerWidth
    const vpHeight = window.innerHeight

    let clampedX = x
    let clampedY = y

    if (clampedX + rect.width > vpWidth - 8) {
      clampedX = vpWidth - rect.width - 8
    }
    if (clampedY + rect.height > vpHeight - 8) {
      clampedY = vpHeight - rect.height - 8
    }
    if (clampedX < 8) clampedX = 8
    if (clampedY < 8) clampedY = 8

    menuRef.current.style.left = `${clampedX}px`
    menuRef.current.style.top = `${clampedY}px`
  }, [x, y])

  // Focus management and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!menuRef.current) return

      const enabledItems = items.filter((item) => !item.disabled)
      const maxIndex = enabledItems.length - 1

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowDown":
          e.preventDefault()
          focusedIndexRef.current = Math.min(focusedIndexRef.current + 1, maxIndex)
          updateFocus()
          break
        case "ArrowUp":
          e.preventDefault()
          focusedIndexRef.current = Math.max(focusedIndexRef.current - 1, 0)
          updateFocus()
          break
        case "Enter":
        case " ":
          e.preventDefault()
          const selectedItem = enabledItems[focusedIndexRef.current]
          if (selectedItem) {
            onAction(selectedItem.action)
          }
          break
        case "Tab":
          e.preventDefault()
          focusedIndexRef.current = (focusedIndexRef.current + 1) % (maxIndex + 1)
          updateFocus()
          break
      }
    }

    const updateFocus = () => {
      const menuItems = menuRef.current?.querySelectorAll<HTMLDivElement>(".context-menu-item:not(.disabled)")
      menuItems?.forEach((item, idx) => {
        if (idx === focusedIndexRef.current) {
          item.focus()
        }
      })
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [items, onAction, onClose])

  // Focus the menu container on mount so keyboard navigation works. The first
  // row is NOT auto-focused, so no item appears highlighted until the user
  // either hovers a row or presses an arrow key.
  useEffect(() => {
    menuRef.current?.focus()
  }, [])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="context-menu"
      role="menu"
      tabIndex={-1}
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) => {
        if (item.separatorAfter) {
          // We'll render the separator after this item
        }
        const isDisabled = item.disabled ?? false
        return (
          <Fragment key={index}>
            <div
              className={`context-menu-item ${isDisabled ? "disabled" : ""}`}
              role="menuitem"
              tabIndex={isDisabled ? -1 : 0}
              onClick={() => !isDisabled && onAction(item.action)}
              onMouseEnter={() => !isDisabled && (focusedIndexRef.current = index)}
              aria-disabled={isDisabled}
            >
              <span className="context-menu-icon-slot">
                {item.icon && <img src={item.icon} alt="" onError={onImgError} className="context-menu-icon" />}
              </span>
              <span>{item.label}</span>
            </div>
            {item.separatorAfter && <div className="context-menu-separator" role="separator" />}
          </Fragment>
        )
      })}
    </div>
  )
}