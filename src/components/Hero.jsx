import { Linkedin, Mail, Github } from 'lucide-react';

// Separate component for cleaner code
function CompanyLogosSlider() {
  // Replace these with your actual company logos
  const companies = [
    { name: 'The World Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/The_World_Bank_logo.svg' },
    { name: 'George Washington University', logo: 'gwu.png' },
    { name: 'Esource Capital', logo: 'esource.png' },
    { name: 'Base Operations', logo: 'base-operations.png' },
  ];

  // Duplicate the array for seamless infinite scroll
  const duplicatedCompanies = [...companies, ...companies, ...companies];

  return (
    <div className="bg-slate-950 border-t border-slate-800 py-12 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-slate-500 text-sm font-medium mb-8 uppercase tracking-wider">
          Trusted by leading organizations
        </p>
        
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-20 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-20 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>
          
          {/* Sliding container */}
          <div className="flex animate-scroll">
            {duplicatedCompanies.map((company, index) => (
              <div
                key={index}
                className="flex items-center justify-center mx-3 sm:mx-12 md:mx-16 flex-shrink-0 w-[92px] h-[58px] sm:w-[220px] sm:h-[80px]"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-w-full max-h-full object-contain opacity-60 hover:opacity-100 active:opacity-100 transition-opacity grayscale hover:grayscale-0 active:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

// Hero component with the slider below it
export default function Hero() {
  return (
    <>
      <div id="about" className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
                <img
                  src="me.jpg"
                  alt="Tyler Wallett"
                  className="relative rounded-full border-4 border-slate-700 shadow-2xl"
                  style={{ width: '300px', height: '300px', objectFit: 'cover' }}
                />
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl mb-6">
                <span className="flex flex-col sm:flex-row items-center sm:items-baseline justify-center gap-2 sm:gap-0">
                  <span className="animate-greeting"></span>
                  <span style={{ transform: 'translateY(0px)' }} className="sm:translate-y-[-6px]">Tyler Wallett</span>
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-4 leading-relaxed">
                Venezuelan 🇻🇪 and Canadian 🇨🇦. Deeply passionate 💖 about computers 💻, specifically teaching computers 👨‍🏫 how to learn from lots and lots of data 🗂️.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Company logos slider */}
      <CompanyLogosSlider />
      
      <style>{`
        @keyframes typing {
          /* Hi, I'm - Type in */
          0% {
            max-width: 0;
          }
          5% {
            max-width: 100%;
          }
          /* Hi, I'm - Stay visible */
          20% {
            max-width: 100%;
          }
          /* Hi, I'm - Delete */
          25% {
            max-width: 0;
          }
          30% {
            max-width: 0;
          }
          
          /* Hola, soy - Type in */
          35% {
            max-width: 0;
          }
          40% {
            max-width: 100%;
          }
          /* Hola, soy - Stay visible */
          55% {
            max-width: 100%;
          }
          /* Hola, soy - Delete */
          60% {
            max-width: 0;
          }
          65% {
            max-width: 0;
          }
          
          /* Salut, je suis - Type in */
          70% {
            max-width: 0;
          }
          75% {
            max-width: 100%;
          }
          /* Salut, je suis - Stay visible */
          90% {
            max-width: 100%;
          }
          /* Salut, je suis - Delete */
          95% {
            max-width: 0;
          }
          100% {
            max-width: 0;
          }
        }
        
        @keyframes blink {
          0%, 100% {
            border-right-color: transparent;
          }
          50% {
            border-right-color: white;
          }
        }
        
        @keyframes greetingCycle {
          0%, 30% {
            content: "Hi, I'm";
          }
          30.01%, 65% {
            content: "Hola, soy";
          }
          65.01%, 100% {
            content: "Salut, je suis";
          }
        }
        
        .animate-greeting {
          display: inline-block;
          position: relative;
          white-space: nowrap;
          border-right: 3px solid white;
          animation: blink 0.7s step-end infinite;
          min-width: 120px;
          margin-right: 0.5rem;
        }
        
        @media (min-width: 640px) {
          .animate-greeting {
            min-width: 180px;
          }
        }
        
        .animate-greeting::before {
          content: "Hi, I'm";
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          max-width: 0;
          animation: typing 12s steps(15) infinite, greetingCycle 12s step-start infinite;
        }
      `}</style>
    </>
  );
}