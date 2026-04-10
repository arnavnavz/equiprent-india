"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency, getMachineTypeLabel, getMachineTypeIcon, MACHINE_IMAGES } from "@/lib/constants";

interface Machine {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  description: string;
  dailyRate: number;
  hourlyRate: number;
  city: string;
  state: string;
  imageUrl: string;
  operatorIncluded: boolean;
  fuelIncluded: boolean;
  capacity: string;
  specifications: string;
  minBookingDays: number;
  avgRating: number;
  reviewCount: number;
  owner: {
    id: string;
    name: string;
    phone: string;
    city: string;
    state: string;
    ownerAvgRating: number;
    ownerReviewCount: number;
  };
  reviews: { id: string; rating: number; ownerRating: number; comment: string; createdAt: string; user: { name: string } }[];
  bookings: { startDate: string; endDate: string }[];
}

interface User {
  id: string;
  name: string;
  role: string;
}

export default function MachineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machineRes, userRes] = await Promise.all([
          fetch(`/api/machines/${params.id}`),
          fetch("/api/auth/me"),
        ]);
        const machineData = await machineRes.json();
        const userData = await userRes.json();
        if (machineData.machine) setMachine(machineData.machine);
        if (userData.user) setUser(userData.user);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const totalDays = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const totalAmount = machine ? totalDays * machine.dailyRate : 0;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    setBookingError("");
    setBookingLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: machine!.id,
          startDate,
          endDate,
          projectName,
          projectAddress,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.error || "Booking failed");
      } else {
        setBookingSuccess(true);
      }
    } catch {
      setBookingError("Something went wrong");
    }
    setBookingLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-amber-500 mx-auto"></div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl sm:text-6xl block mb-4">🚫</span>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Machine Not Found</h2>
        <Link href="/machines" className="text-amber-600 font-semibold hover:underline">Browse all machines</Link>
      </div>
    );
  }

  const imageUrl = machine.imageUrl !== "/machines/default.jpg" ? machine.imageUrl : MACHINE_IMAGES[machine.type] || MACHINE_IMAGES.jcb;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <Link href="/machines" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4 sm:mb-6">
        ← Back to Machines
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 aspect-[16/10] sm:aspect-[16/9]">
            <img src={imageUrl} alt={machine.name} className="w-full h-full object-cover" />
          </div>

          <div>
            {/* Title + Price - stacked on mobile */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full mb-2">
                {getMachineTypeIcon(machine.type)} {getMachineTypeLabel(machine.type)}
              </span>
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900">{machine.name}</h1>
              <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">{machine.brand} {machine.model} • {machine.year}</p>
              <div className="flex items-baseline gap-2 mt-2 sm:mt-0 sm:hidden">
                <span className="text-2xl font-bold text-amber-600">{formatCurrency(machine.dailyRate)}</span>
                <span className="text-sm text-slate-500">per day</span>
              </div>
            </div>

            {/* Desktop price (hidden on mobile, shown above instead) */}
            <div className="hidden sm:flex items-start justify-between gap-4 mb-4 -mt-[4.5rem]">
              <div />
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-amber-600">{formatCurrency(machine.dailyRate)}</div>
                <div className="text-sm text-slate-500">per day</div>
                {machine.hourlyRate > 0 && (
                  <div className="text-sm text-slate-400">{formatCurrency(machine.hourlyRate)}/hr</div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-5 sm:mb-6">
              {machine.operatorIncluded && (
                <span className="bg-green-50 text-green-700 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg">✅ Operator Included</span>
              )}
              {machine.fuelIncluded && (
                <span className="bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg">⛽ Fuel Included</span>
              )}
              <span className="bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                📍 {machine.city}, {machine.state}
              </span>
              {machine.avgRating > 0 && (
                <span className="bg-amber-50 text-amber-700 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                  ★ {machine.avgRating.toFixed(1)} ({machine.reviewCount})
                </span>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="font-bold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">{machine.description}</p>
            </div>

            {(machine.capacity || machine.specifications) && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="font-bold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Specifications</h3>
                {machine.capacity && (
                  <p className="text-slate-600 mb-2 text-sm"><span className="font-medium">Capacity:</span> {machine.capacity}</p>
                )}
                {machine.specifications && (
                  <p className="text-slate-600 whitespace-pre-line text-sm">{machine.specifications}</p>
                )}
              </div>
            )}

            {/* Owner Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="font-bold text-slate-900 mb-3 text-sm sm:text-base">Machine Owner</h3>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
                  {machine.owner.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-base sm:text-lg truncate">{machine.owner.name}</p>
                  <p className="text-xs sm:text-sm text-slate-500">{machine.owner.city}, {machine.owner.state}</p>
                </div>
                {machine.owner.ownerAvgRating > 0 && (
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500 text-base sm:text-lg">★</span>
                      <span className="text-lg sm:text-xl font-bold text-slate-900">{machine.owner.ownerAvgRating.toFixed(1)}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500">{machine.owner.ownerReviewCount} review{machine.owner.ownerReviewCount !== 1 ? "s" : ""}</p>
                  </div>
                )}
              </div>
              {machine.owner.ownerAvgRating > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${(machine.owner.ownerAvgRating / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{machine.owner.ownerAvgRating.toFixed(1)} / 5.0</span>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            {machine.reviews.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                <h3 className="font-bold text-slate-900 mb-3 sm:mb-4 text-sm sm:text-base">Reviews ({machine.reviewCount})</h3>
                <div className="space-y-4">
                  {machine.reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold text-slate-600 shrink-0">
                          {review.user.name[0]}
                        </div>
                        <span className="font-semibold text-xs sm:text-sm">{review.user.name}</span>
                        <span className="text-[11px] sm:text-xs text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-1 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                          Machine: <span className="text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                        </span>
                        {review.ownerRating > 0 && (
                          <span className="flex items-center gap-1">
                            Owner: <span className="text-amber-500">{"★".repeat(review.ownerRating)}{"☆".repeat(5 - review.ownerRating)}</span>
                          </span>
                        )}
                      </div>
                      {review.comment && <p className="text-xs sm:text-sm text-slate-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar / Bottom Sheet on Mobile */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            {bookingSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                <span className="text-4xl sm:text-5xl block mb-3 sm:mb-4">✅</span>
                <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">Booking Requested!</h3>
                <p className="text-green-700 text-sm mb-4 sm:mb-6">
                  The owner will review and confirm your booking.
                </p>
                <Link href="/dashboard/bookings" className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 text-sm inline-block">
                  View My Bookings
                </Link>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Book This Machine</h3>

                {bookingError && (
                  <div className="bg-red-50 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm">{bookingError}</div>
                )}

                {user?.id === machine.owner.id ? (
                  <div className="bg-slate-50 text-slate-600 px-4 py-3 rounded-lg text-sm">
                    This is your own machine listing.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full border border-slate-300 rounded-lg px-2.5 sm:px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">End Date</label>
                        <input
                          type="date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || new Date().toISOString().split("T")[0]}
                          className="w-full border border-slate-300 rounded-lg px-2.5 sm:px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="e.g. Highway Construction Phase 2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Project Site Address</label>
                      <input
                        type="text"
                        value={projectAddress}
                        onChange={(e) => setProjectAddress(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="Full address of the work site"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                        placeholder="Any special requirements..."
                      />
                    </div>

                    {totalDays > 0 && (
                      <div className="bg-amber-50 rounded-xl p-3 sm:p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">{formatCurrency(machine.dailyRate)} × {totalDays} day{totalDays !== 1 ? "s" : ""}</span>
                          <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="border-t border-amber-200 pt-2 flex justify-between">
                          <span className="font-bold text-slate-900">Total</span>
                          <span className="font-bold text-amber-600 text-lg">{formatCurrency(totalAmount)}</span>
                        </div>
                      </div>
                    )}

                    {!user ? (
                      <Link
                        href="/login"
                        className="block w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 active:bg-amber-700 transition-colors text-sm text-center"
                      >
                        Sign In to Book
                      </Link>
                    ) : (
                      <button
                        type="submit"
                        disabled={bookingLoading || !startDate || !endDate}
                        className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 active:bg-amber-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {bookingLoading ? "Booking..." : "Request Booking"}
                      </button>
                    )}

                    <p className="text-[11px] sm:text-xs text-slate-400 text-center">
                      Min. booking: {machine.minBookingDays} day{machine.minBookingDays !== 1 ? "s" : ""}. Owner confirmation required.
                    </p>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
