import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('upw_lang') || 'ar')

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const fontFamily = lang === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif"

  useEffect(() => {
    localStorage.setItem('upw_lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    document.documentElement.style.fontFamily = fontFamily
  }, [lang, dir, fontFamily])

  const toggleLang = () => setLang(l => l === 'ar' ? 'en' : 'ar')

  const t = (key) => translations[lang]?.[key] ?? translations['ar']?.[key] ?? key

  return (
    <LangContext.Provider value={{ lang, dir, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

// Convenience hook — just get the translator
export function useT() {
  const { t } = useContext(LangContext)
  return t
}
