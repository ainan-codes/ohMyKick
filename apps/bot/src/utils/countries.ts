export const COUNTRIES: Record<string, {
  name: string;
  flag: string;
  primaryColor: string;
  secondaryColor: string;
}> = {
  AR: { name: 'Argentina', flag: '🇦🇷', primaryColor: '#74ACDF', secondaryColor: '#FFFFFF' },
  BR: { name: 'Brazil', flag: '🇧🇷', primaryColor: '#009C3B', secondaryColor: '#FFDF00' },
  FR: { name: 'France', flag: '🇫🇷', primaryColor: '#002395', secondaryColor: '#ED2939' },
  DE: { name: 'Germany', flag: '🇩🇪', primaryColor: '#000000', secondaryColor: '#DD0000' },
  ES: { name: 'Spain', flag: '🇪🇸', primaryColor: '#AA151B', secondaryColor: '#F1BF00' },
  PT: { name: 'Portugal', flag: '🇵🇹', primaryColor: '#006600', secondaryColor: '#FF0000' },
  GB_ENG: { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', primaryColor: '#CF081F', secondaryColor: '#FFFFFF' },
  NL: { name: 'Netherlands', flag: '🇳🇱', primaryColor: '#FF6600', secondaryColor: '#FFFFFF' },
  BE: { name: 'Belgium', flag: '🇧🇪', primaryColor: '#EF3340', secondaryColor: '#000000' },
  HR: { name: 'Croatia', flag: '🇭🇷', primaryColor: '#FF0000', secondaryColor: '#FFFFFF' },
  MA: { name: 'Morocco', flag: '🇲🇦', primaryColor: '#006233', secondaryColor: '#C1272D' },
  SN: { name: 'Senegal', flag: '🇸🇳', primaryColor: '#00853F', secondaryColor: '#FDEF42' },
  NG: { name: 'Nigeria', flag: '🇳🇬', primaryColor: '#008751', secondaryColor: '#FFFFFF' },
  JP: { name: 'Japan', flag: '🇯🇵', primaryColor: '#BC002D', secondaryColor: '#FFFFFF' },
  KR: { name: 'South Korea', flag: '🇰🇷', primaryColor: '#CD2E3A', secondaryColor: '#003478' },
  AU: { name: 'Australia', flag: '🇦🇺', primaryColor: '#00843D', secondaryColor: '#FFD100' },
  US: { name: 'USA', flag: '🇺🇸', primaryColor: '#002868', secondaryColor: '#BF0A30' },
  CA: { name: 'Canada', flag: '🇨🇦', primaryColor: '#FF0000', secondaryColor: '#FFFFFF' },
  MX: { name: 'Mexico', flag: '🇲🇽', primaryColor: '#006847', secondaryColor: '#FFFFFF' },
  EC: { name: 'Ecuador', flag: '🇪🇨', primaryColor: '#FFD100', secondaryColor: '#003087' },
  UY: { name: 'Uruguay', flag: '🇺🇾', primaryColor: '#75AADB', secondaryColor: '#FFFFFF' },
  PL: { name: 'Poland', flag: '🇵🇱', primaryColor: '#DC143C', secondaryColor: '#FFFFFF' },
  RS: { name: 'Serbia', flag: '🇷🇸', primaryColor: '#C6363C', secondaryColor: '#0C4076' },
  DK: { name: 'Denmark', flag: '🇩🇰', primaryColor: '#C60C30', secondaryColor: '#FFFFFF' },
  CH: { name: 'Switzerland', flag: '🇨🇭', primaryColor: '#FF0000', secondaryColor: '#FFFFFF' },
  IR: { name: 'Iran', flag: '🇮🇷', primaryColor: '#239F40', secondaryColor: '#DA0000' },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦', primaryColor: '#006C35', secondaryColor: '#FFFFFF' },
  QA: { name: 'Qatar', flag: '🇶🇦', primaryColor: '#8D1B3D', secondaryColor: '#FFFFFF' },
  CM: { name: 'Cameroon', flag: '🇨🇲', primaryColor: '#007A5E', secondaryColor: '#CE1126' },
  GH: { name: 'Ghana', flag: '🇬🇭', primaryColor: '#006B3F', secondaryColor: '#FCD116' },
  TN: { name: 'Tunisia', flag: '🇹🇳', primaryColor: '#E70013', secondaryColor: '#FFFFFF' },
  // Additional nations to be added post-qualification confirmation
};

export function getCountryByCode(code: string) {
  return COUNTRIES[code] ?? null;
}

export function getCountryByName(name: string) {
  const lower = name.toLowerCase();
  return Object.entries(COUNTRIES).find(
    ([, c]) => c.name.toLowerCase() === lower
  ) ?? null;
}

export function getAllCountriesForMenu() {
  return Object.entries(COUNTRIES).map(([code, c]) => ({
    id: `country_${code}`,
    title: `${c.name} ${c.flag}`,
    code,
  }));
}

// Top picks for the first section in the country selection list
export const TOP_PICK_CODES = ['AR', 'BR', 'FR', 'GB_ENG', 'PT', 'ES', 'DE', 'MA'];
