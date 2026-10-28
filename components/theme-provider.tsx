"use client"

import { useEffect } from "react"

import { themeStorageKey } from "@/lib/theme"

type ThemeName = "light" | "dark"

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function applyTheme(theme: ThemeName) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = window.localStorage.getItem(themeStorageKey)
    applyTheme(stored === "dark" ? "dark" : "light")

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      const next: ThemeName = document.documentElement.classList.contains("dark")
        ? "light"
        : "dark"
      applyTheme(next)
      window.localStorage.setItem(themeStorageKey, next)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return children
}

export { ThemeProvider }
