import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { City, Vacancy } from '@/types';

type Ctx = {
  cityId: string | null;
  setCityId: (id: string | null) => void;
  vacancyId: string | null;
  setVacancyId: (id: string | null) => void;
  openVacancy: (id: string) => void;
  closeVacancy: () => void;
};

const UiSelectionContext = createContext<Ctx | null>(null);

export function UiSelectionProvider({
  defaultCityId,
  children,
}: {
  defaultCityId: string | null;
  children: ReactNode;
}) {
  const [cityId, setCityIdState] = useState<string | null>(defaultCityId);
  const [vacancyId, setVacancyId] = useState<string | null>(null);

  const setCityId = useCallback((id: string | null) => {
    setCityIdState(id);
    setVacancyId(null);
  }, []);

  const openVacancy = useCallback((id: string) => setVacancyId(id), []);
  const closeVacancy = useCallback(() => setVacancyId(null), []);

  const value = useMemo(
    () => ({
      cityId,
      setCityId,
      vacancyId,
      setVacancyId,
      openVacancy,
      closeVacancy,
    }),
    [cityId, setCityId, vacancyId, openVacancy, closeVacancy]
  );

  return <UiSelectionContext.Provider value={value}>{children}</UiSelectionContext.Provider>;
}

export function useUiSelection(): Ctx {
  const v = useContext(UiSelectionContext);
  if (!v) throw new Error('useUiSelection outside provider');
  return v;
}

export function useResolvedSelection(cities: City[], vacancies: Vacancy[]) {
  const { cityId, vacancyId } = useUiSelection();
  const city = cities.find((c) => c.id === cityId) ?? null;
  const vacancy = vacancies.find((x) => x.id === vacancyId) ?? null;
  return { city, vacancy };
}
