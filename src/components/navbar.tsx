"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type User = { id: string; name: string; email: string; role: string } | null;

export function Navbar() {
  const [user, setUser] = useState<User>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-amber-600">
            <span className="text-xl sm:text-2xl">🏗️</span>
            <span>EquipRent</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/machines"
              className={`text-sm font-medium transition-colors ${
                pathname === "/machines" ? "text-amber-600" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Browse Machines
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith("/dashboard") ? "text-amber-600" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Dashboard
                </Link>
                {user.role === "owner" && (
                  <Link
                    href="/dashboard/listings/new"
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
                  >
                    + List Machine
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                  >
                    <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {user.name[0]}
                    </span>
                    <span className="font-medium">{user.name}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                        <p className="text-sm font-medium truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                        Dashboard
                      </Link>
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 -mr-2 text-slate-600 active:bg-slate-100 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-white z-50 overflow-y-auto">
          <div className="px-4 py-6 space-y-1">
            {user && (
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <span className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-lg">
                  {user.name[0]}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role} account</p>
                </div>
              </div>
            )}

            <Link
              href="/machines"
              className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-medium text-slate-700 active:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-lg">🔍</span>
              Browse Machines
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-medium text-slate-700 active:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">📊</span>
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/bookings"
                  className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-medium text-slate-700 active:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">📋</span>
                  {user.role === "owner" ? "Booking Requests" : "My Bookings"}
                </Link>
                {user.role === "owner" && (
                  <>
                    <Link
                      href="/dashboard/listings"
                      className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-medium text-slate-700 active:bg-slate-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="text-lg">🏗️</span>
                      My Listings
                    </Link>
                    <Link
                      href="/dashboard/listings/new"
                      className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-medium text-amber-600 active:bg-amber-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="text-lg">➕</span>
                      List New Machine
                    </Link>
                  </>
                )}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-3.5 rounded-xl text-base font-medium text-red-600 active:bg-red-50"
                  >
                    <span className="text-lg">🚪</span>
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-3 rounded-xl text-base font-semibold text-slate-700 border border-slate-200 active:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center px-4 py-3 rounded-xl text-base font-semibold text-white bg-amber-500 active:bg-amber-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
