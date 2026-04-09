"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { MACHINE_TYPES, formatCurrency, getMachineTypeLabel, getMachineTypeIcon, MACHINE_IMAGES } from "@/lib/constants";

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
  owner: { name: string; city: string };
}

function MachinesContent() {
  const searchParams = useSearchParams();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const fetchMachines = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (city) params.set("city", city);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/machines?${params.toString()}`);
      const data = await res.json();
      setMachines(data.machines || []);
    } catch {
      setMachines([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMachines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMachines();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Heavy Machinery</h1>
        <p className="text-slate-600">Find the right equipment for your project</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Equipment Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            >
              <option value="all">All Types</option>
              {MACHINE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">City</label>
            <input
              type="text"
              placeholder="Any city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Search</label>
            <input
              type="text"
              placeholder="Brand, name, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading machines...</p>
        </div>
      ) : machines.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <span className="text-6xl block mb-4">🔍</span>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Machines Found</h3>
          <p className="text-slate-600 mb-6">Try adjusting your filters or search in a different area</p>
          <button onClick={() => { setType("all"); setCity(""); setSearch(""); setTimeout(fetchMachines, 100); }} className="text-amber-600 font-semibold hover:underline">
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{machines.length} machine{machines.length !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <Link
                key={machine.id}
                href={`/machines/${machine.id}`}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:border-amber-200"
              >
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                  <img
                    src={machine.imageUrl !== "/machines/default.jpg" ? machine.imageUrl : MACHINE_IMAGES[machine.type] || MACHINE_IMAGES.jcb}
                    alt={machine.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-slate-700">
                      {getMachineTypeIcon(machine.type)} {getMachineTypeLabel(machine.type)}
                    </span>
                  </div>
                  {machine.operatorIncluded && (
                    <span className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      Operator Included
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-1">
                    {machine.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">
                    {machine.brand} {machine.model} • {machine.year}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xl font-bold text-amber-600">{formatCurrency(machine.dailyRate)}</span>
                      <span className="text-sm text-slate-500">/day</span>
                    </div>
                    {machine.avgRating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-amber-500">★</span>
                        <span className="font-semibold">{machine.avgRating.toFixed(1)}</span>
                        <span className="text-slate-400">({machine.reviewCount})</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>📍</span>
                    <span>{machine.city}, {machine.state}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MachinesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div></div>}>
      <MachinesContent />
    </Suspense>
  );
}
