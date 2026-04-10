"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MACHINE_TYPES } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const [searchCity, setSearchCity] = useState("");
  const [searchType, setSearchType] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity) {
      try { localStorage.setItem("equiprent_site_location", JSON.stringify({ city: searchCity, state: "" })); } catch { /* ignore */ }
    }
    const params = new URLSearchParams();
    if (searchType !== "all") params.set("type", searchType);
    if (searchCity) params.set("city", searchCity);
    router.push(`/machines?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 hidden sm:block">
          <div className="absolute top-20 left-10 text-[200px] leading-none">🏗️</div>
          <div className="absolute bottom-10 right-10 text-[150px] leading-none">🚜</div>
          <div className="absolute top-40 right-1/3 text-[100px] leading-none">🚛</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-amber-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              India&apos;s #1 Machinery Rental Platform
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 sm:mb-6">
              Rent Heavy Equipment
              <br />
              <span className="text-amber-400">With Operators</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 mb-6 sm:mb-10 max-w-2xl">
              Book JCBs, Cranes, Tractors, Trucks and more — with trained operators included.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-1.5">Equipment Type</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                >
                  <option value="all">All Equipment</option>
                  {MACHINE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-1.5">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Delhi"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-600 active:bg-amber-700 transition-colors text-sm"
                >
                  Search Machines →
                </button>
              </div>
            </div>
          </form>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6 mt-6 sm:mt-10 text-xs sm:text-sm text-slate-400">
            <span className="flex items-center gap-1.5">✅ Verified Operators</span>
            <span className="flex items-center gap-1.5">🛡️ Insurance Covered</span>
            <span className="flex items-center gap-1.5">📞 24/7 Support</span>
            <span className="flex items-center gap-1.5">🇮🇳 100+ Cities</span>
          </div>
        </div>
      </section>

      {/* Machine Categories */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">Browse by Equipment Type</h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              From earthmoving to material handling — find the right machine
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {MACHINE_TYPES.map((type) => (
              <Link
                key={type.value}
                href={`/machines?type=${type.value}`}
                className="group bg-slate-50 rounded-xl p-4 sm:p-6 text-center hover:bg-amber-50 hover:shadow-lg active:scale-[0.98] transition-all border border-slate-100 hover:border-amber-200"
              >
                <span className="text-3xl sm:text-4xl block mb-2 sm:mb-3">{type.icon}</span>
                <h3 className="font-semibold text-slate-900 group-hover:text-amber-700 text-xs sm:text-base leading-tight">
                  {type.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">How It Works</h2>
            <p className="text-slate-600 text-sm sm:text-base">Get started in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                step: "01",
                title: "Search & Select",
                desc: "Browse equipment by type, location, and budget. View ratings, specs, and availability.",
                icon: "🔍",
              },
              {
                step: "02",
                title: "Book & Confirm",
                desc: "Choose your dates, provide project details, and the owner confirms your booking.",
                icon: "📅",
              },
              {
                step: "03",
                title: "Machine Arrives",
                desc: "The operator arrives at your site with the machine, ready to work.",
                icon: "🚛",
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <span className="text-5xl sm:text-6xl font-extrabold text-slate-100 absolute top-3 sm:top-4 right-4 sm:right-6">{item.step}</span>
                <span className="text-2xl sm:text-3xl mb-3 sm:mb-4 block">{item.icon}</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">Own Heavy Machinery?<br />Start Earning Today</h2>
              <p className="text-amber-100 text-base sm:text-lg mb-6 sm:mb-8">
                List your equipment on EquipRent. Reach thousands of contractors. Set your own rates.
              </p>
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 text-sm sm:text-base">
                {[
                  "Zero listing fees — only pay when you earn",
                  "You control pricing and availability",
                  "Operator stays with the machine",
                  "Verified contractors and secure payments",
                  "Insurance coverage for every booking",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-amber-200">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register?role=owner"
                className="inline-flex items-center bg-white text-amber-600 px-6 sm:px-8 py-3 rounded-lg font-bold hover:bg-amber-50 active:bg-amber-100 transition-colors text-sm sm:text-base"
              >
                List Your Equipment →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { value: "5,000+", label: "Machines Listed" },
                { value: "₹2Cr+", label: "Monthly Payouts" },
                { value: "100+", label: "Cities Covered" },
                { value: "50,000+", label: "Bookings Done" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-amber-200 text-xs sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mb-6 sm:mb-8">
            Whether you need machinery or own equipment — EquipRent is the platform for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/machines"
              className="bg-amber-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-600 active:bg-amber-700 transition-colors"
            >
              Find Equipment
            </Link>
            <Link
              href="/register?role=owner"
              className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 active:bg-slate-700 transition-colors"
            >
              List Your Machines
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
