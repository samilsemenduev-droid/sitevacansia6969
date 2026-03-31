import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-700 text-[#0b0b0f] font-bold shadow-glow hover:brightness-110 active:brightness-95',
  secondary:
    'border border-white/[0.1] bg-white/[0.05] text-zinc-100 shadow-glass backdrop-blur-xl hover:bg-white/[0.09]',
  ghost: 'text-zinc-400 hover:bg-white/[0.06] hover:text-white',
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }
>(function Button(
  { className = '', variant = 'primary', children, loading = false, disabled, ...props },
  ref
) {
  const busy = loading || disabled;
  return (
    <motion.button
      ref={ref}
      whileTap={busy ? undefined : { scale: 0.98 }}
      whileHover={busy ? undefined : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm ring-focus disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
      disabled={busy}
    >
      {loading ? <Loader2 className="h-[1.1em] w-[1.1em] shrink-0 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
      {children}
    </motion.button>
  );
});

export function ButtonLink({
  className = '',
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <motion.a
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02, boxShadow: '0 0 28px -4px rgba(245,158,11,0.4)' }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm ring-focus ${variants.primary} ${className}`}
      {...props}
    >
      {children}
    </motion.a>
  );
}
