# Implementation Plan: Virus "Run" Easter Egg

## Overview

When the user clicks **Yes** on the virus warning dialog, a multi-layered "virus running" sequence
plays out across the desktop. The sequence runs on a single timer-driven timeline but each effect
is **parallel** — they overlap and fade in/out independently. After the final BSOD countdown,
everything restores automatically and `virus.exe` returns to the Recycle Bin.

## Sequence Flow (parallel, timer-driven)

```
t=0ms    → Show marquee (top splash) + open virus-installer window
t=600ms  → (scanner window already open)
t=1,200ms→ Desktop icons start jittering
t=1,800ms→ Fake error dialogs begin spawning in waves
t=2,400ms→ Color-shift / glitch overlay fades in
t=6,000ms→ BSOD takes over the entire screen + countdown begins
t=16,000ms→ Everything restores, virus.exe back in Recycle Bin
```

Each effect is activated by its own `setTimeout` and has its own lifecycle. The BSOD is the
"ending" — it covers everything and counts down from 10 seconds before trigger restore.

---

## 1. Configuration File: `virus-config.ts`

**File:** [virus-config.ts](./virus-config.ts) (created ✓)

Holds all tunable parameters. Key sections:

| Section | Parameters | What it controls |
|---------|-----------|-----------------|
| `timing` | `marqueeStartDelay`, `scannerStartDelay`, `jitterStartDelay`, `errorsStartDelay`, `colorShiftStartDelay`, `bsodStartDelay`, `bsodDuration`, `totalDuration` | When each effect starts and how long the whole thing runs |
| `marquee` | `text`, `colors[]`, `fontSize`, `fontFamily`, `height`, `textColor` | Splash message text and cycling background colors |
| `scanner` | `title`, `messages[]`, `accentColor`, `installDuration` | Virus-installer window content and progress bar |
| `jitter` | `intensity` (px), `duration` (ms) | How far icons shake and for how long |
| `errors` | `countPerWave`, `waveInterval`, `messages[]`, `autoDismiss` | How many fake error dialogs per wave, how often, what they say |
| `colorShift` | `hueRotationMax` (turns), `glitchOffset` (px), `duration` | Color distortion strength and glitch offset |
| `bsod` | `duration`, `message`, `backgroundColor`, `textColor`, `fontSize`, `fontFamily` | BSOD appearance and text |
| `corruptionLevel` | 1 (mild), 2 (moderate), 3 (chaotic) | Master multiplier that scales intensity across groups |

The `getVirusConfig(level)` helper scales parameters based on `corruptionLevel`.

---

## 2. React State Changes (`app/page.tsx`)

### New state variables in the `Home` component:

```ts
const [virusActive, setVirusActive] = useState(false)      // master switch — drives all CSS classes
const [virusRunning, setVirusRunning] = useState(false)    // prevents re-triggering mid-sequence
const [bsodCountdown, setBsodCountdown] = useState(0)      // seconds remaining in BSOD
const [errorDialogs, setErrorDialogs] = useState<ErrorDialog[]>([])  // array of {id, x, y, message}
```

### The "Yes" button handler:

```ts
const handleVirusYes = () => {
  setShowVirusWarning(false)
  setVirusRunning(true)
  setVirusActive(true)
  // ...start the timer sequence (see Section 3)
}
```

---

## 3. The Timer Sequence

A single `startVirusSequence()` function orchestrates everything. It uses `setTimeout`
for phase triggers and `setInterval` for recurring effects. All timers are tracked in a
`ref` array so they can be cleaned up on unmount.

```
startVirusSequence():
  const timers: NodeJS.Timeout[] = []

  // Phase 1: Marquee (+ scanner window opens)
  timers.push(setTimeout(() => {
    // marquee is always visible while virusActive — no extra state needed
    // just open the virus installer window
    open("virus")            // adds "virus" to the window stack
  }, cfg.timing.scannerStartDelay))

  // Phase 2: Icon jitter
  timers.push(setTimeout(() => {
    setVirusJitter(true)     // applies .virus-jitter class to desktop-icons container
  }, cfg.timing.jitterStartDelay))

  // Phase 3: Error flood
  timers.push(setTimeout(() => {
    spawnErrors()            // waves of error dialogs via setInterval inside
  }, cfg.timing.errorsStartDelay))

  // Phase 4: Color shift
  timers.push(setTimeout(() => {
    // color shift is always-on while virusActive + past the start delay
    // driven by CSS class
  }, cfg.timing.colorShiftStartDelay))

  // Phase 5: BSOD
  timers.push(setTimeout(() => {
    setBsodVisible(true)
    startCountdown(cfg.bsod.duration / 1000)  // e.g. 10 → 0
  }, cfg.timing.bsodStartDelay))

  // Phase 6: Restore everything
  timers.push(setTimeout(() => {
    restoreEverything()
  }, cfg.timing.totalDuration))

  // Cleanup
  return () => timers.forEach(clearTimeout)
```

### Error spawning (`spawnErrors`):

```ts
const spawnErrors = () => {
  const waves = Math.ceil(remainingTime / cfg.errors.waveInterval)
  let waveCount = 0
  const interval = setInterval(() => {
    for (let i = 0; i < cfg.errors.countPerWave; i++) {
      const id = `error-${Date.now()}-${i}`
      const x = Math.random() * (windowWidth - 200)
      const y = Math.random() * (windowHeight - 150)
      const msg = randomChoice(cfg.errors.messages)
      addErrorDialog({ id, x, y, message: msg })
    }
    waveCount++
    if (waveCount >= totalWaves) clearInterval(interval)
  }, cfg.errors.waveInterval)
}
```

Each error dialog auto-dismisses after `cfg.errors.autoDismiss` ms.

### BSOD countdown (`startCountdown`):

```ts
const startCountdown = (seconds: number) => {
  setBsodCountdown(seconds)
  const interval = setInterval(() => {
    setBsodCountdown((s) => {
      if (s <= 1) {
        clearInterval(interval)
        return 0
      }
      return s - 1
    })
  }, 1000)
}
```

### Restore everything (`restoreEverything`):

```ts
const restoreEverything = () => {
  setVirusActive(false)
  setVirusJitter(false)
  setBsodVisible(false)
  setBsodCountdown(0)
  setErrorDialogs([])
  setShowVirusWarning(false)
  // Close the virus installer window if still open
  close("virus")
  // Move virus.exe back to the Recycle Bin
  setDesktopEntries((d) => d.filter((e) => e.type !== "virus"))
  setBinEntries((b) => [...b, { id: "virus", type: "virus", label: "virus.exe" }])
  // Clear all timers
  cleanupRef.current?.()
}
```

---

## 4. New / Modified CSS Classes (`app/globals.css`)

### `.virus-marquee`
- `position: fixed; top: 0; left: 0; width: 100%; height: 22px;`
- `z-index: 2001;`
- `white-space: nowrap; overflow: hidden;`
- Background color cycles via JS state every 1s (reads from `cfg.marquee.colors`).
- Text scrolls via `@keyframes` `transform: translateX` from right to left.

### `.virus-jitter`
- Applied to `.desktop-icons` container.
- `@keyframes virusJitter` applies random `transform: translate(randomX, randomY)` via `nth-child` selectors with different offsets.

### `.virus-glitch`
- Applied to the root `<main>` element (or a wrapper).
- CSS: `filter: hue-rotate(...);` animated via `@keyframes virusHueShift`.
- Uses `::before`/`::after` pseudo-elements with `transform: translate()` for RGB channel offset (glitch effect).

### `.bsod-overlay`
- `position: fixed; inset: 0; z-index: 3001;`
- `background: #0b2e80; color: white; font-family: "Lucida Console", monospace;`
- White text in monospace, multiline (using `<pre>` or `<div>` with `\n` splits).
- Countdown number appears in larger/red text with a blinking effect (`.blink` class already exists).

### `.virus-error-dialog`
- Reuses `.win98-dialog` styling.
- Small, movable, with an OK button.
- Position is set via inline style (`left`, `top`).

### `.virus-scanner-body`
- New content rendered by `renderBody("virus")` — dark background, green text, progress bar.

---

## 5. New / Modified React Components

### `renderBody("virus")` — Fake Virus Installer Window

Replace the current switch fall-through (there's no case for "virus") with:

```tsx
case "virus":
  return (
    <div className="virus-scanner-window">
      <div className="virus-scanner-titlebar">
        <img src={WINDOWS["virus"].icon} alt="virus" />
        <span>{cfg.scanner.title}</span>
      </div>
      <div className="virus-scanner-messages">
        {cfg.scanner.messages.map((msg, i) => (
          <div key={i} className={i === activeMessageIndex ? "active" : ""}>
            {msg}
          </div>
        ))}
      </div>
      <div className="virus-progress-container">
        <div className="virus-progress-bar" style={{ width: `${progressPercent}%`, backgroundColor: cfg.scanner.accentColor }} />
      </div>
    </div>
  )
```

### Floating Error Dialog Component

A lightweight self-contained component for each error dialog:

```tsx
interface ErrorDialog {
  id: string
  x: number
  y: number
  message: string
}

// Rendered in a map over `errorDialogs` state array
<div className="win98-dialog virus-error-dialog" style={{ left: x, top: y }}>
  <div className="win98-dialog-titlebar">Error</div>
  <div className="win98-dialog-body">
    <span className="virus-error-icon">⚠</span>
    <span>{message}</span>
  </div>
  <div className="win98-dialog-actions">
    <button className="button-retro" onClick={() => removeError(id)}>OK</button>
  </div>
</div>
```

---

## 6. File Modification Summary

| File | Action | Changes |
|------|--------|---------|
| `virus-config.ts` | **NEW** | All tunable parameters + `getVirusConfig()` scaler |
| `app/page.tsx` | **MODIFY** | Add virus state vars, `handleVirusYes()`, timer sequence, error dialog array, BSOD countdown, restore logic, new `case "virus"` in `renderBody` |
| `app/globals.css` | **MODIFY** | Add `.virus-marquee`, `.virus-jitter`, `.virus-glitch`, `.bsod-overlay`, `.virus-error-dialog`, `.virus-scanner-window`, `.virus-progress-bar` + `@keyframes` |
| `public/` | **NEW (optional)** | `bsod-bg.svg` or similar for a richer BSOD texture (or use solid CSS color) |

---

## 7. How to Customize

Everything is controlled by editing **`virus-config.ts`**:

- **Change the marquee text:** Edit `marquee.text`.
- **Change error messages:** Edit `errors.messages[]`.
- **Change timing:** Adjust the `timing.*` values in milliseconds.
- **Change intensity:** Edit `corruptionLevel` (1, 2, or 3) or tweak individual `jitter.intensity`, `colorShift.hueRotationMax`, etc.
- **Change BSOD text:** Edit `bsod.message` (use `\n` for line breaks).
- **Change colors:** Edit `marquee.colors[]`, `scanner.accentColor`, `bsod.backgroundColor`/`textColor`.

---

## 8. Risk Assessment & Mitigation

| Risk | Mitigation |
|------|-----------|
| Timers leak if component unmounts | Store all timer IDs in a ref; clean up in a `useEffect` return |
| Error dialogs spawn off-screen | Clamp `x`/`y` to viewport dimensions minus dialog size |
| BSOD overlay blocks all interaction | Use z-index stacking: marquee (2001) → dialogs (2100) → BSOD (3001) → restore button (3002) |
| Window stacking conflicts | Virus installer uses `open("virus")` which goes through the normal stack/focus system |
| Virus icon doesn't reappear in Recycle Bin | The restore logic filters it out of `desktopEntries` and pushes it back into `binEntries` |
| Multiple rapid "Yes" clicks | `virusRunning` guard prevents re-triggering while sequence is active |
