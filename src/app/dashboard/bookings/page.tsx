"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency, getMachineTypeIcon } from "@/lib/constants";

interface Booking {
  id: string;
  status: string;
  totalAmount: number;
  totalDays: number;
  startDate: string;
  endDate: string;
  projectName: string;
  projectAddress: string;
  notes: string;
  createdAt: string;
  machine: { id: string; name: string; type: string; imageUrl: string; city?: string; state?: string; owner?: { name: string; phone: string } };
  renter?: { name: string; phone: string; email: string };
  review?: { id: string; rating: number; ownerRating: number; comment: string } | null;
}

interface User {
  id: string;
  name: string;
  role: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-slate-100 text-slate-800",
  cancelled: "bg-red-100 text-red-800",
};

function StarSelector({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition-colors ${star <= value ? "text-amber-500" : "text-slate-300"} hover:text-amber-400`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [machineRating, setMachineRating] = useState(0);
  const [ownerRating, setOwnerRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [userRes, bookingsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/bookings"),
      ]);
      const userData = await userRes.json();
      const bookingsData = await bookingsRes.json();
      if (!userData.user) { router.push("/login"); return; }
      setUser(userData.user);
      setBookings(bookingsData.bookings || []);
    } catch { router.push("/login"); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [router]);

  const updateBooking = async (bookingId: string, status: string) => {
    setActionLoading(bookingId);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchData();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const submitReview = async (bookingId: string) => {
    if (machineRating === 0 || ownerRating === 0) {
      setReviewError("Please rate both the machine and the owner");
      return;
    }
    setReviewLoading(true);
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          rating: machineRating,
          ownerRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || "Failed to submit review");
      } else {
        setReviewingBookingId(null);
        setMachineRating(0);
        setOwnerRating(0);
        setReviewComment("");
        await fetchData();
      }
    } catch {
      setReviewError("Something went wrong");
    }
    setReviewLoading(false);
  };

  const openReviewForm = (bookingId: string) => {
    setReviewingBookingId(bookingId);
    setMachineRating(0);
    setOwnerRating(0);
    setReviewComment("");
    setReviewError("");
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-600">← Dashboard</Link>
        <h1 className="text-3xl font-bold text-slate-900">
          {user.role === "owner" ? "Booking Requests" : "My Bookings"}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "pending", "confirmed", "active", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === s ? "bg-amber-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s}
            {s !== "all" && ` (${bookings.filter((b) => b.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <span className="text-6xl block mb-4">📋</span>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Bookings Yet</h3>
          <p className="text-slate-600 mb-6">
            {user.role === "owner" ? "Bookings will appear here when renters request your machines." : "Start by browsing available machines."}
          </p>
          {user.role !== "owner" && (
            <Link href="/machines" className="bg-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-600 text-sm">
              Browse Machines
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{getMachineTypeIcon(booking.machine.type)}</span>
                    <Link href={`/machines/${booking.machine.id}`} className="font-bold text-slate-900 hover:text-amber-600">
                      {booking.machine.name}
                    </Link>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                    <p>📅 {new Date(booking.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} — {new Date(booking.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <p>⏱️ {booking.totalDays} day{booking.totalDays !== 1 ? "s" : ""}</p>
                    {booking.projectName && <p>🏗️ {booking.projectName}</p>}
                    {booking.projectAddress && <p>📍 {booking.projectAddress}</p>}
                  </div>

                  {user.role === "owner" && booking.renter && (
                    <div className="bg-slate-50 rounded-lg p-3 text-sm">
                      <p className="font-medium text-slate-900">Renter: {booking.renter.name}</p>
                      <p className="text-slate-600">📞 {booking.renter.phone} • ✉️ {booking.renter.email}</p>
                    </div>
                  )}

                  {user.role === "renter" && booking.machine.owner && (
                    <div className="bg-slate-50 rounded-lg p-3 text-sm">
                      <p className="font-medium text-slate-900">Owner: {booking.machine.owner.name}</p>
                      <p className="text-slate-600">📞 {booking.machine.owner.phone}</p>
                    </div>
                  )}

                  {booking.notes && (
                    <p className="text-sm text-slate-500 mt-2 italic">&quot;{booking.notes}&quot;</p>
                  )}

                  {/* Review display */}
                  {booking.review && (
                    <div className="mt-3 bg-amber-50 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-amber-800 mb-1">Your Review</p>
                      <div className="flex items-center gap-4">
                        <span>Machine: <span className="text-amber-500">{"★".repeat(booking.review.rating)}{"☆".repeat(5 - booking.review.rating)}</span></span>
                        <span>Owner: <span className="text-amber-500">{"★".repeat(booking.review.ownerRating)}{"☆".repeat(5 - booking.review.ownerRating)}</span></span>
                      </div>
                      {booking.review.comment && <p className="text-slate-600 mt-1">{booking.review.comment}</p>}
                    </div>
                  )}

                  {/* Review form */}
                  {booking.status === "completed" && !booking.review && user.role === "renter" && reviewingBookingId === booking.id && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-slate-900">Rate Your Experience</h4>
                      {reviewError && (
                        <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{reviewError}</div>
                      )}
                      <StarSelector value={machineRating} onChange={setMachineRating} label="Machine Quality" />
                      <StarSelector value={ownerRating} onChange={setOwnerRating} label="Owner Service" />
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Comment (optional)</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={2}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                          placeholder="How was your experience?"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitReview(booking.id)}
                          disabled={reviewLoading}
                          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
                        >
                          {reviewLoading ? "Submitting..." : "Submit Review"}
                        </button>
                        <button
                          onClick={() => setReviewingBookingId(null)}
                          className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-amber-600">{formatCurrency(booking.totalAmount)}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Booked {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                  </p>

                  <div className="flex flex-col gap-2 mt-3">
                    {user.role === "owner" && booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateBooking(booking.id, "confirmed")}
                          disabled={actionLoading === booking.id}
                          className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateBooking(booking.id, "cancelled")}
                          disabled={actionLoading === booking.id}
                          className="bg-red-100 text-red-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-200 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {user.role === "owner" && booking.status === "confirmed" && (
                      <button
                        onClick={() => updateBooking(booking.id, "active")}
                        disabled={actionLoading === booking.id}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                      >
                        Mark Active
                      </button>
                    )}
                    {user.role === "owner" && booking.status === "active" && (
                      <button
                        onClick={() => updateBooking(booking.id, "completed")}
                        disabled={actionLoading === booking.id}
                        className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-900 disabled:opacity-50"
                      >
                        Mark Completed
                      </button>
                    )}
                    {booking.status === "pending" && user.role === "renter" && (
                      <button
                        onClick={() => updateBooking(booking.id, "cancelled")}
                        disabled={actionLoading === booking.id}
                        className="bg-red-100 text-red-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-200 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    {booking.status === "completed" && !booking.review && user.role === "renter" && reviewingBookingId !== booking.id && (
                      <button
                        onClick={() => openReviewForm(booking.id)}
                        className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-amber-200"
                      >
                        ★ Write Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
