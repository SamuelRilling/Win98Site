"use client"

import { useEffect, useState } from "react"

/** Isolated so the once-a-second tick only re-renders the clock, not the desktop. */
export function TaskbarClock() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="taskbar-time">
      <span className="time-text">
        {time ? time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : ""}
      </span>
    </div>
  )
}
