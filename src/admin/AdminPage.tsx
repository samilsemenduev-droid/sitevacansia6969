import { useState } from 'react';
import { isAdminAuthenticated } from '@/data/adminSession';
import { AdminLoginForm } from './AdminLoginForm';
import { AdminDashboard } from './AdminDashboard';

export function AdminPage() {
  const [authed, setAuthed] = useState(() => isAdminAuthenticated());

  if (!authed) {
    return <AdminLoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <AdminDashboard />;
}
