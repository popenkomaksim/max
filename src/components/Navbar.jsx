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
  'select-none text-slate-400 transition-colors duration-200 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white'

const linkClasses = ({ isActive }) => (isActive ? 'select-none text-slate-900 dark:text-white' : muted)

const MENU_ID = 'site-menu'

export default function Navbar({ style }) {
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

  const toggleMenu = () => setIsOpen((prev) => !prev)

  // Rendered twice — inline on desktop and inside the mobile drawer — so the
  // list is built once and placed in both spots. `padding` differs between the
  // two: each row carries its own, so neighbouring links touch and there's no
  // dead strip between them to click into.
  const renderLinks = (padding) =>
    links.map(({ to, label }) => (
      // `end` keeps "/" from matching every route as active.
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        className={(state) => `${linkClasses(state)} ${padding}`}
        onClick={() => setIsOpen(false)}
      >
        {label}
      </NavLink>
    ))

  return (
    <header style={style} className="chrome-in sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 text-sm font-book tracking-tightish sm:px-6">
        <NavLink to="/" className="select-none font-medium text-slate-900 dark:text-white" onClick={() => setIsOpen(false)}>
          {profile.name}
        </NavLink>

        {/* One set of controls for every breakpoint; only the link row is
            collapsed behind the menu button on small screens. */}
        <div className="flex items-center gap-5">
          {/* The negative margin cancels the first and last link's own padding,
              so the row sits exactly where a `gap-5` row would. */}
          <div className="-mx-2.5 hidden items-center sm:flex">{renderLinks('px-2.5 py-2')}</div>
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
            // The menu opens on press rather than on release, so it feels
            // immediate. A keyboard activation still arrives as a click with
            // `detail === 0`, which is the only click this lets through — a
            // real mouse press would otherwise toggle twice.
            onMouseDown={toggleMenu}
            onClick={(event) => {
              if (event.detail === 0) toggleMenu()
            }}
            aria-label={isOpen ? t.menu.close : t.menu.open}
            aria-expanded={isOpen}
            aria-controls={MENU_ID}
            className={`${muted} sm:hidden`}
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div
          id={MENU_ID}
          className="flex flex-col border-t border-slate-100 px-4 py-2 text-sm font-book tracking-tightish sm:hidden dark:border-slate-800"
        >
          {renderLinks('py-2.5')}
        </div>
      )}
    </header>
  )
}
