import { motion } from 'framer-motion';
import type { VacancyIconId } from '@/types';
import { VacancyGlyph } from './icons/VacancyGlyphs';

type Props = {
  iconId: VacancyIconId;
  /** Размер SVG (px) */
  size?: number;
  /** Крупный блок с подложкой-свечением */
  variant?: 'card' | 'inline';
};

export function VacancyIcon({ iconId, size = 56, variant = 'card' }: Props) {
  if (variant === 'inline') {
    return (
      <VacancyGlyph
        iconId={iconId}
        size={size}
        className="drop-shadow-[0_0_16px_rgba(245,158,11,0.5)]"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="relative flex items-center justify-center"
      style={{ width: size + 20, height: size + 20 }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 40%, rgba(251,191,36,0.35), transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
      <div className="relative flex items-center justify-center rounded-2xl bg-[rgba(15,17,23,0.8)] p-2 ring-1 ring-amber-500/25">
        <VacancyGlyph
          iconId={iconId}
          size={size}
          className="drop-shadow-[0_0_14px_rgba(245,158,11,0.45)]"
        />
      </div>
    </motion.div>
  );
}
