"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency, getMachineTypeLabel, getMachineTypeIcon, MACHINE_IMAGES } from "@/lib/constants";

interface Machine {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  dailyRate: number;
  city: string;
  state: string;
  imageUrl: string;
  available: boolean;
  verified: boolean;
  avgRating: number;
  reviewCount: number;
}

export default function ListingsPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();
        if (!userData.user || userData.user.role !== "owner") { router.push("/dashboard"); return; }

        const machinesRes = await fetch("/api/machines/owner", { method: "GET" });
        if (machinesRes.ok) {
          const data = await machinesRes.json();
          setMachines(data.machines || []);
        } else {
          const allRes = await fetch("/api/machines");
          const allData = await allRes.json();
          setMachines((allData.machines || []).filter((m: Machine & { owner: { id: string } }) => m.owner?.id === userData.user.id));
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const toggleAvailability = async (machineId: string, available: boolean) => {
    try {
      await fetch(`/api/machines/${machineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      });
      setMachines((prev) => prev.map((m) => m.id === machineId ? { ...m, available } : m));
    } catch { /* ignore */ }
  };

  const deleteMachine = async (machineId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await fetch(`/api/machines/${machineId}`, { method: "DELETE" });
      setMachines((prev) => prev.filter((m) => m.id !== machineId));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="bg-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-600 transition-colors text-sm"
        >
          + Add Machine
        </Link>
      </div>

      {machines.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <span className="text-6xl block mb-4">🏗️</span>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Machines Listed</h3>
          <p className="text-slate-600 mb-6">Start earning by listing your heavy equipment</p>
          <Link href="/dashboard/listings/new" className="bg-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-600 text-sm">
            List Your First Machine
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <div key={machine.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="aspect-[16/10] bg-slate-100 relative">
                <img
                  src={machine.imageUrl !== "/machines/default.jpg" ? machine.imageUrl : MACHINE_IMAGES[machine.type] || MACHINE_IMAGES.jcb}
                  alt={machine.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${machine.available ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                    {machine.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{machine.name}</h3>
                    <p className="text-xs text-slate-500">
                      {getMachineTypeIcon(machine.type)} {getMachineTypeLabel(machine.type)} • {machine.brand} {machine.model}
                    </p>
                  </div>
                  <p className="font-bold text-amber-600 text-lg">{formatCurrency(machine.dailyRate)}<span className="text-xs text-slate-400">/day</span></p>
                </div>
                <p className="text-sm text-slate-500 mb-3">📍 {machine.city}, {machine.state}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAvailability(machine.id, !machine.available)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${machine.available ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                  >
                    {machine.available ? "Pause Listing" : "Make Available"}
                  </button>
                  <Link
                    href={`/machines/${machine.id}`}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 text-center"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => deleteMachine(machine.id)}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
