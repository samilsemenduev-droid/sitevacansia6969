import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Search, X } from 'lucide-react';
import type { City } from '@/types';
import { useUiSelection } from '@/context/UiSelectionContext';

export function CitySelector({ cities }: { cities: City[] }) {
  const { cityId, setCityId } = useUiSelection();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const enabled = useMemo(
    () => cities.filter((c) => c.enabled).sort((a, b) => a.order - b.order),
    [cities]
  );

  const selected = enabled.find((c) => c.id === cityId) ?? enabled[0] ?? null;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return enabled;
    return enabled.filter((c) => c.name.toLowerCase().includes(needle));
  }, [enabled, q]);

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.45 }}
          className="glass-strong rounded-2xl border border-amber-500/10 p-4 shadow-card sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-700 text-[#0b0b0f] shadow-glow-sm">
                <MapPin className="h-5 w-5" strokeWidth={2.5} aria-hidden />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-white">
                  {selected?.name ?? 'Город'}
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px -4px rgba(245,158,11,0.35)' }}
              whileTap={{ scale: 0.98 }}
              className="ring-focus rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-bold text-amber-100"
            >
              Сменить город
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-md sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal
              initial={{ y: 36, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="glass-strong flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl sm:max-h-[min(80vh,640px)] sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4 sm:px-5">
                <p className="font-display font-bold text-white">Город</p>
                <button
                  type="button"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
                    strokeWidth={2}
                  />
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Поиск…"
                    className="ring-focus w-full rounded-xl border border-white/[0.08] bg-[#0b0b0f] py-3 pl-10 pr-3 text-sm text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>
              <ul className="thin-scrollbar flex-1 overflow-y-auto px-2 py-2 sm:px-3">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCityId(c.id);
                        setOpen(false);
                        setQ('');
                      }}
                      className={`flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                        c.id === selected?.id
                          ? 'bg-amber-500/15 text-amber-100'
                          : 'text-zinc-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      {c.name}
                      {c.id === selected?.id && (
                        <span className="ml-auto text-xs font-bold text-amber-500">✓</span>
                      )}
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && (
                  <li className="px-3 py-8 text-center text-sm text-zinc-600">Нет совпадений</li>
                )}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
