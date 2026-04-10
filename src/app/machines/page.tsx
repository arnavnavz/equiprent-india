"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { MACHINE_TYPES, INDIAN_STATES, formatCurrency, getMachineTypeLabel, getMachineTypeIcon, MACHINE_IMAGES } from "@/lib/constants";

interface Machine {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  dailyRate: number;
  hourlyRate: number;
  city: string;
  state: string;
  imageUrl: string;
  operatorIncluded: boolean;
  fuelIncluded: boolean;
  description: string;
  avgRating: number;
  reviewCount: number;
  owner: { name: string; city: string; ownerAvgRating: number; ownerReviewCount: number };
}

const SITE_LOCATION_KEY = "equiprent_site_location";

function MachinesContent() {
  const searchParams = useSearchParams();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  const [siteCity, setSiteCity] = useState("");
  const [siteState, setSiteState] = useState("");
  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SITE_LOCATION_KEY);
      if (saved) {
        const loc = JSON.parse(saved);
        if (loc.city) {
          setSiteCity(loc.city);
          setSiteState(loc.state || "");
          setLocationReady(true);
          return;
        }
      }
    } catch { /* ignore */ }

    const paramCity = searchParams.get("city");
    if (paramCity) {
      setSiteCity(paramCity);
      setLocationReady(true);
      return;
    }

    autoDetectLocation();
  }, [searchParams]);

  const autoDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setShowLocationBanner(true);
      setLocationReady(true);
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const detectedCity = addr.city || addr.town || addr.village || addr.county || "";
          const detectedState = addr.state || "";

          if (detectedCity) {
            setSiteCity(detectedCity);
            setSiteState(detectedState);
            localStorage.setItem(SITE_LOCATION_KEY, JSON.stringify({ city: detectedCity, state: detectedState }));
          } else {
            setShowLocationBanner(true);
          }
        } catch {
          setShowLocationBanner(true);
        }
        setDetectingLocation(false);
        setLocationReady(true);
      },
      () => {
        setDetectingLocation(false);
        setShowLocationBanner(true);
        setLocationReady(true);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);

  const fetchMachines = useCallback(async (userCity?: string, userState?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (city) params.set("city", city);
    if (search) params.set("search", search);

    const uc = userCity ?? siteCity;
    const us = userState ?? siteState;
    if (uc) params.set("userCity", uc);
    if (us) params.set("userState", us);

    try {
      const res = await fetch(`/api/machines?${params.toString()}`);
      const data = await res.json();
      setMachines(data.machines || []);
    } catch {
      setMachines([]);
    }
    setLoading(false);
  }, [type, city, search, siteCity, siteState]);

  useEffect(() => {
    if (locationReady) fetchMachines();
  }, [locationReady, fetchMachines]);

  const saveLocation = () => {
    localStorage.setItem(SITE_LOCATION_KEY, JSON.stringify({ city: siteCity, state: siteState }));
    setShowLocationBanner(false);
    setCity(siteCity);
    fetchMachines(siteCity, siteState);
  };

  const handleDetectClick = () => {
    autoDetectLocation();
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setShowFilters(false);
    fetchMachines();
  };

  const nearbyMachines = machines.filter((m) => siteCity && m.city.toLowerCase().includes(siteCity.toLowerCase()));
  const otherMachines = siteCity ? machines.filter((m) => !m.city.toLowerCase().includes(siteCity.toLowerCase())) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Browse Machinery</h1>
          <p className="text-sm text-slate-600">Find equipment for your project</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 active:bg-slate-50 flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          Filters
        </button>
      </div>

      {/* Detecting location indicator */}
      {detectingLocation && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 animate-pulse">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0"></div>
          <p className="text-sm text-blue-700 font-medium">Detecting your location...</p>
        </div>
      )}

      {/* Location Banner — shown when location is unknown */}
      {showLocationBanner && !detectingLocation && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 sm:p-5 mb-5 text-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base mb-1">Set Your Project Site</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-3">See nearby machines first and get accurate availability</p>

              <button
                onClick={handleDetectClick}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 active:from-amber-700 active:to-orange-700 transition-all text-sm mb-3 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Use My Current Location
              </button>

              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-slate-700"></div>
                <span className="text-xs text-slate-500">or enter manually</span>
                <div className="h-px flex-1 bg-slate-700"></div>
              </div>

              <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-3">
                <input
                  type="text"
                  placeholder="City (e.g. Mumbai)"
                  value={siteCity}
                  onChange={(e) => setSiteCity(e.target.value)}
                  className="w-full border border-slate-600 bg-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <select
                  value={siteState}
                  onChange={(e) => setSiteState(e.target.value)}
                  className="w-full border border-slate-600 bg-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={saveLocation}
                  className="w-full bg-white text-slate-900 px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-100 active:bg-slate-200 transition-colors text-sm"
                >
                  Set Location
                </button>
              </div>
            </div>
            <button onClick={() => setShowLocationBanner(false)} className="text-slate-500 hover:text-slate-300 text-lg p-1 shrink-0">×</button>
          </div>
        </div>
      )}

      {/* Current Location Indicator */}
      {siteCity && !showLocationBanner && !detectingLocation && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 py-1.5 rounded-full font-medium text-xs sm:text-sm truncate max-w-[250px] sm:max-w-none flex items-center gap-1.5 shadow-sm">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {siteCity}{siteState ? `, ${siteState}` : ""}
          </span>
          <button
            onClick={() => setShowLocationBanner(true)}
            className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm shrink-0"
          >
            Change
          </button>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleFilter} className={`bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8 ${showFilters ? "block" : "hidden sm:block"}`}>
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Equipment Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            >
              <option value="all">All Types</option>
              {MACHINE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Filter by City</label>
            <input
              type="text"
              placeholder="Any city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Search</label>
            <input
              type="text"
              placeholder="Brand, name, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-amber-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-amber-600 active:bg-amber-700 transition-colors text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-16 sm:py-20">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading machines...</p>
        </div>
      ) : machines.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-slate-200">
          <span className="text-5xl sm:text-6xl block mb-4">🔍</span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No Machines Found</h3>
          <p className="text-slate-600 mb-6 text-sm">Try adjusting your filters or search in a different area</p>
          <button onClick={() => { setType("all"); setCity(""); setSearch(""); setTimeout(() => fetchMachines(), 100); }} className="text-amber-600 font-semibold hover:underline text-sm">
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">{machines.length} machine{machines.length !== 1 ? "s" : ""} found</p>

          {siteCity && nearbyMachines.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Near Your Project Site
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">Machines in or near {siteCity}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {nearbyMachines.map((machine) => (
                  <MachineCard key={machine.id} machine={machine} />
                ))}
              </div>
            </div>
          )}

          {siteCity && otherMachines.length > 0 && nearbyMachines.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Other Available Machines</h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">Machines from other locations</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {(siteCity && nearbyMachines.length > 0 ? otherMachines : machines).map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MachineCard({ machine }: { machine: Machine }) {
  return (
    <Link
      href={`/machines/${machine.id}`}
      className="group bg-white rounded-xl overflow-hidden hover:shadow-xl active:shadow-md transition-all shadow-sm border border-slate-100 hover:border-amber-200"
    >
      <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
        <img
          src={machine.imageUrl !== "/machines/default.jpg" ? machine.imageUrl : MACHINE_IMAGES[machine.type] || MACHINE_IMAGES.jcb}
          alt={machine.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex gap-2">
          <span className="bg-white/95 backdrop-blur-sm text-[11px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-slate-700 shadow-sm">
            {getMachineTypeIcon(machine.type)} {getMachineTypeLabel(machine.type)}
          </span>
        </div>
        {machine.operatorIncluded && (
          <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-emerald-500 text-white text-[11px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm">
            ✓ Operator
          </span>
        )}
      </div>
      <div className="p-3.5 sm:p-4">
        <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-0.5 sm:mb-1 text-sm sm:text-base truncate">
          {machine.name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-2.5 sm:mb-3 truncate">
          {machine.brand} {machine.model} • {machine.year}
        </p>
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{formatCurrency(machine.dailyRate)}</span>
            <span className="text-xs sm:text-sm text-slate-400">/day</span>
          </div>
          {machine.avgRating > 0 && (
            <div className="flex items-center gap-1 text-xs sm:text-sm bg-amber-50 px-2 py-0.5 rounded-full">
              <span className="text-amber-500">★</span>
              <span className="font-semibold text-amber-700">{machine.avgRating.toFixed(1)}</span>
              <span className="text-amber-400">({machine.reviewCount})</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400">
          <span className="flex items-center gap-1 truncate">
            <span>📍</span>
            <span className="truncate">{machine.city}, {machine.state}</span>
          </span>
          {machine.owner.ownerAvgRating > 0 && (
            <span className="flex items-center gap-1 text-[11px] sm:text-xs bg-slate-50 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ml-2" title="Owner Rating">
              👤 {machine.owner.ownerAvgRating.toFixed(1)} ★
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function MachinesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div></div>}>
      <MachinesContent />
    </Suspense>
  );
}
