import { useMemo, useState } from 'react';
import type { City, FaqItem, Vacancy, VacancyDetail, VacancyIconId } from '@/types';
import { deepMerge } from '@/utils/deepMerge';
import { createNewVacancy } from '@/data/factories';
import { Button } from '@/components/ui/Button';

const ICONS: { id: VacancyIconId; label: string }[] = [
  { id: 'courier', label: 'Курьер (вело)' },
  { id: 'carrier', label: 'Водитель / перевоз' },
  { id: 'graffiti', label: 'Граффитчик' },
];

function OptionalField({
  label,
  baseValue,
  patchValue,
  onPatch,
  multiline,
}: {
  label: string;
  baseValue: string;
  patchValue: string | undefined;
  onPatch: (v: string | undefined) => void;
  multiline?: boolean;
}) {
  const has = patchValue !== undefined;
  const value = has ? patchValue : '';
  const common =
    'w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white placeholder:text-zinc-600';
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs uppercase tracking-wider text-zinc-500">
        {label}
        <span className="font-normal normal-case text-zinc-600">
          {has ? 'свой текст' : 'как в базе'}
        </span>
      </span>
      {multiline ? (
        <textarea
          value={value}
          placeholder={baseValue}
          rows={3}
          onChange={(e) => {
            const t = e.target.value;
            onPatch(t === '' ? undefined : t);
          }}
          className={common}
        />
      ) : (
        <input
          value={value}
          placeholder={baseValue}
          onChange={(e) => {
            const t = e.target.value;
            onPatch(t === '' ? undefined : t);
          }}
          className={common}
        />
      )}
    </label>
  );
}

function BaseDetailForm({
  detail,
  onChange,
}: {
  detail: VacancyDetail;
  onChange: (d: VacancyDetail) => void;
}) {
  const set = <K extends keyof VacancyDetail>(k: K, v: VacancyDetail[K]) =>
    onChange({ ...detail, [k]: v });

  const faq = detail.faq;

  const updateFaq = (id: string, patch: Partial<FaqItem>) => {
    set(
      'faq',
      faq.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  };

  const addFaq = () => {
    set('faq', [...faq, { id: `faq-${Date.now()}`, question: '', answer: '' }]);
  };

  const removeFaq = (id: string) => {
    if (faq.length <= 1) return;
    set(
      'faq',
      faq.filter((f) => f.id !== id)
    );
  };

  return (
    <div className="space-y-3">
      {(
        [
          ['premiumLead', 'Премиальный лид', true],
          ['workDescription', 'Описание работы', true],
          ['pay', 'Оплата', false],
          ['details', 'Подробности', true],
          ['conditions', 'Условия', true],
          ['schedule', 'График', false],
          ['requirements', 'Требования', true],
          ['telegramUrl', 'Telegram (связаться)', false],
          ['imageUrl', 'URL изображения', false],
        ] as const
      ).map(([key, label, multiline]) => (
        <label key={key} className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">{label}</span>
          {multiline ? (
            <textarea
              value={detail[key]}
              onChange={(e) => set(key, e.target.value as never)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            />
          ) : (
            <input
              value={detail[key]}
              onChange={(e) => set(key, e.target.value as never)}
              className="w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            />
          )}
        </label>
      ))}

      <div className="rounded-xl border border-white/10 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-500">FAQ</span>
          <button type="button" className="text-xs text-amber-400 hover:underline" onClick={addFaq}>
            + вопрос
          </button>
        </div>
        <div className="space-y-3">
          {faq.map((f) => (
            <div key={f.id} className="rounded-lg border border-white/5 bg-[rgba(11,11,15,0.4)] p-3">
              <input
                value={f.question}
                onChange={(e) => updateFaq(f.id, { question: e.target.value })}
                placeholder="Вопрос"
                className="mb-2 w-full rounded-lg border border-white/10 bg-[rgba(11,11,15,0.8)] px-3 py-2 text-sm text-white"
              />
              <textarea
                value={f.answer}
                onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
                placeholder="Ответ"
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-[rgba(11,11,15,0.8)] px-3 py-2 text-sm text-white"
              />
              <button
                type="button"
                className="mt-2 text-xs text-red-400/90 hover:underline"
                onClick={() => removeFaq(f.id)}
              >
                Удалить пункт
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CityOverrideBlock({
  vacancy,
  city,
  onChangeVacancy,
}: {
  vacancy: Vacancy;
  city: City | null;
  onChangeVacancy: (v: Vacancy) => void;
}) {
  const patch: Partial<VacancyDetail> = city ? vacancy.cityOverrides[city.id] ?? {} : {};
  const base = vacancy.baseDetail;

  const merged = useMemo(
    () =>
      deepMerge(
        base as unknown as Record<string, unknown>,
        patch as unknown as Record<string, unknown>
      ) as unknown as VacancyDetail,
    [base, patch]
  );

  const setPatch = (next: Partial<VacancyDetail>) => {
    if (!city) return;
    const id = city.id;
    const co = { ...vacancy.cityOverrides };
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, val]) => val !== undefined)
    ) as Partial<VacancyDetail>;
    if (Object.keys(cleaned).length === 0) delete co[id];
    else co[id] = cleaned;
    onChangeVacancy({ ...vacancy, cityOverrides: co });
  };

  const updatePartial = (key: keyof VacancyDetail, v: string | undefined) => {
    const p = { ...patch };
    if (v === undefined) delete p[key];
    else (p as Record<string, unknown>)[key] = v;
    setPatch(p);
  };

  const faqOverrideActive = patch.faq !== undefined;

  return (
    <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
      <p className="text-sm text-zinc-300">
        Пустое поле означает «взять из базовой карточки». Так можно задать отдельные зарплаты и
        тексты под локацию.
      </p>
      {!city ? (
        <p className="text-sm text-zinc-500">Выберите город выше.</p>
      ) : (
        <>
          <OptionalField
            label="Премиальный лид"
            baseValue={base.premiumLead}
            patchValue={patch.premiumLead}
            onPatch={(v) => updatePartial('premiumLead', v)}
            multiline
          />
          <OptionalField
            label="Описание работы"
            baseValue={base.workDescription}
            patchValue={patch.workDescription}
            onPatch={(v) => updatePartial('workDescription', v)}
            multiline
          />
          <OptionalField
            label="Оплата"
            baseValue={base.pay}
            patchValue={patch.pay}
            onPatch={(v) => updatePartial('pay', v)}
          />
          <OptionalField
            label="Подробности"
            baseValue={base.details}
            patchValue={patch.details}
            onPatch={(v) => updatePartial('details', v)}
            multiline
          />
          <OptionalField
            label="Условия"
            baseValue={base.conditions}
            patchValue={patch.conditions}
            onPatch={(v) => updatePartial('conditions', v)}
            multiline
          />
          <OptionalField
            label="График"
            baseValue={base.schedule}
            patchValue={patch.schedule}
            onPatch={(v) => updatePartial('schedule', v)}
          />
          <OptionalField
            label="Требования"
            baseValue={base.requirements}
            patchValue={patch.requirements}
            onPatch={(v) => updatePartial('requirements', v)}
            multiline
          />
          <OptionalField
            label="Telegram"
            baseValue={base.telegramUrl}
            patchValue={patch.telegramUrl}
            onPatch={(v) => updatePartial('telegramUrl', v)}
          />
          <OptionalField
            label="Изображение URL"
            baseValue={base.imageUrl}
            patchValue={patch.imageUrl}
            onPatch={(v) => updatePartial('imageUrl', v)}
          />

          <label className="flex items-center gap-2 text-sm text-zinc-200">
            <input
              type="checkbox"
              className="h-4 w-4 accent-amber-500"
              checked={faqOverrideActive}
              onChange={(e) => {
                if (!city) return;
                const p = { ...patch };
                if (e.target.checked) {
                  p.faq = JSON.parse(JSON.stringify(base.faq)) as FaqItem[];
                } else {
                  delete p.faq;
                }
                setPatch(p);
              }}
            />
            Отдельный FAQ для этого города
          </label>

          {faqOverrideActive && patch.faq && (
            <div className="space-y-2 rounded-lg border border-white/10 p-3">
              {patch.faq.map((f, idx) => (
                <div key={f.id} className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={f.question}
                    onChange={(e) => {
                      const nf = [...patch.faq!];
                      nf[idx] = { ...f, question: e.target.value };
                      setPatch({ ...patch, faq: nf });
                    }}
                    className="rounded-lg border border-white/10 bg-[rgba(11,11,15,0.8)] px-3 py-2 text-sm text-white"
                    placeholder="Вопрос"
                  />
                  <input
                    value={f.answer}
                    onChange={(e) => {
                      const nf = [...patch.faq!];
                      nf[idx] = { ...f, answer: e.target.value };
                      setPatch({ ...patch, faq: nf });
                    }}
                    className="rounded-lg border border-white/10 bg-[rgba(11,11,15,0.8)] px-3 py-2 text-sm text-white"
                    placeholder="Ответ"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-white/5 bg-[rgba(11,11,15,0.4)] p-3 text-xs text-zinc-500">
            Предпросмотр слияния для {city.name}: оплата — {merged.pay.slice(0, 80)}
            {merged.pay.length > 80 ? '…' : ''}
          </div>
        </>
      )}
    </div>
  );
}

export function VacanciesAdminPanel({
  vacancies,
  cities,
  onChange,
}: {
  vacancies: Vacancy[];
  cities: City[];
  onChange: (next: Vacancy[]) => void;
}) {
  const sorted = useMemo(
    () => [...vacancies].sort((a, b) => a.order - b.order),
    [vacancies]
  );
  const [activeId, setActiveId] = useState(sorted[0]?.id ?? '');
  const [overrideCityId, setOverrideCityId] = useState<string>('');

  const active = sorted.find((v) => v.id === activeId) ?? sorted[0];
  const enabledCities = useMemo(
    () => cities.filter((c) => c.enabled).sort((a, b) => a.order - b.order),
    [cities]
  );
  const overrideCity = enabledCities.find((c) => c.id === overrideCityId) ?? null;

  const replaceVacancy = (v: Vacancy) => {
    onChange(vacancies.map((x) => (x.id === v.id ? v : x)));
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = sorted.findIndex((v) => v.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[j];
    onChange(
      vacancies.map((v) => {
        if (v.id === a.id) return { ...v, order: b.order };
        if (v.id === b.id) return { ...v, order: a.order };
        return v;
      })
    );
  };

  const addVacancy = () => {
    const maxOrder = Math.max(-1, ...vacancies.map((v) => v.order));
    const v = createNewVacancy(maxOrder + 1);
    onChange([...vacancies, v]);
    setActiveId(v.id);
  };

  const removeVacancy = (id: string) => {
    if (!confirm('Удалить вакансию?')) return;
    onChange(vacancies.filter((v) => v.id !== id));
    setActiveId((cur) => (cur === id ? sorted.find((x) => x.id !== id)?.id ?? '' : cur));
  };

  if (!active) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-500">Нет вакансий. Создайте первую.</p>
        <Button type="button" variant="primary" onClick={addVacancy}>
          Добавить вакансию
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1 text-xs" onClick={addVacancy}>
            + Новая
          </Button>
        </div>
        <ul className="thin-scrollbar max-h-[55vh] space-y-1 overflow-auto rounded-xl border border-white/10 p-2">
          {sorted.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setActiveId(v.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  v.id === active.id
                    ? 'bg-amber-500/15 text-amber-100'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span className="block font-medium text-white">{v.title}</span>
                <span className="text-xs text-zinc-500">{v.enabled ? 'активна' : 'выкл.'}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" className="text-xs" onClick={() => move(active.id, -1)}>
            ↑
          </Button>
          <Button type="button" variant="ghost" className="text-xs" onClick={() => move(active.id, 1)}>
            ↓
          </Button>
          <label className="ml-auto flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={active.enabled}
              onChange={(e) =>
                replaceVacancy({ ...active, enabled: e.target.checked })
              }
              className="h-4 w-4 accent-amber-500"
            />
            Активна на сайте
          </label>
          <button
            type="button"
            className="text-xs text-red-400/90 hover:underline"
            onClick={() => removeVacancy(active.id)}
          >
            Удалить
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Название</span>
            <input
              value={active.title}
              onChange={(e) => replaceVacancy({ ...active, title: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">
              Краткое описание (карточка)
            </span>
            <textarea
              value={active.shortDescription}
              onChange={(e) => replaceVacancy({ ...active, shortDescription: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Иконка</span>
            <select
              value={active.iconId}
              onChange={(e) =>
                replaceVacancy({ ...active, iconId: e.target.value as VacancyIconId })
              }
              className="w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            >
              {ICONS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Slug (URL)</span>
            <input
              value={active.slug}
              onChange={(e) => replaceVacancy({ ...active, slug: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            />
          </label>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <h3 className="mb-3 font-display text-sm text-white">Базовая карточка</h3>
          <BaseDetailForm
            detail={active.baseDetail}
            onChange={(d) => replaceVacancy({ ...active, baseDetail: d })}
          />
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <h3 className="mb-3 font-display text-sm text-white">Переопределение по городу</h3>
          <label className="mb-3 block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Город</span>
            <select
              value={overrideCityId}
              onChange={(e) => setOverrideCityId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[rgba(11,11,15,0.8)] px-4 py-3 text-sm text-white"
            >
              <option value="">— выберите —</option>
              {enabledCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <CityOverrideBlock
            vacancy={active}
            city={overrideCity}
            onChangeVacancy={replaceVacancy}
          />
        </div>
      </div>
    </div>
  );
}
