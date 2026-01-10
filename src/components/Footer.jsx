import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-slate-950 border-t border-slate-800 py-10 sm:py-16"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <p className="text-slate-500 text-sm flex flex-wrap items-center justify-center gap-1 leading-relaxed">
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
