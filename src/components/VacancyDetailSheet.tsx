import { CONTACT_TELEGRAM_URL } from '@/config/contactTelegram';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import type { VacancyDetail, VacancyIconId } from '@/types';
import { Button, ButtonLink } from './ui/Button';
import { trackEvent } from '@/lib/analytics';
import { VacancyIcon } from './VacancyIcon';
import { useState } from 'react';

function FaqBlock({ items }: { items: VacancyDetail['faq'] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Вопросы</h4>
      <ul className="space-y-2">
        {items.map((f) => {
          const open = openId === f.id;
          return (
            <li key={f.id} className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-white"
                onClick={() => setOpenId(open ? null : f.id)}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-xs text-amber-400 transition ${
                    open ? 'rotate-90' : ''
                  }`}
                >
                  ›
                </span>
                <span>{f.question}</span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-white/[0.06] px-4 pb-3 pl-[3.25rem] pt-2 text-sm text-zinc-400">
                      {f.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function VacancyDetailSheet({
  title,
  iconId,
  detail,
  onClose,
}: {
  title: string;
  iconId: VacancyIconId;
  detail: VacancyDetail;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 48, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 28, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="thin-scrollbar relative z-[61] max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/[0.1] bg-[#0f1117] shadow-card sm:max-h-[88vh] sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[rgba(15,17,23,0.95)] px-4 py-4 backdrop-blur-xl sm:px-6">
          <h3 className="font-display text-lg font-bold text-white sm:text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="relative px-4 pb-6 pt-5 sm:px-6">
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-500/15 blur-[50px]" />

          <div className="relative mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-full bg-amber-400/20 blur-2xl" />
              <VacancyIcon iconId={iconId} size={88} />
            </div>
          </div>

          <p className="relative text-center text-sm font-semibold leading-snug text-amber-100/90">
            {detail.premiumLead}
          </p>

          <div className="relative mt-6 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Работа</p>
              <p className="mt-1 text-sm text-zinc-300">{detail.workDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500/90">Деньги</p>
                <p className="mt-1 text-sm font-bold text-white">{detail.pay}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">График</p>
                <p className="mt-1 text-sm text-zinc-300">{detail.schedule}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Детали</p>
              <p className="mt-1 text-sm text-zinc-400">{detail.details}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Условия</p>
              <p className="mt-1 text-sm text-zinc-400">{detail.conditions}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Нужно</p>
              <p className="mt-1 text-sm text-zinc-400">{detail.requirements}</p>
            </div>

            <FaqBlock items={detail.faq} />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <ButtonLink
                href={CONTACT_TELEGRAM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('telegram_connect', { href: CONTACT_TELEGRAM_URL })}
                className="w-full flex-1 font-bold"
              >
                Связаться
                <ExternalLink className="h-4 w-4 opacity-90" strokeWidth={2} />
              </ButtonLink>
              <Button type="button" variant="secondary" className="flex-1 font-semibold" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
