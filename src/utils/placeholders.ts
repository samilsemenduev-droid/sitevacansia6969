/** Подстановка {город} и {Город} в текстах */
export function applyCityPlaceholders(text: string, cityName: string): string {
  const t = typeof text === 'string' ? text : '';
  const cn = typeof cityName === 'string' ? cityName : '';
  const cap = cn.length ? cn[0].toUpperCase() + cn.slice(1) : cn;
  return t.split('{город}').join(cn).split('{Город}').join(cap);
}
