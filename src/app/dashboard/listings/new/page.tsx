"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MACHINE_TYPES, INDIAN_STATES, MACHINE_IMAGES } from "@/lib/constants";

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "jcb",
    brand: "",
    model: "",
    year: new Date().getFullYear().toString(),
    description: "",
    dailyRate: "",
    hourlyRate: "",
    minBookingDays: "1",
    city: "",
    state: "",
    pincode: "",
    operatorIncluded: true,
    fuelIncluded: false,
    capacity: "",
    specifications: "",
  });

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user || d.user.role !== "owner") router.push("/dashboard");
    }).catch(() => router.push("/login"));
  }, [router]);

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl: MACHINE_IMAGES[form.type] || MACHINE_IMAGES.jcb,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create listing");
        setLoading(false);
        return;
      }
      router.push("/dashboard/listings");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/listings" className="text-slate-400 hover:text-slate-600">← My Listings</Link>
        <h1 className="text-3xl font-bold text-slate-900">List New Machine</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Machine Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="e.g. JCB 3DX Backhoe Loader"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Equipment Type</label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            >
              {MACHINE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand</label>
            <input
              type="text"
              required
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="e.g. JCB, TATA, L&T"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Model</label>
            <input
              type="text"
              required
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="e.g. 3DX, NX200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year of Manufacture</label>
            <input
              type="number"
              required
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
              min="2000"
              max={new Date().getFullYear()}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
              placeholder="Describe the machine, its condition, and any special features..."
            />
          </div>
        </div>

        <hr className="border-slate-200" />

        <h3 className="text-lg font-bold text-slate-900">Pricing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Daily Rate (₹)</label>
            <input
              type="number"
              required
              value={form.dailyRate}
              onChange={(e) => update("dailyRate", e.target.value)}
              min="100"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="e.g. 8000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hourly Rate (₹) (optional)</label>
            <input
              type="number"
              value={form.hourlyRate}
              onChange={(e) => update("hourlyRate", e.target.value)}
              min="0"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="e.g. 1200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Min. Booking Days</label>
            <input
              type="number"
              value={form.minBookingDays}
              onChange={(e) => update("minBookingDays", e.target.value)}
              min="1"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        <hr className="border-slate-200" />

        <h3 className="text-lg font-bold text-slate-900">Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="e.g. Mumbai"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">State</label>
            <select
              required
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pincode</label>
            <input
              type="text"
              value={form.pincode}
              onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="e.g. 400001"
            />
          </div>
        </div>

        <hr className="border-slate-200" />

        <h3 className="text-lg font-bold text-slate-900">Included Services</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.operatorIncluded}
              onChange={(e) => update("operatorIncluded", e.target.checked)}
              className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm text-slate-700">Operator / Driver Included</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.fuelIncluded}
              onChange={(e) => update("fuelIncluded", e.target.checked)}
              className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm text-slate-700">Fuel Included</span>
          </label>
        </div>

        <hr className="border-slate-200" />

        <h3 className="text-lg font-bold text-slate-900">Specifications (Optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Capacity</label>
            <input
              type="text"
              value={form.capacity}
              onChange={(e) => update("capacity", e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="e.g. 20 Ton, 100 HP"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Other Specs</label>
            <input
              type="text"
              value={form.specifications}
              onChange={(e) => update("specifications", e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="e.g. Boom length 30m, bucket size 1.5 cu.m"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating Listing..." : "List Machine for Rent"}
          </button>
        </div>
      </form>
    </div>
  );
}
