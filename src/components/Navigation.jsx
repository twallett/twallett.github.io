import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Github, Linkedin, Mail, Home, Moon, Sun, GraduationCap } from 'lucide-react'

export default function PortfolioNav({ theme = 'light', onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Update scrolled state for background change
      setScrolled(currentScrollY > 10)
      
      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      
      setLastScrollY(currentScrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleProjectsClick = (e) => {
    e.preventDefault()
    
    // If we're already on home page, just scroll
    if (location.pathname === '/') {
      const projectsSection = document.getElementById('projects')
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // If we're on another page, navigate home then scroll
      navigate('/')
      // Small delay to let the page load before scrolling
      setTimeout(() => {
        const projectsSection = document.getElementById('projects')
        if (projectsSection) {
          projectsSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  const handleHomeClick = (e) => {
    e.preventDefault()
    
    // If we're already on home page, scroll to top
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Navigate home
      navigate('/')
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? isDark
          ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg'
          : 'bg-white/95 backdrop-blur-sm shadow-lg shadow-slate-200/70'
        : isDark
          ? 'bg-slate-800/50'
          : 'bg-white/80 backdrop-blur-sm'
    } ${
      hidden ? '-translate-y-full' : 'translate-y-0'
    } after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px ${
      isDark ? 'after:bg-white/10' : 'after:bg-slate-200'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Home icon and links */}
          <div className="flex items-center gap-6">
            {/* Home Icon */}
            <button
              onClick={handleHomeClick}
              className={`relative group rounded-lg p-2 transition-all ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
              }`}
              aria-label="Home"
            >
              <Home className={`size-6 transition-colors ${
                isDark
                  ? 'text-slate-400 group-hover:text-white'
                  : 'text-slate-500 group-hover:text-slate-900'
              }`} />
            </button>

            <button
              onClick={onToggleTheme}
              className={`rounded-md p-2 transition-all ${
                isDark
                  ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
              }`}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>

            <button
              onClick={handleProjectsClick}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                isDark
                  ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              Portfolio
            </button>

            {/* <button
              onClick={handleProjectsClick}
              className="text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-md text-sm font-medium transition-all"
            >
              AI/ML Pipelines
            </button>

            <button
              onClick={handleProjectsClick}
              className="text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-md text-sm font-medium transition-all"
            >
              Blog
            </button> */}
          </div>

          {/* Right side - Social icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/twallett"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md p-2 transition-all ${
                isDark
                  ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
              }`}
              aria-label="GitHub"
            >
              <Github className="size-5" />
            </a>
            <a
              href="https://scholar.google.com/citations?user=BZ3mB-sAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md p-2 transition-all ${
                isDark
                  ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
              }`}
              aria-label="Google Scholar"
            >
              <GraduationCap className="size-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/twallett/"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md p-2 transition-all ${
                isDark
                  ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
              }`}
              aria-label="LinkedIn"
            >
              <Linkedin className="size-5" />
            </a>
            <a
              href="mailto:twallett@gwu.edu"
              className={`rounded-md p-2 transition-all ${
                isDark
                  ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
              }`}
              aria-label="Email"
            >
              <Mail className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
