import { useEffect, useState } from 'react';
import { DoorClosed, DoorOpen } from 'lucide-react';

// Le chronomètre repart à zéro à chaque nouvelle lecture 
function Chrono({ depart }) {
  const [ecoule, setEcoule] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setEcoule((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const total = depart + ecoule;
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const secondes = String(total % 60).padStart(2, '0');
  return <span className="tabular-nums">{minutes}:{secondes}</span>;
}

export default function PorteBarre({ porte, recuLe, occupe, alerte, onOuvrir, onFermer }) {
  if (!porte) {
    return <div className="rounded-xl bg-white p-4 text-slate-500 shadow">Lecture de l'état de la porte…</div>;
  }
  const ouverte = porte.ouverte;
  const fond = alerte
    ? 'alerte-clignotante'
    : ouverte
      ? 'bg-amber-100 text-amber-900'
      : 'bg-white text-slate-700';

  return (
    <div
      role={alerte ? 'alert' : undefined}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 shadow ${fond}`}
    >
      <div className="flex items-center gap-3">
        {ouverte ? <DoorOpen size={28} /> : <DoorClosed size={28} />}
        <div>
          <p className="font-semibold">{ouverte ? 'Porte ouverte' : 'Porte fermée'}</p>
          {ouverte && (
            <p className="text-sm">
              Ouverte par {porte.nomUtilisateur} · <Chrono key={recuLe} depart={porte.dureeSecondes} />
            </p>
          )}
          {alerte && (
            <p className="text-sm font-semibold">
              Attention : la porte est ouverte depuis trop longtemps. Fermez-la !
            </p>
          )}
        </div>
      </div>
      <button
        onClick={ouverte ? onFermer : onOuvrir}
        disabled={occupe}
        className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ouverte ? 'Fermer la porte' : 'Ouvrir la porte'}
      </button>
    </div>
  );
}