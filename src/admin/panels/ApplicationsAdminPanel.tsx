import { listApplications, clearApplications } from '@/data/applicationsRepository';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { ApplicationStatus } from '@/types';

function statusLabel(s: ApplicationStatus): string {
  switch (s) {
    case 'pending':
      return 'Ожидает';
    case 'sent':
      return 'Отправлено';
    case 'failed':
      return 'Ошибка';
  }
}

function statusClass(s: ApplicationStatus): string {
  switch (s) {
    case 'pending':
      return 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25';
    case 'sent':
      return 'bg-emerald-500/12 text-emerald-200 ring-1 ring-emerald-500/20';
    case 'failed':
      return 'bg-red-500/12 text-red-200 ring-1 ring-red-500/25';
  }
}

export function ApplicationsAdminPanel() {
  const [tick, setTick] = useState(0);
  const data = useMemo(() => listApplications(), [tick]);

  const refresh = () => setTick((n) => n + 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={refresh}>
          Обновить список
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-red-400"
          onClick={() => {
            if (confirm('Удалить все заявки из localStorage?')) {
              clearApplications();
              refresh();
            }
          }}
        >
          Очистить всё
        </Button>
      </div>
      <p className="text-xs text-zinc-500">
        Журнал заявок в этом браузере ({data.length} шт.): статусы отражают попытку отправки на сервер и в Telegram.
        Токен бота на сервере не хранится здесь.
      </p>
      <div className="thin-scrollbar max-h-[55vh] overflow-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="sticky top-0 bg-[rgba(15,17,23,0.95)] text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-3 py-2">Создано</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Доставка</th>
              <th className="px-3 py-2">Ушло в TG</th>
              <th className="px-3 py-2">Имя</th>
              <th className="px-3 py-2">Телефон</th>
              <th className="px-3 py-2">Username Telegram</th>
              <th className="px-3 py-2">Город</th>
              <th className="px-3 py-2">Вакансия</th>
              <th className="px-3 py-2">Комментарий</th>
              <th className="px-3 py-2">Ошибка</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="border-t border-white/5">
                <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-500">
                  {new Date(a.createdAt).toLocaleString('ru-RU')}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-lg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${statusClass(a.status)}`}
                  >
                    {statusLabel(a.status)}
                  </span>
                </td>
                <td className="px-3 py-2 text-zinc-300">
                  {a.telegramDelivered ? (
                    <span className="text-emerald-400/95">Да</span>
                  ) : a.status === 'pending' ? (
                    <span className="text-amber-400/90">…</span>
                  ) : (
                    <span className="text-zinc-500">Нет</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-500">
                  {a.sentAt ? new Date(a.sentAt).toLocaleString('ru-RU') : '—'}
                </td>
                <td className="px-3 py-2 text-white">{a.name}</td>
                <td className="px-3 py-2 text-zinc-200">{a.phone}</td>
                <td className="px-3 py-2 font-mono text-sm text-amber-200/90">
                  {a.telegramUsername ? `@${a.telegramUsername}` : '—'}
                </td>
                <td className="px-3 py-2 text-zinc-200">{a.cityName}</td>
                <td className="px-3 py-2 text-zinc-200">{a.vacancyTitle}</td>
                <td className="max-w-[140px] truncate px-3 py-2 text-zinc-400" title={a.comment || undefined}>
                  {a.comment || '—'}
                </td>
                <td
                  className="max-w-[200px] truncate px-3 py-2 text-xs text-red-300/90"
                  title={a.errorMessage || undefined}
                >
                  {a.errorMessage || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="p-6 text-center text-sm text-zinc-500">Пока нет заявок.</p>
        )}
      </div>
    </div>
  );
}
