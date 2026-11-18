export default function JaugeRemplissage({ remplissage, capaciteMax }) {
  const pourcentage = capaciteMax > 0 ? Math.min(100, Math.round((remplissage / capaciteMax) * 100)) : 0;
  const couleur =
    pourcentage >= 90 ? 'bg-red-500' : pourcentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-slate-600">
        <span>Remplissage</span>
        <span className="font-medium">
          {remplissage} / {capaciteMax}
        </span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={capaciteMax}
        aria-valuenow={remplissage}
      >
        <div className={`h-full rounded-full transition-all ${couleur}`} style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  );
}