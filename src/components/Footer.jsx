import { Github, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 border-t border-slate-800 py-16">
      <div className="mx-auto max-w-4xl px-6 text-center space-y-8">
        
        {/* Divider */}
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            © 2025 Tyler Wallett · Built with <Heart size={14} className="text-red-500" fill="currentColor" /> using React & Tailwind
          </p>
      
      </div>
    </footer>
  );
}