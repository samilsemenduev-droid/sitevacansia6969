import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { SiteData } from '@/types';
import { loadSiteData, saveSiteData } from '@/data/siteRepository';

type SiteDataContextValue = {
  data: SiteData;
  setData: (next: SiteData | ((prev: SiteData) => SiteData)) => void;
  reload: () => void;
};

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<SiteData>(() => {
    console.info('[vacansia] SiteDataProvider: loadSiteData() in useState init');
    return loadSiteData();
  });

  useEffect(() => {
    console.info('[vacansia] SiteDataProvider: mounted, cities=%s vacancies=%s', data.cities.length, data.vacancies.length);
  }, [data.cities.length, data.vacancies.length]);

  const setData = useCallback((next: SiteData | ((prev: SiteData) => SiteData)) => {
    setDataState((prev) => {
      const resolved = typeof next === 'function' ? (next as (p: SiteData) => SiteData)(prev) : next;
      saveSiteData(resolved);
      return resolved;
    });
  }, []);

  const reload = useCallback(() => {
    setDataState(loadSiteData());
  }, []);

  return (
    <SiteDataContext.Provider value={{ data, setData, reload }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData(): SiteDataContextValue {
  const v = useContext(SiteDataContext);
  if (!v) throw new Error('useSiteData must be used within SiteDataProvider');
  return v;
}
