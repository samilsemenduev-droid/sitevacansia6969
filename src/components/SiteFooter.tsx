import { motion } from 'framer-motion';

export function SiteFooter({ note }: { note: string }) {
  return (
    <footer className="border-t border-amber-500/[0.08] px-4 py-10 sm:px-6">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl text-center text-xs font-medium text-zinc-600"
      >
        {note}
      </motion.p>
    </footer>
  );
}
