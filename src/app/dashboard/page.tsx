"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/constants";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  state: string;
}

interface Booking {
  id: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  machine: { id: string; name: string; type: string };
  renter?: { name: string; phone: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter((b) => ["confirmed", "active"].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Welcome back, {user.name} — <span className="capitalize font-medium">{user.role}</span> account
          </p>
        </div>
        {user.role === "owner" && (
          <Link
            href="/dashboard/listings/new"
            className="bg-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-600 transition-colors text-sm inline-flex items-center gap-2"
          >
            + List New Machine
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{pendingBookings.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeBookings.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-slate-900">{completedBookings.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">{user.role === "owner" ? "Total Earned" : "Total Spent"}</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalEarnings)}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/bookings" className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-amber-200 transition-all group">
          <span className="text-3xl block mb-3">📋</span>
          <h3 className="font-bold text-slate-900 group-hover:text-amber-600 mb-1">
            {user.role === "owner" ? "Manage Bookings" : "My Bookings"}
          </h3>
          <p className="text-sm text-slate-500">View and manage all your bookings</p>
        </Link>

        {user.role === "owner" ? (
          <>
            <Link href="/dashboard/listings" className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-amber-200 transition-all group">
              <span className="text-3xl block mb-3">🏗️</span>
              <h3 className="font-bold text-slate-900 group-hover:text-amber-600 mb-1">My Listings</h3>
              <p className="text-sm text-slate-500">Manage your machine listings</p>
            </Link>
            <Link href="/dashboard/listings/new" className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-amber-200 transition-all group">
              <span className="text-3xl block mb-3">➕</span>
              <h3 className="font-bold text-slate-900 group-hover:text-amber-600 mb-1">Add Machine</h3>
              <p className="text-sm text-slate-500">List a new machine for rent</p>
            </Link>
          </>
        ) : (
          <Link href="/machines" className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-amber-200 transition-all group">
            <span className="text-3xl block mb-3">🔍</span>
            <h3 className="font-bold text-slate-900 group-hover:text-amber-600 mb-1">Find Machines</h3>
            <p className="text-sm text-slate-500">Browse available equipment</p>
          </Link>
        )}
      </div>

      {/* Recent Bookings */}
      {pendingBookings.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">
            {user.role === "owner" ? "Pending Approval" : "Awaiting Confirmation"}
          </h2>
          <div className="space-y-3">
            {pendingBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">{booking.machine.name}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(booking.startDate).toLocaleDateString("en-IN")} — {new Date(booking.endDate).toLocaleDateString("en-IN")}
                    {" "}• {booking.totalDays} days
                  </p>
                  {booking.renter && (
                    <p className="text-sm text-slate-500">By: {booking.renter.name} • {booking.renter.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-600">{formatCurrency(booking.totalAmount)}</p>
                  <Link href="/dashboard/bookings" className="text-xs text-amber-600 hover:underline">
                    {user.role === "owner" ? "Review →" : "Details →"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
