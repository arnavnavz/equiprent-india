"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface LocationResult {
  displayName: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
}

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: LocationResult) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  darkMode?: boolean;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    state_district?: string;
    country?: string;
    suburb?: string;
    neighbourhood?: string;
    road?: string;
    postcode?: string;
  };
  type: string;
}

export function LocationSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Search address, city, or area...",
  inputClassName,
  darkMode = false,
}: LocationSearchProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectingGPS, setDetectingGPS] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchNominatim = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=in&limit=6`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
      setHighlightIndex(-1);
    } catch {
      setSuggestions([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.length >= 2) searchNominatim(value);
      else { setSuggestions([]); setShowDropdown(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, searchNominatim]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: NominatimResult) => {
    const addr = result.address;
    const city = addr.city || addr.town || addr.village || addr.county || "";
    const state = addr.state || addr.state_district || "";
    const displayName = formatDisplay(result);

    onChange(displayName);
    onSelect({
      displayName,
      city,
      state,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    });
    setShowDropdown(false);
    setSuggestions([]);
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data: NominatimResult = await res.json();
          handleSelect(data);
        } catch { /* ignore */ }
        setDetectingGPS(false);
      },
      () => setDetectingGPS(false),
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const baseInput = darkMode
    ? "w-full border border-slate-600 bg-slate-800 rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
    : "w-full border border-slate-200 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-slate-50";

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setShowDropdown(true); }}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName || baseInput}
        />
        <button
          type="button"
          onClick={detectCurrentLocation}
          disabled={detectingGPS}
          title="Use my current location"
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors disabled:opacity-50 ${
            darkMode ? "hover:bg-slate-700 text-slate-500 hover:text-amber-400" : "hover:bg-amber-50 text-slate-400 hover:text-amber-600"
          }`}
        >
          {detectingGPS ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" /></svg>
          )}
        </button>
        {loading && (
          <div className={`absolute right-9 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 ${darkMode ? "border-slate-600 border-t-amber-400" : "border-slate-200 border-t-amber-500"} rounded-full animate-spin`} />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Search results</span>
          </div>
          {suggestions.map((s, i) => {
            const addr = s.address;
            const mainText = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.road || "";
            const secondaryText = [addr.state_district, addr.state].filter(Boolean).join(", ");

            return (
              <button
                key={`${s.lat}-${s.lon}-${i}`}
                type="button"
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setHighlightIndex(i)}
                className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors border-b border-slate-50 last:border-0 ${
                  highlightIndex === i ? "bg-amber-50" : "hover:bg-slate-50"
                }`}
              >
                <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{mainText || formatDisplay(s)}</p>
                  {secondaryText && <p className="text-xs text-slate-500 truncate">{secondaryText}</p>}
                  {!mainText && <p className="text-xs text-slate-400 truncate">{s.display_name}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDisplay(result: NominatimResult): string {
  const addr = result.address;
  const parts: string[] = [];
  const place = addr.city || addr.town || addr.village || addr.suburb || addr.county || "";
  if (place) parts.push(place);
  if (addr.state_district && addr.state_district !== place) parts.push(addr.state_district);
  if (addr.state && addr.state !== place) parts.push(addr.state);
  return parts.length > 0 ? parts.join(", ") : result.display_name.split(",").slice(0, 3).join(",").trim();
}

export function useAutoDetectLocation(onDetected: (loc: LocationResult) => void) {
  const [detecting, setDetecting] = useState(false);

  const detect = useCallback(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data: NominatimResult = await res.json();
          const addr = data.address;
          const city = addr.city || addr.town || addr.village || addr.county || "";
          const state = addr.state || addr.state_district || "";
          const parts: string[] = [];
          if (city) parts.push(city);
          if (state) parts.push(state);
          onDetected({
            displayName: parts.join(", ") || data.display_name,
            city,
            state,
            lat: parseFloat(data.lat),
            lon: parseFloat(data.lon),
          });
        } catch { /* ignore */ }
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [onDetected]);

  return { detecting, detect };
}
