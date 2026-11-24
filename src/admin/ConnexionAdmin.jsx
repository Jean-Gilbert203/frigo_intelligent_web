import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import client, { messageErreur } from '../api/client.js';
import useUtilisateur from '../context/useUtilisateur.js';

export default function ConnexionAdmin() {
  const { connecterAdmin } = useUtilisateur();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    client
      .get('/api/utilisateurs')
      .then(({ data }) => setAdmins(data.filter((u) => u.role === 'ADMIN')))
      .catch((e) => setErreur(messageErreur(e)));
  }, []);

  const choisir = (profil) => {
    connecterAdmin(profil);
    navigate('/admin', { replace: true });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 p-6">
      <h1 className="text-2xl font-bold text-slate-800">Espace administrateur</h1>
      {erreur && <p className="text-center text-sm text-red-600">{erreur}</p>}
      <ul className="flex flex-wrap justify-center gap-4">
        {admins.map((profil) => (
          <li key={profil.id}>
            <button
              onClick={() => choisir(profil)}
              className="flex w-40 flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm hover:shadow-md"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <ShieldCheck size={32} />
              </span>
              <span className="font-semibold text-slate-800">{profil.nom}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}