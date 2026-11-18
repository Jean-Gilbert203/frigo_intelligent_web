import { Refrigerator } from 'lucide-react';

// Angle d'ouverture : 100° place les portes de chant sur les côtés, sans cacher le contenu
const ANGLE_OUVERTURE = 100;

function Porte({ cote, ouverte }) {
  const gauche = cote === 'gauche';
  const angle = ouverte ? (gauche ? -ANGLE_OUVERTURE : ANGLE_OUVERTURE) : 0;

  return (
    <div
      className="porte-frigo pointer-events-none absolute inset-y-0 z-20 w-1/2"
      style={{
        [gauche ? 'left' : 'right']: 0,
        transformOrigin: gauche ? 'left center' : 'right center',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${angle}deg)`,
      }}
    >
      {/* Face extérieure */}
      <div
        className="absolute inset-0 rounded-xl border border-slate-400 shadow-xl"
        style={{
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #e5e7eb, #cbd5e1 45%, #e2e8f0)',
        }}
      >
        {gauche && (
          <span className="absolute left-4 top-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Refrigerator size={18} /> Frigo intelligent
          </span>
        )}
        <span
          className={`absolute top-1/2 h-32 w-3 -translate-y-1/2 rounded-full bg-slate-500 shadow ${
            gauche ? 'right-4' : 'left-4'
          }`}
        />
      </div>

      {/* Face intérieure : visible pendant le mouvement, quand la porte est ouverte */}
      <div
        className="absolute inset-0 rounded-xl border border-slate-300 bg-slate-100"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      />
    </div>
  );
}

export default function FrigoPortes({ ouverte, children }) {
  return (
    <div
      className="relative min-h-[28rem] rounded-2xl bg-slate-300 p-3 shadow-inner"
      style={{ perspective: '4000px' }}
    >
      {/* Porte fermée : le contenu est masqué une fois les portes refermées */}
      <div
        style={{
          visibility: ouverte ? 'visible' : 'hidden',
          transition: ouverte ? 'visibility 0s' : 'visibility 0s linear 1s',
        }}
      >
        {children}
      </div>
      <Porte cote="gauche" ouverte={ouverte} />
      <Porte cote="droite" ouverte={ouverte} />
    </div>
  );
}