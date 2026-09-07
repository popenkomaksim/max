import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, Moon, Sun } from 'lucide-react'
import useDarkMode from '../hooks/useDarkMode.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../i18n/translations.js'
import profile from '../data/profile.json'

// Muted by default, full contrast when active or hovered — the same
// figure/ground treatment the page body uses, instead of a filled pill.
const muted =
  'text-slate-400 transition-colors duration-200 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white'

const linkClasses = ({ isActive }) =>
  isActive ? 'text-slate-900 dark:text-white' : muted

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useDarkMode()
  const { lang, toggleLang } = useLanguage()
  const t = translations[lang]

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/wishlist', label: t.nav.wishlist },
    { to: '/about', label: t.nav.about },
    { to: '/beliefs', label: t.nav.beliefs },
    { to: '/guidelines', label: t.nav.guidelines },
  ]

  const navLinks = links.map((link) => (
    <NavLink
      key={link.to}
      to={link.to}
      end={link.to === '/'}
      className={linkClasses}
      onClick={() => setIsOpen(false)}
    >
      {link.label}
    </NavLink>
  ))

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 text-sm font-book tracking-tightish sm:px-6">
        <NavLink
          to="/"
          className="font-medium text-slate-900 dark:text-white"
          onClick={() => setIsOpen(false)}
        >
          {profile.name}
        </NavLink>

        {/* One set of controls for every breakpoint; only the link row is
            collapsed behind the menu button on small screens. */}
        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-5 sm:flex">{navLinks}</div>
          <button type="button" onClick={toggleLang} aria-label="Toggle language" className={muted}>
            {lang === 'uk' ? 'EN' : 'UA'}
          </button>
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label={isDark ? t.theme.toLight : t.theme.toDark}
            className={muted}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? t.menu.close : t.menu.open}
            aria-expanded={isOpen}
            className={`${muted} sm:hidden`}
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm font-book tracking-tightish sm:hidden dark:border-slate-800">
          {navLinks}
        </div>
      )}
    </header>
  )
}
