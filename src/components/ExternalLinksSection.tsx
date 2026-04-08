import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import { normalizeExternalUrl } from '@/utils/normalizeExternalUrl';
import { Globe2 } from 'lucide-react';

const cardMotion = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-24px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export function ExternalLinksSection({ platformUrl }: { platformUrl: string }) {
  const platformHref = normalizeExternalUrl(platformUrl);

  return (
    <section className="px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <div className="mx-auto w-full max-w-3xl">
        <motion.div
          {...cardMotion}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[rgba(15,17,23,0.9)] to-[rgba(11,11,15,0.95)] p-px shadow-card"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-amber-500/5 opacity-0 transition duration-500 group-hover:opacity-100" />
          <div className="relative flex h-full flex-col gap-5 rounded-[15px] bg-[rgba(15,17,23,0.8)] px-5 py-6 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/[0.08] text-amber-400 shadow-inner">
                <Globe2 className="h-6 w-6" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold tracking-tight text-white">Площадка</h3>
                <p className="text-xs font-medium text-zinc-500">Официальный сайт</p>
              </div>
            </div>
            <motion.a
              href={platformHref || platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('outbound_platform', { href: platformHref || platformUrl })}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 28px -4px rgba(245,158,11,0.4)' }}
              className="mt-auto inline-flex w-full items-center justify-center rounded-xl border border-amber-500/35 bg-gradient-to-r from-amber-600 to-orange-700 px-5 py-3.5 text-sm font-bold text-white shadow-glow-sm ring-focus"
            >
              Перейти на сайт
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
