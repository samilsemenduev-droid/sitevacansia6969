import { useMemo, useState } from 'react';
import type { City } from '@/types';
import { newId } from '@/utils/id';
import { Button } from '@/components/ui/Button';

export function CitiesAdminPanel({
  cities,
  onChange,
}: {
  cities: City[];
  onChange: (next: City[]) => void;
}) {
  const [q, setQ] = useState('');
  const [newName, setNewName] = useState('');

  const sorted = useMemo(
    () => [...cities].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ru')),
    [cities]
  );

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return sorted;
    return sorted.filter((c) => c.name.toLowerCase().includes(n));
  }, [sorted, q]);

  const updateCity = (id: string, patch: Partial<City>) => {
    onChange(cities.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCity = (id: string) => {
    onChange(cities.filter((c) => c.id !== id));
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = sorted.findIndex((c) => c.id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    onChange(
      cities.map((c) => {
        if (c.id === a.id) return { ...c, order: b.order };
        if (c.id === b.id) return { ...c, order: a.order };
        return c;
      })
    );
  };

  const addCity = () => {
    const name = newName.trim();
    if (!name) return;
    const maxOrder = Math.max(-1, ...cities.map((c) => c.order));
    onChange([
      ...cities,
      { id: newId('city'), name, enabled: true, order: maxOrder + 1 },
    ]);
    setNewName('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">
            Поиск
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Фильтр по названию"
            className="ring-focus w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
          />
        </div>
        <div className="flex flex-1 gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Новый город"
            className="ring-focus flex-1 rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
          />
          <Button type="button" variant="secondary" onClick={addCity}>
            Добавить
          </Button>
        </div>
      </div>

      <div className="thin-scrollbar max-h-[60vh] overflow-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-0 bg-[rgba(15,17,23,0.95)] text-xs uppercase tracking-wider text-zinc-500 backdrop-blur">
            <tr>
              <th className="px-3 py-2">Город</th>
              <th className="px-3 py-2">Активен</th>
              <th className="px-3 py-2">Порядок</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="px-3 py-2">
                  <input
                    value={c.name}
                    onChange={(e) => updateCity(c.id, { name: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-[rgba(11,11,15,0.6)] px-2 py-1.5 text-sm text-white"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={c.enabled}
                    onChange={(e) => updateCity(c.id, { enabled: e.target.checked })}
                    className="h-4 w-4 accent-amber-500"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                      onClick={() => move(c.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                      onClick={() => move(c.id, 1)}
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="text-xs text-red-400/90 hover:underline"
                    onClick={() => removeCity(c.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500">
        Показано {filtered.length} из {sorted.length}. Полный список хранится локально в браузере.
      </p>
    </div>
  );
}
