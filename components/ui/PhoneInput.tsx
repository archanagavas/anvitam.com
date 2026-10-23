import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Check, AlertCircle } from 'lucide-react';

export interface CountryPhoneData {
  code: string;       // ISO 2-letter
  name: string;
  flag: string;
  dialCode: string;   // e.g. "+91"
  placeholder: string; // e.g. "98765 43210"
  minDigits: number;
  maxDigits: number;
}

export const COUNTRY_PHONE_LIST: CountryPhoneData[] = [
  // High-priority core markets
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91', placeholder: '98765 43210', minDigits: 10, maxDigits: 10 },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', placeholder: '(555) 000-0000', minDigits: 10, maxDigits: 10 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', placeholder: '7911 123456', minDigits: 10, maxDigits: 11 },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', placeholder: '50 123 4567', minDigits: 9, maxDigits: 9 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', placeholder: '412 345 678', minDigits: 9, maxDigits: 9 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', placeholder: '(555) 000-0000', minDigits: 10, maxDigits: 10 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65', placeholder: '8123 4567', minDigits: 8, maxDigits: 8 },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64', placeholder: '21 123 4567', minDigits: 8, maxDigits: 10 },
  { code: 'ID', name: 'Indonesia (Bali)', flag: '🇮🇩', dialCode: '+62', placeholder: '812 3456 7890', minDigits: 9, maxDigits: 12 },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', placeholder: '50 123 4567', minDigits: 9, maxDigits: 9 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', placeholder: '151 12345678', minDigits: 10, maxDigits: 11 },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', placeholder: '6 12 34 56 78', minDigits: 9, maxDigits: 9 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31', placeholder: '6 12345678', minDigits: 9, maxDigits: 9 },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41', placeholder: '78 123 45 67', minDigits: 9, maxDigits: 9 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34', placeholder: '612 34 56 78', minDigits: 9, maxDigits: 9 },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39', placeholder: '312 345 6789', minDigits: 9, maxDigits: 10 },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46', placeholder: '70 123 45 67', minDigits: 7, maxDigits: 10 },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47', placeholder: '412 34 567', minDigits: 8, maxDigits: 8 },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45', placeholder: '20 12 34 56', minDigits: 8, maxDigits: 8 },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353', placeholder: '85 123 4567', minDigits: 9, maxDigits: 9 },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32', placeholder: '470 12 34 56', minDigits: 9, maxDigits: 9 },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43', placeholder: '650 1234567', minDigits: 10, maxDigits: 11 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81', placeholder: '90 1234 5678', minDigits: 10, maxDigits: 10 },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82', placeholder: '10 1234 5678', minDigits: 9, maxDigits: 10 },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', placeholder: '11 91234 5678', minDigits: 10, maxDigits: 11 },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52', placeholder: '55 1234 5678', minDigits: 10, maxDigits: 10 },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27', placeholder: '71 123 4567', minDigits: 9, maxDigits: 9 },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60', placeholder: '12 345 6789', minDigits: 9, maxDigits: 10 },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66', placeholder: '81 234 5678', minDigits: 9, maxDigits: 9 },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84', placeholder: '91 234 5678', minDigits: 9, maxDigits: 10 },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63', placeholder: '917 123 4567', minDigits: 10, maxDigits: 10 },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254', placeholder: '712 345678', minDigits: 9, maxDigits: 9 },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234', placeholder: '802 123 4567', minDigits: 10, maxDigits: 10 },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20', placeholder: '100 123 4567', minDigits: 10, maxDigits: 10 },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '+92', placeholder: '300 1234567', minDigits: 10, maxDigits: 10 },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880', placeholder: '1712 345678', minDigits: 10, maxDigits: 10 },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94', placeholder: '71 234 5678', minDigits: 9, maxDigits: 9 },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', dialCode: '+977', placeholder: '981 2345678', minDigits: 10, maxDigits: 10 },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90', placeholder: '532 123 4567', minDigits: 10, maxDigits: 10 },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7', placeholder: '912 345-67-89', minDigits: 10, maxDigits: 10 },
  { code: 'OTHER', name: 'Other International', flag: '🌍', dialCode: '+', placeholder: '1234567890', minDigits: 7, maxDigits: 15 },
];

export function parsePhoneNumber(rawInput: string, fallbackCountryCode = 'IN'): { country: CountryPhoneData; nationalNumber: string } {
  if (!rawInput) {
    const defaultCountry = COUNTRY_PHONE_LIST.find(c => c.code === fallbackCountryCode) || COUNTRY_PHONE_LIST[0];
    return { country: defaultCountry, nationalNumber: '' };
  }

  const trimmed = rawInput.trim();
  if (trimmed.startsWith('+')) {
    // Try to match dial code from longest to shortest
    const sorted = [...COUNTRY_PHONE_LIST].filter(c => c.dialCode !== '+').sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sorted) {
      if (trimmed.startsWith(c.dialCode)) {
        const remaining = trimmed.slice(c.dialCode.length).trim().replace(/[^\d]/g, '');
        return { country: c, nationalNumber: remaining };
      }
    }
  }

  const defaultCountry = COUNTRY_PHONE_LIST.find(c => c.code === fallbackCountryCode) || COUNTRY_PHONE_LIST[0];
  const digitsOnly = trimmed.replace(/[^\d]/g, '');
  return { country: defaultCountry, nationalNumber: digitsOnly };
}

interface PhoneInputProps {
  value: string; // Full formatted e.164, e.g. "+91 98765 43210" or raw
  onChange: (fullNumber: string, country: CountryPhoneData, isValid: boolean) => void;
  selectedCountryCode?: string; // Optional external sync (e.g. from Country dropdown in Estimator)
  onCountryChange?: (country: CountryPhoneData) => void;
  required?: boolean;
  className?: string;
  variant?: 'pill' | 'rounded'; // 'pill' for Contact page, 'rounded' for Estimator
  id?: string;
  name?: string;
  error?: string | null;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  selectedCountryCode,
  onCountryChange,
  required = false,
  className = '',
  variant = 'rounded',
  id = 'phone-input',
  name = 'phone',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [localNumber, setLocalNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryPhoneData>(() => {
    const initialMatch = COUNTRY_PHONE_LIST.find(c => c.code === selectedCountryCode);
    return initialMatch || COUNTRY_PHONE_LIST[0];
  });
  const [touched, setTouched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync with value prop on mount or external changes
  useEffect(() => {
    if (value) {
      const parsed = parsePhoneNumber(value, selectedCountryCode || selectedCountry.code);
      setSelectedCountry(parsed.country);
      setLocalNumber(parsed.nationalNumber);
    }
  }, [value]);

  // Sync external country code (e.g., if user selects "United States" in "Your Country")
  useEffect(() => {
    if (selectedCountryCode && selectedCountryCode !== selectedCountry.code) {
      const found = COUNTRY_PHONE_LIST.find(c => c.code === selectedCountryCode);
      if (found) {
        setSelectedCountry(found);
        const full = localNumber ? `${found.dialCode} ${localNumber}` : '';
        const isValid = validate(localNumber, found);
        onChange(full, found, isValid);
      }
    }
  }, [selectedCountryCode]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filter countries in dropdown
  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRY_PHONE_LIST;
    return COUNTRY_PHONE_LIST.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const validate = (digits: string, country: CountryPhoneData): boolean => {
    if (!digits) return !required;
    const cleanDigits = digits.replace(/[^\d]/g, '');
    return cleanDigits.length >= country.minDigits && cleanDigits.length <= country.maxDigits;
  };

  const handleCountrySelect = (c: CountryPhoneData) => {
    setSelectedCountry(c);
    setIsOpen(false);
    setSearch('');
    if (onCountryChange) onCountryChange(c);
    const full = localNumber ? `${c.dialCode} ${localNumber}` : '';
    const isValid = validate(localNumber, c);
    onChange(full, c, isValid);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and spaces
    const val = e.target.value.replace(/[^\d\s]/g, '');
    const cleanDigits = val.replace(/[^\d]/g, '');
    setLocalNumber(cleanDigits);

    const full = cleanDigits ? `${selectedCountry.dialCode} ${cleanDigits}` : '';
    const isValid = validate(cleanDigits, selectedCountry);
    onChange(full, selectedCountry, isValid);
  };

  const isInvalid = touched && localNumber.length > 0 && !validate(localNumber, selectedCountry);
  const containerClasses =
    variant === 'pill'
      ? 'rounded-full border border-gray-200 bg-white focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400'
      : 'rounded-xl border border-black/12 bg-white focus-within:border-[#111]';

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div className={`flex items-center w-full transition-all duration-200 overflow-hidden ${containerClasses} ${isInvalid ? '!border-red-400 !ring-red-300' : ''}`}>
        {/* Country Selector Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="flex items-center gap-1.5 px-3.5 py-2.5 sm:py-3 bg-gray-50/80 hover:bg-gray-100 text-[#111] border-r border-black/10 transition-colors shrink-0 text-xs sm:text-sm font-semibold select-none cursor-pointer"
          title={`Country: ${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <span className="text-base sm:text-lg leading-none">{selectedCountry.flag}</span>
          <span className="font-mono text-xs sm:text-sm text-gray-800">{selectedCountry.dialCode}</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* National Number Input */}
        <input
          id={id}
          name={name}
          type="tel"
          required={required}
          value={localNumber}
          onChange={handleNumberChange}
          onBlur={() => setTouched(true)}
          placeholder={selectedCountry.placeholder}
          autoComplete="tel-national"
          className="flex-1 min-w-0 bg-transparent px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-[#111] placeholder-gray-400 outline-none"
        />

        {/* Status indicator */}
        {localNumber.length > 0 && (
          <div className="pr-3.5 shrink-0 flex items-center">
            {validate(localNumber, selectedCountry) ? (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs">
                <Check size={12} strokeWidth={3} />
              </span>
            ) : touched ? (
              <span className="text-amber-500" title={`Expected ${selectedCountry.minDigits} digits for ${selectedCountry.name}`}>
                <AlertCircle size={15} />
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Validation Message */}
      {isInvalid && (
        <p className="text-[11px] text-red-600 mt-1.5 ml-1 flex items-center gap-1 font-medium">
          <AlertCircle size={12} />
          Please enter a valid {selectedCountry.minDigits}-digit phone number for {selectedCountry.name}.
        </p>
      )}

      {error && !isInvalid && (
        <p className="text-[11px] text-red-600 mt-1.5 ml-1 font-medium">{error}</p>
      )}

      {/* Country Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-black/10 z-[999999] overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search Box */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
            <Search size={14} className="text-gray-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country or code (e.g. +91, India)..."
              className="w-full bg-transparent text-xs font-medium text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto no-scrollbar py-1">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-400">
                No matching countries found
              </div>
            ) : (
              filteredCountries.map(c => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-gray-100 transition-colors text-xs cursor-pointer ${
                      isSelected ? 'bg-[#CCFF00]/15 font-bold text-black' : 'text-gray-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base leading-none shrink-0">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <span className="font-mono text-gray-500 font-semibold shrink-0 ml-2">
                      {c.dialCode}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
