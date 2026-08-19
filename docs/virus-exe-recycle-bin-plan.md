# Implementation Plan: "virus.exe" in Recycle Bin Feature

## Overview
Add a `virus.exe` file to the Recycle Bin window. Right-clicking it shows a Windows 98-style context menu. Selecting "Restore" moves it to the Desktop where it becomes a clickable icon.

---

## Architecture Analysis

**Current State:**
- `app/page.tsx` - Main desktop component with window management
- `site.config.ts` - Configuration for windows, desktop icons, sections
- `components/win-window.tsx` - Reusable window component
- `app/globals.css` - Windows 98 styling (CSS variables, component styles)

**Key Patterns:**
- Windows rendered via `renderBody(type)` switch in `page.tsx`
- Desktop icons from `sections.desktopIcons` array (WindowKey[])
- Window state managed via `useState` in `Home` component
- Icons use win98icons.alexmeub.com URL pattern

---

## Detailed Implementation Steps

### 1. Add State for Virus Location (`app/page.tsx`)
```typescript
// In Home component, add:
const [virusInRecycleBin, setVirusInRecycleBin] = useState(true)
const [virusOnDesktop, setVirusOnDesktop] = useState(false)
const [contextMenu, setContextMenu] = useState<{ x: number; y: number; target: 'recycle' | 'desktop' } | null>(null)
```

### 2. Create Context Menu Component (`components/win-context-menu.tsx`)
New component with Windows 98 styling:
- Positioned absolutely at mouse coordinates
- Menu items: Open, Cut, Copy, Delete, Rename, Properties, **Restore** (only functional)
- Click outside to close
- Keyboard navigation (optional for v1)

**Styling** (add to `globals.css`):
```css
.context-menu {
  position: fixed;
  background: var(--win-gray);
  border: 2px outset var(--win-white);
  box-shadow: 2px 2px 4px rgba(0,0,0,0.4);
  min-width: 160px;
  z-index: 1000;
}
.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 20px 3px 8px;
  cursor: default;
  white-space: nowrap;
}
.context-menu-item:hover {
  background: var(--win-highlight);
  color: var(--win-highlight-text);
}
.context-menu-separator {
  height: 1px;
  background: var(--win-shadow);
  margin: 2px 0;
}
```

### 3. Modify Recycle Bin Render (`app/page.tsx` - `renderBody` case "recycle")
- Conditionally render virus.exe entry when `virusInRecycleBin === true`
- Display as list item with icon + name
- Right-click (`onContextMenu`) opens context menu at cursor position
- Left-click selects (visual feedback only)

**Icon**: Use `${ICON}/application-0.png` or similar executable icon from win98icons

### 4. Modify Desktop Icons (`app/page.tsx`)
- Create derived `desktopIcons` array that includes `"virus"` when `virusOnDesktop === true`
- Render virus icon in desktop icons column when present
- Left-click on desktop virus icon → "run" action (placeholder for now)

### 5. Context Menu Actions
```typescript
const handleRestore = () => {
  setVirusInRecycleBin(false)
  setVirusOnDesktop(true)
  setContextMenu(null)
  // Update desktopIcons dynamically
}

const handleContextMenuAction = (action: string) => {
  if (action === 'restore') handleRestore()
  // Other actions: no-op for now
  setContextMenu(null)
}
```

### 6. Update Site Config (`site.config.ts`)
- Add `"virus"` to `WindowKey` type
- Add window metadata for virus (title: "virus.exe", icon, initial position)
- **Don't** add to `sections.desktopIcons` or `startMenu` initially (dynamic)

### 7. Virus "Execution" Placeholder
- Clicking desktop virus icon → show alert or open a dummy window
- Future: weird visual effects

---

## File Changes Summary

| File | Changes |
|------|---------|
| `app/page.tsx` | Add virus state, context menu state, modify recycle render, dynamic desktop icons, event handlers |
| `components/win-context-menu.tsx` | **NEW** - Reusable context menu component |
| `app/globals.css` | Add `.context-menu`, `.context-menu-item`, `.context-menu-separator` styles |
| `site.config.ts` | Add `"virus"` to `WindowKey`, add window metadata |

---

## Build Instructions for Nemotron 3 Super 120

**Prerequisites:**
- Node.js 18+
- `npm install` already run

**Development:**
```bash
npm run dev
# Opens at http://localhost:3000
```

**Testing the Feature:**
1. Open Recycle Bin window (desktop icon or Start menu)
2. See "virus.exe" listed in the bin
3. Right-click virus.exe → context menu appears
4. Click "Restore" → virus.exe disappears from Recycle Bin, appears on Desktop
5. Click virus.exe on Desktop → placeholder action triggers

**Production Build:**
```bash
npm run build
npm run start
```

**Lint/Type Check:**
```bash
npm run lint
npx tsc --noEmit
```

---

## Technical Considerations

1. **State Location**: Keep virus state in `Home` component (lifts state up) since both Recycle Bin and Desktop need access

2. **Context Menu Positioning**: Use `e.clientX`/`e.clientY` from `onContextMenu` event, clamp to viewport

3. **Click Outside Detection**: Add `useEffect` with document click listener to close context menu

4. **Accessibility**: Add `role="menu"`, `role="menuitem"`, keyboard support (Esc to close)

5. **Icon**: Use existing icon URL pattern: `${ICON}/application-0.png` for generic exe

6. **No Backend**: Pure client-side state - resets on page reload (acceptable for demo)

---

## Future Enhancements (Out of Scope)
- Virus execution: screen glitches, fake errors, corrupted UI
- Multiple files in Recycle Bin
- Drag-and-drop to restore
- Persist state in localStorage
- Sound effects

---

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| Context menu z-index conflicts | Use z-index: 1000 (above windows at 100+) |
| Mobile right-click | Add long-press fallback or disable on mobile |
| State sync between windows | Single source of truth in Home component |
| Icon not found | Fallback to placeholder.svg via existing `onImgError` |

---

This plan provides a complete, implementable roadmap. The feature is self-contained, follows existing patterns, and requires minimal new infrastructure. Ready for implementation when you switch to Act mode.