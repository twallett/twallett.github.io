import { Github, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-16">
      <div className="mx-auto max-w-4xl px-6 text-center space-y-8">
        
        {/* Heading */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-3">Get In Touch</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            I'm always open to new opportunities and collaborations. Feel free to reach out!
          </p>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4">
          <a
            href="https://github.com/twallett"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all hover:scale-110"
            aria-label="GitHub"
          >
            <Github size={22} />
          </a>
          <a
            href="https://www.linkedin.com/in/twallett/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all hover:scale-110"
            aria-label="LinkedIn"
          >
            <Linkedin size={22} />
          </a>
          <a
            href="mailto:twallett@gwu.edu"
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all hover:scale-110"
            aria-label="Email"
          >
            <Mail size={22} />
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            © 2025 Tyler Wallett · Built with <Heart size={14} className="text-red-500" fill="currentColor" /> using React & Tailwind
          </p>
        </div>

      </div>
    </footer>
  );
}