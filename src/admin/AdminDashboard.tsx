import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSiteData } from '@/context/SiteDataContext';
import { setAdminAuthenticated } from '@/data/adminSession';
import { Button } from '@/components/ui/Button';
import { SiteSettingsPanel } from './panels/SiteSettingsPanel';
import { CitiesAdminPanel } from './panels/CitiesAdminPanel';
import { VacanciesAdminPanel } from './panels/VacanciesAdminPanel';
import { ApplicationsAdminPanel } from './panels/ApplicationsAdminPanel';
import { DataToolsPanel } from './panels/DataToolsPanel';

const TABS = [
  { id: 'site' as const, label: 'Контент сайта' },
  { id: 'cities' as const, label: 'Города' },
  { id: 'vacancies' as const, label: 'Вакансии' },
  { id: 'apps' as const, label: 'Заявки' },
  { id: 'data' as const, label: 'Импорт / экспорт' },
];

export function AdminDashboard() {
  const { data, setData, reload } = useSiteData();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('site');
  const navigate = useNavigate();

  const logout = () => {
    setAdminAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] px-4 py-8 sm:px-6">
      <header className="mx-auto mb-8 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-display text-2xl text-white">Панель управления</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Контент сохраняется в localStorage этого браузера. Секретный URL не указан в меню сайта.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className="ring-focus inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white hover:bg-white/[0.1]"
          >
            На сайт
          </Link>
          <Button type="button" variant="secondary" onClick={logout}>
            Выйти
          </Button>
        </div>
      </header>

      <nav className="mx-auto mb-6 flex max-w-6xl flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? 'bg-amber-500/20 text-amber-100'
                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[rgba(15,17,23,0.4)] p-4 sm:p-6">
        {tab === 'site' && (
          <SiteSettingsPanel
            site={data.site}
            onChange={(site) => setData({ ...data, site })}
          />
        )}
        {tab === 'cities' && (
          <CitiesAdminPanel
            cities={data.cities}
            onChange={(cities) => setData({ ...data, cities })}
          />
        )}
        {tab === 'vacancies' && (
          <VacanciesAdminPanel
            vacancies={data.vacancies}
            cities={data.cities}
            onChange={(vacancies) => setData({ ...data, vacancies })}
          />
        )}
        {tab === 'apps' && <ApplicationsAdminPanel />}
        {tab === 'data' && <DataToolsPanel data={data} onReload={reload} />}
      </main>
    </div>
  );
}
