import { useId } from 'react';
import type { VacancyIconId } from '@/types';

type GlyphProps = { size?: number; className?: string };

function useGrad(prefix: string) {
  const uid = useId().replace(/:/g, '');
  return {
    fill: `url(#${prefix}-g-${uid})`,
    filter: `url(#${prefix}-f-${uid})`,
    gid: `${prefix}-g-${uid}`,
    fid: `${prefix}-f-${uid}`,
  };
}

/** Пеший курьер (иконка доставки), заливка + градиент */
export function GlyphCourier({ size = 56, className }: GlyphProps) {
  const { fill, filter, gid, fid } = useGrad('c');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <filter id={fid} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={filter}>
        <circle cx="17" cy="45" r="11" fill={fill} />
        <circle cx="47" cy="45" r="11" fill={fill} />
        <circle cx="17" cy="45" r="4.5" fill="#0b0b0f" opacity="0.85" />
        <circle cx="47" cy="45" r="4.5" fill="#0b0b0f" opacity="0.85" />
        <path
          fill={fill}
          d="M17 45 L26 26 L40 26 L47 45 L40 45 L36 32 L30 32 L22 45 Z"
        />
        <path fill={fill} d="M26 26 L22 14 L28 12 L32 22 Z" />
        <rect x="38" y="10" width="16" height="7" rx="3" fill={fill} transform="rotate(8 46 13.5)" />
      </g>
    </svg>
  );
}

/** Перевозчик: фургон */
export function GlyphCarrier({ size = 56, className }: GlyphProps) {
  const { fill, filter, gid, fid } = useGrad('t');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <filter id={fid} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={filter}>
        <path
          fill={fill}
          d="M6 38 V22 Q6 18 10 18 H38 Q42 18 42 22 V38 H6 Z"
        />
        <path fill={fill} d="M42 28 H52 L58 34 V38 H42 V28 Z" />
        <path fill={fill} d="M52 28 V22 Q52 18 48 18 H44 Q42 18 42 20 V28 H52 Z" />
        <circle cx="16" cy="42" r="7" fill={fill} />
        <circle cx="40" cy="42" r="7" fill={fill} />
        <circle cx="52" cy="42" r="7" fill={fill} />
        <circle cx="16" cy="42" r="3" fill="#0b0b0f" opacity="0.9" />
        <circle cx="40" cy="42" r="3" fill="#0b0b0f" opacity="0.9" />
        <circle cx="52" cy="42" r="3" fill="#0b0b0f" opacity="0.9" />
      </g>
    </svg>
  );
}

export function VacancyGlyph({ iconId, size, className }: GlyphProps & { iconId: VacancyIconId }) {
  switch (iconId) {
    case 'courier':
      return <GlyphCourier size={size} className={className} />;
    case 'carrier':
      return <GlyphCarrier size={size} className={className} />;
    default:
      return <GlyphCourier size={size} className={className} />;
  }
}
