import { motion } from 'framer-motion';
import type { Vacancy } from '@/types';
import { VacancyIcon } from './VacancyIcon';
import { useUiSelection } from '@/context/UiSelectionContext';
import { trackEvent } from '@/lib/analytics';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function VacancyGrid({ vacancies }: { vacancies: Vacancy[] }) {
  const { openVacancy } = useUiSelection();
  const list = vacancies.filter((v) => v.enabled).sort((a, b) => a.order - b.order);
  const threePlus = list.length >= 3;
  const containerMax = threePlus ? 'max-w-5xl' : 'max-w-3xl';
  const gridClass = threePlus
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2';

  return (
    <section id="vakansii" className="scroll-mt-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className={`mx-auto w-full ${containerMax}`}>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center font-display text-2xl font-extrabold tracking-tight text-white sm:mb-9 sm:text-3xl"
        >
          Направления
        </motion.h2>

        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className={`mx-auto grid w-full gap-6 sm:gap-6 md:gap-8 ${gridClass}`}
        >
          {list.map((v) => (
            <motion.li key={v.id} variants={item} className="flex h-full min-h-0 w-full justify-center sm:block">
              <motion.div
                className="group relative mx-auto flex h-full min-h-0 w-full max-w-md flex-col sm:mx-0 sm:max-w-none"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <div
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-md transition duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(251,191,36,0.5), rgba(245,158,11,0.15), rgba(180,83,9,0.35))',
                  }}
                />
                <div className="relative flex h-full min-h-0 flex-1 flex-col rounded-2xl bg-gradient-to-br from-amber-400/40 via-amber-500/15 to-orange-950/50 p-[1px] shadow-card">
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent('vacancy_open', { vacancyId: v.id, title: v.title });
                      openVacancy(v.id);
                    }}
                    className="ring-focus relative flex h-full min-h-0 w-full flex-col items-center rounded-2xl border border-white/[0.04] bg-[#0f1117] px-5 pb-5 pt-6 text-center shadow-inner transition duration-300 group-hover:border-amber-500/20 group-hover:bg-[#12141c]"
                  >
                    <VacancyIcon iconId={v.iconId} size={56} />
                    <h3 className="mt-5 shrink-0 font-display text-xl font-bold text-white">{v.title}</h3>
                    <p className="mt-3 min-h-[3.25rem] shrink-0 text-pretty text-sm font-medium leading-snug text-zinc-400 sm:min-h-[3.5rem]">
                      {v.shortDescription}
                    </p>
                    <span className="mt-auto flex w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-[#0b0b0f] shadow-glow-sm transition group-hover:brightness-110">
                      Подробнее
                    </span>
                  </button>
                </div>
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
