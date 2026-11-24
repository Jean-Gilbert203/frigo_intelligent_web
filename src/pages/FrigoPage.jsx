import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Refrigerator } from 'lucide-react';
import { messageErreur } from '../api/client.js';
import { fermerPorte, ouvrirPorte } from '../api/porte.js';
import { consommer, jeterLot } from '../api/stocks.js';
import Bandeau from '../components/Bandeau.jsx';
import CompartimentCarte from '../components/CompartimentCarte.jsx';
import PorteBarre from '../components/PorteBarre.jsx';
import useUtilisateur from '../context/useUtilisateur.js';
import usePorte from '../hooks/usePorte.js';
import useStocks from '../hooks/useStocks.js';
import useTempsReel from '../hooks/useTempsReel.js';
import { formaterDate } from '../utils/format.js';
import FrigoPortes from '../components/FrigoPortes.jsx';
import PanneauDemo from '../components/PanneauDemo.jsx';

export default function FrigoPage() {
  const { utilisateur, quitter } = useUtilisateur();
  const navigate = useNavigate();
  const { compartiments, chargement, erreur, recharger: rechargerStocks } = useStocks();
  const { porte, recuLe, appliquer, recharger: rechargerPorte } = usePorte();

  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState(null);
  const [panneauDemo, setPanneauDemo] = useState(false);

  // Triple clic sur le titre : ouvre le panneau caché de démonstration
  const clicTitre = (evenement) => {
    if (evenement.detail === 3) setPanneauDemo(true);
  };
  const minuteur = useRef(null);

  const estAdmin = utilisateur.role === 'ADMIN';
  const porteOuverte = Boolean(porte?.ouverte);
  // L'alerte se déduit de l'état envoyé par le serveur : elle dure jusqu'à la fermeture
  const alerte = Boolean(porte?.ouverte && porte?.alerteEnvoyee);

  // Message affiché 4 secondes en bas de l'écran
  const afficher = useCallback((type, texte) => {
    clearTimeout(minuteur.current);
    setMessage({ type, texte });
    minuteur.current = setTimeout(() => setMessage(null), 4000);
  }, []);

  useEffect(() => () => clearTimeout(minuteur.current), []);

  const toutRecharger = () => {
    rechargerStocks();
    rechargerPorte();
  };

  const { connecte } = useTempsReel(
    {
      '/topic/porte': () => rechargerPorte(),
      '/topic/stocks': () => rechargerStocks(),
      
    },
    toutRecharger,
  );

  const ouvrir = async () => {
    setOccupe(true);
    try {
      appliquer(await ouvrirPorte());
    } catch (e) {
      afficher('erreur', messageErreur(e));
      rechargerPorte();
    } finally {
      setOccupe(false);
    }
  };

  const fermer = async () => {
    setOccupe(true);
    try {
      appliquer(await fermerPorte());
    } catch (e) {
      afficher('erreur', messageErreur(e));
      rechargerPorte();
    } finally {
      setOccupe(false);
    }
  };

  const prendre = async (aliment, quantite) => {
    setOccupe(true);
    try {
      await consommer(aliment.idDictionnaire, quantite);
      afficher('succes', `Vous avez pris ${quantite} × ${aliment.nom}`);
    } catch (e) {
      afficher('erreur', messageErreur(e));
    } finally {
      toutRecharger();
      setOccupe(false);
    }
  };

  const jeter = async (aliment, lot) => {
    const texte = `Jeter le lot de ${lot.quantite} × ${aliment.nom} (${formaterDate(lot.datePeremption)}) ?`;
    if (!window.confirm(texte)) return;
    setOccupe(true);
    try {
      await jeterLot(lot.id);
      afficher('succes', 'Lot jeté');
    } catch (e) {
      afficher('erreur', messageErreur(e));
    } finally {
      rechargerStocks();
      setOccupe(false);
    }
  };

  const changerDeProfil = () => {
    quitter();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {alerte && (
        <div
          aria-hidden="true"
          className="alerte-cadre pointer-events-none fixed inset-0 z-30 border-8 border-red-600"
        />
      )}

      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-800 px-4 py-3 text-white shadow">
        <h1 onClick={clicTitre} className="flex select-none items-center gap-2 text-xl font-bold">
          <Refrigerator size={24} /> Frigo intelligent
        </h1>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${connecte ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {connecte ? 'Connecté' : 'Reconnexion…'}
          </span>
          <span className="text-sm">{utilisateur.nom}</span>
          <button
            onClick={changerDeProfil}
            className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
          >
            <LogOut size={16} /> Changer de profil
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4">
        <PorteBarre
          porte={porte}
          recuLe={recuLe}
          occupe={occupe}
          alerte={alerte}
          onOuvrir={ouvrir}
          onFermer={fermer}
        />

        {chargement && <p className="text-slate-500">Chargement du frigo…</p>}
        {erreur && <p className="rounded-xl bg-red-50 p-4 text-red-700">{erreur}</p>}

        {/* <FrigoPortes ouverte={porteOuverte}> */}
          <div className="grid gap-4 md:grid-cols-2">
            {compartiments.map((compartiment) => (
              <CompartimentCarte
                key={compartiment.id}
                compartiment={compartiment}
                porteOuverte={porteOuverte}
                estAdmin={estAdmin}
                occupe={occupe}
                onPrendre={prendre}
                onJeter={jeter}
              />
            ))}
          </div>
        {/* </FrigoPortes> */}
      </main>

      {panneauDemo && <PanneauDemo onFermer={() => setPanneauDemo(false)} />}
      <Bandeau message={message} />
    </div>
  );
}