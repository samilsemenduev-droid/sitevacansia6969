import { motion } from 'framer-motion';

function scrollToVacancies() {
  document.getElementById('vakansii')?.scrollIntoView({ behavior: 'smooth' });
}

export function Hero({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-amber-500/20 blur-[100px]"
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.06, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-1/4 bottom-0 h-[360px] w-[360px] rounded-full bg-orange-600/15 blur-[90px]"
          animate={{ opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 blur-[80px]"
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {badge ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-5 inline-block rounded-full border border-amber-500/30 bg-amber-500/[0.12] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            {badge}
          </motion.p>
        ) : null}

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl sm:leading-[1.02]"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-5 max-w-lg text-sm font-medium leading-relaxed text-zinc-400 sm:text-base"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex justify-center"
        >
          <motion.button
            type="button"
            onClick={scrollToVacancies}
            whileHover={{ scale: 1.03, boxShadow: '0 0 40px -6px rgba(245,158,11,0.5)' }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-700 px-9 py-4 text-sm font-bold text-[#0b0b0f] shadow-glow transition-[filter] duration-300 hover:brightness-110"
          >
            Смотреть направления
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
