import { useState } from 'react';
import { motion } from 'framer-motion';
import { getAdminCredentials } from '@/data/adminConfig';
import { setAdminAuthenticated } from '@/data/adminSession';
import { Button } from '@/components/ui/Button';

export function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cred = getAdminCredentials();
    if (login.trim() === cred.login && password === cred.password) {
      setAdminAuthenticated(true);
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0f] px-4">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="glass-strong w-full max-w-md space-y-4 rounded-2xl p-6 sm:p-8"
      >
        <div>
          <h1 className="font-display text-xl text-white">Панель управления</h1>
          <p className="mt-1 text-sm text-zinc-500">Скрытый вход. Ссылка не публикуется на сайте.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Логин</label>
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="ring-focus w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            autoComplete="username"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ring-focus w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-400/90">Неверные данные</p>}
        <Button type="submit" className="w-full" variant="primary">
          Войти
        </Button>
      </motion.form>
    </div>
  );
}
