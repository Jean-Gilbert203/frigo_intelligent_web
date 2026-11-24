import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bell, LayoutDashboard, LogOut, Menu, Plus, ShoppingCart } from 'lucide-react';
import useTempsReel from '../hooks/useTempsReel.js';
import useUtilisateur from '../context/useUtilisateur.js';
import useNotifications from './useNotifications.js';

const ONGLETS = [
  { vers: '/admin', libelle: 'Accueil', icone: LayoutDashboard, exact: true },
  { vers: '/admin/notifications', libelle: 'Alertes', icone: Bell },
  { vers: '/admin/courses', libelle: 'Courses', icone: ShoppingCart },
  { vers: '/admin/ajouter', libelle: 'Ajouter', icone: Plus },
  { vers: '/admin/plus', libelle: 'Plus', icone: Menu },
];

export default function AdminLayout() {
  const { admin, deconnecterAdmin } = useUtilisateur();
  const notifications = useNotifications();

  // Un compteur par canal : quand il change, l'écran concerné relit ses données
  const [versions, setVersions] = useState({ stocks: 0, porte: 0, courses: 0 });
  const incrementer = (cle) => setVersions((v) => ({ ...v, [cle]: v[cle] + 1 }));

  const { connecte } = useTempsReel(
    {
      '/topic/stocks': () => incrementer('stocks'),
      '/topic/porte': () => incrementer('porte'),
      '/topic/courses': () => incrementer('courses'),
      [`/topic/notifications/${admin.id}`]: notifications.recevoir,
    },
    // À chaque (re)connexion : on relit tout, des événements ont pu être manqués
    () => {
      setVersions((v) => ({ stocks: v.stocks + 1, porte: v.porte + 1, courses: v.courses + 1 }));
      notifications.recharger();
    },
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
        <p className="font-semibold">Frigo intelligent</p>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${connecte ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            {connecte ? 'Connecté' : 'Hors ligne'}
          </span>
          <span>{admin.nom}</span>
          <button
            onClick={deconnecterAdmin}
            aria-label="Quitter l'espace admin"
            className="rounded p-1 hover:bg-slate-700"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24">
        <Outlet context={{ versions, connecte, notifications }} />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto flex max-w-xl">
          {ONGLETS.map(({ vers, libelle, icone: Icone, exact }) => (
            <li key={vers} className="flex-1">
              <NavLink
                to={vers}
                end={exact}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-2 text-xs ${
                    isActive ? 'font-semibold text-sky-600' : 'text-slate-500'
                  }`
                }
              >
                <span className="relative">
                  <Icone size={22} />
                  {vers === '/admin/notifications' && notifications.nonLues > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {notifications.nonLues > 9 ? '9+' : notifications.nonLues}
                    </span>
                  )}
                </span>
                {libelle}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}