import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('ia_theme')
      return saved ? saved === 'dark' : true
    } catch { return true }
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.remove('light')
    } else {
      root.classList.add('light')
    }
    try { localStorage.setItem('ia_theme', dark ? 'dark' : 'light') } catch { /* private mode */ }
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
