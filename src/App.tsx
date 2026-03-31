import { useEffect, useLayoutEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { HomePage } from '@/pages/HomePage';
import { AdminPage } from '@/admin/AdminPage';

export default function App() {
  useLayoutEffect(() => {
    if (import.meta.env.DEV) {
      console.info('[vacansia] App: useLayoutEffect (dev — этап после commit дерева)');
    }
  }, []);

  useEffect(() => {
    console.info('[vacansia] App: mounted');
  }, []);

  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.adminPanel} element={<AdminPage />} />
    </Routes>
  );
}
