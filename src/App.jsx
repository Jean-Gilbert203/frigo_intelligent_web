import { Navigate, Route, Routes } from 'react-router-dom';
import ChoixAvatar from './pages/ChoixAvatar.jsx';
import FrigoPage from './pages/FrigoPage.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import ConnexionAdmin from './admin/ConnexionAdmin.jsx';
import Provisoire from './admin/pages/Provisoire.jsx';
import useUtilisateur from './context/useUtilisateur.js';
import { INTERFACE_PAR_DEFAUT } from './utils/interface.js';
import Accueil from './admin/pages/Accueil.jsx';
import Notifications from './admin/pages/Notifications.jsx';
import Courses from './admin/pages/Courses.jsx';
import Historique from './admin/pages/Historique.jsx';
import Plus from './admin/pages/Plus.jsx';
import AjouterStock from './admin/pages/AjouterStock.jsx';
import Dictionnaire from './admin/pages/Dictionnaire.jsx';


export default function App() {
  const { utilisateur, admin } = useUtilisateur();

  return (
    <Routes>
      {/* Interface famille : l'écran du frigo */}
      <Route path="/famille" element={<ChoixAvatar />} />
      <Route
        path="/famille/frigo"
        element={utilisateur ? <FrigoPage /> : <Navigate to="/famille" replace />}
      />

      {/* Interface administrateur : l'application du téléphone */}
      <Route
        path="/admin/connexion"
        element={admin ? <Navigate to="/admin" replace /> : <ConnexionAdmin />}
      />
      <Route
        path="/admin"
        element={admin ? <AdminLayout /> : <Navigate to="/admin/connexion" replace />}
      >
        <Route index element={<Accueil />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="ajouter" element={<AjouterStock />} />
        <Route path="courses" element={<Courses />} />
        <Route path="plus" element={<Plus />} />
        <Route path="historique" element={<Historique />} />
        <Route path="dictionnaire" element={<Dictionnaire />} />
        <Route path="magasins" element={<Provisoire titre="Magasins et GPS" />} />
      </Route>

      {/* Anciennes adresses : elles continuent de fonctionner */}
      <Route path="/frigo" element={<Navigate to="/famille/frigo" replace />} />
      <Route path="/" element={<Navigate to={INTERFACE_PAR_DEFAUT} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}