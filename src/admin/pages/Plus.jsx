import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, DoorClosed, History, LogOut, MapPin } from 'lucide-react';
import { URL_SERVEUR } from '../../api/client.js';
import useUtilisateur from '../../context/useUtilisateur.js';

const LIENS = [
  {
    vers: '/admin/dictionnaire',
    libelle: 'Dictionnaire des aliments',
    detail: 'Ajouter un aliment, régler son seuil',
    icone: BookOpen,
  },
  {
    vers: '/admin/magasins',
    libelle: 'Magasins et GPS',
    detail: 'Carte, simulateur de position',
    icone: MapPin,
  },
  { vers: '/admin/historique', libelle: 'Historique', detail: 'Qui a pris quoi', icone: History },
  {
    vers: '/famille',
    libelle: 'Écran du frigo',
    detail: 'Ouvrir la porte, prendre un aliment',
    icone: DoorClosed,
  },
];

export default function Plus() {
  const { admin, deconnecterAdmin } = useUtilisateur();

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Plus</h1>

      <ul className="space-y-2">
        {LIENS.map(({ vers, libelle, detail, icone: Icone }) => (
          <li key={vers}>
            <Link
              to={vers}
              className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <Icone size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-800">{libelle}</span>
                <span className="block text-sm text-slate-500">{detail}</span>
              </span>
              <ChevronRight className="text-slate-300" size={20} />
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={deconnecterAdmin}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white p-3 font-medium text-slate-700 hover:bg-slate-100"
      >
        <LogOut size={18} /> Se déconnecter 
      </button>

      <p className="text-center text-xs text-slate-400">Serveur : {URL_SERVEUR}</p>
    </section>
  );
}