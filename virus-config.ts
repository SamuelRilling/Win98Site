/**
 * virus-config.ts — Tunable parameters for the virus "run" Easter egg.
 *
 * Every visual effect in the virus sequence reads its behavior from this file.
 * Adjust values here to change timing, intensity, text, and overall chaos.
 *
 * ── Corruption Levels ─────────────────────────────────────────────
 *   1 = Mild        → Marquee + scanner, light jitter, few errors, short color shift
 *   2 = Moderate     → All effects at medium intensity, standard BSOD
 *   3 = Chaotic      → Everything maxes out: violent jitter, constant errors, deep
 *                       color distortion, rapid marquee, long BSOD
 *
 * The `corruptionLevel` at the bottom acts as a multiplier for several groups.
 * ───────────────────────────────────────────────────────────────────
 */

/** The shape of the virus config object. Components receive this type. */
export interface VirusConfig {
  timing: {
    marqueeStartDelay: number
    scannerStartDelay: number
    jitterStartDelay: number
    errorsStartDelay: number
    colorShiftStartDelay: number
    bsodStartDelay: number
    bsodDuration: number
    totalDuration: number
  }
  marquee: {
    text: string
    colors: string[]
    fontSize: string
    fontFamily: string
    height: string
    textColor: string
  }
  scanner: {
    title: string
    messages: string[]
    accentColor: string
    installDuration: number
  }
  jitter: {
    intensity: number
    duration: number
  }
  errors: {
    countPerWave: number
    waveInterval: number
    messages: string[]
    autoDismiss: number
  }
  colorShift: {
    hueRotationMax: number
    glitchOffset: number
    duration: number
  }
  bsod: {
    duration: number
    message: string
    backgroundColor: string
    textColor: string
    fontSize: string
    fontFamily: string
  }
  corruptionLevel: number
}

/** Base configuration object — tune these values to customize the Easter egg. */
export const VIRUS_CONFIG: VirusConfig = {
  // ── Sequence timing (milliseconds after "Yes" is clicked) ─────────
  timing: {
    /** Delay before the marquee first appears. */
    marqueeStartDelay: 200,
    /** Delay before the fake virus-installer window opens. */
    scannerStartDelay: 600,
    /** Delay before desktop icons begin jittering. */
    jitterStartDelay: 1_200,
    /** Delay before fake error dialogs begin spawning. */
    errorsStartDelay: 1_800,
    /** Delay before the color-shift / glitch overlay activates. */
    colorShiftStartDelay: 2_400,
    /** Delay before the BSOD takes over the entire screen. */
    bsodStartDelay: 6_000,
    /** How long the BSOD stays visible (includes the auto-restore countdown). */
    bsodDuration: 10_000,
    /** Total duration before full auto-restore (should == bsodStartDelay + bsodDuration). */
    totalDuration: 16_000,
  },

  // ── Marquee (top-of-screen scrolling splash text) ──────────────────
  marquee: {
    /** The splash text that scrolls across the top — edit freely! */
    text: "HACKING IN PROGRESS • VIRUS INSTALLATION COMMENCED • 01010110 01110010 01110101 01110011 • ACCESSING SYSTEM • BYPASSING SECURITY • INSTALLING BACKDOOR",
    /** Background colors that cycle every 1s. Add/remove/hex-change to taste. */
    colors: ["#00ff00", "#ff0000", "#ffff00", "#00ffff", "#ff00ff", "#ffffff"],
    fontSize: "12px",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    height: "22px",
    textColor: "#000000",
  },

  // ── Fake virus-installer window ────────────────────────────────────
  scanner: {
    title: "virus.exe",
    /** Messages shown in sequence inside the installer window. */
    messages: [
      "Initializing malware...",
      "Injecting payload into system memory...",
      "Corrupting file system entries...",
      "Modifying registry hives...",
      "Establishing network backconnect...",
      "Deleting shadow copies...",
      "Installing persistence module...",
      "Disabling security services...",
      "Done. System compromised.",
    ],
    /** Color of the progress bar fill inside the installer. */
    accentColor: "#ff0000",
    /** Simulated total install time (ms) — drives the progress bar. */
    installDuration: 4_500,
  },

  // ── Desktop icon jitter/shake ──────────────────────────────────────
  jitter: {
    /** Maximum pixel offset from the icon's original position. */
    intensity: 12,
    /** How long the jittering lasts before the icons settle. */
    duration: 3_000,
  },

  // ── Fake error dialog flood ───────────────────────────────────────
  errors: {
    /** Number of error dialogs spawned per wave. */
    countPerWave: 4,
    /** Interval between spawn waves (ms). */
    waveInterval: 400,
    /** Messages shown on the error dialogs — edit or extend freely. */
    messages: [
      "Critical error in KRNL386.EXE",
      "General protection fault in VIRUS.EXE",
      "Stack overflow at 0x00000000",
      "Memory access violation in KERNEL32.DLL",
      "Registry write failed: access denied",
      "File system corrupted: C:\\WINDOWS\\SYSTEM32",
      "Unhandled exception 0xC0000005",
      "Page fault in nonpaged area",
    ],
    /** How long each error dialog stays before auto-closing (ms). */
    autoDismiss: 3_500,
  },

  // ── Color shift / glitch overlay ───────────────────────────────────
  colorShift: {
    /** Maximum hue rotation in turns (1.0 = 360°). */
    hueRotationMax: 0.7,
    /** How far (px) the RGB channel glitch offsets itself. */
    glitchOffset: 6,
    /** How long the color distortion lasts before BSOD. */
    duration: 3_500,
  },

  // ── Blue Screen of Death ───────────────────────────────────────────
  bsod: {
    /** How long (ms) the BSOD stays before auto-restore begins. */
    duration: 10_000,
    /** The main BSOD error text. `\n\n` creates paragraph breaks. */
    message:
      "A problem has been detected and Windows has been shut down to prevent damage\n" +
      "to your computer.\n\n" +
      "*** STOP: 0x0000008E (0x00000000, 0x00000000, 0x00000000)\n\n" +
      "VIRUS_EXECUTION_ERROR\n\n" +
      "If this is the first time you've seen this Stop error screen,\n" +
      "restart your computer. If this screen continues to appear:\n\n" +
      "Check to make sure any new hardware or software is properly installed.\n" +
      "The system will be restored in:",
    backgroundColor: "#0b2e80",
    textColor: "#ffffff",
    fontSize: "14px",
    fontFamily: '"Lucida Console", "Courier New", monospace',
  },

  // ── Master corruption level (1=mild, 3=chaotic) ────────────────────
  // Adjusts several groups at once. Higher = more intense across the board.
  corruptionLevel: 2,
}

/**
 * Returns a config with corruption-level multipliers baked in.
 * Each level scales intensity up or down from sensible "base" values.
 */
export function getVirusConfig(level: number = VIRUS_CONFIG.corruptionLevel): VirusConfig {
  const base = VIRUS_CONFIG
  const scale = { 1: 0.4, 2: 1.0, 3: 2.2 }[level] ?? 1.0

  return {
    ...base,
    timing: { ...base.timing },
    marquee: { ...base.marquee, colors: [...base.marquee.colors] },
    scanner: { ...base.scanner, messages: [...base.scanner.messages] },
    jitter: {
      intensity: Math.round(base.jitter.intensity * scale),
      duration: Math.round(base.jitter.duration / scale),
    },
    errors: {
      countPerWave: Math.max(1, Math.round(base.errors.countPerWave * scale)),
      waveInterval: Math.max(150, Math.round(base.errors.waveInterval / scale)),
      messages: [...base.errors.messages],
      autoDismiss: base.errors.autoDismiss,
    },
    colorShift: {
      hueRotationMax: Math.min(1.0, base.colorShift.hueRotationMax * scale),
      glitchOffset: Math.round(base.colorShift.glitchOffset * scale),
      duration: Math.round(base.colorShift.duration / scale),
    },
    bsod: { ...base.bsod },
    corruptionLevel: level,
  }
}
