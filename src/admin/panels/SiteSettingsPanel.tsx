import type { SiteContent } from '@/types';

export function SiteSettingsPanel({
  site,
  onChange,
}: {
  site: SiteContent;
  onChange: (next: SiteContent) => void;
}) {
  const patch = (partial: Partial<SiteContent>) => onChange({ ...site, ...partial });

  return (
    <div className="space-y-4">
      {(
        [
          ['heroBadge', 'Бейдж Hero'],
          ['heroTitle', 'Заголовок Hero'],
          ['heroSubtitle', 'Подзаголовок Hero'],
          ['reviewsChannelUrl', 'Ссылка на канал отзывов'],
          ['platformUrl', 'Ссылка на площадку'],
          ['defaultTelegramUrl', 'Telegram по умолчанию (Связаться)'],
          ['applySectionTitle', 'Заголовок блока заявки'],
          ['applySectionSubtitle', 'Подзаголовок блока заявки'],
          ['footerNote', 'Текст в подвале'],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">{label}</span>
          {key === 'heroSubtitle' || key === 'applySectionSubtitle' || key === 'footerNote' ? (
            <textarea
              value={site[key]}
              onChange={(e) => patch({ [key]: e.target.value } as Partial<SiteContent>)}
              rows={3}
              className="ring-focus w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            />
          ) : (
            <input
              value={site[key]}
              onChange={(e) => patch({ [key]: e.target.value } as Partial<SiteContent>)}
              className="ring-focus w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            />
          )}
        </label>
      ))}
    </div>
  );
}
