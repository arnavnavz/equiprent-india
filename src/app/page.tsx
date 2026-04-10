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
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-800 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-amber-400 text-xs sm:text-sm font-medium mb-5 sm:mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
              India&apos;s #1 Heavy Machinery Rental Platform
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-4 sm:mb-6 tracking-tight">
              Rent Heavy Equipment
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">With Operators</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 mb-8 sm:mb-10 max-w-xl leading-relaxed">
              Book JCBs, Cranes, Tractors, Trucks and more — with trained operators included. Secure payments, insurance covered.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/20 max-w-4xl border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-1.5">Equipment Type</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-slate-50"
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
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-1.5">Project Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Delhi"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-slate-50"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 active:from-amber-700 active:to-orange-700 transition-all text-sm shadow-lg shadow-amber-500/25"
                >
                  Search Machines →
                </button>
              </div>
            </div>
          </form>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-8 mt-8 sm:mt-12 text-xs sm:text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Verified Operators</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Insurance Covered</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Secure Payments</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 100+ Cities</span>
          </div>
        </div>
      </section>

      {/* Machine Categories */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">Browse by Equipment Type</h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
              From earthmoving to material handling — find the right machine
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {MACHINE_TYPES.map((type) => (
              <Link
                key={type.value}
                href={`/machines?type=${type.value}`}
                className="group bg-white rounded-xl p-4 sm:p-6 text-center hover:shadow-xl active:scale-[0.98] transition-all border border-slate-100 hover:border-amber-300 shadow-sm"
              >
                <span className="text-3xl sm:text-4xl block mb-2 sm:mb-3 group-hover:scale-110 transition-transform">{type.icon}</span>
                <h3 className="font-semibold text-slate-900 group-hover:text-amber-700 text-xs sm:text-sm leading-tight">
                  {type.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Protection */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-emerald-50 to-teal-50 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full mb-3">
              🛡️ EquipRent Protection
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">Why Book Through EquipRent?</h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
              Every booking includes our comprehensive protection package
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: "💰", title: "Secure Payments", desc: "Money held safely until the job starts. Full refund if owner cancels." },
              { icon: "🔧", title: "Equipment Coverage", desc: "Damage protection included. No surprise costs for normal wear." },
              { icon: "📋", title: "Digital Contracts", desc: "Auto-generated rental agreements protect both parties legally." },
              { icon: "⚖️", title: "Dispute Resolution", desc: "Dedicated team to mediate any issues between owners and renters." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-emerald-100">
                <span className="text-2xl sm:text-3xl block mb-3">{item.icon}</span>
                <h3 className="font-bold text-slate-900 mb-1.5 text-sm sm:text-base">{item.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">How It Works</h2>
            <p className="text-slate-500 text-sm sm:text-base">Get started in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                step: "01",
                title: "Search & Select",
                desc: "Browse equipment by type, location, and budget. View ratings, specs, and availability.",
                icon: "🔍",
                color: "from-amber-500 to-orange-500",
              },
              {
                step: "02",
                title: "Book & Confirm",
                desc: "Choose your dates, provide project details. Owner confirms your booking within 24 hours.",
                icon: "📅",
                color: "from-blue-500 to-indigo-500",
              },
              {
                step: "03",
                title: "Machine Arrives",
                desc: "The operator arrives at your site with the machine, ready to work. Rate after completion.",
                icon: "🚛",
                color: "from-emerald-500 to-teal-500",
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-lg sm:text-xl font-bold mb-4 shadow-lg`}>
                  {item.icon}
                </div>
                <span className="text-5xl sm:text-6xl font-extrabold text-slate-50 absolute top-3 sm:top-4 right-4 sm:right-6">{item.step}</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full mb-4">
                For Equipment Owners
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 leading-tight">Turn Idle Machinery<br />Into Revenue</h2>
              <p className="text-slate-400 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                List your equipment on EquipRent. Reach thousands of verified contractors. Set your own rates and keep 100% of your listed price.
              </p>
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 text-sm sm:text-base">
                {[
                  "Zero listing fees — we only charge renters",
                  "You control pricing and availability",
                  "Operator stays with the machine",
                  "Verified contractors only",
                  "Payment guaranteed within 48 hours",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-amber-400 mt-0.5">✓</span>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register?role=owner"
                className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 sm:px-8 py-3 rounded-lg font-bold hover:from-amber-600 hover:to-orange-600 active:from-amber-700 active:to-orange-700 transition-all text-sm sm:text-base shadow-lg shadow-amber-500/25"
              >
                List Your Equipment →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { value: "5,000+", label: "Machines Listed", icon: "🏗️" },
                { value: "₹2Cr+", label: "Monthly Payouts", icon: "💰" },
                { value: "100+", label: "Cities Covered", icon: "🗺️" },
                { value: "50,000+", label: "Bookings Done", icon: "📋" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center border border-white/10">
                  <span className="text-2xl block mb-2">{stat.icon}</span>
                  <div className="text-xl sm:text-2xl font-bold mb-0.5">{stat.value}</div>
                  <div className="text-slate-400 text-xs sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-slate-500 text-base sm:text-lg mb-6 sm:mb-8">
            Whether you need machinery or own equipment — EquipRent connects you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/machines"
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 active:from-amber-700 active:to-orange-700 transition-all shadow-lg shadow-amber-500/20 text-sm sm:text-base"
            >
              Find Equipment
            </Link>
            <Link
              href="/register?role=owner"
              className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 active:bg-slate-700 transition-colors text-sm sm:text-base"
            >
              List Your Machines
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
