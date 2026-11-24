import { useOutletContext } from 'react-router-dom';
import { Bell, Clock, DoorOpen, Info, Package, ShoppingCart, Thermometer } from 'lucide-react';
import { ilYa } from '../../utils/temps.js';

const STYLES = {
  PORTE_OUVERTE: { icone: DoorOpen, couleur: 'bg-amber-100 text-amber-700' },
  PEREMPTION: { icone: Clock, couleur: 'bg-orange-100 text-orange-700' },
  STOCK_FAIBLE: { icone: Package, couleur: 'bg-amber-100 text-amber-700' },
  RUPTURE_STOCK: { icone: Package, couleur: 'bg-red-100 text-red-700' },
  TEMPERATURE: { icone: Thermometer, couleur: 'bg-sky-100 text-sky-700' },
  RAPPEL_COURSES: { icone: ShoppingCart, couleur: 'bg-emerald-100 text-emerald-700' },
  INFORMATION: { icone: Info, couleur: 'bg-slate-100 text-slate-700' },
};

export default function Notifications() {
  const { notifications } = useOutletContext();
  const { liste, nonLues, erreur, marquerLue, toutLire } = notifications;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
        {nonLues > 0 && (
          <button onClick={toutLire} className="text-sm font-medium text-sky-600">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {erreur && <p className="mb-2 text-sm text-red-600">{erreur}</p>}

      {liste.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
          <Bell size={32} />
          <p>Aucune notification</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {liste.map((n) => {
            const style = STYLES[n.type] ?? STYLES.INFORMATION;
            const Icone = style.icone;
            return (
              <li key={n.id}>
                <button
                  onClick={() => !n.lu && marquerLue(n.id)}
                  className={`flex w-full items-start gap-3 rounded-xl p-3 text-left shadow-sm ${
                    n.lu ? 'bg-white' : 'bg-sky-50 ring-1 ring-sky-200'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.couleur}`}
                  >
                    <Icone size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">{n.titre}</span>
                      <span className="shrink-0 text-xs text-slate-400">{ilYa(n.dateEnvoi)}</span>
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-600">{n.message}</span>
                  </span>
                  {!n.lu && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}