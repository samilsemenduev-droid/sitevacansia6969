import { useRef } from 'react';
import type { SiteData } from '@/types';
import { exportSiteDataJson, importSiteDataJson, resetSiteDataToDefault } from '@/data/siteRepository';
import { Button } from '@/components/ui/Button';

export function DataToolsPanel({
  data,
  onReload,
}: {
  data: SiteData;
  onReload: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([exportSiteDataJson(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sitevacansia-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    const next = importSiteDataJson(text);
    if (next) {
      onReload();
      alert('Импорт выполнен.');
    } else {
      alert('Не удалось разобрать JSON.');
    }
    e.target.value = '';
  };

  const reset = () => {
    if (!confirm('Сбросить все данные сайта к заводским? Города и правки пропадут.')) return;
    resetSiteDataToDefault();
    onReload();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Экспорт и импорт затрагивают города, вакансии и тексты. Заявки хранятся отдельным ключом в
        localStorage.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="primary" onClick={download}>
          Скачать JSON
        </Button>
        <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
          Загрузить JSON
        </Button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onFile} />
        <Button type="button" variant="ghost" className="text-red-400" onClick={reset}>
          Сброс к умолчаниям
        </Button>
      </div>
    </div>
  );
}
