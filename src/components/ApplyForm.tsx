import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { JobApplication, Vacancy } from '@/types';
import { Button } from './ui/Button';
import { addApplication, patchApplication } from '@/data/applicationsRepository';
import { trackEvent } from '@/lib/analytics';
import { useUiSelection } from '@/context/UiSelectionContext';
import {
  isPhonePlausible,
  isTelegramUsernamePlausible,
  normalizeTelegramUsername,
  submitApplicationToApi,
} from '@/services/submitApplication';
import { newId } from '@/utils/id';

type FormUiState = 'idle' | 'submitting' | 'success' | 'error';

export function ApplyForm({
  defaultCityId,
  vacancies,
  title,
  subtitle,
}: {
  /** Технический id города по умолчанию (для карточек вакансий); в заявке город — текст из поля. */
  defaultCityId: string;
  vacancies: Vacancy[];
  title: string;
  subtitle: string;
}) {
  const { vacancyId } = useUiSelection();
  const enabledVacancies = useMemo(
    () => vacancies.filter((v) => v.enabled).sort((a, b) => a.order - b.order),
    [vacancies]
  );

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cityText, setCityText] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [formVacancyId, setFormVacancyId] = useState(vacancyId ?? enabledVacancies[0]?.id ?? '');
  const [comment, setComment] = useState('');
  const [uiState, setUiState] = useState<FormUiState>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (vacancyId) setFormVacancyId(vacancyId);
  }, [vacancyId]);

  const resetFeedbackOnEdit = () => {
    if (uiState === 'success' || uiState === 'error') {
      setUiState('idle');
      setFeedback(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uiState === 'submitting') return;

    const v = enabledVacancies.find((x) => x.id === formVacancyId);
    const n = name.trim();
    const p = phone.trim();
    const city = cityText.trim();
    const tg = normalizeTelegramUsername(telegramUsername);

    if (enabledVacancies.length === 0) {
      setUiState('error');
      setFeedback('Нет доступных вакансий для заявки.');
      return;
    }
    if (!v) {
      setUiState('error');
      setFeedback('Выберите вакансию.');
      return;
    }
    if (!n || !p) {
      setUiState('error');
      setFeedback('Укажите имя и телефон.');
      return;
    }
    if (!city) {
      setUiState('error');
      setFeedback('Укажите город.');
      return;
    }
    if (!tg || !isTelegramUsernamePlausible(telegramUsername)) {
      setUiState('error');
      setFeedback(
        'Укажите корректный username Telegram: латиница, 5–32 символа, начинается с буквы (можно с @).'
      );
      return;
    }
    if (!isPhonePlausible(p)) {
      setUiState('error');
      setFeedback('В номере должно быть не меньше 10 цифр.');
      return;
    }

    const appId = newId('app');
    const createdAt = new Date().toISOString();
    const sourceUrl = typeof window !== 'undefined' ? window.location.href : undefined;

    const record: JobApplication = {
      id: appId,
      createdAt,
      status: 'pending',
      telegramDelivered: false,
      name: n,
      phone: p,
      cityId: defaultCityId || 'default',
      cityName: city,
      telegramUsername: tg,
      vacancyId: v.id,
      vacancyTitle: v.title,
      comment: comment.trim(),
      sourceUrl,
    };

    try {
      addApplication(record);
    } catch {
      setUiState('error');
      setFeedback('Не удалось сохранить заявку в браузере (хранилище недоступно).');
      return;
    }

    setUiState('submitting');
    setFeedback(null);

    try {
      const result = await submitApplicationToApi({
        name: record.name,
        phone: record.phone,
        cityId: record.cityId,
        cityName: record.cityName,
        telegramUsername: record.telegramUsername,
        vacancyId: record.vacancyId,
        vacancyTitle: record.vacancyTitle,
        comment: record.comment,
        submittedAt: createdAt,
        sourceUrl,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });

      if (result.ok) {
        patchApplication(appId, {
          status: 'sent',
          sentAt: result.sentAt,
          telegramDelivered: true,
          errorMessage: undefined,
        });
        trackEvent('apply_submit', { cityId: record.cityId, vacancyId: v.id, telegram: true });
        setUiState('success');
        setFeedback('Заявка отправлена. Мы свяжемся с вами по телефону.');
        setName('');
        setPhone('');
        setCityText('');
        setTelegramUsername('');
        setComment('');
        setFormVacancyId(vacancyId ?? enabledVacancies[0]?.id ?? '');
      } else {
        patchApplication(appId, {
          status: 'failed',
          telegramDelivered: false,
          errorMessage: result.error,
        });
        trackEvent('apply_submit', { cityId: record.cityId, vacancyId: v.id, telegram: false });
        setUiState('error');
        setFeedback(result.error);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось отправить заявку.';
      patchApplication(appId, {
        status: 'failed',
        telegramDelivered: false,
        errorMessage: msg,
      });
      trackEvent('apply_submit', { cityId: record.cityId, vacancyId: v.id, telegram: false });
      setUiState('error');
      setFeedback(msg);
    }
  };

  return (
    <section id="zayavka" className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 text-center"
        >
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm font-medium text-zinc-500">{subtitle}</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="glass-strong space-y-4 rounded-2xl border border-amber-500/10 p-5 shadow-card sm:p-6"
        >
          <input
            required
            value={name}
            onChange={(e) => {
              resetFeedbackOnEdit();
              setName(e.target.value);
            }}
            disabled={uiState === 'submitting'}
            className="ring-focus w-full rounded-xl border border-white/[0.1] bg-[rgba(11,11,15,0.9)] px-4 py-3.5 text-sm text-white shadow-inner placeholder:text-zinc-600 disabled:opacity-50"
            placeholder="Имя"
            autoComplete="name"
          />
          <input
            required
            value={phone}
            onChange={(e) => {
              resetFeedbackOnEdit();
              setPhone(e.target.value);
            }}
            disabled={uiState === 'submitting'}
            className="ring-focus w-full rounded-xl border border-white/[0.1] bg-[rgba(11,11,15,0.9)] px-4 py-3.5 text-sm text-white shadow-inner placeholder:text-zinc-600 disabled:opacity-50"
            placeholder="Телефон"
            type="tel"
            autoComplete="tel"
          />
          <input
            required
            value={cityText}
            onChange={(e) => {
              resetFeedbackOnEdit();
              setCityText(e.target.value);
            }}
            disabled={uiState === 'submitting'}
            className="ring-focus w-full rounded-xl border border-white/[0.1] bg-[rgba(11,11,15,0.9)] px-4 py-3.5 text-sm text-white shadow-inner placeholder:text-zinc-600 disabled:opacity-50"
            placeholder="Город"
            autoComplete="address-level2"
          />
          <input
            required
            value={telegramUsername}
            onChange={(e) => {
              resetFeedbackOnEdit();
              setTelegramUsername(e.target.value);
            }}
            disabled={uiState === 'submitting'}
            className="ring-focus w-full rounded-xl border border-white/[0.1] bg-[rgba(11,11,15,0.9)] px-4 py-3.5 text-sm text-white shadow-inner placeholder:text-zinc-600 disabled:opacity-50"
            placeholder="Username Telegram (например, ivan или @ivan)"
            autoComplete="username"
          />
          <select
            value={formVacancyId}
            onChange={(e) => {
              resetFeedbackOnEdit();
              setFormVacancyId(e.target.value);
            }}
            disabled={uiState === 'submitting' || enabledVacancies.length === 0}
            className="ring-focus w-full rounded-xl border border-white/[0.1] bg-[rgba(11,11,15,0.9)] px-4 py-3.5 text-sm text-white disabled:opacity-50"
          >
            {enabledVacancies.length === 0 ? (
              <option value="" className="bg-[#0b0b0f]">
                Нет вакансий
              </option>
            ) : (
              enabledVacancies.map((vac) => (
                <option key={vac.id} value={vac.id} className="bg-[#0b0b0f]">
                  {vac.title}
                </option>
              ))
            )}
          </select>
          <textarea
            value={comment}
            onChange={(e) => {
              resetFeedbackOnEdit();
              setComment(e.target.value);
            }}
            disabled={uiState === 'submitting'}
            rows={3}
            className="ring-focus w-full resize-y rounded-xl border border-white/[0.1] bg-[rgba(11,11,15,0.9)] px-4 py-3.5 text-sm text-white shadow-inner placeholder:text-zinc-600 disabled:opacity-50"
            placeholder="Комментарий (необязательно)"
          />
          <Button
            type="submit"
            className="w-full py-4 text-base"
            variant="primary"
            loading={uiState === 'submitting'}
            disabled={uiState === 'submitting' || enabledVacancies.length === 0}
          >
            Отправить заявку
          </Button>

          {feedback && uiState === 'success' && (
            <motion.p
              role="status"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm font-medium text-emerald-400/95"
            >
              {feedback}
            </motion.p>
          )}
          {feedback && uiState === 'error' && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-500/25 bg-red-950/30 px-4 py-3 text-center text-sm font-medium text-red-200/95"
            >
              {feedback}
              <span className="mt-2 block text-xs font-normal text-zinc-500">
                Заявка сохранена в этом браузере со статусом «ошибка» — её видно в админке.
              </span>
            </motion.p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
