export interface CountryPPP {
  code: string;
  name: string;
  flag: string;
  targetPriceRatio: number; // e.g. 300 for US (3.0x), 180 for AU (1.8x), 100 for IN (1.0x)
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
}

export const PPP_COUNTRIES: CountryPPP[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳', targetPriceRatio: 100, currency: 'INR' },
  { code: 'US', name: 'United States', flag: '🇺🇸', targetPriceRatio: 300, currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', targetPriceRatio: 300, currency: 'GBP' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', targetPriceRatio: 225, currency: 'CAD' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', targetPriceRatio: 180, currency: 'AUD' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'FR', name: 'France', flag: '🇫🇷', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', targetPriceRatio: 300, currency: 'USD' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', targetPriceRatio: 300, currency: 'USD' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', targetPriceRatio: 300, currency: 'USD' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', targetPriceRatio: 300, currency: 'USD' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', targetPriceRatio: 300, currency: 'USD' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', targetPriceRatio: 300, currency: 'EUR' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', targetPriceRatio: 300, currency: 'USD' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', targetPriceRatio: 166, currency: 'USD' },
  { code: 'CN', name: 'China', flag: '🇨🇳', targetPriceRatio: 197, currency: 'USD' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', targetPriceRatio: 206, currency: 'USD' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', targetPriceRatio: 269, currency: 'USD' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', targetPriceRatio: 201, currency: 'USD' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', targetPriceRatio: 185, currency: 'USD' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', targetPriceRatio: 233, currency: 'USD' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', targetPriceRatio: 117, currency: 'USD' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', targetPriceRatio: 221, currency: 'USD' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', targetPriceRatio: 248, currency: 'USD' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', targetPriceRatio: 100, currency: 'USD' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', targetPriceRatio: 100, currency: 'USD' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', targetPriceRatio: 100, currency: 'USD' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', targetPriceRatio: 300, currency: 'USD' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', targetPriceRatio: 300, currency: 'USD' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', targetPriceRatio: 100, currency: 'USD' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', targetPriceRatio: 100, currency: 'USD' },
  { code: 'OTHER', name: 'Other Country', flag: '🌍', targetPriceRatio: 250, currency: 'USD' },
];

export const getCountryByCode = (code: string): CountryPPP => {
  return PPP_COUNTRIES.find(c => c.code === code) || PPP_COUNTRIES.find(c => c.code === 'US') || PPP_COUNTRIES[0];
};

export type AreaUnit = 'sqft' | 'sqm' | 'acre' | 'hectare' | 'guntha';

export const AREA_UNITS: { code: AreaUnit; label: string; sqftMultiplier: number }[] = [
  { code: 'sqft', label: 'Sq. Ft. (Square Feet)', sqftMultiplier: 1 },
  { code: 'sqm', label: 'Sq. M. (Square Meters)', sqftMultiplier: 10.764 },
  { code: 'acre', label: 'Acres', sqftMultiplier: 43560 },
  { code: 'hectare', label: 'Hectares', sqftMultiplier: 107639 },
  { code: 'guntha', label: 'Guntha', sqftMultiplier: 1089 },
];

export const getAreaMultiplier = (areaVal: number, unit: AreaUnit): number => {
  if (!areaVal || areaVal <= 0) return 1.0;
  const unitConfig = AREA_UNITS.find(u => u.code === unit) || AREA_UNITS[0];
  const totalSqft = areaVal * unitConfig.sqftMultiplier;
  if (totalSqft <= 2000) return 1.0;
  // Smooth progressive land scaling:
  const scale = Math.pow(totalSqft / 2000, 0.25);
  return Math.min(4.5, Math.max(1.0, scale));
};

/**
 * Calculates target price formatted in local/international currency using World Bank PPP data and land area scaling
 */
export const calculatePPPPrice = (baseINR: number, countryCode: string, areaMultiplier: number = 1.0): string => {
  const country = getCountryByCode(countryCode);
  const multiplier = (country.targetPriceRatio / 100) * areaMultiplier;
  const targetINR = baseINR * multiplier;

  if (country.code === 'IN') {
    return `₹${Math.round(targetINR).toLocaleString('en-IN')}`;
  }

  switch (country.currency) {
    case 'GBP': {
      const gbp = Math.round(targetINR / 105);
      return `£${gbp.toLocaleString('en-GB')}`;
    }
    case 'EUR': {
      const eur = Math.round(targetINR / 90);
      return `€${eur.toLocaleString('de-DE')}`;
    }
    case 'CAD': {
      const cad = Math.round(targetINR / 61);
      return `CA$${cad.toLocaleString('en-CA')}`;
    }
    case 'AUD': {
      const aud = Math.round(targetINR / 54);
      return `A$${aud.toLocaleString('en-AU')}`;
    }
    case 'USD':
    default: {
      const usd = Math.round(targetINR / 83);
      return `$${usd.toLocaleString('en-US')} USD`;
    }
  }
};

/**
 * Returns raw target INR amount for benchmark calculations
 */
export const getTargetINRAmount = (baseINR: number, countryCode: string, areaMultiplier: number = 1.0): number => {
  const country = getCountryByCode(countryCode);
  return Math.round(baseINR * (country.targetPriceRatio / 100) * areaMultiplier);
};
