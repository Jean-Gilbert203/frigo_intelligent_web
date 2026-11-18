import { Navigate, Route, Routes } from 'react-router-dom';
import ChoixAvatar from './pages/ChoixAvatar.jsx';
import FrigoPage from './pages/FrigoPage.jsx';
import useUtilisateur from './context/useUtilisateur.js';

export default function App() {
  const { utilisateur } = useUtilisateur();

  return (
    <Routes>
      <Route path="/" element={<ChoixAvatar />} />
      <Route
        path="/frigo"
        element={utilisateur ? <FrigoPage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}