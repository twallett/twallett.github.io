import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, Brain, Flag, UserRound } from 'lucide-react';

// Separate component for cleaner code
function CompanyLogosSlider({ theme }) {
  const isDark = theme === 'dark';

  // Replace these with your actual company logos
  const companies = [
    { name: 'The World Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/The_World_Bank_logo.svg' },
    { name: 'George Washington University', logo: 'gwu.png' },
    { name: 'Esource Capital', logo: 'esource.png' },
    { name: 'Base Operations', logo: 'base-operations.png', className: 'scale-110 sm:scale-125' },
  ];

  // Duplicate the array for seamless infinite scroll
  const duplicatedCompanies = [...companies, ...companies, ...companies];

  return (
    <div className={`overflow-hidden border-t py-12 transition-colors duration-300 ${
      isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
    }`}>
      <div className="mx-auto max-w-6xl px-6">
        <p className={`mb-8 text-center text-sm font-medium uppercase tracking-wider ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}>
          Trusted by leading organizations
        </p>
        
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className={`absolute left-0 top-0 bottom-0 z-10 w-6 sm:w-20 ${
            isDark
              ? 'bg-gradient-to-r from-slate-950 to-transparent'
              : 'bg-gradient-to-r from-white to-transparent'
          }`}></div>
          <div className={`absolute right-0 top-0 bottom-0 z-10 w-6 sm:w-20 ${
            isDark
              ? 'bg-gradient-to-l from-slate-950 to-transparent'
              : 'bg-gradient-to-l from-white to-transparent'
          }`}></div>
          
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
                  className={`max-w-full max-h-full object-contain opacity-75 hover:opacity-100 active:opacity-100 transition-opacity ${company.className || ''}`}
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

function HighlightsSection({ theme }) {
  const [selectedTab, setSelectedTab] = useState('course');
  const isDark = theme === 'dark';

  const highlights = {
    course: {
      label: 'Reinforcement Learning Course',
      icon: BookOpen,
      eyebrow: 'Teaching & Curriculum',
      title: 'Graduate-level reinforcement learning, built for clarity and depth.',
      description: '',
      ctaLabel: 'Open Course',
      href: 'https://twallett.com/courses/reinforcement-learning/',
      accent: isDark ? 'from-sky-500/20 to-cyan-400/10' : 'from-sky-200 to-cyan-100',
      metrics: [
        { value: '92%', label: 'Instructor Treated Students with Respect' },
        { value: '4.2/5', label: 'Overall Instructor Rating' },
        { value: '4.4/5', label: 'Weighted Course Rating' },
      ],
      images: [
        { src: '/rl-logo.png', alt: 'Reinforcement Learning course logo', className: 'h-64 object-contain p-3', wrapperClassName: 'min-h-64' },
        { src: '/course-teaching.png', alt: 'Reinforcement Learning course teaching', className: 'h-64 object-contain', wrapperClassName: 'min-h-64' },
      ],
      imageEmbed: null,
      routeGpxUrl: null,
      routeTitle: null,
      quotes: [
        'The course is well organized. The flow of each topics are related and connected to each other. The class website is a very new way of conducting lectures, which I found really cool.',
        'Prof. cares a lot and is very knowledgeable in this subject. He spent a lot of time putting this together and it shows.',
      ],
      quoteHeading: null,
      quoteAttribution: 'Anonymous Student',
      quoteIcon: UserRound,
      quoteTheme: isDark
        ? 'border-sky-400 bg-slate-950 text-slate-300'
        : 'border-sky-600 bg-white text-slate-700',
    },
    papers: {
      label: 'Q1 Journal Research Papers',
      icon: Brain,
      eyebrow: 'Research & Publications',
      title: 'Applied artificial intelligence research published in leading journals.',
      description: '',
      ctaLabel: 'View Google Scholar',
      href: 'https://scholar.google.com/citations?user=BZ3mB-sAAAAJ&hl=en',
      accent: isDark ? 'from-violet-500/20 to-fuchsia-400/10' : 'from-violet-200 to-fuchsia-100',
      metrics: [],
      images: [
        { src: '/product-rec.png', alt: 'Graph-based dynamic recommendation systems research', className: 'h-56 object-contain', wrapperClassName: 'min-h-56' },
        { src: '/postoperative.png', alt: 'Postoperative complications research', className: 'h-56 object-contain', wrapperClassName: 'min-h-56' },
      ],
      imageEmbed: null,
      routeGpxUrl: null,
      routeTitle: null,
      quotes: [
        {
          lead: 'In a dynamic recommendation setting, ',
          emphasis: 'GINConv was the clear top performer',
          tail: ', with 22 top scores at different levels of k, while SAGEConv emerged as the next strongest model with 11 top scores at different levels of k.',
        },
        {
          lead: '',
          emphasis: 'Logistic Regression consistently achieved the strongest AUC',
          tail: ' across nearly all postoperative complications, showing that well-optimized, simpler models can still deliver robust clinical prediction and support earlier intervention.',
        },
      ],
      quoteHeading: 'Key Finding',
      quoteAttributions: [
        'A Benchmark for Graph-based Dynamic Recommendation Systems',
        'Predicting Postoperative Complications in Laparoscopic General Surgery',
      ],
      quoteIcon: Brain,
      quoteTheme: isDark
        ? 'border-violet-400 bg-slate-950 text-slate-300'
        : 'border-violet-600 bg-white text-slate-700',
    },
    human: {
      label: 'JFK 50 Miler',
      icon: Flag,
      eyebrow: 'Beyond Work',
      title: 'Endurance, consistency, and doing hard things on purpose.',
      description: '',
      ctaLabel: 'View Race Results',
      href: 'https://runsignup.com/Race/Results/86044/IndividualResult/TMPd?resultSetId=606864#U105699259',
      accent: isDark ? 'from-amber-500/20 to-orange-400/10' : 'from-amber-200 to-orange-100',
      metrics: [
        { value: '9:50:39.9', label: 'Finish Time (HH:MM:SS.sss)' },
        { value: '11:46', label: 'Miles per Hour' },
        { value: '398/1214', label: 'Overall' },
      ],
      images: [
        { src: '/jfk-ultra.png', alt: 'JFK 50 Miler race photo', className: 'h-72 object-contain', wrapperClassName: 'min-h-72' },
        { src: '/finish-time.png', alt: 'JFK 50 Miler finish time', className: 'h-56 object-contain', wrapperClassName: 'min-h-56' },
      ],
      imageEmbed: {
        src: 'https://www.youtube.com/embed/V7RRlr0fU6k?start=17730',
        title: 'JFK 50 Miler race video',
      },
      routeGpxUrl: '/jfk-50-miler.gpx',
      routeTitle: 'JFK 50 Mile route from GPX',
      quotes: [],
      quoteHeading: null,
      quoteAttribution: null,
      quoteIcon: UserRound,
      quoteTheme: isDark
        ? 'border-amber-400 bg-slate-950 text-slate-300'
        : 'border-amber-600 bg-white text-slate-700',
    },
  };

  const activeHighlight = highlights[selectedTab];
  const ActiveIcon = activeHighlight.icon;
  const QuoteIcon = activeHighlight.quoteIcon || UserRound;

  return (
    <section className={`transition-colors duration-300 ${
      isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-950'
    }`}>
      <div className="mx-auto max-w-6xl px-6 pb-14">
        <div className={`overflow-hidden rounded-[2rem] border p-6 shadow-xl transition-colors duration-300 sm:p-8 ${
          isDark
            ? 'border-slate-800 bg-slate-950/80 shadow-slate-950/30'
            : 'border-slate-200 bg-white shadow-slate-200/80'
        }`}>
          <div className="mb-6 text-center">
            <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.35em] ${
              isDark ? 'text-sky-300' : 'text-sky-700'
            }`}>
              My Highlights
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              A quick tour of the work I’m most excited about.
            </h2>
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {Object.entries(highlights).map(([key, item]) => {
              const TabIcon = item.icon;
              const isActive = key === selectedTab;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedTab(key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <TabIcon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className={`grid gap-6 rounded-[1.5rem] border p-6 transition-colors duration-300 lg:grid-cols-[1.2fr_0.8fr] ${
            isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
          }`}>
            <div>
              <p className={`mb-3 text-sm font-semibold uppercase tracking-[0.25em] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {activeHighlight.eyebrow}
              </p>
              <h3 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
                {activeHighlight.title}
              </h3>
              <p className={`max-w-2xl text-base leading-7 sm:text-lg ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {activeHighlight.description}
              </p>
              {activeHighlight.metrics.length > 0 && (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {activeHighlight.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className={`rounded-2xl border p-4 ${
                        isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <p className={`text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-slate-950'
                      }`}>
                        {metric.value}
                      </p>
                      <p className={`mt-1 text-sm leading-5 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {activeHighlight.quotes.length > 0 && (
                <div className="mt-6 grid gap-4">
                  {activeHighlight.quotes.map((quote, index) => (
                    <blockquote
                      key={typeof quote === 'string' ? quote : `${quote.emphasis}-${index}`}
                      className={`rounded-2xl border-l-4 px-5 py-4 text-sm leading-7 italic ${activeHighlight.quoteTheme}`}
                    >
                      {activeHighlight.quoteHeading && (
                        <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.18em] not-italic ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {activeHighlight.quoteHeading}
                        </p>
                      )}
                      <p>
                        {typeof quote === 'string' ? (
                          quote
                        ) : (
                          <>
                            {quote.lead}
                            <strong>{quote.emphasis}</strong>
                            {quote.tail}
                          </>
                        )}
                      </p>
                      <div className={`mt-3 flex items-center justify-end gap-2 text-xs not-italic ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <span>-</span>
                        <QuoteIcon size={14} />
                        <span>{activeHighlight.quoteAttributions?.[index] || activeHighlight.quoteAttribution || 'Anonymous Student'}</span>
                      </div>
                    </blockquote>
                  ))}
                </div>
              )}
              {activeHighlight.routeGpxUrl && (
                <RouteMap
                  gpxUrl={activeHighlight.routeGpxUrl}
                  title={activeHighlight.routeTitle || 'Route map'}
                  theme={theme}
                />
              )}
              <a
                href={activeHighlight.href}
                target={activeHighlight.href.startsWith('http') ? '_blank' : undefined}
                rel={activeHighlight.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                <span>{activeHighlight.ctaLabel}</span>
                <ArrowUpRight size={16} />
              </a>
            </div>

            <div className={`relative overflow-hidden rounded-[1.5rem] border p-6 ${
              isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-white'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${activeHighlight.accent}`}></div>
              <div className="relative">
                {activeHighlight.images.length > 0 ? (
                  <div className="flex min-h-full flex-col justify-center gap-8 py-4">
                    {activeHighlight.images.map((image) => (
                      <div
                        key={image.alt}
                        className={`flex items-center justify-center ${image.wrapperClassName || ''}`}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className={`block max-h-full max-w-full rounded-[1.25rem] ${image.className || 'w-full object-cover'}`}
                        />
                      </div>
                    ))}
                    {activeHighlight.imageEmbed && (
                      <div className={`overflow-hidden rounded-[1.25rem] border ${
                        isDark ? 'border-white/10 bg-slate-950/80' : 'border-slate-200 bg-white/90'
                      }`}>
                        <iframe
                          src={activeHighlight.imageEmbed.src}
                          title={activeHighlight.imageEmbed.title}
                          className="aspect-video w-full"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`flex min-h-[18rem] items-center justify-center rounded-[1.25rem] border-2 border-dashed p-6 text-center ${
                    isDark
                      ? 'border-white/15 bg-white/5 text-slate-300'
                      : 'border-slate-300 bg-white/70 text-slate-600'
                  }`}>
                    <div>
                      <div className={`mx-auto mb-3 inline-flex rounded-2xl p-3 ${
                        isDark ? 'bg-white/10' : 'bg-slate-100'
                      }`}>
                        <ActiveIcon size={24} className={isDark ? 'text-white' : 'text-slate-900'} />
                      </div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                        Image Placeholder
                      </p>
                      <p className="mt-2 text-sm">
                        Add visuals for this highlight here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RouteMap({ gpxUrl, title, theme }) {
  const isDark = theme === 'dark';
  const [route, setRoute] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadRoute = async () => {
      try {
        const response = await fetch(gpxUrl);
        const gpxText = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(gpxText, 'application/xml');
        const trackPoints = Array.from(xml.getElementsByTagName('trkpt')).map((point) => ({
          lat: Number(point.getAttribute('lat')),
          lon: Number(point.getAttribute('lon')),
        }));

        if (trackPoints.length < 2) {
          throw new Error('Route is missing track points.');
        }

        const lats = trackPoints.map((point) => point.lat);
        const lons = trackPoints.map((point) => point.lon);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const width = 960;
        const padding = 20;
        const maxHeight = 560;
        const minHeight = 320;
        const tileSize = 256;
        const projectWorld = (lat, lon, zoom) => {
          const scale = tileSize * 2 ** zoom;
          const x = ((lon + 180) / 360) * scale;
          const sinLat = Math.sin((lat * Math.PI) / 180);
          const y =
            (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
          return { x, y };
        };

        let selectedZoom = 6;
        let bounds = null;
        let height = minHeight;

        for (let zoom = 13; zoom >= 6; zoom -= 1) {
          const projected = trackPoints.map((point) => projectWorld(point.lat, point.lon, zoom));
          const minX = Math.min(...projected.map((point) => point.x));
          const maxX = Math.max(...projected.map((point) => point.x));
          const minY = Math.min(...projected.map((point) => point.y));
          const maxY = Math.max(...projected.map((point) => point.y));
          const spanX = Math.max(maxX - minX, 1);
          const spanY = Math.max(maxY - minY, 1);
          const candidateHeight = Math.max(
            minHeight,
            Math.min(maxHeight, ((width - padding * 2) * spanY) / spanX + padding * 2)
          );

          if (spanX <= width - padding * 2 && spanY <= candidateHeight - padding * 2) {
            selectedZoom = zoom;
            bounds = { minX, maxX, minY, maxY, projected };
            height = candidateHeight;
            break;
          }
        }

        if (!bounds) {
          const projected = trackPoints.map((point) => projectWorld(point.lat, point.lon, selectedZoom));
          const minX = Math.min(...projected.map((point) => point.x));
          const maxX = Math.max(...projected.map((point) => point.x));
          const minY = Math.min(...projected.map((point) => point.y));
          const maxY = Math.max(...projected.map((point) => point.y));
          bounds = { minX, maxX, minY, maxY, projected };
          height = maxHeight;
        }

        const spanX = Math.max(bounds.maxX - bounds.minX, 1);
        const spanY = Math.max(bounds.maxY - bounds.minY, 1);
        const scale = Math.min(
          (width - padding * 2) / spanX,
          (height - padding * 2) / spanY
        );
        const offsetX = (width - spanX * scale) / 2;
        const offsetY = (height - spanY * scale) / 2;
        const toViewport = (point) => ({
          x: offsetX + (point.x - bounds.minX) * scale,
          y: offsetY + (point.y - bounds.minY) * scale,
        });

        const polylinePoints = bounds.projected
          .map((point) => {
            const view = toViewport(point);
            return `${view.x.toFixed(2)},${view.y.toFixed(2)}`;
          })
          .join(' ');

        const tileMinX = Math.floor(bounds.minX / tileSize);
        const tileMaxX = Math.floor(bounds.maxX / tileSize);
        const tileMinY = Math.floor(bounds.minY / tileSize);
        const tileMaxY = Math.floor(bounds.maxY / tileSize);
        const tiles = [];

        for (let x = tileMinX; x <= tileMaxX; x += 1) {
          for (let y = tileMinY; y <= tileMaxY; y += 1) {
            const topLeft = toViewport({ x: x * tileSize, y: y * tileSize });
            const bottomRight = toViewport({ x: (x + 1) * tileSize, y: (y + 1) * tileSize });
            tiles.push({
              key: `${selectedZoom}-${x}-${y}`,
              href: `https://tile.openstreetmap.org/${selectedZoom}/${x}/${y}.png`,
              x: topLeft.x,
              y: topLeft.y,
              width: bottomRight.x - topLeft.x,
              height: bottomRight.y - topLeft.y,
            });
          }
        }

        if (!cancelled) {
          setRoute({
            height,
            tiles,
            polylinePoints,
            start: {
              ...toViewport(bounds.projected[0]),
            },
            finish: {
              ...toViewport(bounds.projected[trackPoints.length - 1]),
            },
          });
        }
      } catch (error) {
        if (!cancelled) {
          setRoute({ error: true });
        }
      }
    };

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [gpxUrl]);

  return (
    <div className="-mt-2 mb-2 flex justify-center overflow-hidden rounded-[1rem]">
        {route?.error ? (
          <div className={`flex h-80 items-center justify-center text-sm ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Unable to load route map.
          </div>
        ) : route ? (
          <svg
            viewBox={`0 0 960 ${route.height}`}
            className="h-[28rem] w-full max-w-4xl"
            role="img"
            aria-label={title}
          >
            <rect width="960" height={route.height} fill={isDark ? '#020617' : '#ffffff'} />
            {route.tiles.map((tile) => (
              <image
                key={tile.key}
                href={tile.href}
                x={tile.x}
                y={tile.y}
                width={tile.width}
                height={tile.height}
                preserveAspectRatio="none"
                opacity={isDark ? '0.75' : '1'}
              />
            ))}
            {isDark && (
              <rect width="960" height={route.height} fill="#020617" opacity="0.28" />
            )}
            <polyline
              points={route.polylinePoints}
              fill="none"
              stroke={isDark ? '#fb923c' : '#ea580c'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.25"
            />
            <polyline
              points={route.polylinePoints}
              fill="none"
              stroke={isDark ? '#fdba74' : '#f97316'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={route.start.x} cy={route.start.y} r="8" fill={isDark ? '#38bdf8' : '#0284c7'} />
            <circle cx={route.finish.x} cy={route.finish.y} r="8" fill={isDark ? '#4ade80' : '#16a34a'} />
            <text
              x={route.start.x + 14}
              y={route.start.y - 10}
              fill={isDark ? '#e2e8f0' : '#0f172a'}
              fontSize="18"
              fontWeight="700"
            >
              Start
            </text>
            <text
              x={route.finish.x + 14}
              y={route.finish.y - 10}
              fill={isDark ? '#e2e8f0' : '#0f172a'}
              fontSize="18"
              fontWeight="700"
            >
              Finish
            </text>
            <rect
              x="16"
              y={route.height - 34}
              width="186"
              height="20"
              rx="10"
              fill={isDark ? 'rgba(2,6,23,0.8)' : 'rgba(255,255,255,0.9)'}
            />
            <text
              x="28"
              y={route.height - 20}
              fill={isDark ? '#cbd5e1' : '#475569'}
              fontSize="12"
            >
              Map data © OpenStreetMap
            </text>
          </svg>
        ) : (
          <div className={`flex h-80 items-center justify-center text-sm ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Loading route map...
          </div>
        )}
    </div>
  );
}

// Hero component with the slider below it
export default function Hero({ theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <>
      <div
        id="about"
        className={`transition-colors duration-300 ${
          isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-950'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-3xl ${
                  isDark ? 'bg-blue-600 opacity-20' : 'bg-sky-300 opacity-40'
                }`}></div>
                <img
                  src="me.jpg"
                  alt="Tyler Wallett"
                  className={`relative rounded-full border-4 shadow-2xl ${
                    isDark ? 'border-slate-700' : 'border-white'
                  }`}
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
              <p className={`mb-4 text-xl leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Venezuelan 🇻🇪 and Canadian 🇨🇦. Deeply passionate 💖 about computers 💻, specifically teaching computers 👨‍🏫 how to learn from lots and lots of data 🗂️.
              </p>
            </div>
          </div>
        </div>
      </div>

      <HighlightsSection theme={theme} />
      
      {/* Company logos slider */}
      <CompanyLogosSlider theme={theme} />
      
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
          border-right: 3px solid currentColor;
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
