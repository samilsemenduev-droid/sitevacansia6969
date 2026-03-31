import { useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UiSelectionProvider, useResolvedSelection, useUiSelection } from '@/context/UiSelectionContext';
import { useSiteData } from '@/context/SiteDataContext';
import { resolveVacancyDetail } from '@/data/resolver';
import { Hero } from '@/components/Hero';
import { VacancyGrid } from '@/components/VacancyGrid';
import { VacancyDetailSheet } from '@/components/VacancyDetailSheet';
import { ApplyForm } from '@/components/ApplyForm';
import { ExternalLinksSection } from '@/components/ExternalLinksSection';
import { SiteFooter } from '@/components/SiteFooter';
import type { SiteData } from '@/types';

function HomeContent({ data }: { data: SiteData }) {
  const { cityId, setCityId, vacancyId, closeVacancy } = useUiSelection();
  const { city, vacancy } = useResolvedSelection(data.cities, data.vacancies);

  const enabledCities = useMemo(
    () => data.cities.filter((c) => c.enabled).sort((a, b) => a.order - b.order),
    [data.cities]
  );

  useEffect(() => {
    if (enabledCities.length === 0) return;
    if (!cityId || !enabledCities.some((c) => c.id === cityId)) {
      setCityId(enabledCities[0].id);
    }
  }, [cityId, enabledCities, setCityId]);

  const detail =
    city && vacancy && vacancy.enabled
      ? resolveVacancyDetail(vacancy, city, data.site)
      : null;

  return (
    <>
      <Hero
        badge={data.site.heroBadge}
        title={data.site.heroTitle}
        subtitle={data.site.heroSubtitle}
      />
      <VacancyGrid vacancies={data.vacancies} />
      <ExternalLinksSection platformUrl={data.site.platformUrl} />
      <ApplyForm
        defaultCityId={enabledCities[0]?.id ?? ''}
        vacancies={data.vacancies}
        title={data.site.applySectionTitle}
        subtitle={data.site.applySectionSubtitle}
      />
      <SiteFooter note={data.site.footerNote} />

      <AnimatePresence>
        {vacancyId && vacancy && detail && (
          <VacancyDetailSheet
            key={vacancy.id + city?.id}
            title={vacancy.title}
            iconId={vacancy.iconId}
            detail={detail}
            onClose={closeVacancy}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export function HomePage() {
  const { data } = useSiteData();
  const firstCityId = useMemo(() => {
    const list = data.cities.filter((c) => c.enabled).sort((a, b) => a.order - b.order);
    return list[0]?.id ?? null;
  }, [data.cities]);

  return (
    <UiSelectionProvider defaultCityId={firstCityId}>
      <HomeContent data={data} />
    </UiSelectionProvider>
  );
}
