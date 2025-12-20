export default function Navigation() {
  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Tyler J. Wallett</div>
          <div className="flex gap-6">
            <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
            <a href="#projects" className="text-slate-300 hover:text-white transition-colors">Projects</a>
            <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </nav>
  );
}