import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Github, Linkedin, Mail, Home } from 'lucide-react'

export default function PortfolioNav() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

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
      scrolled ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-gray-800/50'
    } ${
      hidden ? '-translate-y-full' : 'translate-y-0'
    } after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Home icon and links */}
          <div className="flex items-center gap-6">
            {/* Home Icon */}
            <button
              onClick={handleHomeClick}
              className="relative group p-2 rounded-lg hover:bg-white/5 transition-all"
              aria-label="Home"
            >
              <Home className="size-6 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={handleProjectsClick}
              className="text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-md text-sm font-medium transition-all"
            >
              Portfolio
            </button>
          </div>

          {/* Right side - Social icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/twallett"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-md transition-all"
              aria-label="GitHub"
            >
              <Github className="size-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/twallett/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-md transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="size-5" />
            </a>
            <a
              href="mailto:twallett@gwu.edu"
              className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-md transition-all"
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