import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ShieldCheck, UserRound } from 'lucide-react';
import { lireUtilisateurs } from '../api/utilisateurs.js';
import { messageErreur } from '../api/client.js';
import useUtilisateur from '../context/useUtilisateur.js';

export default function ChoixAvatar() {
  const { choisir } = useUtilisateur();
  const navigate = useNavigate();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let annule = false;
    lireUtilisateurs()
      .then((liste) => {
        if (!annule) setUtilisateurs(liste);
      })
      .catch((e) => {
        if (!annule) setErreur(messageErreur(e));
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, [essai]);

  const reessayer = () => {
    setErreur(null);
    setChargement(true);
    setEssai((n) => n + 1);
  };

  const selectionner = (profil) => {
    choisir(profil);
    navigate('/frigo');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-100 p-6">
      <h1 className="text-3xl font-bold text-slate-800">Qui êtes-vous ?</h1>

      {chargement && <p className="text-slate-500">Chargement des profils…</p>}

      {erreur && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-red-50 p-6 text-red-700">
          <p>{erreur}</p>
          <button
            onClick={reessayer}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            <RefreshCw size={18} /> Réessayer
          </button>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-6">
        {utilisateurs.map((u) => (
          <button
            key={u.id}
            onClick={() => selectionner(u)}
            className="flex w-40 flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow transition hover:shadow-lg focus-visible:outline-2 focus-visible:outline-sky-500"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <UserRound size={40} />
            </span>
            <span className="text-lg font-semibold text-slate-800">{u.nom}</span>
            {/* {u.role === 'ADMIN' && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                <ShieldCheck size={14} /> Admin
              </span>
            )} */}
          </button>
        ))}
      </div>
    </main>
  );
}