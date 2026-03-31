import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { HomePage } from '@/pages/HomePage';
import { AdminPage } from '@/admin/AdminPage';

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.adminPanel} element={<AdminPage />} />
    </Routes>
  );
}
