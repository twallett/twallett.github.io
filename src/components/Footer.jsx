import { Heart, Github, GraduationCap, Linkedin, Mail } from 'lucide-react';

export default function Footer({ theme = 'light' }) {
  const isDark = theme === 'dark';
  const links = [
    {
      label: 'GitHub',
      href: 'https://github.com/twallett',
      icon: Github,
    },
    {
      label: 'Google Scholar',
      href: 'https://scholar.google.com/citations?user=BZ3mB-sAAAAJ&hl=en',
      icon: GraduationCap,
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/twallett/',
      icon: Linkedin,
    },
    {
      label: 'Email',
      href: 'mailto:twallett@gwu.edu',
      icon: Mail,
    },
  ];

  return (
    <footer
      id="contact"
      className={`border-t py-10 transition-colors duration-300 sm:py-16 ${
        isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {links.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </a>
          ))}
        </div>
        <p className={`flex flex-wrap items-center justify-center gap-1 text-sm leading-relaxed ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}>
          <span>© 2025 Tyler Wallett · Built with</span>
          <Heart
            size={14}
            className="text-red-500 inline-block align-middle"
            fill="currentColor"
            aria-hidden="true"
          />
          <span>using React & Tailwind</span>
        </p>
      </div>
    </footer>
  );
}
