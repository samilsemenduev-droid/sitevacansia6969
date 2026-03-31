/** Подстановка {город} и {Город} в текстах */
export function applyCityPlaceholders(text: string, cityName: string): string {
  const cap = cityName.length ? cityName[0].toUpperCase() + cityName.slice(1) : cityName;
  return text.split('{город}').join(cityName).split('{Город}').join(cap);
}
